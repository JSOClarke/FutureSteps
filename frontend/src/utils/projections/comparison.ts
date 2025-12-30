import type { FinancialItem, FinancialCategory } from '../../types'
import type { YearResult } from './engine'

export interface ComparisonItemResult {
    itemId: string
    name: string
    category: FinancialCategory
    actualValue: number
    projectedValue: number
    diff: number
    percentDiff: number
    status: 'on_track' | 'ahead' | 'behind'
}

export interface ComparisonResult {
    items: ComparisonItemResult[]
    summary: {
        totalActualNetWorth: number
        totalProjectedNetWorth: number
        diff: number
        percentDiff: number
    }
}

/**
 * Compares current actual items against a projected year result.
 * Matches items by ID.
 * 
 * @param actualItems - The current real-world items (from state/snapshot)
 * @param projectedYear - The calculated projection for the comparison date
 * @param toleranceThreshold - Percentage difference considered "on track" (default 0.05 for 5%)
 */
export function compareFinancialState(
    actualItems: FinancialItem[],
    projectedYear: YearResult,
    toleranceThreshold: number = 0.05
): ComparisonResult {
    const comparisonItems: ComparisonItemResult[] = []

    // Helper to normalize subcategory keys
    const getKey = (category: FinancialCategory, subCat?: string) => `${category}:${subCat || 'other'}`

    // Map to store aggregated totals
    // Key: "category:subCategory" -> { actual: 0, projected: 0, name: string, category: ... }
    const aggregationMap = new Map<string, {
        name: string,
        category: FinancialCategory,
        actual: number,
        projected: number
    }>()

    // 1. Aggregate Actuals
    // Filter for Assets and Liabilities only for Net Worth comparison
    const relevantActuals = actualItems.filter(i => i.category === 'assets' || i.category === 'liabilities')

    for (const item of relevantActuals) {
        const key = getKey(item.category, item.subCategory)
        const existing = aggregationMap.get(key) || {
            name: (item.subCategory || 'Other') + (item.category === 'assets' ? ' Assets' : ' Liabilities'),
            category: item.category,
            actual: 0,
            projected: 0
        }
        existing.actual += item.value
        // If it's a specific subcategory, use formatted name
        if (item.subCategory) {
            existing.name = formatSubCategoryName(item.subCategory)
        }
        aggregationMap.set(key, existing)
    }

    // 2. Aggregate Projections
    // Process Assets
    for (const item of projectedYear.assets) {
        const key = getKey('assets', item.subCategory)
        const existing = aggregationMap.get(key) || {
            name: formatSubCategoryName(item.subCategory || 'other'),
            category: 'assets',
            actual: 0,
            projected: 0
        }
        existing.projected += item.value
        aggregationMap.set(key, existing)
    }

    // Process Liabilities
    for (const item of projectedYear.liabilities) {
        const key = getKey('liabilities', item.subCategory)
        const existing = aggregationMap.get(key) || {
            name: formatSubCategoryName(item.subCategory || 'other'),
            category: 'liabilities',
            actual: 0,
            projected: 0
        }
        existing.projected += item.value
        aggregationMap.set(key, existing)
    }

    // 3. Generate Comparison Items
    let totalActualNW = 0
    let totalProjectedNW = 0

    for (const [key, data] of aggregationMap.entries()) {
        const diff = data.actual - data.projected

        // Calculate Percent Diff
        let percentDiff = 0
        if (data.projected !== 0) {
            percentDiff = diff / data.projected
        } else if (data.actual !== 0) {
            percentDiff = 1.0 // 100% diff if projected is 0
        }

        // Determine Status
        let status: 'on_track' | 'ahead' | 'behind' = 'on_track'

        if (Math.abs(percentDiff) <= toleranceThreshold) {
            status = 'on_track'
        } else {
            if (data.category === 'assets') {
                status = percentDiff > 0 ? 'ahead' : 'behind'
            } else {
                // Liabilities: Lower is better (Ahead)
                status = percentDiff < 0 ? 'ahead' : 'behind'
            }
        }

        comparisonItems.push({
            itemId: key,
            name: data.name,
            category: data.category,
            actualValue: data.actual,
            projectedValue: data.projected,
            diff,
            percentDiff,
            status
        })

        // Totals
        if (data.category === 'assets') {
            totalActualNW += data.actual
            totalProjectedNW += data.projected
        } else {
            totalActualNW -= data.actual
            totalProjectedNW -= data.projected
        }
    }

    const summaryDiff = totalActualNW - totalProjectedNW
    const summaryPercentDiff = totalProjectedNW !== 0 ? summaryDiff / totalProjectedNW : 0

    return {
        items: comparisonItems.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)),
        summary: {
            totalActualNetWorth: totalActualNW,
            totalProjectedNetWorth: totalProjectedNW,
            diff: summaryDiff,
            percentDiff: summaryPercentDiff
        }
    }
}

function formatSubCategoryName(sub: string): string {
    return sub.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}
