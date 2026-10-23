/**
 * Klien AI ringkas (Groq / OpenAI-compatible) untuk penerjemahan CV.
 *
 * Sumber API key (berurutan):
 *   1. sys_settings -> setting_key "groq_api_key"  (diatur dari UI: /settings/ai)
 *   2. environment  -> GROQ_API_KEY di backend/.env
 *
 * Tanpa kunci, penerjemahan AI dilewati: data memakai terjemahan manual
 * (atau teks asli) dan sistem tetap berjalan normal.
 */

const pool = require('../config/database');
const cache = require('../utils/cache');

const GROQ_BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
const GROQ_MODEL_DEFAULT = 'qwen/qwen3.8-27b';

/** Ambil API key: database (diatur dari UI) → environment. */
async function ambilKunci() {
  try {
    const cached = await cache.get('settings:ai:groq_api_key');
    if (cached) return String(cached).trim() || null;
  } catch (e) {
    /* cache tidak tersedia, lanjut ke DB */
  }
  try {
    const [rows] = await pool.query(
      "SELECT setting_value FROM sys_settings WHERE setting_key = 'groq_api_key'"
    );
    const dariDb = rows[0] && rows[0].setting_value ? String(rows[0].setting_value).trim() : null;
    if (dariDb) {
      try {
        await cache.set('settings:ai:groq_api_key', dariDb, 300);
      } catch (e) {
        /* abaikan */
      }
      return dariDb;
    }
  } catch (e) {
    /* DB belum siap, lanjut ke env */
  }
  const dariEnv = process.env.GROQ_API_KEY ? String(process.env.GROQ_API_KEY).trim() : null;
  return dariEnv || null;
}

/** Model yang dipakai (bisa diatur dari UI). */
async function ambilModel() {
  try {
    const [rows] = await pool.query(
      "SELECT setting_value FROM sys_settings WHERE setting_key = 'groq_model'"
    );
    const m = rows[0] && rows[0].setting_value ? String(rows[0].setting_value).trim() : '';
    return m || process.env.GROQ_MODEL || GROQ_MODEL_DEFAULT;
  } catch (e) {
    return process.env.GROQ_MODEL || GROQ_MODEL_DEFAULT;
  }
}

/** Apakah penerjemahan AI aktif? */
async function tersedia() {
  return !!(await ambilKunci());
}

/**
 * Terjemahkan teks ke bahasa target memakai AI.
 * @returns {Promise<string|null>} hasil terjemahan, atau null bila gagal.
 */
async function terjemahkan({ teks, ke = 'ja', konteks = '' } = {}) {
  const apiKey = await ambilKunci();
  if (!apiKey || !teks || !String(teks).trim()) return null;

  const bahasaTujuan = ke === 'id' ? 'Bahasa Indonesia' : 'Bahasa Jepang';
  const model = await ambilModel();

  const systemPrompt = [
    'Kamu adalah penerjemah profesional untuk dokumen lowongan kerja ke Jepang.',
    `Terjemahkan teks dari Bahasa Indonesia ke ${bahasaTujuan}.`,
    'Aturan:',
    '- Gunakan gaya natural, sopan, dan resmi (です・ます調 untuk bahasa Jepang).',
    '- Jangan menambah, mengurangi, atau mengubah fakta; hanya terjemahkan.',
    '- Jika teks berupa daftar bullet, pertahankan format baris/poinnya.',
    '- Jawab HANYA dengan hasil terjemahan, tanpa penjelasan tambahan.',
    '- Jangan menyalin atau menyertakan nama/label field ke dalam hasil terjemahan.',
  ].join('\n');

  const userContent = konteks
    ? `${konteks}\n\nTerjemahkan HANYA teks di bawah ini. Jangan sertakan label field, tanda kutip, atau penjelasan:\n${teks}`
    : `Terjemahkan HANYA teks di bawah ini. Jangan sertakan label atau penjelasan:\n${teks}`;

  try {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.2,
        max_tokens: 900,
      }),
    });

    if (!response.ok) {
      console.error('[aiClient] Groq error:', response.status, (await response.text()).slice(0, 200));
      return null;
    }
    const data = await response.json();
    const out = data.choices?.[0]?.message?.content?.trim();
    return out || null;
  } catch (err) {
    console.error('[aiClient] Error:', err.message);
    return null;
  }
}

module.exports = { terjemahkan, tersedia, ambilKunci, ambilModel, GROQ_MODEL_DEFAULT };
