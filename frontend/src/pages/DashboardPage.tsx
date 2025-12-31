import { Income as DollarSign, Add as Plus, TrendingUp, TrendingDown, Building, Card as CreditCard, ChevronDown, ChevronUp } from '../icons'
import { useSnapshots } from '../context/SnapshotsContext'
import { usePlans } from '../context/PlansContext'
import { SnapshotHistoryTable } from '../components/dashboard/SnapshotHistoryTable'
import { SnapshotEditorModal } from '../components/dashboard/SnapshotEditorModal'
import { SnapshotComparisonModal } from '../components/dashboard/SnapshotComparisonModal'
import { PageHeader } from '../components/shared/PageHeader'
import { useState, useEffect } from 'react'
import { useCurrency } from '../hooks/useCurrency'
import { formatCurrency } from '../utils/formatters'
import { getSubCategoryIcon } from '../utils/subcategoryHelpers'

import { ConfirmationDialog } from '../components/shared/ConfirmationDialog'
import { useToast } from '../context/ToastContext'
import type { SnapshotItem, FinancialSnapshot } from '../types'

export function DashboardPage() {
    const { snapshots, deleteSnapshot, getSnapshotItems } = useSnapshots()
    const { plans } = usePlans()
    const { toast } = useToast()

    // UI State
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [isComparisonOpen, setIsComparisonOpen] = useState(false)
    const [selectedSnapshot, setSelectedSnapshot] = useState<FinancialSnapshot | null>(null)

    // Dialog State
    const [deleteSnapshotId, setDeleteSnapshotId] = useState<string | null>(null)
    const [recentExpanded, setRecentExpanded] = useState(false)
    const [recentItems, setRecentItems] = useState<SnapshotItem[]>([])
    const [loadingRecentItems, setLoadingRecentItems] = useState(false)
    const currency = useCurrency()

    const mostRecentSnapshot = snapshots.length > 0 ? snapshots[0] : null

    // Fetch items for most recent snapshot when expanded
    useEffect(() => {
        const fetchRecentItems = async () => {
            if (recentExpanded && mostRecentSnapshot && recentItems.length === 0) {
                setLoadingRecentItems(true)

                try {
                    const items = await getSnapshotItems(mostRecentSnapshot.id)
                    // Sort by category to match previous behavior
                    const sorted = [...items].sort((a, b) => a.category.localeCompare(b.category))
                    setRecentItems(sorted)
                } catch (error) {
                    console.error('Failed to load snapshot items:', error)
                } finally {
                    setLoadingRecentItems(false)
                }
            }
        }

        fetchRecentItems()
    }, [recentExpanded, mostRecentSnapshot])

    // Clear recent items when most recent snapshot changes
    useEffect(() => {
        setRecentItems([])
        setRecentExpanded(false)
    }, [mostRecentSnapshot?.id])

    const handleCompare = (snapshot: FinancialSnapshot) => {
        if (plans.length === 0) {
            toast({
                title: "No Plans Found",
                message: "You need to create a financial plan before you can run a comparison.",
                type: "warning"
            })
            return
        }
        setSelectedSnapshot(snapshot)
        setIsComparisonOpen(true)
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Financial Dashboard"
                subtitle="Track your finances over time"
            >
                <button
                    onClick={() => setIsEditorOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm font-normal uppercase tracking-wide"
                >
                    <Plus size={16} />
                    New Snapshot
                </button>
            </PageHeader>

            {/* Most Recent Snapshot */}
            {mostRecentSnapshot ? (
                <div className="border-2 border-black bg-white p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-normal mb-1">Most Recent Snapshot</h2>
                            <p className="text-sm text-gray-600">
                                {new Date(mostRecentSnapshot.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Summary Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="border border-black p-3 bg-green-50">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp size={16} className="text-green-600" />
                                <span className="text-xs uppercase text-gray-600">Income</span>
                            </div>
                            <p className="text-lg font-bold text-green-700">
                                {formatCurrency(mostRecentSnapshot.total_income, currency)}
                            </p>
                        </div>
                        <div className="border border-black p-3 bg-red-50">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingDown size={16} className="text-red-600" />
                                <span className="text-xs uppercase text-gray-600">Expenses</span>
                            </div>
                            <p className="text-lg font-bold text-red-700">
                                {formatCurrency(mostRecentSnapshot.total_expenses, currency)}
                            </p>
                        </div>
                        <div className="border border-black p-3 bg-blue-50">
                            <div className="flex items-center gap-2 mb-1">
                                <Building size={16} className="text-blue-600" />
                                <span className="text-xs uppercase text-gray-600">Assets</span>
                            </div>
                            <p className="text-lg font-bold text-blue-700">
                                {formatCurrency(mostRecentSnapshot.total_assets, currency)}
                            </p>
                        </div>
                        <div className="border border-black p-3 bg-orange-50">
                            <div className="flex items-center gap-2 mb-1">
                                <CreditCard size={16} className="text-orange-600" />
                                <span className="text-xs uppercase text-gray-600">Liabilities</span>
                            </div>
                            <p className="text-lg font-bold text-orange-700">
                                {formatCurrency(mostRecentSnapshot.total_liabilities, currency)}
                            </p>
                        </div>
                    </div>

                    {/* Net Worth */}
                    <div className="border-t-2 border-black pt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-normal text-gray-600 uppercase tracking-wide">Net Worth</span>
                            <DollarSign size={24} className={mostRecentSnapshot.net_worth >= 0 ? 'text-green-700' : 'text-red-700'} />
                        </div>
                        <div className={`text-3xl font-bold mt-1 ${mostRecentSnapshot.net_worth >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {formatCurrency(mostRecentSnapshot.net_worth, currency)}
                        </div>
                    </div>

                    {/* View Details Button */}
                    <div className="border-t-2 border-black pt-4 mt-4">
                        <button
                            onClick={() => setRecentExpanded(!recentExpanded)}
                            className="flex items-center gap-2 text-sm text-gray-700 hover:text-black transition-colors"
                        >
                            {recentExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            {recentExpanded ? 'Hide' : 'View'} Item Details
                        </button>
                    </div>

                    {/* Expanded Item Details */}
                    {recentExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            {loadingRecentItems ? (
                                <p className="text-sm text-gray-500 text-center py-4">Loading items...</p>
                            ) : recentItems.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No items in this snapshot</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Income Items */}
                                    {recentItems.filter(i => i.category === 'income').length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-normal uppercase tracking-wide text-gray-600 mb-2">Income</h4>
                                            <div className="space-y-1">
                                                {recentItems.filter(i => i.category === 'income').map(item => {
                                                    const Icon = getSubCategoryIcon(item.subCategory as any)
                                                    return (
                                                        <div key={item.id} className="flex justify-between items-center text-sm bg-green-50 border border-green-200 px-2 py-1">
                                                            <div className="flex items-center gap-2">
                                                                <Icon size={14} className="text-green-700 opacity-70" />
                                                                <span className="text-gray-700">{item.name}</span>
                                                            </div>
                                                            <span className="font-medium text-green-600">{formatCurrency(item.amount, currency)}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Expense Items */}
                                    {recentItems.filter(i => i.category === 'expenses').length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-normal uppercase tracking-wide text-gray-600 mb-2">Expenses</h4>
                                            <div className="space-y-1">
                                                {recentItems.filter(i => i.category === 'expenses').map(item => {
                                                    const Icon = getSubCategoryIcon(item.subCategory as any)
                                                    return (
                                                        <div key={item.id} className="flex justify-between items-center text-sm bg-red-50 border border-red-200 px-2 py-1">
                                                            <div className="flex items-center gap-2">
                                                                <Icon size={14} className="text-red-700 opacity-70" />
                                                                <span className="text-gray-700">{item.name}</span>
                                                            </div>
                                                            <span className="font-medium text-red-600">{formatCurrency(item.amount, currency)}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Asset Items */}
                                    {recentItems.filter(i => i.category === 'assets').length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-normal uppercase tracking-wide text-gray-600 mb-2">Assets</h4>
                                            <div className="space-y-1">
                                                {recentItems.filter(i => i.category === 'assets').map(item => {
                                                    const Icon = getSubCategoryIcon(item.subCategory as any)
                                                    return (
                                                        <div key={item.id} className="flex justify-between items-center text-sm bg-blue-50 border border-blue-200 px-2 py-1">
                                                            <div className="flex items-center gap-2">
                                                                <Icon size={14} className="text-blue-700 opacity-70" />
                                                                <span className="text-gray-700">{item.name}</span>
                                                            </div>
                                                            <span className="font-medium text-blue-600">{formatCurrency(item.amount, currency)}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Liability Items */}
                                    {recentItems.filter(i => i.category === 'liabilities').length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-normal uppercase tracking-wide text-gray-600 mb-2">Liabilities</h4>
                                            <div className="space-y-1">
                                                {recentItems.filter(i => i.category === 'liabilities').map(item => {
                                                    const Icon = getSubCategoryIcon(item.subCategory as any)
                                                    return (
                                                        <div key={item.id} className="flex justify-between items-center text-sm bg-orange-50 border border-orange-200 px-2 py-1">
                                                            <div className="flex items-center gap-2">
                                                                <Icon size={14} className="text-orange-700 opacity-70" />
                                                                <span className="text-gray-700">{item.name}</span>
                                                            </div>
                                                            <span className="font-medium text-orange-600">{formatCurrency(item.amount, currency)}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                /* No Snapshots State */
                <div className="border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                    <h2 className="text-xl font-normal mb-2">No Snapshots Yet</h2>
                    <p className="text-gray-600 mb-6">Create your first financial snapshot to start tracking.</p>
                    <button
                        onClick={() => setIsEditorOpen(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors text-sm font-normal uppercase tracking-wide"
                    >
                        <Plus size={20} />
                        Start New Snapshot
                    </button>
                </div>
            )
            }

            {/* Snapshot History */}
            <div>
                <h2 className="text-xl font-normal mb-3">Financial History</h2>
                <SnapshotHistoryTable
                    snapshots={snapshots}
                    onDelete={(id) => setDeleteSnapshotId(id)}
                    onCompare={handleCompare}
                />
            </div>

            {/* Modals */}
            <SnapshotEditorModal
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
            />

            <SnapshotComparisonModal
                isOpen={isComparisonOpen}
                onClose={() => setIsComparisonOpen(false)}
                snapshot={selectedSnapshot}
                plans={plans}
            />

            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                isOpen={!!deleteSnapshotId}
                onClose={() => setDeleteSnapshotId(null)}
                onConfirm={async () => {
                    if (deleteSnapshotId) {
                        try {
                            await deleteSnapshot(deleteSnapshotId)
                            toast({
                                title: 'Snapshot Deleted',
                                message: 'The snapshot has been permanently removed.',
                                type: 'success'
                            })
                        } catch (error) {
                            toast({
                                title: 'Delete Failed',
                                message: 'Failed to delete snapshot. Please try again.',
                                type: 'error'
                            })
                        }
                        setDeleteSnapshotId(null)
                    }
                }}
                title="Delete Snapshot"
                description="Are you sure you want to delete this snapshot? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
            />
        </div >
    )
}

