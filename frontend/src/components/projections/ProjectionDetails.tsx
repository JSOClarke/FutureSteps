import { useEffect } from 'react'
import { useProjections } from '../../hooks/useProjections'
import { useFinancialItems } from '../../context/FinancialItemsContext'
import { usePriority } from '../../pages/PlansPage'
import { YearSelector } from '../shared'
import { ProjectionDetailSection } from './ProjectionDetailSection'
import { formatCurrency } from '../../utils/formatters'
import { useCurrency } from '../../hooks/useCurrency'
import { useSettings } from '../../context/SettingsContext'
import { Percentage as Percent } from '../../icons'

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

    // Find the selected year or default to first
    const yearData = selectedYear
        ? projectionData?.years.find(y => y.year === selectedYear)
        : projectionData?.years[0]

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
        <div className="w-full lg:w-[30%] border border-black flex flex-col bg-white overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ height: '70vh' }}>
            <div className="border-b border-black">
                <div className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-normal text-gray-600 uppercase tracking-wide">Year:</label>
                            <YearSelector selectedYear={yearData.year} availableYears={availableYears} onYearChange={(year) => onYearChange?.(year)} className="flex-1" />
                        </div>

                        {/* Compact Toggle */}
                        <div className="flex bg-gray-100 rounded p-0.5 border border-gray-200">
                            <button onClick={() => setIsRealValues(false)} className={`px-2 py-0.5 text-xs font-normal rounded transition-colors ${!isRealValues ? 'bg-white text-black shadow-sm border border-gray-100' : 'text-gray-500 hover:text-black'}`}>Nominal</button>
                            <button onClick={() => setIsRealValues(true)} className={`px-2 py-0.5 text-xs font-normal rounded transition-colors ${isRealValues ? 'bg-white text-black shadow-sm border border-gray-100' : 'text-gray-500 hover:text-black'}`}>Real</button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                        <input type="range" value={yearData.year} onChange={(e) => onYearChange?.(parseInt(e.target.value))} min={firstYear?.year || config.startYear} max={lastYear?.year || config.startYear + config.numberOfYears - 1} className="flex-1 accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        <span className="text-xs text-gray-400 font-light ml-1 text-nowrap w-24 text-right">(End of Year)</span>
                    </div>

                    {/* Conditional Inflation Slider */}
                    {isRealValues && (
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

            <div>
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

            <div className="mt-auto p-4 bg-gray-50 border-t border-black">
                <div className="flex justify-between items-center text-sm font-semibold text-black uppercase tracking-wide"><span>Net Worth:</span><span>{formatValue(yearData.netWorth)}</span></div>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500 font-light italic"><span>Projection: {config.startYear} - {config.startYear + config.numberOfYears - 1}</span>{isRealValues && <span>Inflation Adjusted ({yearData.year})</span>}</div>
            </div>
        </div>
    )
}

export default ProjectionDetails
