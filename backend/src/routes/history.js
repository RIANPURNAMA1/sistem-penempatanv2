const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { kandidat_id } = req.query;
    
    let sql = `
      SELECT 
        kp.id,
        kp.id as kandidat_id,
        COALESCE(kp.status_progres, 'Job Matching') as status_kandidat,
        kp.status_interview,
        kp.catatan_interview,
        kp.jadwal_interview,
        kp.bidang_ssw,
        kp.nama_perusahaan,
        kp.detail_pekerjaan,
        kp.created_at,
        kp.updated_at,
        JSON_OBJECT('id', kp.id, 'no_kandidat', null) as kandidat,
        JSON_OBJECT('id', kp.institusi_id, 'nama', null) as institusi
      FROM kandidat_profil kp
    `;
    const params = [];
    
    if (kandidat_id) {
      sql += ' WHERE kp.id = ?';
      params.push(kandidat_id);
    }
    
    sql += ' ORDER BY kp.id DESC';
    
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM kandidat_history WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'History tidak ditemukan' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;