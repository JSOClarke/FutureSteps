import { signIn } from './utils/auth-helpers';
import { createPlan } from './utils/plan-helpers';
import { test, expect } from '@playwright/test';


test('Verify Asset Annual Max Contribution Persistence', async ({ page }) => {
    // 1. Sign In
    await signIn(page);

    // 2. Create a new plan to ensure clean state
    await createPlan(page, 'Asset Test Plan', 'Testing asset contribution persistence');

    // 3. Add New Asset
    // Assuming "Add New" button for Assets has testid "add-new-assets-button"
    await page.getByTestId('add-new-assets-button').click();

    // 4. Select Subcategory (e.g. Investment)
    await page.getByRole('button', { name: 'Investment' }).click();

    // 5. Fill in Asset Details
    await page.getByTestId('item-name-input').fill('Test Asset Contribution');
    await page.getByTestId('item-amount-input').fill('10000');

    // Fill Contribution
    // CurrencyInput usually formats, so we just type numbers
    await page.getByTestId('item-contribution-input').fill('5000');

    // Save
    await page.getByTestId('financial-item-submit-button').click();

    // 5. Verify it appears in the list
    await expect(page.getByText('Test Asset Contribution')).toBeVisible();

    // 6. Click Edit
    // Click the card (or edit button if separate). Card often has clicking behavior.
    await page.getByText('Test Asset Contribution').click();

    // 7. Verify Contribution Value Persisted
    // CurrencyInput formats with commas: "5,000"
    const contributionInput = page.getByTestId('item-contribution-input');
    await expect(contributionInput).toHaveValue('5,000');
});
