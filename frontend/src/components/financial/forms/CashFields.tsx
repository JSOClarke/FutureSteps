import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import CurrencyInput from '../../shared/CurrencyInput'
import { Tooltip } from '../../shared/Tooltip'
import { ToggleGroup } from '../../ui/ToggleGroup'
import { FIELD_TOOLTIPS } from '../../../constants/tooltips'
import type { FormFieldProps } from './types'

export const CashFields = ({ data, onChange }: FormFieldProps) => {
    return (
        <>
            {/* AER / Interest Rate (Yield Rate) */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="yieldRate" className="mb-0">AER / Interest Rate (%)</Label>
                        <Tooltip content={FIELD_TOOLTIPS.interestRate} />
                    </div>
                    <ToggleGroup
                        options={[
                            { label: 'Nominal', value: 'nominal' },
                            { label: 'AER', value: 'aer' }
                        ]}
                        value={data.yieldRateType || 'nominal'}
                        onChange={(val) => onChange('yieldRateType', val)}
                        className="scale-90 origin-right"
                    />
                </div>
                <Input
                    id="yieldRate"
                    type="number"
                    step="0.1"
                    value={data.yieldRate || ''}
                    onChange={(e) => onChange('yieldRate', e.target.value)}
                    placeholder="e.g. 4.5 for 4.5%"
                    data-testid="item-yield-rate-input"
                />
            </div>

            {/* Max Annual Contribution */}
            <div>
                <Label htmlFor="maxAnnualContribution">Max Annual Contribution</Label>
                <CurrencyInput
                    value={data.maxAnnualContribution?.toString() || ''}
                    onChange={(val) => onChange('maxAnnualContribution', val)}
                    placeholder="0.00"
                    error={undefined}
                    data-testid="item-contribution-input"
                />
            </div>
        </>
    )
}
