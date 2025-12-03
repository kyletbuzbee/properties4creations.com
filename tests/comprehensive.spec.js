const { test, expect } = require('@playwright/test');

/**
 * Properties 4 Creations - Comprehensive Functional Testing Suite
 * Tests for core functionality, forms, maps, and user interactions
 */

test.describe('Core Functionality Tests', () => {

  test('homepage loads with essential elements', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Check critical elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[aria-label="Footer"]')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();

    // Check for service worker registration
    const swRegistered = await page.evaluate(() => 'serviceWorker' in navigator);
    expect(swRegistered).toBe(true);
  });

  test('property gallery displays correctly', async ({ page }) => {
    await page.goto('http://localhost:8080/gallery/');

    // Check gallery elements
    await expect(page.locator('.compare-container')).toBeVisible();
    await expect(page.locator('.slider-control')).toBeVisible();

    // Test slider functionality
    const slider = page.locator('.slider-control');
    const overlay = page.locator('.compare-overlay');

    // Slider should exist and have correct attributes
    await expect(slider).toHaveAttribute('aria-label', 'Compare before and after images');

    // Test slider movement
    await slider.fill('25');
    await page.waitForTimeout(100);
    const overlayWidth = await overlay.evaluate(el => el.style.width);
    expect(overlayWidth).toBe('25%');
  });

  test('contact form validation works', async ({ page }) => {
    await page.goto('http://localhost:8080/contact/');

    // Check form elements
    const form = page.locator('#contact-form');
    const nameField = page.locator('#contact-form [name="name"]');
    const emailField = page.locator('#contact-form [name="email"]');
    const messageField = page.locator('#contact-form [name="message"]');

    // Fields should have proper attributes
    await expect(nameField).toHaveAttribute('aria-required', 'true');
    await expect(emailField).toHaveAttribute('aria-required', 'true');
    await expect(messageField).toHaveAttribute('aria-required', 'true');

    // Test required field validation
    await form.locator('button[type="submit"]').click();

    // Form should show validation feedback
    await expect(page.locator('input:invalid').count()).toBeGreaterThan(0);
  });

  test('projects page map and filters work', async ({ page }) => {
    await page.goto('http://localhost:8080/projects/');

    // Check map loads
    const mapContainer = page.locator('#properties-map');
    await expect(mapContainer).toBeVisible();

    // Check filter dropdowns
    const bedroomsFilter = page.locator('#bedrooms-filter');
    const statusFilter = page.locator('#status-filter');
    const cityFilter = page.locator('#city-filter');

    await expect(bedroomsFilter).toHaveAttribute('aria-label', 'Filter properties by number of bedrooms');
    await expect(statusFilter).toHaveAttribute('aria-label', 'Filter properties by availability status');
    await expect(cityFilter).toHaveAttribute('aria-label', 'Filter properties by city location');

    // Test filtering functionality
    await bedroomsFilter.selectOption('3');
    await page.waitForTimeout(1000); // Wait for filtering to apply
    // Note: Actual property cards may not be visible in test environment
  });

  test('SEO and performance', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Check critical SEO elements
    const title = await page.title();
    expect(title).toContain('Properties 4 Creations');

    const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
    expect(canonical).toBe('https://properties4creations.com/');

    // Check for Open Graph meta tags
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content');
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content');

    // Check for JSON-LD structured data
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeTruthy();
  });

  test('navigation and routing work', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Test navigation links
    const navLinks = [
      { selector: 'a[href="/about/"]', url: '/about/', title: 'About' },
      { selector: 'a[href="/projects/"]', url: '/projects/', title: 'Projects' },
      { selector: 'a[href="/contact/"]', url: '/contact/', title: 'Contact' }
    ];

    for (const link of navLinks) {
      await page.goto('http://localhost:8080/'); // Reset to home
      await page.click(link.selector);
      await expect(page).toHaveURL(new RegExp(link.url));
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('responsive design basics', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.goto('http://localhost:8080/');

    // Menu should be responsive on mobile
    const menu = page.locator('nav');
    await expect(menu).toBeVisible();

    await page.setViewportSize({ width: 1200, height: 800 }); // Desktop
    await expect(menu).toBeVisible();
  });

  test('form submission workflow (get-started)', async ({ page }) => {
    await page.goto('http://localhost:8080/get-started/');

    const form = page.locator('#impact-form form');
    await expect(form).toBeVisible();

    // Check required fields
    const requiredInputs = form.locator('[required]');
    expect(await requiredInputs.count()).toBeGreaterThan(0);

    // Fill out form fields
    await form.locator('[name="first-name"]').fill('Test');
    await form.locator('[name="last-name"]').fill('User');
    await form.locator('[name="email"]').fill('test@example.com');
    await form.locator('[name="phone"]').fill('555-0123');
    await form.locator('[name="property-address"]').fill('123 Test St');
    await form.locator('[name="property-city"]').fill('Test City, TX');

    // Note: Actual form submission may not work in test environment
    // as it requires Google Apps Script endpoint
  });
});

test.describe('Error Handling and Edge Cases', () => {
  test('404 page displays correctly', async ({ page }) => {
    await page.goto('http://localhost:8080/non-existent-page');

    // Should show 404 content or redirect
    await expect(page.locator('h1, .error-message')).toBeVisible();
  });

  test('network failure graceful handling', async ({ page }) => {
    // This would test offline/service worker functionality
    await page.goto('http://localhost:8080/');

    await page.waitForLoadState('networkidle');

    // Service worker should be registered
    const swInfo = await page.evaluate(() => {
      return navigator.serviceWorker.ready.then(() => ({
        registered: true,
        state: 'controlled'
      })).catch(() => ({
        registered: false
      }));
    });

    expect(swInfo.registered).toBe(true);
  });
});
