import { Page, expect } from '@playwright/test';

export class BasePage {
    constructor(protected readonly page: Page) { }

    async navigateTo(url: string) {
        await this.page.goto(url);
    }

    async getByTestId(testId: string) {
        return this.page.getByTestId(testId);
    }

    async waitForUrl(pattern: string | RegExp) {
        await expect(this.page).toHaveURL(pattern);
    }
}
