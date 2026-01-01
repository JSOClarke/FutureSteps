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
    // The engine's inflationFactor is at the END of the year.
    // For the very first year, the opening factor is 1 (Today).

    const realYears = projection.years.map(year => {
        const factor = year.inflationFactor
        const multiplier = 1 / factor
        const prevMultiplier = 1 / prevFactor

        // Pre-calculate flow maps for accurate opening balance reconstruction
        const yieldMap = new Map(year.history.yield.map(y => [y.assetId, y.yieldAmount]));
        const contribMap = new Map(year.history.contributions.map(c => [c.assetId, c.amount]));
        const surplusMap = new Map(year.history.surplus.map(s => [s.assetId, s.amount]));
        const deficitMap = new Map(year.history.deficit.map(d => [d.assetId, d.amount]));

        // Deep clone history to transform it
        const realHistory = {
            ...year.history,
            income: year.history.income.map(item => ({ ...item, amount: item.amount * prevMultiplier })),
            expenses: year.history.expenses.map(item => ({ ...item, amount: item.amount * prevMultiplier })),
            contributions: year.history.contributions.map(item => ({ ...item, amount: item.amount * prevMultiplier })),
            surplus: year.history.surplus.map(item => ({ ...item, amount: item.amount * prevMultiplier })),
            deficit: year.history.deficit.map(item => ({ ...item, amount: item.amount * prevMultiplier })),

            // Special handling for Growth and Yield:
            // We want to show the "Real Addition to Value"
            growth: year.history.growth.map(item => {
                // Accurately reconstruct opening balance
                const finalAsset = year.assets.find(a => a.id === item.assetId)
                const finalVal = finalAsset?.value ?? 0

                const yieldAmt = yieldMap.get(item.assetId) || 0
                const contribAmt = (contribMap.get(item.assetId) || 0) + (surplusMap.get(item.assetId) || 0)
                const deficitAmt = deficitMap.get(item.assetId) || 0

                // Reconstruct opening nominal balance
                const openingVal = finalVal - item.growthAmount - yieldAmt - contribAmt + deficitAmt

                // Real growth is the change in purchasing power of the asset itself.
                // We define "Real Return" as the change in wealth (Final REAL - Initial REAL)
                // excluding the injection of NEW funds (Contributions REAL).
                const realYield = yieldAmt * multiplier;
                const realTotalGain = (finalVal * multiplier) - (openingVal * prevMultiplier) - (contribAmt * prevMultiplier) + (deficitAmt * prevMultiplier);

                // The "Growth" field in the history represents the return NOT accounted for by the Yield.
                const realGrowth = realTotalGain - realYield;

                const nominalGrowth = item.growthAmount;
                const nominalGrowthRealValue = nominalGrowth * multiplier;
                const inflationImpact = realGrowth - nominalGrowthRealValue;

                return {
                    ...item,
                    growthAmount: realGrowth,
                    nominalGrowthRealValue,
                    inflationImpact
                };
            }),

            yield: year.history.yield.map(item => {
                const realYield = item.yieldAmount * multiplier;

                return {
                    ...item,
                    yieldAmount: realYield,
                    nominalYieldRealValue: item.yieldAmount * multiplier,
                    inflationImpact: 0 // Yield is already a flow, its inflation impact is reflected in its own real value
                };
            }),

            liabilityPayments: year.history.liabilityPayments.map(item => ({
                ...item,
                interestCharged: item.interestCharged * prevMultiplier,
                principalPaid: item.principalPaid * prevMultiplier,
                remainingBalance: item.remainingBalance * multiplier
            }))
        }

        const result = {
            ...year,
            totalIncome: year.totalIncome * prevMultiplier,
            totalExpenses: year.totalExpenses * prevMultiplier,
            netCashflow: year.netCashflow * prevMultiplier,
            remainingCashflow: year.remainingCashflow * prevMultiplier,
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
