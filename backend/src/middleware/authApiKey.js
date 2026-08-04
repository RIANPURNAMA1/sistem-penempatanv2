const pool = require('../config/database');

const authApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ success: false, message: 'API key tidak ditemukan' });
    }

    const [clients] = await pool.query(
      'SELECT id, nama_sistem, active FROM api_clients WHERE api_key = ?',
      [apiKey]
    );

    if (!clients.length || !clients[0].active) {
      return res.status(401).json({ success: false, message: 'API key tidak valid' });
    }

    await pool.query(
      'UPDATE api_clients SET last_used_at = NOW() WHERE id = ?',
      [clients[0].id]
    );

    req.apiClient = clients[0];
    next();
  } catch (err) {
    console.error('[API KEY] Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = authApiKey;
