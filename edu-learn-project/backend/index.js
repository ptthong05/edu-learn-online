'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { initDatabase, getDatabase } = require('./db');
const { authenticateToken, checkUserStatus, requireRole } = require('./middleware');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { sendOrderConfirmationEmail } = require('./emailService');

const app = express();
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Swagger / OpenAPI Documentation UI
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.get('/api/docs/openapi.json', (_req, res) => res.json(openapiSpec));

// Serve uploaded files as static assets
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Multer config — save to /uploads with original extension
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `banner-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh'));
  },
});


// Initialize DB
initDatabase();

// Healthcheck routes
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'EduLearn API is running' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'EduLearn API is healthy' });
});

const JWT_SECRET = process.env.JWT_SECRET || 'edulearn_super_secret_key_123!@#';

function parseCourseHighlights(value) {
  if (Array.isArray(value)) return value.filter(item => typeof item === 'string' && item.trim());
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string' && item.trim()) : [];
  } catch {
    return [];
  }
}

function parseCourseCurriculum(value) {
  let chapters = value;
  if (typeof value === 'string') {
    try {
      chapters = JSON.parse(value);
    } catch {
      chapters = [];
    }
  }
  if (!Array.isArray(chapters)) return [];

  return chapters
    .map((chapter, chapterIndex) => ({
      id: String(chapter?.id || `chapter-${chapterIndex + 1}`),
      title: typeof chapter?.title === 'string' ? chapter.title.trim() : '',
      lessons: Array.isArray(chapter?.lessons)
        ? chapter.lessons
          .map((lesson, lessonIndex) => ({
            id: String(lesson?.id || `lesson-${chapterIndex + 1}-${lessonIndex + 1}`),
            title: typeof lesson?.title === 'string' ? lesson.title.trim() : '',
            duration: typeof lesson?.duration === 'string' ? lesson.duration : '',
            type: lesson?.type === 'video' ? 'video' : 'document',
            is_preview: Boolean(lesson?.is_preview),
          }))
          .filter(lesson => lesson.title)
        : [],
    }))
    .filter(chapter => chapter.title);
}

function formatCourse(course) {
  return course ? {
    ...course,
    highlights: parseCourseHighlights(course.highlights),
    content: parseCourseCurriculum(course.curriculum),
  } : course;
}

async function generateUniqueCtvCode(db) {
  let ctvCode = '';
  let isUnique = false;
  let nextNum = 1;

  const allAffs = await db.all("SELECT ctv_code FROM affiliates WHERE ctv_code LIKE 'CTV%'");
  for (const a of allAffs) {
    if (a.ctv_code) {
      const match = a.ctv_code.match(/CTV(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num >= nextNum) {
          nextNum = num + 1;
        }
      }
    }
  }

  while (!isUnique) {
    ctvCode = `CTV${String(nextNum).padStart(3, '0')}`;
    const dup = await db.get("SELECT id FROM affiliates WHERE ctv_code = ?", [ctvCode]);
    if (!dup) {
      isUnique = true;
    } else {
      nextNum++;
    }
  }
  return ctvCode;
}


// ================= AUTH ROUTES =================
app.post('/api/auth/register', async (req, res) => {
  const full_name = req.body.full_name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const phone = req.body.phone?.trim();
  const { password } = req.body;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^0(?:3|5|7|8|9)\d{8}$/;
  const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  if (!full_name || !email || !phone || !password) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin.' });
  }
  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: 'Email không đúng định dạng.' });
  }
  if (!phonePattern.test(phone)) {
    return res.status(400).json({ message: 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09.' });
  }
  if (!strongPasswordPattern.test(password)) {
    return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.' });
  }

  try {
    const db = await getDatabase();
    
    // ONLY check users table for email existence
    const existingEmail = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (existingEmail) {
      // If the existing user is a regular USER (not admin), they already have an account
      if (existingEmail.role === 'USER') {
        return res.status(400).json({ message: 'Bạn đã có tài khoản.' });
      }
      // If the existing user is a blocked MANAGER/STAFF, allow registration as a new USER
      if (existingEmail.status === 'blocked' && ['MANAGER', 'STAFF'].includes(existingEmail.role)) {
        // Delete the blocked admin account so they can register as a new user
        console.log(`Attempting to delete blocked admin account: ${existingEmail.email} (${existingEmail.id})`);
        try {
          await db.run("DELETE FROM users WHERE id = ?", [existingEmail.id]);
          console.log(`Successfully deleted blocked admin account: ${existingEmail.email}`);
        } catch (deleteError) {
          console.error('Error deleting blocked admin account:', deleteError);
          return res.status(500).json({ message: 'Lỗi khi xóa tài khoản cũ. Vui lòng thử lại.' });
        }
      } else {
        // Active MANAGER/STAFF should not register as USER
        return res.status(400).json({ message: 'Email đã tồn tại trên hệ thống.' });
      }
    }
    
    // ONLY check users table for phone existence
    const existingPhone = await db.get("SELECT * FROM users WHERE phone = ?", [phone]);
    if (existingPhone) {
      return res.status(400).json({ message: 'Số điện thoại đã tồn tại trên hệ thống.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `u-${Date.now()}`;
    const now = new Date().toISOString();

    await db.run(
      "INSERT INTO users (id, full_name, email, phone, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [userId, full_name, email, phone, hashedPassword, 'USER', 'active', now]
    );

    res.status(201).json({ message: 'Tạo tài khoản thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email và mật khẩu không được trống.' });
  }

  try {
    const db = await getDatabase();
    // Normalize email to match registration behavior
    const normalizedEmail = email?.trim().toLowerCase();
    const user = await db.get("SELECT * FROM users WHERE email = ?", [normalizedEmail]);
    if (!user) {
      return res.status(400).json({ message: 'Tài khoản không tồn tại.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Sai mật khẩu.' });
    }

    // Check if user is a blocked admin/manager - reject login
    if (user.status === 'blocked' && ['MANAGER', 'STAFF'].includes(user.role)) {
      return res.status(403).json({ 
        message: 'Bạn chưa đăng ký, vui lòng đăng ký' 
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        must_change_password: user.must_change_password,
        status: user.status
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        must_change_password: user.must_change_password,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// ================= CLIENT COURSES & CATEGORIES =================
app.get('/api/categories', async (req, res) => {
  const db = await getDatabase();
  const cats = await db.all("SELECT * FROM categories ORDER BY name ASC");
  res.json(cats);
});

app.post('/api/admin/categories', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Tên danh mục là bắt buộc.' });
  }
  try {
    const db = await getDatabase();
    const id = `cat-${Date.now()}`;
    await db.run('INSERT INTO categories (id, name) VALUES (?, ?)', [id, name.trim()]);
    const newCat = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    res.json(newCat);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo danh mục.', error: error.message });
  }
});

app.delete('/api/admin/categories/:id', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  try {
    const db = await getDatabase();
    await db.run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Xóa danh mục thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa danh mục.', error: error.message });
  }
});

app.put('/api/admin/categories/:id', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Tên danh mục là bắt buộc.' });
  }
  try {
    const db = await getDatabase();
    await db.run('UPDATE categories SET name = ? WHERE id = ?', [name.trim(), req.params.id]);
    const updated = await db.get('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật danh mục.', error: error.message });
  }
});

app.get('/api/courses', async (req, res) => {
  try {
    const db = await getDatabase();
    const { search, category, price_range, sort_by } = req.query;

    // Build WHERE clause
    const whereConditions = ["status IN ('published', 'inactive')"];
    const params = [];

    if (category && category !== 'all') {
      whereConditions.push('category_id = ?');
      params.push(category);
    }

    if (search) {
      whereConditions.push('title LIKE ?');
      params.push(`%${search}%`);
    }

    if (price_range === 'free') {
      whereConditions.push('price = 0');
    } else if (price_range === 'under500k') {
      whereConditions.push('(sale_price < 500000 OR (sale_price IS NULL AND price < 500000))');
    } else if (price_range === 'under1m') {
      whereConditions.push('(sale_price < 1000000 OR (sale_price IS NULL AND price < 1000000))');
    } else if (price_range === 'over1m') {
      whereConditions.push('(sale_price >= 1000000 OR (sale_price IS NULL AND price >= 1000000))');
    }

    const whereClause = whereConditions.join(' AND ');

    // Build ORDER BY clause
    let orderBy = 'created_at DESC';
    if (sort_by === 'price-asc') orderBy = 'COALESCE(sale_price, price) ASC';
    else if (sort_by === 'price-desc') orderBy = 'COALESCE(sale_price, price) DESC';
    else if (sort_by === 'rating') orderBy = 'rating DESC';
    else if (sort_by === 'newest') orderBy = 'created_at DESC';

    // Get all data (no pagination)
    const query = `SELECT * FROM courses WHERE ${whereClause} ORDER BY ${orderBy}`;
    const list = await db.all(query, params);
    
    res.json(list.map(formatCourse));
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  const db = await getDatabase();
  const course = await db.get("SELECT * FROM courses WHERE id = ?", [req.params.id]);
  if (!course) return res.status(404).json({ message: 'Khóa học không tồn tại.' });
  res.json(formatCourse(course));
});

// ================= COMBOS =================
app.get('/api/combos', async (req, res) => {
  try {
    const db = await getDatabase();
    const combos = await db.all("SELECT * FROM combos ORDER BY rowid DESC");
    const result = [];
    for (const combo of combos) {
      const comboCourses = await db.all(
        `SELECT c.* FROM courses c 
         JOIN combo_details cd ON c.id = cd.course_id 
         WHERE cd.combo_id = ?`,
        [combo.id]
      );
      result.push({
        ...combo,
        courses: comboCourses.map(formatCourse)
      });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.get('/api/combos/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const combo = await db.get("SELECT * FROM combos WHERE id = ?", [req.params.id]);
    if (!combo) return res.status(404).json({ message: 'Combo không tồn tại.' });
    const comboCourses = await db.all(
      `SELECT c.* FROM courses c 
       JOIN combo_details cd ON c.id = cd.course_id 
       WHERE cd.combo_id = ?`,
      [combo.id]
    );
    res.json({
      ...combo,
      courses: comboCourses.map(formatCourse)
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.post('/api/admin/combos', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  const { title, description, sale_price, status, course_ids, image } = req.body;
  if (!title || !course_ids || !Array.isArray(course_ids) || course_ids.length === 0) {
    return res.status(400).json({ message: 'Tên combo và danh sách khóa học là bắt buộc.' });
  }
  try {
    const db = await getDatabase();
    
    // Calculate price based on selected courses
    const placeholders = course_ids.map(() => '?').join(',');
    const coursesData = await db.all(`SELECT price, sale_price FROM courses WHERE id IN (${placeholders})`, course_ids);
    const price = coursesData.reduce((sum, c) => sum + (c.sale_price || c.price), 0);

    const id = `combo-${Date.now()}`;
    const comboImage = image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80';
    const comboStatus = status || 'active';

    await db.run(
      `INSERT INTO combos (id, title, description, image, price, sale_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description || '', comboImage, price, sale_price || null, comboStatus]
    );

    for (const courseId of course_ids) {
      await db.run(
        `INSERT INTO combo_details (combo_id, course_id) VALUES (?, ?)`,
        [id, courseId]
      );
    }

    const combo = await db.get("SELECT * FROM combos WHERE id = ?", [id]);
    const comboCourses = await db.all(
      `SELECT c.* FROM courses c 
       JOIN combo_details cd ON c.id = cd.course_id 
       WHERE cd.combo_id = ?`,
      [id]
    );
    res.json({
      ...combo,
      courses: comboCourses.map(formatCourse)
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.put('/api/admin/combos/:id', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  const { title, description, sale_price, status, course_ids, image } = req.body;
  if (!title || !course_ids || !Array.isArray(course_ids) || course_ids.length === 0) {
    return res.status(400).json({ message: 'Tên combo và danh sách khóa học là bắt buộc.' });
  }
  try {
    const db = await getDatabase();
    const existing = await db.get("SELECT * FROM combos WHERE id = ?", [req.params.id]);
    if (!existing) return res.status(404).json({ message: 'Combo không tồn tại.' });

    // Calculate price
    const placeholders = course_ids.map(() => '?').join(',');
    const coursesData = await db.all(`SELECT price, sale_price FROM courses WHERE id IN (${placeholders})`, course_ids);
    const price = coursesData.reduce((sum, c) => sum + (c.sale_price || c.price), 0);

    const comboImage = image === undefined ? existing.image : (image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80');
    const comboStatus = status || existing.status;

    await db.run(
      `UPDATE combos SET title = ?, description = ?, image = ?, price = ?, sale_price = ?, status = ? WHERE id = ?`,
      [title, description || '', comboImage, price, sale_price || null, comboStatus, req.params.id]
    );

    // Update details
    await db.run(`DELETE FROM combo_details WHERE combo_id = ?`, [req.params.id]);
    for (const courseId of course_ids) {
      await db.run(
        `INSERT INTO combo_details (combo_id, course_id) VALUES (?, ?)`,
        [req.params.id, courseId]
      );
    }

    const combo = await db.get("SELECT * FROM combos WHERE id = ?", [req.params.id]);
    const comboCourses = await db.all(
      `SELECT c.* FROM courses c 
       JOIN combo_details cd ON c.id = cd.course_id 
       WHERE cd.combo_id = ?`,
      [req.params.id]
    );
    res.json({
      ...combo,
      courses: comboCourses.map(formatCourse)
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.delete('/api/admin/combos/:id', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  try {
    const db = await getDatabase();
    await db.run("DELETE FROM combos WHERE id = ?", [req.params.id]);
    await db.run("DELETE FROM combo_details WHERE combo_id = ?", [req.params.id]);
    res.json({ message: 'Xóa combo thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// ================= CHECKOUT / ORDERS =================
app.post('/api/orders', authenticateToken, checkUserStatus, async (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ message: 'Dữ liệu đơn hàng không hợp lệ.' });
  }

  const { items, payment_method, ref, coupon_code, payment_qr_content } = req.body;

  if (!payment_method || typeof payment_method !== 'string' || !payment_method.trim()) {
    return res.status(400).json({ message: 'Vui lòng chọn phương thức thanh toán.' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Giỏ hàng trống hoặc không hợp lệ.' });
  }

  try {
    const db = await getDatabase();

    // 1. Tính tổng tiền thực tế độc lập từ CSDL (Chống sửa giá từ client)
    let calculatedSubtotal = 0;
    const validatedItems = [];
    for (const item of items) {
      if (!item || typeof item !== 'object' || !item.course_id) continue;
      let productPrice = 0;
      let productName = typeof item.product_name === 'string' ? item.product_name : '';

      const course = await db.get("SELECT id, title, price, sale_price FROM courses WHERE id = ?", [item.course_id]);
      if (course) {
        const hasSale = course.sale_price !== null && course.sale_price !== undefined;
        productPrice = hasSale ? course.sale_price : course.price;
        productName = course.title;
      } else {
        const combo = await db.get("SELECT id, title, price, sale_price FROM combos WHERE id = ?", [item.course_id]);
        if (combo) {
          const hasComboSale = combo.sale_price !== null && combo.sale_price !== undefined;
          productPrice = hasComboSale ? combo.sale_price : combo.price;
          productName = combo.title;
        } else {
          productPrice = Math.max(0, Number(item.price) || 0);
        }
      }
      calculatedSubtotal += productPrice;
      validatedItems.push({
        course_id: String(item.course_id),
        price: productPrice,
        product_name: productName
      });
    }

    if (validatedItems.length === 0) {
      return res.status(400).json({ message: 'Không tìm thấy sản phẩm hợp lệ trong giỏ hàng.' });
    }

    // 2. Xác thực coupon phía server nếu có áp mã
    let serverDiscount = 0;
    let couponRecord = null;
    if (coupon_code && typeof coupon_code === 'string' && coupon_code.trim()) {
      couponRecord = await db.get(
        "SELECT * FROM coupons WHERE UPPER(code) = ?",
        [coupon_code.trim().toUpperCase()]
      );

      const today = new Date().toISOString().split('T')[0];
      const check = validateCouponEligibility(couponRecord, calculatedSubtotal, today);
      if (!check.valid) {
        return res.status(check.status).json({ message: check.message });
      }

      serverDiscount = calculateCouponDiscount(couponRecord, calculatedSubtotal);
    }

    // 3. Tính tổng tiền cuối cùng an toàn phía server
    const finalTotal = Math.max(0, calculatedSubtotal - serverDiscount);

    // Check if affiliate exists and is approved
    let orderIdPrefix = 'ORD';
    let affRecord = null;
    if (ref && typeof ref === 'string' && ref.trim()) {
      const cleanRef = ref.trim();
      affRecord = await db.get(
        "SELECT * FROM affiliates WHERE id = ? OR ctv_code = ? OR ma_ctv = ?",
        [cleanRef, cleanRef, cleanRef]
      );
      if (affRecord && affRecord.status === 'approved') {
        orderIdPrefix = affRecord.ctv_code || affRecord.ma_ctv || 'CTV';
      }
    }

    const orderId = `${orderIdPrefix}-${Date.now()}`;
    const now = new Date().toISOString();

    // Generate QR content for all payment methods
    const paymentQrContent = payment_qr_content || orderId;

    await db.run(
      `INSERT INTO orders (id, user_id, total, subtotal, coupon_code, discount_amount, payment_method, status, created_at, payment_qr_content, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        req.user.id,
        finalTotal,
        calculatedSubtotal,
        couponRecord ? couponRecord.code : null,
        serverDiscount,
        payment_method.trim(),
        'pending',
        now,
        paymentQrContent,
        'chua_thanh_toan'
      ]
    );

    if (couponRecord) {
      await db.run(
        "UPDATE coupons SET used_count = used_count + 1 WHERE id = ? AND used_count < quantity",
        [couponRecord.id]
      );
    }

    for (const item of validatedItems) {
      await db.run(
        "INSERT INTO order_details (order_id, course_id, price, product_name) VALUES (?, ?, ?, ?)",
        [orderId, item.course_id, item.price, item.product_name || item.course_id]
      );

      // Handle affiliate commission notification if ref present and affiliate approved
      if (affRecord && affRecord.status === 'approved') {
        const commRow = await db.get("SELECT commission_rate FROM affiliate_commissions WHERE course_id = ?", [item.course_id]);
        const rate = commRow ? commRow.commission_rate : 10.0;
        const commission = Math.round(item.price * rate / 100);
        const buyer = await db.get("SELECT full_name FROM users WHERE id = ?", [req.user.id]);
        const notifId = `notif-pending-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        // 1. Insert into notifications
        await db.run(
          "INSERT INTO affiliate_notifications (id, affiliate_id, order_id, course_id, buyer_name, amount, commission, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [notifId, affRecord.id, orderId, item.course_id, buyer?.full_name || 'Khách hàng', item.price, commission, now]
        );

        // 2. Insert into affiliate_revenues ledger
        const revId = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        await db.run(
          `INSERT INTO affiliate_revenues (id, affiliate_id, order_id, course_id, buyer_name, order_total, commission_rate, commission_amount, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [revId, affRecord.id, orderId, item.course_id, buyer?.full_name || 'Khách hàng', item.price, rate, commission, 'pending', now]
        );
      }
    }

    // Get user information for email
    const user = await db.get("SELECT full_name, email FROM users WHERE id = ?", [req.user.id]);
    
    // Get order details with items for email
    const orderItems = await db.all(`
      SELECT od.*, 
             COALESCE(od.product_name, c.title, cb.title, od.course_id) AS title 
      FROM order_details od 
      LEFT JOIN courses c ON c.id = od.course_id 
      LEFT JOIN combos cb ON cb.id = od.course_id
      WHERE od.order_id = ?
    `, [orderId]);

    // Send confirmation email (don't wait for result to avoid blocking response)
    if (user && user.email) {
      sendOrderConfirmationEmail(orderId, user.email, user.full_name, {
        items: orderItems,
        total: finalTotal,
        payment_method: payment_method
      }).catch(err => console.error('Failed to send order confirmation email:', err));
    }

    res.status(201).json({ message: 'Đặt hàng thành công.', orderId });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// ================= CONTACT INFO =================
app.get('/api/contact-info', async (req, res) => {
  try {
    const db = await getDatabase();
    const info = await db.all("SELECT * FROM contact_info");
    res.json(info);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// ================= WEBSITE CONTENT =================
app.get('/api/faqs', async (_req, res) => {
  try {
    const db = await getDatabase();
    res.json(await db.all('SELECT * FROM faqs ORDER BY display_order ASC, created_at ASC'));
  } catch (error) { res.status(500).json({ message: 'Không thể tải câu hỏi.', error: error.message }); }
});

app.get('/api/faq-settings', async (_req, res) => {
  try {
    const db = await getDatabase();
    res.json(await db.get("SELECT * FROM faq_settings WHERE id = 'faq-main'"));
  } catch (error) { res.status(500).json({ message: 'Không thể tải cài đặt câu hỏi.', error: error.message }); }
});

app.get('/api/site-pages/:slug', async (req, res) => {
  try {
    const db = await getDatabase();
    const page = await db.get('SELECT * FROM site_pages WHERE slug = ?', [req.params.slug]);
    if (!page) return res.status(404).json({ message: 'Không tìm thấy nội dung.' });
    res.json(page);
  } catch (error) { res.status(500).json({ message: 'Không thể tải nội dung.', error: error.message }); }
});

app.get('/api/terms-of-service', async (_req, res) => {
  try { const db = await getDatabase(); res.json(await db.get("SELECT * FROM terms_of_service WHERE id = 'terms-main'")); }
  catch (error) { res.status(500).json({ message: 'Không thể tải điều khoản.', error: error.message }); }
});
app.get('/api/purchase-guide', async (_req, res) => {
  try { const db = await getDatabase(); res.json(await db.get("SELECT * FROM purchase_guides WHERE id = 'guide-main'")); }
  catch (error) { res.status(500).json({ message: 'Không thể tải hướng dẫn.', error: error.message }); }
});
app.get('/api/introduction', async (_req, res) => {
  try { const db = await getDatabase(); res.json(await db.get("SELECT * FROM introductions WHERE id = 'introduction-main'")); }
  catch (error) { res.status(500).json({ message: 'Không thể tải giới thiệu.', error: error.message }); }
});
app.get('/api/contact-settings', async (_req, res) => {
  try { const db = await getDatabase(); res.json(await db.get("SELECT * FROM contact_settings WHERE id = 'contact-main'")); }
  catch (error) { res.status(500).json({ message: 'Không thể tải liên hệ.', error: error.message }); }
});

app.get('/api/admin/website-content', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (_req, res) => {
  try {
    const db = await getDatabase();
    res.json({
      faqs: await db.all('SELECT * FROM faqs ORDER BY display_order ASC, created_at ASC'),
      faqSettings: await db.get("SELECT * FROM faq_settings WHERE id = 'faq-main'"),
      terms: await db.all('SELECT * FROM terms_of_service ORDER BY updated_at DESC'),
      guides: await db.all('SELECT * FROM purchase_guides ORDER BY updated_at DESC'),
      introductions: await db.all('SELECT * FROM introductions ORDER BY updated_at DESC'),
      contacts: await db.all('SELECT * FROM contact_settings ORDER BY updated_at DESC')
    });
  } catch (error) { res.status(500).json({ message: 'Không thể tải nội dung.', error: error.message }); }
});

app.put('/api/admin/website-content/:section', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  const { section } = req.params;
  const { data } = req.body;
  try {
    const db = await getDatabase();
    await db.exec('BEGIN');
    if (section === 'faqs') {
      let list = [];
      let settings = null;
      if (Array.isArray(data)) {
        list = data;
      } else if (data && typeof data === 'object') {
        list = data.list || [];
        settings = data.settings;
      }

      await db.exec('DELETE FROM faqs');
      for (const [index, faq] of list.entries()) {
        if (!faq.question?.trim() || !faq.answer?.trim()) continue;
        await db.run('INSERT INTO faqs (id, question, answer, display_order, created_at) VALUES (?, ?, ?, ?, ?)',
          [faq.id || `faq-${Date.now()}-${index}`, faq.question.trim(), faq.answer, Number(faq.display_order ?? index), faq.created_at || new Date().toISOString()]);
      }

      if (settings) {
        await db.run(`INSERT INTO faq_settings (id, title, description, updated_at) VALUES ('faq-main', ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET title = excluded.title, description = excluded.description, updated_at = excluded.updated_at`,
          [settings.title?.trim() || 'Câu hỏi thường gặp', settings.description || '', new Date().toISOString()]);
      }
    }
    const singleTables = { terms: ['terms_of_service', 'terms-main'], guides: ['purchase_guides', 'guide-main'], introductions: ['introductions', 'introduction-main'] };
    if (Object.prototype.hasOwnProperty.call(singleTables, section)) {
      if (!data?.title?.trim()) throw new Error('Vui lòng nhập tiêu đề.');
      const [table, id] = singleTables[section];
      await db.run(`INSERT INTO ${table} (id, title, description, content, updated_at) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET title = excluded.title, description = excluded.description, content = excluded.content, updated_at = excluded.updated_at`, [id, data.title.trim(), data.description || '', data.content || '', new Date().toISOString()]);
    }
    if (section === 'contacts') {
      if (!data?.address?.trim() || !data?.phone?.trim() || !data?.email?.trim() || !data?.title?.trim()) throw new Error('Vui lòng nhập đầy đủ thông tin liên hệ.');
      await db.run(`INSERT INTO contact_settings (id, title, description, address, phone, email, content, updated_at) VALUES ('contact-main', ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET title = excluded.title, description = excluded.description, address = excluded.address, phone = excluded.phone, email = excluded.email, content = excluded.content, updated_at = excluded.updated_at`, [data.title.trim(), data.description || '', data.address.trim(), data.phone.trim(), data.email.trim(), data.content || '', new Date().toISOString()]);
    }
    if (!['faqs', 'terms', 'guides', 'introductions', 'contacts'].includes(section)) return res.status(404).json({ message: 'Nhóm nội dung không hợp lệ.' });
    await db.exec('COMMIT');
    res.json({ message: 'Đã lưu nội dung website.' });
  } catch (error) { try { const db = await getDatabase(); await db.exec('ROLLBACK'); } catch (_err) { /* ignore rollback error */ } res.status(500).json({ message: 'Không thể lưu nội dung.', error: error.message }); }
});

// ================= BLOGS =================
app.get('/api/blog-categories', async (_req, res) => {
  try {
    const db = await getDatabase();
    res.json(await db.all("SELECT * FROM blog_categories ORDER BY name ASC"));
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.get('/api/blogs', async (req, res) => {
  try {
    const { category_id } = req.query;
    const db = await getDatabase();
    
    let query = `
      SELECT blogs.*, blog_categories.name as category_name 
      FROM blogs 
      LEFT JOIN blog_categories ON blogs.category_id = blog_categories.id
    `;
    const params = [];
    
    if (category_id) {
      query += " WHERE blogs.category_id = ?";
      params.push(category_id);
    }
    
    query += " ORDER BY blogs.created_at DESC";
    
    const blogs = await db.all(query, params);
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.get('/api/blogs/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const blog = await db.get(`
      SELECT blogs.*, blog_categories.name as category_name 
      FROM blogs 
      LEFT JOIN blog_categories ON blogs.category_id = blog_categories.id
      WHERE blogs.id = ?
    `, [req.params.id]);
    if (!blog) return res.status(404).json({ message: 'Bài viết không tồn tại.' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Admin Blog Categories APIs
app.post('/api/admin/blog-categories', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Tên chuyên mục không được trống.' });
    const db = await getDatabase();
    const id = `cat-${Date.now()}`;
    await db.run("INSERT INTO blog_categories (id, name, created_at) VALUES (?, ?, ?)", [id, name.trim(), new Date().toISOString()]);
    res.json({ message: 'Tạo chuyên mục thành công.', id });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.put('/api/admin/blog-categories/:id', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Tên chuyên mục không được trống.' });
    const db = await getDatabase();
    await db.run("UPDATE blog_categories SET name = ? WHERE id = ?", [name.trim(), req.params.id]);
    res.json({ message: 'Cập nhật chuyên mục thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.delete('/api/admin/blog-categories/:id', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  try {
    const db = await getDatabase();
    await db.run("UPDATE blogs SET category_id = NULL WHERE category_id = ?", [req.params.id]);
    await db.run("DELETE FROM blog_categories WHERE id = ?", [req.params.id]);
    res.json({ message: 'Xóa chuyên mục thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Admin Blogs APIs
app.post('/api/admin/blogs', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  try {
    const { title, category_id, toc, excerpt, content, image } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: 'Tiêu đề và nội dung không được để trống.' });
    }
    const db = await getDatabase();
    const id = `blog-${Date.now()}`;
    await db.run(
      "INSERT INTO blogs (id, title, category_id, toc, excerpt, content, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, title.trim(), category_id || null, toc || '', excerpt || '', content, image || '', new Date().toISOString()]
    );
    res.json({ message: 'Đăng bài viết thành công.', id });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.put('/api/admin/blogs/:id', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  try {
    const { title, category_id, toc, excerpt, content, image } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: 'Tiêu đề và nội dung không được để trống.' });
    }
    const db = await getDatabase();
    const result = await db.run(
      "UPDATE blogs SET title = ?, category_id = ?, toc = ?, excerpt = ?, content = ?, image = ? WHERE id = ?",
      [title.trim(), category_id || null, toc || '', excerpt || '', content, image || '', req.params.id]
    );
    if (result.changes === 0) return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    res.json({ message: 'Cập nhật bài viết thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.delete('/api/admin/blogs/:id', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  try {
    const db = await getDatabase();
    const result = await db.run("DELETE FROM blogs WHERE id = ?", [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    res.json({ message: 'Xóa bài viết thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// ================= COUPONS / PROMOTIONS =================
app.get('/api/coupons', async (req, res) => {
  try {
    const db = await getDatabase();
    const list = await db.all("SELECT * FROM coupons WHERE status = 'active'");
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy coupon.', error: err.message });
  }
});

app.get('/api/admin/coupons', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  try {
    const db = await getDatabase();
    const list = await db.all("SELECT * FROM coupons ORDER BY rowid DESC");
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách coupon.', error: err.message });
  }
});


function validateCoupon(inputCode, coupon, orderAmount, todayStr = new Date().toISOString().split('T')[0]) {
  // [Branch 1 / UT-CP-01]: Kiểm tra tính hợp lệ của input mã do người dùng nhập
  if (!inputCode || typeof inputCode !== 'string' || !inputCode.trim()) {
    return { valid: false, status: 400, message: 'Vui lòng cung cấp mã giảm giá.' };
  }

  // [Branch 2 / UT-CP-02]: Kiểm tra bản ghi coupon có tồn tại trong CSDL không
  if (!coupon) {
    return { valid: false, status: 404, message: 'Mã giảm giá không tồn tại.' };
  }

  // [Branch 3 / UT-CP-03]: Kiểm tra trạng thái coupon có đang kích hoạt không
  if (coupon.status !== 'active') {
    return { valid: false, status: 400, message: 'Mã giảm giá đã bị vô hiệu hóa.' };
  }

  // [Branch 4 / UT-CP-04]: Kiểm tra hạn sử dụng so với ngày hiện tại
  if (coupon.expired_date < todayStr) {
    return { valid: false, status: 400, message: 'Mã giảm giá đã hết hạn sử dụng.' };
  }

  // [Branch 5 / UT-CP-05]: Kiểm tra số lượt đã sử dụng so với tổng số lượng phát hành
  if (coupon.used_count >= coupon.quantity) {
    return { valid: false, status: 400, message: 'Mã giảm giá đã hết lượt sử dụng.' };
  }

  // [Branch 6 / UT-CP-06]: Kiểm tra điều kiện giá trị đơn hàng tối thiểu
  const minOrder = Number(coupon.min_order_amount) || 0;
  const orderTotal = Math.max(0, Number(orderAmount) || 0);
  if (minOrder > 0 && orderTotal < minOrder) {
    return {
      valid: false,
      status: 400,
      message: `Đơn hàng tối thiểu ${minOrder.toLocaleString('vi-VN')}đ để áp dụng mã này.`,
      min_order_amount: minOrder,
    };
  }

  // [Branch 7 & 8 / UT-CP-07 & UT-CP-09]: Tính toán mức giảm theo % hoặc số tiền cố định
  const discountVal = Number(coupon.discount) || 0;
  const isPercent = coupon.discount_type === 'percent' || (!coupon.discount_type && discountVal <= 100);
  let calculatedDiscount = 0;

  if (isPercent) {
    // Branch 7: Giảm theo tỷ lệ phần trăm
    calculatedDiscount = Math.round(orderTotal * discountVal / 100);
  } else {
    // Branch 8 & 10: Giảm cố định & chặn không để giảm vượt quá tổng tiền đơn
    calculatedDiscount = Math.min(orderTotal, discountVal);
  }

  // [Branch 9 / UT-CP-08]: Áp dụng mức giảm trần tối đa (max_discount) nếu được cấu hình
  const maxCap = Number(coupon.max_discount) || 0;
  if (maxCap > 0) {
    calculatedDiscount = Math.min(calculatedDiscount, maxCap);
  }

  // Trả về kết quả áp dụng coupon thành công (HTTP 200)
  return {
    valid: true,
    status: 200,
    message: 'Áp dụng mã giảm giá thành công!',
    coupon,
    calculated_discount: calculatedDiscount
  };
}

// Giữ alias tương thích nếu có nơi gọi
function validateCouponEligibility(coupon, orderAmount, todayStr) {
  const res = validateCoupon('DUMMY', coupon, orderAmount, todayStr);
  return res.valid ? { valid: true } : res;
}

function calculateCouponDiscount(coupon, subtotal) {
  const res = validateCoupon('DUMMY', coupon, subtotal);
  return res.calculated_discount || 0;
}

// Helper: Normalize coupon payload
function normalizeCouponPayload(body, existing = {}) {
  return {
    code: body.code !== undefined ? String(body.code).trim().toUpperCase() : existing.code,
    discount: body.discount !== undefined ? Number(body.discount) : existing.discount,
    quantity: body.quantity !== undefined ? Number(body.quantity) : existing.quantity,
    expired_date: body.expired_date !== undefined ? body.expired_date : existing.expired_date,
    status: body.status !== undefined ? body.status : (existing.status || 'active'),
    usable_by: body.usable_by !== undefined ? body.usable_by : (existing.usable_by || 'user'),
    description: body.description !== undefined ? body.description : (existing.description || null),
    discount_type: body.discount_type !== undefined ? body.discount_type : (existing.discount_type || 'percent'),
    max_discount: body.max_discount !== undefined ? Number(body.max_discount) : (existing.max_discount || 0),
    min_order_amount: body.min_order_amount !== undefined
      ? Number(body.min_order_amount)
      : (existing.min_order_amount || 0),
  };
}

app.post('/api/admin/coupons', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  const { code, discount, quantity, expired_date } = req.body;
  if (!code || discount === undefined || quantity === undefined || !expired_date) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin mã giảm giá.' });
  }
  try {
    const db = await getDatabase();
    const id = `coup-${Date.now()}`;
    const p = normalizeCouponPayload(req.body);

    await db.run(
      `INSERT INTO coupons (id, code, discount, quantity, used_count, expired_date, status, usable_by, description, discount_type, max_discount, min_order_amount)
       VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, p.code, p.discount, p.quantity, p.expired_date,
        p.status, p.usable_by, p.description, p.discount_type, p.max_discount, p.min_order_amount
      ]
    );
    const newCoupon = await db.get("SELECT * FROM coupons WHERE id = ?", [id]);
    res.status(201).json({ message: 'Tạo mã giảm giá thành công.', coupon: newCoupon });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(400).json({ message: 'Mã giảm giá này đã tồn tại.' });
    }
    res.status(500).json({ message: 'Lỗi server khi tạo coupon.', error: err.message });
  }
});

app.put('/api/admin/coupons/:id', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDatabase();
    const existing = await db.get("SELECT * FROM coupons WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá.' });
    }

    const p = normalizeCouponPayload(req.body, existing);

    await db.run(
      `UPDATE coupons 
       SET code = ?, discount = ?, quantity = ?, expired_date = ?, status = ?,
           usable_by = ?, description = ?, discount_type = ?, max_discount = ?, min_order_amount = ?
       WHERE id = ?`,
      [
        p.code, p.discount, p.quantity, p.expired_date, p.status,
        p.usable_by, p.description, p.discount_type, p.max_discount, p.min_order_amount, id
      ]
    );
    const updatedCoupon = await db.get("SELECT * FROM coupons WHERE id = ?", [id]);
    res.json({ message: 'Cập nhật mã giảm giá thành công.', coupon: updatedCoupon });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(400).json({ message: 'Mã giảm giá này đã tồn tại.' });
    }
    res.status(500).json({ message: 'Lỗi server khi sửa coupon.', error: err.message });
  }
});

app.delete('/api/admin/coupons/:id', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDatabase();
    const result = await db.run("DELETE FROM coupons WHERE id = ?", [id]);
    if (result.changes === 0) return res.status(404).json({ message: 'Không tìm thấy mã giảm giá.' });
    res.json({ message: 'Xóa mã giảm giá thành công.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi xóa coupon.', error: err.message });
  }
});

app.post('/api/coupons/validate', async (req, res) => {
  const { code, order_amount } = req.body;
  if (!code) {
    return res.status(400).json({ message: 'Vui lòng cung cấp mã giảm giá.' });
  }
  try {
    const db = await getDatabase();
    const coupon = await db.get("SELECT * FROM coupons WHERE UPPER(code) = ?", [code.toUpperCase()]);
    const today = new Date().toISOString().split('T')[0];

    const result = validateCoupon(code, coupon, order_amount, today);
    if (!result.valid) {
      return res.status(result.status).json(result);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi xác thực coupon.', error: err.message });
  }
});

// ================= MY COURSES =================
app.get('/api/my-courses', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const db = await getDatabase();
    // Get all courses purchased by user (directly or via combos)
    const myCourses = await db.all(`
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
    `, [req.user.id, req.user.id]);

    res.json(myCourses.map(formatCourse));
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// ================= MY NOTIFICATIONS =================
app.get('/api/my-notifications', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const db = await getDatabase();
    const userId = req.user.id;
    const notifications = [];
    
    // 1. Get user's own orders that are completed or cancelled
    const myOrders = await db.all(
      "SELECT id, status, created_at FROM orders WHERE user_id = ? AND status IN ('completed', 'cancelled') ORDER BY created_at DESC LIMIT 15",
      [userId]
    );
    myOrders.forEach(o => {
      notifications.push({
        id: `my-order-${o.id}-${o.status}`,
        type: 'order-status',
        title: o.status === 'completed' ? 'Đơn hàng bạn đã được duyệt' : 'Đơn hàng đã bị hủy',
        message: o.status === 'completed' 
          ? `Đơn hàng ${o.id} của bạn đã được duyệt thành công. Vào học ngay!`
          : `Đơn hàng ${o.id} của bạn đã bị hủy. Vui lòng kiểm tra lại thanh toán.`,
        time: o.created_at,
        link: '/tai-khoan?tab=orders'
      });
    });

    // 2. Get affiliate registration request status
    const affRecord = await db.get("SELECT id, status, created_at FROM affiliates WHERE user_id = ? OR affiliate_email = ? OR email = ?", [userId, req.user.email, req.user.email]);
    if (affRecord) {
      if (affRecord.status === 'approved') {
        notifications.push({
          id: `aff-status-active`,
          type: 'affiliate-status',
          title: 'Đăng ký Affiliate thành công',
          message: `Yêu cầu làm đối tác Affiliate của bạn đã được phê duyệt! Hãy lấy link giới thiệu của bạn.`,
          time: affRecord.created_at,
          link: '/tai-khoan?tab=affiliate'
        });
      } else if (affRecord.status === 'rejected' || affRecord.status === 'terminated') {
        notifications.push({
          id: `aff-status-rejected`,
          type: 'affiliate-status',
          title: 'Yêu cầu Affiliate bị từ chối',
          message: `Yêu cầu làm đối tác Affiliate của bạn đã bị từ chối. Vui lòng liên hệ hỗ trợ.`,
          time: affRecord.created_at,
          link: '/tai-khoan?tab=affiliate'
        });
      }
      
      // 3. If affiliate is approved, get referral orders notifications
      if (affRecord.status === 'approved') {
        const affNotifs = await db.all(
          "SELECT id, order_id, buyer_name, commission, created_at FROM affiliate_notifications WHERE affiliate_id = ? ORDER BY created_at DESC LIMIT 15",
          [affRecord.id]
        );
        affNotifs.forEach(an => {
          const isApproved = an.id.startsWith('notif-approved-');
          notifications.push({
            id: `aff-notif-${an.id}`,
            type: isApproved ? 'referral-commission' : 'referral-order',
            title: isApproved ? 'Bạn đã có hoa hồng' : 'Bạn có đơn hàng tiếp thị',
            message: isApproved
              ? `Khách hàng ${an.buyer_name} đã mua hàng từ liên kết của bạn. Hoa hồng: +${an.commission.toLocaleString('vi-VN')}đ.`
              : `Khách hàng ${an.buyer_name} đã đặt hàng từ liên kết của bạn. Đang chờ xác duyệt.`,
            time: an.created_at,
            link: '/tai-khoan?tab=affiliate'
          });
        });

        // 4. Click notifications
        const affClicks = await db.all(
          "SELECT id, url, created_at FROM affiliate_clicks WHERE affiliate_id = ? ORDER BY created_at DESC LIMIT 15",
          [affRecord.id]
        );
        affClicks.forEach(clk => {
          notifications.push({
            id: `aff-click-${clk.id}`,
            type: 'referral-click',
            title: 'Lượt nhấp chuột mới',
            message: `Có lượt nhấp mới từ liên kết giới thiệu của bạn.`,
            time: clk.created_at,
            link: '/tai-khoan?tab=affiliate'
          });
        });

        // 5. Withdrawal notifications
        const myWithdrawals = await db.all(
          "SELECT id, amount, status, created_at, updated_at FROM withdrawal_requests WHERE affiliate_id = ? ORDER BY created_at DESC LIMIT 15",
          [affRecord.id]
        );
        myWithdrawals.forEach(w => {
          if (w.status === 'completed') {
            notifications.push({
              id: `withdrawal-completed-${w.id}`,
              type: 'withdrawal-status',
              title: 'Yêu cầu rút tiền thành công',
              message: `Yêu cầu rút tiền mã ${w.id} trị giá ${w.amount.toLocaleString('vi-VN')}đ đã được chuyển khoản thành công.`,
              time: w.updated_at || w.created_at,
              link: '/tai-khoan?tab=affiliate'
            });
          } else if (w.status === 'rejected') {
            notifications.push({
              id: `withdrawal-rejected-${w.id}`,
              type: 'withdrawal-status',
              title: 'Yêu cầu rút tiền bị từ chối',
              message: `Yêu cầu rút tiền mã ${w.id} của bạn đã bị từ chối. Vui lòng kiểm tra thông tin ngân hàng.`,
              time: w.updated_at || w.created_at,
              link: '/tai-khoan?tab=affiliate'
            });
          } else if (w.status === 'pending') {
            notifications.push({
              id: `withdrawal-pending-user-${w.id}`,
              type: 'withdrawal-status',
              title: 'Yêu cầu rút tiền đang chờ xử lý',
              message: `Yêu cầu rút tiền mã ${w.id} trị giá ${w.amount.toLocaleString('vi-VN')}đ đã gửi thành công và đang chờ admin phê duyệt.`,
              time: w.created_at,
              link: '/tai-khoan?tab=affiliate'
            });
          }
        });
      }
    }

    // Sort all notifications by time descending
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy thông báo.', error: error.message });
  }
});

// Upload payment proof
app.post('/api/orders/upload-proof', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const { order_id, proof_image } = req.body;
    const db = await getDatabase();
    
    // Verify order belongs to user
    const order = await db.get("SELECT * FROM orders WHERE id = ? AND user_id = ?", [order_id, req.user.id]);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    // Update order with payment proof
    await db.run(
      "UPDATE orders SET payment_proof = ? WHERE id = ?",
      [proof_image, order_id]
    );

    res.json({ message: 'Tải lên bằng chứng thanh toán thành công. Đơn hàng đang được xét duyệt.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Get order details
app.get('/api/orders/:id', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const db = await getDatabase();
    const order = await db.get(
      "SELECT * FROM orders WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    // Get user information
    let user = null;
    try {
      user = await db.get(
        "SELECT full_name, email, phone FROM users WHERE id = ?",
        [order.user_id]
      );
      console.log('User data for order:', order.id, 'user_id:', order.user_id, 'user:', user);
    } catch (userError) {
      console.error('Error fetching user:', userError);
    }

    // Get order details with course info
    const items = await db.all(`
      SELECT od.*, 
             COALESCE(od.product_name, c.title, cb.title, od.course_id) AS title, 
             COALESCE(c.image, cb.image) AS image
      FROM order_details od 
      LEFT JOIN courses c ON c.id = od.course_id 
      LEFT JOIN combos cb ON cb.id = od.course_id
      WHERE od.order_id = ?
    `, [req.params.id]);

    const responseData = { 
      ...order, 
      items,
      user_name: user?.full_name || 'N/A',
      user_email: user?.email || 'N/A',
      user_phone: user?.phone || 'N/A'
    };
    
    console.log('Order details response:', responseData); // Debug log
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Get user's orders
app.get('/api/orders', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const db = await getDatabase();
    const orders = await db.all(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    const ordersWithItems = await Promise.all(orders.map(async order => ({
      ...order,
      items: await db.all(`
        SELECT od.course_id, od.price, 
               COALESCE(od.product_name, c.title, cb.title, od.course_id) AS title, 
               COALESCE(c.image, cb.image) AS image
        FROM order_details od
        LEFT JOIN courses c ON c.id = od.course_id
        LEFT JOIN combos cb ON cb.id = od.course_id
        WHERE od.order_id = ?
      `, [order.id])
    })));
    res.json(ordersWithItems);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// ================= ADMIN PATHS (MANAGER & STAFF) =================
app.get('/api/admin/orders', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  try {
    const db = await getDatabase();
    const orders = await db.all(`
      SELECT o.*, u.full_name, u.email,
        GROUP_CONCAT(COALESCE(c.title, cb.title, od.product_name, od.course_id), ' | ') AS product_names
      FROM orders o
      JOIN users u ON u.id = o.user_id
      LEFT JOIN order_details od ON od.order_id = o.id
      LEFT JOIN courses c ON c.id = od.course_id
      LEFT JOIN combos cb ON cb.id = od.course_id
      GROUP BY o.id, u.full_name, u.email
      ORDER BY o.created_at DESC
    `);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.get('/api/admin/notifications', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  try {
    const db = await getDatabase();
    
    // 1. Pending orders
    const pendingOrders = await db.all("SELECT id, total, created_at FROM orders WHERE status = 'pending' ORDER BY created_at DESC LIMIT 10");
    
    // 2. Pending affiliate registrations
    const pendingAffiliates = await db.all("SELECT id, full_name, created_at FROM affiliates WHERE status = 'pending' ORDER BY created_at DESC LIMIT 10");
    
    // 3. Recently registered users (last 10)
    const recentUsers = await db.all("SELECT id, full_name, created_at FROM users WHERE role = 'USER' ORDER BY created_at DESC LIMIT 10");

    // 4. Pending withdrawal requests (last 10)
    const pendingWithdrawals = await db.all(
      "SELECT wr.id, wr.amount, wr.created_at, a.full_name FROM withdrawal_requests wr JOIN affiliates a ON a.id = wr.affiliate_id WHERE wr.status = 'pending' ORDER BY wr.created_at DESC LIMIT 10"
    );
    
    const notifications = [];
    
    pendingOrders.forEach(o => {
      notifications.push({
        id: `order-pending-${o.id}`,
        type: 'order',
        title: 'Đơn hàng mới chờ duyệt',
        message: `Đơn hàng ${o.id} trị giá ${o.total.toLocaleString('vi-VN')}đ đang chờ phê duyệt.`,
        time: o.created_at,
        link: '/admin/orders'
      });
    });
    
    pendingAffiliates.forEach(a => {
      notifications.push({
        id: `affiliate-pending-${a.id}`,
        type: 'affiliate',
        title: 'Đăng ký đối tác mới',
        message: `Tài khoản ${a.full_name} vừa gửi yêu cầu tham gia Affiliate.`,
        time: a.created_at,
        link: '/admin/affiliates'
      });
    });
    
    recentUsers.forEach(u => {
      notifications.push({
        id: `user-new-${u.id}`,
        type: 'user',
        title: 'Người dùng mới đăng ký',
        message: `Khách hàng ${u.full_name} đã đăng ký tài khoản thành công.`,
        time: u.created_at,
        link: '/admin/users'
      });
    });

    pendingWithdrawals.forEach(w => {
      notifications.push({
        id: `withdrawal-pending-${w.id}`,
        type: 'withdrawal',
        title: 'Yêu cầu rút tiền mới',
        message: `Đối tác ${w.full_name} đã yêu cầu rút tiền với số tiền ${w.amount.toLocaleString('vi-VN')}đ.`,
        time: w.created_at,
        link: '/admin/withdrawals'
      });
    });
    
    // Sort by creation time descending (newest notifications first)
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy thông báo.', error: error.message });
  }
});

app.put('/api/admin/orders/:id/status', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  const { status } = req.body;
  if (!['completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ.' });
  }

  try {
    const db = await getDatabase();
    const order = await db.get("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });

    const newPaymentStatus = status === 'completed' ? 'da_thanh_toan' : 'chua_thanh_toan';

    // Atomic update of both status and payment_status
    await db.run(
      'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
      [status, newPaymentStatus, req.params.id]
    );

    // Update corresponding affiliate_revenues status and notifications (Idempotent)
    if (status === 'completed' && order.status !== 'completed') {
      await db.run("UPDATE affiliate_revenues SET status = 'approved' WHERE order_id = ?", [req.params.id]);
      
      const revenues = await db.all("SELECT * FROM affiliate_revenues WHERE order_id = ?", [req.params.id]);
      for (const rev of revenues) {
        // Only insert notification if not already existing for this order approval
        const existingNotif = await db.get(
          "SELECT id FROM affiliate_notifications WHERE affiliate_id = ? AND order_id = ? AND course_id = ?",
          [rev.affiliate_id, rev.order_id, rev.course_id]
        );
        if (!existingNotif) {
          const notifId = `notif-approved-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          await db.run(
            `INSERT INTO affiliate_notifications (id, affiliate_id, order_id, course_id, buyer_name, amount, commission, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              notifId, rev.affiliate_id, rev.order_id, rev.course_id,
              rev.buyer_name, rev.order_total, rev.commission_amount, new Date().toISOString()
            ]
          );
        }
      }
    } else if (status === 'cancelled') {
      await db.run("UPDATE affiliate_revenues SET status = 'cancelled' WHERE order_id = ?", [req.params.id]);
    }

    res.json({
      message: 'Đã cập nhật trạng thái đơn hàng.',
      status,
      payment_status: newPaymentStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Update payment status (Atomically synchronized with order status)
app.patch('/api/admin/orders/:id/payment-status', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  const { payment_status } = req.body;
  if (!['chua_thanh_toan', 'da_thanh_toan'].includes(payment_status)) {
    return res.status(400).json({ message: 'Trạng thái thanh toán không hợp lệ.' });
  }

  try {
    const db = await getDatabase();
    const order = await db.get("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });

    const newOrderStatus = payment_status === 'da_thanh_toan' ? 'completed' : 'pending';

    // Synchronize both payment_status and status atomically
    await db.run(
      'UPDATE orders SET payment_status = ?, status = ? WHERE id = ?',
      [payment_status, newOrderStatus, req.params.id]
    );

    if (payment_status === 'da_thanh_toan' && order.status !== 'completed') {
      await db.run("UPDATE affiliate_revenues SET status = 'approved' WHERE order_id = ?", [req.params.id]);
      const revenues = await db.all("SELECT * FROM affiliate_revenues WHERE order_id = ?", [req.params.id]);
      for (const rev of revenues) {
        const existingNotif = await db.get(
          "SELECT id FROM affiliate_notifications WHERE affiliate_id = ? AND order_id = ? AND course_id = ?",
          [rev.affiliate_id, rev.order_id, rev.course_id]
        );
        if (!existingNotif) {
          const notifId = `notif-approved-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          await db.run(
            `INSERT INTO affiliate_notifications (id, affiliate_id, order_id, course_id, buyer_name, amount, commission, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              notifId, rev.affiliate_id, rev.order_id, rev.course_id,
              rev.buyer_name, rev.order_total, rev.commission_amount, new Date().toISOString()
            ]
          );
        }
      }
    }

    res.json({
      message: 'Đã cập nhật trạng thái thanh toán.',
      payment_status,
      status: newOrderStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.get('/api/admin/stats', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  const db = await getDatabase();
  const revenue = await db.get("SELECT SUM(total) as val FROM orders WHERE status = 'completed'");
  const students = await db.get("SELECT COUNT(*) as val FROM users WHERE role = 'USER'");
  const coursesCount = await db.get("SELECT COUNT(*) as val FROM courses");
  const ordersCount = await db.get("SELECT COUNT(*) as val FROM orders");

  res.json({
    total_revenue: revenue.val || 0,
    total_students: students.val || 0,
    total_courses: coursesCount.val || 0,
    total_orders: ordersCount.val || 0
  });
});

// Monthly statistics for admin dashboard
app.get('/api/admin/stats/monthly', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  const { month } = req.query;
  const targetMonth = month || new Date().toISOString().slice(0, 7); // Format: YYYY-MM
  
  try {
    const db = await getDatabase();
    
    // Monthly revenue (completed orders in the selected month)
    const monthlyRevenue = await db.get(
      `SELECT SUM(total) as val FROM orders 
       WHERE status = 'completed' 
       AND strftime('%Y-%m', created_at) = ?`,
      [targetMonth]
    );

    // Monthly orders count
    const monthlyOrders = await db.get(
      `SELECT COUNT(*) as val FROM orders 
       WHERE strftime('%Y-%m', created_at) = ?`,
      [targetMonth]
    );

    // Monthly successful orders (completed)
    const monthlySuccessOrders = await db.get(
      `SELECT COUNT(*) as val FROM orders 
       WHERE status = 'completed' 
       AND strftime('%Y-%m', created_at) = ?`,
      [targetMonth]
    );

    // Monthly cancelled orders
    const monthlyCancelledOrders = await db.get(
      `SELECT COUNT(*) as val FROM orders 
       WHERE status = 'cancelled' 
       AND strftime('%Y-%m', created_at) = ?`,
      [targetMonth]
    );

    // Monthly new students (users registered in this month)
    const monthlyStudents = await db.get(
      `SELECT COUNT(*) as val FROM users 
       WHERE role = 'USER' 
       AND strftime('%Y-%m', created_at) = ?`,
      [targetMonth]
    );

    // Monthly courses sold (count of order_details for completed orders in this month)
    const monthlyCoursesSold = await db.get(
      `SELECT COUNT(*) as val FROM order_details od
       JOIN orders o ON od.order_id = o.id
       WHERE o.status = 'completed'
       AND strftime('%Y-%m', o.created_at) = ?`,
      [targetMonth]
    );

    res.json({
      month: targetMonth,
      monthly_revenue: monthlyRevenue.val || 0,
      monthly_orders: monthlyOrders.val || 0,
      monthly_success_orders: monthlySuccessOrders.val || 0,
      monthly_cancelled_orders: monthlyCancelledOrders.val || 0,
      monthly_students: monthlyStudents.val || 0,
      monthly_courses_sold: monthlyCoursesSold.val || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê tháng.', error: error.message });
  }
});

// Monthly cumulative statistics for admin dashboard
app.get('/api/admin/stats/monthly-cumulative', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  const { month } = req.query;
  const targetMonth = month || new Date().toISOString().slice(0, 7); // Format: YYYY-MM
  
  try {
    const db = await getDatabase();
    
    // Use strftime to match YYYY-MM format, same as monthly stats
    // This will include all data up to and including the selected month
    const [year, monthNum] = targetMonth.split('-');
    const monthPrefix = `${year}-${monthNum}`; // YYYY-MM format for strftime
    
    // Cumulative revenue up to the selected month (completed orders)
    const cumulativeRevenue = await db.get(
      `SELECT SUM(total) as val FROM orders 
       WHERE status = 'completed' 
       AND strftime('%Y-%m', created_at) <= ?`,
      [monthPrefix]
    );

    // Cumulative orders count up to the selected month
    const cumulativeOrders = await db.get(
      `SELECT COUNT(*) as val FROM orders 
       WHERE strftime('%Y-%m', created_at) <= ?`,
      [monthPrefix]
    );

    // Cumulative successful orders (completed) up to the selected month
    const cumulativeSuccessOrders = await db.get(
      `SELECT COUNT(*) as val FROM orders 
       WHERE status = 'completed' 
       AND strftime('%Y-%m', created_at) <= ?`,
      [monthPrefix]
    );

    // Cumulative students up to the selected month
    const cumulativeStudents = await db.get(
      `SELECT COUNT(*) as val FROM users 
       WHERE role = 'USER' 
       AND strftime('%Y-%m', created_at) <= ?`,
      [monthPrefix]
    );

    // Cumulative courses sold up to the selected month
    const cumulativeCoursesSold = await db.get(
      `SELECT COUNT(*) as val FROM order_details od
       JOIN orders o ON od.order_id = o.id
       WHERE o.status = 'completed'
       AND strftime('%Y-%m', o.created_at) <= ?`,
      [monthPrefix]
    );

    res.json({
      month: targetMonth,
      cumulative_revenue: cumulativeRevenue.val || 0,
      cumulative_orders: cumulativeOrders.val || 0,
      cumulative_success_orders: cumulativeSuccessOrders.val || 0,
      cumulative_students: cumulativeStudents.val || 0,
      cumulative_courses_sold: cumulativeCoursesSold.val || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê tích lũy.', error: error.message });
  }
});

// Accounts Manager (MANAGER only)
app.get('/api/admin/accounts', authenticateToken, checkUserStatus, requireRole(['MANAGER']), async (req, res) => {
  const db = await getDatabase();
  const list = await db.all("SELECT id, full_name, email, phone, password, role, status, created_at FROM users WHERE role != 'USER' ORDER BY created_at DESC");
  res.json(list);
});

app.get('/api/admin/users', authenticateToken, checkUserStatus, requireRole(['MANAGER']), async (req, res) => {
  const db = await getDatabase();
  const list = await db.all("SELECT id, full_name, email, phone, password, avatar, role, status, created_at FROM users WHERE role = 'USER' ORDER BY created_at DESC");
  res.json(list);
});

app.get('/api/admin/users/:id/orders', authenticateToken, checkUserStatus, requireRole(['MANAGER']), async (req, res) => {
  try {
    const db = await getDatabase();
    const orders = await db.all(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [req.params.id]
    );
    const ordersWithItems = await Promise.all(orders.map(async order => ({
      ...order,
      items: await db.all(`
        SELECT od.course_id, od.price, COALESCE(od.product_name, c.title, od.course_id) AS title, c.image
        FROM order_details od
        LEFT JOIN courses c ON c.id = od.course_id
        WHERE od.order_id = ?
      `, [order.id])
    })));
    res.json(ordersWithItems);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.patch('/api/admin/users/:id/status', authenticateToken, checkUserStatus, requireRole(['MANAGER']), async (req, res) => {
  const { status } = req.body;
  if (!['active', 'blocked'].includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
  }

  const db = await getDatabase();
  const result = await db.run("UPDATE users SET status = ? WHERE id = ?", [status, req.params.id]);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
  }
  res.json({ message: 'Cập nhật trạng thái thành công.' });
});

// Toggle status for admin accounts (MANAGER, STAFF, etc.)
app.patch('/api/admin/accounts/:id/status', authenticateToken, checkUserStatus, requireRole(['MANAGER']), async (req, res) => {
  const { status } = req.body;
  if (!['active', 'blocked'].includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
  }

  const db = await getDatabase();
  // Prevent blocking the last active MANAGER
  const targetUser = await db.get("SELECT * FROM users WHERE id = ?", [req.params.id]);
  if (!targetUser) {
    return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
  }
  
  if (status === 'blocked' && targetUser.role === 'MANAGER') {
    const activeManagers = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'MANAGER' AND status = 'active' AND id != ?", [req.params.id]);
    if (activeManagers.count === 0) {
      return res.status(400).json({ message: 'Không thể khóa tài khoản Quản lý cuối cùng. Vui lòng tạo tài khoản Quản lý khác trước.' });
    }
  }

  const result = await db.run("UPDATE users SET status = ? WHERE id = ?", [status, req.params.id]);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
  }
  res.json({ message: 'Cập nhật trạng thái thành công.' });
});

app.post('/api/admin/accounts', authenticateToken, checkUserStatus, requireRole(['MANAGER']), async (req, res) => {
  try {
    const { full_name, email, password, role, phone } = req.body;
    if (!full_name || !email || !password || !role || !phone) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin (Họ tên, Email, Mật khẩu, Vai trò, Số điện thoại).' });
    }
    
    const phoneDigits = phone.replace(/\D/g, '');
    if (!/^(03|05|07|08|09|02[0-9])[0-9]{8}$/.test(phoneDigits)) {
      return res.status(400).json({ message: 'Số điện thoại không đúng định dạng Việt Nam.' });
    }
    
    const db = await getDatabase();
    const hash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    // Normalize email (lowercase, trim) to match login behavior
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Email phải có đuôi @gmail.com.' });
    }
    
    // Check if email already exists
    const existingEmail = await db.get("SELECT * FROM users WHERE email = ?", [normalizedEmail]);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email này đã tồn tại trong hệ thống. Vui lòng sử dụng email khác.' });
    }
    
    await db.run(
      "INSERT INTO users (id, full_name, email, phone, password, role, status, must_change_password, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [`admin-${Date.now()}`, full_name, normalizedEmail, phoneDigits, hash, role, 'active', 1, now]
    );
    res.json({ message: 'Tạo tài khoản quản trị thành công.' });
  } catch (error) {
    console.error('Error creating admin account:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo tài khoản.', error: error.message });
  }
});

app.put('/api/admin/accounts/:id', authenticateToken, checkUserStatus, requireRole(['MANAGER']), async (req, res) => {
  const { full_name, email, password, role, phone } = req.body;
  const db = await getDatabase();
  
  // Check if account exists
  const existing = await db.get("SELECT * FROM users WHERE id = ?", [req.params.id]);
  if (!existing) {
    return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
  }
  
  // Update fields
  if (full_name) {
    await db.run("UPDATE users SET full_name = ? WHERE id = ?", [full_name, req.params.id]);
  }
  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Email phải có đuôi @gmail.com.' });
    }
    await db.run("UPDATE users SET email = ? WHERE id = ?", [normalizedEmail, req.params.id]);
  }
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    await db.run("UPDATE users SET password = ? WHERE id = ?", [hash, req.params.id]);
  }
  if (role) {
    await db.run("UPDATE users SET role = ? WHERE id = ?", [role, req.params.id]);
  }
  if (phone !== undefined) {
    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Số điện thoại không được để trống.' });
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (!/^(03|05|07|08|09|02[0-9])[0-9]{8}$/.test(phoneDigits)) {
      return res.status(400).json({ message: 'Số điện thoại không đúng định dạng Việt Nam.' });
    }
    await db.run("UPDATE users SET phone = ? WHERE id = ?", [phoneDigits, req.params.id]);
  }
  
  res.json({ message: 'Cập nhật tài khoản quản trị thành công.' });
});

// ================= ADMIN COURSES =================
app.get('/api/admin/courses', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  try {
    const db = await getDatabase();
    const list = await db.all("SELECT * FROM courses ORDER BY id DESC");
    res.json(list.map(formatCourse));
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.post('/api/admin/courses', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  const {
    title, description, price, sale_price, category_id,
    content_html, highlights, content, image, status, instructor
  } = req.body;
  if (!title || price === undefined) {
    return res.status(400).json({ message: 'Tên khóa học và giá là bắt buộc.' });
  }

  try {
    const db = await getDatabase();
    const id = `course-${Date.now()}`;
    const courseImage = image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80';
    const courseStatus = status || 'published';
    const courseInstructor = instructor?.trim() || 'Nguyễn Văn A';
    await db.run(
      `INSERT INTO courses (id, title, description, image, price, sale_price, category_id, content_html, highlights, curriculum, instructor, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, title, description || '', courseImage, price, sale_price || null, category_id || null,
        content_html || '', JSON.stringify(parseCourseHighlights(highlights)),
        JSON.stringify(parseCourseCurriculum(content)), courseInstructor, courseStatus, new Date().toISOString()
      ]
    );
    const newCourse = await db.get("SELECT * FROM courses WHERE id = ?", [id]);
    res.json(formatCourse(newCourse));
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.put('/api/admin/courses/:id', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  const {
    title, description, price, sale_price, category_id,
    content_html, highlights, content, image, status, instructor
  } = req.body;
  if (!title || price === undefined) {
    return res.status(400).json({ message: 'Tên khóa học và giá là bắt buộc.' });
  }

  try {
    const db = await getDatabase();
    const existing = await db.get("SELECT * FROM courses WHERE id = ?", [req.params.id]);
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học.' });
    }
    const courseImage = image === undefined ? existing.image : (image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80');
    const courseInstructor = instructor?.trim() || 'Nguyễn Văn A';
    const result = await db.run(
      `UPDATE courses 
       SET title = ?, description = ?, image = ?, price = ?, sale_price = ?, category_id = ?, content_html = ?, highlights = ?, curriculum = ?, instructor = ?, status = ?
       WHERE id = ?`,
      [
        title,
        description === undefined ? existing.description : description || '',
        courseImage,
        price,
        sale_price === undefined ? existing.sale_price : sale_price || null,
        category_id === undefined ? existing.category_id : category_id || null,
        content_html === undefined ? existing.content_html : content_html || '',
        highlights === undefined ? existing.highlights : JSON.stringify(parseCourseHighlights(highlights)),
        content === undefined ? existing.curriculum : JSON.stringify(parseCourseCurriculum(content)),
        courseInstructor,
        status || existing.status,
        req.params.id
      ]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học.' });
    }

    const updated = await db.get("SELECT * FROM courses WHERE id = ?", [req.params.id]);
    res.json(formatCourse(updated));
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.delete('/api/admin/courses/:id', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  try {
    const db = await getDatabase();
    const result = await db.run("DELETE FROM courses WHERE id = ?", [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học.' });
    }
    res.json({ message: 'Xóa khóa học thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// ================= AFFILIATE ROUTES =================

// Register as an affiliate
app.post('/api/affiliates/register', authenticateToken, checkUserStatus, async (req, res) => {
  const { full_name, email, phone, bank_name, bank_account, address, dob } = req.body;
  if (!full_name || !email || !phone || !bank_name || !bank_account || !address || !dob) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin đăng ký.' });
  }

  try {
    const db = await getDatabase();
    
    // Check if user already registered
    const existing = await db.get("SELECT * FROM affiliates WHERE user_id = ? OR affiliate_email = ?", [req.user.id, req.user.email]);
    if (existing) {
      if (existing.status === 'rejected' || existing.status === 'terminated') {
        const now = new Date().toISOString();
        let ctvCode = existing.ctv_code;
        let affiliateLink = existing.affiliate_link;
        
        if (!ctvCode) {
          ctvCode = await generateUniqueCtvCode(db);
          const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
          affiliateLink = `${clientUrl}?ref=${ctvCode}`;
        }

        await db.run(
          `UPDATE affiliates SET full_name = ?, email = ?, phone = ?, bank_name = ?, bank_account = ?, address = ?, dob = ?, status = 'pending', ctv_code = ?, affiliate_link = ?, created_at = ?
           WHERE user_id = ?`,
          [full_name, email, phone, bank_name, bank_account, address, dob, ctvCode, affiliateLink, now, req.user.id]
        );
        return res.status(200).json({ message: 'Đăng ký lại thành công, vui lòng chờ xét duyệt.' });
      }
      return res.status(400).json({ message: 'Bạn đã đăng ký chương trình affiliate rồi.' });
    }

    // Generate next ctv_code
    const ctvCode = await generateUniqueCtvCode(db);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const affiliateLink = `${clientUrl}?ref=${ctvCode}`;

    const affiliateId = `aff-${Date.now()}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO affiliates (id, user_id, full_name, email, phone, bank_name, bank_account, address, dob, status, ctv_code, ma_ctv, affiliate_link, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [affiliateId, req.user.id, full_name, email, phone, bank_name, bank_account, address, dob, 'pending', ctvCode, ctvCode, affiliateLink, now]
    );

    res.status(201).json({ message: 'Đăng ký thành công, vui lòng chờ xét duyệt.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Check affiliate status for current user
app.get('/api/affiliates/status', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const db = await getDatabase();
    const data = await db.get("SELECT * FROM affiliates WHERE user_id = ? OR affiliate_email = ?", [req.user.id, req.user.email]);
    if (!data) {
      return res.json({ registered: false });
    }
    res.json({ registered: true, ...data });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Record an affiliate link click
app.post('/api/affiliate/clicks', async (req, res) => {
  const { ref, url } = req.body;
  if (!ref) {
    return res.status(400).json({ message: 'Mã giới thiệu không được để trống.' });
  }
  try {
    const db = await getDatabase();
    
    // Look up affiliate by id, ctv_code, or ma_ctv
    const aff = await db.get("SELECT id FROM affiliates WHERE id = ? OR ctv_code = ? OR ma_ctv = ?", [ref, ref, ref]);
    if (!aff) {
      return res.status(404).json({ message: 'Mã giới thiệu không hợp lệ.' });
    }

    const clickId = `clk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO affiliate_clicks (id, affiliate_id, url, ip, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [clickId, aff.id, url || '', ip || null, userAgent || null, now]
    );

    res.status(201).json({ message: 'Ghi nhận lượt nhấp thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Validate a referral/affiliate code
app.get('/api/affiliate/validate', async (req, res) => {
  const { ref } = req.query;
  if (!ref) {
    return res.status(400).json({ valid: false, message: 'Mã giới thiệu không được để trống.' });
  }
  try {
    const db = await getDatabase();
    const aff = await db.get("SELECT id, status, full_name FROM affiliates WHERE id = ? OR ctv_code = ? OR ma_ctv = ?", [ref, ref, ref]);
    if (!aff) {
      if (['REFER100', 'FRIEND2024'].includes(ref.toUpperCase())) {
        return res.json({ valid: true, message: 'Áp dụng mã giới thiệu thành công!' });
      }
      return res.status(404).json({ valid: false, message: 'Mã giới thiệu không hợp lệ.' });
    }
    // Allow referral codes from affiliates that exist in DB, regardless of status
    res.json({ valid: true, name: aff.full_name, message: `Áp dụng mã giới thiệu của ${aff.full_name} thành công!` });
  } catch (error) {
    res.status(500).json({ valid: false, message: 'Lỗi server.', error: error.message });
  }
});

// Get report data for affiliate portal
app.get('/api/affiliate/report', authenticateToken, checkUserStatus, async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const db = await getDatabase();
    
    // 1. Get affiliate record
    const affiliate = await db.get("SELECT * FROM affiliates WHERE user_id = ? OR affiliate_email = ?", [req.user.id, req.user.email]);
    if (!affiliate) {
      return res.status(404).json({ message: "Không tìm thấy thông tin đối tác Affiliate." });
    }

    const affiliateId = affiliate.id;

    // Date filters (if present)
    let dateFilterSql = "";
    const dateParams = [];
    if (startDate && endDate) {
      // Start date: start of day, End date: end of day
      dateFilterSql = " AND (created_at BETWEEN ? AND ?)";
      dateParams.push(`${startDate}T00:00:00.000Z`, `${endDate}T23:59:59.999Z`);
    }

    // 2. Fetch Clicks (Lịch sử nhấp chuột)
    const clicksQuery = `SELECT * FROM affiliate_clicks WHERE affiliate_id = ?${dateFilterSql} ORDER BY created_at DESC`;
    const clicks = await db.all(clicksQuery, [affiliateId, ...dateParams]);

    // 3. Fetch Revenues (Lịch sử hoa hồng & Doanh thu)
    const revenuesQuery = `
      SELECT ar.*, od.product_name AS course_title
      FROM affiliate_revenues ar
      LEFT JOIN order_details od ON od.order_id = ar.order_id AND od.course_id = ar.course_id
      WHERE ar.affiliate_id = ?${dateFilterSql.replace(/created_at/g, 'ar.created_at')}
      ORDER BY ar.created_at DESC
    `;
    const revenues = await db.all(revenuesQuery, [affiliateId, ...dateParams]);

    // 4. Calculate Stats
    const totalClicks = clicks.length;
    
    // Sum of order total for approved/completed/paid orders
    const approvedRevenues = revenues.filter(r => r.status === 'approved' || r.status === 'paid');
    
    const totalOrders = approvedRevenues.length;
    
    // Sum of commission amount for approved/completed/paid orders
    const totalCommission = approvedRevenues.reduce((sum, r) => sum + r.commission_amount, 0);
    
    // Sum of order totals
    const totalRevenue = approvedRevenues.reduce((sum, r) => sum + r.order_total, 0);

    res.json({
      stats: {
        totalClicks,
        totalOrders,
        totalCommission,
        totalRevenue
      },
      clicks,
      revenues
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Admin list affiliates (MANAGER and STAFF only)
app.get('/api/admin/affiliates', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  try {
    const db = await getDatabase();
    const list = await db.all("SELECT * FROM affiliates ORDER BY created_at DESC");
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Admin list affiliate revenues (MANAGER and STAFF only)
app.get('/api/admin/affiliate-revenues', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  try {
    const db = await getDatabase();
    const list = await db.all(`
      SELECT ar.*, a.full_name AS affiliate_name, a.ctv_code, od.product_name AS course_title
      FROM affiliate_revenues ar
      JOIN affiliates a ON a.id = ar.affiliate_id
      LEFT JOIN order_details od ON od.order_id = ar.order_id AND od.course_id = ar.course_id
      ORDER BY ar.created_at DESC
    `);
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách doanh thu.', error: error.message });
  }
});

// Admin update affiliate revenue status (MANAGER and STAFF only)
app.put('/api/admin/affiliate-revenues/:id/status', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'paid', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
  }
  try {
    const db = await getDatabase();
    await db.run("UPDATE affiliate_revenues SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ message: 'Cập nhật trạng thái doanh thu thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Admin update status (MANAGER and STAFF only)
app.put('/api/admin/affiliates/:id/status', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), async (req, res) => {
  const { status } = req.body;
  if (!status || !['approved', 'rejected', 'pending', 'terminated'].includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
  }

  try {
    const db = await getDatabase();
    const affiliate = await db.get("SELECT * FROM affiliates WHERE id = ?", [req.params.id]);
    if (!affiliate) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu affiliate.' });
    }

    await db.run("UPDATE affiliates SET status = ? WHERE id = ?", [status, req.params.id]);

    if (status === 'approved') {
      // Build affiliate email: strip @xxx.com domain, append .drive@gmail.com
      // e.g. ptthong.www@gmail.com -> ptthong.www.drive@gmail.com
      const emailLocalPart = affiliate.email.replace(/@.*$/, '');
      const driveEmail = `${emailLocalPart}.drive@gmail.com`;

      // Get original user's password hash to reuse
      const originalUser = await db.get("SELECT password FROM users WHERE id = ?", [affiliate.user_id]);
      const passwordToUse = originalUser ? originalUser.password : await bcrypt.hash('12345678', 10);

      // Save affiliate_email to affiliates table
      await db.run("UPDATE affiliates SET affiliate_email = ? WHERE id = ?", [driveEmail, req.params.id]);

      const driveUserExists = await db.get("SELECT id, status FROM users WHERE email = ?", [driveEmail]);
      if (!driveUserExists) {
        const driveUserId = `u-aff-${Date.now()}`;
        const now = new Date().toISOString();
        await db.run(
          "INSERT INTO users (id, full_name, email, password, role, status, must_change_password, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [driveUserId, affiliate.full_name, driveEmail, passwordToUse, 'AFFILIATE', 'active', 0, now]
        );
      } else {
        await db.run(
          "UPDATE users SET password = ?, status = 'active', must_change_password = 0 WHERE email = ?",
          [passwordToUse, driveEmail]
        );
      }
    } else if (status === 'terminated') {
      const emailLocalPart = affiliate.email.replace(/@.*$/, '');
      const driveEmail = `${emailLocalPart}.drive@gmail.com`;
      await db.run("UPDATE users SET status = 'blocked' WHERE email = ?", [driveEmail]);
    }

    res.json({ message: 'Cập nhật trạng thái thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// ================= AFFILIATE PORTAL ROUTES =================

// Get courses with commission rates for affiliate portal
app.get('/api/affiliate/courses', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const db = await getDatabase();
    // Get affiliate record by matching the affiliate_email (which is the .drive@gmail.com email)
    const affUser = await db.get(
      "SELECT id as aff_id FROM affiliates WHERE (user_id = ? OR affiliate_email = ? OR email = ?) AND status = 'approved'",
      [req.user.id, req.user.email, req.user.email]
    );
    const affId = affUser ? affUser.aff_id : null;

    const courses = await db.all("SELECT * FROM courses WHERE status = 'published'");
    const result = await Promise.all(courses.map(async (course) => {
      const commRow = await db.get("SELECT commission_rate FROM affiliate_commissions WHERE course_id = ?", [course.id]);
      const rate = commRow ? commRow.commission_rate : 10.0;
      const effectivePrice = course.sale_price || course.price;
      return {
        ...course,
        commission_rate: rate,
        commission_amount: Math.round(effectivePrice * rate / 100),
        affiliate_link: affId ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/courses/${course.id}?ref=${affId}` : null,
        affiliate_id: affId
      };
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

app.put('/api/auth/change-password', authenticateToken, checkUserStatus, async (req, res) => {
  const { new_password } = req.body;
  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
  }
  try {
    const db = await getDatabase();
    const user = await db.get("SELECT password FROM users WHERE id = ?", [req.user.id]);
    if (user) {
      const isSame = await bcrypt.compare(new_password, user.password);
      if (isSame) {
        return res.status(400).json({ message: 'Mật khẩu mới không được trùng với mật khẩu cũ.' });
      }
    }
    const hashed = await bcrypt.hash(new_password, 10);
    await db.run("UPDATE users SET password = ?, must_change_password = 0 WHERE id = ?", [hashed, req.user.id]);
    res.json({ message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Get user profile
app.get('/api/users/profile', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const db = await getDatabase();
    const user = await db.get("SELECT id, full_name, email, phone, role, avatar, must_change_password, status FROM users WHERE id = ?", [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin tài khoản.' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Update user profile (name, phone, email, old_password, new_password)
app.put('/api/users/profile', authenticateToken, checkUserStatus, async (req, res) => {
  const { full_name, phone, email, old_password, new_password } = req.body;
  
  if (!full_name || !full_name.trim()) {
    return res.status(400).json({ message: 'Họ và tên không được để trống.' });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ message: 'Email không được để trống.' });
  }

  const phoneDigits = phone ? phone.replace(/\D/g, '') : '';
  const phonePattern = /^(03|05|07|08|09|02[0-9])[0-9]{8}$/;
  if (phone && !phonePattern.test(phoneDigits)) {
    return res.status(400).json({ message: 'Số điện thoại không đúng định dạng Việt Nam (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09 hoặc 02).' });
  }

  try {
    const db = await getDatabase();

    // Check unique phone
    if (phone && phone.trim()) {
      const existingPhone = await db.get("SELECT * FROM users WHERE phone = ? AND id != ?", [phoneDigits, req.user.id]);
      if (existingPhone) {
        return res.status(400).json({ message: 'Số điện thoại đã tồn tại trên hệ thống.' });
      }
    }

    // Check unique email
    const existingEmail = await db.get("SELECT * FROM users WHERE email = ? AND id != ?", [email.trim(), req.user.id]);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email đã được sử dụng bởi tài khoản khác.' });
    }

    // Fetch user details for password checking
    const userRecord = await db.get("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (!userRecord) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin tài khoản.' });
    }

    // Handle password change
    if (new_password) {
      if (!old_password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu cũ để thay đổi mật khẩu.' });
      }
      if (new_password.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      }
      const match = await bcrypt.compare(old_password, userRecord.password);
      if (!match) {
        return res.status(400).json({ message: 'Mật khẩu cũ không chính xác.' });
      }
      const hashedNew = await bcrypt.hash(new_password, 10);
      await db.run("UPDATE users SET password = ? WHERE id = ?", [hashedNew, req.user.id]);
    }

    // Update profile
    await db.run(
      "UPDATE users SET full_name = ?, phone = ?, email = ? WHERE id = ?",
      [full_name.trim(), phone ? phoneDigits : null, email.trim(), req.user.id]
    );

    // Fetch updated user info to return
    const user = await db.get("SELECT id, full_name, email, phone, role, avatar, must_change_password FROM users WHERE id = ?", [req.user.id]);

    res.json({
      message: 'Cập nhật thông tin thành công.',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Get affiliate notifications for current affiliate user
app.get('/api/affiliate/notifications', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const db = await getDatabase();
    // Look up by affiliate_email column
    const affRecord = await db.get("SELECT id FROM affiliates WHERE user_id = ? OR affiliate_email = ? OR email = ?", [req.user.id, req.user.email, req.user.email]);
    if (!affRecord) return res.json([]);
    const notifications = await db.all(
      "SELECT an.*, c.title as course_title FROM affiliate_notifications an JOIN courses c ON c.id = an.course_id WHERE an.affiliate_id = ? ORDER BY an.created_at DESC",
      [affRecord.id]
    );
    await db.run("UPDATE affiliate_notifications SET read_by_affiliate = 1 WHERE affiliate_id = ?", [affRecord.id]);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Admin: Get all affiliate purchase notifications
app.get('/api/admin/affiliate-notifications', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']),
  async (req, res) => {
  try {
    const db = await getDatabase();
    const notifications = await db.all(`
      SELECT an.*, c.title as course_title, a.full_name as affiliate_name, a.email as affiliate_email
      FROM affiliate_notifications an
      JOIN courses c ON c.id = an.course_id
      JOIN affiliates a ON a.id = an.affiliate_id
      ORDER BY an.created_at DESC
    `);
    await db.run("UPDATE affiliate_notifications SET read_by_admin = 1");
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Admin: Aggregate successful commission rows from the affiliate revenue ledger by month and all time.
app.get('/api/admin/affiliate-commission-stats', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']),
  async (req, res) => {
  const month = /^\d{4}-\d{2}$/.test(req.query.month || '')
    ? req.query.month
    : new Date().toISOString().slice(0, 7);

  try {
    const db = await getDatabase();
    const statistics = await db.all(`
      SELECT
        a.id AS affiliate_id,
        COALESCE(NULLIF(a.ma_ctv, ''), NULLIF(a.ctv_code, '')) AS ctv_code,
        a.full_name,
        a.phone,
        COALESCE(NULLIF(a.affiliate_email, ''), a.email) AS email,
        a.created_at,
        COALESCE(SUM(CASE
          WHEN substr(ar.created_at, 1, 7) = ? AND ar.status IN ('approved', 'paid')
          THEN ar.commission_amount ELSE 0 END), 0) AS monthly_commission,
        COALESCE(SUM(CASE
          WHEN ar.status IN ('approved', 'paid') THEN ar.commission_amount ELSE 0 END), 0) AS total_commission
      FROM affiliates a
      LEFT JOIN affiliate_revenues ar ON ar.affiliate_id = a.id
      WHERE a.status = 'approved'
        AND COALESCE(NULLIF(a.ma_ctv, ''), NULLIF(a.ctv_code, '')) IS NOT NULL
      GROUP BY a.id, a.ma_ctv, a.ctv_code, a.full_name, a.phone, a.email, a.affiliate_email, a.created_at
    `, [month]);
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy thống kê hoa hồng affiliate.', error: error.message });
  }
});

// Get unread notification counts
app.get('/api/affiliate/notification-count', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const db = await getDatabase();
    // Look up by affiliate_email column
    const affRecord = await db.get("SELECT id FROM affiliates WHERE user_id = ? OR affiliate_email = ? OR email = ?", [req.user.id, req.user.email, req.user.email]);
    if (!affRecord) return res.json({ count: 0 });
    const row = await db.get("SELECT COUNT(*) as count FROM affiliate_notifications WHERE affiliate_id = ? AND read_by_affiliate = 0", [affRecord.id]);
    res.json({ count: row.count });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// ================= WITHDRAWAL REQUESTS =================

// Create withdrawal request
app.post('/api/affiliate/withdrawals', authenticateToken, checkUserStatus, async (req, res) => {
  const amount = Number(req.body.amount);
  
  if (!Number.isInteger(amount) || amount < 50000) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
  }

  try {
    const db = await getDatabase();
    
    // Get affiliate info
    const affiliate = await db.get("SELECT * FROM affiliates WHERE (user_id = ? OR affiliate_email = ? OR email = ?) AND status = 'approved'", [req.user.id, req.user.email, req.user.email]);
    if (!affiliate) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin affiliate.' });
    }

    const commission = await db.get(
      "SELECT COALESCE(SUM(commission_amount), 0) AS total FROM affiliate_revenues WHERE affiliate_id = ? AND status IN ('approved', 'paid')",
      [affiliate.id]
    );
    const withdrawn = await db.get(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM withdrawal_requests WHERE affiliate_id = ? AND status IN ('pending', 'completed')",
      [affiliate.id]
    );
    if (amount > Number(commission.total) - Number(withdrawn.total)) {
      return res.status(400).json({ message: 'Số dư khả dụng không đủ.' });
    }

    const withdrawalId = `wd-${Date.now()}`;
    const now = new Date().toISOString();

    const bank_name = req.body.bank_name || affiliate.bank_name;
    const bank_account = req.body.bank_account || affiliate.bank_account;

    const ctvCode = affiliate.ma_ctv || affiliate.ctv_code || 'CTV001';

    await db.run(
      `INSERT INTO withdrawal_requests (id, affiliate_id, ctv_code, amount, bank_name, bank_account, account_holder, phone, email, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        withdrawalId, affiliate.id, ctvCode, amount,
        bank_name, bank_account, affiliate.full_name,
        affiliate.phone, affiliate.email, now
      ]
    );

    res.status(201).json({ message: 'Tạo yêu cầu rút tiền thành công.', withdrawalId });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Get withdrawal history for current affiliate
app.get('/api/affiliate/withdrawals', authenticateToken, checkUserStatus, async (req, res) => {
  try {
    const db = await getDatabase();
    const affiliate = await db.get("SELECT id FROM affiliates WHERE user_id = ? OR affiliate_email = ? OR email = ?", [req.user.id, req.user.email, req.user.email]);
    if (!affiliate) {
      return res.json([]);
    }

    const withdrawals = await db.all(
      `SELECT id, amount, bank_name, bank_account, account_holder, phone, email, status, 
              COALESCE(ctv_code, (SELECT COALESCE(ma_ctv, ctv_code) FROM affiliates WHERE id = affiliate_id)) AS ctv_code,
              created_at, updated_at
       FROM withdrawal_requests
       WHERE affiliate_id = ?
       ORDER BY created_at DESC`,
      [affiliate.id]
    );

    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Admin: Get all withdrawal requests
app.get('/api/admin/withdrawals', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']),
  async (req, res) => {
  try {
    const db = await getDatabase();
    const withdrawals = await db.all(`
      SELECT wr.*, a.full_name as affiliate_name, a.email as affiliate_email, a.phone as affiliate_phone,
             COALESCE(wr.ctv_code, a.ma_ctv, a.ctv_code) AS ctv_code
      FROM withdrawal_requests wr
      JOIN affiliates a ON a.id = wr.affiliate_id
      ORDER BY wr.created_at DESC
    `);
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Admin: Update withdrawal status
app.put('/api/admin/withdrawals/:id/status', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']),
  async (req, res) => {
  const { status, admin_note } = req.body;
  
  if (!status || !['pending', 'completed', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
  }

  try {
    const db = await getDatabase();
    const now = new Date().toISOString();
    
    await db.run(
      "UPDATE withdrawal_requests SET status = ?, admin_note = ?, updated_at = ? WHERE id = ?",
      [status, admin_note || null, now, req.params.id]
    );

    res.json({ message: 'Cập nhật trạng thái thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// ================= HOME BANNER SETTINGS =================

// GET home banner (public)
app.get('/api/home-banner', async (req, res) => {
  try {
    const db = await getDatabase();
    const banner = await db.get('SELECT * FROM home_banner_settings WHERE id = ?', ['banner-main']);
    if (!banner) return res.status(404).json({ message: 'Không tìm thấy cấu hình banner' });
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// PUT home banner (admin only)
app.put('/api/admin/home-banner', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']),
  async (req, res) => {
  try {
    const db = await getDatabase();
    const {
      title_line1, title_line2, title_line3, description,
      badge_text, floating_badge_title, floating_badge_subtitle,
      stat1_value, stat1_label, stat2_value, stat2_label, stat3_value, stat3_label,
      image_url
    } = req.body;

    // Upsert: insert if not exists, else update
    const existing = await db.get('SELECT id FROM home_banner_settings WHERE id = ?', ['banner-main']);
    if (existing) {
      await db.run(
        `UPDATE home_banner_settings SET
          title_line1 = ?, title_line2 = ?, title_line3 = ?,
          description = ?, badge_text = ?,
          floating_badge_title = ?, floating_badge_subtitle = ?,
          stat1_value = ?, stat1_label = ?,
          stat2_value = ?, stat2_label = ?,
          stat3_value = ?, stat3_label = ?,
          image_url = ?
        WHERE id = 'banner-main'`,
        [
          title_line1, title_line2, title_line3,
          description, badge_text,
          floating_badge_title, floating_badge_subtitle,
          stat1_value, stat1_label,
          stat2_value, stat2_label,
          stat3_value, stat3_label,
          image_url
        ]
      );
    } else {
      await db.run(
        `INSERT INTO home_banner_settings (
          id, title_line1, title_line2, title_line3, description,
          badge_text, floating_badge_title, floating_badge_subtitle,
          stat1_value, stat1_label, stat2_value, stat2_label, stat3_value, stat3_label, image_url
        ) VALUES ('banner-main', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title_line1, title_line2, title_line3,
          description, badge_text,
          floating_badge_title, floating_badge_subtitle,
          stat1_value, stat1_label,
          stat2_value, stat2_label,
          stat3_value, stat3_label,
          image_url
        ]
      );
    }

    const updated = await db.get('SELECT * FROM home_banner_settings WHERE id = ?', ['banner-main']);
    res.json({ message: 'Cập nhật banner thành công!', banner: updated });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// ================= PAYMENT METHODS =================

// Get all active payment methods (public)
app.get('/api/payment-methods', async (req, res) => {
  try {
    const db = await getDatabase();
    const methods = await db.all("SELECT * FROM payment_methods WHERE is_active = 1 ORDER BY display_order ASC");
    res.json(methods);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy phương thức thanh toán.', error: error.message });
  }
});

// Admin: Get all payment methods
app.get('/api/admin/payment-methods', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']),
  async (req, res) => {
  try {
    const db = await getDatabase();
    const methods = await db.all("SELECT * FROM payment_methods ORDER BY display_order ASC");
    res.json(methods);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách phương thức thanh toán.', error: error.message });
  }
});

// Admin: Create payment method
app.post('/api/admin/payment-methods', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']),
  async (req, res) => {
  const {
    method_key, method_name, icon, description,
    account_number, account_holder, bank_name,
    qr_code_image, phone_number, is_active, display_order
  } = req.body;
  
  if (!method_key || !method_name) {
    return res.status(400).json({ message: 'Mã phương thức và tên là bắt buộc.' });
  }

  try {
    const db = await getDatabase();
    const id = `pm-${Date.now()}`;
    const now = new Date().toISOString();
    
    await db.run(
      `INSERT INTO payment_methods (id, method_key, method_name, icon, description, account_number, account_holder, bank_name, qr_code_image, phone_number, is_active, display_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, method_key, method_name, icon || null, description || null,
        account_number || null, account_holder || null, bank_name || null,
        qr_code_image || null, phone_number || null, is_active ? 1 : 0, display_order || 0, now, now
      ]
    );
    
    const newMethod = await db.get("SELECT * FROM payment_methods WHERE id = ?", [id]);
    res.status(201).json({ message: 'Tạo phương thức thanh toán thành công.', method: newMethod });
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE')) {
      return res.status(400).json({ message: 'Mã phương thức này đã tồn tại.' });
    }
    res.status(500).json({ message: 'Lỗi server khi tạo phương thức thanh toán.', error: error.message });
  }
});

// Admin: Update payment method
app.put('/api/admin/payment-methods/:id', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']),
  async (req, res) => {
  const { id } = req.params;
  const {
    method_key, method_name, icon, description,
    account_number, account_holder, bank_name,
    qr_code_image, phone_number, is_active, display_order
  } = req.body;
  
  try {
    const db = await getDatabase();
    const existing = await db.get("SELECT * FROM payment_methods WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy phương thức thanh toán.' });
    }

    const now = new Date().toISOString();
    await db.run(
      `UPDATE payment_methods 
       SET method_key = ?, method_name = ?, icon = ?, description = ?, account_number = ?, account_holder = ?, bank_name = ?, qr_code_image = ?, phone_number = ?, is_active = ?, display_order = ?, updated_at = ?
       WHERE id = ?`,
      [
        method_key !== undefined ? method_key : existing.method_key,
        method_name !== undefined ? method_name : existing.method_name,
        icon !== undefined ? icon : existing.icon,
        description !== undefined ? description : existing.description,
        account_number !== undefined ? account_number : existing.account_number,
        account_holder !== undefined ? account_holder : existing.account_holder,
        bank_name !== undefined ? bank_name : existing.bank_name,
        qr_code_image !== undefined ? qr_code_image : existing.qr_code_image,
        phone_number !== undefined ? phone_number : existing.phone_number,
        is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
        display_order !== undefined ? display_order : existing.display_order,
        now,
        id
      ]
    );

    const updated = await db.get("SELECT * FROM payment_methods WHERE id = ?", [id]);
    res.json({ message: 'Cập nhật phương thức thanh toán thành công.', method: updated });
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE')) {
      return res.status(400).json({ message: 'Mã phương thức này đã tồn tại.' });
    }
    res.status(500).json({ message: 'Lỗi server khi cập nhật phương thức thanh toán.', error: error.message });
  }
});


// Admin: Delete payment method
app.delete('/api/admin/payment-methods/:id', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']),
  async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDatabase();
    const result = await db.run("DELETE FROM payment_methods WHERE id = ?", [id]);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phương thức thanh toán.' });
    }
    res.json({ message: 'Xóa phương thức thanh toán thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi xóa phương thức thanh toán.', error: error.message });
  }
});

// ================= AFFILIATE GUIDES =================

// Get all guides (for CTV users)
app.get('/api/affiliate/guides', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const guides = await db.all("SELECT * FROM affiliate_guides ORDER BY display_order ASC");
    res.json(guides);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Admin: Get all guides
app.get('/api/admin/affiliate-guides', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']),
  async (req, res) => {
  try {
    const db = await getDatabase();
    const guides = await db.all("SELECT * FROM affiliate_guides ORDER BY display_order ASC");
    res.json(guides);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Admin: Create guide
app.post('/api/admin/affiliate-guides', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']),
  async (req, res) => {
  const { title, content, display_order } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Tiêu đề và nội dung là bắt buộc.' });
  }
  try {
    const db = await getDatabase();
    const id = `guide-${Date.now()}`;
    const now = new Date().toISOString();
    await db.run(
      "INSERT INTO affiliate_guides (id, title, content, display_order, created_at) VALUES (?, ?, ?, ?, ?)",
      [id, title, content, display_order || 0, now]
    );
    res.status(201).json({ message: 'Tạo tài liệu hướng dẫn thành công.', id });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Admin: Update guide
app.put('/api/admin/affiliate-guides/:id', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']),
  async (req, res) => {
  const { title, content, display_order } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Tiêu đề và nội dung là bắt buộc.' });
  }
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.run(
      "UPDATE affiliate_guides SET title = ?, content = ?, display_order = ?, updated_at = ? WHERE id = ?",
      [title, content, display_order || 0, now, req.params.id]
    );
    res.json({ message: 'Cập nhật tài liệu hướng dẫn thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Admin: Delete guide
app.delete('/api/admin/affiliate-guides/:id', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']),
  async (req, res) => {
  try {
    const db = await getDatabase();
    await db.run("DELETE FROM affiliate_guides WHERE id = ?", [req.params.id]);
    res.json({ message: 'Xóa tài liệu hướng dẫn thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// ================= SITE SETTINGS =================

// Public: Get site settings
app.get('/api/site-settings', async (req, res) => {
  try {
    const db = await getDatabase();
    const settings = await db.get("SELECT * FROM site_settings WHERE id = 'settings-main'");
    if (!settings) {
      return res.json({
        site_name: 'DRIVE MH',
        site_tagline: 'Nền tảng học trực tuyến hàng đầu',
        primary_color: '#2563eb',
        secondary_color: '#1e40af'
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Admin: Get site settings
app.get('/api/admin/site-settings', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']),
  async (req, res) => {
  try {
    const db = await getDatabase();
    const settings = await db.get("SELECT * FROM site_settings WHERE id = 'settings-main'");
    if (!settings) {
      return res.json({
        site_name: 'DRIVE MH',
        site_tagline: 'Nền tảng học trực tuyến hàng đầu',
        primary_color: '#2563eb',
        secondary_color: '#1e40af'
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Admin: Update site settings
app.put('/api/admin/site-settings', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']),
  async (req, res) => {
  const { site_name, site_tagline, logo_url, favicon_url, primary_color, secondary_color } = req.body;
  
  if (!site_name || !site_name.trim()) {
    return res.status(400).json({ message: 'Tên website không được để trống.' });
  }

  try {
    const db = await getDatabase();
    const now = new Date().toISOString();
    
    await db.run(
      `INSERT OR REPLACE INTO site_settings (id, site_name, site_tagline, logo_url, favicon_url, primary_color, secondary_color, updated_at)
       VALUES ('settings-main', ?, ?, ?, ?, ?, ?, ?)`,
      [
        site_name.trim(),
        site_tagline || 'Nền tảng học trực tuyến hàng đầu',
        logo_url || null,
        favicon_url || null,
        primary_color || '#2563eb',
        secondary_color || '#1e40af',
        now
      ]
    );

    const updated = await db.get("SELECT * FROM site_settings WHERE id = 'settings-main'");
    res.json({ message: 'Cập nhật cài đặt website thành công!', settings: updated });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// ================= EMAIL CONFIGURATION =================

// Public: Check if email is configured
app.get('/api/email/status', async (req, res) => {
  try {
    const db = await getDatabase();
    const config = await db.get("SELECT * FROM email_config WHERE id = 'main'");
    const isConfigured = !!(config && config.password && config.password.trim() !== '');
    res.json({ 
      configured: isConfigured,
      email: config?.email || 'ptthong.www@gmail.com'
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Admin: Get email configuration
app.get('/api/admin/email-config', authenticateToken, checkUserStatus, requireRole(['MANAGER']), async (req, res) => {
  try {
    const db = await getDatabase();
    const config = await db.get("SELECT * FROM email_config WHERE id = 'main'");
    // Don't send password in response for security
    if (config) {
      const safeConfig = { ...config };
      delete safeConfig.password;
      res.json(safeConfig);
    } else {
      res.json({
        id: 'main',
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        email: 'ptthong.www@gmail.com',
        from_name: 'DRIVE MH - Học viện trực tuyến'
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy cấu hình email.', error: error.message });
  }
});

// Admin: Update email configuration
app.put('/api/admin/email-config', authenticateToken, checkUserStatus, requireRole(['MANAGER']), async (req, res) => {
  const { service, host, port, secure, email, password, from_name } = req.body;
  
  if (!email || !email.trim()) {
    return res.status(400).json({ message: 'Email là bắt buộc.' });
  }

  try {
    const db = await getDatabase();
    const now = new Date().toISOString();
    
    await db.run(
      `INSERT OR REPLACE INTO email_config (id, service, host, port, secure, email, password, from_name, updated_at)
       VALUES ('main', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        service || 'gmail',
        host || 'smtp.gmail.com',
        port || 587,
        secure ? 1 : 0,
        email.trim(),
        password || '',
        from_name || 'DRIVE MH - Học viện trực tuyến',
        now
      ]
    );

    res.json({ message: 'Cập nhật cấu hình email thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi cập nhật cấu hình email.', error: error.message });
  }
});

// ================= AFFILIATE TERMS & CONDITIONS =================

// Public/CTV: Get affiliate terms
app.get('/api/affiliate/settings/terms', async (req, res) => {
  try {
    const db = await getDatabase();
    const setting = await db.get("SELECT value FROM affiliate_settings WHERE key = 'terms_content'");
    res.json({ terms: setting ? setting.value : '' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Admin: Get affiliate terms
app.get('/api/admin/affiliate/settings/terms', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']),
  async (req, res) => {
  try {
    const db = await getDatabase();
    const setting = await db.get("SELECT value FROM affiliate_settings WHERE key = 'terms_content'");
    res.json({ terms: setting ? setting.value : '' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// Admin: Update affiliate terms
app.put('/api/admin/affiliate/settings/terms', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']),
  async (req, res) => {
  const { terms } = req.body;
  if (terms === undefined) {
    return res.status(400).json({ message: 'Nội dung điều khoản là bắt buộc.' });
  }
  try {
    const db = await getDatabase();
    await db.run("INSERT OR REPLACE INTO affiliate_settings (key, value) VALUES ('terms_content', ?)", [terms]);
    res.json({ message: 'Cập nhật điều khoản thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
});

// ================= IMAGE UPLOAD =================

// POST /api/admin/upload-image — any authenticated user can upload an image
app.post('/api/admin/upload-image', upload.single('image'), authenticateToken, checkUserStatus, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không có file được tải lên' });
  }
  const imageUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
  res.json({ url: imageUrl, filename: req.file.filename });
});

// ================= FORGOT / RESET PASSWORD =================

// POST /api/forgot-password — gửi email chứa link đặt lại mật khẩu
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Vui lòng nhập email' });

    const db = await getDatabase();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(404).json({ message: 'Chưa có tài khoản với email này, vui lòng đăng ký' });
    }

    // Generate secure token
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const tokenId = 'rt-' + Date.now();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Invalidate old tokens for this user
    await db.run('UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?', [user.id]);

    // Save new token
    await db.run(
      'INSERT INTO password_reset_tokens (id, user_id, token, expires_at, used, created_at) VALUES (?, ?, ?, ?, 0, ?)',
      [tokenId, user.id, token, expiresAt, new Date().toISOString()]
    );

    // Get site name and email config from DB
    const config = await db.get("SELECT * FROM email_config WHERE id = 'main'");
    const siteSettings = await db.get("SELECT * FROM site_settings WHERE id = 'settings-main'");
    const siteName = siteSettings?.site_name || 'DRIVE MH';
    const fromEmail = (config && config.email) ? config.email : 'ptthong.www@gmail.com';
    // Always build fromName from siteName so it stays in sync with admin settings
    const fromName = `${siteName} - Học viện trực tuyến`;

    // Build reset link
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    // Send email
    const { getTransporter } = require('./emailService');

    // Force fresh transporter
    const transport = await getTransporter();

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: `Đặt lại mật khẩu - ${siteName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Đặt lại mật khẩu</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">${siteName}</h1>
              <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 14px;">Nền tảng học trực tuyến hàng đầu</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px; text-align: center;">
              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px auto;">
                <tr>
                  <td align="center" valign="middle" style="width: 80px; height: 80px; background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 50%; text-align: center; vertical-align: middle;">
                    <span style="font-size: 36px; line-height: 80px; display: block; text-align: center;">🔑</span>
                  </td>
                </tr>
              </table>
              <h2 style="color: #111827; margin: 0 0 12px 0; font-size: 24px; font-weight: bold;">Đặt lại mật khẩu</h2>
              <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 15px; line-height: 1.6;">
                Xin chào <strong style="color: #111827;">${user.full_name || user.email}</strong>,
              </p>
              <p style="color: #6b7280; margin: 0 0 32px 0; font-size: 15px; line-height: 1.6;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.<br>
                Nhấn vào nút bên dưới để tạo mật khẩu mới. Link có hiệu lực trong <strong style="color: #ef4444;">1 giờ</strong>.
              </p>

              <!-- Reset Button -->
              <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); letter-spacing: 0.3px;">
                🔐 Đặt lại mật khẩu ngay
              </a>

              <p style="color: #9ca3af; margin: 28px 0 0 0; font-size: 13px; line-height: 1.6;">
                Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.<br>
                Mật khẩu của bạn sẽ không thay đổi.
              </p>
            </div>

            <!-- Warning Box -->
            <div style="padding: 20px 30px; background-color: #fef3c7; border-top: 1px solid #fbbf24;">
              <div style="background-color: #ffffff; border-radius: 8px; padding: 16px; border: 2px dashed #f59e0b;">
                <p style="color: #92400e; margin: 0; font-size: 13px; line-height: 1.6;">
                  ⚠️ <strong>Lưu ý bảo mật:</strong> Link này chỉ có hiệu lực <strong>1 lần</strong> và sẽ hết hạn sau <strong>1 giờ</strong>. 
                  Không chia sẻ link này với bất kỳ ai.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 24px 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 6px 0; font-size: 13px;">
                Cảm ơn bạn đã tin tưởng <strong>${siteName}</strong>!
              </p>
              <p style="color: #9ca3af; margin: 0; font-size: 11px;">
                © 2026 ${siteName}. All rights reserved. | Email: ${fromEmail}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Đặt lại mật khẩu ${siteName}\n\nXin chào ${user.full_name || user.email},\n\nNhấn vào link sau để đặt lại mật khẩu (có hiệu lực 1 giờ):\n${resetLink}\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.\n\nTrân trọng,\n${siteName}`
    };

    console.log(`[FORGOT-PWD] Sending reset email FROM: ${fromEmail} TO: ${email}`);
    const result = await transport.sendMail(mailOptions);
    console.log(`[FORGOT-PWD] Email sent successfully to ${email}`);
    console.log(`[FORGOT-PWD] MessageId: ${result.messageId}`);
    console.log(`[FORGOT-PWD] Envelope:`, result.envelope);
    console.log(`[FORGOT-PWD] Accepted:`, result.accepted);
    console.log(`[FORGOT-PWD] Rejected:`, result.rejected);

    res.json({ success: true, message: 'Đã gửi link đặt lại mật khẩu đến email của bạn' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại' });
  }
});

// POST /api/reset-password — xác thực token và cập nhật mật khẩu mới
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Thiếu thông tin' });
    if (password.length < 6) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });

    const db = await getDatabase();

    // Find valid token
    const resetRecord = await db.get(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0',
      [token]
    );

    if (!resetRecord) {
      return res.status(400).json({ message: 'Link đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng' });
    }

    // Check expiry
    if (new Date(resetRecord.expires_at) < new Date()) {
      return res.status(400).json({ message: 'Link đặt lại mật khẩu đã hết hạn, vui lòng yêu cầu lại' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, resetRecord.user_id]);

    // Mark token as used
    await db.run('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [resetRecord.id]);

    res.json({ success: true, message: 'Mật khẩu đã được cập nhật thành công' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại' });
  }
});

// GET /api/reset-password/verify — kiểm tra token có hợp lệ không
app.get('/api/reset-password/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ valid: false, message: 'Thiếu token' });

    const db = await getDatabase();
    const resetRecord = await db.get(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0',
      [token]
    );

    if (!resetRecord) {
      return res.json({ valid: false, message: 'Link không hợp lệ hoặc đã được sử dụng' });
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      return res.json({ valid: false, message: 'Link đã hết hạn' });
    }

    res.json({ valid: true });
  } catch (error) {
    res.status(500).json({ valid: false, message: 'Có lỗi xảy ra' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
