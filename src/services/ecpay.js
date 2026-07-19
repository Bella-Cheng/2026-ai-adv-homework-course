const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');

const STAGE_CHECKOUT_URL = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';
const PRODUCTION_CHECKOUT_URL = 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5';
const STAGE_QUERY_URL = 'https://payment-stage.ecpay.com.tw/Cashier/QueryTradeInfo/V5';
const PRODUCTION_QUERY_URL = 'https://payment.ecpay.com.tw/Cashier/QueryTradeInfo/V5';
const DEFAULT_BASE_URL = 'http://localhost:3001';
const DEFAULT_STAGE_MERCHANT_ID = '3002607';
const DEFAULT_STAGE_HASH_KEY = 'pwFHCqoQZGmho4w6';
const DEFAULT_STAGE_HASH_IV = 'EkRm7iFT261dpevs';

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatDate(date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('/') + ' ' + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join(':');
}

function getConfig() {
  const env = process.env.ECPAY_ENV === 'production' ? 'production' : 'staging';

  return {
    env,
    merchantId: process.env.ECPAY_MERCHANT_ID || DEFAULT_STAGE_MERCHANT_ID,
    hashKey: process.env.ECPAY_HASH_KEY || DEFAULT_STAGE_HASH_KEY,
    hashIv: process.env.ECPAY_HASH_IV || DEFAULT_STAGE_HASH_IV,
    checkoutUrl: env === 'production' ? PRODUCTION_CHECKOUT_URL : STAGE_CHECKOUT_URL,
    queryUrl: env === 'production' ? PRODUCTION_QUERY_URL : STAGE_QUERY_URL,
    callbackBaseUrl: (process.env.ECPAY_CALLBACK_BASE_URL || process.env.BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    clientBaseUrl: (process.env.ECPAY_CLIENT_BACK_BASE_URL || process.env.BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '')
  };
}

function normalizeValue(value) {
  if (value === undefined || value === null) return '';
  return String(value);
}

function dotNetUrlEncode(value) {
  return encodeURIComponent(value)
    .toLowerCase()
    .replace(/%20/g, '+')
    .replace(/%2d/g, '-')
    .replace(/%5f/g, '_')
    .replace(/%2e/g, '.')
    .replace(/%21/g, '!')
    .replace(/%2a/g, '*')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')');
}

function buildCheckMacValue(params, config = getConfig()) {
  const sortedQuery = Object.keys(params)
    .filter(function (key) {
      return key !== 'CheckMacValue' && params[key] !== undefined && params[key] !== null;
    })
    .sort(function (a, b) {
      return a.localeCompare(b);
    })
    .map(function (key) {
      return key + '=' + normalizeValue(params[key]);
    })
    .join('&');

  const raw = 'HashKey=' + config.hashKey + '&' + sortedQuery + '&HashIV=' + config.hashIv;
  return crypto.createHash('sha256').update(dotNetUrlEncode(raw)).digest('hex').toUpperCase();
}

function verifyCheckMacValue(params, config = getConfig()) {
  if (!params || !params.CheckMacValue) return false;
  return buildCheckMacValue(params, config) === String(params.CheckMacValue).toUpperCase();
}

function generateMerchantTradeNo() {
  const now = new Date();
  const timestamp = [
    pad(now.getFullYear() % 100),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds())
  ].join('');
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return 'EC' + timestamp + random;
}

function buildItemName(items) {
  const base = items.map(function (item) {
    return item.product_name + 'x' + item.quantity;
  }).join('#');
  return base.slice(0, 400) || 'Order Payment';
}

function buildTradeDesc(order) {
  return ('Order ' + order.order_no).replace(/[^\w\s-]/g, '').slice(0, 200) || 'Order Payment';
}

function buildCheckoutParams(order, items) {
  const config = getConfig();
  const params = {
    MerchantID: config.merchantId,
    MerchantTradeNo: order.merchant_trade_no,
    MerchantTradeDate: formatDate(new Date()),
    PaymentType: 'aio',
    TotalAmount: order.total_amount,
    TradeDesc: buildTradeDesc(order),
    ItemName: buildItemName(items),
    ReturnURL: config.callbackBaseUrl + '/api/payments/ecpay/return',
    OrderResultURL: config.clientBaseUrl + '/payments/ecpay/result',
    ChoosePayment: 'Credit',
    EncryptType: 1,
    NeedExtraPaidInfo: 'N',
    CustomField1: order.id
  };

  params.CheckMacValue = buildCheckMacValue(params, config);

  return {
    action: config.checkoutUrl,
    method: 'POST',
    fields: params
  };
}

function parseOrderResultPayload(body) {
  if (!body || typeof body !== 'object') return {};

  if (body.ResultData) {
    try {
      return JSON.parse(body.ResultData);
    } catch (err) {
      return body;
    }
  }

  return body;
}

function queryTradeInfo(merchantTradeNo, config = getConfig()) {
  const params = {
    MerchantID: config.merchantId,
    MerchantTradeNo: merchantTradeNo,
    TimeStamp: Math.floor(Date.now() / 1000)
  };
  params.CheckMacValue = buildCheckMacValue(params, config);

  const body = querystring.stringify(params);
  const url = new URL(config.queryUrl);

  return new Promise(function (resolve, reject) {
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    }, function (res) {
      let data = '';
      res.on('data', function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        resolve(Object.fromEntries(new URLSearchParams(data)));
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = {
  buildCheckMacValue,
  buildCheckoutParams,
  formatDate,
  generateMerchantTradeNo,
  getConfig,
  parseOrderResultPayload,
  queryTradeInfo,
  verifyCheckMacValue
};
