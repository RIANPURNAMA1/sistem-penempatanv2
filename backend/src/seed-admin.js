const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedAdmin = async () => {
  let connection;
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kandidat_db',
    });

    console.log('🌱 Seeding cabang...');
    await connection.query(`INSERT IGNORE INTO cabang (nama_cabang, kode_cabang, kota, status) VALUES 
      ('Kantor Pusat', 'PUSAT', 'Jakarta', 'aktif'),
      ('Cabang Bandung', 'BDG', 'Bandung', 'aktif'),
      ('Cabang Surabaya', 'SBY', 'Surabaya', 'aktif')`);

    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    console.log('👤 Seeding admin_penempatan...');
    await connection.query(
      `INSERT INTO users (nama, email, password, role, cabang_id) 
       VALUES (?, ?, ?, ?, NULL)
       ON DUPLICATE KEY UPDATE password = ?, nama = ?, email = ?, role = ?`,
      ['Admin Penempatan', 'adminpenempatan@gmail.com', hashedPassword, 'admin_penempatan', hashedPassword, 'Admin Penempatan', 'adminpenempatan@gmail.com', 'admin_penempatan']
    );

    console.log('✅ Admin seeded successfully!');
    console.log('   Email: adminpenempatan@gmail.com');
    console.log('   Password: admin123');

    console.log('🔐 Hashing developer password...');
    const devHash = await bcrypt.hash('Naonweahkepo123!', 10);

    console.log('👤 Seeding developer...');
    await connection.query(
      `INSERT INTO users (nama, email, password, role, cabang_id, status) 
       VALUES (?, ?, ?, ?, NULL, 'aktif')
       ON DUPLICATE KEY UPDATE password = ?, nama = ?, role = ?, status = 'aktif'`,
      ['IT Mendunia', 'itmendunia@gmail.com', devHash, 'developer', devHash, 'IT Mendunia', 'developer']
    );

    console.log('✅ Developer seeded successfully!');
    console.log('   Email: itmendunia@gmail.com');
    console.log('   Password: Naonweahkepo123!');
  } catch (error) {
    console.error('❌ Seed admin failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
};

seedAdmin();