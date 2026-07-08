const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function fixPasswords() {
  try {
    const [users] = await pool.query(
      "SELECT id, nama, email FROM users WHERE role = 'kandidat'"
    );
    console.log(`Ditemukan ${users.length} user kandidat.\n`);

    const hashedPassword = await bcrypt.hash('1-8', 10);
    let updated = 0;

    for (const user of users) {
      const valid = await bcrypt.compare('1-8', user.password || '');
      if (!valid) {
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
        console.log(`  UPDATE: ${user.nama} (${user.email})`);
        updated++;
      }
    }

    console.log(`\nSelesai. ${updated} user diupdate ke password "1-8".`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixPasswords();
