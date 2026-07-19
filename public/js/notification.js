const Notification = {
  _timeout: null,

  show(message, type = 'info') {
    const el = document.getElementById('notification-toast');
    if (!el) return;

    const colors = {
      success: 'border-2 border-bloom-brass bg-bloom-ivory text-bloom-green',
      error: 'border-2 border-bloom-brass bg-bloom-ivory text-bloom-green',
      warning: 'border-2 border-bloom-brass bg-bloom-ivory text-bloom-green',
      info: 'border-2 border-bloom-brass bg-bloom-ivory text-bloom-green'
    };

    el.className = 'fixed left-1/2 top-[126px] z-[100] max-w-[calc(100vw-48px)] -translate-x-1/2 rounded-lg px-6 py-4 text-center text-sm font-medium shadow-[0_18px_38px_rgba(13,33,28,0.18)] transition-all duration-300 ' + (colors[type] || colors.info);
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
