import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import FinancialCategoryCard from '@/components/financial/FinancialCategoryCard'
import { ArrowRightIcon as ArrowRight, Loader2 } from '../../icons'
import { useSnapshots } from '@/context/SnapshotsContext'
import { useFinancialItems } from '@/context/FinancialItemsContext'
import type { FinancialItem, FinancialSubCategory } from '@/types'

interface CheckInStep1Props {
    onContinue: () => void
}

export function CheckInStep1({ onContinue }: CheckInStep1Props) {
    const { snapshots, getSnapshotItems, saveSnapshot, loading: snapshotsLoading } = useSnapshots()
    const { items: currentPlanItems } = useFinancialItems()

    const [localItems, setLocalItems] = useState<FinancialItem[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Initial Load: Try Latest Snapshot -> Fallback to Plan Items
    useEffect(() => {
        const loadData = async () => {
            if (snapshotsLoading) return

            try {
                if (snapshots.length > 0) {
                    // Load from latest snapshot
                    const latest = snapshots[0]
                    const items = await getSnapshotItems(latest.id)

                    // Map SnapshotItem to FinancialItem structure for the UI
                    const mappedItems: FinancialItem[] = items.map(i => ({
                        id: i.id, // Keep temp ID or snapshot item ID
                        name: i.name,
                        value: i.amount,
                        category: i.category,
                        subCategory: i.subCategory as FinancialSubCategory,
                        // Defaults for required FinancialItem fields not in Snapshot
                        startYear: 0,
                        endYear: 100,
                        frequency: 'monthly',
                        growthRate: 0,
                        yieldRate: 0,
                        maxAnnualContribution: 0,
                        interestRate: 0,
                        minimumPayment: 0
                    }))
                    setLocalItems(mappedItems)
                } else {
                    // Fallback to current plan items
                    // We clone them so we don't edit the plan directly
                    setLocalItems([...currentPlanItems])
                }
            } catch (err) {
                console.error("Failed to load snapshot items", err)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [snapshots, snapshotsLoading, currentPlanItems])

    const handleContinue = async () => {
        setSaving(true)
        try {
            // Calculate totals for the snapshot header
            const totalIncome = localItems.filter(i => i.category === 'income').reduce((sum, i) => sum + i.value, 0)
            const totalExpenses = localItems.filter(i => i.category === 'expenses').reduce((sum, i) => sum + i.value, 0)
            const totalAssets = localItems.filter(i => i.category === 'assets').reduce((sum, i) => sum + i.value, 0)
            const totalLiabilities = localItems.filter(i => i.category === 'liabilities').reduce((sum, i) => sum + i.value, 0)
            const netWorth = totalAssets - totalLiabilities

            // Counts
            const incomeCount = localItems.filter(i => i.category === 'income').length
            const expenseCount = localItems.filter(i => i.category === 'expenses').length
            const assetCount = localItems.filter(i => i.category === 'assets').length
            const liabilityCount = localItems.filter(i => i.category === 'liabilities').length

            // Dashboard Items (subset)
            const dashboardItems = localItems.map(i => ({
                id: i.id,
                name: i.name,
                amount: i.value,
                category: i.category,
                subCategory: i.subCategory
            }))

            await saveSnapshot({
                total_income: totalIncome,
                total_expenses: totalExpenses,
                total_assets: totalAssets,
                total_liabilities: totalLiabilities,
                net_worth: netWorth,
                income_count: incomeCount,
                expense_count: expenseCount,
                asset_count: assetCount,
                liability_count: liabilityCount,
                note: 'Routine Check-in'
            }, dashboardItems)

            onContinue()
        } catch (error) {
            console.error('Failed to save snapshot:', error)
            alert('Failed to save snapshot. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    // Local Mutation Handlers
    const handleAdd = (item: Omit<FinancialItem, 'id'>) => {
        const newItem = { ...item, id: crypto.randomUUID() }
        setLocalItems(prev => [...prev, newItem])
    }

    const handleUpdate = (id: string, updates: Partial<FinancialItem>) => {
        setLocalItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
    }

    const handleDelete = (id: string) => {
        setLocalItems(prev => prev.filter(i => i.id !== id))
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-xl font-medium">Verify your current numbers</h2>
                <p className="text-gray-500 font-light">
                    {snapshots.length > 0
                        ? "Loaded from your latest snapshot. Update any values that have changed."
                        : "Starting fresh from your plan. Confirm your current actuals."}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FinancialCategoryCard
                    title="Assets"
                    category="assets"
                    items={localItems}
                    onAdd={handleAdd}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                />
                <FinancialCategoryCard
                    title="Liabilities"
                    category="liabilities"
                    items={localItems}
                    onAdd={handleAdd}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                />
                <FinancialCategoryCard
                    title="Income"
                    category="income"
                    items={localItems}
                    onAdd={handleAdd}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                />
                <FinancialCategoryCard
                    title="Expenses"
                    category="expenses"
                    items={localItems}
                    onAdd={handleAdd}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                />
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={handleContinue} className="gap-2" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight size={16} />}
                    {saving ? 'Saving...' : 'Confirm & Continue'}
                </Button>
            </div>
        </div>
    )
}
