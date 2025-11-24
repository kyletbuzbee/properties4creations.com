/**
 * P4C Accessibility Enhancements
 * Enhances keyboard navigation and focus management throughout the site
 */

// Create P4C namespace if it doesn't exist
if (typeof P4C === 'undefined') {
  window.P4C = {};
}

/**
 * Accessibility - Manages accessibility features and enhancements
 * @namespace P4C.Accessibility
 */
P4C.Accessibility = {
  /**
   * Initialize accessibility features
   * Sets up focus states, skip links, and keyboard navigation
   * @function init
   */
  init: function() {
    console.log('♿ Initializing Accessibility Features...');
    this.enhanceFocusStates();
    this.createSkipLink();
    this.setupKeyboardNavigation();
    this.ensureAltText();
    console.log('✅ Accessibility Features Ready');
  },

  /**
   * Enhance focus states with visible indicators
   * Adds focus-ring class and CSS styling to interactive elements
   * @function enhanceFocusStates
   */
  enhanceFocusStates: function() {
    // Create style element for focus-ring if it doesn't exist
    if (!document.getElementById('p4c-focus-ring-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'p4c-focus-ring-styles';
      styleElement.textContent = `
        /* P4C Focus Ring Styles */
        .focus-ring:focus,
        .focus-ring:focus-visible {
          outline: 3px solid #C28E5A;
          outline-offset: 2px;
        }

        /* Universal focus-visible for all interactive elements */
        button:focus-visible,
        a:focus-visible,
        input:focus-visible,
        select:focus-visible,
        textarea:focus-visible,
        [tabindex]:focus-visible {
          outline: 3px solid #C28E5A;
          outline-offset: 2px;
        }

        /* Ensure focus is visible on touch devices */
        button:focus,
        a:focus,
        input:focus,
        select:focus,
        textarea:focus,
        [tabindex]:focus {
          outline: 3px solid #C28E5A;
          outline-offset: 2px;
        }
      `;
      document.head.appendChild(styleElement);
    }

    // Add focus-ring class to all buttons and links
    const buttons = document.querySelectorAll('button, a[href], input[type="button"], input[type="submit"]');
    buttons.forEach(element => {
      element.classList.add('focus-ring');
    });
  },

  /**
   * Create skip-to-content link
   * Adds screenreader-visible skip link at top of page
   * @function createSkipLink
   */
  createSkipLink: function() {
    // Check if skip link already exists
    if (document.getElementById('skip-to-main-content')) {
      return;
    }

    // Create skip link element
    const skipLink = document.createElement('a');
    skipLink.id = 'skip-to-main-content';
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only skip-to-content-link';

    // Add styles if they don't exist
    if (!document.getElementById('p4c-skip-link-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'p4c-skip-link-styles';
      styleElement.textContent = `
        /* Skip Link Styles */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        .skip-to-content-link:focus {
          position: static;
          width: auto;
          height: auto;
          padding: 1rem;
          margin: 0;
          overflow: visible;
          clip: auto;
          white-space: normal;
          background-color: var(--color-accent-gold, #C28E5A);
          color: var(--color-primary-navy, #003366);
          display: block;
          text-decoration: none;
          text-align: center;
          font-weight: 600;
          z-index: 10000;
          outline: 3px solid var(--color-primary-navy, #003366);
          outline-offset: 2px;
        }

        .skip-to-content-link:focus:active {
          background-color: var(--color-accent-gold, #C28E5A);
        }
      `;
      document.head.appendChild(styleElement);
    }

    // Insert at the beginning of body
    document.body.insertAdjacentElement('afterbegin', skipLink);

    // Update href to target main element if it exists
    const mainElement = document.querySelector('main');
    if (mainElement && !mainElement.id) {
      mainElement.id = 'main-content';
      skipLink.href = '#main-content';
    } else if (mainElement) {
      skipLink.href = `#${mainElement.id}`;
    }
  },

  /**
   * Setup keyboard navigation and shortcuts
   * Handles Ctrl+K for search, Escape for modals, and other keyboard interactions
   * @function setupKeyboardNavigation
   */
  setupKeyboardNavigation: function() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchButton = document.querySelector('[data-toggle="search"]');
        const searchContainer = document.querySelector('.search-container');
        if (searchButton && searchContainer) {
          searchContainer.classList.toggle('active');
          const searchInput = searchContainer.querySelector('input');
          if (searchInput && searchContainer.classList.contains('active')) {
            searchInput.focus();
          }
        }
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        // Close mobile menu
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
          mobileMenu.classList.remove('active');
          const mobileToggle = document.querySelector('.mobile-menu-toggle');
          if (mobileToggle) {
            mobileToggle.setAttribute('aria-expanded', 'false');
          }
        }

        // Close search
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
          searchContainer.classList.remove('active');
        }

        // Close portal menu
        const portalMenu = document.querySelector('.portal-menu');
        if (portalMenu) {
          portalMenu.classList.remove('active');
          const portalButton = document.querySelector('[data-toggle="portal"]');
          if (portalButton) {
            portalButton.setAttribute('aria-expanded', 'false');
          }
        }

        // Close modals with proper ARIA
        const modals = document.querySelectorAll('[role="dialog"][aria-modal="true"], #accessibility-widget');
        modals.forEach(modal => {
          if (modal.classList.contains('active') || modal.classList.contains('open') || !modal.classList.contains('hidden')) {
            modal.classList.remove('active', 'open');
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
            modal.setAttribute('aria-modal', 'false');
          }
        });
      }

      // Arrow key navigation in lists/grids (if they have role="listbox" or similar)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const focusedElement = document.activeElement;
        const listbox = focusedElement.closest('[role="listbox"], [role="grid"], [role="menu"]');

        if (listbox) {
          const items = Array.from(listbox.querySelectorAll('[role="option"], [role="gridcell"], [role="menuitem"]'));
          const currentIndex = items.indexOf(focusedElement);

          if (currentIndex !== -1) {
            let nextIndex = currentIndex;

            if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
              nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
              e.preventDefault();
            } else if (['ArrowDown', 'ArrowRight'].includes(e.key)) {
              nextIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
              e.preventDefault();
            }

            items[nextIndex].focus();
          }
        }
      }
    });
  },

  /**
   * Ensure all images have descriptive alt text
   * Scans all img tags and warns if alt text is missing or insufficient
   * @function ensureAltText
   */
  ensureAltText: function() {
    const images = document.querySelectorAll('img');
    
    images.forEach((img, index) => {
      const alt = img.getAttribute('alt');
      const src = img.src || img.getAttribute('data-src') || 'unknown';
      
      // Check for missing alt text
      if (!alt || alt.trim() === '') {
        console.warn(
          `⚠️ [Accessibility] Image #${index + 1} is missing alt text: ${src}\n` +
          `Recommendation: Provide a descriptive alt text that describes the image content.\n` +
          `Good example: "Veteran walking into new home"\n` +
          `Bad example: "image1.jpg" or "image" or "photo"`
        );
      }
      
      // Check for insufficient alt text
      else if (alt.toLowerCase() === 'image' || 
               alt.toLowerCase() === 'photo' ||
               alt.toLowerCase() === 'picture' ||
               alt.toLowerCase().match(/^image\d+/) ||
               alt.toLowerCase().match(/^photo\d+/) ||
               /\.(jpg|jpeg|png|gif|webp)$/i.test(alt)) {
        console.warn(
          `⚠️ [Accessibility] Image #${index + 1} has generic alt text: "${alt}" (${src})\n` +
          `Recommendation: Provide a descriptive alt text that explains the image content and context.\n` +
          `Current: "${alt}"\n` +
          `Good example: "Veteran walking into new home"\n` +
          `Better practice: Use specific, descriptive text relevant to the page context`
        );
      }
    });

    if (images.length > 0) {
      console.log(`✅ [Accessibility] Scanned ${images.length} image(s) for alt text`);
    }
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    P4C.Accessibility.init();
  });
} else {
  P4C.Accessibility.init();
}
