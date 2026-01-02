import { useState, useEffect, useMemo } from 'react'
import { useProjections } from '../../hooks/useProjections'
import { usePriority } from '../../pages/PlansPage'
import type { Milestone } from '../milestones/types'
import {
    BarChart,
    Bar,
    Line,
    Area,
    ComposedChart,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Sankey
} from 'recharts'
import { BarChart3, TrendingUp, Settings, SankeyIcon } from '../../icons'
import { formatCurrency, getCurrencySymbol } from '../../utils/formatters'
import { useCurrency } from '../../hooks/useCurrency'

interface GraphVisualizationProps {
    selectedYear: number | null
    onYearSelect: (year: number) => void
    milestones: Milestone[]
    isRealValues: boolean
}

function GraphVisualization({ selectedYear, onYearSelect, milestones, isRealValues }: GraphVisualizationProps) {
    const { surplusPriority, deficitPriority } = usePriority()
    const { projection, realProjection } = useProjections(surplusPriority, deficitPriority)
    const currency = useCurrency()

    // Chart type state
    const [chartType, setChartType] = useState<'bar' | 'line' | 'sankey'>('line')

    // Toggle collapse state
    const [isToggleExpanded, setIsToggleExpanded] = useState(true)
    const [hideTimeout, setHideTimeout] = useState<number | null>(null)

    // Detect mobile for vertical Y-axis labels
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Auto-hide toggle after 3 seconds
    useEffect(() => {
        if (isToggleExpanded) {
            if (hideTimeout) clearTimeout(hideTimeout)
            const timeout = window.setTimeout(() => {
                setIsToggleExpanded(false)
            }, 3000)
            setHideTimeout(timeout)
        }
        return () => {
            if (hideTimeout) clearTimeout(hideTimeout)
        }
    }, [isToggleExpanded])

    const handleChartTypeChange = (type: 'bar' | 'line' | 'sankey') => {
        setChartType(type)
        setIsToggleExpanded(true)
    }

    const handleToggleExpand = () => {
        setIsToggleExpanded(true)
    }

    // Select the current projection source
    const currentProjection = isRealValues ? realProjection : projection

    const sankeyData = useMemo(() => {
        if (!selectedYear || !currentProjection || currentProjection.years.length === 0) return { nodes: [], links: [] }
        const yearData = currentProjection.years.find(y => y.year === selectedYear) || currentProjection.years[0]
        const nodes: { name: string, category?: string, fill?: string }[] = []
        const links: { source: number, target: number, value: number, gradientStart?: string, gradientEnd?: string }[] = []

        nodes.push({ name: 'Available Cash', category: 'total', fill: '#4B5563' }) // Index 0
        let incomeIndex = 1

        yearData.history.income.forEach(item => {
            nodes.push({ name: item.name, category: 'income' })
            links.push({
                source: incomeIndex,
                target: 0,
                value: item.amount,
                gradientStart: '#10B981',
                gradientEnd: '#4B5563'
            })
            incomeIndex++
        })

        const totalPassive = yearData.history.yield.reduce((sum, y) => sum + y.yieldAmount, 0)
        if (totalPassive > 0) {
            nodes.push({ name: 'Passive Income', category: 'income' })
            links.push({
                source: incomeIndex,
                target: 0,
                value: totalPassive,
                gradientStart: '#34D399',
                gradientEnd: '#4B5563'
            })
            incomeIndex++
        }

        let targetIndex = incomeIndex
        yearData.history.expenses.forEach(item => {
            nodes.push({ name: item.name, category: 'expense' })
            links.push({
                source: 0,
                target: targetIndex,
                value: item.amount,
                gradientStart: '#4B5563',
                gradientEnd: '#EF4444'
            })
            targetIndex++
        })

        yearData.history.contributions.forEach(item => {
            const asset = yearData.assets.find(a => a.id === item.assetId)
            nodes.push({ name: asset ? `To ${asset.name}` : 'Investment', category: 'saving', fill: '#3B82F6' })
            links.push({
                source: 0,
                target: targetIndex,
                value: item.amount,
                gradientStart: '#4B5563',
                gradientEnd: '#3B82F6'
            })
            targetIndex++
        })

        yearData.history.surplus.forEach(item => {
            const asset = yearData.assets.find(a => a.id === item.assetId)
            nodes.push({ name: asset ? `Surplus to ${asset.name}` : 'Surplus', category: 'saving', fill: '#60A5FA' })
            links.push({
                source: 0,
                target: targetIndex,
                value: item.amount,
                gradientStart: '#4B5563',
                gradientEnd: '#60A5FA'
            })
            targetIndex++
        })

        yearData.history.deficit.forEach(item => {
            const asset = yearData.assets.find(a => a.id === item.assetId)
            nodes.splice(1, 0, { name: asset ? `From ${asset.name}` : 'Withdrawal', category: 'withdrawal' })
            links.forEach(l => {
                if (l.target === 0 && l.source >= 1) l.source += 1
                if (l.source === 0) l.target += 1
            })
            links.push({
                source: 1,
                target: 0,
                value: item.amount,
                gradientStart: '#F59E0B',
                gradientEnd: '#4B5563'
            })
        })

        return { nodes, links }
    }, [selectedYear, currentProjection])

    if (!currentProjection || currentProjection.years.length === 0) {
        return (
            <div
                className="w-full lg:w-[70%] border border-black flex items-center justify-center bg-white"
                style={{ minHeight: '70vh' }}
            >
                <p className="text-2xl font-light text-gray-600 text-center">
                    Add financial items to see projections
                </p>
            </div>
        )
    }

    // Prepare data for Recharts
    const chartData = currentProjection.years.map(year => ({
        year: year.year,
        'Net Worth': year.netWorth,
        'Income': year.totalIncome,
        'Expenses': year.totalExpenses,
    }))

    // Find first year where each milestone is reached
    const milestoneYears = milestones.map(m => {
        if (m.type === 'year') {
            return { milestone: m, year: m.value }
        }
        return {
            milestone: m,
            year: currentProjection.years.find(y => y.netWorth >= m.value)?.year
        }
    }).filter(m => m.year !== undefined)

    const handleBarClick = (data: any, index: number) => {
        if (data && data.year) {
            onYearSelect(data.year)
        } else if (index !== undefined && chartData[index]) {
            onYearSelect(chartData[index].year)
        }
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const yearData = label
            const yearMilestones = milestoneYears.filter(m => m.year === yearData)
            const uniquePayload = payload.reduce((acc: any[], entry: any) => {
                if (!acc.find(item => item.dataKey === entry.dataKey)) {
                    acc.push(entry)
                }
                return acc
            }, [])

            return (
                <div className="bg-white border border-gray-200 p-3 rounded shadow-lg outline-none">
                    <p className="font-semibold mb-2">{yearData}</p>
                    {uniquePayload.map((entry: any) => (
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
                                            : formatCurrency(m.milestone.value, currency)}
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


    const SankeyTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            const isLink = data.source && data.target
            return (
                <div className="bg-white border border-gray-200 p-3 rounded shadow-lg outline-none">
                    {isLink ? (
                        <>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                                {data.source.name} → {data.target.name}
                            </p>
                            <p className="font-semibold text-blue-600">
                                {formatCurrency(data.value, currency)}
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="font-semibold mb-1">{data.name}</p>
                            <p className="text-blue-600 text-sm font-medium">
                                {formatCurrency(data.value, currency)}
                            </p>
                        </>
                    )}
                </div>
            )
        }
        return null
    }

    return (
        <div
            className="w-full lg:w-[70%] border border-black bg-white p-1 sm:p-2 outline-none focus:outline-none [&_*]:outline-none [&_*:focus]:outline-none relative"
            style={{ height: '70vh' }}
        >
            {isToggleExpanded ? (
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1 sm:gap-2 z-10 bg-white border border-black p-1">
                    <button onClick={() => handleChartTypeChange('sankey')} className={`p-1.5 sm:p-2 transition-colors ${chartType === 'sankey' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`} title="Cashflow Diagram"><SankeyIcon size={16} className="sm:w-5 sm:h-5" /></button>
                    <button onClick={() => handleChartTypeChange('bar')} className={`p-1.5 sm:p-2 transition-colors ${chartType === 'bar' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`} title="Bar Chart"><BarChart3 size={16} className="sm:w-5 sm:h-5" /></button>
                    <button onClick={() => handleChartTypeChange('line')} className={`p-1.5 sm:p-2 transition-colors ${chartType === 'line' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`} title="Line Chart"><TrendingUp size={16} className="sm:w-5 sm:h-5" /></button>
                </div>
            ) : (
                <button onClick={handleToggleExpand} className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-1 sm:p-1.5 bg-white border border-black text-black hover:bg-gray-100 transition-colors" title="Chart Options"><Settings size={14} className="sm:w-4 sm:h-4" /></button>
            )}
            <ResponsiveContainer width="100%" height="100%">
                {chartType === 'sankey' ? (
                    <Sankey
                        data={sankeyData}
                        margin={{ top: 20, right: isMobile ? 10 : 125, bottom: 20, left: isMobile ? 10 : 125 }}
                        node={({ x, y, width, height, payload }: any) => {
                            let fillColor = payload.fill
                            if (!fillColor) {
                                switch (payload.category) {
                                    case 'income': fillColor = '#10B981'; break;
                                    case 'expense': fillColor = '#EF4444'; break;
                                    case 'saving': fillColor = '#3B82F6'; break;
                                    case 'withdrawal': fillColor = '#F59E0B'; break;
                                    case 'total': fillColor = '#4B5563'; break;
                                    default: fillColor = '#8B5CF6';
                                }
                            }
                            const isSmall = height < 30
                            const label = payload.name.toUpperCase()
                            let subLabel = ''
                            let subColor = '#6B7280'
                            switch (payload.category) {
                                case 'income': subLabel = 'INCOME'; subColor = '#10B981'; break;
                                case 'expense': subLabel = 'EXPENSE'; subColor = '#EF4444'; break;
                                case 'saving': subLabel = 'INVESTMENT'; subColor = '#3B82F6'; break;
                                case 'withdrawal': subLabel = 'WITHDRAWAL'; subColor = '#F59E0B'; break;
                                case 'total': subLabel = 'BALANCE'; subColor = '#6B7280'; break;
                            }
                            const formattedValue = formatCurrency(payload.value, currency)
                            const labelWidth = (label.length * 7)
                            const subLabelWidth = (subLabel.length * 6)
                            const valueWidth = (formattedValue.length * 6)
                            const boxWidth = Math.max(labelWidth, subLabelWidth, valueWidth) + 16
                            const boxHeight = 46
                            return (
                                <g>
                                    <rect x={x} y={y} width={width} height={height} fill={fillColor} fillOpacity={1} />
                                    {/* Hide labels on mobile for cleaner view */}
                                    {!isMobile && !isSmall && (
                                        <>
                                            <rect x={x + width / 2 - boxWidth / 2} y={y + height / 2 - boxHeight / 2} width={boxWidth} height={boxHeight} fill="#FFFFFF" stroke="#E5E7EB" strokeWidth={1} />
                                            <text x={x + width / 2} y={y + height / 2 - 12} textAnchor="middle" dominantBaseline="middle" fill="#000000" fontSize={11} fontWeight="400" style={{ pointerEvents: 'none', letterSpacing: '0.5px' }}>{label}</text>
                                            <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="middle" fill={subColor} fontSize={9} fontWeight="700" style={{ pointerEvents: 'none', letterSpacing: '0.5px' }}>{subLabel}</text>
                                            <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle" dominantBaseline="middle" fill="#4B5563" fontSize={9} fontWeight="500" style={{ pointerEvents: 'none' }}>{formattedValue}</text>
                                        </>
                                    )}
                                </g>
                            )
                        }}
                        link={(props: any) => {
                            const { sourceX, sourceY, targetX, targetY, linkWidth, payload, index } = props
                            const path = `M${sourceX},${sourceY + linkWidth / 2} C${sourceX + 100},${sourceY + linkWidth / 2} ${targetX - 100},${targetY + linkWidth / 2} ${targetX},${targetY + linkWidth / 2} L${targetX},${targetY - linkWidth / 2} C${targetX - 100},${targetY - linkWidth / 2} ${sourceX + 100},${sourceY - linkWidth / 2} ${sourceX},${sourceY - linkWidth / 2} Z`
                            const gradientId = `linkGradient-${index}`
                            const sourceColor = payload.gradientStart || '#9CA3AF'
                            const targetColor = payload.gradientEnd || '#9CA3AF'
                            return (
                                <g>
                                    <defs><linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={sourceColor} stopOpacity={0.4} /><stop offset="100%" stopColor={targetColor} stopOpacity={0.4} /></linearGradient></defs>
                                    <path d={path} fill={`url(#${gradientId})`} stroke="none" fillOpacity={1} />
                                </g>
                            )
                        }}
                    ><Tooltip content={<SankeyTooltip />} /></Sankey>
                ) : chartType === 'bar' ? (
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: isMobile ? 0 : 5, bottom: 5 }}>
                        <XAxis dataKey="year" hide={true} />
                        <YAxis width={isMobile ? 40 : 60} tick={{ fontSize: isMobile ? 10 : 12 }} tickFormatter={(value) => { const currencySymbol = getCurrencySymbol(currency); const absValue = Math.abs(value); if (absValue >= 1000000) return `${currencySymbol}${(value / 1000000).toFixed(1)}M`; if (absValue >= 1000) return `${currencySymbol}${(value / 1000).toFixed(0)}k`; return `${currencySymbol}${value}`; }} stroke="#6B7280" />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="3 3" />
                        <Bar dataKey="Net Worth" fill="#3B82F6" cursor="pointer" onClick={handleBarClick} shape={(props: any) => {
                            const { x, y, width, height, payload } = props
                            const yearMilestones = milestoneYears.filter(m => m.year === payload.year)
                            return (
                                <>{/* Regular bar */}<rect x={x} y={y} width={width} height={height} fill="#3B82F6" />
                                    {yearMilestones.map((m, index) => (
                                        <g key={m.milestone.id}><rect x={x + width / 2 - 6} y={y - 25 - (index * 18)} width={12} height={12} fill={m.milestone.color || "#22C55E"} stroke={m.milestone.color ? undefined : "#16A34A"} strokeWidth={1} /><title>{m.milestone.name}: {m.milestone.type === 'year' ? m.milestone.value : formatCurrency(m.milestone.value, currency)}</title></g>
                                    ))}</>
                            )
                        }} />
                        {selectedYear && <ReferenceLine x={selectedYear} stroke="#6B7280" strokeDasharray="3 3" />}
                    </BarChart>
                ) : (
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: isMobile ? 0 : 5, bottom: 5 }} onClick={(data) => { if (data && data.activeLabel) onYearSelect(Number(data.activeLabel)) }}>
                        <defs><linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.5} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient></defs>
                        <XAxis dataKey="year" hide={true} />
                        <YAxis width={isMobile ? 40 : 60} tick={{ fontSize: isMobile ? 10 : 12 }} tickFormatter={(value) => { const currencySymbol = getCurrencySymbol(currency); const absValue = Math.abs(value); if (absValue >= 1000000) return `${currencySymbol}${(value / 1000000).toFixed(1)}M`; if (absValue >= 1000) return `${currencySymbol}${(value / 1000).toFixed(0)}k`; return `${currencySymbol}${value}`; }} stroke="#6B7280" />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="3 3" />
                        <Area type="monotone" dataKey="Net Worth" stroke="none" fill="#3B82F6" fillOpacity={0.2} />
                        <Line type="monotone" dataKey="Net Worth" stroke="#3B82F6" strokeWidth={2} dot={(props: any) => {
                            const { cx, cy, payload } = props
                            const yearMilestones = milestoneYears.filter(m => m.year === payload.year)
                            if (yearMilestones.length === 0) return <circle cx={cx} cy={cy} r={3} fill="#3B82F6" stroke="#fff" strokeWidth={1} style={{ cursor: 'pointer' }} />
                            return (
                                <g><circle cx={cx} cy={cy} r={3} fill="#3B82F6" stroke="#fff" strokeWidth={1} style={{ cursor: 'pointer' }} />
                                    {yearMilestones.map((m, index) => (
                                        <g key={m.milestone.id}><rect x={cx - 6} y={cy - 25 - (index * 18)} width={12} height={12} fill={m.milestone.color || "#22C55E"} stroke={m.milestone.color ? undefined : "#16A34A"} strokeWidth={1} /><title>{m.milestone.name}: {m.milestone.type === 'year' ? m.milestone.value : formatCurrency(m.milestone.value, currency)}</title></g>
                                    ))}</g>
                            )
                        }} activeDot={{ r: 5, cursor: 'pointer' }} />
                        {selectedYear && <ReferenceLine x={selectedYear} stroke="#6B7280" strokeDasharray="3 3" />}
                    </ComposedChart>
                )}
            </ResponsiveContainer>
        </div>
    )
}

export default GraphVisualization
