import { useState } from 'react'
import MilestoneModal from './MilestoneModal'
import type { Milestone } from './types'


interface MilestoneDropdownProps {
    milestones: Milestone[]
    onAdd: (milestone: Omit<Milestone, 'id'>) => void
    onEdit: (id: string, milestone: Omit<Milestone, 'id'>) => void
    onDelete: (id: string) => void
}

function MilestoneDropdown({ milestones, onAdd, onEdit, onDelete }: MilestoneDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)

    const handleAdd = () => {
        setEditingMilestone(null)
        setModalOpen(true)
        setIsOpen(false)
    }

    const handleEdit = (milestone: Milestone) => {
        setEditingMilestone(milestone)
        setModalOpen(true)
        setIsOpen(false)
    }

    const handleSave = (data: { name: string; value: number } | null) => {
        if (!data) {
            setModalOpen(false)
            setEditingMilestone(null)
            return
        }

        if (editingMilestone) {
            onEdit(editingMilestone.id, data)
        } else {
            onAdd(data)
        }
        setModalOpen(false)
        setEditingMilestone(null)
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this milestone?')) {
            onDelete(id)
        }
    }

    return (
        <>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`px-4 py-2 border-2 text-sm font-medium transition-colors ${milestones.length > 0
                        ? 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200'
                        }`}
                    title="Manage net worth milestones"
                >
                    🎯 Milestones {milestones.length > 0 && `(${milestones.length})`}
                </button>

                {isOpen && (
                    <>
                        {/* Backdrop to close dropdown */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown menu */}
                        <div className="absolute right-0 mt-2 w-80 bg-white border border-black shadow-lg z-20">
                            <div className="p-3 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-800">Milestone Goals</h3>
                            </div>

                            {milestones.length === 0 ? (
                                <div className="p-4 text-sm text-gray-500 text-center">
                                    No milestones set. Click below to add one.
                                </div>
                            ) : (
                                <div className="max-h-64 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                    {milestones.map((milestone) => (
                                        <div
                                            key={milestone.id}
                                            className="p-3 border-b border-gray-100 hover:bg-gray-50 flex items-center justify-between group"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-800 truncate">
                                                    {milestone.name}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    ${milestone.value.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 ml-2">
                                                <button
                                                    onClick={() => handleEdit(milestone)}
                                                    className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 transition-colors"
                                                    title="Edit milestone"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(milestone.id)}
                                                    className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors"
                                                    title="Delete milestone"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="p-3">
                                <button
                                    onClick={handleAdd}
                                    className="w-full px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors"
                                >
                                    + Add New Milestone
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <MilestoneModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false)
                    setEditingMilestone(null)
                }}
                initialMilestone={editingMilestone ? { name: editingMilestone.name, value: editingMilestone.value } : null}
                onSave={handleSave}
            />
        </>
    )
}

export default MilestoneDropdown
