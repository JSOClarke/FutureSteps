import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { SimulationDetailsTable } from './SimulationDetailsTable'
import { getSampleRunLabel, getSampleRunColor, type SampleRunSelection } from '../../utils/simulationSampling'

interface SampleRunsSectionProps {
    sampleRuns: SampleRunSelection
    initialPortfolio: number
}

/**
 * Container component for displaying sample simulation runs
 * Shows expandable section with detailed year-by-year breakdowns
 */
export function SampleRunsSection({ sampleRuns, initialPortfolio }: SampleRunsSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set())

    const toggleRun = (runType: string) => {
        const newExpanded = new Set(expandedRuns)
        if (newExpanded.has(runType)) {
            newExpanded.delete(runType)
        } else {
            newExpanded.add(runType)
        }
        setExpandedRuns(newExpanded)
    }

    // Build array of run entries for rendering
    const runEntries: Array<{ key: keyof SampleRunSelection; path: any }> = [
        { key: 'bestCase', path: sampleRuns.bestCase },
        { key: 'median', path: sampleRuns.median },
        { key: 'worstCase', path: sampleRuns.worstCase },
        { key: 'randomSuccess', path: sampleRuns.randomSuccess },
    ]

    // Add random failure if it exists
    if (sampleRuns.randomFailure) {
        runEntries.push({ key: 'randomFailure', path: sampleRuns.randomFailure })
    }

    return (
        <div className="border border-black bg-white">
            {/* Section Header - Always Visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                    ) : (
                        <ChevronRight className="w-5 h-5" />
                    )}
                    <h3 className="text-lg font-normal">Sample Simulation Runs</h3>
                </div>
                <span className="text-sm text-gray-600">
                    View {runEntries.length} detailed examples
                </span>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-black p-6 bg-gray-50">
                    <p className="text-sm text-gray-700 mb-6">
                        These sample runs show year-by-year portfolio progression through retirement.
                        Each run demonstrates how market returns and withdrawals affect portfolio balance.
                    </p>

                    <div className="space-y-4">
                        {runEntries.map(({ key, path }) => (
                            <div key={key} className="bg-white border border-gray-300 rounded-sm">
                                {/* Individual Run Header */}
                                <button
                                    onClick={() => toggleRun(key)}
                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        {expandedRuns.has(key) ? (
                                            <ChevronDown className="w-4 h-4" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4" />
                                        )}
                                        <span className={`font-medium ${getSampleRunColor(key)}`}>
                                            {getSampleRunLabel(key)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-600">
                                        {path.success ? 'Portfolio survived' : `Failed year ${path.failureYear}`}
                                    </span>
                                </button>

                                {/* Individual Run Table */}
                                {expandedRuns.has(key) && (
                                    <div className="border-t border-gray-300">
                                        <SimulationDetailsTable
                                            path={path}
                                            label={getSampleRunLabel(key)}
                                            labelColor={getSampleRunColor(key)}
                                            initialPortfolio={initialPortfolio}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-sm">
                        <p className="text-xs text-blue-900">
                            <strong>Reading the tables:</strong> Each year shows the portfolio's starting balance,
                            market return (gain/loss), withdrawal amount, and ending balance. Failed runs show a
                            zero ending balance when the portfolio is depleted.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
