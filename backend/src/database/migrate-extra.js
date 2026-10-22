const mysql = require('mysql2/promise');
require('dotenv').config();

const TABLES = {
  institusi: `
    CREATE TABLE IF NOT EXISTS institusi (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nama VARCHAR(200) NOT NULL,
      deskripsi TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
  sys_settings: `
    CREATE TABLE IF NOT EXISTS sys_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value TEXT,
      setting_type VARCHAR(20) DEFAULT 'string',
      description VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
  password_resets: `
    CREATE TABLE IF NOT EXISTS password_resets (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      otp VARCHAR(10) NOT NULL,
      expired_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
  api_clients: `
    CREATE TABLE IF NOT EXISTS api_clients (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nama_sistem VARCHAR(200) NOT NULL,
      api_key VARCHAR(100) UNIQUE NOT NULL,
      active TINYINT(1) DEFAULT 1,
      last_used_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
  cv_template: `
    CREATE TABLE IF NOT EXISTS cv_template (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nama_template VARCHAR(200) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      path_file VARCHAR(500) NOT NULL,
      mime_type VARCHAR(100) DEFAULT 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ukuran_file INT DEFAULT NULL,
      jumlah_placeholder INT DEFAULT 0,
      mapping LONGTEXT,
      options LONGTEXT,
      is_active TINYINT(1) DEFAULT 0,
      created_by INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_cv_template_active (is_active)
    )`,
  cv_generated: `
    CREATE TABLE IF NOT EXISTS cv_generated (
      id INT PRIMARY KEY AUTO_INCREMENT,
      kandidat_id INT NOT NULL,
      cv_template_id INT DEFAULT NULL,
      file_name VARCHAR(255) NOT NULL,
      path_file VARCHAR(500) NOT NULL,
      mime_type VARCHAR(100) DEFAULT 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      warnings LONGTEXT,
      created_by INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      KEY idx_cv_generated_kandidat (kandidat_id),
      FOREIGN KEY (kandidat_id) REFERENCES kandidat_profil(id) ON DELETE CASCADE
    )`,
  kandidat_terjemahan: `
    CREATE TABLE IF NOT EXISTS kandidat_terjemahan (
      id INT PRIMARY KEY AUTO_INCREMENT,
      kandidat_id INT NOT NULL,
      field_key VARCHAR(100) NOT NULL,
      bahasa VARCHAR(10) NOT NULL DEFAULT 'ja',
      teks TEXT,
      sumber VARCHAR(20) DEFAULT 'manual',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_kandidat_terjemahan (kandidat_id, field_key, bahasa),
      FOREIGN KEY (kandidat_id) REFERENCES kandidat_profil(id) ON DELETE CASCADE
    )`
};

const COLUMNS = {
  kandidat_profil: {
    institusi: 'VARCHAR(200) NULL',
    status_interview: 'VARCHAR(50) NULL',
    promosi_diri: 'TEXT NULL',
    catatan_tambahan: 'TEXT NULL'
  },
  job_order: {
    institusi: 'VARCHAR(200) NULL'
  },
  kandidat_pendidikan: {
    jenjang_detail: 'VARCHAR(50) NULL'
  },
  cv_generated: {
    bahasa: 'VARCHAR(10) NULL'
  }
};

const tableExists = async (conn, table) => {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS c FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  );
  return rows[0].c > 0;
};

const columnExists = async (conn, table, column) => {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].c > 0;
};

const migrate = async () => {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kandidat_db'
    });

    for (const [name, sql] of Object.entries(TABLES)) {
      await conn.query(sql);
      console.log(`✅ Tabel ${name} siap`);
    }

    for (const [table, cols] of Object.entries(COLUMNS)) {
      if (!(await tableExists(conn, table))) {
        console.log(`⚠️  Tabel ${table} tidak ada, lewati kolom`);
        continue;
      }
      for (const [column, type] of Object.entries(cols)) {
        if (await columnExists(conn, table, column)) {
          console.log(`- ${table}.${column} sudah ada`);
          continue;
        }
        await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${type}`);
        console.log(`✅ ${table}.${column} ditambahkan`);
      }
    }

    console.log('\n🎉 Migrasi tambahan selesai!');
  } catch (err) {
    console.error('❌ Migrasi gagal:', err.message);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
};

migrate();
