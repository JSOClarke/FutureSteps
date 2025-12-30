import { test, expect } from '@playwright/test';

test('shows loading spinner when fetching plans', async ({ page }) => {
    // 1. Intercept the network request to fetch plans and delay it
    await page.route('**/rest/v1/plans*', async route => {
        // Delay for 1 second to ensure loader is visible
        await new Promise(resolve => setTimeout(resolve, 4000));
        await route.continue();
    });

    // 2. Go to home (which redirects to dashboard or plans depending on auth)
    // For this test, we can just hit /plans directly if we assume Guest mode or Auth setup
    // Note: If auth is required, this might fail unless we setup auth state.
    // Assuming Guest mode is available or we are testing generic loading:
    await page.goto('/plans');

    // 3. Verify Loader is visible
    // We look for the "LOADING PLANS" text or the spinner role
    const loader = page.getByText(/LOADING PLANS/i);
    await expect(loader).toBeVisible();

    // 4. Verify Loader disappears
    await expect(loader).not.toBeVisible({ timeout: 5000 });
});
