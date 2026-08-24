const { pool } = require("../config/database");

const medicineRepository = {
  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO medicines (
        donor_id, medicine_name, dosage, batch_number, expiry_date,
        batch_number_verified, quantity, image_url, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        data.donorId,
        data.medicineName || null,
        data.dosage || null,
        data.batchNumber || null,
        data.expiryDate || null,
        data.batchNumberVerified !== false,
        data.quantity || 1,
        data.imageUrl,
        data.status || "pending_ocr",
      ]
    );
    return rows[0];
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    if (!keys.length) return this.findById(id);

    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
    const values = keys.map((k) => fields[k]);

    const { rows } = await pool.query(
      `UPDATE medicines SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await pool.query(`SELECT * FROM medicines WHERE id = $1`, [
      id,
    ]);
    return rows[0] || null;
  },

  async findApproved({ limit = 50, offset = 0 }) {
    const { rows } = await pool.query(
      `SELECT m.*, u.full_name AS donor_name
       FROM medicines m
       JOIN users u ON u.id = m.donor_id
       WHERE m.status = 'approved'
       ORDER BY m.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  },

  async findAvailableInventory({ limit = 200 } = {}) {
    const { rows } = await pool.query(
      `SELECT m.*, u.full_name AS donor_name,
              GREATEST(
                m.quantity - COALESCE((
                  SELECT SUM(dr.requested_quantity)
                  FROM donation_requests dr
                  WHERE dr.medicine_id = m.id
                    AND dr.status NOT IN ('rejected', 'completed')
                ), 0),
                0
              )::int AS available_quantity
       FROM medicines m
       JOIN users u ON u.id = m.donor_id
       WHERE m.status = 'approved'
         AND (m.expiry_date IS NULL OR m.expiry_date >= CURRENT_DATE)
         AND m.quantity > 0
       ORDER BY m.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return rows.filter((row) => Number(row.available_quantity) > 0);
  },

  async getAvailableQuantity(medicineId) {
    const { rows } = await pool.query(
      `SELECT GREATEST(
         m.quantity - COALESCE((
           SELECT SUM(dr.requested_quantity)
           FROM donation_requests dr
           WHERE dr.medicine_id = m.id
             AND dr.status NOT IN ('rejected', 'completed')
         ), 0),
         0
       )::int AS available_quantity,
       m.status, m.expiry_date
       FROM medicines m
       WHERE m.id = $1`,
      [medicineId]
    );
    return rows[0] || null;
  },

  async countApproved() {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM medicines WHERE status = 'approved'`
    );
    return rows[0].count;
  },

  async findByStatus(status, { limit = 50, offset = 0 } = {}) {
    const { rows } = await pool.query(
      `SELECT m.*, u.full_name AS donor_name, u.email AS donor_email
       FROM medicines m
       JOIN users u ON u.id = m.donor_id
       WHERE m.status = $1
       ORDER BY m.created_at ASC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );
    return rows;
  },

  async findByDonor(donorId) {
    const { rows } = await pool.query(
      `SELECT * FROM medicines WHERE donor_id = $1 ORDER BY created_at DESC`,
      [donorId]
    );
    return rows;
  },

  async countByStatus() {
    const { rows } = await pool.query(
      `SELECT status, COUNT(*)::int AS count FROM medicines GROUP BY status`
    );
    return rows;
  },

  async findAllAdmin({
    status,
    search,
    category,
    expiryBefore,
    limit = 50,
    offset = 0,
  } = {}) {
    const conditions = ["1=1"];
    const params = [];
    let i = 1;

    if (status) {
      conditions.push(`m.status = $${i++}`);
      params.push(status);
    }
    if (search) {
      conditions.push(
        `(m.medicine_name ILIKE $${i} OR m.batch_number ILIKE $${i} OR u.full_name ILIKE $${i})`
      );
      params.push(`%${search}%`);
      i++;
    }
    if (category) {
      conditions.push(`m.dosage ILIKE $${i++}`);
      params.push(`%${category}%`);
    }
    if (expiryBefore) {
      conditions.push(`m.expiry_date IS NOT NULL AND m.expiry_date <= $${i++}`);
      params.push(expiryBefore);
    }

    params.push(limit, offset);
    const { rows } = await pool.query(
      `SELECT m.*, u.full_name AS donor_name, u.email AS donor_email
       FROM medicines m
       JOIN users u ON u.id = m.donor_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY m.created_at DESC
       LIMIT $${i++} OFFSET $${i}`,
      params
    );
    return rows;
  },

  async getMonthlyDonations(months = 6) {
    const { rows } = await pool.query(
      `SELECT to_char(date_trunc('month', created_at), 'Mon') AS month,
              date_trunc('month', created_at) AS month_start,
              COUNT(*)::int AS count
       FROM medicines
       WHERE created_at >= date_trunc('month', NOW()) - ($1::int - 1) * INTERVAL '1 month'
       GROUP BY 1, 2
       ORDER BY month_start`,
      [months]
    );
    return rows;
  },

  async getTopDonatedMedicines(limit = 5) {
    const { rows } = await pool.query(
      `SELECT COALESCE(medicine_name, 'Unknown') AS name,
              COUNT(*)::int AS donations,
              SUM(quantity)::int AS units
       FROM medicines
       WHERE medicine_name IS NOT NULL
       GROUP BY medicine_name
       ORDER BY donations DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  },

  async getExpiryTrend(months = 6) {
    const { rows } = await pool.query(
      `SELECT to_char(date_trunc('month', expiry_date), 'Mon') AS month,
              date_trunc('month', expiry_date) AS month_start,
              COUNT(*)::int AS count
       FROM medicines
       WHERE expiry_date IS NOT NULL
         AND expiry_date >= date_trunc('month', NOW())
         AND expiry_date < date_trunc('month', NOW()) + ($1::int + 6) * INTERVAL '1 month'
       GROUP BY 1, 2
       ORDER BY month_start`,
      [months]
    );
    return rows;
  },

  async countPharmacistReviewsToday(pharmacistId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM audit_logs
       WHERE user_id = $1
         AND action IN ('pharmacist_approved', 'pharmacist_rejected')
         AND created_at::date = CURRENT_DATE`,
      [pharmacistId]
    );
    return rows[0]?.count || 0;
  },
};

module.exports = medicineRepository;
