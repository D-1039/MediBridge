const { pool } = require("../config/database");

const medicineImageRepository = {
  async createMany(medicineId, images) {
    const rows = [];
    for (let i = 0; i < images.length; i += 1) {
      const img = images[i];
      const { rows: inserted } = await pool.query(
        `INSERT INTO medicine_images (medicine_id, image_url, label, sort_order)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [medicineId, img.url, img.label || null, img.sort_order ?? i]
      );
      rows.push(inserted[0]);
    }
    return rows;
  },

  async findByMedicineId(medicineId) {
    const { rows } = await pool.query(
      `SELECT * FROM medicine_images
       WHERE medicine_id = $1
       ORDER BY sort_order ASC, created_at ASC`,
      [medicineId]
    );
    return rows;
  },

  async findByMedicineIds(medicineIds) {
    if (!medicineIds.length) return [];
    const { rows } = await pool.query(
      `SELECT * FROM medicine_images
       WHERE medicine_id = ANY($1::uuid[])
       ORDER BY medicine_id, sort_order ASC, created_at ASC`,
      [medicineIds]
    );
    return rows;
  },
};

module.exports = medicineImageRepository;
