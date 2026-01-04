import type { FinancialItem } from '../../types'
import { isActiveInMonth, annualizeAmount, applyProportional, applyGrowth } from './helpers'

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
 * Calculate total income for a specific month
 */
export function calculateMonthlyIncome(
    incomes: FinancialItem[],
    year: number,
    month: number, // 1-12
    inflationRate: number = 0,
    baselineYear?: number
): IncomeResult {
    const activeIncomes = incomes.filter(i => isActiveInMonth(i, year, month))
    const details: IncomeResult['details'] = []

    // Monthly scalar (1/12)
    const fractionOfYear = 1 / 12

    const total = activeIncomes.reduce((sum, income) => {
        let annual = annualizeAmount(income.value, income.frequency)

        // Apply Growth (Inflation or Fixed %)
        let growthRateToUse = 0
        if (income.growthMode === 'inflation' || (income.growthMode === undefined && income.isAdjustedForInflation)) {
            growthRateToUse = inflationRate
        } else if (income.growthMode === 'percentage') {
            growthRateToUse = income.growthRate ?? 0
        }

        if (growthRateToUse !== 0) {
            // Calculate precise time difference in years
            const itemStartYear = income.startYear ?? new Date().getFullYear()
            // const itemStartMonth = income.startMonth ?? 1 // Unused
            const baseStartYear = baselineYear ?? itemStartYear

            // Current time in fractional years
            const currentTime = year + (month - 1) / 12
            // Start time in fractional years ( using baseline if provided, else item start)
            // Note: If baseline is provided (global start), we usually grow from there. 
            // Broad assumption: Growth starts from baselineYear (or item start if later? No, usually from Plan Start).
            const startTime = baseStartYear

            const yearsDifference = Math.max(0, currentTime - startTime)

            if (yearsDifference > 0) {
                annual = annual * Math.pow(1 + growthRateToUse, yearsDifference)
            }
        }

        // Apply Cap
        if (income.maxValue !== undefined && income.maxValue > 0) {
            annual = Math.min(annual, income.maxValue)
        }

        const monthlyAmount = applyProportional(annual, fractionOfYear)

        details.push({
            id: income.id,
            name: income.name,
            amount: monthlyAmount
        })

        return sum + monthlyAmount
    }, 0)

    return { total, details }
}

/**
 * Calculate total expenses for a specific month
 */
export function calculateMonthlyExpenses(
    expenses: FinancialItem[],
    year: number,
    month: number, // 1-12
    inflationRate: number = 0,
    baselineYear?: number
): ExpenseResult {
    const activeExpenses = expenses.filter(e => isActiveInMonth(e, year, month))
    const details: ExpenseResult['details'] = []

    // Monthly scalar
    const fractionOfYear = 1 / 12

    const total = activeExpenses.reduce((sum, expense) => {
        let annual = annualizeAmount(expense.value, expense.frequency)

        // Apply Growth (Inflation or Fixed %)
        let growthRateToUse = 0
        if (expense.growthMode === 'inflation' || (expense.growthMode === undefined && expense.isAdjustedForInflation)) {
            growthRateToUse = inflationRate
        } else if (expense.growthMode === 'percentage') {
            growthRateToUse = expense.growthRate ?? 0
        }

        if (growthRateToUse !== 0) {
            // Calculate precise time difference in years
            const currentTime = year + (month - 1) / 12
            const startTime = baselineYear ?? (expense.startYear ?? new Date().getFullYear())
            const yearsDifference = Math.max(0, currentTime - startTime)

            if (yearsDifference > 0) {
                annual = annual * Math.pow(1 + growthRateToUse, yearsDifference)
            }
        }

        // Apply Cap
        if (expense.maxValue !== undefined && expense.maxValue > 0) {
            annual = Math.min(annual, expense.maxValue)
        }

        const monthlyAmount = applyProportional(annual, fractionOfYear)

        details.push({
            id: expense.id,
            name: expense.name,
            amount: monthlyAmount
        })

        return sum + monthlyAmount
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

        growthHistory.push({
            assetId: asset.id,
            growthAmount: totalGrowth
        })
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
    // fractionOfYear: number = 1, // No longer used for limits, we use YTD
    contributionHistoryYTD: Map<string, number>
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
        const maxAnnualContribution = asset.maxAnnualContribution
        let allowedContribution = Infinity

        if (maxAnnualContribution !== undefined && maxAnnualContribution >= 0) {
            const usedYTD = contributionHistoryYTD.get(asset.id) ?? 0
            allowedContribution = Math.max(0, maxAnnualContribution - usedYTD)
        }

        // We can contribute up to the limit OR the available cashflow
        const actualContribution = Math.min(allowedContribution, Math.max(0, remainingCashflow))

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

            // Update YTD history (mutate or caller handles? Ideally mutate map passed in if it's transient context)
            contributionHistoryYTD.set(asset.id, (contributionHistoryYTD.get(asset.id) ?? 0) + actualContribution)
        }
    }

    return { updatedAssets, totalContributions, history }
}

/**
 * Allocate surplus cashflow to assets based on priority order
 * WATERFALL LOGIC: Goes through priority list, respecting maxAnnualContribution limits (YTD)
 */
export function allocateSurplus(
    surplus: number,
    assets: FinancialItem[],
    surplusPriority: string[] = [],
    contributionHistoryYTD: Map<string, number> = new Map()
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
                    let allocation = 0
                    const maxVal = asset.maxAnnualContribution

                    if (maxVal == null) {  // Checks both null and undefined
                        // Unlimited account - take all remaining surplus
                        allocation = remainingSurplus
                    } else if (maxVal > 0) {
                        // Limited account - check remaining room via YTD
                        const used = contributionHistoryYTD.get(assetId) ?? 0
                        const room = Math.max(0, maxVal - used)
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
                        contributionHistoryYTD.set(assetId, (contributionHistoryYTD.get(assetId) ?? 0) + allocation)
                    }
                }
            }
        }

        // Fallback: If no priority list provided or surplus remains, iterate through assets in order respecting limits
        if (remainingSurplus > 0 && surplusPriority.length === 0) {
            // Logic for generic fallback ... (Similar to above but iterating array)
            for (let i = 0; i < updatedAssets.length; i++) {
                if (remainingSurplus <= 0.01) break

                const asset = updatedAssets[i]
                const maxVal = asset.maxAnnualContribution
                let allocation = 0

                if (maxVal === undefined || maxVal === null) {
                    allocation = remainingSurplus
                } else if (maxVal > 0) {
                    const used = contributionHistoryYTD.get(asset.id) ?? 0
                    const room = Math.max(0, maxVal - used)
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
                    contributionHistoryYTD.set(asset.id, (contributionHistoryYTD.get(asset.id) ?? 0) + allocation)
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
