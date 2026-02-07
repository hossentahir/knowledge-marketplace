/**
 * Quick script to test the API and create the database.
 * Run with: node scripts/test-api.js
 * Make sure the server is running first (npm start).
 */

const http = require('http');

const makeRequest = (path, method, body) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data && { 'Content-Length': Buffer.byteLength(data) }),
        },
      },
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
  console.log('1. Testing health...');
  const health = await makeRequest('/api/health', 'GET');
  console.log('   ', health.status === 200 ? '✓' : '✗', health.data);

  if (health.status !== 200) {
    console.log('\n   Server may not be running. Start it with: npm start');
    process.exit(1);
  }

  console.log('\n2. Registering test user...');
  const register = await makeRequest('/api/auth/register', 'POST', {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'student',
  });
  console.log('   ', register.status === 201 ? '✓' : '✗', register.data);

  if (register.status === 400 && register.data.message?.includes('already')) {
    console.log('   (User already exists, that\'s OK)');
  }

  console.log('\n3. Logging in...');
  const login = await makeRequest('/api/auth/login', 'POST', {
    email: 'test@example.com',
    password: 'password123',
  });
  console.log('   ', login.status === 200 ? '✓' : '✗', login.status === 200 ? 'Token received' : login.data);

  console.log('\nDone! Database should now appear in Compass.');
}

run().catch((err) => {
  console.error('Error:', err.message);
  console.log('\nIs the server running? Start it with: npm start');
  process.exit(1);
});
