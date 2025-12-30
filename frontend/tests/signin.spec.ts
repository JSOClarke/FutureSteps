import { test, expect } from '@playwright/test';

// Golden User Credentials
// Ensure this user exists in your local/test database!
const USER_EMAIL = 'email@gmail.com';
const USER_PASSWORD = 'password';

const testCases = [
    { name: 'Root Route', url: '/' },
    { name: 'Dashboard Route', url: '/dashboard' },
    { name: 'Plans Route', url: '/plans' },
    { name: 'Profile Route', url: '/profile' },
    { name: 'Reports Route', url: '/reports' },
];

testCases.forEach(({ name, url }) => {
    test(`signin flow starting from ${name} (${url})`, async ({ page }) => {
        // 1. Navigate to the start URL
        await page.goto(url);

        // 2. Click Sign In
        // If we are on a protected route, we might see the Welcome screen with "Sign In" button.
        // If we are on root, we might see the same.
        // We wait for the button to be visible to ensure page load.
        await page.getByTestId('welcome-signin-button').click();

        // 3. Fill Credentials
        await page.getByTestId('auth-email-input').fill(USER_EMAIL);
        await page.getByTestId('auth-password-input').fill(USER_PASSWORD);

        // 4. Submit
        await page.getByTestId('auth-submit-button').click();

        // 5. Verify URL is preserved
        // Note: For root '/', it redirects to dashboard.
        // For other routes, it should stay on that route.
        if (url === '/') {
            await expect(page).toHaveURL(/.*dashboard/);
        } else {
            await expect(page).toHaveURL(new RegExp(url));
        }
    });
});
