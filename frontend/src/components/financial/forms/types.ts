import type { FinancialItem } from '../../../types'

export interface FormFieldProps {
    data: Partial<FinancialItem>
    onChange: (field: keyof FinancialItem, value: any) => void
    errors: Record<string, string>
}
