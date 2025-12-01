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
      const bgContainer = document.getElementById('page-banner-bg-container');
      if (bgContainer) {
        // Create responsive picture element with AVIF and WebP fallbacks
        const picture = document.createElement('picture');

        // Try to derive responsive images from the base name
        const baseName = cfg.background.replace('public/images/banners/', '').replace(/\.[^.]+$/, '');

        // Check for responsive versions (1920, 1280, 960, 640) - WebP first, then AVIF
        const sizes = [1920, 1280, 960, 640];

        // Add WebP sources
        const webpSources = sizes.map(size => {
          const webpPath = `public/images/banners/${baseName}-${size}.webp`;
          return `<source srcset="${webpPath}" media="(min-width: ${size}px)" type="image/webp">`;
        }).join('\n        ');
        picture.innerHTML += webpSources;

        // Add AVIF sources
        const avifSources = sizes.map(size => {
          const avifPath = `public/images/banners/${baseName}-${size}.avif`;
          return `<source srcset="${avifPath}" media="(min-width: ${size}px)" type="image/avif">`;
        }).join('\n        ');
        picture.innerHTML += avifSources;

        // Fallback img
        const fallbackSrc = cfg.background;
        picture.innerHTML += `\n        <img src="${fallbackSrc}" alt="" class="page-banner__bg-image" loading="eager">`;

        bgContainer.appendChild(picture);
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
