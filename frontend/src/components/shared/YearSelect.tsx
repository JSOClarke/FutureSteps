import { useMemo } from 'react'
import type { Milestone } from '../milestones/types'

interface YearSelectProps {
    id: string
    value: string
    onChange: (value: string) => void
    label: string
    required?: boolean
    milestones: Milestone[]
    minYear?: number
    maxYear?: number
    placeholder?: string
    error?: string
    'data-testid'?: string
}

function YearSelect({
    id,
    value,
    onChange,
    label,
    required = false,
    milestones,
    minYear = new Date().getFullYear(),
    maxYear = new Date().getFullYear() + 50,
    placeholder,
    error,
    'data-testid': testId
}: YearSelectProps) {
    const years = useMemo(() => {
        const result = []
        for (let i = minYear; i <= maxYear; i++) {
            result.push(i)
        }
        return result
    }, [minYear, maxYear])

    // Filter milestones that are year-based or have a reachable year
    // For now, we'll just show all milestones that have a year associated if possible,
    // but the requirement is specifically about selecting a milestone to set the year.
    // However, milestones might be dynamic (net worth based).
    // The user request said: "if there was a 'move out' at year 2035 a user would be able to select that."
    // This implies we should show milestones that have a specific year.
    // For net_worth milestones, we might not know the year statically unless we run projection, 
    // but the modal is for inputting data *into* the projection.
    // So we should probably only show 'year' type milestones OR just show all and let the user pick,
    // but if it's a net_worth milestone without a fixed year, it might be confusing.
    // Let's stick to showing milestones that are explicitly year-based OR we can try to show all
    // and if it's a net_worth milestone, maybe we can't really use it as a fixed year source 
    // unless we know when it hits.
    // BUT, the prompt says "dropdown with the years... and then also have the milestone".
    // If I select a milestone, does it bind to the milestone ID or the year?
    // "a user would be able to select that" -> implies selecting the milestone sets the year to that milestone's year.
    // If the milestone is "Net Worth $1M", it doesn't have a fixed year yet (it depends on the plan).
    // So for now, let's filter for milestones that have type === 'year'.

    const yearMilestones = useMemo(() => {
        return milestones.filter(m => m.type === 'year')
    }, [milestones])

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && '*'}
            </label>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black bg-white font-light"
                data-testid={testId}
            >
                <option value="">{placeholder || 'Select year...'}</option>

                {yearMilestones.length > 0 && (
                    <optgroup label="Milestones">
                        {yearMilestones.map(m => (
                            <option key={m.id} value={m.value}>
                                {m.name} ({m.value})
                            </option>
                        ))}
                    </optgroup>
                )}

                <optgroup label="Years">
                    {years.map(year => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </optgroup>
            </select>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    )
}

export default YearSelect
