import { test, expect } from './fixtures/baseTest';

const USER_EMAIL = 'email@gmail.com';
const USER_PASSWORD = 'password';

test.describe('Plan URL Navigation', () => {
    test.beforeEach(async ({ authPage }) => {
        await authPage.navigateTo('/');
        await authPage.login(USER_EMAIL, USER_PASSWORD);
    });

    test('should navigate to plan via URL and load correct plan', async ({ page, plansPage }) => {
        // Create two plans
        const plan1Name = `Plan A ${Date.now()}`;
        const plan2Name = `Plan B ${Date.now()}`;

        await plansPage.createPlan(plan1Name, 'First test plan');
        const plan1Id = await plansPage.getPlanIdFromUrl();
        expect(plan1Id).toBeTruthy();

        await plansPage.createPlan(plan2Name, 'Second test plan');
        const plan2Id = await plansPage.getPlanIdFromUrl();
        expect(plan2Id).toBeTruthy();

        // Navigate directly to plan 1 via URL
        await plansPage.navigateToPlanById(plan1Id!);
        await plansPage.verifyPlanIsActive(plan1Name);

        // Navigate directly to plan 2 via URL
        await plansPage.navigateToPlanById(plan2Id!);
        await plansPage.verifyPlanIsActive(plan2Name);
    });

    test('should update URL when clicking plan in sidebar', async ({ page, plansPage }) => {
        // Create two plans
        const plan1Name = `Plan X ${Date.now()}`;
        const plan2Name = `Plan Y ${Date.now()}`;

        await plansPage.createPlan(plan1Name);
        const plan1Id = await plansPage.getPlanIdFromUrl();

        await plansPage.createPlan(plan2Name);
        const plan2Id = await plansPage.getPlanIdFromUrl();

        // Click plan 1 in sidebar
        await plansPage.clickPlanInSidebar(plan1Name);
        await plansPage.verifyUrlContainsPlanId();
        expect(await plansPage.getPlanIdFromUrl()).toBe(plan1Id);

        // Click plan 2 in sidebar
        await plansPage.clickPlanInSidebar(plan2Name);
        await plansPage.verifyUrlContainsPlanId();
        expect(await plansPage.getPlanIdFromUrl()).toBe(plan2Id);
    });

    test('should support browser back/forward navigation between plans', async ({ page, plansPage }) => {
        // Create three plans
        const plan1Name = `History Plan 1 ${Date.now()}`;
        const plan2Name = `History Plan 2 ${Date.now()}`;
        const plan3Name = `History Plan 3 ${Date.now()}`;

        await plansPage.createPlan(plan1Name);
        const plan1Id = await plansPage.getPlanIdFromUrl();

        await plansPage.createPlan(plan2Name);
        const plan2Id = await plansPage.getPlanIdFromUrl();

        await plansPage.createPlan(plan3Name);
        const plan3Id = await plansPage.getPlanIdFromUrl();

        // Navigate: Plan 3 -> Plan 1 -> Plan 2
        await plansPage.clickPlanInSidebar(plan1Name);
        await plansPage.verifyPlanIsActive(plan1Name);

        await plansPage.clickPlanInSidebar(plan2Name);
        await plansPage.verifyPlanIsActive(plan2Name);

        // Use browser back button
        await page.goBack();
        await plansPage.verifyPlanIsActive(plan1Name);
        expect(await plansPage.getPlanIdFromUrl()).toBe(plan1Id);

        // Use browser forward button
        await page.goForward();
        await plansPage.verifyPlanIsActive(plan2Name);
        expect(await plansPage.getPlanIdFromUrl()).toBe(plan2Id);

        // Go back twice
        await page.goBack();
        await page.goBack();
        await plansPage.verifyPlanIsActive(plan3Name);
        expect(await plansPage.getPlanIdFromUrl()).toBe(plan3Id);
    });

    test('should redirect to first plan when navigating to /plans without ID', async ({ page, plansPage }) => {
        // Create a plan
        const planName = `Redirect Test ${Date.now()}`;
        await plansPage.createPlan(planName);
        const planId = await plansPage.getPlanIdFromUrl();

        // Navigate to /plans without ID
        await page.goto('/plans');

        // Should redirect to first available plan
        await plansPage.verifyUrlContainsPlanId();
        expect(await plansPage.getPlanIdFromUrl()).toBe(planId);
    });

    test('should handle invalid plan ID gracefully', async ({ page, plansPage }) => {
        // Create at least one valid plan
        const planName = `Valid Plan ${Date.now()}`;
        await plansPage.createPlan(planName);

        // Navigate to invalid plan ID
        await page.goto('/plans/invalid-plan-id-12345');

        // Should redirect to first available plan or dashboard
        await page.waitForURL(/\/(plans\/[a-f0-9-]+|dashboard)/);

        // Verify we're not on the invalid URL anymore
        expect(page.url()).not.toContain('invalid-plan-id-12345');
    });

    test('should maintain plan context when refreshing page', async ({ page, plansPage }) => {
        // Create a plan
        const planName = `Refresh Test ${Date.now()}`;
        await plansPage.createPlan(planName, 'Testing page refresh');
        const planId = await plansPage.getPlanIdFromUrl();

        // Refresh the page
        await page.reload();

        // Verify we're still on the same plan
        await plansPage.verifyPlanIsActive(planName);
        expect(await plansPage.getPlanIdFromUrl()).toBe(planId);
    });

    test('should navigate to new plan after creation', async ({ page, plansPage }) => {
        const planName = `New Plan ${Date.now()}`;

        // Create plan
        await plansPage.createPlan(planName, 'Auto-navigation test');

        // Verify URL contains plan ID
        await plansPage.verifyUrlContainsPlanId();
        const planId = await plansPage.getPlanIdFromUrl();
        expect(planId).toBeTruthy();
        expect(planId).toMatch(/^[a-f0-9-]+$/);

        // Verify plan is active
        await plansPage.verifyPlanIsActive(planName);
    });

    test('should navigate to next plan after deleting active plan', async ({ page, plansPage }) => {
        // Create two plans
        const plan1Name = `Delete Plan 1 ${Date.now()}`;
        const plan2Name = `Delete Plan 2 ${Date.now()}`;

        await plansPage.createPlan(plan1Name);
        const plan1Id = await plansPage.getPlanIdFromUrl();

        await plansPage.createPlan(plan2Name);
        const plan2Id = await plansPage.getPlanIdFromUrl();

        // Make sure we're on plan 2
        await plansPage.clickPlanInSidebar(plan2Name);
        expect(await plansPage.getPlanIdFromUrl()).toBe(plan2Id);

        // Delete plan 2 (active plan)
        await plansPage.deletePlanFromSidebar(plan2Name);

        // Should navigate to plan 1 or dashboard
        await page.waitForURL(/\/(plans\/[a-f0-9-]+|dashboard)/);

        // Verify we're not on the deleted plan
        expect(await plansPage.getPlanIdFromUrl()).not.toBe(plan2Id);
    });

    test('should support bookmarking specific plans', async ({ page, plansPage, context }) => {
        // Create a plan
        const planName = `Bookmark Test ${Date.now()}`;
        await plansPage.createPlan(planName, 'Testing bookmarks');
        const planId = await plansPage.getPlanIdFromUrl();
        const bookmarkedUrl = page.url();

        // Navigate away
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/dashboard/);

        // Navigate back using bookmarked URL
        await page.goto(bookmarkedUrl);

        // Verify we're on the correct plan
        await plansPage.verifyPlanIsActive(planName);
        expect(await plansPage.getPlanIdFromUrl()).toBe(planId);
    });
});

