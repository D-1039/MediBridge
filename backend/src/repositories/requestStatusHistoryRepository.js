const { pool } = require("../config/database");

const requestStatusHistoryRepository = {
  async create({ requestId, status, notes, changedBy }) {
    const { rows } = await pool.query(
      `INSERT INTO request_status_history (request_id, status, notes, changed_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [requestId, status, notes || null, changedBy || null]
    );
    return rows[0];
  },

  async findByRequestId(requestId) {
    const { rows } = await pool.query(
      `SELECT h.*, u.full_name AS changed_by_name
       FROM request_status_history h
       LEFT JOIN users u ON u.id = h.changed_by
       WHERE h.request_id = $1
       ORDER BY h.created_at ASC`,
      [requestId]
    );
    return rows;
  },
};

module.exports = requestStatusHistoryRepository;
