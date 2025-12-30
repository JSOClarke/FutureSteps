import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import CurrencyInput from '../../shared/CurrencyInput'
import type { FormFieldProps } from './types'

export const CashFields = ({ data, onChange }: FormFieldProps) => {
    return (
        <>
            {/* AER / Interest Rate (Yield Rate) */}
            <div className="col-span-2">
                <Label htmlFor="yieldRate">AER / Interest Rate (%)</Label>
                <Input
                    id="yieldRate"
                    type="number"
                    step="0.1"
                    value={data.yieldRate || ''}
                    onChange={(e) => onChange('yieldRate', e.target.value)}
                    placeholder="e.g. 4.5 for 4.5%"
                />
                <p className="text-xs text-muted-foreground mt-1">
                    Annual Equivalent Rate for your savings.
                </p>
            </div>

            {/* Max Annual Contribution */}
            <div className="col-span-2">
                <Label htmlFor="maxAnnualContribution">Max Annual Contribution</Label>
                <CurrencyInput
                    value={data.maxAnnualContribution?.toString() || ''}
                    onChange={(val) => onChange('maxAnnualContribution', val)}
                    placeholder="0.00"
                    error={undefined}
                />
            </div>
        </>
    )
}
