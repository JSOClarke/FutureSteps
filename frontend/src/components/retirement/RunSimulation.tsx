import { useState, useEffect, useMemo } from 'react'
import { runRetirementSimulation, calculateInitialWithdrawal, type SimulationResult } from '../../utils/retirementSimulation'
import { DEFAULT_PARAMS } from '../../data/marketData'
import { formatCurrency } from '../../utils/formatters'
import { useCurrency } from '../../hooks/useCurrency'
import { usePlans } from '../../context/PlansContext'
import { useProjections } from '../../hooks/useProjections'
import { useUser } from '../../context/UserContext'
import CurrencyInput from '../shared/CurrencyInput'
import SuccessRateCard from './SuccessRateCard'
import PortfolioPathsChart from './PortfolioPathsChart'
import { SampleRunsSection } from './SampleRunsSection'
import { selectSampleRuns } from '../../utils/simulationSampling'
import { Settings, Play } from 'lucide-react'

interface RunSimulationProps {
    onBack?: () => void  // Optional, mainly used for modal close
    lockToPlan?: boolean  // If true, locks to current plan without showing mode selector
}

type PortfolioSource = 'custom' | 'plan'

function RunSimulation({ lockToPlan = false }: RunSimulationProps) {
    const currency = useCurrency()
    const { plans, activePlanId } = usePlans()
    const { userProfile } = useUser()

    // Portfolio source mode - lock to plan if specified
    const [portfolioSource, setPortfolioSource] = useState<PortfolioSource>(lockToPlan ? 'plan' : 'custom')
    const [selectedPlanId, setSelectedPlanId] = useState<string>(activePlanId || '')
    const [startAge, setStartAge] = useState<number>(65)

    // Get projection data for selected plan
    const selectedPlan = plans.find(p => p.id === selectedPlanId)
    const { projection } = useProjections(
        selectedPlan?.surplusPriority || [],
        selectedPlan?.deficitPriority || []
    )

    // Calculate net worth at specified age from projection
    const getNetWorthAtAge = (age: number): number => {
        if (!projection || !userProfile?.dateOfBirth) return 0

        const birthYear = new Date(userProfile.dateOfBirth).getFullYear()
        const targetYear = birthYear + age
        const currentYear = new Date().getFullYear()
        const yearsFromNow = targetYear - currentYear

        if (yearsFromNow < 0 || yearsFromNow >= projection.years.length) return 0

        const yearData = projection.years[yearsFromNow]
        return yearData?.netWorth || 0
    }

    // Form state
    const [initialPortfolio, setInitialPortfolio] = useState<number>(1000000)
    const [retirementYears, setRetirementYears] = useState<number>(30)
    const [stockAllocation, setStockAllocation] = useState<number>(60)
    const [withdrawalRate, setWithdrawalRate] = useState<number>(4)
    const [numberOfSimulations, setNumberOfSimulations] = useState<number>(DEFAULT_PARAMS.numberOfSimulations)
    const [dataSource, setDataSource] = useState<'monte-carlo' | 'historical'>('monte-carlo')

    // Advanced options toggle
    const [showAdvanced, setShowAdvanced] = useState(false)

    // Auto-update portfolio value when in plan mode
    useEffect(() => {
        if (portfolioSource === 'plan' && selectedPlanId && startAge) {
            const calculatedValue = getNetWorthAtAge(startAge)
            setInitialPortfolio(calculatedValue)
        }
    }, [portfolioSource, selectedPlanId, startAge, projection, userProfile])

    // Simulation state
    const [isRunning, setIsRunning] = useState(false)
    const [result, setResult] = useState<SimulationResult | null>(null)

    // Sample runs selection (memoized for performance)
    const sampleRuns = useMemo(
        () => result ? selectSampleRuns(result) : null,
        [result]
    )

    const bondAllocation = 100 - stockAllocation
    const annualWithdrawal = calculateInitialWithdrawal(initialPortfolio, withdrawalRate / 100)

    const handleRunSimulation = async () => {
        setIsRunning(true)

        // Small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 100))

        const simulationResult = runRetirementSimulation({
            initialPortfolio,
            annualWithdrawal,
            retirementYears,
            stockAllocation: stockAllocation / 100,
            bondAllocation: bondAllocation / 100,
            numberOfSimulations: numberOfSimulations,
            dataSource: dataSource,
        })

        setResult(simulationResult)
        setIsRunning(false)
    }

    const canRun = initialPortfolio > 0 && retirementYears > 0

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-light">Run Simulation</h1>
                </div>

                {/* Configuration Panel - Horizontal Layout */}
                <div className="bg-white border border-black p-6">
                    <div className="mb-6 flex justify-between items-center border-b border-gray-100 pb-2">
                        <h2 className="text-xl font-light flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Configuration
                        </h2>
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="text-sm text-gray-500 hover:text-black transition-colors"
                        >
                            {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Column 1: Source & Value */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Portfolio</h3>

                            {!lockToPlan && (
                                <div className="flex gap-4 mb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="portfolioSource"
                                            value="custom"
                                            checked={portfolioSource === 'custom'}
                                            onChange={() => setPortfolioSource('custom')}
                                            className="w-4 h-4 text-black focus:ring-black"
                                        />
                                        <span className="text-sm">Custom</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="portfolioSource"
                                            value="plan"
                                            checked={portfolioSource === 'plan'}
                                            onChange={() => setPortfolioSource('plan')}
                                            className="w-4 h-4 text-black focus:ring-black"
                                        />
                                        <span className="text-sm">From Plan</span>
                                    </label>
                                </div>
                            )}

                            {portfolioSource === 'plan' ? (
                                <div className="space-y-3">
                                    {!lockToPlan && (
                                        <select
                                            value={selectedPlanId}
                                            onChange={(e) => setSelectedPlanId(e.target.value)}
                                            className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                                        >
                                            <option value="">-- Select Plan --</option>
                                            {plans.map((plan) => (
                                                <option key={plan.id} value={plan.id}>{plan.name}</option>
                                            ))}
                                        </select>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm whitespace-nowrap">Age:</label>
                                        <input
                                            type="number"
                                            value={startAge}
                                            onChange={(e) => setStartAge(Number(e.target.value))}
                                            className="w-20 px-2 py-1 border border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                                            min="18"
                                            max="100"
                                        />
                                    </div>
                                    {selectedPlanId && (
                                        <p className="text-sm font-medium text-green-700">
                                            {formatCurrency(initialPortfolio, currency)}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <CurrencyInput
                                    label=""
                                    value={initialPortfolio.toString()}
                                    onChange={(value) => setInitialPortfolio(Number(value) || 0)}
                                    placeholder="1,000,000"
                                    allowDecimals={false}
                                />
                            )}
                        </div>

                        {/* Column 2: Time Horizon */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Duration</h3>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Retirement Years
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        value={retirementYears}
                                        onChange={(e) => setRetirementYears(Number(e.target.value))}
                                        className="flex-1 accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        min="10"
                                        max="60"
                                        step="1"
                                    />
                                    <span className="w-12 text-sm font-mono">{retirementYears}y</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Annual Withdrawal: {withdrawalRate}%
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        value={withdrawalRate}
                                        onChange={(e) => setWithdrawalRate(Number(e.target.value))}
                                        className="flex-1 accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        min="2"
                                        max="8"
                                        step="0.1"
                                    />
                                    <span className="w-12 text-sm font-mono">{withdrawalRate}%</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 font-mono">
                                    {formatCurrency(annualWithdrawal, currency)} / yr
                                </p>
                            </div>
                        </div>

                        {/* Column 3: Allocation */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Allocation</h3>
                            <div className="pt-2">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Bonds: {bondAllocation}%</span>
                                    <span>Stocks: {stockAllocation}%</span>
                                </div>
                                <input
                                    type="range"
                                    value={stockAllocation}
                                    onChange={(e) => setStockAllocation(Number(e.target.value))}
                                    className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    min="0"
                                    max="100"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>Conservative</span>
                                    <span>Aggressive</span>
                                </div>
                            </div>
                        </div>

                        {/* Column 4: Run Action */}
                        <div className="flex flex-col justify-end space-y-4">
                            <button
                                onClick={handleRunSimulation}
                                disabled={!canRun || isRunning}
                                className="w-full h-12 flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm uppercase tracking-wide font-medium shadow-md active:transform active:scale-95"
                            >
                                {isRunning ? (
                                    <span className="animate-pulse">Running...</span>
                                ) : (
                                    <>
                                        <Play size={16} fill="currentColor" />
                                        Run Simulation
                                    </>
                                )}
                            </button>
                            {!result && (
                                <p className="text-xs text-center text-gray-400">
                                    Adjust settings to see projection
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Advanced Settings Row */}
                    {showAdvanced && (
                        <div className="mt-8 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-medium uppercase text-gray-500 mb-2">
                                        Data Source
                                    </label>
                                    <select
                                        value={dataSource}
                                        onChange={(e) => setDataSource(e.target.value as 'monte-carlo' | 'historical')}
                                        className="w-full px-3 py-2 border border-gray-300 focus:border-black text-sm"
                                    >
                                        <option value="monte-carlo">Monte Carlo (Simulated)</option>
                                        <option value="historical">Historical S&P 500 (1970+)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium uppercase text-gray-500 mb-2">
                                        Simulation Count
                                    </label>
                                    <div className="flex gap-2">
                                        {[1000, 5000, 10000].map((count) => (
                                            <button
                                                key={count}
                                                type="button"
                                                onClick={() => setNumberOfSimulations(count)}
                                                className={`flex-1 py-2 text-xs border transition-colors ${numberOfSimulations === count
                                                    ? 'bg-black text-white border-black'
                                                    : 'bg-white text-black border-gray-200 hover:border-black'
                                                    }`}
                                            >
                                                {count.toLocaleString()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <p className="text-xs text-gray-400 italic">
                                        Note: Historical mode uses random sampling of real annual returns from the past 50 years to construct possible futures.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Section */}
                {result ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-1">
                                <SuccessRateCard successRate={result.successRate} />
                            </div>
                            <div className="bg-white border border-black p-4 flex flex-col justify-center">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Median Balance</p>
                                <p className="text-2xl font-light">{formatCurrency(result.medianEndingBalance, currency)}</p>
                            </div>
                            <div className="bg-white border border-black p-4 flex flex-col justify-center">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Best Case (top 5%)</p>
                                <p className="text-2xl font-light text-green-600">{formatCurrency(result.bestCaseBalance, currency)}</p>
                            </div>
                            <div className="bg-white border border-black p-4 flex flex-col justify-center">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Worst Case (bottom 5%)</p>
                                <p className="text-2xl font-light text-red-600">{formatCurrency(result.worstCaseBalance, currency)}</p>
                            </div>
                        </div>

                        {/* Chart */}
                        <PortfolioPathsChart
                            result={result}
                            retirementYears={retirementYears}
                            currency={currency}
                        />

                        {/* Sample Runs */}
                        {sampleRuns && (
                            <div className="mt-8">
                                <SampleRunsSection
                                    sampleRuns={sampleRuns}
                                    initialPortfolio={initialPortfolio}
                                />
                            </div>
                        )}

                        <p className="text-center text-xs text-gray-400 mt-4">
                            Simulation based on {result.totalPaths.toLocaleString()} runs. Past performance is not indicative of future results.
                        </p>
                    </div>
                ) : (
                    <div className="min-h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                        <div className="text-center text-gray-400">
                            <p className="text-lg font-light mb-2">Ready to Simulate</p>
                            <p className="text-sm">Configure your parameters above and press Run</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RunSimulation
