import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Invoice creation, accessibility, and offline persistence journey', async ({ page }) => {
  // Step A: Accessibility Audit
  await page.goto('/');
  // Allow DOM to settle before scanning, ensuring loaders are gone
  await page.waitForSelector('h1', { timeout: 10000 });
  
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);

  // Step B: The Creation Flow
  // Navigate to invoices
  await page.goto('/invoices');
  
  // Wait for React Query to load any existing lists and render UI
  await page.waitForTimeout(500);

  // Click "Ny Faktura"
  await page.getByText('Ny Faktura').click();

  // Wait for navigation and DB fetching
  await page.waitForTimeout(500);

  // Select the first real customer in the dropdown (index 1 skips the "-- Velg --" placeholder)
  const contactSelect = page.locator('select[name="contactId"]');
  await contactSelect.selectOption({ index: 1 });
  
  // Extract the name of the selected company so we know what to assert for
  const selectedText = await contactSelect.evaluate((node: HTMLSelectElement) => node.options[node.selectedIndex].text);
  const companyName = selectedText.split('(')[0].trim(); // Removes the "(Org number)" portion the UI appends

  // Add line item details: "Konsulenttjenester", Qty "1", Price "1000"
  await page.locator('input[name="items.0.description"]').fill('Konsulenttjenester');
  await page.locator('input[name="items.0.quantity"]').fill('1');
  await page.locator('input[name="items.0.price"]').fill('1000');

  // Let UI calculate constraints
  await page.waitForTimeout(300);

  // Click "Opprett Faktura" (or Lagre depending on text)
  await page.getByText('Opprett Faktura').click();

  // Verify the app navigates back to /invoices and that the company is visible
  await expect(page).toHaveURL(/\/invoices/);
  
  // Wait for new row to populate via Tanstack DB cache
  await page.waitForTimeout(800);
  await expect(page.getByText(companyName).first()).toBeVisible({ timeout: 5000 });

  // Step C: The Persistence Check (The Critical Test)
  // Force a hard page reload to clear memory, simulating an offline restart
  await page.reload();
  await page.waitForTimeout(800);

  // Verify that the invoice is still visible natively via IndexedDB
  await expect(page.getByText(companyName).first()).toBeVisible({ timeout: 5000 });
});
