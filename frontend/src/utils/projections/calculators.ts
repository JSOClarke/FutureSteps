import type { FinancialItem } from '../../types'
import { isActiveInYear, annualizeAmount, applyProportional, applyGrowth } from './helpers'

export interface IncomeResult {
    total: number
    details: Array<{
        id: string
        name: string
        amount: number
    }>
}

export interface ExpenseResult {
    total: number
    details: Array<{
        id: string
        name: string
        amount: number
    }>
}

export interface AssetGrowthResult {
    updatedAssets: FinancialItem[]
    growthHistory: Array<{
        assetId: string
        growthAmount: number
    }>
}

export interface AssetYieldResult {
    updatedAssets: FinancialItem[]
    yieldHistory: Array<{
        assetId: string
        yieldAmount: number
    }>
}

export interface LiabilityResult {
    updatedLiabilities: FinancialItem[]
    totalPayment: number
    history: Array<{
        liabilityId: string
        interestCharged: number
        principalPaid: number
        remainingBalance: number
    }>
}

/**
 * Calculate total income for a year
 */
export function calculateYearlyIncome(
    incomes: FinancialItem[],
    year: number,
    fractionOfYear: number = 1
): IncomeResult {
    const activeIncomes = incomes.filter(i => isActiveInYear(i, year))
    const details: IncomeResult['details'] = []

    const total = activeIncomes.reduce((sum, income) => {
        const annual = annualizeAmount(income.value, income.frequency)
        const prorated = applyProportional(annual, fractionOfYear)

        details.push({
            id: income.id,
            name: income.name,
            amount: prorated
        })

        return sum + prorated
    }, 0)

    return { total, details }
}

/**
 * Calculate total expenses for a year
 */
export function calculateYearlyExpenses(
    expenses: FinancialItem[],
    year: number,
    fractionOfYear: number = 1
): ExpenseResult {
    const activeExpenses = expenses.filter(e => isActiveInYear(e, year))
    const details: ExpenseResult['details'] = []

    const total = activeExpenses.reduce((sum, expense) => {
        const annual = annualizeAmount(expense.value, expense.frequency)
        const prorated = applyProportional(annual, fractionOfYear)

        details.push({
            id: expense.id,
            name: expense.name,
            amount: prorated
        })

        return sum + prorated
    }, 0)

    return { total, details }
}

/**
 * Process liability interest and payments
 */
export function processLiabilities(
    liabilities: FinancialItem[],
    availableCashflow: number,
    fractionOfYear: number = 1
): LiabilityResult {
    const updatedLiabilities: FinancialItem[] = []
    const history: LiabilityResult['history'] = []
    let totalPayment = 0
    let remainingCashflow = availableCashflow

    for (const liability of liabilities) {
        // Calculate interest for the period
        const interestRate = liability.interestRate ?? 0
        const interestCharged = liability.value * interestRate * fractionOfYear

        // Add interest to balance
        let newBalance = liability.value + interestCharged

        // Calculate payment (minimum or available cashflow, whichever is less)
        const minimumPayment = (liability.minimumPayment ?? 0) * fractionOfYear
        const desiredPayment = Math.min(minimumPayment, newBalance)
        const actualPayment = Math.min(desiredPayment, Math.max(0, remainingCashflow))

        // Apply payment
        newBalance -= actualPayment
        remainingCashflow -= actualPayment
        totalPayment += actualPayment

        updatedLiabilities.push({
            ...liability,
            value: newBalance
        })

        history.push({
            liabilityId: liability.id,
            interestCharged,
            principalPaid: actualPayment,
            remainingBalance: newBalance
        })
    }

    return { updatedLiabilities, totalPayment, history }
}

/**
 * Apply growth rates to assets using Mid-Year Convention
 * Principal grows for full year, flows (contributions/withdrawals) grow for half year
 */
export function applyAssetGrowth(
    assets: FinancialItem[],
    openingBalances: Map<string, number>,
    fractionOfYear: number = 1
): AssetGrowthResult {
    const updatedAssets: FinancialItem[] = []
    const growthHistory: AssetGrowthResult['growthHistory'] = []

    for (const asset of assets) {
        const growthRate = asset.growthRate ?? 0
        const openingBalance = openingBalances.get(asset.id) ?? 0
        const currentBalance = asset.value

        // Net flow is the difference between current balance (after contribs/withdrawals) and opening balance
        // If this is a new asset not in opening balances, the entire value is a flow
        const netFlow = currentBalance - openingBalance

        // 1. Growth on Opening Balance (Full Period)
        const principalGrowth = applyGrowth(openingBalance, growthRate, fractionOfYear)

        // 2. Growth on Net Flow (Half Period) - Mid-Year Convention
        // Use half the period for the flow
        const flowGrowth = applyGrowth(netFlow, growthRate, fractionOfYear / 2)

        const totalGrowth = principalGrowth + flowGrowth

        updatedAssets.push({
            ...asset,
            value: asset.value + totalGrowth
        })

        if (totalGrowth !== 0) {
            growthHistory.push({
                assetId: asset.id,
                growthAmount: totalGrowth
            })
        }
    }

    return { updatedAssets, growthHistory }
}

