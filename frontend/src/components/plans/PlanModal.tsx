import { useState } from 'react'
import { usePlans } from '../../context/PlansContext'
import { Pencil, Trash2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
} from '../ui/dialog'

interface PlanModalProps {
    isOpen: boolean
    onClose: () => void
}

function PlanModal({ isOpen, onClose }: PlanModalProps) {
    const { plans, activePlanId, createPlan, deletePlan, renamePlan, setActivePlan } = usePlans()
    const [newPlanName, setNewPlanName] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null)

    const handleCreate = (duplicate: boolean = false) => {
        if (!newPlanName.trim()) {
            alert('Please enter a plan name')
            return
        }

        createPlan(newPlanName, duplicate ? activePlanId || undefined : undefined)
        setNewPlanName('')
    }

    const handleRename = (id: string) => {
        if (!editName.trim()) {
            alert('Please enter a plan name')
            return
        }

        renamePlan(id, editName)
        setEditingId(null)
        setEditName('')
    }

    const handleDelete = (id: string) => {
        if (plans.length === 1) {
            alert('Cannot delete the last plan')
            return
        }

        deletePlan(id)
        setShowConfirmDelete(null)
    }

    const startEditing = (id: string, currentName: string) => {
        setEditingId(id)
        setEditName(currentName)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Plans</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    {/* Create New Plan */}
                    <div className="mb-6 p-4 bg-white border border-black">
                        <h3 className="font-normal text-black mb-3 text-sm uppercase tracking-wide">Create New Plan</h3>
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={newPlanName}
                                onChange={(e) => setNewPlanName(e.target.value)}
                                placeholder="Plan name (e.g., Conservative, Aggressive)"
                                className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate(false)}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleCreate(false)}
                                    className="flex-1 px-3 py-2 bg-black text-white hover:bg-gray-800 font-normal text-xs sm:text-sm uppercase tracking-wide transition-colors"
                                >
                                    Create Blank
                                </button>
                                <button
                                    onClick={() => handleCreate(true)}
                                    className="flex-1 px-3 py-2 bg-white border border-black text-black hover:bg-gray-50 font-normal text-xs sm:text-sm uppercase tracking-wide transition-colors"
                                    title="Duplicate current plan"
                                >
                                    Duplicate
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Plans List */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-3">Your Plans ({plans.length})</h3>
                        <div className="space-y-2">
                            {plans.map(plan => (
                                <div
                                    key={plan.id}
                                    className={`p-4 border ${plan.id === activePlanId
                                        ? 'border-black bg-gray-50'
                                        : 'border-gray-200 bg-white'
                                        } hover:bg-gray-50 transition-colors`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div className="flex-1">
                                            {editingId === plan.id ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="flex-1 px-2 py-1 border border-black focus:outline-none focus:ring-1 focus:ring-black"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleRename(plan.id)
                                                            if (e.key === 'Escape') setEditingId(null)
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => handleRename(plan.id)}
                                                        className="px-3 py-1 bg-black text-white text-sm hover:bg-gray-800 uppercase tracking-wide transition-colors"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="px-3 py-1 bg-white border border-black text-black text-sm hover:bg-gray-50 uppercase tracking-wide transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-lg">
                                                            {plan.name}
                                                        </h4>
                                                        {plan.id === activePlanId && (
                                                            <span className="px-2 py-0.5 bg-black text-white text-xs font-medium uppercase tracking-wide">
                                                                ACTIVE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-1 font-light">
                                                        {plan.financialItems.length} financial items •{' '}
                                                        {plan.milestones.length} milestones •{' '}
                                                        Created {new Date(plan.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {editingId !== plan.id && (
                                            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:ml-4">
                                                {plan.id !== activePlanId && (
                                                    <button
                                                        onClick={() => {
                                                            setActivePlan(plan.id)
                                                            onClose()
                                                        }}
                                                        className="px-2 sm:px-3 py-1 bg-white border border-black text-black hover:bg-gray-50 text-xs sm:text-sm font-light uppercase tracking-wide transition-colors"
                                                    >
                                                        Switch
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => startEditing(plan.id, plan.name)}
                                                    className="px-2 sm:px-3 py-1 bg-white border border-black text-black hover:bg-gray-50 text-xs sm:text-sm font-light uppercase tracking-wide flex items-center gap-1 transition-colors"
                                                >
                                                    <Pencil size={14} /> Rename
                                                </button>
                                                {showConfirmDelete === plan.id ? (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleDelete(plan.id)}
                                                            className="px-2 sm:px-3 py-1 bg-red-600 text-white hover:bg-red-700 text-xs sm:text-sm font-medium uppercase tracking-wide transition-colors"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => setShowConfirmDelete(null)}
                                                            className="px-2 sm:px-3 py-1 bg-white border border-black text-black hover:bg-gray-50 text-xs sm:text-sm font-light uppercase tracking-wide transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setShowConfirmDelete(plan.id)}
                                                        className="px-2 sm:px-3 py-1 bg-white border border-black text-black hover:bg-gray-50 text-xs sm:text-sm font-light uppercase tracking-wide flex items-center gap-1 transition-colors"
                                                        disabled={plans.length === 1}
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-white border border-black text-black hover:bg-gray-50 font-medium uppercase tracking-wide transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
}

export default PlanModal
