import { useState } from 'react'
import { Delete as Trash2 } from '../../icons'
import type { DashboardItem, FinancialCategory } from '../../types'
import { useDashboardItems } from '../../context/DashboardItemsContext'
import { DashboardItemModal } from './DashboardItemModal'
import { formatCurrency } from '../../utils/formatters'
import { useCurrency } from '../../hooks/useCurrency'

interface DashboardCategoryCardProps {
    title: string
    category: FinancialCategory
    backgroundColor: string
}

export function DashboardCategoryCard({ title, category, backgroundColor }: DashboardCategoryCardProps) {
    const { getItemsByCategory, getTotalByCategory, addItem, updateItem, deleteItem } = useDashboardItems()
    const items = getItemsByCategory(category)
    const currency = useCurrency()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<DashboardItem | undefined>()

    const handleAddNew = () => {
        setEditingItem(undefined)
        setIsModalOpen(true)
    }

    const handleEdit = (item: DashboardItem) => {
        setEditingItem(item)
        setIsModalOpen(true)
    }

    const handleSave = (data: { name: string; amount: number }) => {
        if (editingItem) {
            updateItem(editingItem.id, data)
        } else {
            addItem({ ...data, category })
        }
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            deleteItem(id)
        }
    }

    return (
        <>
            <div
                className="flex-1 p-4 flex flex-col border border-black"
                style={{ backgroundColor, minHeight: '250px' }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-normal text-black">{title}</h3>
                    <button
                        onClick={handleAddNew}
                        className="px-3 py-1.5 bg-black text-white hover:bg-gray-800 transition-colors text-xs font-normal uppercase tracking-wide"
                    >
                        Add New
                    </button>
                </div>

                <div className="border-t-2 border-black border-opacity-20 mb-2" />

                {/* Items List */}
                <div className="flex-1 overflow-y-auto space-y-1.5 mb-3">
                    {items.length === 0 ? (
                        <p className="text-gray-500 font-light text-center py-4 text-sm">
                            No items yet
                        </p>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleEdit(item)}
                                className="px-3 py-2 border border-black bg-white hover:bg-gray-50 transition-all shadow-sm flex justify-between items-center group cursor-pointer"
                            >
                                <span className="font-medium text-black text-sm">{item.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-black text-sm">
                                        {formatCurrency(item.amount, currency)}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDelete(item.id)
                                        }}
                                        className="p-1 opacity-0 group-hover:opacity-100 text-black hover:bg-red-100 hover:text-red-600 rounded transition-all"
                                        title="Delete item"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Total */}
                <div className="border-t-2 border-black pt-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-normal text-gray-600 uppercase">Total</span>
                        <span className="text-lg font-bold text-black">
                            {formatCurrency(getTotalByCategory(category), currency)}
                        </span>
                    </div>
                </div>
            </div>

            <DashboardItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingItem}
                category={category}
            />
        </>
    )
}
