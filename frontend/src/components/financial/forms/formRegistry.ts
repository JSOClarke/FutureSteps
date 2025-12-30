import type { FinancialCategory, FinancialSubCategory } from '../../../types'
import { BaseFields } from './BaseFields'
import { TemporalFields } from './TemporalFields'
import { GrowthFields } from './GrowthFields'
import { LiabilityFields } from './LiabilityFields'
import { CashFields } from './CashFields'
import type { FormFieldProps } from './types'

type FieldComponent = React.FC<FormFieldProps>

type FormConfig = {
    [key in FinancialCategory]: {
        _default: FieldComponent[]
        [key: string]: FieldComponent[]
    }
}

export const FORM_CONFIG: FormConfig = {
    income: {
        _default: [BaseFields, TemporalFields],
        // Example extension:
        // salary: [BaseFields, TemporalFields, SalarySpecificFields],
    },
    expenses: {
        _default: [BaseFields, TemporalFields],
    },
    assets: {
        _default: [BaseFields, GrowthFields],
        cash: [BaseFields, CashFields],
    },
    liabilities: {
        _default: [BaseFields, LiabilityFields],
    }
}

export function getFormFields(category: FinancialCategory, subCategory?: FinancialSubCategory): FieldComponent[] {
    const categoryConfig = FORM_CONFIG[category]
    if (!categoryConfig) return [BaseFields]

    if (subCategory && categoryConfig[subCategory]) {
        return categoryConfig[subCategory]
    }

    return categoryConfig._default
}
