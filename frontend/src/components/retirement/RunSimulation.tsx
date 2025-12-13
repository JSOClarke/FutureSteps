import { useState } from 'react'
import { runRetirementSimulation, calculateInitialWithdrawal, type SimulationResult } from '../../utils/retirementSimulation'
import { DEFAULT_PARAMS } from '../../data/marketData'
import { formatCurrency } from '../../utils/formatters'
import { useCurrency } from '../../hooks/useCurrency'
import CurrencyInput from '../shared/CurrencyInput'
import SuccessRateCard from './SuccessRateCard'
import PortfolioPathsChart from './PortfolioPathsChart'

function RunSimulation() {
    const currency = useCurrency()

    // Form state
    const [initialPortfolio, setInitialPortfolio] = useState<number>(1000000)
    const [retirementYears, setRetirementYears] = useState<number>(30)
    const [stockAllocation, setStockAllocation] = useState<number>(60)
    const [withdrawalRate, setWithdrawalRate] = useState<number>(4)

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
            numberOfSimulations: DEFAULT_PARAMS.numberOfSimulations,
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
                                {/* Portfolio Value */}
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
