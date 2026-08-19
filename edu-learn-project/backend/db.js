const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

let db;

async function getDatabase() {
  if (db) return db;
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });
  return db;
}

async function initDatabase() {
  const database = await getDatabase();

  // Create Users Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      avatar TEXT,
      role TEXT NOT NULL DEFAULT 'USER', -- USER, MANAGER, STAFF, AFFILIATE
      status TEXT NOT NULL DEFAULT 'active', -- active, blocked
      must_change_password INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);

  // Keep existing local databases compatible with the phone field.
  const userColumns = await database.all('PRAGMA table_info(users)');
  if (!userColumns.some(column => column.name === 'phone')) {
    await database.exec('ALTER TABLE users ADD COLUMN phone TEXT');
  }

  // Create password reset tokens table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Create Category Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);

  // Seed default course categories (INSERT OR IGNORE keeps existing data safe)
  await database.run(`
    INSERT OR IGNORE INTO categories (id, name) VALUES
      ('cat-1', 'Lập trình Web'),
      ('cat-2', 'UI/UX Design'),
      ('cat-3', 'Marketing Online'),
      ('cat-4', 'Kinh doanh'),
      ('cat-5', 'Lập trình Python'),
      ('cat-6', 'Data Science'),
      ('cat-7', 'Mobile App'),
      ('cat-8', 'DevOps / Cloud')
  `);

  // Create Course Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      image TEXT,
      video_intro TEXT,
      price INTEGER NOT NULL,
      sale_price INTEGER,
      category_id TEXT,
      instructor TEXT,
      status TEXT DEFAULT 'published', -- published, hidden
      content_html TEXT DEFAULT '',
      highlights TEXT DEFAULT '[]',
      curriculum TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )
  `);

  try {
    await database.exec(`ALTER TABLE courses ADD COLUMN content_html TEXT DEFAULT ''`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await database.exec(`ALTER TABLE courses ADD COLUMN highlights TEXT DEFAULT '[]'`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await database.exec(`ALTER TABLE courses ADD COLUMN curriculum TEXT DEFAULT '[]'`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await database.exec(`ALTER TABLE courses ADD COLUMN created_at TEXT DEFAULT '2026-07-18 00:00:00'`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Create Combo Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS combos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      image TEXT,
      description TEXT,
      price INTEGER NOT NULL,
      sale_price INTEGER,
      status TEXT DEFAULT 'active'
    )
  `);

  try {
    await database.exec(`ALTER TABLE combos ADD COLUMN status TEXT DEFAULT 'active'`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Create Combo Detail Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS combo_details (
      combo_id TEXT,
      course_id TEXT,
      PRIMARY KEY (combo_id, course_id),
      FOREIGN KEY (combo_id) REFERENCES combos (id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    )
  `);

  // Create Orders Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      total INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT DEFAULT 'pending', -- pending, completed, cancelled
      payment_status TEXT DEFAULT 'chua_thanh_toan', -- chua_thanh_toan, da_thanh_toan
      payment_proof TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  try {
    await database.exec("ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'chua_thanh_toan'");
  } catch (err) {
    // Column already exists, ignore error
  }

  // Create Order Details Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS order_details (
      order_id TEXT,
      course_id TEXT,
      price INTEGER NOT NULL,
      PRIMARY KEY (order_id, course_id),
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses (id)
    )
  `);

  // Create Reviews Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      course_id TEXT,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (course_id) REFERENCES courses (id)
    )
  `);

  // Create Coupons Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      used_count INTEGER DEFAULT 0,
      expired_date TEXT NOT NULL,
      status TEXT DEFAULT 'active', -- active, inactive
      usable_by TEXT DEFAULT 'user', -- user, affiliate
      description TEXT,
      max_discount INTEGER DEFAULT 0, -- maximum discount amount in VND (0 = no limit)
      min_order_amount INTEGER DEFAULT 0 -- minimum order amount in VND (0 = no minimum)
    )
  `);

  // Create Banners Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      title TEXT,
      image TEXT,
      link TEXT,
      display_order INTEGER,
      status TEXT DEFAULT 'active'
    )
  `);

  // Create Home Banner Settings Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS home_banner_settings (
      id TEXT PRIMARY KEY,
      title_line1 TEXT,
      title_line2 TEXT,
      title_line3 TEXT,
      description TEXT,
      badge_text TEXT,
      floating_badge_title TEXT,
      floating_badge_subtitle TEXT,
      stat1_value TEXT,
      stat1_label TEXT,
      stat2_value TEXT,
      stat2_label TEXT,
      stat3_value TEXT,
      stat3_label TEXT,
      image_url TEXT
    )
  `);

  // Create Contact Info Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS contact_info (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      value TEXT NOT NULL
    )
  `);

  // Content managed from the administration area.
  await database.exec(`
    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);

  await database.exec(`
    CREATE TABLE IF NOT EXISTS site_pages (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Five independent tables for footer/support content.
  await database.exec(`CREATE TABLE IF NOT EXISTS terms_of_service (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', content TEXT NOT NULL, updated_at TEXT NOT NULL
  )`);
  await database.exec(`CREATE TABLE IF NOT EXISTS purchase_guides (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', content TEXT NOT NULL, updated_at TEXT NOT NULL
  )`);
  await database.exec(`CREATE TABLE IF NOT EXISTS introductions (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', content TEXT NOT NULL, updated_at TEXT NOT NULL
  )`);
  await database.exec(`CREATE TABLE IF NOT EXISTS contact_settings (
    id TEXT PRIMARY KEY, title TEXT NOT NULL DEFAULT 'Liên hệ', description TEXT NOT NULL DEFAULT '', address TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL, content TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL
  )`);
  await database.exec(`CREATE TABLE IF NOT EXISTS faq_settings (
    id TEXT PRIMARY KEY, title TEXT NOT NULL DEFAULT 'Câu hỏi thường gặp', description TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL
  )`);

  // Create Blog Categories Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS blog_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // Create Blogs Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      image TEXT,
      created_at TEXT NOT NULL
    )
  `);

  // Create Affiliates Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS affiliates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      bank_account TEXT NOT NULL,
      address TEXT NOT NULL,
      dob TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      affiliate_email TEXT,
      ctv_code TEXT,
      ma_ctv TEXT,
      affiliate_link TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Create Affiliate Commissions Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS affiliate_commissions (
      course_id TEXT PRIMARY KEY,
      commission_rate REAL DEFAULT 15.0,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )
  `);

  // Create Affiliate Notifications Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS affiliate_notifications (
      id TEXT PRIMARY KEY,
      affiliate_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      buyer_name TEXT,
      amount INTEGER,
      commission INTEGER,
      read_by_affiliate INTEGER DEFAULT 0,
      read_by_admin INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (affiliate_id) REFERENCES affiliates(id)
    )
  `);

  // Create Withdrawal Requests Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS withdrawal_requests (
      id TEXT PRIMARY KEY,
      affiliate_id TEXT NOT NULL,
      ctv_code TEXT,
      amount INTEGER NOT NULL,
      bank_name TEXT NOT NULL,
      bank_account TEXT NOT NULL,
      account_holder TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      status TEXT DEFAULT 'pending', -- pending, completed, rejected
      admin_note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      FOREIGN KEY (affiliate_id) REFERENCES affiliates(id)
    )
  `);

  // Create Affiliate Revenues Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS affiliate_revenues (
      id TEXT PRIMARY KEY,
      affiliate_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      buyer_name TEXT,
      order_total INTEGER NOT NULL,
      commission_rate REAL DEFAULT 15.0,
      commission_amount INTEGER NOT NULL,
      status TEXT DEFAULT 'pending', -- pending, approved, paid, cancelled
      created_at TEXT NOT NULL,
      FOREIGN KEY (affiliate_id) REFERENCES affiliates(id),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);

  // Create Affiliate Clicks Table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS affiliate_clicks (
      id TEXT PRIMARY KEY,
      affiliate_id TEXT NOT NULL,
      url TEXT NOT NULL,
      ip TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (affiliate_id) REFERENCES affiliates(id)
    )
  `);

  // Run migrations for existing DBs
  try {
    await database.exec("ALTER TABLE affiliates ADD COLUMN affiliate_email TEXT");
  } catch (err) {
    // Column already exists, ignore error
  }
  try {
    await database.exec("ALTER TABLE affiliates ADD COLUMN ctv_code TEXT");
  } catch (err) {
    // Column already exists, ignore error
  }
  try {
    await database.exec("ALTER TABLE affiliates ADD COLUMN ma_ctv TEXT");
  } catch (err) {
    // Column already exists, ignore error
  }
  try {
    await database.exec("ALTER TABLE affiliates ADD COLUMN affiliate_link TEXT");
  } catch (err) {
    // Column already exists, ignore error
  }
  try {
    await database.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliates_ctv_code ON affiliates (ctv_code)");
  } catch (err) {
    // Ignore error
  }
  try {
    await database.exec("ALTER TABLE contact_settings ADD COLUMN title TEXT DEFAULT 'Liên hệ'");
  } catch (err) {
    // Column already exists, ignore error
  }
  try {
    await database.exec("ALTER TABLE contact_settings ADD COLUMN content TEXT DEFAULT ''");
  } catch (err) {
    // Column already exists, ignore error
  }
  try {
    await database.exec("ALTER TABLE terms_of_service ADD COLUMN description TEXT DEFAULT ''");
  } catch (err) {
    // Column already exists, ignore error
  }
  try {
    await database.exec("ALTER TABLE purchase_guides ADD COLUMN description TEXT DEFAULT ''");
  } catch (err) {
    // Column already exists, ignore error
  }
  try {
    await database.exec("ALTER TABLE introductions ADD COLUMN description TEXT DEFAULT ''");
  } catch (err) {
    // Column already exists, ignore error
  }
  try {
    await database.exec("ALTER TABLE contact_settings ADD COLUMN description TEXT DEFAULT ''");
  } catch (err) {
    // Column already exists, ignore error
  }
  try {
    await database.exec("ALTER TABLE withdrawal_requests ADD COLUMN ctv_code TEXT");
  } catch (err) {
    // Column already exists, ignore error
  }

  // These defaults are also added to databases that were created before the
  // website-content feature existed.
  const now = new Date().toISOString();
  await database.run(`INSERT OR IGNORE INTO contact_info (id, type, value) VALUES
    ('footer-address', 'address', 'Hồ Chí Minh, Việt Nam'),
    ('footer-phone', 'phone', '0932525650'),
    ('footer-email', 'email', 'ptthong.www@gmail.com')`);
  await database.run(`INSERT OR IGNORE INTO site_pages (slug, title, content, updated_at) VALUES
    ('dieu-khoan-dich-vu', 'Điều khoản dịch vụ', '<p>Nội dung điều khoản dịch vụ sẽ được quản trị viên cập nhật tại đây.</p>', ?),
    ('gioi-thieu', 'Giới thiệu', '<p>Chào mừng bạn đến với Khoá Học Giá Rẻ Drive.</p>', ?)`, [now, now]);
  await database.run(`INSERT OR IGNORE INTO faqs (id, question, answer, display_order, created_at) VALUES
    ('faq-default-1', 'Làm thế nào để mua khoá học?', '<p>Bạn chọn khoá học, thêm vào giỏ hàng và hoàn tất thanh toán theo hướng dẫn.</p>', 1, ?),
    ('faq-default-2', 'Sau khi thanh toán tôi học ở đâu?', '<p>Khoá học sẽ xuất hiện trong mục khoá học của tôi sau khi đơn hàng được kích hoạt.</p>', 2, ?)`, [now, now]);
  await database.run(`INSERT OR IGNORE INTO terms_of_service (id, title, content, updated_at)
    SELECT 'terms-main', title, content, ? FROM site_pages WHERE slug = 'dieu-khoan-dich-vu'`, [now]);
  await database.run(`INSERT OR IGNORE INTO introductions (id, title, content, updated_at)
    SELECT 'introduction-main', title, content, ? FROM site_pages WHERE slug = 'gioi-thieu'`, [now]);
  await database.run(`INSERT OR IGNORE INTO purchase_guides (id, title, content, updated_at) VALUES
    ('guide-main', 'Hướng dẫn mua hàng', '<p>Chọn khóa học, thêm vào giỏ hàng và hoàn tất thanh toán theo hướng dẫn.</p>', ?)`, [now]);
  await database.run(`INSERT OR IGNORE INTO contact_settings (id, title, address, phone, email, content, updated_at) VALUES
    ('contact-main', 'Liên hệ', 'Hồ Chí Minh, Việt Nam', '0932525650', 'ptthong.www@gmail.com', '<p>Chào mừng bạn đến với DRIVE MH. Hãy liên hệ với chúng tôi qua thông tin bên dưới.</p>', ?)`, [now]);
  await database.run(`UPDATE contact_settings SET title = 'Liên hệ', content = '<p>Chào mừng bạn đến với DRIVE MH. Hãy liên hệ với chúng tôi qua thông tin bên dưới.</p>' WHERE id = 'contact-main' AND (content IS NULL OR content = '')`);
  await database.run(`INSERT OR IGNORE INTO faq_settings (id, title, description, updated_at) VALUES
    ('faq-main', 'Câu hỏi thường gặp', 'Tìm nhanh câu trả lời cho các thắc mắc về khóa học và thanh toán.', ?)`, [now]);
  try {
    await database.exec("ALTER TABLE order_details ADD COLUMN product_name TEXT");
  } catch (err) {
    // Column already exists, ignore error
  }
  try {
    await database.exec("ALTER TABLE orders ADD COLUMN payment_proof TEXT");
  } catch (err) {
    // Column already exists, ignore error
  }
  try {
    await database.exec("ALTER TABLE blogs ADD COLUMN category_id TEXT");
  } catch (err) {
    // Column already exists, ignore error
  }
  try {
    await database.exec("ALTER TABLE blogs ADD COLUMN toc TEXT");
  } catch (err) {
    // Column already exists, ignore error
  }
  try {
    await database.exec("ALTER TABLE orders ADD COLUMN payment_qr_content TEXT");
  } catch (err) {
    // Column already exists, ignore error
  }
  await database.run(`INSERT OR IGNORE INTO blog_categories (id, name, created_at) VALUES
    ('cat-learning', 'Học tập', ?),
    ('cat-news', 'Tin tức', ?),
    ('cat-events', 'Sự kiện', ?)`, [now, now, now]);
  await database.run(`
    UPDATE order_details
    SET product_name = (
      SELECT title FROM courses WHERE courses.id = order_details.course_id
    )
    WHERE product_name IS NULL
  `);

  // Seed default admin accounts if they don't exist
  const adminCheck = await database.get("SELECT * FROM users WHERE email = 'manager@edulearn.vn'");
  if (!adminCheck) {
    const managerPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('staff123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const now = new Date().toISOString();

    await database.run(
      `INSERT INTO users (id, full_name, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['u-1', 'Nguyễn Văn A', 'manager@edulearn.vn', managerPassword, 'MANAGER', 'active', now]
    );
    await database.run(
      `INSERT INTO users (id, full_name, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['u-manager-alias', 'Admin Manager', 'manage@edulearn.vn', managerPassword, 'MANAGER', 'active', now]
    );
    await database.run(
      `INSERT INTO users (id, full_name, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['u-2', 'Trần Thị B', 'staff@edulearn.vn', staffPassword, 'STAFF', 'active', now]
    );
    await database.run(
      `INSERT INTO users (id, full_name, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['u-3', 'Nguyễn Minh Tuấn', 'tuan.nguyen@gmail.com', userPassword, 'USER', 'active', now]
    );

    // Seed default categories
    await database.run(`INSERT OR IGNORE INTO categories (id, name) VALUES ('cat-1', 'Lập trình Web')`);
    await database.run(`INSERT OR IGNORE INTO categories (id, name) VALUES ('cat-2', 'UI/UX Design')`);
    await database.run(`INSERT OR IGNORE INTO categories (id, name) VALUES ('cat-3', 'Marketing Online')`);

    // Seed default courses
    await database.run(`
      INSERT OR IGNORE INTO courses (id, title, description, image, video_intro, price, sale_price, category_id, instructor, status)
      VALUES (
        'course-1',
        'Lập trình Web Full Stack',
        'Khóa học lập trình web toàn diện từ HTML, CSS, JavaScript đến React, Node.js và MongoDB.',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        1200000,
        790000,
        'cat-1',
        'Nguyễn Văn A',
        'published'
      )
    `);

    await database.run(`
      INSERT OR IGNORE INTO courses (id, title, description, image, video_intro, price, sale_price, category_id, instructor, status)
      VALUES (
        'course-2',
        'UI/UX Design: Từ cơ bản đến nâng cao',
        'Học thiết kế UI/UX chuyên nghiệp với Figma.',
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        999000,
        699000,
        'cat-2',
        'Trần Thị B',
        'published'
      )
    `);

    // Seed default coupons
    await database.run(`
      INSERT OR IGNORE INTO coupons (id, code, discount, quantity, used_count, expired_date, status, usable_by, description)
      VALUES ('coup-1', 'SALE30', 30, 100, 10, '2026-12-31', 'active', 'user', 'Giảm giá 30% cho khách hàng mới mua khóa học.')
    `);
    // Seed default contact info
    await database.run(`
      INSERT OR IGNORE INTO contact_info (id, type, value)
      VALUES 
        ('contact-1', 'address', 'Tòa nhà Bitexco, Số 2 Hải Triều, Q.1, TP.HCM'),
        ('contact-2', 'phone', '1900 1234 5678'),
        ('contact-3', 'email', 'support@drivemh.vn'),
        ('contact-4', 'hours', '08:00 - 18:00 (Thứ 2 - Thứ 6)')
    `);

    // Seed default blogs
    const blogContent = '<p>Chào mừng bạn đến với DRIVE MH. Nền tảng học trực tuyến hàng đầu cung cấp kiến thức từ cơ bản đến chuyên sâu về các lĩnh vực công nghệ thông tin.</p><p>Học lập trình không bao giờ là muộn. Hãy bắt đầu hành trình của bạn ngay hôm nay cùng chúng tôi!</p>';
    await database.run(`
      INSERT OR IGNORE INTO blogs (id, title, excerpt, content, image, created_at)
      VALUES 
        ('blog-1', 'Bí quyết học lập trình hiệu quả', 'Khám phá các phương pháp học tập lập trình giúp bạn nhanh chóng thành thạo ngôn ngữ.', '${blogContent}', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80', '${now}'),
        ('blog-2', 'UI/UX Design Xu Hướng 2026', 'Cập nhật những xu hướng thiết kế giao diện và trải nghiệm người dùng mới nhất trong năm nay.', '${blogContent}', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80', '${now}'),
        ('blog-3', 'Tại sao bạn nên học Data Science', 'Khoa học dữ liệu đang là lĩnh vực hấp dẫn nhất thế kỷ 21. Tìm hiểu lý do tại sao.', '${blogContent}', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', '${now}')
    `);

    // Seed default home banner settings
    await database.run(`
      INSERT OR IGNORE INTO home_banner_settings (
        id, title_line1, title_line2, title_line3, description,
        badge_text, floating_badge_title, floating_badge_subtitle,
        stat1_value, stat1_label, stat2_value, stat2_label, stat3_value, stat3_label,
        image_url
      ) VALUES (
        'banner-main',
        'HỌC ONLINE',
        'CHỦ ĐỘNG THỜI GIAN',
        'NÂNG TẦM KỸ NĂNG',
        'Hàng nghìn khóa học chất lượng từ các chuyên gia. Từ cơ bản đến chuyên sâu.',
        'Hơn 1000+ khóa học chất lượng',
        'Học mọi lúc, mọi nơi',
        'Truy cập trọn đời sau khi mua',
        '1000+', 'Khóa học chất lượng',
        '200K+', 'Học viên tin tưởng',
        '50+', 'Danh mục đa dạng',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80'
      )
    `);
  }

  // Database Migrations for Coupons Table (Add usable_by & description if they do not exist)
  try {
    await database.exec(`ALTER TABLE coupons ADD COLUMN usable_by TEXT DEFAULT 'user'`);
  } catch (e) {
    // Column already exists
  }
  try {
    await database.exec(`ALTER TABLE coupons ADD COLUMN description TEXT`);
  } catch (e) {
    // Column already exists
  }
  try {
    await database.exec(`ALTER TABLE coupons ADD COLUMN discount_type TEXT DEFAULT 'percent'`);
  } catch (e) {
    // Column already exists
  }
  try {
    await database.exec(`ALTER TABLE coupons ADD COLUMN max_discount INTEGER DEFAULT 0`);
  } catch (e) {
    // Column already exists
  }
  try {
    await database.exec(`ALTER TABLE coupons ADD COLUMN min_order_amount INTEGER DEFAULT 0`);
  } catch (e) {
    // Column already exists
  }

  // Create Site Settings Table
  try {
    await database.exec(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id TEXT PRIMARY KEY,
        site_name TEXT NOT NULL DEFAULT 'DRIVE MH',
        site_tagline TEXT DEFAULT 'Nền tảng học trực tuyến hàng đầu',
        logo_url TEXT,
        favicon_url TEXT,
        primary_color TEXT DEFAULT '#2563eb',
        secondary_color TEXT DEFAULT '#1e40af',
        updated_at TEXT NOT NULL
      )
    `);

    const now = new Date().toISOString();
    await database.run(`INSERT OR IGNORE INTO site_settings (id, site_name, site_tagline, updated_at)
      VALUES ('settings-main', 'DRIVE MH', 'Nền tảng học trực tuyến hàng đầu', ?)`, [now]);
  } catch (e) {
    console.error("Error creating site_settings:", e);
  }

  // Create Affiliate Guides Table
  try {
    await database.exec(`
      CREATE TABLE IF NOT EXISTS affiliate_guides (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT
      )
    `);
    
    const guidesCount = await database.get("SELECT COUNT(*) as count FROM affiliate_guides");
    if (guidesCount.count === 0) {
      const nowStr = new Date().toISOString();
      await database.run(`
        INSERT INTO affiliate_guides (id, title, content, display_order, created_at)
        VALUES 
          ('guide-1', 'Hướng dẫn bắt đầu làm Tiếp thị liên kết', 'Chào mừng bạn đến với chương trình Affiliate của DRIVE MH! Để bắt đầu giới thiệu khóa học và nhận hoa hồng, hãy thực hiện các bước sau:\n\n1. Lấy mã tiếp thị liên kết (mã CTV) của bạn ở bảng điều khiển chính.\n2. Chia sẻ đường link giới thiệu của bạn cho bạn bè hoặc trên các mạng xã hội (Facebook, YouTube, TikTok, Zalo).\n3. Khi có người click vào link giới thiệu và mua khóa học thành công, bạn sẽ nhận được hoa hồng tự động từ 10% đến 30% giá trị đơn hàng.', 1, ?),
          ('guide-2', 'Quy định và Chính sách hoa hồng', 'Các quy định quan trọng khi tham gia chương trình Affiliate DRIVE MH:\n\n- Không tự đặt hàng qua link giới thiệu của chính mình.\n- Không chạy quảng cáo sử dụng các từ khóa thương hiệu DRIVE MH.\n- Hoa hồng sẽ được tính và phê duyệt tự động sau khi đơn hàng của học viên hoàn thành.\n- Bạn có thể yêu cầu rút tiền về tài khoản ngân hàng bất cứ lúc nào khi số dư khả dụng đạt tối thiểu 100.000đ.', 2, ?);
      `, [nowStr, nowStr]);
    }

    // Create Affiliate Settings Table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS affiliate_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    const termsExists = await database.get("SELECT COUNT(*) as count FROM affiliate_settings WHERE key = 'terms_content'");
    if (termsExists.count === 0) {
      await database.run(
        "INSERT INTO affiliate_settings (key, value) VALUES (?, ?)",
        ['terms_content', '<h3>Điều khoản và Dịch vụ chương trình Tiếp thị liên kết DRIVE MH</h3><p>Chào mừng bạn đến với chương trình Cộng tác viên (Affiliate) của DRIVE MH. Khi đăng ký tham gia chương trình, bạn cam kết tuân thủ các điều khoản sau:</p><ul><li><b>1. Cách thức hoạt động:</b> CTV chia sẻ đường dẫn giới thiệu hợp lệ. Khi học viên đăng ký qua link này và thanh toán thành công, hoa hồng sẽ được ghi nhận.</li><li><b>2. Tỷ lệ hoa hồng:</b> Hoa hồng sẽ được tính dựa trên phần trăm giá trị khóa học (thông thường từ 10% - 30% tùy quy định cụ thể của từng sản phẩm).</li><li><b>3. Nghiêm cấm hành vi gian lận:</b> Không được tự đặt mua khóa học thông qua link affiliate của chính mình; không chạy quảng cáo trực tiếp cạnh tranh từ khóa thương hiệu DRIVE MH.</li><li><b>4. Thanh toán:</b> Hoa hồng được phê duyệt sẽ cộng vào số dư CTV. CTV có quyền gửi yêu cầu rút tiền khi số dư tối thiểu đạt 100.000đ.</li></ul>']
      );
    }
  } catch (e) {
    console.error("Error creating/seeding affiliate_guides/settings:", e);
  }

  // Create Email Config Table
  try {
    await database.exec(`
      CREATE TABLE IF NOT EXISTS email_config (
        id TEXT PRIMARY KEY,
        service TEXT DEFAULT 'gmail',
        host TEXT DEFAULT 'smtp.gmail.com',
        port INTEGER DEFAULT 587,
        secure INTEGER DEFAULT 0,
        email TEXT NOT NULL,
        password TEXT DEFAULT '',
        from_name TEXT DEFAULT 'DRIVE MH - Học viện trực tuyến',
        updated_at TEXT NOT NULL
      )
    `);

    const now = new Date().toISOString();
    // Only insert default if table is empty
    const existingConfig = await database.get("SELECT COUNT(*) as count FROM email_config");
    if (existingConfig.count === 0) {
      await database.run(`INSERT INTO email_config (id, service, host, port, secure, email, password, from_name, updated_at)
        VALUES ('main', 'gmail', 'smtp.gmail.com', 587, 0, 'ptthong.www@gmail.com', '', 'DRIVE MH - Học viện trực tuyến', ?)`, [now]);
    }
  } catch (e) {
    console.error("Error creating email_config:", e);
  }

  // Create Payment Methods Table
  try {
    await database.exec(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id TEXT PRIMARY KEY,
        method_key TEXT UNIQUE NOT NULL,
        method_name TEXT NOT NULL,
        icon TEXT,
        description TEXT,
        account_number TEXT,
        account_holder TEXT,
        bank_name TEXT,
        qr_code_image TEXT,
        phone_number TEXT,
        is_active INTEGER DEFAULT 1,
        display_order INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    const now = new Date().toISOString();
    await database.run(`INSERT OR IGNORE INTO payment_methods (id, method_key, method_name, icon, description, account_number, account_holder, bank_name, qr_code_image, phone_number, is_active, display_order, created_at, updated_at)
      VALUES 
        ('pm-001', 'momo', 'Ví MoMo', '🟣', 'Thanh toán nhanh qua MoMo', NULL, 'Phạm Tấn Thông', NULL, NULL, '0901234567', 1, 1, ?, ?),
        ('pm-002', 'banking', 'Thẻ ATM / Internet Banking', '🏧', 'Chuyển khoản qua ATM', '0377987457', 'Phạm Tấn Thông', 'MB Bank - Ngân hàng Quân đội', NULL, NULL, 1, 2, ?, ?),
        ('pm-003', 'qr_banking', 'QR Code Ngân hàng', '🏦', 'Quét mã QR để thanh toán', '0377987457', 'Phạm Tấn Thông', 'MB Bank - VietQR', NULL, NULL, 1, 3, ?, ?)`, [now, now, now, now, now, now]);
  } catch (e) {
    console.error("Error creating/seeding payment_methods:", e);
  }

  console.log("Database initialized successfully!");
}
module.exports = {
  getDatabase,
  initDatabase
};
