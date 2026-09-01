const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { sendOtpEmail } = require('../utils/email');

const register = async (req, res) => {
  try {
    const { nama, email, password, cabang_id } = req.body;
    if (!nama || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nama, email dan password wajib diisi' });
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (nama, email, password, role, cabang_id) VALUES (?, ?, ?, "kandidat", ?)',
      [nama, email, hashed, cabang_id || null]
    );
    await pool.query(
      'INSERT INTO kandidat_profil (user_id, cabang_id, nama_romaji, status_formulir, status_progres) VALUES (?, ?, ?, ?, ?)',
      [result.insertId, cabang_id || null, nama, 'draft', 'Job Matching']
    );
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
      return res.status(400).json({ success: false, message: 'Email/nama dan password wajib diisi' });
    }
    const [users] = await pool.query(
      'SELECT u.*, c.nama_cabang FROM users u LEFT JOIN cabang c ON u.cabang_id = c.id WHERE u.email = ? OR u.nama = ?',
      [email, email]
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

const googleLogin = async (req, res) => {
  try {
    const { googleToken } = req.body;
    
    if (!googleToken) {
      return res.status(400).json({ success: false, message: 'Google token diperlukan' });
    }

    const tokenParts = googleToken.split('.');
    if (tokenParts.length !== 3) {
      return res.status(400).json({ success: false, message: 'Invalid Google token' });
    }

    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64 + '=='.slice(0, (4 - base64.length % 4) % 4);
    const payloadJson = Buffer.from(paddedBase64, 'base64').toString('utf8');
    const data = JSON.parse(payloadJson);
    
    const email = data.email;
    const name = data.name;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email tidak ditemukan dalam token' });
    }

    let [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (users.length === 0) {
      const randomPassword = Math.random().toString(36).slice(-12);
      const hashed = await bcrypt.hash(randomPassword, 10);
      
      const [result] = await pool.query(
        'INSERT INTO users (nama, email, password, role, status) VALUES (?, ?, ?, "kandidat", "aktif")',
        [name || email, email, hashed]
      );

      await pool.query(
        'INSERT INTO kandidat_profil (user_id, nama_romaji, status_formulir, status_progres) VALUES (?, ?, ?, ?)',
        [result.insertId, name || email, 'draft', 'Job Matching']
      );

      [users] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    }

    user = users[0];

    if (user.status !== 'aktif') {
      return res.status(401).json({ success: false, message: 'Akun tidak aktif' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    let nama_cabang = null;
    if (user.cabang_id) {
      const [cabang] = await pool.query('SELECT nama_cabang FROM cabang WHERE id = ?', [user.cabang_id]);
      if (cabang.length) nama_cabang = cabang[0].nama_cabang;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        cabang_id: user.cabang_id,
        nama_cabang,
      },
      token,
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

const sendForgotOtp = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email wajib diisi' });
    }

    const [users] = await pool.query('SELECT id, nama FROM users WHERE email = ?', [email]);
    if (!users.length) {
      return res.status(404).json({ success: false, message: 'Email tidak ditemukan' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 2);
    const expiredAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      'INSERT INTO password_resets (user_id, otp, expired_at) VALUES (?, ?, ?)',
      [users[0].id, otpHash, expiredAt]
    );

    await sendOtpEmail(email, otp);

    res.json({ success: true, message: 'Kode verifikasi telah dikirim ke email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP dan password wajib diisi' });
    }

    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (!users.length) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const [resets] = await pool.query(
      'SELECT * FROM password_resets WHERE user_id = ? AND expired_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [users[0].id]
    );

    if (!resets.length) {
      return res.status(400).json({ success: false, message: 'Kode tidak valid atau expired' });
    }

    const valid = await bcrypt.compare(otp, resets[0].otp);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Kode salah' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, users[0].id]);
    await pool.query('DELETE FROM password_resets WHERE user_id = ?', [users[0].id]);

    res.json({ success: true, message: 'Password berhasil direset. Silakan login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nama, email } = req.body;
    
    if (!nama || !email) {
      return res.status(400).json({ success: false, message: 'Nama dan email wajib diisi' });
    }
    
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    );
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Email sudah digunakan' });
    }
    
    await pool.query(
      'UPDATE users SET nama = ?, email = ? WHERE id = ?',
      [nama, email, userId]
    );
    
    const [updated] = await pool.query('SELECT id, nama, email, role FROM users WHERE id = ?', [userId]);
    res.json({ success: true, message: 'Profil berhasil diperbarui', data: updated[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'Password baru wajib diisi' });
    }
    
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (!users.length) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    
    if (currentPassword) {
      const valid = await bcrypt.compare(currentPassword, users[0].password);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Password lama salah' });
      }
    }
    
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
    
    res.json({ success: true, message: 'Password berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email dan password baru wajib diisi' });
    }
    
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (!users.length) {
      return res.status(404).json({ success: false, message: 'Email tidak ditemukan' });
    }
    
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, users[0].id]);
    
    res.json({ success: true, message: 'Password berhasil direset. Silakan login dengan password baru.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const loginDeveloper = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
    }
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND role = "developer"',
      [email]
    );
    if (!users.length) {
      return res.status(401).json({ success: false, message: 'Email atau password developer salah' });
    }
    const user = users[0];
    if (user.status !== 'aktif') {
      return res.status(401).json({ success: false, message: 'Akun developer tidak aktif' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Email atau password developer salah' });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '12h' }
    );
    res.json({ success: true, token, user: { id: user.id, nama: user.nama, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { register, login, loginDeveloper, googleLogin, sendForgotOtp, verifyOtp, getMe, updateProfile, changePassword, forgotPassword };