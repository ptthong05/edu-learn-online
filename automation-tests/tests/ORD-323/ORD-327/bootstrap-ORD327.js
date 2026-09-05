const http = require('http');

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

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

(async () => {
  const login = await request(
    'POST',
    '/api/auth/login',
    {
      email: 'manager@edulearn.vn',
      password: 'admin123'
    }
  );

  if (login.status !== 200 || !login.body.token) {
    throw new Error(`Admin login failed: HTTP ${login.status}`);
  }

  const token = login.body.token;
  const runId = Date.now().toString();
  const suffix = runId.slice(-8);

  const fixtures = [
    {
      code: `PCT${suffix}`,
      discount: 20,
      discount_type: 'percent',
      min_order_amount: 0,
      expired_date: '2099-12-31'
    },
    {
      code: `FIX${suffix}`,
      discount: 50000,
      discount_type: 'fixed',
      min_order_amount: 0,
      expired_date: '2099-12-31'
    },
    {
      code: `EXP${suffix}`,
      discount: 10,
      discount_type: 'percent',
      min_order_amount: 0,
      expired_date: '2020-01-01'
    },
    {
      code: `MIN${suffix}`,
      discount: 10,
      discount_type: 'percent',
      min_order_amount: 100000,
      expired_date: '2099-12-31'
    }
  ];

  for (const fixture of fixtures) {
    const result = await request(
      'POST',
      '/api/admin/coupons',
      {
        ...fixture,
        quantity: 100,
        status: 'active',
        usable_by: 'user',
        description: `ORD-327 bootstrap ${runId}`
      },
      token
    );

    if (result.status !== 201) {
      throw new Error(
        `Create coupon ${fixture.code} failed: HTTP ${result.status}`
      );
    }
  }

  const env = {
    id: 'ord327-bootstrap',
    name: 'ORD-327 Bootstrap',
    values: [
      { key: 'adminToken', value: token, enabled: true },
      { key: 'testRunId', value: runId, enabled: true },
      { key: 'couponPercentCode', value: `PCT${suffix}`, enabled: true },
      { key: 'couponFixedCode', value: `FIX${suffix}`, enabled: true },
      { key: 'couponExpiredCode', value: `EXP${suffix}`, enabled: true },
      { key: 'couponMinCode', value: `MIN${suffix}`, enabled: true }
    ]
  };

  require('fs').writeFileSync(
    'automation-tests/tests/ORD-323/ORD-327/bootstrap-env.json',
    JSON.stringify(env, null, 2)
  );

  console.log('ORD-327 bootstrap completed');
})();