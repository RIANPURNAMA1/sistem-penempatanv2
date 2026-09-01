const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const pool = require('../config/database');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/login-developer', authCtrl.loginDeveloper);
router.post('/google', authCtrl.googleLogin);
router.post('/send-forgot-otp', authCtrl.sendForgotOtp);
router.post('/verify-otp', authCtrl.verifyOtp);
router.get('/me', authenticate, authCtrl.getMe);
router.put('/profile', authenticate, authCtrl.updateProfile);
router.put('/password', authenticate, authCtrl.changePassword);
router.post('/forgot-password', authCtrl.forgotPassword);

// Get cabang list for registration (public)
router.get('/cabang-list', async (req, res) => {
  const [rows] = await pool.query('SELECT id, nama_cabang, kode_cabang FROM cabang WHERE status = "aktif" ORDER BY nama_cabang');
  res.json({ success: true, data: rows });
});

module.exports = router;
