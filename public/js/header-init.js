document.addEventListener('DOMContentLoaded', function () {
  const authNav = document.getElementById('auth-nav');
  const cartBadge = document.getElementById('cart-badge');
  const ordersLink = document.getElementById('orders-link');
  const mobileOrdersLink = document.getElementById('mobile-orders-link');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

  if (authNav) {
    if (Auth.isLoggedIn()) {
      const user = Auth.getUser();
      let html = '';
      if (Auth.isAdmin()) {
        html += '<a href="/admin/products" data-nav-link class="whitespace-nowrap font-semibold hover:text-bloom-brass">後台管理</a>';
      }
      html += '<span class="hidden whitespace-nowrap font-semibold sm:inline">' + (user?.name || '') + '</span>';
      html += '<button onclick="Auth.logout()" class="whitespace-nowrap font-semibold transition-colors hover:text-bloom-brass">登出</button>';
      authNav.innerHTML = html;
    } else {
      authNav.innerHTML = '<a href="/login" data-nav-link class="whitespace-nowrap font-semibold transition-colors hover:text-bloom-brass">登入</a>';
    }
  }

  if (ordersLink) {
    ordersLink.style.display = Auth.isLoggedIn() ? '' : 'none';
  }

  if (mobileOrdersLink) {
    mobileOrdersLink.classList.toggle('hidden', !Auth.isLoggedIn());
  }

  if (mobileMenu && mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function () {
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden', isOpen);
      mobileMenuToggle.setAttribute('aria-expanded', String(!isOpen));
      mobileMenuToggle.setAttribute('aria-label', isOpen ? '開啟導覽選單' : '關閉導覽選單');
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.add('hidden');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.setAttribute('aria-label', '開啟導覽選單');
      });
    });
  }

  function isSameLocation(link) {
    const url = new URL(link.getAttribute('href'), window.location.origin);
    const pathname = window.location.pathname;
    const hash = window.location.hash;

    if (url.pathname === '/orders') return pathname === '/orders' || pathname.startsWith('/orders/');
    if (url.pathname === '/products') return pathname.startsWith('/products/');
    if (url.pathname === '/admin/products') return pathname.startsWith('/admin/');
    if (url.pathname === '/cart') return pathname === '/cart';
    if (url.pathname === '/login') return pathname === '/login';
    if (url.hash) return pathname === '/' && hash === url.hash;
    return pathname === url.pathname && !hash;
  }

  function updateActiveNavigation() {
    document.querySelectorAll('[data-nav-link]').forEach(function (link) {
      const active = isSameLocation(link);
      const isMobileLink = Boolean(link.closest('#mobile-menu'));

      link.classList.toggle('text-bloom-brass', active);
      if (isMobileLink) {
        link.classList.toggle('bg-bloom-cream', active);
      }
    });
  }

  updateActiveNavigation();
  window.addEventListener('hashchange', updateActiveNavigation);

  if (cartBadge) {
    apiFetch('/api/cart').then(function (res) {
      if (res && res.data && res.data.items && res.data.items.length > 0) {
        cartBadge.textContent = res.data.items.length;
        cartBadge.style.display = 'flex';
      }
    }).catch(function () {});
  }
});
