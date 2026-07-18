const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const items = ref([]);
    const loading = ref(true);
    const confirmVisible = ref(false);
    const deleteItemId = ref('');
    const fallbackImage = '/images/hero-yellow-flowers.jpg';
    const productSubtitles = [
      'Pink Rose Bouquet',
      'White Lily Gift Box',
      'Monthly Flower Subscription',
      'Summer Floral Gift',
      'Seasonal Bouquet'
    ];
    const productChips = ['本季熱賣', '夏日花禮', '當季限定'];

    const total = computed(function () {
      return items.value.reduce(function (sum, item) {
        return sum + item.product.price * item.quantity;
      }, 0);
    });

    const itemCount = computed(function () {
      return items.value.reduce(function (sum, item) {
        return sum + item.quantity;
      }, 0);
    });

    const shippingFee = computed(function () {
      return total.value >= 500 ? 0 : 150;
    });

    const discount = computed(function () {
      return total.value >= 3000 ? 200 : 0;
    });

    const finalTotal = computed(function () {
      return total.value + shippingFee.value - discount.value;
    });

    async function loadCart() {
      loading.value = true;
      try {
        const res = await apiFetch('/api/cart');
        items.value = res.data.items;
      } catch (e) {
        Notification.show('載入購物車失敗', 'error');
      } finally {
        loading.value = false;
      }
    }

    async function updateQuantity(itemId, qty) {
      if (qty < 1) return;
      try {
        await apiFetch('/api/cart/' + itemId, {
          method: 'PATCH',
          body: JSON.stringify({ quantity: qty })
        });
        var item = items.value.find(function (i) { return i.id === itemId; });
        if (item) item.quantity = qty;
      } catch (e) {
        Notification.show('更新數量失敗', 'error');
      }
    }

    function confirmDelete(itemId) {
      deleteItemId.value = itemId;
      confirmVisible.value = true;
    }

    async function handleDelete() {
      confirmVisible.value = false;
      try {
        await apiFetch('/api/cart/' + deleteItemId.value, { method: 'DELETE' });
        items.value = items.value.filter(function (i) { return i.id !== deleteItemId.value; });
        Notification.show('已從購物車移除', 'success');
      } catch (e) {
        Notification.show('移除失敗', 'error');
      }
    }

    function goCheckout() {
      if (!Auth.isLoggedIn()) {
        window.location.href = '/login?redirect=/checkout';
        return;
      }
      window.location.href = '/checkout';
    }

    function imageFor(product) {
      return product && product.image_url ? product.image_url : fallbackImage;
    }

    function productSubtitle(product, index) {
      if (product && product.description) {
        return product.description.length > 28
          ? product.description.slice(0, 28) + '...'
          : product.description;
      }
      return productSubtitles[index % productSubtitles.length];
    }

    function productChip(index) {
      return productChips[index % productChips.length];
    }

    onMounted(function () {
      loadCart();
    });

    return {
      items, loading, total, itemCount, shippingFee, discount, finalTotal, confirmVisible,
      updateQuantity, confirmDelete, handleDelete, goCheckout,
      imageFor, productSubtitle, productChip
    };
  }
}).mount('#app');
