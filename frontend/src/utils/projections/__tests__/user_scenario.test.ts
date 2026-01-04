
import { describe, it, expect } from 'vitest'
import { ProjectionEngine } from '../engine'
import { transformToRealValues } from '../transformer'
import { FinancialItem } from '../../../types'

describe('User Scenario Verification', () => {
    it('calculates 10k cash with 5% yield and 3% inflation exactly', () => {
        const engine = new ProjectionEngine()
        const items: FinancialItem[] = [{
            id: 'cash-asset',
            name: 'Cash',
            category: 'assets',
            value: 10000,
            yieldRate: 0.05, // 5% yield
            growthRate: 0,

            // Assuming no reinvestment for "Cash" usually, but let's test both if needed
            // If yield is NOT reinvested, value stays 10k.
            // If yield IS reinvested, value becomes 10.5k.
        }]

        // Run projection for 1 year (Year 1)
        // Start 2025. Projection runs for 2026.
        const mockUserProfile = {
            id: 'test-user',
            name: 'Test',
            email: 'test@test.com',
            dateOfBirth: '1995-01-01',
            retirementAge: 65,
            lifeExpectancy: 85,
            currency: 'USD'
        }
        // Run projection for 1 year (Year 1)
        // Start 2025. Projection runs for 2026.
        const nominal = engine.runMultiYearProjection(items, 2025, 2, mockUserProfile, [], [], 0.03)

        // Transform
        const real = transformToRealValues(nominal)
        const year1 = real.years[0] // Year 2025 (Year 0 is start? No, usually Year 1 is first projection)
        // Let's check the first year of data.

        const asset = year1.assets[0]
        const historyYield = year1.history.yield.find(y => y.assetId === 'cash-asset')
        const historyGrowth = year1.history.growth.find(g => g.assetId === 'cash-asset')

        console.log('--- Nominal Data ---')
        console.log('Year:', year1.year)
        console.log('Asset Value:', asset.value)
        console.log('Nominal Yield:', nominal.years[0].history.yield[0].yieldAmount)

        console.log('--- Real Data (Today Money) ---')
        console.log('Yield (Real):', historyYield?.yieldAmount)
        console.log('Inflation Impact:', historyGrowth?.inflationImpact)
        console.log('Real Growth Amount:', historyGrowth?.growthAmount)

        // Math Checks
        const nominalYield = 500
        const inflationFactor = 1.03
        const expectedRealYield = nominalYield / inflationFactor

        // Principal Loss
        // 10000 / 1.03 = 9708.737...
        // 10000 - 9708.737 = 291.26
        // Impact should be roughly -291.26

        expect(historyYield?.yieldAmount).toBeCloseTo(expectedRealYield, 2)
        // Expect impact to be approx -291.26
        expect(historyGrowth?.inflationImpact).toBeCloseTo(-291.26, 2)
    })
})
