import { useState, useEffect } from 'react'
import { useFinancialItems } from '../../context/FinancialItemsContext'
import ReorderableList from '../ReorderableList'

interface PriorityModalProps {
    isOpen: boolean
    onClose: () => void
    type: 'surplus' | 'deficit'
    initialPriority: string[]
    onSave: (priority: string[]) => void
}

function PriorityModal({ isOpen, onClose, type, initialPriority, onSave }: PriorityModalProps) {
    const { items } = useFinancialItems()
    const [priority, setPriority] = useState<string[]>([])

    // Filter to only assets (both surplus and deficit use assets)
    const assets = items.filter(item => item.category === 'assets')

    useEffect(() => {
        if (isOpen) {
            // Initialize priority order
            const assetIds = assets.map(a => a.id)

            if (initialPriority.length > 0) {
                // Use saved priority, adding any new assets at the end
                const savedIds = new Set(initialPriority)
                const newAssets = assetIds.filter(id => !savedIds.has(id))
                setPriority([...initialPriority.filter(id => savedIds.has(id) && assetIds.includes(id)), ...newAssets])
            } else {
                // Default to current order
                setPriority(assetIds)
            }
        }
        // Only run when modal opens or initial priority changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialPriority.join(',')])

    const handleReorder = (reorderedItems: Array<{ id: string; name: string }>) => {
        setPriority(reorderedItems.map(item => item.id))
    }

    const handleSave = () => {
        onSave(priority)
        onClose()
    }

    if (!isOpen) return null

    const listItems = priority
        .map(id => assets.find(a => a.id === id))
        .filter(Boolean)
        .map(asset => ({
            id: asset!.id,
            name: asset!.name
        }))

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white shadow-xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {type === 'surplus' ? 'Surplus Allocation' : 'Deficit Coverage'} Priority
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-4">
                        {type === 'surplus'
                            ? 'When you have extra cash, allocate it to assets in this order:'
                            : 'When you need cash, withdraw from assets in this order:'}
                    </p>

                    {listItems.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            No assets available. Add assets to set priority.
                        </p>
                    ) : (
                        <ReorderableList
                            items={listItems}
                            onReorder={handleReorder}
                            title="Priority Order (Top = First)"
                        />
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={listItems.length === 0}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Priority
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PriorityModal
