export type FinancialCategory = 'income' | 'expenses' | 'assets' | 'liabilities'
export type Frequency = 'monthly' | 'annual'

export interface FinancialItem {
    id: string
    name: string
    value: number
    category: FinancialCategory

    // Temporal fields - when is this item active?
    startYear?: number
    endYear?: number

    // Frequency - for incomes and expenses
    frequency?: Frequency

    // Asset-specific fields
    growthRate?: number // Annual growth rate (e.g., 0.07 for 7%)
    yieldRate?: number // Annual dividend/yield rate (e.g., 0.02 for 2%)
    monthlyContribution?: number // Regular monthly contribution

    // Liability-specific fields
    interestRate?: number // Annual interest rate (e.g., 0.045 for 4.5%)
    minimumPayment?: number // Annual minimum payment
}
