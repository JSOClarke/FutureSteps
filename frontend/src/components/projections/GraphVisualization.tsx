import { useState, useEffect } from 'react'
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
import { formatCurrency, getCurrencySymbol } from '../../utils/formatters'
import { useCurrency } from '../../hooks/useCurrency'

interface GraphVisualizationProps {
    selectedYear: number | null
    onYearSelect: (year: number) => void
    milestones: Milestone[]
}

function GraphVisualization({ selectedYear: _selectedYear, onYearSelect, milestones }: GraphVisualizationProps) {
    const { surplusPriority, deficitPriority } = usePriority()
    const { projection } = useProjections(surplusPriority, deficitPriority)
    const currency = useCurrency()

    // Detect mobile for vertical Y-axis labels
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    if (!projection || projection.years.length === 0) {
        return (
            <div
                className="w-full lg:w-[70%] border border-black flex items-center justify-center bg-white"
                style={{
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
    const milestoneYears = milestones.map(m => {
        if (m.type === 'year') {
            return {
                milestone: m,
                year: m.value
            }
        }
        // Default to net_worth
        return {
            milestone: m,
            year: projection.years.find(y => y.netWorth >= m.value)?.year
        }
    }).filter(m => m.year !== undefined)

    // Format currency for tooltip


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

    // Custom Tooltip Component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const year = label
            const yearMilestones = milestoneYears.filter(m => m.year === year)

            return (
                <div className="bg-white border border-gray-200 p-3 rounded shadow-lg outline-none">
                    <p className="font-semibold mb-2">{year}</p>
                    {payload.map((entry: any) => (
                        <p key={entry.name} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: {formatCurrency(entry.value, currency)}
                        </p>
                    ))}
                    {yearMilestones.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 mb-1">Milestones:</p>
                            {yearMilestones.map(m => (
                                <div key={m.milestone.id} className="flex items-center gap-2 mb-1">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: m.milestone.color || '#22C55E' }}
                                    />
                                    <p className="text-sm">
                                        {m.milestone.name}: {m.milestone.type === 'year'
                                            ? m.milestone.value
                                            : formatCurrency(m.milestone.value)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )
        }
        return null
    }

    return (
        <div
            className="w-full lg:w-[70%] border border-black bg-white p-1 sm:p-2 outline-none focus:outline-none [&_*]:outline-none [&_*:focus]:outline-none"
            style={{
                height: '70vh'
            }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: isMobile ? 0 : 5, bottom: 5 }}
                >
                    <XAxis
                        dataKey="year"
                        hide={true}
                    />
                    <YAxis
                        width={isMobile ? 20 : 60}
                        tickFormatter={(value) => {
                            const currencySymbol = getCurrencySymbol(currency)
                            const absValue = Math.abs(value)
                            if (absValue >= 1000000) {
                                return `${currencySymbol}${(value / 1000000).toFixed(1)}M`
                            } else if (absValue >= 1000) {
                                return `${currencySymbol}${(value / 1000).toFixed(0)}k`
                            }
                            return `${currencySymbol}${value}`
                        }}
                        tick={(props) => {
                            const { x, y, payload } = props
                            const value = payload.value
                            const currencySymbol = getCurrencySymbol(currency)
                            const absValue = Math.abs(value)
                            let displayValue
                            if (absValue >= 1000000) {
                                displayValue = `${currencySymbol}${(value / 1000000).toFixed(1)}M`
                            } else if (absValue >= 1000) {
                                displayValue = `${currencySymbol}${(value / 1000).toFixed(0)}k`
                            } else {
                                displayValue = `${currencySymbol}${value}`
                            }

                            return (
                                <g transform={`translate(${x},${y})`}>
                                    <text
                                        x={0}
                                        y={0}
                                        dy={4}
                                        textAnchor="end"
                                        fill="#6B7280"
                                        fontSize={12}
                                        transform={isMobile ? 'rotate(-90)' : ''}
                                    >
                                        {displayValue}
                                    </text>
                                </g>
                            )
                        }}
                        stroke="#6B7280"
                    />
                    <Tooltip content={<CustomTooltip />} />

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
                                                fill={m.milestone.color || "#22C55E"}
                                                stroke={m.milestone.color ? undefined : "#16A34A"}
                                                strokeWidth={1}
                                            />
                                            <title>
                                                {m.milestone.name}: {m.milestone.type === 'year'
                                                    ? m.milestone.value
                                                    : formatCurrency(m.milestone.value, currency)}
                                            </title>
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
