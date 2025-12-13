import { ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../utils/formatters'
import type { SimulationResult } from '../../utils/retirementSimulation'

interface PortfolioPathsChartProps {
    result: SimulationResult
    retirementYears: number
    currency: string
}

function PortfolioPathsChart({ result, retirementYears, currency }: PortfolioPathsChartProps) {
    // Sample a few paths to show variety (every 20th simulation, max 10 for performance)
    const samplePaths = result.paths.filter((_, index) => index % 100 === 0).slice(0, 10)

    // Prepare chart data with median and sample paths
    const chartData = Array.from({ length: retirementYears + 1 }, (_, year) => {
        const dataPoint: any = {
            year,
            median: result.medianPath.portfolioValues[year] || 0,
        }

        // Add sample path values to the same data point
        samplePaths.forEach((path, index) => {
            dataPoint[`sample${index}`] = path.portfolioValues[year] || 0
        })

        return dataPoint
    })

    // Custom tooltip showing only median value
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length > 0) {
            // Find the median value in the payload
            const medianData = payload.find((p: any) => p.dataKey === 'median')
            if (medianData) {
                return (
                    <div className="bg-white border border-gray-200 p-3 rounded shadow-lg">
                        <p className="text-sm font-semibold mb-1">Year {label}</p>
                        <p className="text-sm text-blue-600">
                            Median: {formatCurrency(medianData.value, currency)}
                        </p>
                    </div>
                )
            }
        }
        return null
    }

    return (
        <div className="bg-white border border-black p-6">
            <h3 className="text-lg font-normal mb-4">Portfolio Value Over Time</h3>

            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <defs>
                        <linearGradient id="medianGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <XAxis
                        dataKey="year"
                        label={{ value: 'Years in Retirement', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                        tickFormatter={(value) => {
                            const absValue = Math.abs(value)
                            if (absValue >= 1000000) {
                                return `$${(value / 1000000).toFixed(1)}M`
                            } else if (absValue >= 1000) {
                                return `$${(value / 1000).toFixed(0)}k`
                            }
                            return `$${value}`
                        }}
                        label={{ value: 'Portfolio Value', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Sample paths in light gray */}
                    {samplePaths.map((_, index) => (
                        <Line
                            key={`sample-${index}`}
                            type="monotone"
                            dataKey={`sample${index}`}
                            stroke="#E5E7EB"
                            strokeWidth={1}
                            dot={false}
                            isAnimationActive={false}
                        />
                    ))}

                    {/* Median path with gradient fill */}
                    <Area
                        type="monotone"
                        dataKey="median"
                        stroke="none"
                        fill="url(#medianGradient)"
                    />
                    <Line
                        type="monotone"
                        dataKey="median"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>

            <p className="text-sm text-gray-600 mt-4">
                The blue line shows the median portfolio value across all simulations.
                Gray lines represent sample paths showing the range of possible outcomes.
            </p>
        </div>
    )
}

export default PortfolioPathsChart
