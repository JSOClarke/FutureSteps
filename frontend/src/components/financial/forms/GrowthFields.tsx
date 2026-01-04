import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import CurrencyInput from '../../shared/CurrencyInput'
import { Tooltip } from '../../shared/Tooltip'
import { ToggleGroup } from '../../ui/ToggleGroup'
import { FIELD_TOOLTIPS } from '../../../constants/tooltips'
import type { FormFieldProps } from './types'

export const GrowthFields = ({ data, onChange }: FormFieldProps) => {
    return (
        <>
            {/* Growth Rate */}
            <div>
                <div className="flex items-center gap-1.5 mb-2">
                    <Label htmlFor="growthRate" className="mb-0">Growth Rate (%)</Label>
                    <Tooltip content={FIELD_TOOLTIPS.growthRate} />
                </div>
                <Input
                    id="growthRate"
                    type="number"
                    step="0.1"
                    value={data.growthRate || ''}
                    onChange={(e) => onChange('growthRate', e.target.value)}
                    placeholder="e.g. 7.0 for 7%"
                    data-testid="item-growth-rate-input"
                />
            </div>

            {/* Yield Rate */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="yieldRate" className="mb-0">Yield Rate (%)</Label>
                        <Tooltip content={FIELD_TOOLTIPS.yieldRate} />
                    </div>
                    <ToggleGroup
                        options={[
                            { label: 'Nominal', value: 'nominal' },
                            { label: 'APY', value: 'aer' }
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
                    placeholder="e.g. 3.0 for 3%"
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
                    data-testid="item-contribution-input"
                />
            </div>
        </>
    )
}
