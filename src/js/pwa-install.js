document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById('install-banner');
  if (!banner) return;

  const installBtn = banner.querySelector('#install-app');
  const dismissBtn = banner.querySelector('#install-dismiss');

  const dismissedKey = 'pwa-install-banner-dismissed';

  const hideBanner = () => {
    banner.classList.add('translate-y-full');
    setTimeout(() => {
      banner.classList.add('hidden');
    }, 300);
  };

  // Check session storage
  if (sessionStorage.getItem(dismissedKey)) {
    banner.classList.add('hidden');
    return;
  }

  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile/Chrome
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Show the banner
    banner.classList.remove('hidden', 'translate-y-full');
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;

      deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;

      if (outcome === 'accepted') {
        sessionStorage.setItem(dismissedKey, 'true');
        hideBanner();
      }
    });
  }

  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      sessionStorage.setItem(dismissedKey, 'true');
      hideBanner();
    });
  }

  window.addEventListener('appinstalled', () => {
    sessionStorage.removeItem(dismissedKey);
    hideBanner();
    deferredPrompt = null;
  });
});
