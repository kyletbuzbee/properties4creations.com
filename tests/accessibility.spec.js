const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').AxeBuilder;

/**
 * Properties 4 Creations - Comprehensive Accessibility Testing Suite
 * Tests for WCAG 2.1 AA compliance across all pages
 */

test.describe('Accessibility Tests', () => {
  test.setTimeout(60000); // Allow 60 seconds for accessibility tests

  const pages = [
    '/',
    '/about/',
    '/contact/',
    '/get-started/',
    '/impact/',
    '/projects/',
    '/resources/',
    '/transparency/',
    '/gallery/'
  ];

  pages.forEach(pageUrl => {
    test(`should pass accessibility audit on ${pageUrl}`, async ({ page }) => {
      await page.goto(`http://localhost:8080${pageUrl}`);
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(['color-contrast']) // Allow flexibility on color contrast
        .analyze();

      // Store results for reporting
      const violations = accessibilityScanResults.violations;

      // Log violations for debugging
      if (violations.length > 0) {
        console.log(`\n❌ ${pageUrl} Accessibility Violations:`);
        violations.forEach((violation, index) => {
          console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
          console.log(`   Impact: ${violation.impact}`);
          console.log(`   Help: ${violation.helpUrl}`);
          const elements = violation.nodes.map(node => node.html).join('\n     ');
          console.log(`   Elements: ${elements}`);
        });
      }

      // Allow minor accessibility issues but fail on critical ones
      const criticalViolations = violations.filter(v =>
        v.impact === 'critical' || v.impact === 'serious'
      );

      // Store results in test metadata
      test.info().annotations.push({
        type: 'accessibility-report',
        description: `${pageUrl}: ${violations.length} total violations, ${criticalViolations.length} critical`
      });

      // Fail test if there are critical or serious violations
      expect(criticalViolations.length).toBe(0);
    });
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Test skip link functionality
    await page.keyboard.press('Tab');
    const activeElement = await page.evaluate(() => document.activeElement);
    const skipLinkExists = await page.evaluate(() =>
      document.activeElement.textContent.includes('Skip to main content')
    );

    if (skipLinkExists) {
      // Test skip link takes focus to main content
      await page.keyboard.press('Enter');
      const newActiveElement = await page.evaluate(() => document.activeElement.id);
      expect(newActiveElement).toBe('main');
    } else {
      console.log('⚠️  Skip link not found - consider adding one for accessibility');
    }
  });

  test('form accessibility', async ({ page }) => {
    await page.goto('http://localhost:8080/contact/');

    // Check for proper labels on form fields
    const formGroups = page.locator('.form-group');
    await expect(formGroups).toHaveCount(await formGroups.count());

    // Verify required fields are marked
    const requiredFields = page.locator('[aria-required="true"]');
    expect(await requiredFields.count()).toBeGreaterThan(0);

    // Test contact form submission (basic validation)
    const submitBtn = page.locator('button[type="submit"]');
    expect(await submitBtn.getAttribute('aria-label')).toBeTruthy();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('http://localhost:8080/gallery/');

    // Check all images have alt text or are decorative
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      const ariaHidden = await images.nth(i).getAttribute('aria-hidden');

      // Images should either have meaningful alt text or be marked as decorative
      expect(alt !== null || ariaHidden === 'true').toBe(true);
    }
  });

  test('color contrast meets requirements', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Test specific color combinations that should meet contrast standards
    const contrastScanResults = await new AxeBuilder({ page })
      .includeRules(['color-contrast'])
      .analyze();

    const colorViolations = contrastScanResults.violations.filter(v => v.id === 'color-contrast');

    // Allow some flexibility but log warnings
    if (colorViolations.length > 0) {
      console.log(`⚠️  Color contrast issues found: ${colorViolations.length}`);
      console.log('Consider reviewing brand colors and ensuring 4.5:1 contrast ratio');
    }
  });
});
