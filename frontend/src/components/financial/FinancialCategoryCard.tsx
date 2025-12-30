import { useState } from 'react'
import type { FinancialItem, FinancialCategory } from '../../types'
import { useFinancialItems } from '../../context/FinancialItemsContext'
import FinancialItemModal from '../FinancialItemModal'

import { FinancialItemCard } from './FinancialItemCard'
import SubCategorySelectionModal from './SubCategorySelectionModal'
import type { FinancialSubCategory } from '../../types'

interface FinancialCategoryCardProps {
    title: string
    category: FinancialCategory
    backgroundColor: string
    // Optional props for custom data source (e.g. Health Check)
    items?: FinancialItem[]
    onAdd?: (item: Omit<FinancialItem, 'id'>) => void
    onUpdate?: (id: string, item: Partial<FinancialItem>) => void
    onDelete?: (id: string) => void
    simpleMode?: boolean
}

function FinancialCategoryCard({
    title,
    category,
    backgroundColor,
    items: customItems,
    onAdd,
    onUpdate,
    onDelete,
    simpleMode
}: FinancialCategoryCardProps) {
    // If custom items are provided, use them. Otherwise use context.
    const context = useFinancialItems()

    // Determine which mode we are in
    const isCustomMode = !!customItems

    // Get items
    const items = isCustomMode
        ? (customItems || []).filter(i => i.category === category)
        : context.getItemsByCategory(category)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<FinancialItem | null>(null)
    const [selectedSubCategory, setSelectedSubCategory] = useState<FinancialSubCategory | undefined>(undefined)

    const handleAddNew = () => {
        setEditingItem(null)
        setSelectedSubCategory(undefined)
        setIsSubCategoryModalOpen(true)
    }

    const handleSubCategorySelect = (subCategory: FinancialSubCategory) => {
        setIsSubCategoryModalOpen(false)
        setSelectedSubCategory(subCategory)
        setIsModalOpen(true)
    }

    const handleEdit = (item: FinancialItem) => {
        setEditingItem(item)
        setTimeout(() => {
            setIsModalOpen(true)
        }, 0)
    }

    const handleSave = (data: Omit<FinancialItem, 'id' | 'category'>) => {
        if (editingItem) {
            // Update
            if (isCustomMode && onUpdate) {
                onUpdate(editingItem.id, data)
            } else if (!isCustomMode) {
                context.updateItem(editingItem.id, data)
            }
        } else {
            // Add
            const newItem = {
                ...data,
                category,
                subCategory: selectedSubCategory
            }
            if (isCustomMode && onAdd) {
                onAdd(newItem)
            } else if (!isCustomMode) {
                context.addItem(newItem)
            }
        }
    }

    const handleDeleteClick = (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            if (isCustomMode && onDelete) {
                onDelete(id)
            } else if (!isCustomMode) {
                context.deleteItem(id)
            }
        }
    }

    return (
        <>
            <div
                className="flex-1 p-4 flex flex-col border border-black"
                style={{
                    backgroundColor,
                    minHeight: '300px',
                }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-normal text-black">{title}</h3>
                    <button
                        onClick={handleAddNew}
                        className="px-3 py-1.5 bg-black text-white hover:bg-gray-800 transition-colors text-xs font-normaluppercase tracking-wide"
                        data-testid={`add-new-${category}-button`}
                    >
                        Add New
                    </button>
                </div>

                <div className="border-t-2 border-black border-opacity-20 mb-2" />

                {/* Items List */}
                <div className="flex-1 overflow-y-auto space-y-1.5">
                    {items.length === 0 ? (
                        <p className="text-gray-500 font-light text-center py-8">No items yet. Click "Add New" to create one.</p>
                    ) : (
                        items.map((item) => (
                            <FinancialItemCard
                                key={item.id}
                                item={item}
                                onEdit={() => handleEdit(item)}
                                onDelete={handleDeleteClick}
                            />
                        ))
                    )}
                </div>
            </div>

            <FinancialItemModal
                key={editingItem?.id || 'new'} // Force remount when item changes
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingItem || undefined}
                category={category}
                initialSubCategory={selectedSubCategory}
                simpleMode={simpleMode}
            />

            <SubCategorySelectionModal
                isOpen={isSubCategoryModalOpen}
                onClose={() => setIsSubCategoryModalOpen(false)}
                category={category}
                onSelect={handleSubCategorySelect}
            />
        </>
    )
}

export default FinancialCategoryCard
