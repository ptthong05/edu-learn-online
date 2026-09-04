const http = require('http');
const fs = require('fs');

const baseUrl = 'http://localhost:5000';

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;

    const req = http.request(
      `${baseUrl}${path}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
        }
      },
      res => {
        let raw = '';

        res.on('data', chunk => {
          raw += chunk;
        });

        res.on('end', () => {
          let json = {};

          try {
            json = raw ? JSON.parse(raw) : {};
          } catch (_) {}

          resolve({
            status: res.statusCode,
            body: json
          });
        });
      }
    );

    req.on('error', reject);

    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  const runId = Date.now().toString();
  const suffix = runId.slice(-8);

  const testEmail = `ord330_${runId}@edulearn.test`;
  const testPassword = 'Pass123!@#';
  const testPhone = `09${suffix}`;

  // 1. Register test user
  const register = await request(
    'POST',
    '/api/auth/register',
    {
      full_name: 'ORD 330 Newman',
      email: testEmail,
      password: testPassword,
      phone: testPhone
    }
  );

  if (register.status !== 201) {
    console.log('Register response:', register.body);
    throw new Error(`Register failed: HTTP ${register.status}`);
  }

  // 2. Login test user
  const login = await request(
    'POST',
    '/api/auth/login',
    {
      email: testEmail,
      password: testPassword
    }
  );

  if (login.status !== 200 || !login.body.token) {
    console.log('Login response:', login.body);
    throw new Error(`User login failed: HTTP ${login.status}`);
  }

  const authToken = login.body.token;

  // 3. Login admin
  const adminLogin = await request(
    'POST',
    '/api/auth/login',
    {
      email: 'manager@edulearn.vn',
      password: 'admin123'
    }
  );

  if (adminLogin.status !== 200 || !adminLogin.body.token) {
    throw new Error(`Admin login failed: HTTP ${adminLogin.status}`);
  }

  const adminToken = adminLogin.body.token;

  // 4. Get course
  const courses = await request('GET', '/api/courses');

  const courseList = Array.isArray(courses.body)
    ? courses.body
    : courses.body.courses;

  if (!Array.isArray(courseList) || courseList.length === 0) {
    throw new Error('Không tìm thấy course cho ORD-330');
  }

  const course = courseList.find(c => Number(c.price) > 0) || courseList[0];

  // 5. Create order để có orderId
  const order = await request(
    'POST',
    '/api/orders',
    {
      items: [
        {
          course_id: course.id,
          price: course.price,
          product_name: course.title || course.name || 'Test Course'
        }
      ],
      payment_method: 'banking',
      total: course.price,
      coupon_code: '',
      payment_qr_content: `ORD330-${runId}`
    },
    authToken
  );

  if (order.status !== 201 || !order.body.orderId) {
    console.log('Order response:', order.body);
    throw new Error(`Create order failed: HTTP ${order.status}`);
  }

  // 6. Export environment
  const env = {
    id: 'ord330-bootstrap',
    name: 'ORD-330 Bootstrap',
    values: [
      { key: 'baseUrl', value: baseUrl, enabled: true },
      { key: 'testRunId', value: runId, enabled: true },
      { key: 'testEmail', value: testEmail, enabled: true },
      { key: 'testPassword', value: testPassword, enabled: true },
      { key: 'authToken', value: authToken, enabled: true },
      { key: 'adminToken', value: adminToken, enabled: true },
      { key: 'courseId', value: String(course.id), enabled: true },
      { key: 'orderId', value: String(order.body.orderId), enabled: true }
    ]
  };

  fs.writeFileSync(
    'automation-tests/tests/ORD-323/ORD-330/bootstrap-env.json',
    JSON.stringify(env, null, 2)
  );

  console.log('ORD-330 bootstrap completed');
  console.log(`Order ID: ${order.body.orderId}`);
})();