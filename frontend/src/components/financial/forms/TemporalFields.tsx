import { Label } from '../../ui/label'
import YearSelect from '../../shared/YearSelect'
import { usePlans } from '../../../context/PlansContext'
import type { FormFieldProps } from './types'

export const TemporalFields = ({ data, onChange }: FormFieldProps) => {
    const currentYear = new Date().getFullYear()
    const { activePlan } = usePlans()
    const milestones = activePlan?.milestones || []

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
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    data-testid="item-frequency-select"
                >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                </select>
            </div>

            {/* Inflation Adjustment Toggle */}
            <div className="col-span-2 flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 mt-2">
                <div className="flex flex-col">
                    <Label htmlFor="isAdjustedForInflation" className="text-sm font-medium text-gray-700">Adjust for Inflation</Label>
                    <p className="text-[10px] text-gray-500 font-light">Increase amount annually based on global inflation</p>
                </div>
                <input
                    id="isAdjustedForInflation"
                    type="checkbox"
                    checked={data.isAdjustedForInflation || false}
                    onChange={(e) => onChange('isAdjustedForInflation', e.target.checked)}
                    className="w-4 h-4 accent-black cursor-pointer"
                    data-testid="item-inflation-toggle"
                />
            </div>
        </>
    )
}
