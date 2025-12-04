/**
 * Enhanced Accessibility Features
 * Properties 4 Creations - Accessibility Enhancement
 */

(function () {
    'use strict';

    // Focus management and keyboard navigation
    function enhanceKeyboardNavigation() {
        // Add visible focus indicators
        const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');

        focusableElements.forEach(element => {
            element.addEventListener('focus', function () {
                this.classList.add('keyboard-focus');
            });

            element.addEventListener('blur', function () {
                this.classList.remove('keyboard-focus');
            });
        });

        // Enhanced skip links
        const skipLinks = document.querySelectorAll('.skip-to-content');
        skipLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    target.focus({ preventScroll: true });
                }
            });
        });
    }

    // Screen reader improvements
    function enhanceScreenReaderSupport() {
        // Live regions for dynamic content
        const liveRegions = document.querySelectorAll('[aria-live]');
        liveRegions.forEach(region => {
            if (!region.hasAttribute('aria-atomic')) {
                region.setAttribute('aria-atomic', 'true');
            }
        });

        // Enhanced form labels
        const formElements = document.querySelectorAll('input, select, textarea');
        formElements.forEach(element => {
            if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
                const label = document.querySelector(`label[for="${element.id}"]`);
                if (label && !element.getAttribute('aria-label')) {
                    const labelText = label.textContent.trim();
                    if (labelText && !labelText.includes('*')) {
                        element.setAttribute('aria-label', labelText.replace('*', '').trim());
                    }
                }
            }
        });
    }

    // Mobile menu improvements
    function enhanceMobileMenu() {
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener('click', function () {
                const isOpen = mobileMenu.classList.contains('block');
                mobileToggle.setAttribute('aria-expanded', !isOpen);

                if (!isOpen) {
                    mobileMenu.setAttribute('aria-hidden', 'false');
                } else {
                    mobileMenu.setAttribute('aria-hidden', 'true');
                }
            });

            // Close menu when clicking outside
            document.addEventListener('click', function (e) {
                if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                    mobileMenu.classList.add('hidden');
                    mobileToggle.setAttribute('aria-expanded', 'false');
                    mobileMenu.setAttribute('aria-hidden', 'true');
                }
            });
        }
    }

    // Image loading improvements
    function enhanceImageLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');

        images.forEach(img => {
            // Add error handling
            img.addEventListener('error', function () {
                console.warn(`Image failed to load: ${this.src}`);
                this.alt = this.alt || 'Image failed to load';
                this.classList.add('image-error');
            });

            // Add load handling
            img.addEventListener('load', function () {
                this.classList.add('image-loaded');
            });
        });
    }

    // Reduced motion preferences
    function handleReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            // Disable animations and transitions for users who prefer reduced motion
            const animatedElements = document.querySelectorAll('.reveal, .hover\\:scale-110, .transition-all');
            animatedElements.forEach(element => {
                element.style.animation = 'none';
                element.style.transition = 'none';
            });
        }
    }

    // Color scheme preferences
    function handleColorScheme() {
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (prefersDarkScheme) {
            // Add dark mode support in future iterations
            document.documentElement.classList.add('prefers-dark-mode');
        }
    }

    // Initialize all enhancements
    function init() {
        enhanceKeyboardNavigation();
        enhanceScreenReaderSupport();
        enhanceMobileMenu();
        enhanceImageLoading();
        handleReducedMotion();
        handleColorScheme();

        // Update year in footer
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }

        console.log('🎉 Accessibility enhancements loaded');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Polyfills for older browsers
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector ||
            Element.prototype.webkitMatchesSelector;
    }

    if (!Element.prototype.closest) {
        Element.prototype.closest = function (s) {
            var el = this;
            do {
                if (Element.prototype.matches.call(el, s)) return el;
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    }

})();
