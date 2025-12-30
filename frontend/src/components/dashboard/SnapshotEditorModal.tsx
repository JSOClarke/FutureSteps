import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Save, Loader2, RefreshCw } from 'lucide-react'
import FinancialCategoryCard from '@/components/financial/FinancialCategoryCard'
import { useSnapshots } from '@/context/SnapshotsContext'
import { useFinancialItems } from '@/context/FinancialItemsContext'
import type { FinancialItem, FinancialCategory, FinancialSubCategory } from '@/types'
import { useToast } from '@/context/ToastContext'

interface SnapshotEditorModalProps {
    isOpen: boolean
    onClose: () => void
}

export function SnapshotEditorModal({ isOpen, onClose }: SnapshotEditorModalProps) {
    const { snapshots, getSnapshotItems, saveSnapshot } = useSnapshots()
    const { items: currentPlanItems } = useFinancialItems()
    const { toast } = useToast()

    const [localItems, setLocalItems] = useState<FinancialItem[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            loadData()
        }
    }, [isOpen])

    const loadData = async () => {
        setLoading(true)
        try {
            if (snapshots.length > 0) {
                // Load from latest snapshot
                const latest = snapshots[0]
                const items = await getSnapshotItems(latest.id)

                // Map to FinancialItem structure
                const mappedItems: FinancialItem[] = items.map(i => ({
                    id: i.id,
                    name: i.name,
                    value: i.amount,
                    category: i.category,
                    subCategory: i.subCategory as FinancialSubCategory,
                    // Defaults
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
                // First time: Copy from Current Plan items if available
                setLocalItems([...currentPlanItems])
            }
        } catch (error) {
            console.error("Failed to load snapshot data", error)
            toast({
                title: "Error",
                message: "Failed to load latest snapshot data.",
                type: "error"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = (item: Omit<FinancialItem, 'id'>) => {
        // Generate a temporary ID
        const newItem = { ...item, id: crypto.randomUUID() } as FinancialItem
        setLocalItems(prev => [...prev, newItem])
    }

    const handleUpdate = (id: string, updated: Partial<FinancialItem>) => {
        setLocalItems(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i))
    }

    const handleDelete = (id: string) => {
        setLocalItems(prev => prev.filter(i => i.id !== id))
    }

    const handleSave = async () => {
        if (localItems.length === 0) {
            toast({
                title: 'No items',
                message: 'Please add items before saving.',
                type: 'warning'
            })
            return
        }

        try {
            setSaving(true)

            // Calculate Totals locally
            const getSum = (cat: FinancialCategory) => localItems
                .filter(i => i.category === cat)
                .reduce((sum, item) => sum + item.value, 0)

            const totalIncome = getSum('income')
            const totalExpenses = getSum('expenses')
            const totalAssets = getSum('assets')
            const totalLiabilities = getSum('liabilities')
            const netWorth = totalAssets - totalLiabilities

            // Save New Snapshot
            await saveSnapshot({
                total_income: totalIncome,
                total_expenses: totalExpenses,
                total_assets: totalAssets,
                total_liabilities: totalLiabilities,
                net_worth: netWorth,
                income_count: localItems.filter(i => i.category === 'income').length,
                expense_count: localItems.filter(i => i.category === 'expenses').length,
                asset_count: localItems.filter(i => i.category === 'assets').length,
                liability_count: localItems.filter(i => i.category === 'liabilities').length,
                note: 'Created via Dashboard'
            }, localItems.map(i => ({
                id: i.id, // ID might be temp, handled by backend/context
                name: i.name,
                amount: i.value,
                category: i.category,
                subCategory: i.subCategory
            })))

            toast({
                title: 'Snapshot Saved',
                message: 'Your new snapshot has been created.',
                type: 'success'
            })
            onClose()

        } catch (error) {
            console.error('Failed to save snapshot:', error)
            toast({
                title: 'Save Failed',
                message: 'Failed to create snapshot.',
                type: 'error'
            })
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-normal">New Financial Snapshot</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Loader2 className="animate-spin mb-2" />
                            <p>Loading latest financial data...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 border border-blue-100 rounded-lg flex gap-3 text-sm text-blue-800">
                                <RefreshCw className="shrink-0 mt-0.5" size={16} />
                                <div>
                                    <p className="font-medium">Data Loaded from Latest Snapshot</p>
                                    <p className="opacity-90">Review and update your numbers below. This will create a <strong>new</strong> snapshot and will not overwrite history.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FinancialCategoryCard
                                    title="Assets"
                                    category="assets"
                                    backgroundColor="#eff6ff"
                                    items={localItems.filter(i => i.category === 'assets')}
                                    onAdd={handleAdd}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                    simpleMode={true}
                                />
                                <FinancialCategoryCard
                                    title="Liabilities"
                                    category="liabilities"
                                    backgroundColor="#fff7ed"
                                    items={localItems.filter(i => i.category === 'liabilities')}
                                    onAdd={handleAdd}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                    simpleMode={true}
                                />
                                <FinancialCategoryCard
                                    title="Income (Monthly)"
                                    category="income"
                                    backgroundColor="#f0fdf4"
                                    items={localItems.filter(i => i.category === 'income')}
                                    onAdd={handleAdd}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                    simpleMode={true}
                                />
                                <FinancialCategoryCard
                                    title="Expenses (Monthly)"
                                    category="expenses"
                                    backgroundColor="#fef2f2"
                                    items={localItems.filter(i => i.category === 'expenses')}
                                    onAdd={handleAdd}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                    simpleMode={true}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" onClick={onClose} disabled={saving}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={saving} className="bg-black hover:bg-gray-800 text-white gap-2">
                                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    Save Snapshot
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
}
