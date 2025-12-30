import { describe, it, expect } from 'vitest'
import { calculateYearlyIncome } from '../calculators'
import type { FinancialItem } from '../../../types'

describe('Income Logic', () => {
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

        it('should NOT double count with exclusive end years (Year Overlap)', () => {
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
})
