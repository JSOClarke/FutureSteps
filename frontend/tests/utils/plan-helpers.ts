import { Page, expect } from '@playwright/test';

export async function createPlan(page: Page, name: string, description?: string) {
    // 1. Ensure Plans section is open and click Add Plan
    // We assume the user is logged in and sidebar is visible

    // Check if plans lists is not expanded? 
    // The sidebar code defaults plansExpanded to true.
    // But we should robustly check.
    // For now, assume it's visible or we might need to click "Plans" to expand.

    // Click Add Plan
    await page.getByTestId('sidebar-add-plan-button').click();

    // 2. Fill Modal
    await page.getByTestId('create-plan-name-input').fill(name);
    if (description) {
        await page.getByTestId('create-plan-description-input').fill(description);
    }

    // 3. Submit
    await page.getByTestId('create-plan-submit-button').click();

    // 4. Verify Plan Created (e.g., navigated to plans page or sees empty state)
    // The app redirects to /plans and sets it active.
    // Verify we see the plan name in the header or list.
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();

    // Verify we are on the plans page
    await expect(page).toHaveURL(/.*plans/);
}
