import { useProjections } from '../../hooks/useProjections'
import { usePriority } from '../Dashboard'
import { CollapsibleSection } from '../shared'

interface ProjectionDetailsProps {
    selectedYear: number | null
}

function ProjectionDetails({ selectedYear }: ProjectionDetailsProps) {
    const { surplusPriority, deficitPriority } = usePriority()
    const { projection, config } = useProjections(surplusPriority, deficitPriority)

    if (!projection || projection.years.length === 0) {
        return (
            <div
                className="w-[30%] border-2 flex items-center justify-center p-8 bg-white"
                style={{
                    borderColor: '#E9D5FF',
                    minHeight: '70vh'
                }}
            >
                <p className="text-2xl font-light text-gray-600 text-center">
                    Projection details will appear here
                </p>
            </div>
        )
    }

    // Find the selected year or default to latest
    const yearData = selectedYear
        ? projection.years.find(y => y.year === selectedYear)
        : projection.years[projection.years.length - 1]

    if (!yearData) return null

    const formatCurrency = (value: number) => `$${value.toLocaleString()}`

    return (
        <div
            className="w-[30%] border border-black flex flex-col bg-white overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
                height: '70vh'
            }}
        >
            {/* Header */}
            <div className="p-6 pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-800 mb-1">Year {yearData.year}</h2>
                <p className="text-xs text-gray-500">
                    {selectedYear ? 'Click other bars to see different years' : 'Click on the graph to select a year'}
                </p>
            </div>

            {/* Collapsible Sections */}
            <div>
                {/* Income Details */}
                <CollapsibleSection title="Income Details">
                    <div className="space-y-2">
                        <p className="text-xs text-gray-500 mb-2">Active income sources for {yearData.year}</p>
                        {yearData.totalIncome === 0 ? (
                            <p className="font-light text-gray-400">No income this year</p>
                        ) : (
                            <>
                                {yearData.history.income.map(item => (
                                    <div key={item.id} className="flex justify-between">
                                        <span className="font-light truncate mr-2">{item.name}</span>
                                        <span className="font-medium whitespace-nowrap text-green-600">{formatCurrency(item.amount)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between pt-2 border-t font-semibold">
                                    <span>Total Income:</span>
                                    <span className="text-green-600">{formatCurrency(yearData.totalIncome)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </CollapsibleSection>

                {/* Expense Details */}
                <CollapsibleSection title="Expense Details">
                    <div className="space-y-2">
                        <p className="text-xs text-gray-500 mb-2">Active expenses for {yearData.year}</p>
                        {yearData.totalExpenses === 0 ? (
                            <p className="font-light text-gray-400">No expenses this year</p>
                        ) : (
                            <>
                                {yearData.history.expenses.map(item => (
                                    <div key={item.id} className="flex justify-between">
                                        <span className="font-light truncate mr-2">{item.name}</span>
                                        <span className="font-medium whitespace-nowrap text-red-600">{formatCurrency(item.amount)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between pt-2 border-t font-semibold">
                                    <span>Total Expenses:</span>
                                    <span className="text-red-600">{formatCurrency(yearData.totalExpenses)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </CollapsibleSection>

                {/* Cashflow Allocation (Surplus/Deficit) */}
                <CollapsibleSection title="Cashflow Allocation">
                    <div className="space-y-2">
                        <p className="text-xs text-gray-500 mb-2">Surplus/Deficit handling for {yearData.year}</p>

                        {yearData.history.surplus.length === 0 && yearData.history.deficit.length === 0 ? (
                            <p className="font-light text-gray-400">No surplus or deficit this year</p>
                        ) : (
                            <>
                                {/* Surplus Allocations */}
                                {yearData.history.surplus.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-600 mb-1">Surplus Added To:</p>
                                        {yearData.history.surplus.map(item => {
                                            const asset = yearData.assets.find(a => a.id === item.assetId)
                                            return (
                                                <div key={item.assetId} className="flex justify-between text-sm">
                                                    <span className="font-light">{asset?.name || 'Unknown'}</span>
                                                    <span className="font-medium text-green-600">+{formatCurrency(item.amount)}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Deficit Withdrawals */}
                                {yearData.history.deficit.length > 0 && (
                                    <div className={yearData.history.surplus.length > 0 ? "pt-2 border-t" : ""}>
                                        <p className="text-xs font-semibold text-gray-600 mb-1">Deficit Withdrawn From:</p>
                                        {yearData.history.deficit.map(item => {
                                            const asset = yearData.assets.find(a => a.id === item.assetId)
                                            return (
                                                <div key={item.assetId} className="flex justify-between text-sm">
                                                    <span className="font-light">{asset?.name || 'Unknown'}</span>
                                                    <span className="font-medium text-red-600">-{formatCurrency(item.amount)}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Net Cashflow Summary */}
                                <div className="pt-2 border-t font-semibold">
                                    <div className="flex justify-between">
                                        <span>Net Cashflow:</span>
                                        <span className={yearData.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {formatCurrency(yearData.netCashflow)}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </CollapsibleSection>

                {/* Investment Growth */}
                <CollapsibleSection title="Investment Growth">
                    <div className="space-y-3">
                        {yearData.history.growth.length === 0 &&
                            yearData.history.yield.length === 0 &&
                            yearData.history.contributions.length === 0 ? (
                            <p className="font-light text-gray-400">No investment activity this year</p>
                        ) : (
                            <>
                                {/* Growth */}
                                {yearData.history.growth.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-600 mb-1">Asset Growth</p>
                                        {yearData.history.growth.map(item => {
                                            const asset = yearData.assets.find(a => a.id === item.assetId)
                                            return (
                                                <div key={item.assetId} className="flex justify-between text-sm">
                                                    <span className="font-light">{asset?.name || 'Unknown'}</span>
                                                    <span className="font-medium text-green-600">+{formatCurrency(item.growthAmount)}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Yield/Dividends */}
                                {yearData.history.yield.length > 0 && (
                                    <div className="pt-2 border-t">
                                        <p className="text-xs font-semibold text-gray-600 mb-1">Yield/Dividends</p>
                                        {yearData.history.yield.map(item => {
                                            const asset = yearData.assets.find(a => a.id === item.assetId)
                                            return (
                                                <div key={item.assetId} className="flex justify-between text-sm">
                                                    <span className="font-light">{asset?.name || 'Unknown'}</span>
                                                    <span className="font-medium text-green-600">+{formatCurrency(item.yieldAmount)}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Contributions */}
                                {yearData.history.contributions.length > 0 && (
                                    <div className="pt-2 border-t">
                                        <p className="text-xs font-semibold text-gray-600 mb-1">Contributions</p>
                                        {yearData.history.contributions.map(item => {
                                            const asset = yearData.assets.find(a => a.id === item.assetId)
                                            return (
                                                <div key={item.assetId} className="flex justify-between text-sm">
                                                    <span className="font-light">{asset?.name || 'Unknown'}</span>
                                                    <span className="font-medium text-blue-600">+{formatCurrency(item.amount)}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Total Investment Increase */}
                                <div className="pt-2 border-t font-semibold">
                                    <div className="flex justify-between">
                                        <span>Total Investment Increase:</span>
                                        <span className="text-green-600">
                                            +{formatCurrency(
                                                yearData.history.growth.reduce((sum, g) => sum + g.growthAmount, 0) +
                                                yearData.history.yield.reduce((sum, y) => sum + y.yieldAmount, 0) +
                                                yearData.history.contributions.reduce((sum, c) => sum + c.amount, 0)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </CollapsibleSection>

                {/* Assets */}
                <CollapsibleSection title="Assets">
                    <div className="space-y-2">
                        {yearData.assets.length === 0 ? (
                            <p className="font-light text-gray-400">No assets</p>
                        ) : (
                            <>
                                {yearData.assets.map(asset => (
                                    <div key={asset.id} className="flex justify-between">
                                        <span className="font-light truncate mr-2">{asset.name}</span>
                                        <span className="font-medium whitespace-nowrap">{formatCurrency(asset.value)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between pt-2 border-t font-semibold">
                                    <span>Total Assets:</span>
                                    <span>{formatCurrency(yearData.assets.reduce((sum, a) => sum + a.value, 0))}</span>
                                </div>
                            </>
                        )}
                    </div>
                </CollapsibleSection>

                {/* Liabilities */}
                <CollapsibleSection title="Liabilities">
                    <div className="space-y-2">
                        {yearData.liabilities.length === 0 ? (
                            <p className="font-light text-gray-400">No liabilities</p>
                        ) : (
                            <>
                                {yearData.liabilities.map(liability => (
                                    <div key={liability.id} className="flex justify-between">
                                        <span className="font-light truncate mr-2">{liability.name}</span>
                                        <span className="font-medium whitespace-nowrap text-red-600">
                                            {formatCurrency(liability.value)}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex justify-between pt-2 border-t font-semibold">
                                    <span>Total Liabilities:</span>
                                    <span className="text-red-600">
                                        {formatCurrency(yearData.liabilities.reduce((sum, l) => sum + l.value, 0))}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </CollapsibleSection>
            </div>

            {/* Net Worth - Always Visible at Bottom */}
            <div className="mt-auto p-6 bg-blue-50 border-t border-blue-200">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">Net Worth:</span>
                    <span className={`text-xl font-bold ${yearData.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(yearData.netWorth)}
                    </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Projection: {config.startYear} - {config.startYear + config.numberOfYears - 1}
                </p>
            </div>
        </div>
    )
}

export default ProjectionDetails
