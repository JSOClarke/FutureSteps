import {
    Briefcase,
    Building,
    Car,
    CreditCard,
    GraduationCap,
    Heart,
    Home,
    Landmark,
    Lightbulb,
    MoreHorizontal,
    PiggyBank,
    Smartphone,
    TrendingUp,
    Utensils,
    Wallet
} from 'lucide-react'
import type {
    FinancialCategory,
    FinancialSubCategory,
    ExpenseSubCategory,
    IncomeSubCategory,
    AssetSubCategory,
    LiabilitySubCategory
} from '../types'

export const EXPENSE_SUBCATEGORIES: { value: ExpenseSubCategory; label: string; icon: any }[] = [
    { value: 'housing', label: 'Housing', icon: Home },
    { value: 'food', label: 'Food & Dining', icon: Utensils },
    { value: 'transportation', label: 'Transportation', icon: Car },
    { value: 'utilities', label: 'Utilities', icon: Lightbulb },
    { value: 'healthcare', label: 'Healthcare', icon: Heart },
    { value: 'entertainment', label: 'Entertainment', icon: Smartphone },
    { value: 'personal', label: 'Personal Care', icon: Briefcase }, // Briefcase as placeholder, maybe User?
    { value: 'education', label: 'Education', icon: GraduationCap },
    { value: 'debt', label: 'Debt Payments', icon: CreditCard },
    { value: 'savings', label: 'Savings', icon: PiggyBank },
    { value: 'other', label: 'Other', icon: MoreHorizontal },
]

export const INCOME_SUBCATEGORIES: { value: IncomeSubCategory; label: string; icon: any }[] = [
    { value: 'salary', label: 'Salary', icon: Wallet },
    { value: 'business', label: 'Business', icon: Briefcase },
    { value: 'investment', label: 'Investment', icon: TrendingUp },
    { value: 'other', label: 'Other', icon: MoreHorizontal },
]

export const ASSET_SUBCATEGORIES: { value: AssetSubCategory; label: string; icon: any }[] = [
    { value: 'cash', label: 'Cash', icon: Wallet },
    { value: 'investment', label: 'Investments', icon: TrendingUp },
    { value: 'property', label: 'Real Estate', icon: Building },
    { value: 'retirement', label: 'Retirement', icon: PiggyBank },
    { value: 'other', label: 'Other', icon: MoreHorizontal },
]

export const LIABILITY_SUBCATEGORIES: { value: LiabilitySubCategory; label: string; icon: any }[] = [
    { value: 'mortgage', label: 'Mortgage', icon: Home },
    { value: 'loan', label: 'Loans', icon: Landmark },
    { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
    { value: 'other', label: 'Other', icon: MoreHorizontal },
]

export function getSubCategoriesForCategory(category: FinancialCategory) {
    switch (category) {
        case 'expenses':
            return EXPENSE_SUBCATEGORIES
        case 'income':
            return INCOME_SUBCATEGORIES
        case 'assets':
            return ASSET_SUBCATEGORIES
        case 'liabilities':
            return LIABILITY_SUBCATEGORIES
    }
}

export function getSubCategoryLabel(subCategory?: FinancialSubCategory): string {
    if (!subCategory) return ''

    const all = [
        ...EXPENSE_SUBCATEGORIES,
        ...INCOME_SUBCATEGORIES,
        ...ASSET_SUBCATEGORIES,
        ...LIABILITY_SUBCATEGORIES
    ]

    const found = all.find(item => item.value === subCategory)
    return found ? found.label : subCategory
}

export function getSubCategoryIcon(subCategory?: FinancialSubCategory) {
    if (!subCategory) return MoreHorizontal

    const all = [
        ...EXPENSE_SUBCATEGORIES,
        ...INCOME_SUBCATEGORIES,
        ...ASSET_SUBCATEGORIES,
        ...LIABILITY_SUBCATEGORIES
    ]

    const found = all.find(item => item.value === subCategory)
    return found ? found.icon : MoreHorizontal
}

export function getSubCategoryColor(category: FinancialCategory): string {
    switch (category) {
        case 'income': return 'bg-emerald-100 text-emerald-800'
        case 'expenses': return 'bg-red-100 text-red-800'
        case 'assets': return 'bg-blue-100 text-blue-800'
        case 'liabilities': return 'bg-amber-100 text-amber-800'
    }
}
