import { Delete as Trash2, ChevronDown, ChevronRight } from '../../icons'
import { useState, Fragment } from 'react'
import type { FinancialSnapshot, SnapshotItem } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { getSubCategoryIcon } from '../../utils/subcategoryHelpers'
import { useCurrency } from '../../hooks/useCurrency'
import { supabase } from '../../lib/supabase'

interface SnapshotHistoryTableProps {
    snapshots: FinancialSnapshot[]
    onDelete: (id: string) => void
    onCompare: (snapshot: FinancialSnapshot) => void
}

export function SnapshotHistoryTable({ snapshots, onDelete, onCompare }: SnapshotHistoryTableProps) {
    const currency = useCurrency()
    const [expandedSnapshots, setExpandedSnapshots] = useState<Set<string>>(new Set())
    const [snapshotItems, setSnapshotItems] = useState<Record<string, SnapshotItem[]>>({})
    const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set())

    const toggleExpand = async (snapshotId: string) => {
        const newExpanded = new Set(expandedSnapshots)

        if (newExpanded.has(snapshotId)) {
            // Collapse
            newExpanded.delete(snapshotId)
        } else {
            // Expand and fetch items if not already loaded
            newExpanded.add(snapshotId)

            if (!snapshotItems[snapshotId]) {
                setLoadingItems(new Set([...loadingItems, snapshotId]))

                const { data, error } = await supabase
                    .from('snapshot_items')
                    .select('*')
                    .eq('snapshot_id', snapshotId)
                    .order('category', { ascending: true })

                if (!error && data) {
                    setSnapshotItems({ ...snapshotItems, [snapshotId]: data })
                }

                setLoadingItems(new Set([...loadingItems].filter(id => id !== snapshotId)))
            }
        }

        setExpandedSnapshots(newExpanded)
    }

    if (snapshots.length === 0) {
        return (
            <div className="border border-black bg-white p-8">
                <p className="text-center text-gray-500 font-light">
                    No snapshots yet. Click "Start New Snapshot" above to create your first snapshot.
                </p>
            </div>
        )
    }

    return (
        <div className="border border-black bg-white overflow-x-auto">
            <table className="w-full">
                <thead className="border-b border-black">
                    <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-normal uppercase tracking-wide w-8"></th>
                        <th className="px-4 py-3 text-left text-xs font-normal uppercase tracking-wide">Date</th>
                        <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-normal uppercase tracking-wide">Income</th>
                        <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-normal uppercase tracking-wide">Expenses</th>
                        <th className="hidden lg:table-cell px-4 py-3 text-right text-xs font-normal uppercase tracking-wide">Assets</th>
                        <th className="hidden lg:table-cell px-4 py-3 text-right text-xs font-normal uppercase tracking-wide">Liabilities</th>
                        <th className="px-4 py-3 text-right text-xs font-normal uppercase tracking-wide">Net Worth</th>
                        <th className="px-4 py-3 text-center text-xs font-normal uppercase tracking-wide">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {snapshots.map((snapshot, index) => {
                        const isExpanded = expandedSnapshots.has(snapshot.id)
                        const items = snapshotItems[snapshot.id] || []
                        const isLoading = loadingItems.has(snapshot.id)

                        return (
                            <Fragment key={snapshot.id}>
                                {/* Main Row */}
                                <tr
                                    className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${index === snapshots.length - 1 && !isExpanded ? 'border-b-0' : ''}`}
                                    onClick={() => toggleExpand(snapshot.id)}
                                >
                                    <td className="px-4 py-3">
                                        {isExpanded ? (
                                            <ChevronDown size={16} className="text-gray-600" />
                                        ) : (
                                            <ChevronRight size={16} className="text-gray-600" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-light">
                                        {new Date(snapshot.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="hidden md:table-cell px-4 py-3 text-right text-sm font-medium text-green-600">
                                        {formatCurrency(snapshot.total_income, currency)}
                                    </td>
                                    <td className="hidden md:table-cell px-4 py-3 text-right text-sm font-medium text-red-600">
                                        {formatCurrency(snapshot.total_expenses, currency)}
                                    </td>
                                    <td className="hidden lg:table-cell px-4 py-3 text-right text-sm font-medium">
                                        {formatCurrency(snapshot.total_assets, currency)}
                                    </td>
                                    <td className="hidden lg:table-cell px-4 py-3 text-right text-sm font-medium">
                                        {formatCurrency(snapshot.total_liabilities, currency)}
                                    </td>
                                    <td className={`px-4 py-3 text-right text-sm font-bold ${snapshot.net_worth >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                        {formatCurrency(snapshot.net_worth, currency)}
                                    </td>
                                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onCompare(snapshot)
                                            }}
                                            className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors border border-blue-200"
                                        >
                                            Compare
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onDelete(snapshot.id)
                                            }}
                                            className="p-1.5 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                                            title="Delete snapshot"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>

                                {/* Expanded Details Row */}
                                {isExpanded && (
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <td colSpan={8} className="px-4 py-4">
                                            {isLoading ? (
                                                <p className="text-sm text-gray-500 text-center py-2">Loading items...</p>
                                            ) : items.length === 0 ? (
                                                <p className="text-sm text-gray-500 text-center py-2">No items in this snapshot</p>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    {/* Income Items */}
                                                    {items.filter(i => i.category === 'income').length > 0 && (
                                                        <div>
                                                            <h4 className="text-xs font-normal uppercase tracking-wide text-gray-600 mb-2">Income</h4>
                                                            <div className="space-y-1">
                                                                {items.filter(i => i.category === 'income').map(item => {
                                                                    const Icon = getSubCategoryIcon(item.subCategory as any)
                                                                    return (
                                                                        <div key={item.id} className="flex justify-between items-center text-sm bg-white border border-gray-200 px-2 py-1">
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
                                                    {items.filter(i => i.category === 'expenses').length > 0 && (
                                                        <div>
                                                            <h4 className="text-xs font-normal uppercase tracking-wide text-gray-600 mb-2">Expenses</h4>
                                                            <div className="space-y-1">
                                                                {items.filter(i => i.category === 'expenses').map(item => {
                                                                    const Icon = getSubCategoryIcon(item.subCategory as any)
                                                                    return (
                                                                        <div key={item.id} className="flex justify-between items-center text-sm bg-white border border-gray-200 px-2 py-1">
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
                                                    {items.filter(i => i.category === 'assets').length > 0 && (
                                                        <div>
                                                            <h4 className="text-xs font-normal uppercase tracking-wide text-gray-600 mb-2">Assets</h4>
                                                            <div className="space-y-1">
                                                                {items.filter(i => i.category === 'assets').map(item => {
                                                                    const Icon = getSubCategoryIcon(item.subCategory as any)
                                                                    return (
                                                                        <div key={item.id} className="flex justify-between items-center text-sm bg-white border border-gray-200 px-2 py-1">
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
                                                    {items.filter(i => i.category === 'liabilities').length > 0 && (
                                                        <div>
                                                            <h4 className="text-xs font-normal uppercase tracking-wide text-gray-600 mb-2">Liabilities</h4>
                                                            <div className="space-y-1">
                                                                {items.filter(i => i.category === 'liabilities').map(item => {
                                                                    const Icon = getSubCategoryIcon(item.subCategory as any)
                                                                    return (
                                                                        <div key={item.id} className="flex justify-between items-center text-sm bg-white border border-gray-200 px-2 py-1">
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
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
