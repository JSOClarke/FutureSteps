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
    fractionOfYear: number = 1,
    inflationRate: number = 0
): IncomeResult {
    const activeIncomes = incomes.filter(i => isActiveInYear(i, year))
    const details: IncomeResult['details'] = []

    const total = activeIncomes.reduce((sum, income) => {
        let annual = annualizeAmount(income.value, income.frequency)

        // Apply inflation adjustment if enabled
        if (income.isAdjustedForInflation && inflationRate !== 0) {
            const startYear = income.startYear ?? new Date().getFullYear()
            const yearsDifference = Math.max(0, year - startYear)
            if (yearsDifference > 0) {
                annual = annual * Math.pow(1 + inflationRate, yearsDifference)
            }
        }

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
    fractionOfYear: number = 1,
    inflationRate: number = 0
): ExpenseResult {
    const activeExpenses = expenses.filter(e => isActiveInYear(e, year))
    const details: ExpenseResult['details'] = []

    const total = activeExpenses.reduce((sum, expense) => {
        let annual = annualizeAmount(expense.value, expense.frequency)

        // Apply inflation adjustment if enabled
        if (expense.isAdjustedForInflation && inflationRate !== 0) {
            const startYear = expense.startYear ?? new Date().getFullYear()
            const yearsDifference = Math.max(0, year - startYear)
            if (yearsDifference > 0) {
                annual = annual * Math.pow(1 + inflationRate, yearsDifference)
            }
        }

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
        const maxAnnualContribution = asset.maxAnnualContribution ?? 0
        const annualContribution = maxAnnualContribution * fractionOfYear
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
 * WATERFALL LOGIC: Goes through priority list, respecting maxAnnualContribution limits
 */
export function allocateSurplus(
    surplus: number,
    assets: FinancialItem[],
    surplusPriority: string[] = [],
    contributionHistory: Map<string, number> = new Map(),
    fractionOfYear: number = 1
): {
    updatedAssets: FinancialItem[]
    history: Array<{ assetId: string; amount: number }>
} {
    const updatedAssets = [...assets]
    const history: Array<{ assetId: string; amount: number }> = []

    if (surplus > 0 && updatedAssets.length > 0) {
        let remainingSurplus = surplus
        const assetsMap = new Map(updatedAssets.map((a, i) => [a.id, { asset: a, index: i }]))

        // Waterfall through priority list
        if (surplusPriority.length > 0) {
            for (const assetId of surplusPriority) {
                if (remainingSurplus <= 0.01) break // Stop if depleted

                const entry = assetsMap.get(assetId)

                if (entry) {
                    const { asset, index } = entry

                    // Determine allocation based on maxAnnualContribution:
                    // - undefined = unlimited (takes all remaining surplus)
                    // - number > 0 = limited (respects the cap)
                    // - 0 = no contribution allowed

                    let allocation = 0
                    const maxVal = asset.maxAnnualContribution

                    if (maxVal == null) {  // Checks both null and undefined
                        // Unlimited account - take all remaining surplus
                        allocation = remainingSurplus
                    } else if (maxVal > 0) {
                        // Limited account - check remaining room
                        const limit = maxVal * fractionOfYear
                        const used = contributionHistory.get(assetId) ?? 0
                        const room = Math.max(0, limit - used)
                        allocation = Math.min(remainingSurplus, room)
                    }
                    // If maxVal === 0, allocation stays 0 (no contribution allowed)

                    if (allocation > 0) {
                        updatedAssets[index] = {
                            ...updatedAssets[index],
                            value: updatedAssets[index].value + allocation
                        }

                        history.push({
                            assetId: asset.id,
                            amount: allocation
                        })

                        remainingSurplus -= allocation
                        contributionHistory.set(assetId, (contributionHistory.get(assetId) ?? 0) + allocation)
                    }
                }
            }
        }

        // Fallback: If no priority list provided, iterate through assets in order respecting limits
        if (remainingSurplus > 0 && surplusPriority.length === 0) {
            for (let i = 0; i < updatedAssets.length; i++) {
                if (remainingSurplus <= 0.01) break

                const asset = updatedAssets[i]
                const maxVal = asset.maxAnnualContribution
                let allocation = 0

                if (maxVal === undefined) {
                    allocation = remainingSurplus
                } else if (maxVal > 0) {
                    const limit = maxVal * fractionOfYear
                    const used = contributionHistory.get(asset.id) ?? 0
                    const room = Math.max(0, limit - used)
                    allocation = Math.min(remainingSurplus, room)
                }

                if (allocation > 0) {
                    updatedAssets[i] = {
                        ...updatedAssets[i],
                        value: updatedAssets[i].value + allocation
                    }
                    history.push({
                        assetId: asset.id,
                        amount: allocation
                    })
                    remainingSurplus -= allocation
                    contributionHistory.set(asset.id, (contributionHistory.get(asset.id) ?? 0) + allocation)
                }
            }
        }
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
