import type { FinancialItem, Frequency } from '../../types'

export const MONTHS_PER_YEAR = 12

/**
 * Check if a financial item is active in a given year
 */
export function isActiveInYear(
    item: { startYear?: number; endYear?: number },
    year: number
): boolean {
    const start = item.startYear ?? -Infinity
    const end = item.endYear ?? Infinity
    return year >= start && year < end
}

/**
 * Convert an amount to its annual equivalent based on frequency
 */
export function annualizeAmount(amount: number, frequency?: Frequency): number {
    if (frequency === 'monthly') {
        return amount * MONTHS_PER_YEAR
    }
    return amount
}

/**
 * Apply a proportional fraction to an amount (for partial years)
 */
export function applyProportional(amount: number, fraction: number): number {
    return amount * fraction
}

/**
 * Calculate compound growth
 */
export function applyGrowth(principal: number, rate: number, periods: number = 1): number {
    return principal * Math.pow(1 + rate, periods) - principal
}

/**
 * Filter items by category
 */
export function filterByCategory<T extends FinancialItem>(
    items: T[],
    category: T['category']
): T[] {
    return items.filter(item => item.category === category)
}

/**
 * Calculate total net worth from assets and liabilities
 */
export function calculateNetWorth(assets: FinancialItem[], liabilities: FinancialItem[]): number {
    const totalAssets = assets.reduce((sum, a) => sum + a.value, 0)
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.value, 0)
    return totalAssets - totalLiabilities
}

/**
 * Sort financial items based on a priority list of IDs
 */
export function sortFinancialItemsByPriority<T extends FinancialItem>(
    items: T[],
    priorityList: string[]
): T[] {
    if (!priorityList || priorityList.length === 0) {
        return items
    }

    return [...items].sort((a, b) => {
        const indexA = priorityList.indexOf(a.id)
        const indexB = priorityList.indexOf(b.id)

        // Both in list: sort by index
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB
        }

        // Only A in list: A comes first
        if (indexA !== -1) {
            return -1
        }

        // Only B in list: B comes first
        if (indexB !== -1) {
            return 1
        }

        // Neither in list: keep original order (roughly)
        return 0
    })
}
