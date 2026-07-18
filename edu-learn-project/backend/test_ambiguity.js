const { getDatabase } = require('./db');

async function test() {
  try {
    const db = await getDatabase();
    
    // Find a user who has completed orders
    const orders = await db.all("SELECT id, user_id, created_at, status FROM orders WHERE status = 'completed'");
    if (orders.length === 0) {
      console.log("No completed orders found.");
      return;
    }
    const userId = orders[0].user_id;

    console.log("--- QUERY 1 (Current query with c.*) ---");
    const res1 = await db.all(`
      SELECT id, title, description, image, video_intro, price, sale_price, category_id, instructor, status, content_html, highlights, curriculum,
             MAX(orderDate) AS orderDate, orderId, price AS purchasedPrice
      FROM (
        SELECT c.*, NULL AS order_combo_id, o.id AS orderId, o.created_at AS orderDate, od.price AS price
        FROM courses c
        JOIN order_details od ON od.course_id = c.id
        JOIN orders o ON o.id = od.order_id
        WHERE o.user_id = ? AND o.status = 'completed'
        
        UNION ALL
        
        SELECT c.*, cd.combo_id AS order_combo_id, o.id AS orderId, o.created_at AS orderDate, c.price AS price
        FROM courses c
        JOIN combo_details cd ON cd.course_id = c.id
        JOIN order_details od ON od.course_id = cd.combo_id
        JOIN orders o ON o.id = od.order_id
        WHERE o.user_id = ? AND o.status = 'completed'
      )
      GROUP BY id
      ORDER BY orderDate DESC
    `, [userId, userId]);
    console.log(res1.map(x => ({ id: x.id, title: x.title, orderDate: x.orderDate })));

    console.log("\n--- QUERY 2 (Explicit columns) ---");
    const res2 = await db.all(`
      SELECT id, title, description, image, video_intro, price, sale_price, category_id, instructor, status, content_html, highlights, curriculum,
             MAX(orderDate) AS orderDate, orderId, purchasedPrice
      FROM (
        SELECT c.id, c.title, c.description, c.image, c.video_intro, c.price, c.sale_price, c.category_id, c.instructor, c.status, c.content_html, c.highlights, c.curriculum,
               NULL AS order_combo_id, o.id AS orderId, o.created_at AS orderDate, od.price AS purchasedPrice
        FROM courses c
        JOIN order_details od ON od.course_id = c.id
        JOIN orders o ON o.id = od.order_id
        WHERE o.user_id = ? AND o.status = 'completed'
        
        UNION ALL
        
        SELECT c.id, c.title, c.description, c.image, c.video_intro, c.price, c.sale_price, c.category_id, c.instructor, c.status, c.content_html, c.highlights, c.curriculum,
               cd.combo_id AS order_combo_id, o.id AS orderId, o.created_at AS orderDate, c.price AS purchasedPrice
        FROM courses c
        JOIN combo_details cd ON cd.course_id = c.id
        JOIN order_details od ON od.course_id = cd.combo_id
        JOIN orders o ON o.id = od.order_id
        WHERE o.user_id = ? AND o.status = 'completed'
      )
      GROUP BY id
      ORDER BY orderDate DESC
    `, [userId, userId]);
    console.log(res2.map(x => ({ id: x.id, title: x.title, orderDate: x.orderDate })));

  } catch (error) {
    console.error(error);
  }
}
test();
