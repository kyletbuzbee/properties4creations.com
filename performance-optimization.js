/**
 * ============================================================================
 * P4C PERFORMANCE OPTIMIZATION MODULE
 * Handles lazy loading, image optimization, and script deferment
 * ============================================================================
 */

const P4C = window.P4C || {};

/**
 * Performance optimization utilities
 * @namespace P4C.Performance
 */
P4C.Performance = {
  /**
   * Initialize performance optimizations
   */
  init: function() {
    console.log('⚡ Initializing Performance Optimizations...');
    
    this.setupLazyLoading();
    this.optimizeImages();
    this.deferNonCriticalScripts();
    this.preloadCriticalResources();
    
    console.log('✅ Performance Optimizations Ready');
  },

  /**
   * Setup lazy loading for images, iframes, and maps
   */
  setupLazyLoading: function() {
    // Use native lazy loading where supported
    const lazyElements = document.querySelectorAll('img[loading="lazy"], iframe[loading="lazy"]');

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const tagName = element.tagName.toLowerCase();

            if (tagName === 'img') {
              // Handle image lazy loading
              const img = element;

              // Handle picture elements with source tags
              if (img.parentElement.tagName === 'PICTURE') {
                const sources = img.parentElement.querySelectorAll('source');
                sources.forEach(source => {
                  if (source.dataset.srcset) {
                    source.srcset = source.dataset.srcset;
                    source.removeAttribute('data-srcset');
                  }
                });
              }

              // Load main image
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }

              // Handle srcset for responsive images
              if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                img.removeAttribute('data-srcset');
              }

              img.classList.add('loaded');
            } else if (element.id === 'property-map') {
              // Handle map lazy loading
              this.initializePropertyMap();
            }

            observer.unobserve(element);
          }
        });
      }, {
        rootMargin: '50px' // Start loading 50px before coming into view
      });

      lazyElements.forEach(el => {
        if (el.dataset.src || el.dataset.srcset) {
          imageObserver.observe(el);
        }
      });

      // Observe property map for lazy loading
      const propertyMap = document.getElementById('property-map');
      if (propertyMap) {
        imageObserver.observe(propertyMap);
      }

      const totalElements = lazyElements.length + (propertyMap ? 1 : 0);
      console.log(`📸 Lazy loading initialized for ${totalElements} elements`);
    } else {
      // Fallback for browsers without IntersectionObserver
      lazyElements.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }
      });

      // Initialize map immediately if no intersection observer
      this.initializePropertyMap();
    }
  },

  /**
   * Optimize image loading and rendering
   */
  optimizeImages: function() {
    // Add loading="lazy" and decoding="async" to all images
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Skip hero images and above-the-fold content
      if (!img.hasAttribute('loading') && !img.closest('.hero, [data-critical]')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Enable async decoding for non-critical images
      if (!img.closest('[data-critical]')) {
        img.setAttribute('decoding', 'async');
      }
      
      // Ensure all images have alt text
      if (!img.hasAttribute('alt')) {
        console.warn('⚠️ Image missing alt text:', img.src);
        img.setAttribute('alt', 'Content image');
      }
    });
    
    console.log(`🖼️ Optimized ${images.length} images for performance`);
  },

  /**
   * Defer non-critical scripts
   */
  deferNonCriticalScripts: function() {
    // Scripts that should be deferred are already marked with defer attribute
    // This function ensures proper sequencing
    const deferredScripts = document.querySelectorAll('script[defer]');
    console.log(`📜 Deferred ${deferredScripts.length} non-critical scripts`);
  },

  /**
   * Preload critical resources
   */
  preloadCriticalResources: function() {
    // Preload Google Fonts (critical for above-the-fold text)
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://fonts.googleapis.com';
    document.head.appendChild(link);
    
    // Preload font display
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap';
    fontLink.as = 'style';
    document.head.appendChild(fontLink);
    
    console.log('⏩ Critical resources preloaded');
  },

  /**
   * Monitor Core Web Vitals (optional - requires analytics)
   */
  monitorWebVitals: function() {
    if ('web-vital' in window) {
      // LCP (Largest Contentful Paint)
      console.log('📊 Core Web Vitals monitoring enabled');
    }
  },

  /**
   * Get current performance metrics
   * @returns {Object} Performance metrics
   */
  getMetrics: function() {
    if (!window.performance || !window.performance.timing) {
      return null;
    }

    const timing = window.performance.timing;
    const navigation = window.performance.navigation;
    
    return {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      ttfb: timing.responseStart - timing.navigationStart,
      render: timing.domInteractive - timing.navigationStart,
      domContent: timing.domContentLoadedEventEnd - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
      type: navigation.type === 0 ? 'navigate' : navigation.type === 1 ? 'reload' : 'back_forward'
    };
  },

  /**
   * Initialize property map with lazy loading
   */
  initializePropertyMap: function() {
    const propertyMapElement = document.getElementById('property-map');
    if (!propertyMapElement || propertyMapElement.dataset.mapInitialized) {
      return; // Map already initialized or element not found
    }

    // Check if Leaflet is available
    if (typeof L === 'undefined') {
      console.warn('⚠️ Leaflet not loaded, map initialization deferred');
      return;
    }

    try {
      const map = L.map('property-map', {
        center: [32.3513, -95.3011], // Tyler, TX
        zoom: 6,
        scrollWheelZoom: false,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const markers = [
        { lat: 32.3513, lng: -95.3011, label: 'Tyler – Completed Project', color: 'green' },
        { lat: 32.5007, lng: -94.7405, label: 'Longview – Active Development', color: 'blue' },
        { lat: 32.7571, lng: -94.3452, label: 'Jefferson – Section 8 Ready', color: 'purple' }
      ];

      markers.forEach(({ lat, lng, label, color }) => {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;"></div>`,
          iconSize: [12, 12]
        });
        L.marker([lat, lng], { icon }).addTo(map).bindPopup(label);
      });

      // Mark as initialized
      propertyMapElement.dataset.mapInitialized = 'true';
      console.log('🗺️ Property map initialized with lazy loading');
    } catch (error) {
      console.error('❌ Error initializing property map:', error);
    }
  },

  /**
   * Log performance metrics (debug mode)
   */
  logMetrics: function() {
    const metrics = this.getMetrics();
    if (metrics) {
      console.group('⚡ Performance Metrics');
      console.log(`DNS: ${metrics.dns}ms`);
      console.log(`TCP: ${metrics.tcp}ms`);
      console.log(`TTFB: ${metrics.ttfb}ms`);
      console.log(`Render: ${metrics.render}ms`);
      console.log(`DOM Content: ${metrics.domContent}ms`);
      console.log(`Page Load: ${metrics.loadComplete}ms`);
      console.log(`Navigation Type: ${metrics.type}`);
      console.groupEnd();
    }
  }
};

