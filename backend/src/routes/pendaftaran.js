const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.nama,
        p.nik,
        p.jenis_kelamin,
        p.agama,
        p.email,
        p.no_wa,
        p.tempat_lahir,
        p.tempat_tanggal_lahir,
        p.alamat,
        p.provinsi,
        p.kab_kota,
        p.kecamatan,
        p.kelurahan,
        p.pendidikan_terakhir,
        p.status,
        p.pernah_ke_jepang,
        p.paspor,
        p.verifikasi,
        p.id_prometric,
        p.password_prometric,
        p.status_jft,
        p.status_ssw,
        p.foto,
        p.sertifikat_jft,
        p.sertifikat_ssw,
        p.kk,
        p.ktp,
        p.bukti_pelunasan,
        p.akte,
        p.ijasah,
        p.catatan_admin,
        p.created_at,
        p.updated_at,
        c.nama_cabang
      FROM pendaftaran_sistem_lama p
      LEFT JOIN cabang c ON c.id = p.cabang_id
      ORDER BY p.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching pendaftaran:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        p.*,
        c.nama_cabang
      FROM pendaftaran_sistem_lama p
      LEFT JOIN cabang c ON p.cabang_id = c.id
      WHERE p.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching pendaftaran:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/import', async (req, res) => {
  try {
    res.status(501).json({ success: false, message: 'Fitur import belum tersedia' });
  } catch (error) {
    console.error('Error importing:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;