import { describe, it, expect } from 'vitest'
import { compareFinancialState } from '../comparison'
import type { FinancialItem } from '../../../types'
import type { YearResult } from '../engine'

describe('Comparison Logic', () => {
    describe('compareFinancialState', () => {
        it('should correctly aggregate and compare actuals vs projections by subcategory', () => {
            // Actuals (Snapshot)
            const actualCash = { id: '1', name: 'Chase', value: 10000, category: 'assets', subCategory: 'cash' } as FinancialItem
            const actualStock = { id: '2', name: 'Robinhood', value: 5000, category: 'assets', subCategory: 'investment' } as FinancialItem

            // Projected (Year Result)
            const projCash = { id: '3', name: 'Projected Cash', value: 12000, category: 'assets', subCategory: 'cash' } as FinancialItem
            const projStock = { id: '4', name: 'Projected Stock', value: 5500, category: 'assets', subCategory: 'investment' } as FinancialItem

            const projectedYear = {
                year: 2025,
                assets: [projCash, projStock],
                liabilities: []
            } as unknown as YearResult

            const result = compareFinancialState([actualCash, actualStock], projectedYear)

            // Expect 2 distinct comparison items (Cash and Investment)
            expect(result.items).toHaveLength(2)

            const cashItem = result.items.find(i => i.category === 'assets' && i.name.toLowerCase().includes('cash'))
            const stockItem = result.items.find(i => i.category === 'assets' && i.name.toLowerCase().includes('investment'))

            // Cash: 10,000 vs 12,000 -> Diff: -2,000 (Behind)
            expect(cashItem?.actualValue).toBe(10000)
            expect(cashItem?.projectedValue).toBe(12000)
            expect(cashItem?.diff).toBe(-2000)
            expect(cashItem?.status).toBe('behind')

            // Stock: 5,000 vs 5,500 -> Diff: -500 (Behind)
            expect(stockItem?.actualValue).toBe(5000)
            expect(stockItem?.projectedValue).toBe(5500)
            expect(stockItem?.diff).toBe(-500)
        })

        it('should handle missing projected subcategories (New actuals)', () => {
            // Actual has Crypto, Projected does NOT
            const actualCrypto = { id: '1', name: 'Bitcoin', value: 5000, category: 'assets', subCategory: 'other' } as FinancialItem

            const projectedYear = {
                year: 2025,
                assets: [], // Empty projection
                liabilities: []
            } as unknown as YearResult

            const result = compareFinancialState([actualCrypto], projectedYear)

            const item = result.items[0]

            // 5,000 vs 0 -> Diff: +5,000 (Ahead)
            expect(item.actualValue).toBe(5000)
            expect(item.projectedValue).toBe(0)
            expect(item.status).toBe('ahead')
        })
    })
})
