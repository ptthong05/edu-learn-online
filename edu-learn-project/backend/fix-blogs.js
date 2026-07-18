const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function fix() {
  const db = await open({ filename: path.join(__dirname, 'database.sqlite'), driver: sqlite3.Database });

  const updates = [
    {
      id: 'blog-1',
      title: '\u0048\u0061\u0068\u0068 \u0074\u0072\u0061\u006e\u0067 \u0063\u1ea7\u006e \u0063\u0068\u0075\u1ea9\u006e \u0062\u1ecb \u0074\u0072\u01b0\u1edbcL \u006b\u0068\u0069 \u201c\u006e\u0068\u1ea3\u0079 \u006e\u0067\u00e0\u006e\u0068\u201d',
      excerpt: '\u0043\u0068\u0075\u0079\u1ec3\u006e \u006e\u0067\u00e0\u006e\u0068 \u0073\u0061\u006e\u0067 \u006c\u0129\u006e\u0068 \u0076\u1ef1\u0063 \u0063\u00f4\u006e\u0067 \u006e\u0067\u0068\u1ec7 \u006b\u0068\u00f4\u006e\u0067 \u0062\u0061\u006f \u0067\u0069\u1edd \u006c\u00e0 \u006d\u0075\u1ed9n n\u1ebfu \u0062\u1ea1\u006e \u0063\u00f3 \u0073\u1ef1 \u0063\u0068\u0075\u1ea9\u006e \u0062\u1ecb \u006b\u1ef9 \u0063\u00e0\u006e\u0067.'
    }
  ];

  // Update with correct Vietnamese titles using direct SQL
  await db.run(`UPDATE blogs SET 
    title = 'H\u00e0nh trang c\u1ea7n chu\u1ea9n b\u1ecb tr\u01b0\u1edbc khi "nh\u1ea3y ng\u00e0nh"',
    excerpt = 'Chuy\u1ec3n ng\u00e0nh sang l\u0129nh v\u1ef1c c\u00f4ng ngh\u1ec7 kh\u00f4ng bao gi\u1edd l\u00e0 mu\u1ed9n n\u1ebfu b\u1ea1n c\u00f3 s\u1ef1 chu\u1ea9n b\u1ecb k\u1ef9 c\u00e0ng. B\u00e0i vi\u1ebft n\u00e0y s\u1ebd chia s\u1ebb nh\u1eefng \u0111i\u1ec1u b\u1ea1n c\u1ea7n l\u00e0m tr\u01b0\u1edbc khi b\u1eaft \u0111\u1ea7u h\u00e0nh tr\u00ecnh.'
    WHERE id = 'blog-1'`);

  await db.run(`UPDATE blogs SET
    title = 'B\u1ea1n \u0111\u00e3 bi\u1ebft c\u00e1ch ch\u1ea1y qu\u1ea3ng c\u00e1o Facebook Ads ch\u01b0a?',
    excerpt = 'Facebook Ads l\u00e0 c\u00f4ng c\u1ee5 marketing m\u1ea1nh m\u1ebd gi\u00fap ti\u1ebfp c\u1eadn h\u00e0ng tri\u1ec7u kh\u00e1ch h\u00e0ng ti\u1ec1m n\u0103ng. H\u00e3y c\u00f9ng kh\u00e1m ph\u00e1 nh\u1eefng b\u00ed quy\u1ebft \u0111\u1ec3 t\u1ed1i \u01b0u chi ph\u00ed v\u00e0 t\u0103ng hi\u1ec7u qu\u1ea3 chi\u1ebfn d\u1ecbch.',
    image = 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&q=80'
    WHERE id = 'blog-2'`);

  await db.run(`UPDATE blogs SET
    title = 'C\u00f3 n\u00ean \u0111\u1ea7u t\u01b0 v\u00e0o ti\u1ec1n \u1ea3o kh\u00f4ng? Nh\u1eefng k\u00eanh \u0111\u1ea7u t\u01b0 h\u1ea5p d\u1eabn n\u0103m 2025',
    excerpt = 'Th\u1ecb tr\u01b0\u1eddng ti\u1ec1n \u0111i\u1ec7n t\u1eed ng\u00e0y c\u00e0ng thu h\u00fat nhi\u1ec1u nh\u00e0 \u0111\u1ea7u t\u01b0. B\u00e0i vi\u1ebft ph\u00e2n t\u00edch \u01b0u nh\u01b0\u1ee3c \u0111i\u1ec3m v\u00e0 nh\u1eefng \u0111i\u1ec1u c\u1ea7n bi\u1ebft tr\u01b0\u1edbc khi quy\u1ebft \u0111\u1ecbnh \u0111\u1ea7u t\u01b0 v\u00e0o crypto.',
    image = 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80'
    WHERE id = 'blog-3'`);

  const all = await db.all('SELECT id, title, excerpt FROM blogs');
  console.log('Updated blogs:');
  all.forEach(b => console.log(`- ${b.id}: ${b.title}`));
  await db.close();
}

fix().catch(console.error);
