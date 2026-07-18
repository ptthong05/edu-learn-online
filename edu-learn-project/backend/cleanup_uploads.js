const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');

// List of unused files from the analysis
const unusedFiles = [
  'banner-1783756591047.png',
  'banner-1783756635939.png',
  'banner-1783756733008.png',
  'banner-1783756814726.png',
  'banner-1783756944644.png',
  'banner-1783764939746.png',
  'banner-1783764970054.png',
  'banner-1783764992112.png',
  'banner-1783765193506.png',
  'banner-1783765206277.png',
  'banner-1783772904079.png',
  'banner-1783773079233.png',
  'banner-1783773114616.png',
  'banner-1783786884573.png',
  'banner-1783787196342.png',
  'banner-1783787353424.png',
  'banner-1783787408255.png',
  'banner-1783787626931.png',
  'banner-1783787678508.png',
  'banner-1783788760895.png',
  'banner-1784032259411.jpg',
  'banner-1784032279981.jpg'
];

console.log('=== CLEANING UP UNUSED UPLOADS ===\n');

let deletedCount = 0;
let errorCount = 0;

unusedFiles.forEach(filename => {
  const filepath = path.join(uploadsDir, filename);
  
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log(`✓ Deleted: ${filename}`);
      deletedCount++;
    } else {
      console.log(`- Not found: ${filename}`);
    }
  } catch (err) {
    console.error(`✗ Error deleting ${filename}:`, err.message);
    errorCount++;
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Deleted: ${deletedCount} files`);
console.log(`Errors: ${errorCount} files`);
console.log(`Remaining in uploads: ${fs.readdirSync(uploadsDir).length} files`);
console.log('\nCleanup completed!');