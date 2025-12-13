// Market data for retirement simulations
// Using simplified historical averages for Monte Carlo analysis

import { getRandomHistoricalYear } from './historicalReturns'

/**
 * Historical market return statistics
 * Based on long-term S&P 500 and bond market data
 */
export const MARKET_DATA = {
    stocks: {
        meanReturn: 0.07,      // 7% average annual return
        stdDeviation: 0.18,    // 18% standard deviation
    },
    bonds: {
        meanReturn: 0.02,      // 2% average annual return
        stdDeviation: 0.05,    // 5% standard deviation
    },
    inflation: {
        meanRate: 0.03,        // 3% average inflation
        stdDeviation: 0.02,    // 2% standard deviation
    },
}

/**
 * Default simulation parameters
 */
export const DEFAULT_PARAMS = {
    withdrawalRate: 0.04,           // 4% rule
    stockAllocation: 0.60,          // 60% stocks
    bondAllocation: 0.40,           // 40% bonds
    numberOfSimulations: 1000,      // Monte Carlo iterations
    retirementYears: 30,            // Default 30-year retirement
}

/**
 * Generate a random return using normal distribution (Box-Muller transform)
 */
export function generateNormalRandom(mean: number, stdDev: number): number {
    const u1 = Math.random()
    const u2 = Math.random()
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
    return mean + stdDev * z0
}

/**
 * Generate annual market returns based on allocation
 */
export function generateMarketReturn(stockAllocation: number, bondAllocation: number): {
    portfolioReturn: number
    inflation: number
} {
    const stockReturn = generateNormalRandom(
        MARKET_DATA.stocks.meanReturn,
        MARKET_DATA.stocks.stdDeviation
    )

    const bondReturn = generateNormalRandom(
        MARKET_DATA.bonds.meanReturn,
        MARKET_DATA.bonds.stdDeviation
    )

    const inflation = generateNormalRandom(
        MARKET_DATA.inflation.meanRate,
        MARKET_DATA.inflation.stdDeviation
    )

    const portfolioReturn = (stockReturn * stockAllocation) + (bondReturn * bondAllocation)

    return {
        portfolioReturn,
        inflation: Math.max(0, inflation), // Ensure non-negative inflation
    }
}

/**
 * Generate market returns using historical data
 */
export function generateHistoricalReturn(stockAllocation: number, bondAllocation: number): {
    portfolioReturn: number
    inflation: number
} {
    const yearData = getRandomHistoricalYear()

    const portfolioReturn = (yearData.sp500Return * stockAllocation) + (yearData.bondReturn * bondAllocation)

    return {
        portfolioReturn,
        inflation: yearData.inflationRate,
    }
}
