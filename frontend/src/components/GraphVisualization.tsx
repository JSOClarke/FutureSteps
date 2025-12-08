import { useProjections } from '../hooks/useProjections'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts'

interface GraphVisualizationProps {
    selectedYear: number | null
    onYearSelect: (year: number) => void
}

function GraphVisualization({ selectedYear, onYearSelect }: GraphVisualizationProps) {
    const { projection } = useProjections()

    if (!projection || projection.years.length === 0) {
        return (
            <div
                className="w-[70%] border-2 flex items-center justify-center bg-white"
                style={{
                    borderColor: '#BAE6FD',
                    minHeight: '70vh'
                }}
            >
                <p className="text-2xl font-light text-gray-600">
                    Add financial items to see projections
                </p>
            </div>
        )
    }

    // Prepare data for Recharts
    const chartData = projection.years.map(year => ({
        year: year.year,
        'Net Worth': year.netWorth,
        'Income': year.totalIncome,
        'Expenses': year.totalExpenses,
    }))

    // Format currency for tooltip
    const formatCurrency = (value: number) => {
        return `$${value.toLocaleString()} `
    }

    // Handle bar click - Recharts Bar onClick passes data payload
    const handleBarClick = (data: any, index: number) => {
        // Try to get year from the data object
        if (data && data.year) {
            onYearSelect(data.year)
        } else if (index !== undefined && chartData[index]) {
            // Fallback: use index to get year from chartData
            onYearSelect(chartData[index].year)
        }
    }

    return (
        <div
            className="w-[70%] border-2 bg-white p-6"
            style={{
                borderColor: '#BAE6FD',
                minHeight: '70vh'
            }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                        dataKey="year"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                        stroke="#6B7280"
                    />
                    <YAxis
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 12 }}
                        stroke="#6B7280"
                    />
                    <Tooltip
                        formatter={formatCurrency}
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px'
                        }}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                    />
                    <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="3 3" />
                    <Bar
                        dataKey="Net Worth"
                        fill="#3B82F6"
                        cursor="pointer"
                        onClick={handleBarClick}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default GraphVisualization
