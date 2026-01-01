import { ProjectionEngine } from '../engine'
import { transformToRealValues } from '../transformer'
import type { FinancialItem } from '../../types'

describe('Future-Starting Item Inflation Baseline', () => {
    const engine = new ProjectionEngine()
    const startYear = 2026

    it('should maintain purchasing power for future income when Adjusted for Inflation is ON', () => {
        const items: FinancialItem[] = [
            {
                id: '1',
                name: 'Future Job',
                value: 20000,
                category: 'income',
                frequency: 'annual',
                isAdjustedForInflation: true,
                startYear: 2040 // Starts way in the future
            }
        ]

        const projection = engine.runMultiYearProjection(items, startYear, 40, [], [], 0.05)
        const real = transformToRealValues(projection)

        // Find the first year it starts (2040)
        const year2040Nominal = projection.years.find(y => y.year === 2040)?.history.income[0].amount ?? 0
        const year2040Real = real.years.find(y => y.year === 2040)?.history.income[0].amount ?? 0

        console.log('\n--- Future-Starting Income (2040) ---')
        console.log(`Projection Base Year: ${startYear}`)
        console.log(`Nominal Value in 2040: ${year2040Nominal.toFixed(2)} (High due to 14 years of growth)`)
        console.log(`Real Value in 2040:    ${year2040Real.toFixed(2)} (Should be ~20k)`)

        // Nominal should have grown (1.05 ^ 14)
        // 20000 * (1.05^14) = ~39,598
        expect(year2040Nominal).toBeGreaterThan(39000)

        // Real should be exactly 20,000 (Today's Money)
        expect(year2040Real).toBeCloseTo(20000, 0)
    })
})
