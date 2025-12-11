import { useState } from 'react'
import type { FinancialItem, FinancialCategory } from '../../types'
import { useFinancialItems } from '../../context/FinancialItemsContext'
import FinancialItemModal from '../FinancialItemModal'
import { formatCurrency } from '../../utils/formatters'
import { FinancialItemCard } from './FinancialItemCard'

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
                className="flex-1 p-6 flex flex-col border border-black"
                style={{
                    backgroundColor,
                    minHeight: '300px',
                }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-normal text-black">{title}</h3>
                    <button
                        onClick={handleAddNew}
                        className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm font-normal uppercase tracking-wide"
                    >
                        Add New
                    </button>
                </div>

                <div className="border-t-2 border-black border-opacity-20 mb-3" />

                {/* Items List */}
                <div className="flex-1 overflow-y-auto space-y-2">
                    {items.length === 0 ? (
                        <p className="text-gray-500 font-light text-center py-8">No items yet. Click "Add New" to create one.</p>
                    ) : (
                        items.map((item) => (
                            <FinancialItemCard
                                key={item.id}
                                item={item}
                                onEdit={() => handleEdit(item)}
                                onDelete={handleDelete}
                                itemColor={itemColor}
                            />
                        ))
                    )}
                </div>

                {/* Total */}
                {items.length > 0 && (
                    <>
                        <div className="border-t-2 border-black border-opacity-20 mt-3 pt-3">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-black text-lg">Total:</span>
                                <span className="font-bold text-black text-xl">
                                    {formatCurrency(total)}
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
