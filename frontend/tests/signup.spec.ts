import { test, expect } from '@playwright/test';


const testCases = [
    { name: 'Root Route', url: '/' },
    { name: 'Dashboard Route', url: '/dashboard' },
    { name: 'Plans Route', url: '/plans' },
    { name: 'Profile Route', url: '/profile' },
    { name: 'Reports Route', url: '/reports' },
    { name: 'Non-existent Route', url: '/some-random-page' },
];

testCases.forEach(({ name, url }) => {
    test(`signup flow starting from ${name} (${url})`, async ({ page }) => {
        // 1. Navigate to the start URL
        await page.goto(url);

        // 2. Click Sign Up from Welcome Screen
        // Note: For non-root routes, the app should redirect to Welcome/Auth if not logged in.
        // We might need to wait for the redirect or the 'Sign Up' button to appear.
        await page.getByTestId('welcome-signup-button').click();

        // 3. Fill Credentials
        // Using a random email to avoid collision in repeated tests
        const randomId = Math.random().toString(36).substring(7);
        const email = `testuser_${randomId}@example.com`;

        await page.getByTestId('signup-email-input').fill(email);
        await page.getByTestId('signup-password-input').fill('password123');

        // 4. Click Create Account
        await page.getByTestId('signup-create-account-button').click();

        // 5. Verify Redirect
        // Smart Redirect: 
        // - Root ('/') -> Redirects to '/dashboard'
        // - Known Routes ('/plans', '/reports', etc.) -> Stays on that route
        // - Unknown Route ('/some-random-page') -> Redirects to '/dashboard' (via Catch-all)

        if (url === '/' || name === 'Non-existent Route' || url === '/dashboard') {
            await expect(page).toHaveURL(/.*dashboard/);
        } else {
            await expect(page).toHaveURL(new RegExp(url));
        }
    });
});
