import { test, expect } from './fixtures/baseTest';

const testCases = [
    { name: 'Root Route', url: '/' },
    { name: 'Dashboard Route', url: '/dashboard' },
    { name: 'Plans Route', url: '/plans' },
    { name: 'Profile Route', url: '/profile' },
    { name: 'Reports Route', url: '/reports' },
    { name: 'Non-existent Route', url: '/some-random-page' },
];

test.describe('SignUp Flow (POM)', () => {
    testCases.forEach(({ name, url }) => {
        test(`signup flow starting from ${name} (${url})`, async ({ authPage }) => {
            await authPage.navigateTo(url);

            const randomId = Math.random().toString(36).substring(7);
            const email = `testuser_${randomId}@example.com`;
            const password = 'password123';

            await authPage.signup(email, password);

            if (url === '/' || name === 'Non-existent Route' || url === '/dashboard') {
                await authPage.waitForUrl(/.*dashboard/);
            } else {
                await authPage.waitForUrl(new RegExp(url));
            }
        });
    });
});
