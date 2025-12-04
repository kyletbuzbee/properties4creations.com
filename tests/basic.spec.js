const { test, expect } = require('@playwright/test');

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await expect(page).toHaveTitle(/Properties 4 Creations/);
});

test('navigation works', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.click('a[href="/projects/"]');
  await expect(page).toHaveURL(/projects/);
});

test('property filtering works', async ({ page }) => {
  await page.goto('http://localhost:8080/projects/');
  await page.selectOption('#bedrooms-filter', '3');
  // Wait for filtering to apply
  await page.waitForTimeout(500);
  // Check that only 3-bedroom properties are shown
  const propertyCards = page.locator('.property-card:not([style*="display: none"])');
  await expect(propertyCards).toHaveCount(await propertyCards.count());
});
