import { describe, it, expect } from 'vitest'
import { ProjectionEngine } from './engine'
import type { FinancialItem } from '../../types'

describe('ProjectionEngine', () => {
    describe('runMultiYearProjection (Mid-Year Convention Integration)', () => {
        it('should correctly project a single asset over 1 year using mid-year convention', () => {
            const engine = new ProjectionEngine()

            // Scenario: 
            // Asset: 10,000 start. 10% growth.
            // Income: 0
            // Expense: 0
            // Net Flow: 0 (No surplus to add, no deficit to cover)
            // Expected: 10,000 * 1.10 = 11,000 (Full year growth on opening balance)

            const asset = {
                id: '1',
                name: 'Stock',
                value: 10000,
                growthRate: 0.10,
                category: 'assets',
                startYear: 2020,
                endYear: 2050
            } as FinancialItem

            const items = [asset]
            const startYear = 2025
            const numberOfYears = 1

            const result = engine.runMultiYearProjection(items, startYear, numberOfYears)

            expect(result.years).toHaveLength(1)
            expect(result.summary.endingNetWorth).toBeCloseTo(11000, 2)
        })

        it('should correctly handle surplus contribution and growth over 1 year', () => {
            const engine = new ProjectionEngine()

            // Scenario:
            // Asset: 0 start. 10% growth.
            // Income: 10,000
            // Expense: 0
            // Surplus: 10,000 -> Allocted to Asset
            // Expected:
            // Opening Balance: 0 -> Growth: 0
            // Flow: 10,000 -> Growth (Half Year): 10,000 * ((1.10)^0.5 - 1) = ~488.09
            // Ending Balance: 10,488.09

            const asset = {
                id: '1',
                name: 'Savings',
                value: 0,
                growthRate: 0.10,
                category: 'assets'
            } as FinancialItem

            const income = {
                id: '2',
                name: 'Job',
                value: 10000,
                category: 'income',
                frequency: 'annual',
                startYear: 2025,
                endYear: 2026 // Exclusive: active in 2025 only
            } as FinancialItem

            const items = [asset, income]

            // We need to tell the engine to put surplus into the asset
            const surplusPriority = ['1']

            const result = engine.runMultiYearProjection(items, 2025, 1, surplusPriority)

            const expectedGrowth = 10000 * (Math.pow(1.10, 0.5) - 1)
            const expectedEndValue = 10000 + expectedGrowth

            expect(result.years[0].netWorth).toBeCloseTo(expectedEndValue, 2)
        })

        it('should accumulate value over multiple years', () => {
            const engine = new ProjectionEngine()

            // Scenario: 2 Years
            // Asset: 10,000 start. 10% growth.
            // No flows.
            // Year 1: 10,000 * 1.10 = 11,000
            // Year 2: 11,000 * 1.10 = 12,100

            const asset = {
                id: '1',
                name: 'Stock',
                value: 10000,
                growthRate: 0.10,
                category: 'assets'
            } as FinancialItem

            const result = engine.runMultiYearProjection([asset], 2025, 2)

            expect(result.years).toHaveLength(2)
            expect(result.years[0].netWorth).toBeCloseTo(11000, 2)
            expect(result.years[1].netWorth).toBeCloseTo(12100, 2)
        })
    })
})
