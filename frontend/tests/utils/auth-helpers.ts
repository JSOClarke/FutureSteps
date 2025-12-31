import { Page, expect } from '@playwright/test';

// Golden User Credentials
// Ensure these match your local environment
const USER_EMAIL = 'email@gmail.com';
const USER_PASSWORD = 'password';

export async function signIn(page: Page) {
    await page.goto('/');

    // Check if we are already logged in (redirected to dashboard)
    // We wait for URL to stabilize or check immediately? 
    // If we are redirected, the dashboard URL should be present.
    // However, explicit wait for potential redirect might be needed if state is reused.
    // Use .click() which will wait for element. If it times out, it means we might be logged in or page broken.

    try {
        // Attempt to click Sign In. This handles waiting for specific loaded state.
        // If we really are already logged in, this will timeout. 
        // But checking URL first is a good optimization.
        if (page.url().includes('/dashboard')) return;

        await page.getByTestId('welcome-signin-button').click();

        // Fill Auth Modal
        await page.getByTestId('auth-email-input').fill(USER_EMAIL);
        await page.getByTestId('auth-password-input').fill(USER_PASSWORD);
        await page.getByTestId('auth-submit-button').click();

        // Verify redirect
        await expect(page).toHaveURL(/.*dashboard/);
    } catch (e) {
        // If we are already at dashboard, great.
        if (page.url().includes('/dashboard')) {
            return;
        }
        throw e;
    }
}
