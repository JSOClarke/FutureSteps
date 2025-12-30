import { describe, it, expect } from 'vitest'
import { applyAssetGrowth, applyAssetContributions } from '../calculators'
import type { FinancialItem } from '../../../types'

describe('Asset Logic', () => {
    describe('applyAssetGrowth (Mid-Year Convention)', () => {
        interface TestCase {
            name: string
            initialValue: number
            openingBalance: number
            growthRate: number
            fractionOfYear?: number
            expectedGrowth: number
            expectedValue: number
        }

        const testCases: TestCase[] = [
            {
                name: 'Full year growth on opening balance (No new flows)',
                initialValue: 10000,
                openingBalance: 10000,
                growthRate: 0.10,
                expectedGrowth: 1000, // 10,000 * 0.10
                expectedValue: 11000
            },
            {
                name: 'Half year growth on new contributions (Pure Flow)',
                initialValue: 10000,
                openingBalance: 0,
                growthRate: 0.10,
                // 10,000 * ((1.10)^0.5 - 1) = ~488.088
                expectedGrowth: 10000 * (Math.pow(1.10, 0.5) - 1),
                expectedValue: 10000 * Math.pow(1.10, 0.5)
            },
            {
                name: 'Mixed opening balance and new flows',
                initialValue: 15000, // 10k start + 5k added
                openingBalance: 10000,
                growthRate: 0.10,
                // Principal growth: 10,000 * 0.10 = 1,000
                // Flow growth: 5,000 * ((1.10)^0.5 - 1) = ~244.04
                expectedGrowth: (10000 * 0.10) + (5000 * (Math.pow(1.10, 0.5) - 1)),
                expectedValue: 15000 + (10000 * 0.10) + (5000 * (Math.pow(1.10, 0.5) - 1))
            },
            {
                name: 'Zero growth rate',
                initialValue: 10000,
                openingBalance: 10000,
                growthRate: 0,
                expectedGrowth: 0,
                expectedValue: 10000
            }
        ]

        it.each(testCases)('$name', ({
            initialValue,
            openingBalance,
            growthRate,
            fractionOfYear = 1,
            expectedGrowth,
            expectedValue
        }) => {
            const asset = {
                id: '1',
                value: initialValue,
                growthRate,
                category: 'assets'
            } as FinancialItem

            const openingBalances = new Map([['1', openingBalance]])

            const result = applyAssetGrowth([asset], openingBalances, fractionOfYear)

            if (expectedGrowth === 0) {
                expect(result.growthHistory).toHaveLength(0)
            } else {
                expect(result.growthHistory[0].growthAmount).toBeCloseTo(expectedGrowth, 4)
            }
            expect(result.updatedAssets[0].value).toBeCloseTo(expectedValue, 4)
        })
    })

    describe('applyAssetContributions (Limits)', () => {
        it('should contribute up to the max annual limit', () => {
            const isa = {
                id: '1',
                name: 'ISA',
                value: 10000,
                maxAnnualContribution: 20000,
                category: 'assets'
            } as FinancialItem

            // Case 1: Cashflow < Limit
            // Available: 5,000. Limit: 20,000.
            // Contribution: 5,000.
            const res1 = applyAssetContributions([isa], 5000)
            expect(res1.updatedAssets[0].value).toBe(15000)
            expect(res1.totalContributions).toBe(5000)

            // Case 2: Cashflow > Limit
            // Available: 50,000. Limit: 20,000.
            // Contribution: 20,000.
            const res2 = applyAssetContributions([isa], 50000)
            expect(res2.updatedAssets[0].value).toBe(30000)
            expect(res2.totalContributions).toBe(20000)
        })

        it('should handle multiple assets in order', () => {
            // This function processes the list in order.
            // Sorting happens in engine, not here.

            const isa = { id: '1', value: 0, maxAnnualContribution: 20000, category: 'assets' } as FinancialItem
            const pension = { id: '2', value: 0, maxAnnualContribution: 60000, category: 'assets' } as FinancialItem

            // Available: 25,000
            // ISA takes 20,000 (Limit)
            // Remaining: 5,000
            // Pension takes 5,000 (Limit 60k)

            const result = applyAssetContributions([isa, pension], 25000)

            expect(result.updatedAssets[0].value).toBe(20000)
            expect(result.updatedAssets[1].value).toBe(5000)
            expect(result.totalContributions).toBe(25000)
        })
    })
})
