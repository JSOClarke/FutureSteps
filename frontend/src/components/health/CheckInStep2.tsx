import { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

import { ProjectionEngine } from '@/utils/projections/engine'
import { compareFinancialState, type ComparisonResult } from '@/utils/projections/comparison'
import type { Plan, FinancialItem } from '@/types'
import { filterByCategory } from '@/utils/projections/helpers'

interface CheckInStep2Props {
    plans: Plan[]
    selectedPlanId: string
    onSelectPlan: (id: string) => void
    actuals: FinancialItem[]
    onBack: () => void
    onFinish: () => void
}

export function CheckInStep2({
    plans,
    selectedPlanId,
    onSelectPlan,
    actuals,
    onBack,
    onFinish
}: CheckInStep2Props) {
    const [result, setResult] = useState<ComparisonResult | null>(null)

    // Calculate YTD Fraction
    const currentYear = new Date().getFullYear()
    const fractionOfYear = useMemo(() => {
        const now = new Date()
        const start = new Date(currentYear, 0, 1)
        const diff = now.getTime() - start.getTime()
        const oneDay = 1000 * 60 * 60 * 24
        const dayOfYear = Math.floor(diff / oneDay)
        return dayOfYear / 365
    }, [currentYear])

    useEffect(() => {
        if (!selectedPlanId || !plans.length) return

        const plan = plans.find(p => p.id === selectedPlanId)
        if (!plan) return

        const engine = new ProjectionEngine()

        const incomes = filterByCategory(plan.financialItems, 'income')
        const expenses = filterByCategory(plan.financialItems, 'expenses')
        const assets = filterByCategory(plan.financialItems, 'assets')
        const liabilities = filterByCategory(plan.financialItems, 'liabilities')

        // Run Single Year Projection for fraction of year (YTD)
        const yearResult = engine.runSingleYear(
            incomes,
            expenses,
            assets,
            liabilities,
            currentYear,
            fractionOfYear,
            plan.surplusPriority,
            plan.deficitPriority
        )

        const comparison = compareFinancialState(actuals, yearResult)
        setResult(comparison)

    }, [selectedPlanId, plans, actuals, fractionOfYear, currentYear])

    // Auto-select first plan if none selected
    useEffect(() => {
        if (!selectedPlanId && plans.length > 0) {
            onSelectPlan(plans[0].id)
        }
    }, [plans, selectedPlanId, onSelectPlan])

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
    }

    if (!selectedPlanId) return <div>Loading plans...</div>

    return (
        <div className="space-y-6">
            {/* Control Bar */}
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Compare against:</span>
                    <select
                        value={selectedPlanId}
                        onChange={(e) => onSelectPlan(e.target.value)}
                        className="w-[250px] bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        {plans.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="text-sm text-gray-500">
                    Target Date: {new Date().toLocaleDateString()} (YTD)
                </div>
            </div>

            {result && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">Actual Net Worth</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(result.summary.totalActualNetWorth)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">Projected Net Worth</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(result.summary.totalProjectedNetWorth)}</div>
                            </CardContent>
                        </Card>
                        <Card className={result.summary.diff >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">Variance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${result.summary.diff >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {result.summary.diff > 0 ? '+' : ''}{formatCurrency(result.summary.diff)}
                                </div>
                                <div className={`text-xs ${result.summary.diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {(result.summary.percentDiff * 100).toFixed(1)}% {result.summary.diff >= 0 ? 'Ahead' : 'Behind'}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed List */}
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600 font-medium">
                                <tr>
                                    <th className="p-3">Item</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3 text-right">Actual</th>
                                    <th className="p-3 text-right">Projected</th>
                                    <th className="p-3 text-right">Diff</th>
                                    <th className="p-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {result.items.map(item => (
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

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack}>
                    Back to Edit
                </Button>
                <Button onClick={onFinish} className="gap-2 bg-green-600 hover:bg-green-700">
                    <CheckCircle size={16} />
                    Complete Check-in
                </Button>
            </div>
        </div>
    )
}
