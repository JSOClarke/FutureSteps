import { test, expect } from './fixtures/baseTest';

const USER_EMAIL = 'email@gmail.com';
const USER_PASSWORD = 'password';

const testCases = [
    { name: 'Root Route', url: '/' },
    { name: 'Dashboard Route', url: '/dashboard' },
    { name: 'Plans Route', url: '/plans' },
    { name: 'Profile Route', url: '/profile' },
    { name: 'Reports Route', url: '/reports' },
];

test.describe('SignIn Flow (POM)', () => {
    testCases.forEach(({ name, url }) => {
        test(`signin flow starting from ${name} (${url})`, async ({ page, authPage }) => {
            await authPage.navigateTo(url);
            await authPage.login(USER_EMAIL, USER_PASSWORD);

            if (url === '/') {
                await expect(page).toHaveURL(/.*dashboard/);
            } else {
                await expect(page).toHaveURL(new RegExp(`${url}.*`));
            }
        });
    });
});
