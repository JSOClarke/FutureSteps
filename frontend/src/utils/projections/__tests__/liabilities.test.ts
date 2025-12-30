import { describe, it, expect } from 'vitest'
import { processLiabilities } from '../calculators'
import type { FinancialItem } from '../../../types'

describe('Liability Logic', () => {
    describe('processLiabilities', () => {
        it('should cycle interest and minimum payments correctly', () => {
            // Scenario:
            // Debt: 10,000. Interest: 5% (0.05). Min Payment: 1,000/yr.
            // Cashflow Available: 5,000 (Plenty)
            // Expected:
            // Interest: 10,000 * 0.05 = 500
            // Balance Before Payment = 10,500
            // Payment: Min(1000, 10500) = 1,000
            // New Balance: 9,500
            // Remaining Cashflow: 4,000

            const liability = {
                id: '1',
                name: 'Loan',
                value: 10000,
                interestRate: 0.05,
                minimumPayment: 1000,
                category: 'liabilities'
            } as FinancialItem

            const { updatedLiabilities, totalPayment, history } = processLiabilities([liability], 5000)

            expect(updatedLiabilities[0].value).toBe(9500)
            expect(totalPayment).toBe(1000)
            expect(history[0].interestCharged).toBe(500)
            expect(history[0].principalPaid).toBe(1000)
        })

        it('should pay off debt completely if payment > balance', () => {
            const liability = {
                id: '1',
                value: 500,
                interestRate: 0,
                minimumPayment: 1000,
                category: 'liabilities'
            } as FinancialItem

            const { updatedLiabilities, totalPayment } = processLiabilities([liability], 5000)

            expect(updatedLiabilities[0].value).toBe(0)
            expect(totalPayment).toBe(500) // Only pay what's owed
        })
    })
})
