import { describe, it, expect } from 'vitest'
import { ProjectionEngine } from '../engine'
import { transformToRealValues } from '../transformer'
import type { FinancialItem } from '../../../types'

describe('Expense Inflation Logic', () => {
    const engine = new ProjectionEngine()
    const startYear = 2026
    const inflationRate = 0.05 // 5% inflation

    it('should correctly calculate nominal vs real expenses for an inflation-adjusted item', () => {
        const items: FinancialItem[] = [
            {
                id: '1',
                name: 'Rent',
                value: 10000,
                category: 'expenses',
                frequency: 'annual',
                isAdjustedForInflation: true,
                startYear: 2026
            }
        ]

        const nominal = engine.runMultiYearProjection(items, startYear, 2, [], [], inflationRate)
        const real = transformToRealValues(nominal)

        const year1Nominal = nominal.years[0].totalExpenses
        const year2Nominal = nominal.years[1].totalExpenses
        const year1Real = real.years[0].totalExpenses
        const year2Real = real.years[1].totalExpenses

        console.log('\n--- Inflation-Adjusted Expense (Rent) ---')
        console.log(`Year 1 Nominal: ${year1Nominal.toFixed(2)}`)
        console.log(`Year 2 Nominal: ${year2Nominal.toFixed(2)} (Increases by 5%)`)
        console.log(`  Detail: ${nominal.years[1].history.expenses[0].name} = ${nominal.years[1].history.expenses[0].amount.toFixed(2)}`)
        console.log(`Year 1 Real:    ${year1Real.toFixed(2)}`)
        console.log(`Year 2 Real:    ${year2Real.toFixed(2)} (Stays flat in Today's Money)`)
        console.log(`  Detail: ${real.years[1].history.expenses[0].name} = ${real.years[1].history.expenses[0].amount.toFixed(2)}`)

        // Assertions: 10,000 nominal in Year 1 should be 10,000 real in Year 1
        // And it should stay 10,000 real in Year 2 because it's adjusted for inflation
        expect(year1Real).toBeCloseTo(10000, 0)
        expect(year2Real).toBeCloseTo(10000, 0)
        expect(year2Nominal).toBeCloseTo(10500, 0)
    })

    it('should correctly calculate nominal vs real expenses for a non-adjusted item', () => {
        const items: FinancialItem[] = [
            {
                id: '2',
                name: 'Fixed Loan',
                value: 500,
                category: 'expenses',
                frequency: 'monthly',
                isAdjustedForInflation: false,
                startYear: 2026
            }
        ]

        const nominal = engine.runMultiYearProjection(items, startYear, 2, [], [], inflationRate)
        const real = transformToRealValues(nominal)

        const year1Nominal = nominal.years[0].totalExpenses
        const year2Nominal = nominal.years[1].totalExpenses
        const year1Real = real.years[0].totalExpenses
        const year2Real = real.years[1].totalExpenses

        console.log('\n--- Non-Adjusted Expense (Fixed Loan) ---')
        console.log(`Year 1 Nominal: ${year1Nominal.toFixed(2)}`)
        console.log(`Year 2 Nominal: ${year2Nominal.toFixed(2)} (Stays same)`)
        console.log(`  Detail: ${nominal.years[1].history.expenses[0].name} = ${nominal.years[1].history.expenses[0].amount.toFixed(2)}`)
        console.log(`Year 1 Real:    ${year1Real.toFixed(2)}`)
        console.log(`Year 2 Real:    ${year2Real.toFixed(2)} (Decreases in Today's Money)`)
        console.log(`  Detail: ${real.years[1].history.expenses[0].name} = ${real.years[1].history.expenses[0].amount.toFixed(2)}`)

        // Assertions
        expect(year2Nominal).toBe(year1Nominal)
        expect(year2Real).toBeLessThan(year1Real)
        expect(year2Real).toBeCloseTo(year2Nominal / 1.05, 0)
    })
})
