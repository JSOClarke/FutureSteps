import { test, expect } from '@playwright/test';

test('signup flow', async ({ page }) => {
    // 1. Go to home page
    await page.goto('/');

    // 2. Click Sign Up from Welcome Screen
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // 3. Fill Credentials
    // Using a random email to avoid collision in repeated tests (or we can clean up DB)
    const randomId = Math.random().toString(36).substring(7);
    const email = `testuser_${randomId}@example.com`;

    await page.getByPlaceholder('your@email.com').fill(email);
    await page.getByPlaceholder('Min. 6 characters').fill('password123');

    // 4. Click Create Account
    await page.getByRole('button', { name: 'Create Account' }).click();

    // 5. Verify Transition to Onboarding
    // Should see "Personal Information"
    await expect(page.getByText('Personal Information')).toBeVisible();

    // 6. Complete Slide 1 (Personal Info)
    await page.getByPlaceholder('Enter your name').fill('Test User');
    await page.locator('input[type="date"]').fill('1990-01-01');
    await page.getByRole('combobox').selectOption('US');
    await page.getByRole('button', { name: 'Next' }).click();

    // 7. Complete Slide 2 (Plan Name)
    // Should see "Name Your Plan"
    await expect(page.getByText('Name Your Plan')).toBeVisible();
    await page.getByPlaceholder('e.g., Early Retirement, Dream Home').fill('My E2E Plan');
    await page.getByRole('button', { name: 'Next' }).click();

    // 8. Complete Slide 3 (Life Projection)
    // Should see "Life Projection"
    await expect(page.getByText('Life Projection')).toBeVisible();
    await page.getByRole('button', { name: 'Get Started' }).click();

    // 9. Verify Dashboard Redirect (or at least Plans page)
    // App redirects to /plans by default
    await expect(page).toHaveURL(/.*plans/);
});
