import type { FinancialItem, UserProfile } from '../../types' // Added UserProfile import
import { filterByCategory, calculateNetWorth, sortFinancialItemsByPriority } from './helpers'
import {
    calculateMonthlyIncome,
    calculateMonthlyExpenses,
    processLiabilities,
    applyAssetGrowth,
    applyAssetYield,
    allocateSurplus,
    coverDeficit
} from './calculators'

export interface YearResult {
    year: number
    age: number // Added Age
    totalIncome: number
    totalExpenses: number
    fractionOfYear: number // Store the multiplier used for this year (aggregating months)
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
     * Run a single month calculation
     */
    private runSingleMonth(
        incomes: FinancialItem[],
        expenses: FinancialItem[],
        assets: FinancialItem[],
        liabilities: FinancialItem[],
        year: number,
        month: number,
        surplusPriority: string[],
        deficitPriority: string[],
        inflationRate: number,
        baselineYear: number,
        contributionHistoryYTD: Map<string, number>
    ) {
        // 0. Capture opening balances for Mid-Year Convention calculation
        const openingBalances = new Map(assets.map(a => [a.id, a.value]))

        // 1. Calculate monthly income and expenses
        const incomeResult = calculateMonthlyIncome(incomes, year, month, inflationRate, baselineYear)
        const expenseResult = calculateMonthlyExpenses(expenses, year, month, inflationRate, baselineYear)

        let cashflow = incomeResult.total - expenseResult.total
        const netCashflow = cashflow

        // 2. Process liabilities (interest + payments)
        const monthlyFraction = 1 / 12
        const liabilityResult = processLiabilities(liabilities, cashflow, monthlyFraction)
        cashflow -= liabilityResult.totalPayment

        // 3. Allocate cashflow to assets using waterfall logic
        const sortedAssets = sortFinancialItemsByPriority(assets, surplusPriority)

        // 4. Handle cashflow allocation or deficit
        let updatedAssets = sortedAssets
        let contributionHistory: Array<{ assetId: string; amount: number }> = []
        let deficitHistory: Array<{ assetId: string; amount: number }> = []

        if (cashflow > 0.01) {
            // Allocate all available cashflow using waterfall logic
            const allocationResult = allocateSurplus(
                cashflow,
                updatedAssets,
                surplusPriority,
                contributionHistoryYTD
            )
            updatedAssets = allocationResult.updatedAssets
            contributionHistory = allocationResult.history

            // Calculate allocated amount to deduct from cashflow
            const totalAllocated = allocationResult.history.reduce((sum, h) => sum + h.amount, 0)
            cashflow -= totalAllocated
        } else if (cashflow < -0.01) {
            // Deficit: withdraw from assets based on priority
            const deficitResult = coverDeficit(Math.abs(cashflow), updatedAssets, deficitPriority)
            updatedAssets = deficitResult.updatedAssets
            deficitHistory = deficitResult.history
            cashflow = -deficitResult.remainingDeficit
        }

        // 5. Apply growth to assets (Monthly)
        const growthResult = applyAssetGrowth(updatedAssets, openingBalances, monthlyFraction)

        // 6. Apply yield to assets (Monthly)
        const yieldResult = applyAssetYield(growthResult.updatedAssets, monthlyFraction)

        // 7. Calculate net worth
        const netWorth = calculateNetWorth(yieldResult.updatedAssets, liabilityResult.updatedLiabilities)

        return {
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
                contributions: contributionHistory,
                surplus: [], // We don't track raw surplus separate from contributions anymore in this structure
                deficit: deficitHistory,
                liabilityPayments: liabilityResult.history,
            }
        }
    }

    /**
     * Run multi-year projection (Monthly Loop, Age-Based Aggregation)
     */
    runMultiYearProjection(
        items: FinancialItem[],
        startYear: number,
        numberOfYears: number, // Still used for bounds? Or rely on life expectancy? Let's use it as max duration.
        userProfile: UserProfile, // Needed for Age Calculation
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

        // Age Calculation Setup
        const birthDate = userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth) : new Date(startYear - 30, 0, 1) // Default age 30 if missing
        const birthMonth = birthDate.getMonth() + 1 // 1-12
        // const currentYear = new Date().getFullYear() // Unused

        // Let's assume projection starts TODAY/This Month
        const projectionStartDate = new Date()
        let pYear = projectionStartDate.getFullYear()
        let pMonth = projectionStartDate.getMonth() + 1 // 1-12

        // Determine Start Age
        let currentAge = pYear - birthDate.getFullYear()
        if (pMonth < birthMonth) currentAge--

        const years: YearResult[] = []

        console.log('Engine: Starting Projection', {
            startYear,
            numberOfYears,
            birthMonth,
            pYear,
            pMonth,
            currentAge
        })

        // Accumulator for the current "Age Year"
        // If current month is BEFORE birthday, this Age Year started in previous calendar year.
        // If current month is ON or AFTER birthday, this Age Year started in current calendar year.
        // Accumulator for the current "Age Year"
        // Label strategy: "End Year".
        // If current month is BEFORE birthday (e.g. Jan, Birthday June), this period ends THIS calendar year (2025).
        // If current month is AFTER birthday (e.g. July, Birthday June), this period starts this year but ends NEXT calendar year (2026).

        let yearLabel = pYear
        if (pMonth >= birthMonth) {
            yearLabel = pYear + 1
        }

        let currentAgeYearData: Partial<YearResult> = this.createEmptyYearData(yearLabel, currentAge, currentAssets, currentLiabilities)

        // Track Calendar Year contributions for IRS limits
        let contributionHistoryYTD = new Map<string, number>()
        // let currentCalendarYear = pYear // Unused

        // We run for `numberOfYears` "Age Years" roughly. 
        // Actually, let's allow running until X age.
        // But `numberOfYears` input usually implies "Project for 30 years". 
        // We will loop months until key conditions met.

        const totalMonthsToProject = numberOfYears * 12
        let monthsprojected = 0

        while (monthsprojected < totalMonthsToProject) {

            // Checks for Calendar Year Change (Jan 1) -> Reset Limits
            if (pMonth === 1 && monthsprojected > 0) {
                contributionHistoryYTD.clear()
                // currentCalendarYear = pYear
            }

            // Calculate Inflation for this month
            // Annual Rate -> Monthly Rate: (1 + r)^(1/12) - 1 ?? 
            // Or just use annual rate in logic. Current logic uses Cumulative Factor.
            // Let's keep cumulative simply incrementing.
            // Ideally: cumulativeInflationFactor *= (1 + monthlyInflationRate)
            // Approx: (1 + annualRate/12)
            cumulativeInflationFactor *= (1 + (inflationRate / 12))

            // Run Monthly Calculation
            const monthlyResult = this.runSingleMonth(
                incomes,
                expenses,
                currentAssets,
                currentLiabilities,
                pYear,
                pMonth,
                surplusPriority,
                deficitPriority,
                inflationRate,
                startYear,
                contributionHistoryYTD
            )

            // Update State
            currentAssets = monthlyResult.assets
            currentLiabilities = monthlyResult.liabilities

            // Accumulate Data into Age Year
            this.accumulateMonthlyData(currentAgeYearData, monthlyResult)
            currentAgeYearData.fractionOfYear = (currentAgeYearData.fractionOfYear || 0) + (1 / 12)

            // Check for Birthday (Age Transition)
            // If NEXT month is birthMonth, current Age Year ends NOW.
            // const nextTotalMonth = pYear * 12 + pMonth // Unused
            // We started logic: pMonth. 
            // If pMonth + 1 == birthMonth? 
            // "Age 30" runs from Birthday 30 up to Birthday 31.
            // So if today is Birthday, new year starts.
            // If current month is the month BEFORE birthday, we finish the year.

            let isAgeYearComplete = false
            if (pMonth === (birthMonth === 1 ? 12 : birthMonth - 1)) {
                isAgeYearComplete = true
            }

            if (isAgeYearComplete) {
                // Finalize Age Year
                // currentAgeYearData.year = pYear // Don't overwrite; keep the start year set in createEmptyYearData
                currentAgeYearData.netWorth = monthlyResult.netWorth
                currentAgeYearData.inflationFactor = cumulativeInflationFactor
                currentAgeYearData.assets = currentAssets // Snapshot at end
                currentAgeYearData.liabilities = currentLiabilities

                years.push(currentAgeYearData as YearResult)

                // Start New Age Year
                currentAge++

                // Determine Label for NEXT Age Year
                // If we are finishing the year in Dec (12), next month is Jan (1) of Next Year.
                // If birthMonth is Jan (1), we finish in Dec. Next month is Jan 2027. pYear is 2026.
                // So if birthMonth is 1, label is pYear + 1.
                // Determine Label for NEXT Age Year
                // We just finished a year.
                // If we finished in Dec (pMonth 12), next month is Jan (1).
                // If birthMonth is Jan: We finished Dec. pYear was 2026. Age Year (Jan-Dec) starts Jan 2027. Ends Dec 2027.
                // Wait.
                // Use generic End Year logic:
                // New Age Year starts next month.
                // Next Month's Year = (pMonth == 12 ? pYear + 1 : pYear).
                // Next Month's Month = (pMonth == 12 ? 1 : pMonth + 1).

                // If NextMonth < BirthMonth -> Ends in NextMonth's Year.
                // If NextMonth >= BirthMonth -> Ends in NextMonth's Year + 1.

                const nextMonthVal = pMonth === 12 ? 1 : pMonth + 1
                const nextYearVal = pMonth === 12 ? pYear + 1 : pYear

                let nextYearLabel = nextYearVal
                if (nextMonthVal >= birthMonth) {
                    nextYearLabel = nextYearVal + 1
                }



                currentAgeYearData = this.createEmptyYearData(nextYearLabel, currentAge, currentAssets, currentLiabilities)
            }

            // Increment Time
            monthsprojected++
            pMonth++
            if (pMonth > 12) {
                pMonth = 1
                pYear++
            }
        }

        // If partial year remains at end, push it?
        if (currentAgeYearData.fractionOfYear && currentAgeYearData.fractionOfYear > 0.01) {
            currentAgeYearData.year = pYear
            currentAgeYearData.netWorth = calculateNetWorth(currentAssets, currentLiabilities)
            years.push(currentAgeYearData as YearResult) // Partial end year
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

    // Helper to init accumulator
    private createEmptyYearData(year: number, age: number, assets: FinancialItem[], liabilities: FinancialItem[]): Partial<YearResult> {
        return {
            year,
            age,
            totalIncome: 0,
            totalExpenses: 0,
            fractionOfYear: 0,
            inflationFactor: 1,
            netCashflow: 0,
            remainingCashflow: 0,
            assets: JSON.parse(JSON.stringify(assets)), // Deep copy for snapshot
            liabilities: JSON.parse(JSON.stringify(liabilities)),
            netWorth: 0,
            history: {
                income: [], expenses: [], growth: [], yield: [],
                contributions: [], surplus: [], deficit: [], liabilityPayments: []
            }
        }
    }

    // Helper to merge monthly result into accumulator
    private accumulateMonthlyData(accumulator: Partial<YearResult>, monthly: any) {
        accumulator.totalIncome = (accumulator.totalIncome || 0) + monthly.totalIncome
        accumulator.totalExpenses = (accumulator.totalExpenses || 0) + monthly.totalExpenses
        accumulator.netCashflow = (accumulator.netCashflow || 0) + monthly.netCashflow
        accumulator.remainingCashflow = (accumulator.remainingCashflow || 0) + monthly.remainingCashflow

        // Helper for simple aggregation (Income/Expense)
        const aggregateSimple = (targetArray: any[], sourceArray: any[]) => {
            sourceArray.forEach(sourceItem => {
                const existing = targetArray.find(t => t.id === sourceItem.id)
                if (existing) {
                    existing.amount += sourceItem.amount
                } else {
                    targetArray.push({ ...sourceItem })
                }
            })
        }

        // Helper for asset-based aggregation (Growth/Yield/Contrib/Deficit) with optional extra fields
        const aggregateAssetBased = (targetArray: any[], sourceArray: any[], valueKey: string, extraKeys: string[] = []) => {
            sourceArray.forEach(sourceItem => {
                const existing = targetArray.find(t => t.assetId === sourceItem.assetId)
                if (existing) {
                    existing[valueKey] += sourceItem[valueKey]
                    extraKeys.forEach(key => {
                        if (sourceItem[key] !== undefined) {
                            existing[key] = (existing[key] || 0) + sourceItem[key]
                        }
                    })
                } else {
                    targetArray.push({ ...sourceItem })
                }
            })
        }

        // Helper for liability payments
        const aggregateLiabilities = (targetArray: any[], sourceArray: any[]) => {
            sourceArray.forEach(sourceItem => {
                const existing = targetArray.find(t => t.liabilityId === sourceItem.liabilityId)
                if (existing) {
                    existing.interestCharged += sourceItem.interestCharged
                    existing.principalPaid += sourceItem.principalPaid
                    // remainingBalance should be the LAST one, not summed. 
                    // But here we are accumulating history. 
                    // Ideally history tracks "Total Paid in Year". 
                    // remainingBalance is a point-in-time value. 
                    // We should take the LATEST remainingBalance.
                    existing.remainingBalance = sourceItem.remainingBalance
                } else {
                    targetArray.push({ ...sourceItem })
                }
            })
        }

        // Append History Arrays
        if (accumulator.history) {
            aggregateSimple(accumulator.history.income, monthly.history.income)
            aggregateSimple(accumulator.history.expenses, monthly.history.expenses)

            aggregateAssetBased(accumulator.history.growth, monthly.history.growth, 'growthAmount', ['nominalGrowthRealValue', 'inflationImpact'])
            aggregateAssetBased(accumulator.history.yield, monthly.history.yield, 'yieldAmount', ['nominalYieldRealValue', 'inflationImpact'])

            aggregateAssetBased(accumulator.history.contributions, monthly.history.contributions, 'amount')
            aggregateAssetBased(accumulator.history.deficit, monthly.history.deficit, 'amount')

            aggregateLiabilities(accumulator.history.liabilityPayments, monthly.history.liabilityPayments)
        }

    }
}
