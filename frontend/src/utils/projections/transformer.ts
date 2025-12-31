import type { ProjectionResult } from './engine'

/**
 * Transforms a Nominal projection result into "Today's Money" (Real) values.
 * 
 * "Today's Money" logic:
 * 1. Totals are simply nominal / cumulativeInflationFactor.
 * 2. Gains/Yields are (Final Nominal / Factor) - (Initial Nominal / PrevFactor).
 *    This correctly shows a $0 Real Gain if Growth exactly matches Inflation.
 */
export function transformToRealValues(projection: ProjectionResult): ProjectionResult {
    let prevFactor = 1

    // We also need the very first opening balance for the summary
    const firstYear = projection.years[0]
    // The engine's inflationFactor is at the END of the year.
    // For the very first year, the opening factor is 1 (Today).

    const realYears = projection.years.map(year => {
        const factor = year.inflationFactor
        const multiplier = 1 / factor
        const prevMultiplier = 1 / prevFactor

        // Deep clone history to transform it
        const realHistory = {
            ...year.history,
            income: year.history.income.map(item => ({ ...item, amount: item.amount * multiplier })),
            expenses: year.history.expenses.map(item => ({ ...item, amount: item.amount * multiplier })),
            contributions: year.history.contributions.map(item => ({ ...item, amount: item.amount * multiplier })),
            surplus: year.history.surplus.map(item => ({ ...item, amount: item.amount * multiplier })),
            deficit: year.history.deficit.map(item => ({ ...item, amount: item.amount * multiplier })),

            // Special handling for Growth and Yield:
            // We want to show the "Real Addition to Value"
            growth: year.history.growth.map(item => {
                // Approximate opening balance for this asset this year
                const finalAsset = year.assets.find(a => a.id === item.assetId)
                const finalVal = finalAsset?.value ?? 0
                const openingVal = finalVal - item.growthAmount // Simplified, ignores yield/contributions in this specific calc

                // Real Gain = (Final / Factor) - (Opening / PrevFactor)
                const realGrowthAmount = (finalVal * multiplier) - (openingVal * prevMultiplier)
                return { ...item, growthAmount: realGrowthAmount }
            }),

            yield: year.history.yield.map(item => {
                const finalAsset = year.assets.find(a => a.id === item.assetId)
                const finalVal = finalAsset?.value ?? 0
                const openingVal = finalVal - item.yieldAmount

                const realYieldAmount = (finalVal * multiplier) - (openingVal * prevMultiplier)
                return { ...item, yieldAmount: realYieldAmount }
            }),

            liabilityPayments: year.history.liabilityPayments.map(item => ({
                ...item,
                interestCharged: item.interestCharged * multiplier,
                principalPaid: item.principalPaid * multiplier,
                remainingBalance: item.remainingBalance * multiplier
            }))
        }

        const result = {
            ...year,
            totalIncome: year.totalIncome * multiplier,
            totalExpenses: year.totalExpenses * multiplier,
            netCashflow: year.netCashflow * multiplier,
            remainingCashflow: year.remainingCashflow * multiplier,
            netWorth: year.netWorth * multiplier,
            assets: year.assets.map(asset => ({ ...asset, value: asset.value * multiplier })),
            liabilities: year.liabilities.map(liability => ({ ...liability, value: liability.value * multiplier })),
            history: realHistory
        }

        prevFactor = factor
        return result
    })

    const lastYear = realYears[realYears.length - 1]

    return {
        ...projection,
        years: realYears,
        summary: {
            ...projection.summary,
            startingNetWorth: projection.summary.startingNetWorth, // Already in today's money at year 0
            endingNetWorth: lastYear?.netWorth ?? 0,
            totalGrowth: (lastYear?.netWorth ?? 0) - projection.summary.startingNetWorth,
            averageAnnualReturn: projection.summary.averageAnnualReturn // Keep nominal return or adjust? Usually kept nominal.
        }
    }
}
