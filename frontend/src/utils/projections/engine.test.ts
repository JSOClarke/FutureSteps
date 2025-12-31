import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ProjectionEngine } from './engine'
import type { FinancialItem } from '../../types'

describe('ProjectionEngine', () => {
    beforeEach(() => {
        // Set date to Jan 1st, 2025 00:00:00
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2025-01-01T00:00:00'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

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
    describe('Deficit Priority Integration', () => {
        it('should withdraw from assets in priority order when in deficit', () => {
            const engine = new ProjectionEngine()

            // Scenario:
            // Income: 0. Expenses: 20,000.
            // Deficit: 20,000.
            // Assets:
            // 1. Cash: 10,000 (Priority 1)
            // 2. Stocks: 50,000 (Priority 2)

            // Expected:
            // Cash wiped out (10,000 -> 0)
            // Stocks reduced by remaining 10,000 (50,000 -> 40,000)

            const cash = { id: 'cash', value: 10000, category: 'assets' } as FinancialItem
            const stocks = { id: 'stocks', value: 50000, category: 'assets' } as FinancialItem
            const expense = { id: 'exp', value: 20000, category: 'expenses', frequency: 'annual', startYear: 2025, endYear: 2026 } as FinancialItem

            const items = [cash, stocks, expense]
            const deficitPriority = ['cash', 'stocks']

            const result = engine.runMultiYearProjection(items, 2025, 1, [], deficitPriority)

            const updatedCash = result.years[0].assets.find(a => a.id === 'cash')
            const updatedStocks = result.years[0].assets.find(a => a.id === 'stocks')

            expect(updatedCash?.value).toBe(0)
            expect(updatedStocks?.value).toBe(40000)
            expect(result.years[0].netCashflow).toBe(-20000)
        })

        it('should report remaining cashflow as negative if assets are insufficient', () => {
            const engine = new ProjectionEngine()

            // Deficit: 10,000
            // Asset: 2,000
            // Expected: Asset -> 0. Remaining Cashflow -> -8,000.

            const cash = { id: 'cash', value: 2000, category: 'assets' } as FinancialItem
            const expense = { id: 'exp', value: 10000, category: 'expenses', frequency: 'annual', startYear: 2025, endYear: 2026 } as FinancialItem

            const result = engine.runMultiYearProjection([cash, expense], 2025, 1, [], ['cash'])

            expect(result.years[0].remainingCashflow).toBe(-8000)
            expect(result.years[0].assets[0].value).toBe(0)
        })
    })
})
