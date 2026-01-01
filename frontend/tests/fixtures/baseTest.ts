import { test as base } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';
import { PlansPage } from '../pages/PlansPage';
import { FinancialItemsPage } from '../pages/FinancialItemsPage';

type MyFixtures = {
    authPage: AuthPage;
    plansPage: PlansPage;
    financialItemsPage: FinancialItemsPage;
};

export const test = base.extend<MyFixtures>({
    authPage: async ({ page }, use) => {
        await use(new AuthPage(page));
    },
    plansPage: async ({ page }, use) => {
        await use(new PlansPage(page));
    },
    financialItemsPage: async ({ page }, use) => {
        await use(new FinancialItemsPage(page));
    },
});

export { expect } from '@playwright/test';
