const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const pool = require('../config/database');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.get('/me', authenticate, authCtrl.getMe);

// Get cabang list for registration (public)
router.get('/cabang-list', async (req, res) => {
  const [rows] = await pool.query('SELECT id, nama_cabang, kode_cabang FROM cabang WHERE status = "aktif" ORDER BY nama_cabang');
  res.json({ success: true, data: rows });
});

module.exports = router;
