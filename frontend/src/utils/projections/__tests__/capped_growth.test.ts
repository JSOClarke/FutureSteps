import { describe, it, expect } from 'vitest'
import { ProjectionEngine } from '../engine'
import type { FinancialItem } from '../../../types'

describe('Capped Growth & Custom Rates', () => {
    const engine = new ProjectionEngine()
    const startYear = 2026
    const inflationRate = 0.05 // 5% inflation

    it('should respect maxValue cap when using inflation mode', () => {
        const item: FinancialItem = {
            id: '1',
            name: 'Capped Rent',
            value: 1000,
            category: 'expenses',
            frequency: 'annual',
            growthMode: 'inflation',
            maxValue: 1100, // Capped at 10% total growth
            startYear: 2026
        }

        // Year 1: 1000
        // Year 2: 1050 (5% growth)
        // Year 3: 1102.5 -> Capped at 1100
        const projection = engine.runMultiYearProjection([item], startYear, 3, [], [], inflationRate)

        const year1 = projection.years[0].totalExpenses
        const year2 = projection.years[1].totalExpenses
        const year3 = projection.years[2].totalExpenses

        expect(year1).toBeCloseTo(1000, 0)
        expect(year2).toBeCloseTo(1050, 0)
        expect(year3).toBeCloseTo(1100, 0) // Should be capped
    })

    it('should use custom percentage growth instead of inflation', () => {
        const item: FinancialItem = {
            id: '2',
            name: 'Salary',
            value: 50000,
            category: 'income',
            frequency: 'annual',
            growthMode: 'percentage',
            growthRate: 0.10, // 10% growth (higher than 5% inflation)
            startYear: 2026
        }

        const projection = engine.runMultiYearProjection([item], startYear, 2, [], [], inflationRate)

        const year1 = projection.years[0].totalIncome
        const year2 = projection.years[1].totalIncome

        expect(year1).toBeCloseTo(50000, 0)
        expect(year2).toBeCloseTo(55000, 0) // 50k * 1.10
    })

    it('should respect maxValue cap when using percentage mode', () => {
        const item: FinancialItem = {
            id: '3',
            name: 'Capped Salary',
            value: 100000,
            category: 'income',
            frequency: 'annual',
            growthMode: 'percentage',
            growthRate: 0.10, // 10% per year
            maxValue: 115000, // Cap
            startYear: 2026
        }

        // Year 1: 100,000
        // Year 2: 110,000
        // Year 3: 121,000 -> Capped at 115,000
        const projection = engine.runMultiYearProjection([item], startYear, 3, [], [], inflationRate)

        const year1 = projection.years[0].totalIncome
        const year2 = projection.years[1].totalIncome
        const year3 = projection.years[2].totalIncome

        expect(year1).toBeCloseTo(100000, 0)
        expect(year2).toBeCloseTo(110000, 0)
        expect(year3).toBeCloseTo(115000, 0)
    })
})
