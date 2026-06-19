import { test, expect } from '@playwright/test';

test.describe('AURA-GRID smoke flows (guest mode, no Firebase required)', () => {
  test('landing page loads with CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /control the lanes/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /enter the grid/i })).toBeVisible();
  });

  test('user can navigate to signup', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /sign up/i }).first().click();
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.getByText(/register operative/i)).toBeVisible();
  });

  test('guest can start a match and the board renders', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /play as guest/i }).click();
    await expect(page).toHaveURL(/\/game/);
    await page.getByRole('button', { name: /initialize match/i }).click();
    await expect(page.getByText('L1')).toBeVisible();
    await expect(page.getByText('L6')).toBeVisible();
  });

  test('theme can be toggled', async ({ page }) => {
    await page.goto('/');
    const root = page.locator('html');
    const before = await root.getAttribute('class');
    await page.getByRole('button', { name: /switch theme/i }).click();
    await expect(root).not.toHaveClass(before ?? '');
  });
});
