const pool = require('../config/database');

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM cv_data ORDER BY created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const importData = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const cvList = req.body.data;
    if (!Array.isArray(cvList)) {
      return res.status(400).json({ success: false, message: 'Data harus array' });
    }
    
    let imported = 0;
    let skipped = 0;
    
    for (const cv of cvList) {
      if (!cv.email && !cv.nama_lengkap_romaji) {
        skipped++;
        continue;
      }
      
      const fields = Object.keys(cv);
      const values = Object.values(cv);
      const placeholders = fields.map(() => '?').join(', ');
      
      try {
        await conn.query(
          `INSERT INTO cv_data (${fields.join(', ')}) VALUES (${placeholders})`,
          values
        );
        imported++;
      } catch (e) {
        console.error('Error inserting CV:', e.message);
        skipped++;
      }
    }
    
    await conn.commit();
    res.json({ success: true, message: `Berhasil import ${imported} data, skipped ${skipped}` });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
};

const getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cv_data WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const placeholders = fields.map(() => '?').join(', ');
    
    const [result] = await pool.query(
      `INSERT INTO cv_data (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );
    res.json({ success: true, message: 'CV berhasil disimpan', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    
    const [result] = await pool.query(
      `UPDATE cv_data SET ${setClause} WHERE id = ?`,
      [...values, req.params.id]
    );
    
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    res.json({ success: true, message: 'CV berhasil diupdate' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM cv_data WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    res.json({ success: true, message: 'CV berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, getById, create, update, remove, importData };
