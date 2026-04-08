const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET all job orders with kandidat and perusahaan data
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT 
        jo.*,
        p.nama_perusahaan,
        p.bidang_usaha,
        GROUP_CONCAT(k.nama_romaji ORDER BY k.nama_romaji SEPARATOR ', ') as nama_kandidat,
        GROUP_CONCAT(k.id ORDER BY k.id SEPARATOR ', ') as kandidat_ids
      FROM job_order jo
      LEFT JOIN job_order_kandidat jok ON jo.id = jok.job_order_id
      LEFT JOIN kandidat_profil k ON jok.kandidat_id = k.id
      LEFT JOIN perusahaan p ON jo.perusahaan_id = p.id
      GROUP BY jo.id
      ORDER BY jo.created_at DESC
    `;
    const [results] = await pool.query(sql);
    results.forEach(r => {
      r.kandidat_ids = r.kandidat_ids ? r.kandidat_ids.split(',').map(Number) : [];
    });
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single job order with all kandidats
router.get('/:id', async (req, res) => {
  try {
    const sql = `
      SELECT 
        jo.*,
        p.nama_perusahaan,
        p.bidang_usaha
      FROM job_order jo
      LEFT JOIN perusahaan p ON jo.perusahaan_id = p.id
      WHERE jo.id = ?
    `;
    const [results] = await pool.query(sql, [req.params.id]);
    if (results.length === 0) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });

    const jobOrder = results[0];

    const kandidatSql = `
      SELECT k.id, k.nama_romaji, k.nama_katakana, k.nomor_hp, k.email_kontak
      FROM job_order_kandidat jok
      JOIN kandidat_profil k ON jok.kandidat_id = k.id
      WHERE jok.job_order_id = ?
    `;
    const [kandidats] = await pool.query(kandidatSql, [req.params.id]);

    res.json({ success: true, data: { ...jobOrder, kandidats } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE job order with multiple kandidats
router.post('/', async (req, res) => {
  const {
    kandidat_ids,
    perusahaan_id,
    nomor,
    tanggal_terbit,
    detail_job_order,
    bidang_ssw,
    nama_grup,
    link_grup,
    biaya_awal,
    biaya_akhir,
    tanggal_cv,
    pic_cv,
    tanggal_mensetsu_1,
    tanggal_mensetsu_2,
    tanggal_mensetsu_3,
    status_kelulusan
  } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const sql = `
      INSERT INTO job_order (
        nomor, perusahaan_id, tanggal_terbit, detail_job_order,
        bidang_ssw, nama_grup, link_grup, biaya_awal, biaya_akhir,
        tanggal_cv, pic_cv, tanggal_mensetsu_1, tanggal_mensetsu_2, tanggal_mensetsu_3,
        status_kelulusan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      nomor, perusahaan_id || null, tanggal_terbit, detail_job_order,
      bidang_ssw, nama_grup, link_grup, biaya_awal || 0, biaya_akhir || 0,
      tanggal_cv, pic_cv, tanggal_mensetsu_1, tanggal_mensetsu_2, tanggal_mensetsu_3,
      status_kelulusan || 'Menunggu'
    ];

    const [result] = await connection.query(sql, values);
    const jobOrderId = result.insertId;

    if (kandidat_ids && kandidat_ids.length > 0) {
      const kandidatValues = kandidat_ids.map(kid => [jobOrderId, kid]);
      await connection.query(
        'INSERT INTO job_order_kandidat (job_order_id, kandidat_id) VALUES ?',
        [kandidatValues]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Job order berhasil ditambahkan', data: { id: jobOrderId } });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
});

// UPDATE job order
router.put('/:id', async (req, res) => {
  const {
    kandidat_ids,
    perusahaan_id,
    nomor,
    tanggal_terbit,
    detail_job_order,
    bidang_ssw,
    nama_grup,
    link_grup,
    biaya_awal,
    biaya_akhir,
    tanggal_cv,
    pic_cv,
    tanggal_mensetsu_1,
    tanggal_mensetsu_2,
    tanggal_mensetsu_3,
    status_kelulusan
  } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const sql = `
      UPDATE job_order SET
        nomor = ?,
        perusahaan_id = ?,
        tanggal_terbit = ?,
        detail_job_order = ?,
        bidang_ssw = ?,
        nama_grup = ?,
        link_grup = ?,
        biaya_awal = ?,
        biaya_akhir = ?,
        tanggal_cv = ?,
        pic_cv = ?,
        tanggal_mensetsu_1 = ?,
        tanggal_mensetsu_2 = ?,
        tanggal_mensetsu_3 = ?,
        status_kelulusan = ?
      WHERE id = ?
    `;

    const values = [
      nomor,
      perusahaan_id || null,
      tanggal_terbit,
      detail_job_order,
      bidang_ssw,
      nama_grup,
      link_grup,
      biaya_awal || 0,
      biaya_akhir || 0,
      tanggal_cv,
      pic_cv,
      tanggal_mensetsu_1,
      tanggal_mensetsu_2,
      tanggal_mensetsu_3,
      status_kelulusan,
      req.params.id
    ];

    await connection.query(sql, values);

    if (kandidat_ids && Array.isArray(kandidat_ids)) {
      await connection.query('DELETE FROM job_order_kandidat WHERE job_order_id = ?', [req.params.id]);
      if (kandidat_ids.length > 0) {
        const kandidatValues = kandidat_ids.map(kid => [parseInt(req.params.id), kid]);
        await connection.query(
          'INSERT INTO job_order_kandidat (job_order_id, kandidat_id) VALUES ?',
          [kandidatValues]
        );
      }
    }

    await connection.commit();
    res.json({ success: true, message: 'Job order berhasil diupdate' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
});

// DELETE job order
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM job_order WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Job order berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;