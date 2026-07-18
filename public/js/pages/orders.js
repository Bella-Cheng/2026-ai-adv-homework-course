const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    if (!Auth.requireAuth()) return {};

    const orders = ref([]);
    const loading = ref(true);

    const statusMap = {
      pending: { label: '待付款', cls: 'bg-bloom-brass/20 text-bloom-deep' },
      paid: { label: '已付款', cls: 'bg-bloom-sage/20 text-bloom-green' },
      failed: { label: '付款失敗', cls: 'bg-bloom-blush/20 text-bloom-deep' },
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

    return { orders, loading, statusMap, orderCount, orderSummaryText };
  }
}).mount('#app');
