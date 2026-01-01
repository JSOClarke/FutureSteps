import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class FinancialItemsPage extends BasePage {
    // Locators
    readonly addIncomeButton = this.page.getByTestId('add-new-income-button');
    readonly addExpenseButton = this.page.getByTestId('add-new-expenses-button');
    readonly addAssetButton = this.page.getByTestId('add-new-assets-button');
    readonly addLiabilityButton = this.page.getByTestId('add-new-liabilities-button');

    readonly itemNameInput = this.page.getByTestId('item-name-input');
    readonly itemAmountInput = this.page.getByTestId('item-amount-input');
    readonly itemStartYearSelect = this.page.getByTestId('item-start-year-select');
    readonly itemEndYearSelect = this.page.getByTestId('item-end-year-select');
    readonly itemFrequencySelect = this.page.getByTestId('item-frequency-select');
    readonly itemInflationToggle = this.page.getByTestId('item-inflation-toggle');

    readonly itemGrowthRateInput = this.page.getByTestId('item-growth-rate-input');
    readonly itemYieldRateInput = this.page.getByTestId('item-yield-rate-input');
    readonly itemContributionInput = this.page.getByTestId('item-contribution-input');

    readonly itemInterestRateInput = this.page.getByTestId('item-interest-rate-input');
    readonly itemMinimumPaymentInput = this.page.getByTestId('item-minimum-payment-input');

    readonly submitButton = this.page.getByTestId('financial-item-submit-button');

    async addIncome(name: string, amount: string, subCategory: string, options?: { frequency?: string; adjustInflation?: boolean }) {
        await this.addIncomeButton.click();
        await this.page.getByTestId(`subcategory-option-${subCategory}`).click();
        await this.itemNameInput.fill(name);
        await this.itemAmountInput.fill(amount);
        if (options?.frequency) await this.itemFrequencySelect.selectOption(options.frequency);
        if (options?.adjustInflation) await this.itemInflationToggle.check();
        await this.submitButton.click();
        await expect(this.page.getByText(name)).toBeVisible();
    }

    async addExpense(name: string, amount: string, subCategory: string, options?: { frequency?: string; adjustInflation?: boolean }) {
        await this.addExpenseButton.click();
        await this.page.getByTestId(`subcategory-option-${subCategory}`).click();
        await this.itemNameInput.fill(name);
        await this.itemAmountInput.fill(amount);
        if (options?.frequency) await this.itemFrequencySelect.selectOption(options.frequency);
        if (options?.adjustInflation) await this.itemInflationToggle.check();
        await this.submitButton.click();
        await expect(this.page.getByText(name)).toBeVisible();
    }

    async addAsset(name: string, amount: string, subCategory: string, options?: { growthRate?: string; yieldRate?: string; contribution?: string }) {
        await this.addAssetButton.click();
        await this.page.getByTestId(`subcategory-option-${subCategory}`).click();
        await this.itemNameInput.fill(name);
        await this.itemAmountInput.fill(amount);
        if (options?.growthRate) await this.itemGrowthRateInput.fill(options.growthRate);
        if (options?.yieldRate) await this.itemYieldRateInput.fill(options.yieldRate);
        if (options?.contribution) await this.itemContributionInput.fill(options.contribution);
        await this.submitButton.click();
        await expect(this.page.getByText(name)).toBeVisible();
    }

    async addLiability(name: string, amount: string, subCategory: string, options?: { interestRate?: string; minPayment?: string }) {
        await this.addLiabilityButton.click();
        await this.page.getByTestId(`subcategory-option-${subCategory}`).click();
        await this.itemNameInput.fill(name);
        await this.itemAmountInput.fill(amount);
        if (options?.interestRate) await this.itemInterestRateInput.fill(options.interestRate);
        if (options?.minPayment) await this.itemMinimumPaymentInput.fill(options.minPayment);
        await this.submitButton.click();
        await expect(this.page.getByText(name)).toBeVisible();
    }

    async openItem(name: string) {
        await this.page.getByText(name).click();
    }

    async getContributionValue() {
        return this.itemContributionInput.inputValue();
    }
}
