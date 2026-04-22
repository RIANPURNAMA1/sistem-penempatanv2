const mysql = require('mysql2/promise');
require('dotenv').config();

const truncateTables = async () => {
  let connection;
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kandidat_db',
    });

    console.log('📦 Truncating all tables...\n');

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    const tables = [
      'notification_logs',
      'pendaftaran_sistem_lama',
      'cv_data',
      'job_order_kandidat',
      'job_order',
      'kandidat_dokumen',
      'kandidat_keluarga',
      'kandidat_pengalaman_kerja',
      'kandidat_pendidikan',
      'kandidat_profil',
      'users',
      'perusahaan',
      'cabang'
    ];

    for (const table of tables) {
      try {
        await connection.query(`TRUNCATE TABLE ${table}`);
        console.log(`✅ Truncated: ${table}`);
      } catch (err) {
        console.log(`⚠️  Skipped: ${table} (${err.message})`);
      }
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n🎉 All tables truncated!');
  } catch (error) {
    console.error('❌ Truncate failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
};

truncateTables();