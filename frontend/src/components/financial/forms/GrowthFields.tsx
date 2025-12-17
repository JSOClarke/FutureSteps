import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import CurrencyInput from '../../shared/CurrencyInput'
import type { FormFieldProps } from './types'

export const GrowthFields = ({ data, onChange }: FormFieldProps) => {
    return (
        <>
            {/* Growth Rate */}
            <div>
                <Label htmlFor="growthRate">Growth Rate (%)</Label>
                <Input
                    id="growthRate"
                    type="number"
                    step="0.1"
                    value={data.growthRate || ''}
                    onChange={(e) => onChange('growthRate', e.target.value)}
                    placeholder="e.g. 7.0 for 7%"
                />
            </div>

            {/* Yield Rate */}
            <div>
                <Label htmlFor="yieldRate">Yield Rate (%)</Label>
                <Input
                    id="yieldRate"
                    type="number"
                    step="0.1"
                    value={data.yieldRate || ''}
                    onChange={(e) => onChange('yieldRate', e.target.value)}
                    placeholder="e.g. 3.0 for 3%"
                />
            </div>

            {/* Monthly Contribution */}
            <div className="col-span-2">
                <Label htmlFor="monthlyContribution">Max Monthly Contribution</Label>
                <CurrencyInput
                    value={data.monthlyContribution?.toString() || ''}
                    onChange={(val) => onChange('monthlyContribution', val)}
                    placeholder="0.00"
                />
            </div>
        </>
    )
}
