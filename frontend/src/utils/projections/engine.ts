import type { FinancialItem } from '../../types'
import { filterByCategory, calculateNetWorth, sortFinancialItemsByPriority } from './helpers'
import {
    calculateYearlyIncome,
    calculateYearlyExpenses,
    processLiabilities,
    applyAssetGrowth,
    applyAssetYield,
    allocateSurplus,
    coverDeficit
} from './calculators'

export interface YearResult {
    year: number
    totalIncome: number
    totalExpenses: number
    fractionOfYear: number // Store the multiplier used for this year
    inflationFactor: number // Cumulative inflation factor for this year's end
    netCashflow: number
    remainingCashflow: number
    assets: FinancialItem[]
    liabilities: FinancialItem[]
    netWorth: number
    history: {
        income: Array<{ id: string; name: string; amount: number }>
        expenses: Array<{ id: string; name: string; amount: number }>
        growth: Array<{
            assetId: string;
            growthAmount: number;
            nominalGrowthRealValue?: number; // Real value of the nominal gain
            inflationImpact?: number;        // Loss of purchasing power on principal
        }>
        yield: Array<{
            assetId: string;
            yieldAmount: number;
            nominalYieldRealValue?: number; // Real value of the nominal yield
            inflationImpact?: number;        // Loss of purchasing power on the yield cashflow
        }>
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
        deficitPriority: string[] = [],
        inflationRate: number = 0,
        inflationFactor: number = 1,
        baselineYear?: number
    ): YearResult {
        // 0. Capture opening balances for Mid-Year Convention calculation
        const openingBalances = new Map(assets.map(a => [a.id, a.value]))

        // 1. Calculate income and expenses for the year
        const incomeResult = calculateYearlyIncome(incomes, year, fractionOfYear, inflationRate, baselineYear)
        const expenseResult = calculateYearlyExpenses(expenses, year, fractionOfYear, inflationRate, baselineYear)

        let cashflow = incomeResult.total - expenseResult.total
        const netCashflow = cashflow

        // 2. Process liabilities (interest + payments)
        const liabilityResult = processLiabilities(liabilities, cashflow, fractionOfYear)
        cashflow -= liabilityResult.totalPayment

        // 3. Allocate cashflow to assets using waterfall logic
        const sortedAssets = sortFinancialItemsByPriority(assets, surplusPriority)

        // 4. Handle cashflow allocation or deficit
        let updatedAssets = sortedAssets
        let contributionHistory: Array<{ assetId: string; amount: number }> = []
        let deficitHistory: Array<{ assetId: string; amount: number }> = []

        if (cashflow > 0) {
            // Allocate all available cashflow using waterfall logic
            const allocationResult = allocateSurplus(
                cashflow,
                updatedAssets,
                surplusPriority,
                new Map(), // Empty history since this is the first allocation
                fractionOfYear
            )
            updatedAssets = allocationResult.updatedAssets
            contributionHistory = allocationResult.history

            // Calculate allocated amount to deduct from cashflow
            const totalAllocated = allocationResult.history.reduce((sum, h) => sum + h.amount, 0)
            cashflow -= totalAllocated
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
            fractionOfYear,
            inflationFactor,
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
                contributions: contributionHistory,
                surplus: [],
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
        deficitPriority: string[] = [],
        inflationRate: number = 0
    ): ProjectionResult {
        // Separate items by category
        const incomes = filterByCategory(items, 'income')
        const expenses = filterByCategory(items, 'expenses')
        let currentAssets = filterByCategory(items, 'assets')
        let currentLiabilities = filterByCategory(items, 'liabilities')
        let cumulativeInflationFactor = 1

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

            // Update cumulative inflation factor for the period
            cumulativeInflationFactor *= (1 + (inflationRate * fractionOfYear))

            const yearResult = this.runSingleYear(
                incomes,
                expenses,
                currentAssets,
                currentLiabilities,
                year,
                fractionOfYear,
                surplusPriority,
                deficitPriority,
                inflationRate,
                cumulativeInflationFactor,
                startYear
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
