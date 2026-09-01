'use strict';

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  const email = process.argv[2] || 'manager@edulearn.vn';
  const newPassword = process.argv[3] || 'admin123';

  console.log(`Updating password for email: "${email}" to: "${newPassword}"...`);

  try {
    const dbPath = path.join(__dirname, 'database.sqlite');
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      console.error(`Error: User with email "${email}" not found.`);
      await db.close();
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.run("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email]);

    console.log(`Success! Password for "${email}" has been reset to "${newPassword}".`);
    await db.close();
  } catch (error) {
    console.error('Error resetting password:', error);
  }
}

resetPassword();
