const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const register = async (req, res) => {
  try {
    const { nama, email, password, cabang_id } = req.body;
    if (!nama || !email || !password || !cabang_id) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
    }
    const [cabang] = await pool.query('SELECT id FROM cabang WHERE id = ? AND status = "aktif"', [cabang_id]);
    if (!cabang.length) {
      return res.status(400).json({ success: false, message: 'Cabang tidak valid' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (nama, email, password, role, cabang_id) VALUES (?, ?, ?, "kandidat", ?)',
      [nama, email, hashed, cabang_id]
    );
    // Create empty profile
    await pool.query('INSERT INTO kandidat_profil (user_id, cabang_id) VALUES (?, ?)', [result.insertId, cabang_id]);
    res.status(201).json({ success: true, message: 'Registrasi berhasil' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
    }
    const [users] = await pool.query(
      'SELECT u.*, c.nama_cabang FROM users u LEFT JOIN cabang c ON u.cabang_id = c.id WHERE u.email = ?',
      [email]
    );
    if (!users.length) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }
    const user = users[0];
    if (user.status !== 'aktif') {
      return res.status(401).json({ success: false, message: 'Akun tidak aktif' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        cabang_id: user.cabang_id,
        nama_cabang: user.nama_cabang
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, getMe };
