import { test, expect } from '@playwright/test';

test('Dashboard Layout Regression', async ({ page }) => {
  // Navigate to the Dashboard
  await page.goto('/');

  // Wait for Hydration
  await page.waitForLoadState('networkidle');

  // Added some small artificial timeouts just in case Recharts animation is slow
  await page.waitForTimeout(500);

  // Mask Dynamic Data
  // This puts a black box over all numbers, testing only the structural layout
  await expect(page).toHaveScreenshot('dashboard-baseline.png', { 
    mask: [
      page.locator('.font-mono'),
      // Adding text-4xl to ensure the unpaid total doesn't break the snapshot
      // Adding recharts to ensure the graph doesn't break
      page.locator('.text-4xl'),
      page.locator('.recharts-surface')
    ],
    // Disable animations to avoid flakey snapshots
    animations: 'disabled'
  });
});
