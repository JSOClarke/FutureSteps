import { describe, it, expect } from 'vitest'
import { coverDeficit } from '../calculators'
import type { FinancialItem } from '../../../types'

describe('Cashflow Logic', () => {
    describe('coverDeficit (Asset Withdrawal)', () => {
        it('should withdraw from assets to cover deficit', () => {
            const savings = {
                id: '1',
                value: 5000,
                category: 'assets'
            } as FinancialItem

            const { updatedAssets, remainingDeficit, history } = coverDeficit(2000, [savings])

            expect(updatedAssets[0].value).toBe(3000)
            expect(remainingDeficit).toBe(0)
            expect(history).toHaveLength(1)
            expect(history[0].amount).toBe(2000)
        })

        it('should partially cover deficit if assets are insufficient', () => {
            const smallSavings = {
                id: '1',
                value: 1000,
                category: 'assets'
            } as FinancialItem

            const { updatedAssets, remainingDeficit } = coverDeficit(2000, [smallSavings])

            expect(updatedAssets[0].value).toBe(0)
            expect(remainingDeficit).toBe(1000) // Still owe 1000
        })
    })
})
