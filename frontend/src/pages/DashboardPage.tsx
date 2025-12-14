import { DollarSign, Save, Plus, TrendingUp, TrendingDown, Building, CreditCard, ChevronDown, ChevronUp } from 'lucide-react'
import { useSnapshots } from '../context/SnapshotsContext'
import { useDashboardItems } from '../context/DashboardItemsContext'
import { SnapshotHistoryTable } from '../components/dashboard/SnapshotHistoryTable'
import { DashboardCategoryCard } from '../components/dashboard/DashboardCategoryCard'
import { PageHeader } from '../components/shared/PageHeader'
import { useState, useEffect } from 'react'
import { useCurrency } from '../hooks/useCurrency'
import { formatCurrency } from '../utils/formatters'
import { supabase } from '../lib/supabase'
import type { SnapshotItem } from '../types'

export function DashboardPage() {
    const { snapshots, saveSnapshot, deleteSnapshot } = useSnapshots()
    const { items, getTotalByCategory, clearAllItems } = useDashboardItems()
    const [saving, setSaving] = useState(false)
    const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false)
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

                const { data, error } = await supabase
                    .from('snapshot_items')
                    .select('*')
                    .eq('snapshot_id', mostRecentSnapshot.id)
                    .order('category', { ascending: true })

                if (!error && data) {
                    setRecentItems(data)
                }

                setLoadingRecentItems(false)
            }
        }

        fetchRecentItems()
    }, [recentExpanded, mostRecentSnapshot])

    // Clear recent items when most recent snapshot changes
    useEffect(() => {
        setRecentItems([])
        setRecentExpanded(false)
    }, [mostRecentSnapshot?.id])

    const handleSaveSnapshot = async () => {
        if (items.length === 0) {
            alert('Please add at least one item before saving a snapshot')
            return
        }

        try {
            setSaving(true)

            const totalIncome = getTotalByCategory('income')
            const totalExpenses = getTotalByCategory('expenses')
            const totalAssets = getTotalByCategory('assets')
            const totalLiabilities = getTotalByCategory('liabilities')
            const netWorth = totalAssets - totalLiabilities

            await saveSnapshot({
                total_income: totalIncome,
                total_expenses: totalExpenses,
                total_assets: totalAssets,
                total_liabilities: totalLiabilities,
                net_worth: netWorth,
                income_count: items.filter(i => i.category === 'income').length,
                expense_count: items.filter(i => i.category === 'expenses').length,
                asset_count: items.filter(i => i.category === 'assets').length,
                liability_count: items.filter(i => i.category === 'liabilities').length
            }, items)

            // Clear current items and exit creation mode
            clearAllItems()
            setIsCreatingSnapshot(false)

            alert('Snapshot saved successfully!')
        } catch (error) {
            console.error('Failed to save snapshot:', error)
            alert('Failed to save snapshot. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const totalAssets = getTotalByCategory('assets')
    const totalLiabilities = getTotalByCategory('liabilities')
    const netWorth = totalAssets - totalLiabilities

    return (
        <div className="space-y-6">
            <PageHeader
                title="Financial Dashboard"
                subtitle="Track your finances over time"
            />

            {/* Most Recent Snapshot */}
            {mostRecentSnapshot && !isCreatingSnapshot && (
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
                        <button
                            onClick={() => setIsCreatingSnapshot(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm font-normal uppercase tracking-wide"
                        >
                            <Plus size={16} />
                            Start New Snapshot
                        </button>
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
                                                {recentItems.filter(i => i.category === 'income').map(item => (
                                                    <div key={item.id} className="flex justify-between text-sm bg-green-50 border border-green-200 px-2 py-1">
                                                        <span className="text-gray-700">{item.name}</span>
                                                        <span className="font-medium text-green-600">{formatCurrency(item.amount, currency)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Expense Items */}
                                    {recentItems.filter(i => i.category === 'expenses').length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-normal uppercase tracking-wide text-gray-600 mb-2">Expenses</h4>
                                            <div className="space-y-1">
                                                {recentItems.filter(i => i.category === 'expenses').map(item => (
                                                    <div key={item.id} className="flex justify-between text-sm bg-red-50 border border-red-200 px-2 py-1">
                                                        <span className="text-gray-700">{item.name}</span>
                                                        <span className="font-medium text-red-600">{formatCurrency(item.amount, currency)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Asset Items */}
                                    {recentItems.filter(i => i.category === 'assets').length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-normal uppercase tracking-wide text-gray-600 mb-2">Assets</h4>
                                            <div className="space-y-1">
                                                {recentItems.filter(i => i.category === 'assets').map(item => (
                                                    <div key={item.id} className="flex justify-between text-sm bg-blue-50 border border-blue-200 px-2 py-1">
                                                        <span className="text-gray-700">{item.name}</span>
                                                        <span className="font-medium text-blue-600">{formatCurrency(item.amount, currency)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Liability Items */}
                                    {recentItems.filter(i => i.category === 'liabilities').length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-normal uppercase tracking-wide text-gray-600 mb-2">Liabilities</h4>
                                            <div className="space-y-1">
                                                {recentItems.filter(i => i.category === 'liabilities').map(item => (
                                                    <div key={item.id} className="flex justify-between text-sm bg-orange-50 border border-orange-200 px-2 py-1">
                                                        <span className="text-gray-700">{item.name}</span>
                                                        <span className="font-medium text-orange-600">{formatCurrency(item.amount, currency)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Start New Snapshot - First time or when no items */}
            {!mostRecentSnapshot && !isCreatingSnapshot && (
                <div className="border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                    <h2 className="text-xl font-normal mb-2">No Snapshots Yet</h2>
                    <p className="text-gray-600 mb-6">Create your first financial snapshot</p>
                    <button
                        onClick={() => setIsCreatingSnapshot(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors text-sm font-normal uppercase tracking-wide"
                    >
                        <Plus size={20} />
                        Start New Snapshot
                    </button>
                </div>
            )}

            {/* New Snapshot Entry Section */}
            {isCreatingSnapshot && (
                <>
                    <div className="border-2 border-black bg-white p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-normal">New Snapshot</h2>
                                <p className="text-sm text-gray-600">Add your current financial items</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        if (items.length > 0 && !confirm('Discard current items?')) return
                                        clearAllItems()
                                        setIsCreatingSnapshot(false)
                                    }}
                                    className="px-4 py-2 border border-black hover:bg-gray-100 transition-colors text-sm font-normal uppercase tracking-wide"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveSnapshot}
                                    disabled={saving || items.length === 0}
                                    className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-normal uppercase tracking-wide"
                                >
                                    <Save size={16} />
                                    {saving ? 'Saving...' : 'Save Snapshot'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Category Cards */}
                    <div>
                        <h3 className="text-lg font-normal mb-3">Enter Items</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DashboardCategoryCard
                                title="Income"
                                category="income"
                                backgroundColor="#f0fdf4"
                            />
                            <DashboardCategoryCard
                                title="Expenses"
                                category="expenses"
                                backgroundColor="#fef2f2"
                            />
                            <DashboardCategoryCard
                                title="Assets"
                                category="assets"
                                backgroundColor="#eff6ff"
                            />
                            <DashboardCategoryCard
                                title="Liabilities"
                                category="liabilities"
                                backgroundColor="#fff7ed"
                            />
                        </div>
                    </div>

                    {/* Current Net Worth */}
                    <div className="border-2 border-black bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm font-normal text-gray-600 uppercase tracking-wide">Current Net Worth</span>
                                <p className="text-xs text-gray-500 mt-1">Assets - Liabilities</p>
                            </div>
                            <DollarSign size={32} className={netWorth >= 0 ? 'text-green-700' : 'text-red-700'} />
                        </div>
                        <div className={`text-4xl font-bold mt-2 ${netWorth >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {formatCurrency(netWorth, currency)}
                        </div>
                    </div>
                </>
            )}

            {/* Snapshot History */}
            <div>
                <h2 className="text-xl font-normal mb-3">Financial History</h2>
                <p className="text-sm text-gray-600 mb-4">
                    All your saved snapshots
                </p>
                <SnapshotHistoryTable
                    snapshots={snapshots}
                    onDelete={deleteSnapshot}
                />
            </div>
        </div>
    )
}
