const pool = require('../config/database');

const getAll = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = 'SELECT * FROM perusahaan WHERE 1=1';
    const params = [];
    if (search) { query += ' AND (nama_perusahaan LIKE ? OR bidang_usaha LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM perusahaan WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Perusahaan tidak ditemukan' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const { nama_perusahaan, nama_jepang, bidang_usaha, alamat_indonesia, alamat_jepang, kota, negara, kontak_pic, telepon, email, website, quota_ssw, status, keterangan } = req.body;
    if (!nama_perusahaan) return res.status(400).json({ success: false, message: 'Nama perusahaan wajib diisi' });
    const [result] = await pool.query(
      'INSERT INTO perusahaan (nama_perusahaan, nama_jepang, bidang_usaha, alamat_indonesia, alamat_jepang, kota, negara, kontak_pic, telepon, email, website, quota_ssw, status, keterangan) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [nama_perusahaan, nama_jepang, bidang_usaha, alamat_indonesia, alamat_jepang, kota, negara || 'Jepang', kontak_pic, telepon, email, website, quota_ssw || 0, status || 'aktif', keterangan]
    );
    res.status(201).json({ success: true, message: 'Perusahaan berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    const { nama_perusahaan, nama_jepang, bidang_usaha, alamat_indonesia, alamat_jepang, kota, negara, kontak_pic, telepon, email, website, quota_ssw, status, keterangan } = req.body;
    const [existing] = await pool.query('SELECT id FROM perusahaan WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Perusahaan tidak ditemukan' });
    await pool.query(
      'UPDATE perusahaan SET nama_perusahaan=?, nama_jepang=?, bidang_usaha=?, alamat_indonesia=?, alamat_jepang=?, kota=?, negara=?, kontak_pic=?, telepon=?, email=?, website=?, quota_ssw=?, status=?, keterangan=? WHERE id=?',
      [nama_perusahaan, nama_jepang, bidang_usaha, alamat_indonesia, alamat_jepang, kota, negara, kontak_pic, telepon, email, website, quota_ssw, status, keterangan, req.params.id]
    );
    res.json({ success: true, message: 'Perusahaan berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM perusahaan WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Perusahaan tidak ditemukan' });
    await pool.query('DELETE FROM perusahaan WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Perusahaan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, getById, create, update, remove };
