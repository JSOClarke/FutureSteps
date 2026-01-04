import { getFormFields } from './formRegistry'
import type { FinancialCategory, FinancialSubCategory } from '../../../types'
import type { FormFieldProps } from './types'

interface FormRendererProps extends FormFieldProps {
    category: FinancialCategory
    subCategory?: FinancialSubCategory
}

export const FormRenderer = ({ category, subCategory, simpleMode, ...formProps }: FormRendererProps) => {
    let Fields = getFormFields(category, subCategory)

    if (simpleMode) {
        // In simple mode, only show BaseFields (Name and Value)
        Fields = [Fields[0]]
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {Fields.map((FieldComponent, index) => (
                <FieldComponent key={index} {...formProps} simpleMode={simpleMode} />
            ))}
        </div>
    )
}
