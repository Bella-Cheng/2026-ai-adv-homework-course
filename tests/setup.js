const request = require('supertest');
const app = require('../app');

async function getAdminToken() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@hexschool.com', password: '12345678' });

  return res.body.data.token;
}

async function registerUser(overrides = {}) {
  const email = overrides.email || `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      email,
      password: overrides.password || 'password123',
      name: overrides.name || '測試使用者'
    });

  return { token: res.body.data.token, user: res.body.data.user };
}

module.exports = { app, request, getAdminToken, registerUser };
