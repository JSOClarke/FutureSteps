import { useState } from 'react'

interface ReorderableListItem {
    id: string
    name: string
}

interface ReorderableListProps {
    items: ReorderableListItem[]
    onReorder: (items: ReorderableListItem[]) => void
    title: string
}

function ReorderableList({ items, onReorder, title }: ReorderableListProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

    const handleDragStart = (index: number) => {
        setDraggedIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()

        if (draggedIndex === null || draggedIndex === index) return

        const newItems = [...items]
        const draggedItem = newItems[draggedIndex]

        // Remove from old position
        newItems.splice(draggedIndex, 1)

        // Insert at new position
        newItems.splice(index, 0, draggedItem)

        setDraggedIndex(index)
        onReorder(newItems)
    }

    const handleDragEnd = () => {
        setDraggedIndex(null)
    }

    const moveUp = (index: number) => {
        if (index === 0) return
        const newItems = [...items]
        const temp = newItems[index]
        newItems[index] = newItems[index - 1]
        newItems[index - 1] = temp
        onReorder(newItems)
    }

    const moveDown = (index: number) => {
        if (index === items.length - 1) return
        const newItems = [...items]
        const temp = newItems[index]
        newItems[index] = newItems[index + 1]
        newItems[index + 1] = temp
        onReorder(newItems)
    }

    return (
        <div>
            <h3 className="font-semibold text-gray-700 mb-3">{title}</h3>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white border-2 p-3 flex items-center justify-between cursor-move hover:bg-gray-50 transition-colors ${draggedIndex === index ? 'opacity-50' : ''
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-gray-400 font-mono text-sm">{index + 1}.</span>
                            <span className="font-medium text-gray-800">{item.name}</span>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    moveUp(index)
                                }}
                                disabled={index === 0}
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move up"
                            >
                                ▲
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    moveDown(index)
                                }}
                                disabled={index === items.length - 1}
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move down"
                            >
                                ▼
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
                Drag items to reorder, or use ▲▼ buttons
            </p>
        </div>
    )
}

export default ReorderableList
