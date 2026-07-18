const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const products = ref([]);
    const pagination = ref({ total: 0, page: 1, limit: 8, totalPages: 0 });
    const loading = ref(true);

    const fallbackImages = [
      'https://images.unsplash.com/photo-1565279445322-30ab5314ff94?w=900',
      'https://images.unsplash.com/photo-1555596112-ca9a1e964e13?w=900',
      'https://images.unsplash.com/photo-1543409777-30250849aa3e?w=900',
      'https://images.unsplash.com/photo-1610467618849-66d363f5aa16?w=900',
    ];

    const heroImage = computed(function () {
      return imageFor(products.value[0], 0, 1200);
    });

    const featuredProduct = computed(function () {
      return products.value[0] || null;
    });

    const categoryProducts = computed(function () {
      return products.value.slice(0, 4);
    });

    const nextSeasonProducts = computed(function () {
      return products.value.slice(4, 8);
    });

    function imageFor(product, index, width) {
      if (product && product.image_url) {
        return product.image_url.replace(/w=\d+/, 'w=' + width);
      }
      return fallbackImages[index % fallbackImages.length].replace(/w=\d+/, 'w=' + width);
    }

    async function loadProducts(page) {
      page = page || 1;
      loading.value = true;
      try {
        const res = await apiFetch('/api/products?page=' + page + '&limit=8');
        products.value = res.data.products.map(function (p) {
          p._adding = false;
          return p;
        });
        pagination.value = res.data.pagination;
      } catch (e) {
        products.value = [];
      } finally {
        loading.value = false;
      }
    }

    function goToProduct(id) {
      window.location.href = '/products/' + id;
    }

    async function addToCart(product) {
      if (!product || product._adding) return;
      product._adding = true;
      try {
        await apiFetch('/api/cart', {
          method: 'POST',
          body: JSON.stringify({ productId: product.id, quantity: 1 })
        });
        Notification.show('已加入購物車', 'success');
        const badge = document.getElementById('cart-badge');
        if (badge) {
          const count = parseInt(badge.textContent || '0', 10) + 1;
          badge.textContent = count;
          badge.style.display = 'flex';
        }
      } catch (e) {
        Notification.show('加入購物車失敗', 'error');
      } finally {
        product._adding = false;
      }
    }

    onMounted(function () {
      loadProducts(1);
    });

    return {
      products,
      pagination,
      loading,
      heroImage,
      featuredProduct,
      categoryProducts,
      nextSeasonProducts,
      loadProducts,
      goToProduct,
      addToCart,
      imageFor
    };
  }
}).mount('#app');
