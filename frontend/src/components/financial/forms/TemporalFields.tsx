import { useState } from 'react'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import CurrencyInput from '../../shared/CurrencyInput'
import YearSelect from '../../shared/YearSelect'
import { usePlans } from '../../../context/PlansContext'
import type { FormFieldProps } from './types'
import { useParams } from 'react-router-dom'
import { ChevronDown, ChevronUp } from '../../../icons'

export const TemporalFields = ({ data, onChange }: FormFieldProps) => {
    const currentYear = new Date().getFullYear()
    const { planId } = useParams()
    const { plans } = usePlans()
    const activePlan = plans.find(p => p.id === planId)
    const milestones = activePlan?.milestones || []

    const hasActiveGrowth = data.growthMode && data.growthMode !== 'none'
    const [isOpen, setIsOpen] = useState(hasActiveGrowth)

    return (
        <>
            {/* Start Year */}
            <div>
                <Label htmlFor="startYear">Start Year (Optional)</Label>
                <YearSelect
                    id="startYear"
                    label=""
                    value={data.startYear?.toString() || ''}
                    onChange={(val) => onChange('startYear', val)}
                    minYear={currentYear}
                    maxYear={currentYear + 60}
                    placeholder="Start Year"
                    milestones={milestones}
                    data-testid="item-start-year-select"
                />
            </div>

            {/* End Year */}
            <div>
                <Label htmlFor="endYear">End Year (Optional)</Label>
                <YearSelect
                    id="endYear"
                    label=""
                    value={data.endYear?.toString() || ''}
                    onChange={(val) => onChange('endYear', val)}
                    minYear={currentYear}
                    maxYear={currentYear + 60}
                    placeholder="End Year"
                    milestones={milestones}
                    data-testid="item-end-year-select"
                />
            </div>

            {/* Frequency */}
            <div className="col-span-2">
                <Label htmlFor="frequency">Frequency</Label>
                <select
                    id="frequency"
                    value={data.frequency || 'monthly'}
                    onChange={(e) => onChange('frequency', e.target.value)}
                    className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    data-testid="item-frequency-select"
                >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                </select>
            </div>

            {/* Growth Settings Accordion */}
            <div className="col-span-2 border border-gray-200 rounded-none overflow-hidden mt-2">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <span className="text-sm font-medium text-gray-900">Growth Settings</span>
                    {isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                </button>

                {isOpen && (
                    <div className="p-4 bg-white border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Growth Mode */}
                            <div className="col-span-2">
                                <Label htmlFor="growthMode">Growth Mode</Label>
                                <select
                                    id="growthMode"
                                    value={data.growthMode || (data.isAdjustedForInflation ? 'inflation' : 'none')}
                                    onChange={(e) => {
                                        const mode = e.target.value as 'none' | 'inflation' | 'percentage'
                                        onChange('growthMode', mode)
                                        if (mode !== 'inflation') onChange('isAdjustedForInflation', false)
                                    }}
                                    className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    data-testid="item-growth-mode-select"
                                >
                                    <option value="none">None (Fixed Value)</option>
                                    <option value="inflation">Match Inflation</option>
                                    <option value="percentage">Fixed Growth %</option>
                                </select>
                                <p className="text-[10px] text-gray-500 mt-1">
                                    {data.growthMode === 'inflation' ? 'Increases annually based on plan inflation rate.' :
                                        data.growthMode === 'percentage' ? 'Increases annually by a fixed percentage.' :
                                            'Value remains constant over time.'}
                                </p>
                            </div>

                            {/* Custom Growth Rate (Only for Percentage mode) */}
                            {data.growthMode === 'percentage' && (
                                <div>
                                    <Label htmlFor="growthRate">Annual Growth (%)</Label>
                                    <div className="relative">
                                        <Input
                                            id="growthRate"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.growthRate || ''}
                                            onChange={(e) => onChange('growthRate', e.target.value)}
                                            placeholder="5.0"
                                            className="pr-8"
                                            data-testid="item-growth-rate-input"
                                        />
                                        <span className="absolute right-3 top-2.5 text-sm text-gray-400 pointer-events-none">%</span>
                                    </div>
                                </div>
                            )}

                            {/* Max Value Cap (For both Inflation and Percentage modes) */}
                            {(data.growthMode === 'inflation' || data.growthMode === 'percentage') && (
                                <div className={data.growthMode === 'percentage' ? "" : "col-span-2"}>
                                    <Label htmlFor="maxValue">Cap Value At (Optional)</Label>
                                    <CurrencyInput
                                        id="maxValue"
                                        value={data.maxValue?.toString() || ''}
                                        onChange={(val) => onChange('maxValue', val)}
                                        placeholder="No limit"
                                        data-testid="item-max-value-input"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Item will not grow beyond this amount.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
