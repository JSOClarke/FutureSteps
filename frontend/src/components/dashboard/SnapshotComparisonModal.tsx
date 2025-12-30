import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { ProjectionEngine } from '@/utils/projections/engine'
import { compareFinancialState, type ComparisonResult } from '@/utils/projections/comparison'
import { filterByCategory } from '@/utils/projections/helpers'
import { useSnapshots } from '@/context/SnapshotsContext'
import { formatCurrency } from '@/utils/formatters'
import type { Plan, FinancialSnapshot, FinancialItem, FinancialSubCategory } from '@/types'

interface SnapshotComparisonModalProps {
    isOpen: boolean
    onClose: () => void
    snapshot: FinancialSnapshot | null
    plans: Plan[]
}

export function SnapshotComparisonModal({ isOpen, onClose, snapshot, plans }: SnapshotComparisonModalProps) {
    const { getSnapshotItems } = useSnapshots()

    const [selectedPlanId, setSelectedPlanId] = useState<string>('')
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [snapshotItems, setSnapshotItems] = useState<FinancialItem[]>([])

    // Auto-select first plan
    useEffect(() => {
        if (isOpen && plans.length > 0 && !selectedPlanId) {
            setSelectedPlanId(plans[0].id)
        }
    }, [isOpen, plans, selectedPlanId])

    // Load Snapshot Items when snapshot changes
    useEffect(() => {
        const loadItems = async () => {
            if (!snapshot) return
            setLoading(true)
            try {
                const items = await getSnapshotItems(snapshot.id)
                // Map to FinancialItem
                const mapped: FinancialItem[] = items.map(i => ({
                    id: i.id,
                    name: i.name,
                    value: i.amount,
                    category: i.category,
                    subCategory: i.subCategory as FinancialSubCategory,
                    // Defaults
                    startYear: 0,
                    endYear: 100
                }))
                setSnapshotItems(mapped)
            } catch (err) {
                console.error("Failed to load snapshot items", err)
            } finally {
                setLoading(false)
            }
        }

        if (isOpen && snapshot) {
            loadItems()
        }
    }, [isOpen, snapshot])

    // Run Comparison
    useEffect(() => {
        if (!snapshot || !selectedPlanId || snapshotItems.length === 0) return

        const plan = plans.find(p => p.id === selectedPlanId)
        if (!plan) return

        // Calculate YTD Fraction based on Snapshot Date
        // If snapshot is from Oct, compare against YTD(Oct)
        const snapshotDate = new Date(snapshot.created_at)
        const year = snapshotDate.getFullYear()
        const start = new Date(year, 0, 1)
        const diff = snapshotDate.getTime() - start.getTime()
        const oneDay = 1000 * 60 * 60 * 24
        const dayOfYear = Math.floor(diff / oneDay)
        const fractionOfYear = dayOfYear / 365

        const engine = new ProjectionEngine()
        const incomes = filterByCategory(plan.financialItems, 'income')
        const expenses = filterByCategory(plan.financialItems, 'expenses')
        const assets = filterByCategory(plan.financialItems, 'assets')
        const liabilities = filterByCategory(plan.financialItems, 'liabilities')

        const yearResult = engine.runSingleYear(
            incomes, expenses, assets, liabilities,
            year,
            fractionOfYear,
            plan.surplusPriority,
            plan.deficitPriority
        )

        const result = compareFinancialState(snapshotItems, yearResult)
        setComparisonResult(result)

    }, [snapshot, selectedPlanId, snapshotItems, plans])


    if (!snapshot) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Snapshot Comparison</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <div className="space-y-6">
                        {/* Control Bar */}
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">Compare against:</span>
                                <select
                                    value={selectedPlanId}
                                    onChange={(e) => setSelectedPlanId(e.target.value)}
                                    className="w-[250px] bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                    {plans.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="text-sm text-gray-500">
                                Snapshot Date: {new Date(snapshot.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        {loading && (
                            <div className="flex justify-center py-8">
                                <Loader2 className="animate-spin text-gray-400" />
                            </div>
                        )}

                        {!loading && comparisonResult && (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-500">Actual Net Worth</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{formatCurrency(comparisonResult.summary.totalActualNetWorth)}</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-500">Projected Net Worth</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{formatCurrency(comparisonResult.summary.totalProjectedNetWorth)}</div>
                                        </CardContent>
                                    </Card>
                                    <Card className={comparisonResult.summary.diff >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-500">Variance</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className={`text-2xl font-bold ${comparisonResult.summary.diff >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                {comparisonResult.summary.diff > 0 ? '+' : ''}{formatCurrency(comparisonResult.summary.diff)}
                                            </div>
                                            <div className={`text-xs ${comparisonResult.summary.diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {(comparisonResult.summary.percentDiff * 100).toFixed(1)}% {comparisonResult.summary.diff >= 0 ? 'Ahead' : 'Behind'}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Detailed List */}
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-100 text-gray-600 font-medium">
                                            <tr>
                                                <th className="p-3">Category Group</th>
                                                <th className="p-3">Type</th>
                                                <th className="p-3 text-right">Actual</th>
                                                <th className="p-3 text-right">Projected</th>
                                                <th className="p-3 text-right">Diff</th>
                                                <th className="p-3 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {comparisonResult.items.map(item => (
                                                <tr key={item.itemId} className="hover:bg-gray-50">
                                                    <td className="p-3 font-medium">{item.name}</td>
                                                    <td className="p-3 capitalize text-gray-500">{item.category}</td>
                                                    <td className="p-3 text-right">{formatCurrency(item.actualValue)}</td>
                                                    <td className="p-3 text-right text-gray-500">{formatCurrency(item.projectedValue)}</td>
                                                    <td className={`p-3 text-right font-medium ${(item.category === 'assets' && item.diff < 0) || (item.category === 'liabilities' && item.diff > 0)
                                                        ? 'text-red-600'
                                                        : 'text-green-600'
                                                        }`}>
                                                        {item.diff > 0 ? '+' : ''}{formatCurrency(item.diff)}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {item.status === 'on_track' && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                                On Track
                                                            </span>
                                                        )}
                                                        {/* Ensure case-insensitive or strict matching for 'ahead'/'behind' based on comparison.ts output */}
                                                        {item.status === 'ahead' && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                Ahead
                                                            </span>
                                                        )}
                                                        {item.status === 'behind' && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                                Behind
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
}
