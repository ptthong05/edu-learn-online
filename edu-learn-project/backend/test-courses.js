const { getDatabase } = require('./db');

async function test() {
  try {
    const db = await getDatabase();
    const result = await db.all("SELECT COUNT(*) as count FROM courses WHERE status IN ('published', 'inactive')");
    console.log('Total courses:', result[0].count);
    
    const courses = await db.all("SELECT id, title, status FROM courses LIMIT 5");
    console.log('Sample courses:', courses);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();