test.describe('Plan URL Navigation - Multi-Tab', () => {
    test('should support different plans in different tabs', async ({ browser }) => {
        // Create two separate contexts (tabs)
        const context = await browser.newContext();
        const page1 = await context.newPage();
        const page2 = await context.newPage();

        // Import page objects for both tabs
        const { AuthPage } = await import('./pages/AuthPage');
        const { PlansPage } = await import('./pages/PlansPage');

        const authPage1 = new AuthPage(page1);
        const plansPage1 = new PlansPage(page1);
        const authPage2 = new AuthPage(page2);
        const plansPage2 = new PlansPage(page2);

        // Login in both tabs
        await authPage1.navigateTo('/');
        await authPage1.login(USER_EMAIL, USER_PASSWORD);

        await authPage2.navigateTo('/');
        await authPage2.login(USER_EMAIL, USER_PASSWORD);

        // Create two plans in tab 1
        const plan1Name = `Tab Plan 1 ${Date.now()}`;
        const plan2Name = `Tab Plan 2 ${Date.now()}`;

        await plansPage1.createPlan(plan1Name);
        const plan1Id = await plansPage1.getPlanIdFromUrl();

        await plansPage1.createPlan(plan2Name);
        const plan2Id = await plansPage1.getPlanIdFromUrl();

        // Navigate tab 1 to plan 1
        await plansPage1.navigateToPlanById(plan1Id!);
        await plansPage1.verifyPlanIsActive(plan1Name);

        // Navigate tab 2 to plan 2
        await plansPage2.navigateToPlanById(plan2Id!);
        await plansPage2.verifyPlanIsActive(plan2Name);

        // Verify both tabs maintain their own plan
        expect(await plansPage1.getPlanIdFromUrl()).toBe(plan1Id);
        expect(await plansPage2.getPlanIdFromUrl()).toBe(plan2Id);

        // Cleanup
        await context.close();
    });
});

test.describe('Plan URL Navigation - Guest Mode', () => {
    test('should support URL navigation in guest mode', async ({ page }) => {
        const { PlansPage } = await import('./pages/PlansPage');
        const plansPage = new PlansPage(page);

        // Start in guest mode (don't login)
        await page.goto('/');

        // Skip onboarding if present
        const continueButton = page.getByRole('button', { name: /continue as guest/i });
        if (await continueButton.isVisible()) {
            await continueButton.click();
        }

        // Create plans in guest mode
        const plan1Name = `Guest Plan 1 ${Date.now()}`;
        const plan2Name = `Guest Plan 2 ${Date.now()}`;

        await page.goto('/plans');
        await plansPage.createPlan(plan1Name);
        const plan1Id = await plansPage.getPlanIdFromUrl();

        await plansPage.createPlan(plan2Name);
        const plan2Id = await plansPage.getPlanIdFromUrl();

        // Navigate between plans via URL
        await plansPage.navigateToPlanById(plan1Id!);
        await plansPage.verifyPlanIsActive(plan1Name);

        await plansPage.navigateToPlanById(plan2Id!);
        await plansPage.verifyPlanIsActive(plan2Name);

        // Verify browser navigation works
        await page.goBack();
        expect(await plansPage.getPlanIdFromUrl()).toBe(plan1Id);
    });
});
