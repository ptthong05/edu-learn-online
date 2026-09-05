const http = require('http');
const fs = require('fs');

const baseUrl = 'http://localhost:5000';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;

    const req = http.request(
      `${baseUrl}${path}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
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

  const testEmail = `ord329_${runId}@edulearn.test`;
  const testPassword = 'Pass123!@#';
  const testPhone = `09${suffix}`;

  // 1. Tao user moi de dam bao 5.1 registered=false
  const register = await request(
    'POST',
    '/api/auth/register',
    {
      full_name: 'ORD 329 Newman',
      email: testEmail,
      password: testPassword,
      phone: testPhone
    }
  );

  if (register.status !== 201) {
    console.log('Register response:', register.body);
    throw new Error(`Register failed: HTTP ${register.status}`);
  }

  // 2. Login user
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
    throw new Error(`Login failed: HTTP ${login.status}`);
  }

  // 3. Export environment
  const env = {
    id: 'ord329-bootstrap',
    name: 'ORD-329 Bootstrap',
    values: [
      {
        key: 'baseUrl',
        value: baseUrl,
        enabled: true
      },
      {
        key: 'testRunId',
        value: runId,
        enabled: true
      },
      {
        key: 'testEmail',
        value: testEmail,
        enabled: true
      },
      {
        key: 'testPhone',
        value: testPhone,
        enabled: true
      },
      {
        key: 'authToken',
        value: login.body.token,
        enabled: true
      }
    ]
  };

  fs.writeFileSync(
    'automation-tests/tests/ORD-323/ORD-329/bootstrap-env.json',
    JSON.stringify(env, null, 2)
  );

  console.log('ORD-329 bootstrap completed');
})();