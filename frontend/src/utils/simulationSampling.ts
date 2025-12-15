import type { SimulationResult, SimulationPath } from './retirementSimulation'

/**
 * Selected sample runs for detailed display
 */
export interface SampleRunSelection {
    bestCase: SimulationPath       // 95th percentile outcome
    worstCase: SimulationPath      // 5th percentile outcome
    median: SimulationPath         // 50th percentile outcome
    randomSuccess: SimulationPath  // Random successful path
    randomFailure: SimulationPath | null  // Random failed path (if any failures exist)
}

/**
 * Year-by-year details for a simulation path
 */
export interface YearDetail {
    year: number
    startingBalance: number
    marketReturn: number        // Calculated return rate for the year
    withdrawal: number
    endingBalance: number
}

/**
 * Select representative sample runs from simulation results
 * Provides best, worst, median, and random samples for user understanding
 */
export function selectSampleRuns(result: SimulationResult): SampleRunSelection {
    const { paths } = result

    // Sort by final balance for percentile selection
    const sortedPaths = [...paths].sort((a, b) => a.finalBalance - b.finalBalance)

    // Calculate indices for percentiles
    const bestIndex = Math.floor(sortedPaths.length * 0.95)
    const worstIndex = Math.floor(sortedPaths.length * 0.05)
    const medianIndex = Math.floor(sortedPaths.length * 0.5)

    // Get percentile paths
    const bestCase = sortedPaths[bestIndex]
    const worstCase = sortedPaths[worstIndex]
    const median = sortedPaths[medianIndex]

    // Separate successful and failed paths
    const successfulPaths = paths.filter(p => p.success)
    const failedPaths = paths.filter(p => !p.success)

    // Select random successful path (different from median/best)
    const availableSuccessful = successfulPaths.filter(p =>
        p !== bestCase && p !== median
    )
    const randomSuccess = availableSuccessful.length > 0
        ? availableSuccessful[Math.floor(Math.random() * availableSuccessful.length)]
        : successfulPaths[0] // Fallback to first successful if needed

    // Select random failed path if failures exist
    const randomFailure = failedPaths.length > 0
        ? failedPaths[Math.floor(Math.random() * failedPaths.length)]
        : null

    return {
        bestCase,
        worstCase,
        median,
        randomSuccess,
        randomFailure
    }
}

/**
 * Calculate year-by-year details for a simulation path
 * Derives market returns from portfolio changes
 */
export function calculateYearDetails(
    path: SimulationPath,
    initialPortfolio: number
): YearDetail[] {
    const details: YearDetail[] = []

    for (let i = 0; i < path.withdrawals.length; i++) {
        const year = i + 1
        const startingBalance = i === 0 ? initialPortfolio : path.portfolioValues[i]
        const withdrawal = path.withdrawals[i]
        const endingBalance = path.portfolioValues[i + 1]

        // Calculate market return
        // Portfolio after return = starting balance * (1 + return)
        // Ending balance = portfolio after return - withdrawal
        // So: ending balance + withdrawal = starting balance * (1 + return)
        const portfolioAfterReturn = endingBalance + withdrawal
        const marketReturn = startingBalance > 0
            ? (portfolioAfterReturn - startingBalance) / startingBalance
            : 0

        details.push({
            year,
            startingBalance,
            marketReturn,
            withdrawal,
            endingBalance: Math.max(0, endingBalance)
        })
    }

    return details
}

/**
 * Get a descriptive label for a sample run type
 */
export function getSampleRunLabel(type: keyof SampleRunSelection): string {
    const labels: Record<keyof SampleRunSelection, string> = {
        bestCase: '95th Percentile (Best Case)',
        worstCase: '5th Percentile (Worst Case)',
        median: '50th Percentile (Median)',
        randomSuccess: 'Random Successful Run',
        randomFailure: 'Random Failed Run'
    }
    return labels[type]
}

/**
 * Get a color scheme for a sample run type
 */
export function getSampleRunColor(type: keyof SampleRunSelection): string {
    const colors: Record<keyof SampleRunSelection, string> = {
        bestCase: 'text-green-700',
        worstCase: 'text-red-700',
        median: 'text-blue-700',
        randomSuccess: 'text-green-600',
        randomFailure: 'text-red-600'
    }
    return colors[type]
}
