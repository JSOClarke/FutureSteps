import type { FinancialItem } from '../../types'
import { filterByCategory, calculateNetWorth, sortFinancialItemsByPriority } from './helpers'
import {
    calculateYearlyIncome,
    calculateYearlyExpenses,
    processLiabilities,
    applyAssetGrowth,
    applyAssetYield,
    applyAssetContributions,
    allocateSurplus,
    coverDeficit
} from './calculators'

export interface YearResult {
    year: number
    totalIncome: number
    totalExpenses: number
    netCashflow: number
    remainingCashflow: number
    assets: FinancialItem[]
    liabilities: FinancialItem[]
    netWorth: number
    history: {
        income: Array<{ id: string; name: string; amount: number }>
        expenses: Array<{ id: string; name: string; amount: number }>
        growth: Array<{ assetId: string; growthAmount: number }>
        yield: Array<{ assetId: string; yieldAmount: number }>
        contributions: Array<{ assetId: string; amount: number }>
        surplus: Array<{ assetId: string; amount: number }>
        deficit: Array<{ assetId: string; amount: number }>
        liabilityPayments: Array<{
            liabilityId: string
            interestCharged: number
            principalPaid: number
            remainingBalance: number
        }>
    }
}

export interface ProjectionResult {
    years: YearResult[]
    summary: {
        startingNetWorth: number
        endingNetWorth: number
        totalGrowth: number
        averageAnnualReturn: number
    }
}

export class ProjectionEngine {
    /**
     * Run a single year projection
     */
    runSingleYear(
        incomes: FinancialItem[],
        expenses: FinancialItem[],
        assets: FinancialItem[],
        liabilities: FinancialItem[],
        year: number,
        fractionOfYear: number = 1,
        surplusPriority: string[] = [],
        deficitPriority: string[] = []
    ): YearResult {
        // 0. Capture opening balances for Mid-Year Convention calculation
        // This is crucial: We need to know what the balance was Jan 1 vs what was added during the year
        const openingBalances = new Map(assets.map(a => [a.id, a.value]))

        // 1. Calculate income and expenses for the year
        const incomeResult = calculateYearlyIncome(incomes, year, fractionOfYear)
        const expenseResult = calculateYearlyExpenses(expenses, year, fractionOfYear)

        let cashflow = incomeResult.total - expenseResult.total
        const netCashflow = cashflow

        // 2. Process liabilities (interest + payments)
        const liabilityResult = processLiabilities(liabilities, cashflow, fractionOfYear)
        cashflow -= liabilityResult.totalPayment

        // 3. Apply asset contributions (Waterfall Logic)
        // Sort assets by priority so high-priority assets get funded first
        const sortedAssets = sortFinancialItemsByPriority(assets, surplusPriority)

        const contributionResult = applyAssetContributions(
            sortedAssets,
            cashflow,
            fractionOfYear
        )
        cashflow -= contributionResult.totalContributions

        // 4. Handle surplus or deficit
        let updatedAssets = contributionResult.updatedAssets
        let surplusHistory: Array<{ assetId: string; amount: number }> = []
        let deficitHistory: Array<{ assetId: string; amount: number }> = []

        if (cashflow > 0) {
            // Surplus: add to assets based on priority
            // Note: Updated assets are already sorted by priority from step 3
            const surplusResult = allocateSurplus(cashflow, updatedAssets, surplusPriority)
            updatedAssets = surplusResult.updatedAssets
            surplusHistory = surplusResult.history
            cashflow = 0
        } else if (cashflow < 0) {
            // Deficit: withdraw from assets based on priority
            const deficitResult = coverDeficit(Math.abs(cashflow), updatedAssets, deficitPriority)
            updatedAssets = deficitResult.updatedAssets
            deficitHistory = deficitResult.history
            cashflow = -deficitResult.remainingDeficit
        }

        // 5. Apply growth to assets (using Mid-Year Convention)
        const growthResult = applyAssetGrowth(updatedAssets, openingBalances, fractionOfYear)

        // 6. Apply yield to assets
        const yieldResult = applyAssetYield(growthResult.updatedAssets, fractionOfYear)

        // 7. Calculate net worth
        const netWorth = calculateNetWorth(yieldResult.updatedAssets, liabilityResult.updatedLiabilities)

        return {
            year,
            totalIncome: incomeResult.total,
            totalExpenses: expenseResult.total,
            netCashflow,
            remainingCashflow: cashflow,
            assets: yieldResult.updatedAssets,
            liabilities: liabilityResult.updatedLiabilities,
            netWorth,
            history: {
                income: incomeResult.details,
                expenses: expenseResult.details,
                growth: growthResult.growthHistory,
                yield: yieldResult.yieldHistory,
                contributions: contributionResult.history,
                surplus: surplusHistory,
                deficit: deficitHistory,
                liabilityPayments: liabilityResult.history,
            }
        }
    }

    /**
     * Run multi-year projection
     */
    runMultiYearProjection(
        items: FinancialItem[],
        startYear: number,
        numberOfYears: number,
        surplusPriority: string[] = [],
        deficitPriority: string[] = []
    ): ProjectionResult {
        // Separate items by category
        const incomes = filterByCategory(items, 'income')
        const expenses = filterByCategory(items, 'expenses')
        let currentAssets = filterByCategory(items, 'assets')
        let currentLiabilities = filterByCategory(items, 'liabilities')

        const years: YearResult[] = []

        // Run projection for each year
        for (let i = 0; i < numberOfYears; i++) {
            const year = startYear + i

            // Calculate Fraction of Year if this is the current calendar year
            let fractionOfYear = 1
            const currentDate = new Date()
            if (year === currentDate.getFullYear()) {
                const currentMonthIndex = currentDate.getMonth() // 0-11
                const monthsRemaining = 12 - currentMonthIndex
                fractionOfYear = Math.max(0, monthsRemaining / 12)
            }

            const yearResult = this.runSingleYear(
                incomes,
                expenses,
                currentAssets,
                currentLiabilities,
                year,
                fractionOfYear,
                surplusPriority,
                deficitPriority
            )

            years.push(yearResult)

            // Use updated assets and liabilities for next year
            currentAssets = yearResult.assets
            currentLiabilities = yearResult.liabilities
        }

        // Calculate summary statistics
        const startingNetWorth = years[0]?.netWorth ?? 0
        const endingNetWorth = years[years.length - 1]?.netWorth ?? 0
        const totalGrowth = endingNetWorth - startingNetWorth
        const averageAnnualReturn = numberOfYears > 0 && startingNetWorth !== 0
            ? Math.pow(endingNetWorth / startingNetWorth, 1 / numberOfYears) - 1
            : 0

        return {
            years,
            summary: {
                startingNetWorth,
                endingNetWorth,
                totalGrowth,
                averageAnnualReturn
            }
        }
    }
}
