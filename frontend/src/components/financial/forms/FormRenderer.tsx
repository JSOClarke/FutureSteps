import { getFormFields } from './formRegistry'
import type { FinancialCategory, FinancialSubCategory } from '../../../types'
import type { FormFieldProps } from './types'

interface FormRendererProps extends FormFieldProps {
    category: FinancialCategory
    subCategory?: FinancialSubCategory
}

export const FormRenderer = ({ category, subCategory, ...formProps }: FormRendererProps) => {
    const Fields = getFormFields(category, subCategory)

    return (
        <div className="grid grid-cols-2 gap-4">
            {Fields.map((FieldComponent, index) => (
                <FieldComponent key={index} {...formProps} />
            ))}
        </div>
    )
}
