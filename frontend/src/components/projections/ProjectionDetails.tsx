import { useState, useEffect } from 'react'
import { useProjections } from '../../hooks/useProjections'
import { usePriority } from '../../pages/PlansPage'
import { YearSelector } from '../shared'
import { ProjectionDetailSection } from './ProjectionDetailSection'
import { formatCurrency } from '../../utils/formatters'
import { useCurrency } from '../../hooks/useCurrency'
import { useSettings } from '../../context/SettingsContext'
import { Settings, ChevronDown, ChevronRight, Percentage as Percent } from '../../icons'

interface ProjectionDetailsProps {
    selectedYear: number | null
    onYearChange?: (year: number) => void
    isRealValues: boolean
    onToggleRealValues: (isReal: boolean) => void
}

const SIDEBAR_COLORS = {
    income: '#FBCFE8',
    passiveIncome: '#BBF7D0',
    expenses: '#FECACA',
    allocation: '#FED7AA',
    assets: '#BFDBFE',
    liabilities: '#E9D5FF',
    growth: '#FEF08A'
}

function ProjectionDetails({ selectedYear, onYearChange, isRealValues, onToggleRealValues: setIsRealValues }: ProjectionDetailsProps) {
    const { surplusPriority, deficitPriority } = usePriority()

    const { projection, config } = useProjections(surplusPriority, deficitPriority)
    const currency = useCurrency()
    const { settings, updateSettings } = useSettings()

    const [isSettingsExpanded, setIsSettingsExpanded] = useState(false)

    // Calculate inflation adjustment factor
    const getAdjustmentFactor = (year: number) => {
        if (!isRealValues) return 1
        const currentYear = new Date().getFullYear()
        const yearsFromNow = Math.max(0, year - currentYear)
        return Math.pow(1 + settings.inflationRate, yearsFromNow)
    }

    // Helper to adjust and format currency
    const formatAdjusted = (amount: number, year: number) => {
        const factor = getAdjustmentFactor(year)
        const adjustedAmount = amount / factor
        return formatCurrency(adjustedAmount, currency)
    }

    // Sync default year to parent on mount if not selected
    useEffect(() => {
        if (selectedYear === null && projection && projection.years.length > 0 && onYearChange) {
            onYearChange(projection.years[0].year)
        }
    }, [selectedYear, projection, onYearChange])

    if (!projection || projection.years.length === 0) {
        return (
            <div
                className="w-full lg:w-[30%] border border-black flex items-center justify-center p-8 bg-white"
                style={{
                    minHeight: '70vh'
                }}
            >
                <p className="text-2xl font-light text-gray-600 text-center">
                    Projection details will appear here
                </p>
            </div>
        )
    }



    // Find the selected year or default to first
    const yearData = selectedYear
        ? projection.years.find(y => y.year === selectedYear)
        : projection.years[0]

    if (!yearData) return null

    const availableYears = projection.years.map(y => y.year)

    return (
        <div
            className="w-full lg:w-[30%] border border-black flex flex-col bg-white overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
                height: '70vh'
            }}
        >
            {/* Header */}
            <div className="border-b border-black">
                {/* Year Selection - Always Visible */}
                <div className="p-4 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                        <label className="text-sm font-normal text-gray-600 uppercase tracking-wide">Year:</label>
                        <YearSelector
                            selectedYear={yearData.year}
                            availableYears={availableYears}
                            onYearChange={(year) => onYearChange?.(year)}
                            className="flex-1"
                        />
                        <span className="text-[10px] text-gray-400 font-light ml-1 text-nowrap">(End of Year)</span>
                    </div>
                    <input
                        type="range"
                        value={yearData.year}
                        onChange={(e) => onYearChange?.(parseInt(e.target.value))}
                        min={projection.years[0]?.year || config.startYear}
                        max={projection.years[projection.years.length - 1]?.year || config.startYear + config.numberOfYears - 1}
                        className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Collapsible Display Settings */}
                <div className="border-t border-gray-100">
                    <button
                        onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                        className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors group"
                    >
                        <div className="flex items-center gap-2 text-gray-600 group-hover:text-black transition-colors">
                            <Settings className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wide">
                                {isRealValues ? "Today's Money" : "Nominal"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            {isRealValues && <span>{(settings.inflationRate * 100).toFixed(1)}% Infl.</span>}
                            {isSettingsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                    </button>

                    {isSettingsExpanded && (
                        <div className="px-4 pb-2 pt-2 space-y-2 animate-in fade-in slide-in-from-top-1 bg-gray-50 border-t border-gray-100 dark:bg-gray-50">
                            {/* Toggle */}
                            <div className="flex bg-white border border-gray-200 rounded p-0.5">
                                <button
                                    onClick={() => setIsRealValues(false)}
                                    className={`flex-1 py-0.5 text-[10px] font-medium rounded transition-colors ${!isRealValues ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-black'}`}
                                >
                                    Nominal
                                </button>
                                <button
                                    onClick={() => setIsRealValues(true)}
                                    className={`flex-1 py-0.5 text-[10px] font-medium rounded transition-colors ${isRealValues ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-black'}`}
                                >
                                    Today's Money
                                </button>
                            </div>

                            {/* Inflation Slider */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px] text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Percent className="w-3 h-3" />
                                        <span>Inflation Rate</span>
                                    </div>
                                    <span className="font-mono bg-white px-1.5 py-0 rounded border border-gray-200">
                                        {(settings.inflationRate * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={settings.inflationRate * 100}
                                    onChange={(e) => updateSettings({ inflationRate: Number(e.target.value) / 100 })}
                                    className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-[9px] text-gray-400 font-light">
                                    <span>0%</span>
                                    <span>5%</span>
                                    <span>10%</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Collapsible Sections */}
            <div>
                {/* 1. Income Details (Active Only) */}
                <ProjectionDetailSection
                    title="Income Details"
                    headerValue={<span className="text-green-600 font-light">{formatAdjusted(yearData.totalIncome, yearData.year)}</span>}
                    emptyMessage="No active income this year"
                    accentColor={SIDEBAR_COLORS.income}
                    items={yearData.history.income.map(item => ({
                        label: item.name,
                        value: formatAdjusted(item.amount, yearData.year),
                        colorClass: 'text-green-600'
                    }))}
                />

                {/* 2. Passive Income (Yield/Dividends) */}
                <ProjectionDetailSection
                    title="Passive Income"
                    headerValue={
                        <span className="text-green-600 font-light">
                            {formatAdjusted(yearData.history.yield.reduce((sum, y) => sum + y.yieldAmount, 0), yearData.year)}
                        </span>
                    }
                    emptyMessage="No passive income this year"
                    accentColor={SIDEBAR_COLORS.passiveIncome}
                    items={yearData.history.yield.map(item => {
                        const asset = yearData.assets.find(a => a.id === item.assetId)
                        return {
                            label: `${asset?.name || 'Unknown'} (Yield)`,
                            value: `+${formatAdjusted(item.yieldAmount, yearData.year)}`,
                            colorClass: 'text-green-600'
                        }
                    })}
                />

                {/* 3. Expense Details */}
                <ProjectionDetailSection
                    title="Expense Details"
                    headerValue={<span className="text-red-600 font-light">{formatAdjusted(yearData.totalExpenses, yearData.year)}</span>}
                    emptyMessage="No expenses this year"
                    accentColor={SIDEBAR_COLORS.expenses}
                    items={yearData.history.expenses.map(item => ({
                        label: item.name,
                        value: formatAdjusted(item.amount, yearData.year),
                        colorClass: 'text-red-600'
                    }))}
                />

                {/* 4. Cashflow Allocation (Surplus/Deficit) */}
                <ProjectionDetailSection
                    title="Cashflow Allocation"
                    headerValue={
                        <span className={`font-light ${yearData.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatAdjusted(yearData.netCashflow, yearData.year)}
                        </span>
                    }
                    emptyMessage="No contributions or allocations this year"
                    accentColor={SIDEBAR_COLORS.allocation}
                    items={[
                        ...yearData.history.contributions.map(item => {
                            const asset = yearData.assets.find(a => a.id === item.assetId)
                            return {
                                label: asset?.name || 'Unknown',
                                value: `+${formatAdjusted(item.amount, yearData.year)}`,
                                colorClass: 'text-blue-600'
                            }
                        }),
                        ...yearData.history.surplus.map(item => {
                            const asset = yearData.assets.find(a => a.id === item.assetId)
                            return {
                                label: `${asset?.name || 'Unknown'} (Surplus)`,
                                value: `+${formatAdjusted(item.amount, yearData.year)}`,
                                colorClass: 'text-green-600'
                            }
                        }),
                        ...yearData.history.deficit.map(item => {
                            const asset = yearData.assets.find(a => a.id === item.assetId)
                            return {
                                label: `${asset?.name || 'Unknown'} (Deficit)`,
                                value: `-${formatAdjusted(item.amount, yearData.year)}`,
                                colorClass: 'text-red-600'
                            }
                        })
                    ]}
                />

                {/* 5. Assets */}
                <ProjectionDetailSection
                    title="Assets"
                    headerValue={
                        <span className="font-light">
                            {formatAdjusted(yearData.assets.reduce((sum, a) => sum + a.value, 0), yearData.year)}
                        </span>
                    }
                    emptyMessage="No assets"
                    accentColor={SIDEBAR_COLORS.assets}
                    items={yearData.assets.map(asset => {
                        const growth = yearData.history.growth.find(g => g.assetId === asset.id)
                        const contribution = yearData.history.contributions.find(c => c.assetId === asset.id)
                        const surplus = yearData.history.surplus.find(s => s.assetId === asset.id)

                        const subItems = []
                        if (growth && growth.growthAmount > 0) subItems.push({ label: 'Growth', value: `+${formatAdjusted(growth.growthAmount, yearData.year)}` })
                        if (contribution && contribution.amount > 0) subItems.push({ label: 'Contributions', value: `+${formatAdjusted(contribution.amount, yearData.year)}` })
                        if (surplus && surplus.amount > 0) subItems.push({ label: 'Surplus', value: `+${formatAdjusted(surplus.amount, yearData.year)}` })

                        return {
                            label: asset.name,
                            value: formatAdjusted(asset.value, yearData.year),
                            subItems
                        }
                    })}
                />

                {/* 6. Liabilities */}
                <ProjectionDetailSection
                    title="Liabilities"
                    headerValue={
                        <span className="text-red-600 font-light">
                            {formatAdjusted(yearData.liabilities.reduce((sum, l) => sum + l.value, 0), yearData.year)}
                        </span>
                    }
                    emptyMessage="No liabilities"
                    accentColor={SIDEBAR_COLORS.liabilities}
                    items={yearData.liabilities.map(liability => ({
                        label: liability.name,
                        value: formatAdjusted(liability.value, yearData.year),
                        colorClass: 'text-red-600'
                    }))}
                />

                {/* 7. Investment Growth (Appreciation only) */}
                <ProjectionDetailSection
                    title="Investment Growth"
                    headerValue={
                        <span className="text-green-600 font-light">
                            +{formatAdjusted(
                                yearData.history.growth.reduce((sum, g) => sum + g.growthAmount, 0),
                                yearData.year
                            )}
                        </span>
                    }
                    emptyMessage="No capital appreciation this year"
                    accentColor={SIDEBAR_COLORS.growth}
                    items={yearData.history.growth.map(item => {
                        const asset = yearData.assets.find(a => a.id === item.assetId)
                        return {
                            label: asset?.name || 'Unknown',
                            value: `+${formatAdjusted(item.growthAmount, yearData.year)}`,
                            colorClass: 'text-green-600'
                        }
                    })}
                />
            </div>

            {/* Net Worth - Always Visible at Bottom */}
            <div className="mt-auto p-4 bg-gray-50 border-t border-black">
                <div className="flex justify-between items-center">
                    <span className="font-normal text-black uppercase tracking-wide text-sm">Net Worth:</span>
                    <span className={`text-xl font-normal ${yearData.netWorth >= 0 ? 'text-black' : 'text-black'}`}>
                        {formatAdjusted(yearData.netWorth, yearData.year)}
                    </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500 font-light">
                        Projection: {config.startYear} - {config.startYear + config.numberOfYears - 1}
                    </p>
                    {isRealValues && (
                        <p className="text-xs text-gray-500 italic">
                            Inflation Adjusted ({yearData.year})
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProjectionDetails
