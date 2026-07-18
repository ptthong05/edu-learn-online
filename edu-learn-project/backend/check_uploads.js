const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');
const uploadsDir = path.join(__dirname, 'uploads');

console.log('=== CHECKING UPLOADS FOLDER ===\n');

// Check if uploads folder exists
if (!fs.existsSync(uploadsDir)) {
  console.log('Uploads folder does not exist. Safe to create or ignore.');
  process.exit(0);
}

// Get all files in uploads folder
const files = fs.readdirSync(uploadsDir);
console.log(`Files in uploads folder: ${files.length}`);
files.forEach(f => console.log(`  - ${f}`));

// Open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('\nConnected to database\n');
});

// Check all tables that might contain image references
const tablesToCheck = [
  { table: 'home_banner_settings', column: 'image_url' },
  { table: 'courses', column: 'image' },
  { table: 'blogs', column: 'image' },
  { table: 'combos', column: 'image' },
  { table: 'payment_methods', column: 'qr_code_image' },
  { table: 'users', column: 'avatar' },
  { table: 'orders', column: 'payment_proof' }
];

let usedFiles = new Set();

tablesToCheck.forEach(({ table, column }) => {
  db.all(`SELECT ${column} as img FROM ${table} WHERE ${column} IS NOT NULL AND ${column} != ''`, (err, rows) => {
    if (err) {
      console.error(`Error checking ${table}.${column}:`, err);
      return;
    }
    
    rows.forEach(row => {
      if (row.img) {
        try {
          // Extract filename from URL
          const url = new URL(row.img);
          const filename = path.basename(url.pathname);
          if (filename) {
            usedFiles.add(filename);
          }
        } catch (e) {
          // If not a valid URL, might be a direct filename
          if (row.img.includes('/')) {
            const parts = row.img.split('/');
            const filename = parts[parts.length - 1];
            if (filename) usedFiles.add(filename);
          } else {
            usedFiles.add(row.img);
          }
        }
      }
    });
  });
});

// Wait for queries to complete
setTimeout(() => {
  console.log('\n=== IMAGES USED IN DATABASE ===\n');
  usedFiles.forEach(f => console.log(`  ✓ ${f}`));
  
  console.log('\n=== ANALYSIS ===\n');
  
  const unusedFiles = files.filter(f => !usedFiles.has(f));
  const usedInDb = files.filter(f => usedFiles.has(f));
  
  console.log(`Total files in uploads: ${files.length}`);
  console.log(`Used in database: ${usedInDb.length}`);
  console.log(`Not referenced in DB: ${unusedFiles.length}`);
  
  if (unusedFiles.length > 0) {
    console.log('\nUnused files (can be safely deleted):');
    unusedFiles.forEach(f => console.log(`  ✗ ${f}`));
  }
  
  if (usedInDb.length > 0) {
    console.log('\nFiles in use (DO NOT DELETE):');
    usedInDb.forEach(f => console.log(`  ✓ ${f}`));
  }
  
  console.log('\n=== RECOMMENDATION ===\n');
  if (unusedFiles.length === files.length) {
    console.log('✓ SAFE TO DELETE: No files in uploads folder are referenced in database.');
    console.log('  You can delete the entire uploads folder.');
  } else if (unusedFiles.length > 0) {
    console.log('⚠ PARTIAL DELETE: Some files are in use.');
    console.log('  You can delete only the unused files listed above.');
  } else {
    console.log('✗ DO NOT DELETE: All files are in use in the database.');
  }
  
  db.close();
}, 500);