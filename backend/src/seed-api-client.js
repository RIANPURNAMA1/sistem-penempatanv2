const crypto = require('crypto');
const pool = require('./config/database');

const namaSistem = process.argv[2] || 'Sistem Eksternal';

(async () => {
  try {
    const apiKey = `mendunia_${crypto.randomBytes(24).toString('hex')}`;

    await pool.query(
      'INSERT INTO api_clients (nama_sistem, api_key) VALUES (?, ?)',
      [namaSistem, apiKey]
    );

    console.log('====================================================');
    console.log('✅ API Key berhasil dibuat');
    console.log('Nama sistem :', namaSistem);
    console.log('API key     :', apiKey);
    console.log('');
    console.log('Gunakan di header request sistem lain:');
    console.log('x-api-key: ' + apiKey);
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Gagal membuat API key:', err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
})();
