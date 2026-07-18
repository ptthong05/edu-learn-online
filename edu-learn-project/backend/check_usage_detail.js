const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

// Check home_banner_settings
db.all("SELECT id, image_url, title_line1, title_line2 FROM home_banner_settings", (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('=== HOME BANNER SETTINGS ===\n');
  rows.forEach(row => {
    console.log(`ID: ${row.id}`);
    console.log(`Title: ${row.title_line1} - ${row.title_line2}`);
    console.log(`Image: ${row.image_url}\n`);
  });
  
  // Check courses
  db.all("SELECT id, title, image FROM courses WHERE image LIKE '%banner-%' OR image LIKE '%uploads%'", (err, courses) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    
    console.log('\n=== COURSES USING UPLOADED IMAGES ===\n');
    courses.forEach(course => {
      console.log(`Course: ${course.title}`);
      console.log(`Image: ${course.image}\n`);
    });
    
    // Check blogs
    db.all("SELECT id, title, image FROM blogs WHERE image LIKE '%banner-%' OR image LIKE '%uploads%'", (err, blogs) => {
      if (err) {
        console.error('Error:', err);
        return;
      }
      
      console.log('\n=== BLOGS USING UPLOADED IMAGES ===\n');
      blogs.forEach(blog => {
        console.log(`Blog: ${blog.title}`);
        console.log(`Image: ${blog.image}\n`);
      });
      
      // Check combos
      db.all("SELECT id, title, image FROM combos WHERE image LIKE '%banner-%' OR image LIKE '%uploads%'", (err, combos) => {
        if (err) {
          console.error('Error:', err);
          return;
        }
        
        console.log('\n=== COMBOS USING UPLOADED IMAGES ===\n');
        combos.forEach(combo => {
          console.log(`Combo: ${combo.title}`);
          console.log(`Image: ${combo.image}\n`);
        });
        
        db.close();
      });
    });
  });
});