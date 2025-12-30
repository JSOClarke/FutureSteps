import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import CurrencyInput from '../../shared/CurrencyInput'
import type { FormFieldProps } from './types'

export const BaseFields = ({ data, onChange, errors }: FormFieldProps) => {
    return (
        <>
            {/* Name */}
            <div className="col-span-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    value={data.name || ''}
                    onChange={(e) => onChange('name', e.target.value)}
                    placeholder="e.g. Salary, Rent, Investment"
                    className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Value */}
            <div className="col-span-2">
                <Label htmlFor="value">Amount</Label>
                <CurrencyInput
                    value={data.value?.toString() || ''}
                    onChange={(val) => onChange('value', val)}
                    placeholder="0.00"
                    error={errors.value}
                />
                {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
            </div>
        </>
    )
}
