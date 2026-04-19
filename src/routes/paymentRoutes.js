const express = require('express');
const db = require('../database');
const { parseOrderResultPayload, verifyCheckMacValue } = require('../services/ecpay');

const router = express.Router();

function getClientBaseUrl() {
  return (process.env.ECPAY_CLIENT_BACK_BASE_URL || process.env.BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
}

function getOrderByMerchantTradeNo(merchantTradeNo) {
  return db.prepare('SELECT * FROM orders WHERE merchant_trade_no = ?').get(merchantTradeNo);
}

function updatePaidOrder(order, payload) {
  db.prepare(
    `UPDATE orders
     SET status = ?, payment_status = ?, payment_method = ?, ecpay_trade_no = ?, payment_at = ?, payment_raw_payload = ?
     WHERE id = ?`
  ).run(
    'paid',
    'paid',
    payload.PaymentType || 'Credit',
    payload.TradeNo || null,
    payload.PaymentDate || new Date().toISOString(),
    JSON.stringify(payload),
    order.id
  );
}

function updateFailedOrder(order, payload) {
  db.prepare(
    `UPDATE orders
     SET status = ?, payment_status = ?, payment_raw_payload = ?
     WHERE id = ?`
  ).run(
    'pending',
    'failed',
    JSON.stringify(payload),
    order.id
  );
}

router.post('/ecpay/return', (req, res) => {
  const payload = req.body || {};

  if (!payload.MerchantTradeNo || !payload.CheckMacValue) {
    return res.status(400).type('text/plain').send('0|Missing required fields');
  }

  if (!verifyCheckMacValue(payload)) {
    return res.status(400).type('text/plain').send('0|CheckMacValue failed');
  }

  const order = getOrderByMerchantTradeNo(payload.MerchantTradeNo);
  if (!order) {
    return res.status(404).type('text/plain').send('0|Order not found');
  }

  if (String(payload.TradeAmt) !== String(order.total_amount)) {
    return res.status(400).type('text/plain').send('0|Trade amount mismatch');
  }

  const isSuccess = String(payload.RtnCode) === '1';

  if (isSuccess) {
    if (order.payment_status !== 'paid') {
      updatePaidOrder(order, payload);
    }
  } else if (order.payment_status === 'pending') {
    updateFailedOrder(order, payload);
  }

  return res.type('text/plain').send('1|OK');
});

router.post('/ecpay/result', (req, res) => {
  const payload = parseOrderResultPayload(req.body);
  const merchantTradeNo = payload.MerchantTradeNo;
  const order = merchantTradeNo ? getOrderByMerchantTradeNo(merchantTradeNo) : null;
  const clientBaseUrl = getClientBaseUrl();
  const redirectPath = order ? '/orders/' + order.id : '/orders';
  let paymentResult = 'failed';

  if (String(payload.RtnCode) === '1' || String(payload.TradeStatus) === '1') {
    paymentResult = 'success';
  } else if (payload.RtnMsg && String(payload.RtnMsg).toLowerCase().includes('cancel')) {
    paymentResult = 'cancel';
  }

  res.redirect(302, clientBaseUrl + redirectPath + '?payment=' + encodeURIComponent(paymentResult));
});

module.exports = router;
