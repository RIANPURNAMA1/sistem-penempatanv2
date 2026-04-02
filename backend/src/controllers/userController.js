const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const getAll = async (req, res) => {
  try {
    const { role, cabang_id } = req.query;
    let query = 'SELECT u.id, u.nama, u.email, u.role, u.cabang_id, u.status, u.created_at, c.nama_cabang FROM users u LEFT JOIN cabang c ON u.cabang_id = c.id WHERE 1=1';
    const params = [];
    if (role) { query += ' AND u.role = ?'; params.push(role); }
    if (cabang_id) { query += ' AND u.cabang_id = ?'; params.push(cabang_id); }
    query += ' ORDER BY u.created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const { nama, email, password, role, cabang_id } = req.body;
    if (!nama || !email || !password || !role) return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (nama, email, password, role, cabang_id) VALUES (?,?,?,?,?)',
      [nama, email, hashed, role, cabang_id || null]);
    res.status(201).json({ success: true, message: 'User berhasil dibuat', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    const { nama, email, role, cabang_id, status, password } = req.body;
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET nama=?, email=?, role=?, cabang_id=?, status=?, password=? WHERE id=?',
        [nama, email, role, cabang_id || null, status, hashed, req.params.id]);
    } else {
      await pool.query('UPDATE users SET nama=?, email=?, role=?, cabang_id=?, status=? WHERE id=?',
        [nama, email, role, cabang_id || null, status, req.params.id]);
    }
    res.json({ success: true, message: 'User berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    if (req.params.id == req.user.id) return res.status(400).json({ success: false, message: 'Tidak bisa menghapus akun sendiri' });
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, create, update, remove };
