const Notification = {
  _timeout: null,

  show(message, type = 'info') {
    const el = document.getElementById('notification-toast');
    if (!el) return;

    const colors = {
      success: 'bg-bloom-green text-bloom-ivory border border-bloom-brass/30',
      error: 'bg-red-500 text-white',
      warning: 'bg-bloom-brass text-bloom-deep',
      info: 'bg-bloom-deep text-bloom-ivory'
    };

    el.className = 'fixed left-1/2 top-1/2 z-[100] max-w-[calc(100vw-48px)] -translate-x-1/2 -translate-y-1/2 rounded-lg px-6 py-4 text-center text-sm font-medium shadow-[0_18px_38px_rgba(13,33,28,0.18)] transition-all duration-300 ' + (colors[type] || colors.info);
    el.textContent = message;
    el.style.display = 'block';
    el.style.opacity = '1';

    if (this._timeout) clearTimeout(this._timeout);
    this._timeout = setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => { el.style.display = 'none'; }, 300);
    }, 3000);
  }
};
