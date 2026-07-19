const { createApp, ref, onMounted } = Vue;

createApp({
  setup() {
    if (!Auth.requireAuth()) return {};

    const el = document.getElementById('app');
    const orderId = el.dataset.orderId;
    const paymentResult = ref(el.dataset.paymentResult || null);
    const order = ref(null);
    const loading = ref(true);
    const paying = ref(false);

    const statusMap = {
      pending: { label: '待付款', cls: 'bg-bloom-brass/20 text-bloom-deep' },
      paid: { label: '已付款', cls: 'bg-bloom-sage/20 text-bloom-green' },
      failed: { label: '付款失敗', cls: 'bg-bloom-blush/20 text-bloom-deep' }
    };

    const paymentMessages = {
      success: { text: '付款已送出，系統正在確認結果。', cls: 'border border-bloom-sage/30 bg-bloom-sage/10 text-bloom-green' },
      failed: { text: '付款失敗，請重新嘗試。', cls: 'border border-bloom-brass/40 bg-bloom-blush/30 text-bloom-deep' },
      cancel: { text: '付款已取消。', cls: 'border border-bloom-brass/30 bg-bloom-brass/10 text-bloom-deep' },
      processing: { text: '付款結果回寫中，請稍候重新整理。', cls: 'border border-bloom-brass/30 bg-bloom-brass/10 text-bloom-deep' }
    };

    const paymentStatusMap = {
      pending: '待付款',
      paid: '已付款',
      failed: '付款失敗'
    };

    function paymentStatusLabel(status) {
      return paymentStatusMap[status] || status;
    }

    function itemImage(item) {
      return item && item.product_image_url ? item.product_image_url : '/images/hero-yellow-flowers.jpg';
    }

    function submitEcpayForm(payment) {
      const formEl = document.createElement('form');
      formEl.method = payment.method || 'POST';
      formEl.action = payment.action;
      formEl.style.display = 'none';

      Object.keys(payment.fields).forEach(function (key) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = payment.fields[key];
        formEl.appendChild(input);
      });

      document.body.appendChild(formEl);
      formEl.submit();
    }

    async function loadOrder() {
      const res = await apiFetch('/api/orders/' + orderId);
      order.value = res.data;
      return res.data;
    }

    async function handlePayNow() {
      if (paying.value) return;
      paying.value = true;

      try {
        const res = await apiFetch('/api/orders/' + orderId + '/ecpay-checkout', {
          method: 'POST'
        });
        submitEcpayForm(res.data.payment);
      } catch (err) {
        Notification.show(err?.data?.message || '建立付款請求失敗', 'error');
      } finally {
        paying.value = false;
      }
    }

    async function syncResultState() {
      if (!paymentResult.value) return;

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const currentOrder = await loadOrder();
        if (currentOrder.payment_status === 'paid' || currentOrder.payment_status === 'failed') return;
        paymentResult.value = 'processing';
        await new Promise(function (resolve) {
          window.setTimeout(resolve, 1200);
        });
      }
    }

    onMounted(async function () {
      try {
        await loadOrder();
        await syncResultState();
      } catch (err) {
        Notification.show('讀取訂單失敗', 'error');
      } finally {
        loading.value = false;
      }
    });

    return {
      order,
      loading,
      paying,
      paymentResult,
      statusMap,
      paymentMessages,
      paymentStatusLabel,
      itemImage,
      handlePayNow
    };
  }
}).mount('#app');
