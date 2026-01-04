import { useEffect } from 'react'
import { useProjections } from '../../hooks/useProjections'
import { useFinancialItems } from '../../context/FinancialItemsContext'
import { usePriority } from '../../pages/PlansPage'
import { useUser } from '../../context/UserContext'
import { YearSelector } from '../shared'
import { Tooltip } from '../shared/Tooltip'
import { ProjectionDetailSection } from './ProjectionDetailSection'
import { formatCurrency } from '../../utils/formatters'
import { useCurrency } from '../../hooks/useCurrency'
import { useSettings } from '../../context/SettingsContext'
import { Percentage as Percent, Settings, X, TrendingUp } from '../../icons'
import { useState, useRef } from 'react'

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
    const { projection, realProjection, config } = useProjections(surplusPriority, deficitPriority)
    const { items: initialItems } = useFinancialItems()
    const { userProfile } = useUser()
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const settingsRef = useRef<HTMLDivElement>(null)

    // Close settings when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false)
            }
        }

        if (isSettingsOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isSettingsOpen])

    // Helper: Safely calculate totals with types
    const getPreviousTotal = (prevData: any) => {
        if (prevData) {
            return prevData.assets.reduce((sum: number, a: { value: number }) => sum + a.value, 0);
        }
        return initialItems.filter(i => i.category === 'assets').reduce((sum, i) => sum + i.value, 0);
    };

    const getPreviousAssetValue = (prevYearData: any, assetId: string) => {
        if (prevYearData) {
            return prevYearData.assets.find((a: any) => a.id === assetId)?.value || 0;
        }
        return initialItems.find(i => i.id === assetId)?.value || 0;
    };

    const currency = useCurrency()
    const { settings, updateSettings } = useSettings()



    // Select the source of truth based on the toggle
    const projectionData = isRealValues ? realProjection : projection

    console.log('ProjectionDetails Rendered', {
        selectedYear,
        isRealValues,
        projectionDataYears: projectionData?.years.map(y => ({ year: y.year, age: y.age })),
        allYears: projectionData?.years
    });

    // Find the selected year or default to first
    const yearData = selectedYear
        ? projectionData?.years.find(y => y.year === selectedYear)
        : projectionData?.years[0]

    console.log('ProjectionDetails YearData', yearData);

    const firstYear = projectionData?.years[0]
    const lastYear = projectionData?.years[projectionData?.years.length - 1]
    const availableYears = projectionData?.years.map(y => y.year) || []

    // Helper to format currency
    const formatValue = (amount: number) => {
        return formatCurrency(amount, currency)
    }

    // Sync default year to parent on mount if not selected
    useEffect(() => {
        if (selectedYear === null && projectionData && projectionData.years.length > 0 && onYearChange) {
            onYearChange(projectionData.years[0].year)
        }
    }, [selectedYear, projectionData, onYearChange])

    if (!projectionData || projectionData.years.length === 0) {
        return (
            <div className="w-full lg:w-[30%] border border-black flex items-center justify-center p-8 bg-white" style={{ minHeight: '70vh' }}>
                <p className="text-2xl font-light text-gray-600 text-center">Projection details will appear here</p>
            </div>
        )
    }

    if (!yearData) return null

    return (
        <div className="w-full lg:w-[30%] border border-black flex flex-col bg-white relative" style={{ height: '70vh' }}>
            <div className="border-b border-black shrink-0 relative z-10">
                <div className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex-1 flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                <label className="text-sm font-normal text-gray-600 uppercase tracking-wide">
                                    {userProfile?.dateOfBirth ? 'Age:' : 'Year:'}
                                </label>
                                {userProfile?.dateOfBirth && (
                                    <Tooltip content="Your projected age at the end of this year" />
                                )}
                            </div>
                            <YearSelector
                                selectedYear={yearData.year}
                                availableYears={availableYears}
                                onYearChange={(year) => onYearChange?.(year)}
                                className="flex-1"
                                formatLabel={(year) => {
                                    if (userProfile?.dateOfBirth) {
                                        const birthYear = new Date(userProfile.dateOfBirth).getFullYear()
                                        const age = year - birthYear
                                        return age.toString()
                                    }
                                    return year.toString()
                                }}
                            />
                        </div>

                        {/* Age Info / Date Range */}
                        {userProfile?.dateOfBirth && (
                            <div className="absolute top-1 right-12 text-[10px] text-gray-400 font-light">
                                {(() => {
                                    const birthDate = new Date(userProfile.dateOfBirth)
                                    const birthMonthName = birthDate.toLocaleString('default', { month: 'short' })
                                    // Previous month name
                                    const prevMonthDate = new Date(birthDate)
                                    prevMonthDate.setMonth(birthDate.getMonth() - 1)
                                    const endMonthName = prevMonthDate.toLocaleString('default', { month: 'short' })

                                    const startYear = yearData.year - 1
                                    const endYear = yearData.year

                                    return `${birthMonthName} ${startYear} - ${endMonthName} ${endYear}`
                                })()}
                            </div>
                        )}

                        {/* Settings Gear */}
                        <div className="relative" ref={settingsRef}>
                            <button
                                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                className={`p-1.5 rounded-full transition-colors ${isSettingsOpen ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
                            >
                                <Settings className="w-4 h-4" weight={isSettingsOpen ? "fill" : "regular"} />
                            </button>

                            {/* Settings Dropdown */}
                            {isSettingsOpen && (
                                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-black shadow-lg z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-900">Projection Settings</h3>
                                        <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-black">
                                            <X size={14} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Projection Mode */}
                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Projection Mode</label>
                                            <div className="flex bg-gray-50 p-1 border border-gray-200">
                                                <button
                                                    onClick={() => setIsRealValues(false)}
                                                    className={`flex-1 px-3 py-1.5 text-xs font-normal transition-colors ${!isRealValues ? 'bg-white text-black shadow-sm border border-gray-100' : 'text-gray-500 hover:text-black'}`}
                                                >
                                                    Nominal
                                                </button>
                                                <button
                                                    onClick={() => setIsRealValues(true)}
                                                    className={`flex-1 px-3 py-1.5 text-xs font-normal transition-colors ${isRealValues ? 'bg-white text-black shadow-sm border border-gray-100' : 'text-gray-500 hover:text-black'}`}
                                                >
                                                    Real (Inflation Adjusted)
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-gray-400 leading-tight">
                                                {isRealValues
                                                    ? "Values adjusted for purchasing power based on inflation."
                                                    : "Actual future values including inflation effects."}
                                            </p>
                                        </div>

                                        {/* Inflation Slider */}
                                        <div className="space-y-2 pt-2 border-t border-gray-50">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-1.5 text-gray-600">
                                                    <Percent className="w-3 h-3" />
                                                    <span className="text-xs font-medium uppercase tracking-wide">Inflation Rate</span>
                                                </div>
                                                <span className="text-xs font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
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
                                                className="w-full range-square"
                                            />
                                        </div>
                                        {/* Debug ROI Analysis */}
                                        <div className="space-y-2 pt-2 border-t border-gray-50">
                                            <div className="flex items-center justify-between gap-1.5 text-gray-600 mb-2">
                                                <div className="flex items-center gap-1.5">
                                                    <TrendingUp className="w-3 h-3" />
                                                    <span className="text-xs font-medium uppercase tracking-wide">Debug: Real ROI</span>
                                                </div>
                                                <span className="text-[10px] font-mono text-gray-400">
                                                    (Year Frac: {yearData.fractionOfYear?.toFixed(3) || 'N/A'})
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {yearData.assets.map(asset => {
                                                    // Find yield for this asset
                                                    const yieldItem = yearData.history.yield.find(y => y.assetId === asset.id);
                                                    const yieldAmount = yieldItem?.yieldAmount || 0;

                                                    // Reconstruct Opening Balance to avoid skew from withdrawals/contributions
                                                    // Opening = Closing - Yield - Growth - Contributions + Withdrawals (Deficit) + LiabilityPay?
                                                    // Simplified: Value is end of year state.

                                                    const growthItem = yearData.history.growth.find(g => g.assetId === asset.id);
                                                    const growthAmount = growthItem?.growthAmount || 0;

                                                    const contributionList = yearData.history.contributions.filter(c => c.assetId === asset.id);
                                                    const totalContrib = contributionList.reduce((sum, c) => sum + c.amount, 0);

                                                    const deficitList = yearData.history.deficit.filter(d => d.assetId === asset.id);
                                                    const totalDeficit = deficitList.reduce((sum, d) => sum + d.amount, 0);

                                                    const approxOpening = asset.value - yieldAmount - growthAmount - totalContrib + totalDeficit;

                                                    const roi = approxOpening > 0 ? (yieldAmount / approxOpening) * 100 : 0;

                                                    return (
                                                        <div key={asset.id} className="flex justify-between text-[10px]">
                                                            <span className="text-gray-500 truncate max-w-[120px]">{asset.name}</span>
                                                            <div className="flex gap-2">
                                                                <span className="text-gray-400">Op: {formatValue(approxOpening)}</span>
                                                                <span className="font-mono text-gray-700">{roi.toFixed(3)}%</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                        <input type="range" value={yearData.year} onChange={(e) => onYearChange?.(parseInt(e.target.value))} min={firstYear?.year || config.startYear} max={lastYear?.year || config.startYear + config.numberOfYears - 1} className="flex-1 range-square" />
                    </div>

                    {/* Conditional Inflation Slider */}
                    {false && (
                        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1 pt-1 border-t border-gray-50">
                            <div className="flex items-center gap-1 text-xs text-gray-400 font-light min-w-[80px]">
                                <Percent className="w-3 h-3" />
                                <span>Inflation</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.1"
                                value={settings.inflationRate * 100}
                                onChange={(e) => updateSettings({ inflationRate: Number(e.target.value) / 100 })}
                                className="flex-1 accent-gray-400 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer hover:accent-black transition-colors"
                            />
                            <span className="text-xs font-light text-gray-600 w-8 text-right">{(settings.inflationRate * 100).toFixed(1)}%</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-white">
                <ProjectionDetailSection
                    title="Income Details"
                    headerValue={<span className="text-green-600 font-light">{formatValue(yearData.totalIncome)}</span>}
                    emptyMessage="No active income this year"
                    accentColor={SIDEBAR_COLORS.income}
                    tooltip={isRealValues
                        ? "Purchasing power relative to today's costs. Adjusted downwards by inflation."
                        : "Actual dollars you'll receive in future bank statements."}
                    items={yearData.history.income.map(item => ({ label: item.name, value: formatValue(item.amount), colorClass: 'text-green-600' }))}
                />
                <ProjectionDetailSection
                    title="Passive Income"
                    headerValue={<span className="text-green-600 font-light">{formatValue(yearData.history.yield.reduce((sum, y) => sum + y.yieldAmount, 0))}</span>}
                    emptyMessage="No passive income this year"
                    accentColor={SIDEBAR_COLORS.passiveIncome}
                    tooltip={isRealValues
                        ? "Real purchasing power of your yield. Shows $0 if inflation outpaces your nominal returns."
                        : "Yield generated by your assets (e.g., dividends, interest)."}
                    items={yearData.history.yield.map(item => {
                        const amount = item.yieldAmount;
                        const subItems = [];

                        // Find the nominal yield value in Today's Money context
                        if (isRealValues && item.nominalYieldRealValue !== undefined && projection) {
                            // Find nominal value from original projection
                            const nominalYear = projection.years.find(y => y.year === yearData.year);
                            const nominalItem = nominalYear?.history.yield.find(y => y.assetId === item.assetId);

                            if (nominalItem && Math.abs(nominalItem.yieldAmount - amount) > 0.01) {
                                subItems.push({
                                    label: 'Nominal Value (Future $)',
                                    value: formatValue(nominalItem.yieldAmount),
                                    colorClass: 'text-gray-400'
                                });
                                subItems.push({
                                    label: 'Inflation Discount',
                                    value: `-${formatValue(nominalItem.yieldAmount - amount)}`,
                                    colorClass: 'text-red-400'
                                });
                            }
                        }

                        return {
                            label: `${yearData.assets.find(a => a.id === item.assetId)?.name || 'Unknown'} (Yield)`,
                            value: `${amount >= 0 ? '+' : ''}${formatValue(amount)}`,
                            colorClass: amount >= 0 ? 'text-green-600' : 'text-red-600',
                            subItems
                        }
                    })}
                />
                <ProjectionDetailSection
                    title="Expense Details"
                    headerValue={<span className="text-red-600 font-light">{formatValue(yearData.totalExpenses)}</span>}
                    emptyMessage="No expenses this year"
                    accentColor={SIDEBAR_COLORS.expenses}
                    tooltip={isRealValues
                        ? "Cost of future lifestyle measured in today's money."
                        : "Total amount spent on future bills and lifestyle."}
                    items={yearData.history.expenses.map(item => ({ label: item.name, value: formatValue(item.amount), colorClass: 'text-red-600' }))}
                />
                <ProjectionDetailSection
                    title="Cashflow Allocation"
                    headerValue={<span className={`font-light ${yearData.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatValue(yearData.netCashflow)}</span>}
                    emptyMessage="No contributions or allocations this year"
                    accentColor={SIDEBAR_COLORS.allocation}
                    tooltip={isRealValues
                        ? "Purchasing power being saved or withdrawn this year."
                        : "How your remaining cash is distributed to assets or utilized to cover deficits."}
                    items={[...yearData.history.contributions.map(item => ({ label: yearData.assets.find(a => a.id === item.assetId)?.name || 'Unknown', value: `+${formatValue(item.amount)}`, colorClass: 'text-blue-600' })), ...yearData.history.surplus.map(item => ({ label: `${yearData.assets.find(a => a.id === item.assetId)?.name || 'Unknown'} (Surplus)`, value: `+${formatValue(item.amount)}`, colorClass: 'text-green-600' })), ...yearData.history.deficit.map(item => ({ label: `${yearData.assets.find(a => a.id === item.assetId)?.name || 'Unknown'} (Deficit)`, value: `-${formatValue(item.amount)}`, colorClass: 'text-red-600' }))]}
                />
                <ProjectionDetailSection
                    title="Assets"
                    headerValue={<span className="font-light">{formatValue(yearData.assets.reduce((sum, a) => sum + a.value, 0))}</span>}
                    emptyMessage="No assets"
                    accentColor={SIDEBAR_COLORS.assets}
                    tooltip={isRealValues
                        ? "The current equivalent store of value for your assets."
                        : "Estimated market value of your holdings."}
                    items={yearData.assets.map(asset => {
                        return { label: asset.name, value: formatValue(asset.value) }
                    })}
                />
                <ProjectionDetailSection
                    title="Net Asset Change"
                    headerValue={<span className={`font-light ${(() => {
                        const prevYearData = projectionData?.years.find(y => y.year === (selectedYear || 0) - 1);
                        const totalCurrent = yearData.assets.reduce((sum, a) => sum + a.value, 0);
                        const totalPrevious = getPreviousTotal(prevYearData);

                        const totalChange = totalCurrent - totalPrevious;
                        return totalChange >= 0 ? 'text-green-600' : 'text-red-600';
                    })()}`}>{(() => {
                        const prevYearData = projectionData?.years.find(y => y.year === (selectedYear || 0) - 1);
                        const totalCurrent = yearData.assets.reduce((sum, a) => sum + a.value, 0);
                        const totalPrevious = getPreviousTotal(prevYearData);

                        const totalChange = totalCurrent - totalPrevious;
                        return `${totalChange >= 0 ? '+' : ''}${formatValue(totalChange)}`;
                    })()}</span>}
                    emptyMessage="No change in assets"
                    accentColor="#94A3B8"
                    tooltip={isRealValues
                        ? "Real change in asset value (Current Year Value - Previous Year Value)."
                        : "Total change in asset book value from last year."}
                    items={yearData.assets.map(asset => {
                        const prevYearData = projectionData?.years.find(y => y.year === (selectedYear || 0) - 1);
                        const prevValue = getPreviousAssetValue(prevYearData, asset.id);
                        const netChange = asset.value - prevValue;

                        return {
                            label: asset.name,
                            value: `${netChange >= 0 ? '+' : ''}${formatValue(netChange)}`,
                            colorClass: netChange >= 0 ? 'text-green-600' : 'text-red-600'
                        };
                    }).filter(item => Math.abs(parseFloat(item.value.replace(/[^0-9.-]/g, ''))) > 0.01)}
                />
                <ProjectionDetailSection
                    title="Liabilities"
                    headerValue={<span className="text-red-600 font-light">{formatValue(yearData.liabilities.reduce((sum, l) => sum + l.value, 0))}</span>}
                    emptyMessage="No liabilities"
                    accentColor={SIDEBAR_COLORS.liabilities}
                    tooltip={isRealValues
                        ? "Real burden of debt in today's currency."
                        : "Total amount owed on future balances."}
                    items={yearData.liabilities.map(liability => ({ label: liability.name, value: formatValue(liability.value), colorClass: 'text-red-600' }))}
                />
                <ProjectionDetailSection
                    title="Asset Real Returns"
                    headerValue={<span className={`font-light ${(() => { const total = yearData.history.growth.reduce((sum, item) => sum + item.growthAmount, 0) + yearData.history.yield.reduce((sum, item) => sum + item.yieldAmount, 0); return total >= 0 ? 'text-green-600' : 'text-red-600' })()}`}>{(() => { const total = yearData.history.growth.reduce((sum, item) => sum + item.growthAmount, 0) + yearData.history.yield.reduce((sum, item) => sum + item.yieldAmount, 0); return `${total >= 0 ? '+' : ''}${formatValue(total)}` })()}</span>}
                    emptyMessage="No capital appreciation or yield this year"
                    accentColor={SIDEBAR_COLORS.growth}
                    tooltip={isRealValues
                        ? "Total real return (Growth + Yield - Inflation). Negative means the asset's total performance didn't keep pace with rising prices."
                        : "Total nominal return (Growth + Yield) from your assets."}
                    items={yearData.history.growth.map(item => {
                        const amount = item.growthAmount;
                        const subItems = [];

                        // Find yield for this asset
                        const yieldItem = yearData.history.yield.find(y => y.assetId === item.assetId);

                        if (isRealValues && item.nominalGrowthRealValue !== undefined && item.inflationImpact !== undefined) {
                            subItems.push({
                                label: 'Market Gains (Real)',
                                value: `${item.nominalGrowthRealValue >= 0 ? '+' : ''}${formatValue(item.nominalGrowthRealValue)}`,
                                colorClass: item.nominalGrowthRealValue >= 0 ? 'text-green-600' : 'text-red-600'
                            });

                            if (yieldItem && Math.abs(yieldItem.yieldAmount) > 0.01) {
                                subItems.push({
                                    label: 'Yield (Real)',
                                    value: `+${formatValue(yieldItem.yieldAmount)}`,
                                    colorClass: 'text-green-600'
                                });
                            }

                            subItems.push({
                                label: 'Inflation Impact (Principal)',
                                value: formatValue(item.inflationImpact),
                                colorClass: 'text-red-500'
                            });
                        }

                        // Total Real Return for this asset
                        const totalAssetReturn = amount + (yieldItem?.yieldAmount || 0);

                        return {
                            label: yearData.assets.find(a => a.id === item.assetId)?.name || 'Unknown',
                            value: `${totalAssetReturn >= 0 ? '+' : ''}${formatValue(totalAssetReturn)}`,
                            colorClass: totalAssetReturn >= 0 ? 'text-green-600' : 'text-red-600',
                            subItems
                        }
                    })}
                />
            </div>

            <div className="mt-auto p-4 gradient-subtle border-t border-black">
                <div className="flex justify-between items-center text-sm font-semibold text-black uppercase tracking-wide"><span>Net Worth:</span><span>{formatValue(yearData.netWorth)}</span></div>
                <div className="flex justify-end items-center mt-2 text-xs text-gray-500 font-light italic">{isRealValues && <span>Inflation Adjusted ({yearData.year})</span>}</div>
            </div>
        </div>
    )
}

export default ProjectionDetails
