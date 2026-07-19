const { app, request, registerUser } = require('./setup');
const { buildCheckMacValue } = require('../src/services/ecpay');

describe('Orders API', () => {
  let userToken;
  let productId;
  let orderId;
  let merchantTradeNo;
  let orderTotalAmount;
  let productImageUrl;

  it('should match the official AioCheckOut CheckMacValue example', () => {
    const value = buildCheckMacValue({
      TradeDesc: '促銷方案',
      PaymentType: 'aio',
      MerchantTradeDate: '2023/03/12 15:30:23',
      MerchantTradeNo: 'ecpay20230312153023',
      MerchantID: '3002607',
      ReturnURL: 'https://www.ecpay.com.tw/receive.php',
      ItemName: 'Apple iphone 15',
      TotalAmount: '30000',
      ChoosePayment: 'ALL',
      EncryptType: '1'
    }, {
      hashKey: 'pwFHCqoQZGmho4w6',
      hashIv: 'EkRm7iFT261dpevs'
    });

    expect(value).toBe('6C51C9E6888DE861FD62FB1DD17029FC742634498FD813DC43D4243B5685B840');
  });

  it('should keep hyphen and dot characters compatible with ecpay .NET urlencode rules', () => {
    const value = buildCheckMacValue({
      MerchantID: '3002607',
      MerchantTradeNo: 'EC-TRADE-0001',
      MerchantTradeDate: '2026/04/19 23:30:00',
      PaymentType: 'aio',
      TotalAmount: '1680',
      TradeDesc: 'Order ORD-20260419-ABCDE',
      ItemName: 'Test.Product_One*1',
      ReturnURL: 'https://demo-test.ngrok-free.app/api/payments/ecpay/return',
      OrderResultURL: 'https://demo-test.ngrok-free.app/payments/ecpay/result',
      ChoosePayment: 'Credit',
      EncryptType: '1'
    }, {
      hashKey: 'pwFHCqoQZGmho4w6',
      hashIv: 'EkRm7iFT261dpevs'
    });

    expect(value).toMatch(/^[A-F0-9]{64}$/);
  });

  it('should include empty string fields in CheckMacValue calculation per ecpay spec', () => {
    const value = buildCheckMacValue({
      MerchantID: '3002607',
      MerchantTradeNo: 'ECPAY1738978034',
      StoreID: '',
      RtnCode: '1',
      RtnMsg: '交易成功',
      TradeNo: '2502080927183709',
      TradeAmt: '30',
      PaymentDate: '2025/02/08 09:32:20',
      PaymentType: 'Credit_CreditCard',
      PaymentTypeChargeFee: '1',
      TradeDate: '2025/02/08 09:27:18',
      SimulatePaid: '0',
      CustomField1: '',
      CustomField2: '',
      CustomField3: '',
      CustomField4: ''
    }, {
      hashKey: 'pwFHCqoQZGmho4w6',
      hashIv: 'EkRm7iFT261dpevs'
    });

    expect(value).toBe('C66199663DD43BF01058218601BEE874315E5FF57A1FE112A9114AC3701947BA');
  });

  beforeAll(async () => {
    const { token } = await registerUser();
    userToken = token;

    const prodRes = await request(app).get('/api/products');
    const product = prodRes.body.data.products.find(item => item.stock >= 1);
    productId = product.id;
    productImageUrl = product.image_url;

    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, quantity: 1 });
  });

  it('should create an order from cart and return ecpay payload', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        recipientName: '測試收件人',
        recipientEmail: 'recipient@example.com',
        recipientAddress: '台北市測試路 123 號'
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('order_no');
    expect(res.body.data).toHaveProperty('status', 'pending');
    expect(res.body.data).toHaveProperty('payment_status', 'pending');
    expect(res.body.data).toHaveProperty('payment');
    expect(res.body.data.items[0]).toHaveProperty('product_image_url', productImageUrl);
    expect(res.body.data.payment).toHaveProperty('action');
    expect(res.body.data.payment.fields).toHaveProperty('ChoosePayment', 'Credit');
    expect(res.body.data.payment.fields).toHaveProperty('MerchantTradeNo');
    expect(res.body.data.payment.fields).toHaveProperty(
      'OrderResultURL',
      (process.env.ECPAY_CLIENT_BACK_BASE_URL || process.env.BASE_URL || 'http://localhost:3001').replace(/\/$/, '') + '/payments/ecpay/result'
    );
    expect(res.body.data.payment.fields).toHaveProperty('CheckMacValue');

    orderId = res.body.data.id;
    merchantTradeNo = res.body.data.payment.fields.MerchantTradeNo;
    orderTotalAmount = res.body.data.total_amount;
  });

  it('should return ecpay checkout payload for a pending order', async () => {
    const res = await request(app)
      .post(`/api/orders/${orderId}/ecpay-checkout`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('payment');
    expect(res.body.data.payment.fields).toHaveProperty('MerchantTradeNo', merchantTradeNo);
  });

  it('should fail to create order with empty cart', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        recipientName: '測試收件人',
        recipientEmail: 'recipient@example.com',
        recipientAddress: '台北市測試路 123 號'
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('data', null);
    expect(res.body).toHaveProperty('error');
  });

  it('should fail to create order without auth', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        recipientName: '測試收件人',
        recipientEmail: 'recipient@example.com',
        recipientAddress: '台北市測試路 123 號'
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should get order list', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.orders)).toBe(true);
    expect(res.body.data.orders.length).toBeGreaterThan(0);
    expect(res.body.data.orders[0]).toHaveProperty('payment_status');
    expect(res.body.data.orders[0]).toHaveProperty('product_image_url', productImageUrl);
  });

  it('should get order detail with payment fields', async () => {
    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id', orderId);
    expect(res.body.data).toHaveProperty('merchant_trade_no', merchantTradeNo);
    expect(res.body.data).toHaveProperty('payment_provider', 'ecpay');
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items[0]).toHaveProperty('product_image_url', productImageUrl);
  });

  it('should update order status after valid ecpay callback', async () => {
    const callbackPayload = {
      MerchantID: process.env.ECPAY_MERCHANT_ID || '3002607',
      MerchantTradeNo: merchantTradeNo,
      StoreID: '',
      RtnCode: '1',
      RtnMsg: 'Succeeded',
      TradeNo: 'ECPAY1234567890',
      TradeAmt: String(orderTotalAmount),
      PaymentDate: '2026/04/19 23:00:00',
      PaymentType: 'Credit_CreditCard',
      TradeDate: '2026/04/19 23:00:00',
      SimulatePaid: '0'
    };

    callbackPayload.CheckMacValue = buildCheckMacValue(callbackPayload);

    const callbackRes = await request(app)
      .post('/api/payments/ecpay/return')
      .type('form')
      .send(callbackPayload);

    expect(callbackRes.status).toBe(200);
    expect(callbackRes.text).toBe('1|OK');

    const detailRes = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data).toHaveProperty('status', 'paid');
    expect(detailRes.body.data).toHaveProperty('payment_status', 'paid');
    expect(detailRes.body.data).toHaveProperty('payment_method', 'Credit_CreditCard');
  });

  it('should redirect order result page back to order detail', async () => {
    const res = await request(app)
      .post('/payments/ecpay/result')
      .type('form')
      .send({
        MerchantTradeNo: merchantTradeNo,
        RtnCode: '1'
      });

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain(`/orders/${orderId}`);
    expect(res.headers.location).toContain('payment=success');
  });

  it('should return 404 for non-existent order', async () => {
    const res = await request(app)
      .get('/api/orders/non-existent-order-id')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('data', null);
    expect(res.body).toHaveProperty('error');
  });
});
