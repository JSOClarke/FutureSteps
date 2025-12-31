import { useState } from 'react'
import MilestoneModal from './MilestoneModal'
import type { Milestone } from './types'
import { formatCurrency } from '../../utils/formatters'
import { useCurrency } from '../../hooks/useCurrency'
import { Edit as Pencil, Delete as Trash2, Add as Plus } from '../../icons'

import { NavButton } from '../shared/NavButton'
import { ConfirmationDialog } from '../shared/ConfirmationDialog'


interface MilestoneDropdownProps {
    milestones: Milestone[]
    onAdd: (milestone: Omit<Milestone, 'id'>) => void
    onEdit: (id: string, milestone: Omit<Milestone, 'id'>) => void
    onDelete: (id: string) => void
}

function MilestoneDropdown({ milestones, onAdd, onEdit, onDelete }: MilestoneDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const currency = useCurrency()
    const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
    const [milestoneToDelete, setMilestoneToDelete] = useState<string | null>(null)

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

    const handleSave = (data: Omit<Milestone, 'id'> | null) => {
        if (!data) {
            if (editingMilestone) {
                // Deleting via modal
                setMilestoneToDelete(editingMilestone.id)
            }
            setModalOpen(false)
            setEditingMilestone(null)
            // Keep isOpen for dropdown? Maybe close it.
            // setIsOpen(false) 
            return
        }

        if (editingMilestone) {
            onEdit(editingMilestone.id, data)
            setEditingMilestone(null)
        } else {
            onAdd(data)
        }
        setModalOpen(false)
        setEditingMilestone(null)
    }

    const handleDeleteClick = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        setMilestoneToDelete(id)
    }

    const confirmDeleteMilestone = () => {
        if (milestoneToDelete) {
            onDelete(milestoneToDelete)
            setMilestoneToDelete(null)
        }
    }

    return (
        <>
            <div className="relative">
                <NavButton
                    onClick={() => setIsOpen(!isOpen)}
                    title="Manage net worth milestones"
                >
                    Milestones {milestones.length > 0 && `(${milestones.length})`}
                </NavButton>

                {isOpen && (
                    <>
                        {/* Backdrop to close dropdown */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown menu */}
                        <div className="absolute left-0 mt-2 w-80 bg-white border border-black shadow-lg z-20">
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
                                                        : formatCurrency(milestone.value, currency)}
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
                                                    onClick={(e) => handleDeleteClick(milestone.id, e)}
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
                                <NavButton
                                    onClick={() => handleAdd()}
                                    className="w-full justify-center border-t border-gray-100 text-gray-500 hover:text-black py-3 rounded-none"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Add Milestone
                                </NavButton>
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

            <ConfirmationDialog
                isOpen={!!milestoneToDelete}
                onClose={() => setMilestoneToDelete(null)}
                onConfirm={confirmDeleteMilestone}
                title="Delete Milestone"
                description="Are you sure you want to delete this milestone?"
                confirmLabel="Delete"
                variant="danger"
            />
        </>
    )
}

export default MilestoneDropdown
