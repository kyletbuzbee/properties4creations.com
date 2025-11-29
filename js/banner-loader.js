(function(){
  function getConfig() {
    const node = document.getElementById('page-banner-config');
    if (!node) return null;
    try { return JSON.parse(node.textContent); } catch { return null; }
  }

  function applyBannerConfig(cfg) {
    const banner = document.getElementById('page-banner');
    if (!banner || !cfg) return;

    if (cfg.variant === 'hero' && cfg.background) {
      if (cfg.background.endsWith('.mp4')) {
        // Video background
        const video = document.createElement('video');
        video.src = cfg.background;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.className = 'absolute inset-0 w-full h-full object-cover';
        banner.appendChild(video);
      } else {
        // Image background
        banner.style.backgroundImage = `url("${cfg.background}")`;
      }
      banner.classList.add('page-banner--hero');
    }

    const eyebrow = banner.querySelector('.page-banner__eyebrow');
    const title = banner.querySelector('.page-banner__title');
    const subtitle = banner.querySelector('.page-banner__subtitle');
    const ctaBtn = banner.querySelector('.page-banner__cta-btn');
    const status = banner.querySelector('.page-banner__status');

    if (eyebrow && cfg.eyebrow) eyebrow.textContent = cfg.eyebrow;
    if (title && cfg.title) title.textContent = cfg.title;
    if (subtitle) subtitle.textContent = cfg.subtitle || '';
    if (ctaBtn) {
      ctaBtn.textContent = cfg.ctaText || 'Get Started';
      ctaBtn.setAttribute('href', cfg.ctaHref || 'get-started.html');
    }
    if (status) status.style.display = cfg.showVoucherBadge ? 'block' : 'none';
  }

  function injectBanner() {
    // Fetch component and inject into a target container
    const target = document.getElementById('page-banner-container');
    if (!target) return;

    fetch('components/page-banner.html')
      .then(res => res.text())
      .then(html => {
        target.innerHTML = html;
        document.body.classList.add('has-sticky-header');
        applyBannerConfig(getConfig());
      })
      .catch(() => { /* no-op to avoid hard failures */ });
  }

  document.addEventListener('DOMContentLoaded', injectBanner);
})();
