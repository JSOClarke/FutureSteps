import { useState } from 'react'
import { usePlans } from '../../context/PlansContext'
import { Pencil, Trash2 } from 'lucide-react'

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

    if (!isOpen) return null

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white shadow-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Manage Plans</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>



                {/* Create New Plan */}
                <div className="mb-6 p-4 bg-white border border-black">
                    <h3 className="font-normal text-black mb-3 text-sm uppercase tracking-wide">Create New Plan</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newPlanName}
                            onChange={(e) => setNewPlanName(e.target.value)}
                            placeholder="Plan name (e.g., Conservative, Aggressive)"
                            className="flex-1 px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate(false)}
                        />
                        <button
                            onClick={() => handleCreate(false)}
                            className="px-4 py-2 bg-black text-white hover:bg-gray-800 font-normal text-sm uppercase tracking-wide whitespace-nowrap"
                        >
                            Create Blank
                        </button>
                        <button
                            onClick={() => handleCreate(true)}
                            className="px-4 py-2 bg-white border border-black text-black hover:bg-gray-50 font-normal text-sm uppercase tracking-wide whitespace-nowrap"
                            title="Duplicate current plan"
                        >
                            Duplicate Current
                        </button>
                    </div>
                </div>

                {/* Plans List */}
                <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Your Plans ({plans.length})</h3>
                    <div className="space-y-2">
                        {plans.map(plan => (
                            <div
                                key={plan.id}
                                className={`p-4 border-2 ${plan.id === activePlanId
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-white'
                                    } hover:bg-gray-50 transition-colors`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        {editingId === plan.id ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="flex-1 px-2 py-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleRename(plan.id)
                                                        if (e.key === 'Escape') setEditingId(null)
                                                    }}
                                                />
                                                <button
                                                    onClick={() => handleRename(plan.id)}
                                                    className="px-3 py-1 bg-blue-500 text-white text-sm hover:bg-blue-600"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm hover:bg-gray-400"
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
                                                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-medium">
                                                            ACTIVE
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {plan.financialItems.length} financial items •{' '}
                                                    {plan.milestones.length} milestones •{' '}
                                                    Created {new Date(plan.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {editingId !== plan.id && (
                                        <div className="flex gap-2 ml-4">
                                            {plan.id !== activePlanId && (
                                                <button
                                                    onClick={() => {
                                                        setActivePlan(plan.id)
                                                        onClose()
                                                    }}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium"
                                                >
                                                    Switch To
                                                </button>
                                            )}
                                            <button
                                                onClick={() => startEditing(plan.id, plan.name)}
                                                className="px-3 py-1 bg-white border border-black text-black hover:bg-gray-50 text-sm font-light uppercase tracking-wide flex items-center gap-2"
                                            >
                                                <Pencil size={14} /> Rename
                                            </button>
                                            {showConfirmDelete === plan.id ? (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleDelete(plan.id)}
                                                        className="px-3 py-1 bg-red-500 text-white hover:bg-red-600 text-sm font-medium"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => setShowConfirmDelete(null)}
                                                        className="px-3 py-1 bg-gray-300 text-gray-700 hover:bg-gray-400 text-sm font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setShowConfirmDelete(plan.id)}
                                                    className="px-3 py-1 bg-white border border-black text-black hover:bg-gray-50 text-sm font-light uppercase tracking-wide flex items-center gap-2"
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

                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PlanModal
