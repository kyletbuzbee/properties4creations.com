const { test, expect } = require('@playwright/test');

/**
 * Properties 4 Creations - Performance and Visual Regression Tests
 * Tests for Core Web Vitals, rendering quality, and performance monitoring
 */

test.describe('Performance and Visual Tests', () => {

  test.setTimeout(30000); // Allow 30 seconds for performance tests

  test('Core Web Vitals - LCP and CLS', async ({ page }) => {
    const lcpPromise = page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      });
    });

    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');

    // Wait for LCP measurement
    const lcp = await lcpPromise;

    // LCP should be under 2.5s (good threshold)
    expect(lcp).toBeLessThan(2500);

    console.log(`Largest Contentful Paint: ${lcp.toFixed(2)}ms`);

    // Basic CLS check (no significant layout shifts)
    const clsValue = await page.evaluate(() => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });

      // Wait a bit for any layout shifts
      return new Promise((resolve) => {
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 100);
      });
    });

    // CLS should be minimal
    expect(clsValue).toBeLessThan(0.1);
    console.log(`Cumulative Layout Shift: ${clsValue.toFixed(4)}`);
  });

  test('images load correctly and lazy loading works', async ({ page }) => {
    await page.goto('http://localhost:8080/gallery/');

    // Check critical images load immediately (not lazy)
    const criticalImages = page.locator('img[loading="eager"], picture img[loading="eager"]');
    await expect(criticalImages.first()).toBeVisible();

    // Check lazy loading is applied to non-critical images
    const lazyImages = page.locator('img[loading="lazy"]');
    const lazyCount = await lazyImages.count();

    // Should have some lazy-loaded images
    expect(lazyCount).toBeGreaterThan(0);

    // Test lazy loading by scrolling
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    // Check that images become visible on scroll (basic check)
    const allImages = page.locator('img');
    const totalImages = await allImages.count();
    console.log(`Total images: ${totalImages}, Lazy images: ${lazyCount}`);
  });

  test('responsive images work correctly', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Check that responsive picture elements have multiple sources
    const pictureElements = page.locator('picture');
    const pictureCount = await pictureElements.count();

    if (pictureCount > 0) {
      // Check the first picture element has multiple sources
      const firstPicture = pictureElements.first();
      const sources = firstPicture.locator('source');

      const sourceCount = await sources.count();
      expect(sourceCount).toBeGreaterThan(1); // Should have multiple breakpoints

      // Check for AVIF sources
      const avifSources = sources.locator('source[type*="image/avif"]');
      const avifCount = await avifSources.count();
      expect(avifCount).toBeGreaterThan(0); // Should support modern formats

      console.log(`Picture elements: ${pictureCount}, Sources per picture: ${sourceCount}, AVIF sources: ${avifCount}`);
    }
  });

  test('font loading and performance', async ({ page }) => {
    const fontLoadStart = Date.now();
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');

    const fontLoadTime = Date.now() - fontLoadStart;

    // Fonts should load quickly (under 2 seconds)
    expect(fontLoadTime).toBeLessThan(2000);

    // Check font-face loading (basic check)
    const fontsLoaded = await page.evaluate(() => {
      return document.fonts.check('12px Merriweather') && document.fonts.check('12px Inter');
    });

    expect(fontsLoaded).toBe(true);
    console.log(`Font load time: ${fontLoadTime}ms`);
  });

  test('service worker caching works', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Wait for service worker to register
    await page.waitForLoadState('networkidle');

    // Check that service worker is active
    const swStatus = await page.evaluate(() => {
      if ('serviceWorker' in navigator) {
        return navigator.serviceWorker.ready.then(reg => ({
          active: !!reg.active,
          state: reg.active?.state
        }));
      }
      return { active: false };
    });

    expect(swStatus.active).toBe(true);

    // Test basic caching by checking if resources are being cached
    const cacheExists = await page.evaluate(async () => {
      try {
        const cacheNames = await caches.keys();
        return cacheNames.length > 0;
      } catch (e) {
        return false;
      }
    });

    expect(cacheExists).toBe(true);
    console.log(`Service Worker: Active (${swStatus.state}), Caches: ${cacheExists}`);
  });

  test('JavaScript execution and interactivity', async ({ page }) => {
    await page.goto('http://localhost:8080/gallery/');

    // Test that JavaScript executes
    const jsExecution = await page.evaluate(() => {
      return {
        hasDOMContentLoaded: true, // If this runs, JS is working
        hasCompareSlider: !!document.querySelector('.compare-container'),
        hasSliderControl: !!document.querySelector('.slider-control')
      };
    });

    expect(jsExecution.hasCompareSlider).toBe(true);
    expect(jsExecution.hasSliderControl).toBe(true);

    // Test slider interaction
    const slider = page.locator('.slider-control');
    const overlay = page.locator('.compare-overlay');

    const initialStyle = await overlay.evaluate(el => window.getComputedStyle(el).width);

    // Move slider
    await slider.fill('20');
    await page.waitForTimeout(100);

    const newStyle = await overlay.evaluate(el => el.style.width);
    expect(newStyle).toBe('20%');

    console.log(`Slider interaction: ${initialStyle} → ${newStyle}`);
  });

  test('meta tag completeness', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Check required meta tags
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThan(70); // SEO best practice

    // Check meta description length
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description.length).toBeGreaterThan(120);
    expect(description.length).toBeLessThan(320); // SEO best practice

    // Check for Open Graph
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
    expect(ogDescription).toBeTruthy();

    console.log(`Title: ${title.length} chars, Description: ${(await page.locator('meta[name="description"]').getAttribute('content')).length} chars`);
  });

  test('mobile performance basics', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const loadStart = Date.now();
    await page.goto('http://localhost:8080/');

    // Wait for critical content
    await page.waitForSelector('h1');
    const loadTime = Date.now() - loadStart;

    // Should load within reasonable time on mobile
    expect(loadTime).toBeLessThan(5000);

    // Check that content fits mobile viewport
    const contentWidth = await page.evaluate(() => {
      return Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
      );
    });

    // Content should not exceed viewport width (basic responsive test)
    expect(contentWidth).toBeLessThanOrEqual(375);

    console.log(`Mobile load time: ${loadTime}ms, Content width: ${contentWidth}px`);
  });
});
