const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const loading = ref(true);
    const submitting = ref(false);
    const cartItems = ref([]);
    const form = ref({ recipientName: '', recipientEmail: '', recipientAddress: '' });
    const errors = ref({});
    const isAuthorized = Auth.requireAuth();

    const cartTotal = computed(function () {
      return cartItems.value.reduce(function (sum, item) {
        return sum + item.product.price * item.quantity;
      }, 0);
    });

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

    function validate() {
      errors.value = {};
      if (!form.value.recipientName.trim()) errors.value.recipientName = '請輸入收件人姓名';
      if (!form.value.recipientEmail.trim()) {
        errors.value.recipientEmail = '請輸入 Email';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.recipientEmail)) {
        errors.value.recipientEmail = 'Email 格式不正確';
      }
      if (!form.value.recipientAddress.trim()) errors.value.recipientAddress = '請輸入收件地址';
      return Object.keys(errors.value).length === 0;
    }

    async function submitOrder() {
      if (!validate() || submitting.value) return;
      submitting.value = true;

      try {
        const res = await apiFetch('/api/orders', {
          method: 'POST',
          body: JSON.stringify(form.value)
        });
        Notification.show('訂單建立成功，正在前往綠界付款', 'success');
        submitEcpayForm(res.data.payment);
      } catch (err) {
        Notification.show(err?.data?.message || '訂單建立失敗', 'error');
      } finally {
        submitting.value = false;
      }
    }

    onMounted(async function () {
      if (!isAuthorized) return;

      try {
        const res = await apiFetch('/api/cart');
        cartItems.value = res.data.items;
        if (cartItems.value.length === 0) {
          window.location.href = '/cart';
          return;
        }
      } catch (err) {
        window.location.href = '/cart';
        return;
      }
      loading.value = false;
    });

    return { loading, submitting, cartItems, form, errors, cartTotal, submitOrder };
  }
}).mount('#app');
