import { useState } from 'react'
import MilestoneModal from './MilestoneModal'
import type { Milestone } from './types'
import { formatCurrency } from '../../utils/formatters'
import { Pencil, Trash2 } from 'lucide-react'


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
            onEdit(editingMilestone.id, { ...data, type: editingMilestone.type || 'net_worth' })
            setEditingMilestone(null)
        } else {
            onAdd({ ...data, type: 'net_worth' }) // Default to net_worth for now
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
                    className="px-6 py-3 bg-white border border-black text-black hover:bg-gray-50 text-sm font-light uppercase tracking-wide transition-colors"
                    title="Manage net worth milestones"
                >
                    Milestones {milestones.length > 0 && `(${milestones.length})`}
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
                                                    {milestone.type === 'year'
                                                        ? milestone.value
                                                        : formatCurrency(milestone.value)}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 ml-2">
                                                <button
                                                    onClick={() => handleEdit(milestone)}
                                                    className="px-2 py-1 text-black hover:text-gray-600 transition-colors"
                                                    title="Edit milestone"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(milestone.id)}
                                                    className="px-2 py-1 text-black hover:text-gray-600 transition-colors"
                                                    title="Delete milestone"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="p-3">
                                <button
                                    onClick={handleAdd}
                                    className="w-full px-3 py-2 bg-black text-white hover:bg-gray-800 text-sm font-normal uppercase tracking-wide transition-colors"
                                >
                                    Add New Milestone
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
                initialMilestone={editingMilestone}
                onSave={handleSave}
            />
        </>
    )
}

export default MilestoneDropdown
