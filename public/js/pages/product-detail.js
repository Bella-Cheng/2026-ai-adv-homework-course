const { createApp, ref, onMounted } = Vue;

createApp({
  setup() {
    const productId = document.getElementById('app').dataset.productId;
    const product = ref(null);
    const loading = ref(true);
    const notFound = ref(false);
    const quantity = ref(1);
    const adding = ref(false);
    const fallbackImage = '/images/hero-yellow-flowers.jpg';
    const productCopy = '精選當季花材搭配清爽葉材，適合生日、紀念日或任何想表達心意的場合，呈現花束的透氣層次與柔霧日光感。';
    const productSubtitle = 'Seasonal Floral Gift';

    function decrease() {
      if (quantity.value > 1) quantity.value--;
    }

    function increase() {
      if (product.value && quantity.value < product.value.stock) quantity.value++;
    }

    async function addToCart() {
      if (!product.value || adding.value) return false;
      adding.value = true;
      try {
        await apiFetch('/api/cart', {
          method: 'POST',
          body: JSON.stringify({ productId: product.value.id, quantity: quantity.value })
        });
        Notification.show('已加入購物車', 'success');
        var badge = document.getElementById('cart-badge');
        if (badge) {
          var count = parseInt(badge.textContent || '0') + 1;
          badge.textContent = count;
          badge.style.display = 'flex';
        }
        return true;
      } catch (e) {
        Notification.show('加入購物車失敗', 'error');
        return false;
      } finally {
        adding.value = false;
      }
    }

    async function buyNow() {
      const added = await addToCart();
      if (added) {
        window.location.href = '/checkout';
      }
    }

    function imageFor(item) {
      return item && item.image_url ? item.image_url : fallbackImage;
    }

    onMounted(async function () {
      try {
        const res = await apiFetch('/api/products/' + productId);
        product.value = res.data;
      } catch (e) {
        notFound.value = true;
      } finally {
        loading.value = false;
      }
    });

    return {
      product,
      loading,
      notFound,
      quantity,
      adding,
      productCopy,
      productSubtitle,
      decrease,
      increase,
      addToCart,
      buyNow,
      imageFor
    };
  }
}).mount('#app');
