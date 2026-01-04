export type FinancialCategory = 'income' | 'expenses' | 'assets' | 'liabilities'
export type Frequency = 'monthly' | 'annual'

// Subcategory definitions
export type ExpenseSubCategory =
    | 'housing'        // Rent, Mortgage
    | 'food'           // Groceries, Dining
    | 'living_expenses' // General living costs
    | 'transportation' // Car, Gas, Public Transit
    | 'utilities'      // Electric, Water, Internet
    | 'healthcare'     // Insurance, Medical
    | 'entertainment'  // Subscriptions, Hobbies
    | 'personal'       // Clothing, Personal Care
    | 'education'      // Tuition, Books
    | 'debt'           // Loan payments (if not tracked as liabilities)
    | 'savings'        // Investments (if not tracked as assets)
    | 'other'          // Miscellaneous

export type IncomeSubCategory =
    | 'salary'
    | 'business'
    | 'investment'
    | 'other'

export type AssetSubCategory =
    | 'cash'
    | 'investment'
    | 'property'
    | 'retirement'
    | 'other'

export type LiabilitySubCategory =
    | 'mortgage'
    | 'loan'
    | 'credit_card'
    | 'other'

export type FinancialSubCategory =
    | ExpenseSubCategory
    | IncomeSubCategory
    | AssetSubCategory
    | LiabilitySubCategory

export interface FinancialItem {
    id: string
    name: string
    value: number
    category: FinancialCategory
    subCategory?: FinancialSubCategory

    // Temporal fields - when is this item active?
    startYear?: number
    endYear?: number
    startMonth?: number // 1-12
    endMonth?: number // 1-12

    // Frequency - for incomes and expenses
    frequency?: Frequency

    // Asset-specific fields
    growthRate?: number // Annual growth rate (e.g., 0.07 for 7%)
    yieldRate?: number // Annual dividend/yield rate (e.g., 0.02 for 2%)
    maxAnnualContribution?: number // Max annual contribution limit

    // Liability-specific fields
    interestRate?: number // Annual interest rate (e.g., 0.045 for 4.5%)
    minimumPayment?: number // Annual minimum payment

    // Inflation adjustment & Growth
    isAdjustedForInflation?: boolean // Deprecated in favor of growthMode, kept for migration
    growthMode?: 'none' | 'inflation' | 'percentage'
    maxValue?: number // Cap on the item value growth

    // Rate Types (for interest/yield)
    yieldRateType?: 'nominal' | 'aer'
}

export interface Milestone {
    id: string
    name: string
    value: number
    type: 'net_worth' | 'year'
    color?: string
}

export interface Plan {
    id: string
    name: string
    description?: string
    createdAt: string // ISO string
    financialItems: FinancialItem[]
    milestones: Milestone[]
    surplusPriority: string[]
    deficitPriority: string[]
}

export interface UserProfile {
    id: string
    email: string
    full_name?: string
    dateOfBirth?: string
    country?: string
    lifeExpectancy?: number // Target age (default 85)
    currency?: string // ISO currency code (e.g., 'USD', 'EUR', 'GBP')
}

export interface FinancialSnapshot {
    id: string
    user_id: string
    created_at: string // ISO timestamp
    total_income: number
    total_expenses: number
    total_assets: number
    total_liabilities: number
    net_worth: number
    income_count?: number
    expense_count?: number
    asset_count?: number
    liability_count?: number
    note?: string
}

export interface SnapshotItem {
    id: string
    snapshot_id: string
    created_at: string
    name: string
    amount: number
    category: FinancialCategory
    subCategory?: string
}

export interface DashboardItem {
    id: string
    name: string
    amount: number
    category: FinancialCategory
    subCategory?: string
}
