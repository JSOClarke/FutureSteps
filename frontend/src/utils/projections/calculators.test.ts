import { describe, it, expect } from 'vitest'
import { calculateYearlyIncome, applyAssetGrowth } from './calculators'
import type { FinancialItem } from '../../types'

describe('Calculators Logic', () => {
    describe('calculateYearlyIncome', () => {
        it('should correctly sum active incomes for a given year', () => {
            const year = 2025

            // Mock items
            const salary = {
                id: '1',
                name: 'Salary',
                value: 100000,
                frequency: 'annual',
                category: 'income',
                startYear: 2020,
                endYear: 2030
            } as FinancialItem

            const sideHustle = {
                id: '2',
                name: 'Side Hustle',
                value: 1000,
                frequency: 'monthly',
                category: 'income',
                startYear: 2025,
                // Exclusive end year: runs during 2025
                endYear: 2026
            } as FinancialItem

            const futureIncome = {
                id: '3',
                name: 'Future',
                value: 50000,
                frequency: 'annual',
                category: 'income',
                startYear: 2030,
                endYear: 2040
            } as FinancialItem

            const items = [salary, sideHustle, futureIncome]

            const result = calculateYearlyIncome(items, year)

            // Expected:
            // Salary: 100,000 (active)
            // Side Hustle: 1,000 * 12 = 12,000 (active)
            // Future: 0 (inactive in 2025)
            // Total: 112,000

            expect(result.total).toBe(112000)
            expect(result.details).toHaveLength(2)
            expect(result.details[0].amount).toBe(100000)
            expect(result.details[1].amount).toBe(12000)
        })

        it('should handle partial years correctly', () => {
            const year = 2025
            const fraction = 0.5 // Half year

            const salary = {
                id: '1',
                name: 'Salary',
                value: 100000,
                frequency: 'annual',
                category: 'income',
                startYear: 2020,
                endYear: 2030
            } as FinancialItem

            const result = calculateYearlyIncome([salary], year, fraction)

            expect(result.total).toBe(50000)
        })
    })

    describe('Year Overlap Logic (Reproduction)', () => {
        it('should NOT double count with exclusive end years', () => {
            const year = 2030

            // Job A: Ends 2030 (Exclusive -> Last active year 2029)
            const jobA = {
                id: '1',
                name: 'Job A',
                value: 100000,
                frequency: 'annual',
                category: 'income',
                startYear: 2020,
                endYear: 2030
            } as FinancialItem

            // Job B: Starts 2030 (Inclusive)
            const jobB = {
                id: '2',
                name: 'Job B',
                value: 120000,
                frequency: 'annual',
                category: 'income',
                startYear: 2030,
                endYear: 2040
            } as FinancialItem

            const result = calculateYearlyIncome([jobA, jobB], year)

            // New behavior: 
            // Job A is finished (2030 is exclusive end)
            // Job B is starting (2030 is inclusive start)
            // Total: 120,000
            expect(result.total).toBe(120000)
            expect(result.details).toHaveLength(1)
        })
    })

    describe('applyAssetGrowth (Mid-Year Convention) - Table Driven', () => {
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
})
