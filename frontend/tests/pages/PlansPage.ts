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
}
