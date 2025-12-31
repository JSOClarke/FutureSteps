import { useState, useEffect } from 'react'
import { useProjections } from '../../hooks/useProjections'
import { usePriority } from '../../pages/PlansPage'
import { CollapsibleSection, YearSelector } from '../shared'
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
                <CollapsibleSection
                    title="Income Details"
                    rightContent={<span className="text-green-600 font-light">{formatAdjusted(yearData.totalIncome, yearData.year)}</span>}
                >
                    <div className="space-y-1">

                        {yearData.totalIncome === 0 ? (
                            <p className="font-light text-gray-400">No active income this year</p>
                        ) : (
                            <>
                                {yearData.history.income.map(item => (
                                    <div key={item.id} className="flex justify-between hover:bg-gray-50 transition-colors px-2 py-0.5 -mx-2">
                                        <span className="font-light truncate mr-2">{item.name}</span>
                                        <span className="font-medium whitespace-nowrap text-green-600">{formatAdjusted(item.amount, yearData.year)}</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </CollapsibleSection>

                {/* 2. Passive Income (Yield/Dividends) */}
                <CollapsibleSection
                    title="Passive Income"
                    rightContent={
                        <span className="text-green-600 font-light">
                            {formatAdjusted(yearData.history.yield.reduce((sum, y) => sum + y.yieldAmount, 0), yearData.year)}
                        </span>
                    }
                >
                    <div className="space-y-1">
                        {yearData.history.yield.length === 0 ? (
                            <p className="font-light text-gray-400">No passive income this year</p>
                        ) : (
                            <>
                                {yearData.history.yield.map(item => {
                                    const asset = yearData.assets.find(a => a.id === item.assetId)
                                    return (
                                        <div key={item.assetId} className="flex justify-between text-sm py-0.5">
                                            <span className="font-light">{asset?.name || 'Unknown'} (Yield)</span>
                                            <span className="font-medium text-green-600">+{formatAdjusted(item.yieldAmount, yearData.year)}</span>
                                        </div>
                                    )
                                })}
                            </>
                        )}
                    </div>
                </CollapsibleSection>

                {/* 3. Expense Details */}
                <CollapsibleSection
                    title="Expense Details"
                    rightContent={<span className="text-red-600 font-light">{formatAdjusted(yearData.totalExpenses, yearData.year)}</span>}
                >
                    <div className="space-y-1">

                        {yearData.totalExpenses === 0 ? (
                            <p className="font-light text-gray-400">No expenses this year</p>
                        ) : (
                            <>
                                {yearData.history.expenses.map(item => (
                                    <div key={item.id} className="flex justify-between hover:bg-gray-50 transition-colors px-2 py-0.5 -mx-2">
                                        <span className="font-light truncate mr-2">{item.name}</span>
                                        <span className="font-medium whitespace-nowrap text-red-600">{formatAdjusted(item.amount, yearData.year)}</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </CollapsibleSection>

                {/* 4. Cashflow Allocation (Surplus/Deficit) */}
                <CollapsibleSection
                    title="Cashflow Allocation"
                    rightContent={
                        <span className={`font-light ${yearData.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatAdjusted(yearData.netCashflow, yearData.year)}
                        </span>
                    }
                >
                    <div className="space-y-1">
                        {yearData.history.surplus.length === 0 && yearData.history.deficit.length === 0 && yearData.history.contributions.length === 0 ? (
                            <p className="font-light text-gray-400">No contributions or allocations this year</p>
                        ) : (
                            <>
                                {/* Standard Contributions */}
                                {yearData.history.contributions.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-600 mb-0.5">Scheduled Contributions</p>
                                        {yearData.history.contributions.map(item => {
                                            const asset = yearData.assets.find(a => a.id === item.assetId)
                                            return (
                                                <div key={item.assetId} className="flex justify-between text-sm py-0.5">
                                                    <span className="font-light">{asset?.name || 'Unknown'}</span>
                                                    <span className="font-medium text-blue-600">+{formatAdjusted(item.amount, yearData.year)}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Surplus Allocations */}
                                {yearData.history.surplus.length > 0 && (
                                    <div className={yearData.history.contributions.length > 0 ? "pt-1 border-t" : ""}>
                                        <p className="text-xs font-semibold text-gray-600 mb-0.5">Surplus Added To:</p>
                                        {yearData.history.surplus.map(item => {
                                            const asset = yearData.assets.find(a => a.id === item.assetId)
                                            return (
                                                <div key={item.assetId} className="flex justify-between text-sm py-0.5">
                                                    <span className="font-light">{asset?.name || 'Unknown'}</span>
                                                    <span className="font-medium text-green-600">+{formatAdjusted(item.amount, yearData.year)}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Deficit Withdrawals */}
                                {yearData.history.deficit.length > 0 && (
                                    <div className={yearData.history.surplus.length > 0 ? "pt-1 border-t" : ""}>
                                        <p className="text-xs font-semibold text-gray-600 mb-0.5">Deficit Withdrawn From:</p>
                                        {yearData.history.deficit.map(item => {
                                            const asset = yearData.assets.find(a => a.id === item.assetId)
                                            return (
                                                <div key={item.assetId} className="flex justify-between text-sm py-0.5">
                                                    <span className="font-light">{asset?.name || 'Unknown'}</span>
                                                    <span className="font-medium text-red-600">-{formatAdjusted(item.amount, yearData.year)}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                            </>
                        )}
                    </div>
                </CollapsibleSection>

                {/* 5. Assets */}
                <CollapsibleSection
                    title="Assets"
                    rightContent={
                        <span className="font-light">
                            {formatAdjusted(yearData.assets.reduce((sum, a) => sum + a.value, 0), yearData.year)}
                        </span>
                    }
                >
                    <div className="space-y-1">
                        {yearData.assets.length === 0 ? (
                            <p className="font-light text-gray-400">No assets</p>
                        ) : (
                            <>
                                {yearData.assets.map(asset => {
                                    // Find all changes for this asset
                                    const growth = yearData.history.growth.find(g => g.assetId === asset.id)
                                    const contribution = yearData.history.contributions.find(c => c.assetId === asset.id)
                                    const surplus = yearData.history.surplus.find(s => s.assetId === asset.id)
                                    const totalChange = (growth?.growthAmount || 0) + (contribution?.amount || 0) + (surplus?.amount || 0)

                                    return (
                                        <div key={asset.id} className="mb-2">
                                            <div className="flex justify-between py-0.5">
                                                <span className="font-light truncate mr-2">{asset.name}</span>
                                                <span className="font-medium whitespace-nowrap">{formatAdjusted(asset.value, yearData.year)}</span>
                                            </div>
                                            {/* Show breakdown if there were any changes */}
                                            {totalChange > 0 && (
                                                <div className="ml-4 space-y-0.5 text-xs text-gray-500">
                                                    {growth && growth.growthAmount > 0 && (
                                                        <div className="flex justify-between">
                                                            <span className="font-light">↳ Growth:</span>
                                                            <span>+{formatAdjusted(growth.growthAmount, yearData.year)}</span>
                                                        </div>
                                                    )}
                                                    {contribution && contribution.amount > 0 && (
                                                        <div className="flex justify-between">
                                                            <span className="font-light">↳ Contributions:</span>
                                                            <span>+{formatAdjusted(contribution.amount, yearData.year)}</span>
                                                        </div>
                                                    )}
                                                    {surplus && surplus.amount > 0 && (
                                                        <div className="flex justify-between">
                                                            <span className="font-light">↳ Surplus:</span>
                                                            <span>+{formatAdjusted(surplus.amount, yearData.year)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </>
                        )}
                    </div>
                </CollapsibleSection>

                {/* 6. Liabilities */}
                <CollapsibleSection
                    title="Liabilities"
                    rightContent={
                        <span className="text-red-600 font-light">
                            {formatAdjusted(yearData.liabilities.reduce((sum, l) => sum + l.value, 0), yearData.year)}
                        </span>
                    }
                >
                    <div className="space-y-1">
                        {yearData.liabilities.length === 0 ? (
                            <p className="font-light text-gray-400">No liabilities</p>
                        ) : (
                            <>
                                {yearData.liabilities.map(liability => (
                                    <div key={liability.id} className="flex justify-between py-0.5">
                                        <span className="font-light truncate mr-2">{liability.name}</span>
                                        <span className="font-medium whitespace-nowrap text-red-600">
                                            {formatAdjusted(liability.value, yearData.year)}
                                        </span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </CollapsibleSection>

                {/* 7. Investment Growth (Appreciation only) */}
                <CollapsibleSection
                    title="Investment Growth"
                    rightContent={
                        <span className="text-green-600 font-light">
                            +{formatAdjusted(
                                yearData.history.growth.reduce((sum, g) => sum + g.growthAmount, 0), // Growth only
                                yearData.year
                            )}
                        </span>
                    }
                >
                    <div className="space-y-1">
                        {yearData.history.growth.length === 0 && yearData.history.contributions.length === 0 ? (
                            <p className="font-light text-gray-400">No capital appreciation this year</p>
                        ) : (
                            <>
                                {/* Appreciation/Growth */}
                                {yearData.history.growth.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-600 mb-0.5">Capital Appreciation</p>
                                        {yearData.history.growth.map(item => {
                                            const asset = yearData.assets.find(a => a.id === item.assetId)
                                            return (
                                                <div key={item.assetId} className="flex justify-between text-sm py-0.5">
                                                    <span className="font-light">{asset?.name || 'Unknown'}</span>
                                                    <span className="font-medium text-green-600">+{formatAdjusted(item.growthAmount, yearData.year)}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}



                            </>
                        )}
                    </div>
                </CollapsibleSection>
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
