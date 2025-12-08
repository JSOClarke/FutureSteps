import type { FinancialItem } from '../../types'
import { filterByCategory, calculateNetWorth } from './helpers'
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
        growth: Array<{ assetId: string; growthAmount: number }>
        yield: Array<{ assetId: string; yieldAmount: number }>
        contributions: Array<{ assetId: string; amount: number }>
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
        fractionOfYear: number = 1
    ): YearResult {
        // 1. Calculate income and expenses for the year
        const incomeResult = calculateYearlyIncome(incomes, year, fractionOfYear)
        const expenseResult = calculateYearlyExpenses(expenses, year, fractionOfYear)

        let cashflow = incomeResult.total - expenseResult.total
        const netCashflow = cashflow

        // 2. Process liabilities (interest + payments)
        const liabilityResult = processLiabilities(liabilities, cashflow, fractionOfYear)
        cashflow -= liabilityResult.totalPayment

        // 3. Apply asset contributions
        const contributionResult = applyAssetContributions(
            assets,
            cashflow,
            fractionOfYear
        )
        cashflow -= contributionResult.totalContributions

        // 4. Handle surplus or deficit
        let updatedAssets = contributionResult.updatedAssets

        if (cashflow > 0) {
            // Surplus: add to first asset
            const surplusResult = allocateSurplus(cashflow, updatedAssets)
            updatedAssets = surplusResult.updatedAssets
            cashflow = 0
        } else if (cashflow < 0) {
            // Deficit: withdraw from assets
            const deficitResult = coverDeficit(Math.abs(cashflow), updatedAssets)
            updatedAssets = deficitResult.updatedAssets
            cashflow = -deficitResult.remainingDeficit
        }

        // 5. Apply growth to assets
        const growthResult = applyAssetGrowth(updatedAssets, fractionOfYear)

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
                growth: growthResult.growthHistory,
                yield: yieldResult.yieldHistory,
                contributions: contributionResult.history,
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
        numberOfYears: number
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

            const yearResult = this.runSingleYear(
                incomes,
                expenses,
                currentAssets,
                currentLiabilities,
                year
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