/**
 * Apply yield/dividends to assets
 */
export function applyAssetYield(
    assets: FinancialItem[],
    fractionOfYear: number = 1
): AssetYieldResult {
    const updatedAssets: FinancialItem[] = []
    const yieldHistory: AssetYieldResult['yieldHistory'] = []

    for (const asset of assets) {
        const yieldRate = asset.yieldRate ?? 0
        const yieldAmount = asset.value * yieldRate * fractionOfYear

        updatedAssets.push({
            ...asset,
            value: asset.value + yieldAmount
        })

        if (yieldAmount !== 0) {
            yieldHistory.push({
                assetId: asset.id,
                yieldAmount
            })
        }
    }

    return { updatedAssets, yieldHistory }
}

/**
 * Apply monthly contributions to assets
 */
export function applyAssetContributions(
    assets: FinancialItem[],
    availableCashflow: number,
    fractionOfYear: number = 1
): {
    updatedAssets: FinancialItem[]
    totalContributions: number
    history: Array<{ assetId: string; amount: number }>
} {
    const updatedAssets: FinancialItem[] = []
    const history: Array<{ assetId: string; amount: number }> = []
    let totalContributions = 0
    let remainingCashflow = availableCashflow

    for (const asset of assets) {
        const monthlyContribution = asset.monthlyContribution ?? 0
        const annualContribution = monthlyContribution * 12 * fractionOfYear
        const actualContribution = Math.min(annualContribution, Math.max(0, remainingCashflow))

        updatedAssets.push({
            ...asset,
            value: asset.value + actualContribution
        })

        if (actualContribution > 0) {
            history.push({
                assetId: asset.id,
                amount: actualContribution
            })
            totalContributions += actualContribution
            remainingCashflow -= actualContribution
        }
    }

    return { updatedAssets, totalContributions, history }
}

/**
 * Allocate surplus cashflow to assets based on priority order
 */
export function allocateSurplus(
    surplus: number,
    assets: FinancialItem[],
    surplusPriority: string[] = []
): {
    updatedAssets: FinancialItem[]
    history: Array<{ assetId: string; amount: number }>
} {
    const updatedAssets = [...assets]
    const history: Array<{ assetId: string; amount: number }> = []

    if (surplus > 0 && updatedAssets.length > 0) {
        // If priority is specified, use it; otherwise use first asset
        let targetAssetIndex = 0

        if (surplusPriority.length > 0) {
            // Find the first asset in the priority list that exists
            for (const assetId of surplusPriority) {
                const index = updatedAssets.findIndex(a => a.id === assetId)
                if (index !== -1) {
                    targetAssetIndex = index
                    break
                }
            }
        }

        // Allocate to target asset
        updatedAssets[targetAssetIndex] = {
            ...updatedAssets[targetAssetIndex],
            value: updatedAssets[targetAssetIndex].value + surplus
        }

        history.push({
            assetId: updatedAssets[targetAssetIndex].id,
            amount: surplus
        })
    }

    return { updatedAssets, history }
}

/**
 * Cover deficit by withdrawing from assets based on priority order
 */
export function coverDeficit(
    deficit: number,
    assets: FinancialItem[],
    deficitPriority: string[] = []
): {
    updatedAssets: FinancialItem[]
    remainingDeficit: number
    history: Array<{ assetId: string; amount: number }>
} {
    const updatedAssets: FinancialItem[] = []
    const history: Array<{ assetId: string; amount: number }> = []
    let remaining = deficit

    // If priority is specified, use it to determine withdrawal order
    let assetOrder = assets
    if (deficitPriority.length > 0) {
        // Create a map for quick lookup
        const assetsMap = new Map(assets.map(a => [a.id, a]))

        // First, add assets in priority order
        const prioritizedAssets: FinancialItem[] = []
        for (const assetId of deficitPriority) {
            const asset = assetsMap.get(assetId)
            if (asset) {
                prioritizedAssets.push(asset)
                assetsMap.delete(assetId)
            }
        }

        // Then add any remaining assets not in priority list
        assetOrder = [...prioritizedAssets, ...Array.from(assetsMap.values())]
    }

    for (const asset of assetOrder) {
        if (remaining <= 0) {
            updatedAssets.push(asset)
            continue
        }

        const withdrawal = Math.min(remaining, asset.value)

        updatedAssets.push({
            ...asset,
            value: asset.value - withdrawal
        })

        if (withdrawal > 0) {
            history.push({
                assetId: asset.id,
                amount: withdrawal
            })
            remaining -= withdrawal
        }
    }

    return { updatedAssets, remainingDeficit: remaining, history }
}
