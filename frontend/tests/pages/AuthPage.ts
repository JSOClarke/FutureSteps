import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AuthPage extends BasePage {
    // Locators
    readonly welcomeSigninButton = this.page.getByTestId('welcome-signin-button');
    readonly welcomeSignupButton = this.page.getByTestId('welcome-signup-button');

    readonly signinEmailInput = this.page.getByTestId('auth-email-input');
    readonly signinPasswordInput = this.page.getByTestId('auth-password-input');
    readonly signinSubmitButton = this.page.getByTestId('auth-submit-button');

    readonly signupEmailInput = this.page.getByTestId('signup-email-input');
    readonly signupPasswordInput = this.page.getByTestId('signup-password-input');
    readonly signupCreateAccountButton = this.page.getByTestId('signup-create-account-button');

    async login(email: string, password: string) {
        if (this.page.url().includes('/dashboard')) return;

        await this.welcomeSigninButton.click();
        await this.signinEmailInput.fill(email);
        await this.signinPasswordInput.fill(password);
        await this.signinSubmitButton.click();
    }

    async signup(email: string, password: string) {
        await this.welcomeSignupButton.click();
        await this.signupEmailInput.fill(email);
        await this.signupPasswordInput.fill(password);
        await this.signupCreateAccountButton.click();
    }
}
