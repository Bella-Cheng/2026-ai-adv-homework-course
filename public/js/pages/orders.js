const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    if (!Auth.requireAuth()) return {};

    const orders = ref([]);
    const loading = ref(true);

    const statusMap = {
      pending: { label: '待付款', cls: 'border border-bloom-line bg-bloom-cream text-bloom-muted' },
      paid: { label: '已付款', cls: 'border border-bloom-line bg-bloom-cream text-bloom-muted' },
      failed: { label: '付款失敗', cls: 'border border-bloom-line bg-bloom-cream text-bloom-muted' },
    };

    const orderCount = computed(function () {
      return orders.value.length;
    });

    const orderSummaryTexts = [
      '本季花束訂單，請確認付款狀態。',
      '花禮配送安排中，可查看訂單詳情。',
      '付款未完成時，可重新前往付款。'
    ];

    function orderSummaryText(index) {
      return orderSummaryTexts[index % orderSummaryTexts.length];
    }

    function imageFor(order) {
      return order && order.product_image_url ? order.product_image_url : '/images/hero-yellow-flowers.jpg';
    }

    onMounted(async function () {
      try {
        const res = await apiFetch('/api/orders');
        orders.value = res.data.orders;
      } catch (e) {
        orders.value = [];
      } finally {
        loading.value = false;
      }
    });

    return { orders, loading, statusMap, orderCount, orderSummaryText, imageFor };
  }
}).mount('#app');
