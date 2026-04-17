import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

dotenv.config();

const initializeDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kandidat_db',
    port: parseInt(process.env.DB_PORT || '3306'),
  });

  console.log('Connected to MySQL database');

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'hrd', 'direktur') NOT NULL DEFAULT 'hrd',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS departments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS positions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      department_id INT,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS candidates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      email VARCHAR(100),
      phone VARCHAR(20),
      position_id INT,
      status ENUM('pending', 'interview', 'accepted', 'rejected') DEFAULT 'pending',
      cv_path VARCHAR(255),
      score DECIMAL(5,2) DEFAULT 0,
      interview_score INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS interviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      candidate_id INT,
      scheduled_at DATETIME,
      interviewer VARCHAR(100),
      notes TEXT,
      score INT DEFAULT 0,
      status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS placement_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      candidate_id INT,
      department_id INT,
      position_id INT,
      placed_by INT,
      placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE SET NULL,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
      FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL,
      FOREIGN KEY (placed_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
  if (users[0].count === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      ['admin', hashedPassword, 'admin']
    );
    const hrdPassword = await bcrypt.hash('hrd123', 10);
    await connection.execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      ['hrd', hrdPassword, 'hrd']
    );
    console.log('Default users created');
  }

  await connection.execute(`
    INSERT IGNORE INTO departments (name) VALUES 
    ('Engineering'), 
    ('Marketing'), 
    ('Human Resources'), 
    ('Finance'), 
    ('Operations')
  `);

  console.log('Database initialized successfully');
  await connection.end();
};

initializeDatabase().catch(console.error);
