const { app, request, registerUser } = require('./setup');

describe('Auth API', () => {
  let registeredEmail;
  let userToken;

  it('should register a new user successfully', async () => {
    registeredEmail = `auth-test-${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: registeredEmail, password: 'password123', name: '測試用戶' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('error', null);
    expect(res.body).toHaveProperty('message');
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user).toHaveProperty('email', registeredEmail);
    expect(res.body.data.user).toHaveProperty('role', 'user');

    userToken = res.body.data.token;
  });

  it('should fail to register with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: registeredEmail, password: 'password123', name: '重複用戶' });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('data', null);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).not.toBeNull();
  });

  it('should sync guest cart into member cart after registration', async () => {
    const sessionId = `register-cart-${Date.now()}`;
    const productsRes = await request(app).get('/api/products');
    const product = productsRes.body.data.products.find(item => item.stock >= 2);
    const productId = product.id;

    const guestCartRes = await request(app)
      .post('/api/cart')
      .set('X-Session-Id', sessionId)
      .send({ productId, quantity: 2 });

    expect(guestCartRes.status).toBe(200);

    const registerRes = await request(app)
      .post('/api/auth/register')
      .set('X-Session-Id', sessionId)
      .send({
        email: `cart-sync-${Date.now()}@example.com`,
        password: 'password123',
        name: 'Cart Sync User'
      });

    expect(registerRes.status).toBe(201);

    const memberCartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${registerRes.body.data.token}`);

    expect(memberCartRes.status).toBe(200);
    expect(memberCartRes.body.data.items).toHaveLength(1);
    expect(memberCartRes.body.data.items[0]).toMatchObject({
      product_id: productId,
      quantity: 2
    });
  });

  it('should login successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@hexschool.com', password: '12345678' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('error', null);
    expect(res.body).toHaveProperty('message');
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toHaveProperty('email', 'admin@hexschool.com');
  });

  it('should sync guest cart into member cart after login', async () => {
    const email = `login-cart-sync-${Date.now()}@example.com`;
    await request(app)
      .post('/api/auth/register')
      .send({ email, password: 'password123', name: 'Login Cart Sync User' });

    const sessionId = `login-cart-${Date.now()}`;
    const productsRes = await request(app).get('/api/products');
    const product = productsRes.body.data.products.find(item => item.stock >= 1);
    const productId = product.id;

    const guestCartRes = await request(app)
      .post('/api/cart')
      .set('X-Session-Id', sessionId)
      .send({ productId, quantity: 1 });

    expect(guestCartRes.status).toBe(200);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .set('X-Session-Id', sessionId)
      .send({ email, password: 'password123' });

    expect(loginRes.status).toBe(200);

    const memberCartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${loginRes.body.data.token}`);

    expect(memberCartRes.status).toBe(200);
    expect(memberCartRes.body.data.items).toHaveLength(1);
    expect(memberCartRes.body.data.items[0]).toMatchObject({
      product_id: productId,
      quantity: 1
    });
  });

  it('should fail login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@hexschool.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('data', null);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).not.toBeNull();
  });

  it('should get profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('error', null);
    expect(res.body).toHaveProperty('message');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('email', registeredEmail);
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data).toHaveProperty('role');
  });

  it('should fail to get profile without token', async () => {
    const res = await request(app)
      .get('/api/auth/profile');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).not.toBeNull();
  });
});
