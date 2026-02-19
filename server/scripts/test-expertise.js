/**
 * Test POST /api/expertise (teacher only).
 * Run with: node scripts/test-expertise.js
 * Make sure the server is running first (npm start).
 */

const http = require('http');

const makeRequest = (path, method, body, token) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(data && { 'Content-Length': Buffer.byteLength(data) }),
    };
    const req = http.request(
      { hostname: 'localhost', port: 5000, path, method, headers },
      (res) => {
        let chunks = '';
        res.on('data', (chunk) => (chunks += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(chunks) });
          } catch {
            resolve({ status: res.statusCode, data: chunks });
          }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

async function run() {
  console.log('1. Registering teacher...');
  const register = await makeRequest('/api/auth/register', 'POST', {
    name: 'Test Teacher',
    email: 'teacher@example.com',
    password: 'password123',
    role: 'teacher',
  });
  if (register.status === 400 && register.data.message?.includes('already')) {
    console.log('   Teacher already exists, continuing.');
  } else if (register.status !== 201) {
    console.log('   ', register.data);
  } else {
    console.log('   OK');
  }

  console.log('\n2. Logging in as teacher...');
  const login = await makeRequest('/api/auth/login', 'POST', {
    email: 'teacher@example.com',
    password: 'password123',
  });
  if (login.status !== 200) {
    console.log('   Failed:', login.data);
    process.exit(1);
  }
  const token = login.data.token;
  console.log('   Token received');

  console.log('\n3. POST /api/expertise...');
  const expertise = await makeRequest(
    '/api/expertise',
    'POST',
    {
      title: 'Java OOP Basics',
      description: 'Classes, objects, inheritance',
      price: 500,
    },
    token
  );
  console.log('   Status:', expertise.status);
  console.log('   Response:', expertise.data);

  if (expertise.status === 201) {
    console.log('\n✓ POST /api/expertise test passed.');
  } else {
    console.log('\n✗ Test failed.');
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
