const { pool } = require("../config/database");

const auditRepository = {
  async create({ userId, medicineId, action, description }) {
    const { rows } = await pool.query(
      `INSERT INTO audit_logs (user_id, medicine_id, action, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId || null, medicineId || null, action, description || null]
    );
    return rows[0];
  },

  async findByMedicine(medicineId) {
    const { rows } = await pool.query(
      `SELECT al.*, u.full_name AS user_name
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       WHERE al.medicine_id = $1
       ORDER BY al.created_at DESC`,
      [medicineId]
    );
    return rows;
  },
};

module.exports = auditRepository;
