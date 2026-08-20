const { pool } = require("../config/database");

const REQUEST_SELECT = `
  dr.*,
  m.medicine_name,
  m.dosage,
  m.expiry_date,
  m.image_url,
  m.status AS medicine_status,
  m.quantity AS medicine_quantity,
  am.medicine_name AS assigned_medicine_name,
  am.dosage AS assigned_dosage,
  am.expiry_date AS assigned_expiry_date,
  am.image_url AS assigned_image_url,
  am.status AS assigned_medicine_status,
  u.full_name AS receiver_name,
  u.email AS receiver_email
`;

const REQUEST_JOINS = `
  FROM donation_requests dr
  JOIN medicines m ON m.id = dr.medicine_id
  LEFT JOIN medicines am ON am.id = dr.assigned_medicine_id
  LEFT JOIN users u ON u.id = dr.receiver_id
`;

async function nextRequestCode(client) {
  const year = new Date().getFullYear();
  const { rows } = await client.query(
    "SELECT nextval('request_code_seq') AS seq"
  );
  const seq = String(rows[0].seq).padStart(3, "0");
  return `REQ-${year}-${seq}`;
}

const requestRepository = {
  async create({ medicineId, receiverId, requestedQuantity, searchQuery }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const requestCode = await nextRequestCode(client);
      const { rows } = await client.query(
        `INSERT INTO donation_requests (
          medicine_id, receiver_id, requested_quantity, status, request_code, search_query
        ) VALUES ($1, $2, $3, 'submitted', $4, $5) RETURNING *`,
        [medicineId, receiverId, requestedQuantity, requestCode, searchQuery || null]
      );
      await client.query("COMMIT");
      return rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT ${REQUEST_SELECT} ${REQUEST_JOINS} WHERE dr.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByReceiver(receiverId) {
    const { rows } = await pool.query(
      `SELECT ${REQUEST_SELECT} ${REQUEST_JOINS}
       WHERE dr.receiver_id = $1
       ORDER BY dr.updated_at DESC, dr.created_at DESC`,
      [receiverId]
    );
    return rows;
  },

  async updateStatus(id, status, extra = {}) {
    const fields = { status, ...extra };
    const keys = Object.keys(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
    const values = keys.map((k) => fields[k]);
    const { rows } = await pool.query(
      `UPDATE donation_requests SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return rows[0] || null;
  },

  async assignMedicine({
    requestId,
    assignedMedicineId,
    assignedQuantity,
    assignedBy,
  }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(
        `UPDATE donation_requests
         SET assigned_medicine_id = $2,
             assigned_quantity = $3,
             assigned_at = NOW(),
             status = 'assigned'
         WHERE id = $1
         RETURNING *`,
        [requestId, assignedMedicineId, assignedQuantity]
      );
      await client.query(
        `INSERT INTO medicine_assignments (
          request_id, assigned_medicine_id, assigned_quantity, assigned_by
        ) VALUES ($1, $2, $3, $4)`,
        [requestId, assignedMedicineId, assignedQuantity, assignedBy]
      );
      await client.query("COMMIT");
      return rows[0] || null;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async countBeneficiaries() {
    const { rows } = await pool.query(
      `SELECT COUNT(DISTINCT receiver_id)::int AS count
       FROM donation_requests WHERE status = 'completed'`
    );
    return rows[0].count;
  },

  async countByStatus() {
    const { rows } = await pool.query(
      `SELECT status, COUNT(*)::int AS count FROM donation_requests GROUP BY status`
    );
    return rows;
  },

  async countPending() {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM donation_requests
       WHERE status IN ('submitted', 'under_review', 'pending')`
    );
    return rows[0]?.count || 0;
  },

  async getReceiverStats(receiverId) {
    const { rows } = await pool.query(
      `SELECT
         COUNT(*)::int AS total_requests,
         COUNT(*) FILTER (
           WHERE status IN ('submitted', 'under_review', 'pending')
         )::int AS pending_requests,
         COUNT(*) FILTER (
           WHERE status IN ('assigned', 'ready_for_collection', 'approved')
         )::int AS approved_requests,
         COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_requests
       FROM donation_requests
       WHERE receiver_id = $1`,
      [receiverId]
    );
    return rows[0];
  },

  async getRequestAnalytics() {
    const { rows: statusRows } = await pool.query(
      `SELECT status, COUNT(*)::int AS count FROM donation_requests GROUP BY status`
    );
    const statusMap = Object.fromEntries(
      statusRows.map((r) => [r.status, r.count])
    );

    const { rows: monthly } = await pool.query(
      `SELECT to_char(date_trunc('month', created_at), 'Mon') AS month,
              date_trunc('month', created_at) AS month_start,
              COUNT(*)::int AS count
       FROM donation_requests
       WHERE created_at >= date_trunc('month', NOW()) - INTERVAL '5 months'
       GROUP BY 1, 2
       ORDER BY month_start`
    );

    const { rows: completion } = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
         COUNT(*) FILTER (WHERE status NOT IN ('rejected'))::int AS total
       FROM donation_requests`
    );

    const completed = completion[0]?.completed || 0;
    const total = completion[0]?.total || 0;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total_requests: statusRows.reduce((sum, r) => sum + r.count, 0),
      pending_requests:
        (statusMap.submitted || 0) +
        (statusMap.under_review || 0) +
        (statusMap.pending || 0),
      assigned_requests:
        (statusMap.assigned || 0) +
        (statusMap.ready_for_collection || 0) +
        (statusMap.approved || 0),
      completed_requests: statusMap.completed || 0,
      rejected_requests: statusMap.rejected || 0,
      by_status: statusMap,
      monthly_volume: monthly,
      completion_rate: completionRate,
      distribution_trend: monthly.map((m) => ({
        month: m.month,
        count: m.count,
      })),
    };
  },

  async getTopRequestedMedicines(limit = 5) {
    const { rows } = await pool.query(
      `SELECT COALESCE(m.medicine_name, 'Unknown') AS name,
              COUNT(*)::int AS requests
       FROM donation_requests dr
       JOIN medicines m ON m.id = dr.medicine_id
       GROUP BY m.medicine_name
       ORDER BY requests DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  },

  async findBestMatchForMedicineName(medicineName) {
    if (!medicineName?.trim()) return null;
    const term = medicineName.trim().split(/\s+/)[0];
    const { rows } = await pool.query(
      `SELECT m.*, u.full_name AS donor_name
       FROM medicines m
       JOIN users u ON u.id = m.donor_id
       WHERE m.status = 'approved'
         AND (m.expiry_date IS NULL OR m.expiry_date >= CURRENT_DATE)
         AND m.medicine_name ILIKE $1
       ORDER BY m.quantity DESC, m.created_at DESC
       LIMIT 1`,
      [`%${term}%`]
    );
    return rows[0] || null;
  },

  async findAll({ limit = 50, offset = 0 } = {}) {
    const { rows } = await pool.query(
      `SELECT ${REQUEST_SELECT} ${REQUEST_JOINS}
       ORDER BY dr.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  },
};

module.exports = requestRepository;
