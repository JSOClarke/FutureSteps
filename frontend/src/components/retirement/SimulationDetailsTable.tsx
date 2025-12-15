import { useMemo } from 'react'
import type { SimulationPath } from '../../utils/retirementSimulation'
import { calculateYearDetails } from '../../utils/simulationSampling'
import { formatCurrency } from '../../utils/formatters'
import { useCurrency } from '../../hooks/useCurrency'

interface SimulationDetailsTableProps {
    path: SimulationPath
    label: string
    labelColor: string
    initialPortfolio: number
}

/**
 * Displays year-by-year portfolio details for a single simulation run
 * Shows starting balance, market return, withdrawal, and ending balance for each year
 */
export function SimulationDetailsTable({
    path,
    label,
    labelColor,
    initialPortfolio
}: SimulationDetailsTableProps) {
    const currency = useCurrency()

    // Calculate year details with memoization for performance
    const yearDetails = useMemo(
        () => calculateYearDetails(path, initialPortfolio),
        [path, initialPortfolio]
    )

    // Format percentage with sign
    const formatReturn = (returnRate: number): string => {
        const percentage = (returnRate * 100).toFixed(1)
        return returnRate >= 0 ? `+${percentage}%` : `${percentage}%`
    }

    // Get color for return value
    const getReturnColor = (returnRate: number): string => {
        if (returnRate > 0) return 'text-green-600'
        if (returnRate < 0) return 'text-red-600'
        return 'text-gray-600'
    }

    return (
        <div className="border border-gray-300 rounded-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
                <h4 className={`text-sm font-medium ${labelColor}`}>
                    {label}
                    {!path.success && path.failureYear && (
                        <span className="ml-2 text-xs text-red-600">
                            (Failed in Year {path.failureYear})
                        </span>
                    )}
                    {path.success && (
                        <span className="ml-2 text-xs text-green-600">
                            (Success)
                        </span>
                    )}
                </h4>
            </div>

            {/* Table Container - Scrollable on mobile */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b border-gray-300">
                        <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Year</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-700 hidden sm:table-cell">
                                Starting Balance
                            </th>
                            <th className="px-3 py-2 text-right font-medium text-gray-700 hidden md:table-cell">
                                Return
                            </th>
                            <th className="px-3 py-2 text-right font-medium text-gray-700 hidden lg:table-cell">
                                Withdrawal
                            </th>
                            <th className="px-3 py-2 text-right font-medium text-gray-700">
                                Ending Balance
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {yearDetails.map((detail, index) => (
                            <tr
                                key={detail.year}
                                className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    } ${detail.endingBalance === 0 ? 'bg-red-50' : ''}`}
                            >
                                <td className="px-3 py-2 font-medium">{detail.year}</td>
                                <td className="px-3 py-2 text-right font-light hidden sm:table-cell">
                                    {formatCurrency(detail.startingBalance, currency)}
                                </td>
                                <td className={`px-3 py-2 text-right font-medium hidden md:table-cell ${getReturnColor(detail.marketReturn)}`}>
                                    {formatReturn(detail.marketReturn)}
                                </td>
                                <td className="px-3 py-2 text-right font-light text-gray-600 hidden lg:table-cell">
                                    {formatCurrency(detail.withdrawal, currency)}
                                </td>
                                <td className={`px-3 py-2 text-right font-medium ${detail.endingBalance === 0 ? 'text-red-600' : ''
                                    }`}>
                                    {formatCurrency(detail.endingBalance, currency)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
