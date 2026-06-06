const { pool } = require("../config/database");

const refreshTokenRepository = {
  async create({ userId, tokenHash, expiresAt }) {
    const { rows } = await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3) RETURNING id`,
      [userId, tokenHash, expiresAt]
    );
    return rows[0];
  },

  async findByHash(tokenHash) {
    const { rows } = await pool.query(
      `SELECT rt.*, u.id AS user_id, u.email, u.role, u.full_name
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1 AND rt.expires_at > NOW()`,
      [tokenHash]
    );
    return rows[0] || null;
  },

  async deleteByHash(tokenHash) {
    await pool.query(`DELETE FROM refresh_tokens WHERE token_hash = $1`, [
      tokenHash,
    ]);
  },

  async deleteAllForUser(userId) {
    await pool.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [userId]);
  },
};

module.exports = refreshTokenRepository;
