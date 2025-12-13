import { generateMarketReturn, DEFAULT_PARAMS } from '../data/marketData'

/**
 * Parameters for retirement simulation
 */
export interface SimulationParams {
    initialPortfolio: number      // Starting retirement portfolio value
    annualWithdrawal: number       // First year withdrawal amount
    retirementYears: number        // Number of years in retirement
    stockAllocation: number        // Percentage in stocks (0-1)
    bondAllocation: number         // Percentage in bonds (0-1)
    numberOfSimulations: number    // Number of Monte Carlo iterations
}

/**
 * Result of a single simulation path
 */
export interface SimulationPath {
    portfolioValues: number[]      // Portfolio value each year
    withdrawals: number[]          // Withdrawal amount each year
    success: boolean               // Did portfolio last the full retirement?
    failureYear?: number           // Year portfolio depleted (if failed)
    finalBalance: number           // Portfolio value at end
}

/**
 * Aggregated results from all simulations
 */
export interface SimulationResult {
    successRate: number            // Percentage of successful simulations
    successfulPaths: number        // Number of successful simulations
    totalPaths: number             // Total number of simulations
    medianEndingBalance: number    // Median final portfolio value
    worstCaseBalance: number       // 5th percentile outcome
    bestCaseBalance: number        // 95th percentile outcome
    paths: SimulationPath[]        // All simulation paths
    medianPath: SimulationPath     // The median simulation path
}

/**
 * Run a single retirement simulation
 */
function simulateSinglePath(params: SimulationParams): SimulationPath {
    const { initialPortfolio, annualWithdrawal, retirementYears, stockAllocation, bondAllocation } = params

    let portfolio = initialPortfolio
    let currentWithdrawal = annualWithdrawal
    const portfolioValues: number[] = [initialPortfolio]
    const withdrawals: number[] = []
    let failureYear: number | undefined

    for (let year = 1; year <= retirementYears; year++) {
        // Generate market returns for this year
        const { portfolioReturn, inflation } = generateMarketReturn(stockAllocation, bondAllocation)

        // Apply market return to portfolio
        portfolio = portfolio * (1 + portfolioReturn)

        // Adjust withdrawal for inflation
        currentWithdrawal = currentWithdrawal * (1 + inflation)

        // Take withdrawal
        portfolio = portfolio - currentWithdrawal

        // Record values
        portfolioValues.push(Math.max(0, portfolio))
        withdrawals.push(currentWithdrawal)

        // Check for failure
        if (portfolio <= 0 && !failureYear) {
            failureYear = year
        }
    }

    const success = portfolio > 0
    const finalBalance = Math.max(0, portfolio)

    return {
        portfolioValues,
        withdrawals,
        success,
        failureYear,
        finalBalance,
    }
}

/**
 * Run full Monte Carlo retirement simulation
 */
export function runRetirementSimulation(params: SimulationParams): SimulationResult {
    const paths: SimulationPath[] = []

    // Run all simulations
    for (let i = 0; i < params.numberOfSimulations; i++) {
        const path = simulateSinglePath(params)
        paths.push(path)
    }

    // Calculate success rate
    const successfulPaths = paths.filter(p => p.success).length
    const successRate = (successfulPaths / params.numberOfSimulations) * 100

    // Sort paths by final balance for percentile calculations
    const sortedByFinalBalance = [...paths].sort((a, b) => a.finalBalance - b.finalBalance)

    // Calculate percentiles
    const medianIndex = Math.floor(sortedByFinalBalance.length / 2)
    const worstCaseIndex = Math.floor(sortedByFinalBalance.length * 0.05)
    const bestCaseIndex = Math.floor(sortedByFinalBalance.length * 0.95)

    const medianEndingBalance = sortedByFinalBalance[medianIndex].finalBalance
    const worstCaseBalance = sortedByFinalBalance[worstCaseIndex].finalBalance
    const bestCaseBalance = sortedByFinalBalance[bestCaseIndex].finalBalance

    // Find median path (middle simulation)
    const medianPath = sortedByFinalBalance[medianIndex]

    return {
        successRate,
        successfulPaths,
        totalPaths: params.numberOfSimulations,
        medianEndingBalance,
        worstCaseBalance,
        bestCaseBalance,
        paths,
        medianPath,
    }
}

/**
 * Calculate initial withdrawal based on portfolio value and withdrawal rate
 */
export function calculateInitialWithdrawal(portfolioValue: number, withdrawalRate: number = DEFAULT_PARAMS.withdrawalRate): number {
    return portfolioValue * withdrawalRate
}
