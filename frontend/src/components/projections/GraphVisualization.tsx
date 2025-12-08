import { useProjections } from '../../hooks/useProjections'
import { usePriority } from '../Dashboard'
import type { Milestone } from '../milestones/types'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts'

interface GraphVisualizationProps {
    selectedYear: number | null
    onYearSelect: (year: number) => void
    milestones: Milestone[]
}

function GraphVisualization({ selectedYear: _selectedYear, onYearSelect, milestones }: GraphVisualizationProps) {
    const { surplusPriority, deficitPriority } = usePriority()
    const { projection } = useProjections(surplusPriority, deficitPriority)

    if (!projection || projection.years.length === 0) {
        return (
            <div
                className="w-[70%] border-2 flex items-center justify-center bg-white"
                style={{
                    borderColor: '#BAE6FD',
                    minHeight: '70vh'
                }}
            >
                <p className="text-2xl font-light text-gray-600">
                    Add financial items to see projections
                </p>
            </div>
        )
    }

    // Prepare data for Recharts
    const chartData = projection.years.map(year => ({
        year: year.year,
        'Net Worth': year.netWorth,
        'Income': year.totalIncome,
        'Expenses': year.totalExpenses,
    }))

    // Find first year where each milestone is reached
    const milestoneYears = milestones.map(m => ({
        milestone: m,
        year: projection.years.find(y => y.netWorth >= m.value)?.year
    })).filter(m => m.year !== undefined)

    // Format currency for tooltip
    const formatCurrency = (value: number) => {
        return `$${value.toLocaleString()} `
    }

    // Handle bar click - Recharts Bar onClick passes data payload
    const handleBarClick = (data: any, index: number) => {
        // Try to get year from the data object
        if (data && data.year) {
            onYearSelect(data.year)
        } else if (index !== undefined && chartData[index]) {
            // Fallback: use index to get year from chartData
            onYearSelect(chartData[index].year)
        }
    }

    return (
        <div
            className="w-[70%] border border-black bg-white p-2 outline-none focus:outline-none [&_*]:outline-none [&_*:focus]:outline-none"
            style={{
                height: '70vh'
            }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                    <XAxis
                        dataKey="year"
                        hide={true}
                    />
                    <YAxis
                        tickFormatter={(value) => {
                            const absValue = Math.abs(value)
                            if (absValue >= 1000000) {
                                return `$${(value / 1000000).toFixed(1)}M`
                            } else if (absValue >= 1000) {
                                return `$${(value / 1000).toFixed(0)}k`
                            }
                            return `$${value}`
                        }}
                        tick={{ fontSize: 12 }}
                        stroke="#6B7280"
                    />
                    <Tooltip
                        formatter={formatCurrency}
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px'
                        }}
                    />

                    <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="3 3" />
                    <Bar
                        dataKey="Net Worth"
                        fill="#3B82F6"
                        cursor="pointer"
                        onClick={handleBarClick}
                        shape={(props: any) => {
                            const { x, y, width, height, payload } = props
                            // Check if this year has any milestones
                            const yearMilestones = milestoneYears.filter(m => m.year === payload.year)

                            return (
                                <>
                                    {/* Regular bar */}
                                    <rect
                                        x={x}
                                        y={y}
                                        width={width}
                                        height={height}
                                        fill="#3B82F6"
                                    />
                                    {/* Milestone markers - green squares above bar, stacked if multiple */}
                                    {yearMilestones.map((m, index) => (
                                        <g key={m.milestone.id}>
                                            <rect
                                                x={x + width / 2 - 6}
                                                y={y - 25 - (index * 18)}
                                                width={12}
                                                height={12}
                                                fill="#22C55E"
                                                stroke="#16A34A"
                                                strokeWidth={1}
                                            />
                                            <title>{m.milestone.name}: ${m.milestone.value.toLocaleString()}</title>
                                        </g>
                                    ))}
                                </>
                            )
                        }}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default GraphVisualization
