const pool = require('../config/database');

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cabang ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cabang WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Cabang tidak ditemukan' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const { nama_cabang, kode_cabang, alamat, kota, provinsi, telepon, email, status } = req.body;
    if (!nama_cabang || !kode_cabang) {
      return res.status(400).json({ success: false, message: 'Nama dan kode cabang wajib diisi' });
    }
    const [existing] = await pool.query('SELECT id FROM cabang WHERE kode_cabang = ?', [kode_cabang]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Kode cabang sudah ada' });
    const [result] = await pool.query(
      'INSERT INTO cabang (nama_cabang, kode_cabang, alamat, kota, provinsi, telepon, email, status) VALUES (?,?,?,?,?,?,?,?)',
      [nama_cabang, kode_cabang, alamat, kota, provinsi, telepon, email, status || 'aktif']
    );
    res.status(201).json({ success: true, message: 'Cabang berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    const { nama_cabang, kode_cabang, alamat, kota, provinsi, telepon, email, status } = req.body;
    const [existing] = await pool.query('SELECT id FROM cabang WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Cabang tidak ditemukan' });
    await pool.query(
      'UPDATE cabang SET nama_cabang=?, kode_cabang=?, alamat=?, kota=?, provinsi=?, telepon=?, email=?, status=? WHERE id=?',
      [nama_cabang, kode_cabang, alamat, kota, provinsi, telepon, email, status, req.params.id]
    );
    res.json({ success: true, message: 'Cabang berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM cabang WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Cabang tidak ditemukan' });
    await pool.query('DELETE FROM cabang WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Cabang berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, getById, create, update, remove };
