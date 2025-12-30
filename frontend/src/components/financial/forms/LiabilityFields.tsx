import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import CurrencyInput from '../../shared/CurrencyInput'
import type { FormFieldProps } from './types'

export const LiabilityFields = ({ data, onChange }: FormFieldProps) => {
    return (
        <>
            {/* Interest Rate */}
            <div>
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    value={data.interestRate || ''}
                    onChange={(e) => onChange('interestRate', e.target.value)}
                    placeholder="e.g. 4.5 for 4.5%"
                />
            </div>

            {/* Minimum Payment */}
            <div>
                <Label htmlFor="minimumPayment">Minimum Annual Payment</Label>
                <CurrencyInput
                    value={data.minimumPayment?.toString() || ''}
                    onChange={(val) => onChange('minimumPayment', val)}
                    placeholder="0.00"
                />
            </div>
        </>
    )
}
