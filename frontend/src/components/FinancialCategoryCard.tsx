import { useState } from 'react'
import type { FinancialCategory, FinancialItem } from '../types'
import { useFinancialItems } from '../context/FinancialItemsContext'
import FinancialItemModal from './FinancialItemModal'

interface FinancialCategoryCardProps {
    title: string
    category: FinancialCategory
    borderColor: string
}

function FinancialCategoryCard({
    title,
    category,
    borderColor,
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
                className="flex-1 border-2 p-6 flex flex-col bg-white"
                style={{
                    borderColor,
                    minHeight: '300px',
                }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
                    <button
                        onClick={handleAddNew}
                        className="px-3 py-1 bg-white border shadow hover:shadow-md transition-shadow text-sm font-medium"
                        style={{ color: borderColor }}
                    >
                        + Add New
                    </button>
                </div>

                <div className="border-t-2 mb-3" style={{ borderColor }} />

                {/* Items List */}
                <div className="flex-1 overflow-y-auto space-y-2">
                    {items.length === 0 ? (
                        <p className="text-gray-500 font-light text-center py-8">No items yet. Click "Add New" to create one.</p>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white bg-opacity-60 border p-3 flex justify-between items-center hover:bg-opacity-80 transition-all cursor-pointer"
                                onClick={() => handleEdit(item)}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">📋</span>
                                    <span className="font-normal text-gray-700">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-800">
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
                        ))
                    )}
                </div>

                {/* Total */}
                {items.length > 0 && (
                    <>
                        <div className="border-t-2 mt-3 pt-3" style={{ borderColor }}>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-800 text-lg">Total:</span>
                                <span className="font-bold text-gray-800 text-xl">
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
