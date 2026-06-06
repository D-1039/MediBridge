const { pool } = require("../config/database");

const requestRepository = {
  async create({ medicineId, receiverId }) {
    const { rows } = await pool.query(
      `INSERT INTO donation_requests (medicine_id, receiver_id)
       VALUES ($1, $2) RETURNING *`,
      [medicineId, receiverId]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT dr.*, m.medicine_name, m.status AS medicine_status
       FROM donation_requests dr
       JOIN medicines m ON m.id = dr.medicine_id
       WHERE dr.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByReceiver(receiverId) {
    const { rows } = await pool.query(
      `SELECT dr.*, m.medicine_name, m.dosage, m.expiry_date, m.image_url, m.status AS medicine_status
       FROM donation_requests dr
       JOIN medicines m ON m.id = dr.medicine_id
       WHERE dr.receiver_id = $1
       ORDER BY dr.created_at DESC`,
      [receiverId]
    );
    return rows;
  },

  async updateStatus(id, status) {
    const { rows } = await pool.query(
      `UPDATE donation_requests SET status = $2 WHERE id = $1 RETURNING *`,
      [id, status]
    );
    return rows[0] || null;
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
      `SELECT COUNT(*)::int AS count FROM donation_requests WHERE status = 'pending'`
    );
    return rows[0]?.count || 0;
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
         AND m.medicine_name ILIKE $1
       ORDER BY m.quantity DESC, m.created_at DESC
       LIMIT 1`,
      [`%${term}%`]
    );
    return rows[0] || null;
  },

  async findAll({ limit = 50, offset = 0 } = {}) {
    const { rows } = await pool.query(
      `SELECT dr.*, m.medicine_name, m.image_url,
              u.full_name AS receiver_name, u.email AS receiver_email
       FROM donation_requests dr
       JOIN medicines m ON m.id = dr.medicine_id
       JOIN users u ON u.id = dr.receiver_id
       ORDER BY dr.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  },
};

module.exports = requestRepository;
