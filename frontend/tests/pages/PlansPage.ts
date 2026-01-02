import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class PlansPage extends BasePage {
    // Locators
    readonly sidebarAddPlanButton = this.page.getByTestId('sidebar-add-plan-button');
    readonly planNameInput = this.page.getByTestId('create-plan-name-input');
    readonly planDescInput = this.page.getByTestId('create-plan-description-input');
    readonly planSubmitButton = this.page.getByTestId('create-plan-submit-button');

    async createPlan(name: string, description?: string) {
        await this.sidebarAddPlanButton.click();
        await this.planNameInput.fill(name);
        if (description) {
            await this.planDescInput.fill(description);
        }
        await this.planSubmitButton.click();
        await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
        await expect(this.page).toHaveURL(/.*plans/);
    }

    async navigateToPlanById(planId: string) {
        await this.navigateTo(`/plans/${planId}`);
    }

    async getPlanIdFromUrl(): Promise<string | null> {
        const url = this.page.url();
        const match = url.match(/\/plans\/([a-f0-9-]+)/);
        return match ? match[1] : null;
    }

    async clickPlanInSidebar(planName: string) {
        await this.page.getByRole('button', { name: planName, exact: true }).click();
    }

    async verifyPlanIsActive(planName: string) {
        // Verify plan name appears in header
        await expect(this.page.getByText(planName).first()).toBeVisible();
    }

    async verifyUrlContainsPlanId() {
        await expect(this.page).toHaveURL(/\/plans\/[a-f0-9-]+/);
    }

    async getAllPlanNamesFromSidebar(): Promise<string[]> {
        // Wait for sidebar to be visible
        await this.page.waitForSelector('[data-testid="sidebar-add-plan-button"]');

        // Get all plan names from sidebar (they are in buttons within the plans section)
        const planElements = await this.page.locator('.ml-4.mt-1.space-y-1 button.flex-1').all();
        const planNames: string[] = [];

        for (const element of planElements) {
            const text = await element.textContent();
            if (text) planNames.push(text.trim());
        }

        return planNames;
    }

    async deletePlanFromSidebar(planName: string) {
        // Find the plan row and click the delete button
        const planRow = this.page.locator('.group.flex.items-center', { hasText: planName });
        const deleteButton = planRow.locator('button[title*="Delete"]');
        await deleteButton.click();

        // Confirm deletion in dialog
        await this.page.getByRole('button', { name: /delete plan/i }).click();
    }
}
