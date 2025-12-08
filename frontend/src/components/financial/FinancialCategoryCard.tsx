import { useState } from 'react'
import type { FinancialItem, FinancialCategory } from '../../types'
import { useFinancialItems } from '../../context/FinancialItemsContext'
import FinancialItemModal from '../FinancialItemModal'

interface FinancialCategoryCardProps {
    title: string
    category: FinancialCategory
    backgroundColor: string
    itemColor: string
}

function FinancialCategoryCard({
    title,
    category,
    backgroundColor,
    itemColor,
}: FinancialCategoryCardProps) {
    const { getItemsByCategory, addItem, updateItem, deleteItem } = useFinancialItems()
    const items = getItemsByCategory(category)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<FinancialItem | null>(null)

    const handleAddNew = () => {
        setEditingItem(null)
        setIsModalOpen(true)
    }

    const handleEdit = (item: FinancialItem) => {
        setEditingItem(item)
        setIsModalOpen(true)
    }

    const handleSave = (data: Omit<FinancialItem, 'id' | 'category'>) => {
        if (editingItem) {
            // Update existing item
            updateItem(editingItem.id, data)
        } else {
            // Add new item
            addItem({ ...data, category })
        }
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            deleteItem(id)
        }
    }

    const total = items.reduce((sum, item) => sum + item.value, 0)

    return (
        <>
            <div
                className="flex-1 p-6 flex flex-col"
                style={{
                    backgroundColor,
                    minHeight: '300px',
                }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-black">{title}</h3>
                    <button
                        onClick={handleAddNew}
                        className="px-3 py-1 hover:opacity-90 transition-all text-sm font-medium text-black shadow-sm"
                        style={{ backgroundColor: itemColor }}
                    >
                        + Add New
                    </button>
                </div>

                <div className="border-t-2 border-black border-opacity-20 mb-3" />

                {/* Items List */}
                <div className="flex-1 overflow-y-auto space-y-2">
                    {items.length === 0 ? (
                        <p className="text-gray-500 font-light text-center py-8">No items yet. Click "Add New" to create one.</p>
                    ) : (
                        items.map((item) => {
                            // Build info text for temporal and rate data
                            const infoItems: string[] = []

                            // Add temporal information
                            if (item.startYear || item.endYear) {
                                const start = item.startYear || '—'
                                const end = item.endYear || '—'
                                infoItems.push(`${start} - ${end}`)
                            }

                            // Add rate information based on category
                            if (item.growthRate !== undefined && item.growthRate !== 0) {
                                infoItems.push(`Growth: ${(item.growthRate * 100).toFixed(1)}%`)
                            }
                            if (item.yieldRate !== undefined && item.yieldRate !== 0) {
                                infoItems.push(`Yield: ${(item.yieldRate * 100).toFixed(1)}%`)
                            }
                            if (item.interestRate !== undefined && item.interestRate !== 0) {
                                infoItems.push(`Interest: ${(item.interestRate * 100).toFixed(1)}%`)
                            }

                            return (
                                <div
                                    key={item.id}
                                    className="p-3 flex justify-between items-center hover:opacity-90 transition-all cursor-pointer shadow-sm"
                                    style={{ backgroundColor: itemColor }}
                                    onClick={() => handleEdit(item)}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-normal text-black">{item.name}</span>
                                        {infoItems.length > 0 && (
                                            <span className="text-xs text-black text-opacity-60 mt-1">
                                                {infoItems.join(' • ')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-black">
                                            ${item.value.toLocaleString()}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(item.id)
                                            }}
                                            className="text-red-500 hover:text-red-700 font-bold text-xl"
                                            title="Delete"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Total */}
                {items.length > 0 && (
                    <>
                        <div className="border-t-2 border-black border-opacity-20 mt-3 pt-3">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-black text-lg">Total:</span>
                                <span className="font-bold text-black text-xl">
                                    ${total.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <FinancialItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingItem || undefined}
                category={category}
            />
        </>
    )
}

export default FinancialCategoryCard
