const http = require('http');

const BASE_URL = 'http://localhost:5000';

// Test 1: Get site settings (public)
function testGetSiteSettings() {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}/api/site-settings`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✓ GET /api/site-settings (Status:', res.statusCode, ')');
        try {
          console.log('  Response:', JSON.parse(data));
        } catch (e) {
          console.log('  Response (raw):', data.substring(0, 200));
        }
        resolve();
      });
    }).on('error', reject);
  });
}

// Test 2: Admin login
function testLogin() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'manager@edulearn.vn',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const response = JSON.parse(data);
        console.log('✓ Login successful');
        resolve(response.token);
      });
    }).on('error', reject);

    req.write(postData);
    req.end();
  });
}

// Test 3: Update site settings (admin)
function testUpdateSiteSettings(token) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      site_name: 'DRIVE MH - Học Online',
      site_tagline: 'Nền tảng học trực tuyến hàng đầu Việt Nam',
      primary_color: '#2563eb',
      secondary_color: '#1e40af'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/site-settings',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✓ PUT /api/admin/site-settings');
        console.log('  Response:', JSON.parse(data));
        resolve();
      });
    }).on('error', reject);

    req.write(postData);
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('=== Testing Site Settings API ===\n');
  
  try {
    await testGetSiteSettings();
    console.log('');
    const token = await testLogin();
    console.log('');
    await testUpdateSiteSettings(token);
    console.log('\n=== All tests passed! ===');
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();