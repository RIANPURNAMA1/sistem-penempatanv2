const pool = require('../config/database');
const cache = require('../utils/cache');

const CACHE_PREFIX = 'institusi';

const invalidateInstitusiCache = async () => {
  await cache.delByPrefix(CACHE_PREFIX);
};

exports.getAll = async (req, res) => {
  try {
    const cached = await cache.get(CACHE_PREFIX);
    if (cached) return res.json({ success: true, data: cached });

    const [rows] = await pool.query('SELECT * FROM institusi ORDER BY nama ASC');
    await cache.set(CACHE_PREFIX, rows, 300);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error getAll institusi:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM institusi WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Institusi tidak ditemukan' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nama, deskripsi } = req.body;
    const [result] = await pool.query('INSERT INTO institusi (nama, deskripsi) VALUES (?, ?)', [nama, deskripsi || null]);
    await invalidateInstitusiCache();
    res.json({ success: true, message: 'Institusi berhasil ditambahkan', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { nama, deskripsi } = req.body;
    await pool.query('UPDATE institusi SET nama = ?, deskripsi = ? WHERE id = ?', [nama, deskripsi || null, req.params.id]);
    await invalidateInstitusiCache();
    res.json({ success: true, message: 'Institusi berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM institusi WHERE id = ?', [req.params.id]);
    await invalidateInstitusiCache();
    res.json({ success: true, message: 'Institusi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};