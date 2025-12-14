import { useState, useEffect } from 'react'
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
    const [simulationTechnique, setSimulationTechnique] = useState<string>('monte-carlo')
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
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-light mb-6">Run Simulation</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Configuration Panel - Left */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-black p-6">
                            <h2 className="text-xl font-light mb-6">Parameters</h2>

                            <div className="space-y-6">
                                {/* Mode Selection - Hide when locked to plan */}
                                {!lockToPlan && (
                                    <div>
                                        <label className="block text-sm font-normal mb-3">Portfolio Value Source</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="portfolioSource"
                                                    value="custom"
                                                    checked={portfolioSource === 'custom'}
                                                    onChange={() => setPortfolioSource('custom')}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm">Custom Value</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="portfolioSource"
                                                    value="plan"
                                                    checked={portfolioSource === 'plan'}
                                                    onChange={() => setPortfolioSource('plan')}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm">Use Plan Data</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Plan Selection - Show when in plan mode, hide dropdown when locked */}
                                {portfolioSource === 'plan' && (
                                    <>
                                        {!lockToPlan && (
                                            <div>
                                                <label className="block text-sm font-normal mb-2">
                                                    Select Plan
                                                </label>
                                                <select
                                                    value={selectedPlanId}
                                                    onChange={(e) => setSelectedPlanId(e.target.value)}
                                                    className="w-full px-4 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
                                                >
                                                    <option value="">-- Select a Plan --</option>
                                                    {plans.map((plan) => (
                                                        <option key={plan.id} value={plan.id}>
                                                            {plan.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-normal mb-2">
                                                Starting Age
                                            </label>
                                            <input
                                                type="number"
                                                value={startAge}
                                                onChange={(e) => setStartAge(Number(e.target.value))}
                                                className="w-full px-4 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
                                                min="18"
                                                max="100"
                                            />
                                            <p className="text-xs text-gray-600 mt-1">
                                                Age when retirement begins
                                            </p>
                                        </div>

                                        {selectedPlanId && (
                                            <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-medium">Calculated Portfolio at Age {startAge}:</span><br />
                                                    <span className="text-lg font-light">{formatCurrency(initialPortfolio, currency)}</span>
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Portfolio Value - Show when in custom mode */}
                                {portfolioSource === 'custom' && (
                                    <div>
                                        <CurrencyInput
                                            label="Starting Portfolio Value"
                                            value={initialPortfolio.toString()}
                                            onChange={(value) => setInitialPortfolio(Number(value) || 0)}
                                            placeholder="1,000,000"
                                            allowDecimals={false}
                                        />
                                        <p className="text-xs text-gray-600 mt-1">
                                            Total portfolio value at retirement
                                        </p>
                                    </div>
                                )}

                                {/* Retirement Years */}
                                <div>
                                    <label className="block text-sm font-normal mb-2">
                                        Years in Retirement
                                    </label>
                                    <input
                                        type="number"
                                        value={retirementYears}
                                        onChange={(e) => setRetirementYears(Number(e.target.value))}
                                        className="w-full px-4 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
                                        min="1"
                                        max="50"
                                    />
                                    <p className="text-xs text-gray-600 mt-1">
                                        Expected lifespan after retirement
                                    </p>
                                </div>

                                {/* Stock Allocation */}
                                <div>
                                    <label className="block text-sm font-normal mb-2">
                                        Stock Allocation: {stockAllocation}%
                                    </label>
                                    <input
                                        type="range"
                                        value={stockAllocation}
                                        onChange={(e) => setStockAllocation(Number(e.target.value))}
                                        className="w-full"
                                        min="0"
                                        max="100"
                                    />
                                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                                        <span>100% Bonds</span>
                                        <span>100% Stocks</span>
                                    </div>
                                </div>

                                {/* Withdrawal Rate */}
                                <div>
                                    <label className="block text-sm font-normal mb-2">
                                        Withdrawal Rate: {withdrawalRate}%
                                    </label>
                                    <input
                                        type="range"
                                        value={withdrawalRate}
                                        onChange={(e) => setWithdrawalRate(Number(e.target.value))}
                                        className="w-full"
                                        min="2"
                                        max="6"
                                        step="0.5"
                                    />
                                    <p className="text-xs text-gray-600 mt-1">
                                        Initial withdrawal: {formatCurrency(annualWithdrawal, currency)}
                                    </p>
                                </div>

                                {/* Advanced Options - Collapsible */}
                                <div className="border-t border-gray-200 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="flex items-center justify-between w-full text-sm font-medium hover:text-gray-700 transition-colors"
                                    >
                                        <span>Advanced Options</span>
                                        <span className="text-gray-400">{showAdvanced ? '−' : '+'}</span>
                                    </button>

                                    {showAdvanced && (
                                        <div className="mt-4 space-y-4 pl-2 border-l-2 border-gray-200">
                                            {/* Data Source */}
                                            <div>
                                                <label className="block text-sm font-normal mb-2">
                                                    Market Data Source
                                                </label>
                                                <select
                                                    value={dataSource}
                                                    onChange={(e) => setDataSource(e.target.value as 'monte-carlo' | 'historical')}
                                                    className="w-full px-4 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
                                                >
                                                    <option value="monte-carlo">Simulated Returns (Monte Carlo)</option>
                                                    <option value="historical">Historical Data (S&P 500, 1970-2024)</option>
                                                </select>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {dataSource === 'historical'
                                                        ? 'Uses actual market returns from random historical years'
                                                        : 'Generates random returns based on statistical averages'}
                                                </p>
                                            </div>

                                            {/* Simulation Technique */}
                                            <div>
                                                <label className="block text-sm font-normal mb-2">
                                                    Simulation Technique
                                                </label>
                                                <select
                                                    value={simulationTechnique}
                                                    onChange={(e) => setSimulationTechnique(e.target.value)}
                                                    className="w-full px-4 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
                                                >
                                                    <option value="monte-carlo">Monte Carlo</option>
                                                    <option value="historical" disabled>Historical Simulation (Coming Soon)</option>
                                                    <option value="bootstrap" disabled>Bootstrap (Coming Soon)</option>
                                                </select>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Method used to generate market scenarios
                                                </p>
                                            </div>

                                            {/* Number of Simulations - Only show for Monte Carlo */}
                                            {simulationTechnique === 'monte-carlo' && (
                                                <div>
                                                    <label className="block text-sm font-normal mb-2">
                                                        Monte Carlo Simulations
                                                    </label>
                                                    <div className="flex gap-2 mb-2">
                                                        {[1000, 5000, 10000].map((count) => (
                                                            <button
                                                                key={count}
                                                                type="button"
                                                                onClick={() => setNumberOfSimulations(count)}
                                                                className={`px-3 py-1 text-xs border transition-colors ${numberOfSimulations === count
                                                                    ? 'bg-black text-white border-black'
                                                                    : 'bg-white text-black border-gray-300 hover:border-black'
                                                                    }`}
                                                            >
                                                                {count.toLocaleString()}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <input
                                                        type="number"
                                                        value={numberOfSimulations}
                                                        onChange={(e) => setNumberOfSimulations(Number(e.target.value))}
                                                        className="w-full px-4 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
                                                        min="100"
                                                        max="50000"
                                                        step="100"
                                                    />
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        More simulations = more accurate results (slower)
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Run Button */}
                                <button
                                    onClick={handleRunSimulation}
                                    disabled={!canRun || isRunning}
                                    className="w-full px-6 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isRunning ? 'Running Simulation...' : 'Run Simulation'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Panel - Right */}
                    <div className="lg:col-span-2">
                        {result ? (
                            <div className="space-y-6">
                                {/* Success Rate Card */}
                                <SuccessRateCard successRate={result.successRate} />

                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white border border-black p-4">
                                        <p className="text-sm text-gray-600 mb-1">Median Ending Balance</p>
                                        <p className="text-2xl font-light">{formatCurrency(result.medianEndingBalance, currency)}</p>
                                    </div>
                                    <div className="bg-white border border-black p-4">
                                        <p className="text-sm text-gray-600 mb-1">Best Case (95th %)</p>
                                        <p className="text-2xl font-light text-green-600">{formatCurrency(result.bestCaseBalance, currency)}</p>
                                    </div>
                                    <div className="bg-white border border-black p-4">
                                        <p className="text-sm text-gray-600 mb-1">Worst Case (5th %)</p>
                                        <p className="text-2xl font-light text-red-600">{formatCurrency(result.worstCaseBalance, currency)}</p>
                                    </div>
                                </div>

                                {/* Portfolio Paths Chart */}
                                <PortfolioPathsChart
                                    result={result}
                                    retirementYears={retirementYears}
                                    currency={currency}
                                />

                                {/* Simulation Details */}
                                <div className="bg-white border border-black p-4">
                                    <p className="text-sm text-gray-600">
                                        Based on {result.totalPaths.toLocaleString()} Monte Carlo simulations with {stockAllocation}% stocks, {bondAllocation}% bonds
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border border-black p-12 text-center">
                                <p className="text-gray-500 text-lg">
                                    Configure your parameters and click "Run Simulation" to see results
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RunSimulation