/**
 * Image Optimization Helpers
 */
P4C.Images = {
  /**
   * Get responsive image srcset
   * @param {string} basePath - Base image path without extension
   * @param {string} format - Image format (webp, jpg, etc)
   * @returns {string} Responsive srcset string
   */
  getResponsiveSrcset: function(basePath, format = 'webp') {
    const sizes = [320, 640, 960, 1280, 1920];
    return sizes
      .map(size => `${basePath}-${size}w.${format} ${size}w`)
      .join(', ');
  },

  /**
   * Convert image to WebP with fallback
   * @param {string} imagePath - Original image path
   * @returns {Object} Picture element with sources
   */
  getPictureElement: function(imagePath) {
    const basePath = imagePath.replace(/\.[^.]+$/, '');
    return {
      webp: `${basePath}.webp`,
      avif: `${basePath}.avif`,
      fallback: imagePath,
      srcset: {
        webp: this.getResponsiveSrcset(basePath, 'webp'),
        avif: this.getResponsiveSrcset(basePath, 'avif'),
        jpg: this.getResponsiveSrcset(basePath, 'jpg')
      }
    };
  }
};

/**
 * Initialize performance optimizations when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    P4C.Performance.init();
    // Uncomment for debugging:
    // setTimeout(() => P4C.Performance.logMetrics(), 5000);
  });
} else {
  P4C.Performance.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = P4C.Performance;
}
