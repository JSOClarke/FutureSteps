import { test, expect } from './fixtures/baseTest';

const USER_EMAIL = 'email@gmail.com';
const USER_PASSWORD = 'password';

test.describe('Full Plan Creation Flow', () => {
    test('Create a fully fledged plan with one of each category', async ({ page, authPage, plansPage, financialItemsPage }) => {
        // 1. Sign In
        await authPage.navigateTo('/');
        await authPage.login(USER_EMAIL, USER_PASSWORD);

        // 2. Create a new plan
        const planName = `Full Plan ${Date.now()}`;
        await plansPage.createPlan(planName, 'Comprehensive testing of all categories');

        // 3. Add Income
        await financialItemsPage.addIncome(
            'Primary Salary',
            '85000',
            'salary',
            { frequency: 'annual', adjustInflation: true }
        );

        // 4. Add Expense
        await financialItemsPage.addExpense(
            'Monthly Rent',
            '2500',
            'housing',
            { frequency: 'monthly', adjustInflation: true }
        );

        // 5. Add Asset
        await financialItemsPage.addAsset(
            'Global Index Fund',
            '50000',
            'investment',
            { growthRate: '7', yieldRate: '2', contribution: '1000' }
        );

        // 6. Add Liability
        await financialItemsPage.addLiability(
            'Car Loan',
            '15000',
            'loan',
            { interestRate: '4.5', minPayment: '3600' }
        );

        // 7. Verify all items are present in their respective sections
        // (addAsset/addIncome etc already check visibility, but let's be thorough)
        await expect(page.getByText('Primary Salary')).toBeVisible();
        await expect(page.getByText('Monthly Rent')).toBeVisible();
        await expect(page.getByText('Global Index Fund')).toBeVisible();
        await expect(page.getByText('Car Loan')).toBeVisible();

        // 8. Take a screenshot for verification
        await page.screenshot({ path: 'tests/screenshots/full-plan-complete.png', fullPage: true });
    });
});
