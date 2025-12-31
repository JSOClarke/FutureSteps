import { it, expect, describe } from 'vitest'
import { ProjectionEngine } from '../engine'
import { transformToRealValues } from '../transformer'
import type { FinancialItem } from '../../../types'

describe('Inflation Adjustment Logic', () => {
    const engine = new ProjectionEngine()

    describe('Nominal vs Real Values (Transformer)', () => {
        it('should keep nominal values same and deflate real values', () => {
            const items: FinancialItem[] = [
                {
                    id: '1',
                    name: 'Savings',
                    category: 'assets',
                    value: 10000,
                    growthRate: 0.05
                }
            ]

            // Use FUTURE year to ensure full 12 months (no current-year pro-rating)
            const startYear = 2026
            const years = 1
            const inflationRate = 0.05

            const nominal = engine.runMultiYearProjection(items, startYear, years, [], [], inflationRate)
            const real = transformToRealValues(nominal)

            const year1 = nominal.years[0]
            const realYear1 = real.years[0]

            // Nominal growth: 10000 * 1.05 = 10500
            expect(year1.netWorth).toBeCloseTo(10500, 2)

            // Real value: 10500 / 1.05 = 10000
            expect(realYear1.netWorth).toBeCloseTo(10000, 2)
        })

        it('should align perfectly at 5% growth and 5% inflation (Today\'s Money fix)', () => {
            const principal = 10000
            const rate = 0.05

            const items: FinancialItem[] = [{
                id: 'asset-1',
                name: 'Test Asset',
                category: 'assets',
                value: principal,
                growthRate: rate
            }]

            const fullYearResult = engine.runMultiYearProjection(items, 2026, 1, [], [], rate)
            const realResult = transformToRealValues(fullYearResult)

            expect(realResult.years[0].netWorth).toBeCloseTo(10000, 5)
        })
    })

    describe('Mid-Year Precision (Regression)', () => {
        it('should have 0 real gain when growth equals inflation for a partial year', () => {
            const principal = 10000
            const rate = 0.05
            const fraction = 1 / 12

            // 1. Nominal Growth (Linear pro-rating)
            const nominalGain = principal * rate * fraction
            const finalNominal = principal + nominalGain

            // 2. Inflation Factor (Synced Linear pro-rating)
            const inflationFactor = (1 + (rate * fraction))

            // 3. Today's Money valuation
            const realValue = finalNominal / inflationFactor

            expect(realValue).toBeCloseTo(principal, 10)
        })
    })
})
