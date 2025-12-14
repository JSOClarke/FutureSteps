import { useState, useEffect } from 'react'
import { useFinancialItems } from '../../context/FinancialItemsContext'
import ReorderableList from '../ReorderableList'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
} from '../ui/dialog'

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

    const listItems = priority
        .map(id => assets.find(a => a.id === id))
        .filter(Boolean)
        .map(asset => ({
            id: asset!.id,
            name: asset!.name
        }))

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {type === 'surplus' ? 'Surplus Allocation' : 'Deficit Coverage'} Priority
                    </DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-4 font-light">
                            {type === 'surplus'
                                ? 'When you have extra cash, allocate it to assets in this order:'
                                : 'When you need cash, withdraw from assets in this order:'}
                        </p>

                        {listItems.length === 0 ? (
                            <p className="text-gray-500 text-center py-8 font-light">
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

                    <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-white text-black border border-black hover:bg-gray-50 text-sm font-normal uppercase tracking-wide transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={listItems.length === 0}
                            className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-normal uppercase tracking-wide transition-colors"
                        >
                            Save Priority
                        </button>
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
}

export default PriorityModal
