const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const pool = require('../config/database');

let refreshScheduler = null;
const setRefreshSchedulerFn = (fn) => { refreshScheduler = fn; };

const DEFAULT_SETTINGS = {
  auto_screening_enabled: { value: 'false', type: 'boolean', description: 'Aktifkan screening otomatis setiap hari' },
  auto_screening_time: { value: '08:00', type: 'string', description: 'Jam screening dijalankan (HH:MM)' },
  auto_screening_range_start: { value: '06:00', type: 'string', description: 'Jam mulai range screening aktif (HH:MM)' },
  auto_screening_range_end: { value: '18:00', type: 'string', description: 'Jam selesai range screening aktif (HH:MM)' },
};

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value, setting_type, description FROM sys_settings');
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

    await pool.query(`
      INSERT INTO sys_settings (setting_key, setting_value, setting_type)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), setting_type = VALUES(setting_type)
    `, [req.params.key, String(setting_value), type]);

    if (req.params.key.startsWith('auto_screening') && refreshScheduler) {
      refreshScheduler();
    }

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

    res.json({ success: true, message: 'Setting direset ke default' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
module.exports.setRefreshSchedulerFn = setRefreshSchedulerFn;