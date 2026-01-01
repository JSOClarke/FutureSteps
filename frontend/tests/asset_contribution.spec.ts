import { test, expect } from './fixtures/baseTest';

// Golden User Credentials
const USER_EMAIL = 'email@gmail.com';
const USER_PASSWORD = 'password';

test('Verify Asset Annual Max Contribution Persistence', async ({ authPage, plansPage, financialItemsPage }) => {
    // 1. Sign In
    await authPage.navigateTo('/');
    await authPage.login(USER_EMAIL, USER_PASSWORD);

    // 2. Create a new plan to ensure clean state
    await plansPage.createPlan('Asset Test Plan POM', 'Testing asset contribution persistence with POM');

    // 3. Add New Asset
    await financialItemsPage.addAsset(
        'Test Asset Contribution POM',
        '10000',
        'investment',
        { contribution: '5000' }
    );

    // 4. Click Edit (re-open)
    await financialItemsPage.openItem('Test Asset Contribution POM');

    // 5. Verify Contribution Value Persisted
    const contributionValue = await financialItemsPage.getContributionValue();
    expect(contributionValue).toBe('5,000');
});
