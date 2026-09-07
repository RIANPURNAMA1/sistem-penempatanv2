const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const pool = require('../config/database');
const cache = require('../utils/cache');

let refreshScheduler = null;
const setRefreshSchedulerFn = (fn) => { refreshScheduler = fn; };

const DEFAULT_SETTINGS = {
  auto_screening_enabled: { value: 'false', type: 'boolean', description: 'Aktifkan screening otomatis setiap hari' },
  auto_screening_time: { value: '08:00', type: 'string', description: 'Jam screening dijalankan (HH:MM)' },
  auto_screening_range_start: { value: '06:00', type: 'string', description: 'Jam mulai range screening aktif (HH:MM)' },
  auto_screening_range_end: { value: '18:00', type: 'string', description: 'Jam selesai range screening aktif (HH:MM)' },
  whatsapp_api_url: { value: 'https://api.starsender.online/api/send', type: 'string', description: 'URL API StarSender' },
  whatsapp_device_api_key: { value: '', type: 'string', description: 'Device API Key StarSender' },
  whatsapp_account_api_key: { value: '', type: 'string', description: 'Account API Key StarSender' },
  whatsapp_admin_phone: { value: '', type: 'string', description: 'Nomor admin penerima notifikasi WhatsApp' },
  whatsapp_send_delay: { value: '15', type: 'number', description: 'Delay pengiriman WhatsApp (detik) agar tidak diblokir (anti-ban)' },
  whatsapp_login_url: { value: 'https://job.mendunia.id/login', type: 'string', description: 'Link login sistem untuk dimasukkan ke pesan WhatsApp' },
};

const invalidateSettingsCache = async () => {
  await cache.delByPrefix('settings');
};

router.get('/', async (req, res) => {
  try {
    const cached = await cache.get('settings:all');
    if (cached) return res.json({ success: true, data: cached });

    const [rows] = await pool.query('SELECT setting_key, setting_value, setting_type, description FROM sys_settings');
    await cache.set('settings:all', rows, 120);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:key', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sys_settings WHERE setting_key = ?', [req.params.key]);
    if (!rows.length) {
      const def = DEFAULT_SETTINGS[req.params.key];
      return res.json({ success: true, data: def ? { setting_key: req.params.key, setting_value: def.value, setting_type: def.type, description: def.description } : null });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:key', authenticate, authorize('admin_penempatan'), async (req, res) => {
  try {
    const { setting_value } = req.body;
    const { setting_type } = req.body;
    
    if (setting_value === undefined || setting_value === null) {
      return res.status(400).json({ success: false, message: 'setting_value required' });
    }

    const validTypes = ['string', 'number', 'boolean', 'json'];
    const type = validTypes.includes(setting_type) ? setting_type : 'string';
    const description = (DEFAULT_SETTINGS[req.params.key] && DEFAULT_SETTINGS[req.params.key].description) || null;

    await pool.query(`
      INSERT INTO sys_settings (setting_key, setting_value, setting_type, description)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), setting_type = VALUES(setting_type), description = VALUES(description)
    `, [req.params.key, String(setting_value), type, description]);

    if (req.params.key.startsWith('auto_screening') && refreshScheduler) {
      refreshScheduler();
    }

    await invalidateSettingsCache();
    res.json({ success: true, message: 'Setting updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/:key/reset', authenticate, authorize('admin_penempatan'), async (req, res) => {
  try {
    const def = DEFAULT_SETTINGS[req.params.key];
    if (!def) {
      return res.status(404).json({ success: false, message: 'Setting tidak ditemukan' });
    }

    await pool.query(`
      INSERT INTO sys_settings (setting_key, setting_value, setting_type, description)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), setting_type = VALUES(setting_type), description = VALUES(description)
    `, [req.params.key, def.value, def.type, def.description]);

    await invalidateSettingsCache();
    res.json({ success: true, message: 'Setting direset ke default' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/whatsapp/test', authenticate, authorize('admin_penempatan'), async (req, res) => {
  try {
    const axios = require('axios');
    const [rows] = await pool.query(
      "SELECT setting_key, setting_value FROM sys_settings WHERE setting_key IN (?, ?, ?, ?)",
      ['whatsapp_api_url', 'whatsapp_device_api_key', 'whatsapp_account_api_key', 'whatsapp_admin_phone']
    );
    const map = {};
    rows.forEach(r => { map[r.setting_key] = r.setting_value; });

    const apiUrl = map.whatsapp_api_url || 'https://api.starsender.online/api/send';
    const deviceKey = map.whatsapp_device_api_key || process.env.STARSENDER_DEVICE_API_KEY;
    const adminPhone = map.whatsapp_admin_phone || process.env.STARSENDER_ADMIN_PHONE;

    if (!deviceKey) {
      return res.status(400).json({ success: false, message: 'Device API Key belum diisi' });
    }
    if (!adminPhone) {
      return res.status(400).json({ success: false, message: 'Nomor admin belum diisi' });
    }

    const payload = {
      messageType: 'text',
      to: adminPhone,
      body: '*Test Notifikasi WhatsApp* 🎉\n\nKoneksi WhatsApp Gateway berhasil dikonfigurasi.\n\n_Pesan otomatis dari Sistem._',
    };

    const response = await axios.post(apiUrl, payload, {
      headers: { 'Content-Type': 'application/json', 'Authorization': deviceKey },
      timeout: 10000,
    });

    res.json({ success: true, message: 'Test berhasil dikirim', data: response.data });
  } catch (err) {
    const errMsg = err.response?.data || err.message;
    console.error('[WHATSAPP TEST] Gagal:', errMsg);
    res.status(500).json({ success: false, message: 'Gagal kirim test', error: errMsg });
  }
});

module.exports = router;
module.exports.setRefreshSchedulerFn = setRefreshSchedulerFn;