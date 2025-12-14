import { useState } from 'react'
import { usePlans } from '../../context/PlansContext'
import { useNavigate } from 'react-router-dom'

interface CreatePlanModalProps {
    isOpen: boolean
    onClose: () => void
}

function CreatePlanModal({ isOpen, onClose }: CreatePlanModalProps) {
    const { createPlan, activePlanId } = usePlans()
    const [newPlanName, setNewPlanName] = useState('')
    const [creating, setCreating] = useState(false)
    const navigate = useNavigate()

    const handleCreate = async (duplicate: boolean = false) => {
        if (!newPlanName.trim()) {
            alert('Please enter a plan name')
            return
        }

        setCreating(true)
        try {
            await createPlan(newPlanName.trim(), duplicate ? activePlanId || undefined : undefined)

            // createPlan already sets the new plan as active in the context
            navigate('/plans')

            setNewPlanName('')
            onClose()
        } catch (error) {
            console.error('Failed to create plan:', error)
            alert('Failed to create plan. Please try again.')
        } finally {
            setCreating(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-black w-full max-w-md">
                {/* Header */}
                <div className="border-b-2 border-black p-4">
                    <h2 className="text-2xl font-normal">Create New Plan</h2>
                    <p className="text-sm text-gray-600 mt-1">Start building your financial projection</p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="planName" className="block text-sm font-normal mb-2 uppercase tracking-wide">
                            Plan Name
                        </label>
                        <input
                            id="planName"
                            type="text"
                            value={newPlanName}
                            onChange={(e) => setNewPlanName(e.target.value)}
                            placeholder="e.g., Conservative, Aggressive, Retirement 2040"
                            className="w-full px-4 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate(false)}
                            autoFocus
                            disabled={creating}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => handleCreate(false)}
                            disabled={creating || !newPlanName.trim()}
                            className="flex-1 px-4 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed font-normal text-sm uppercase tracking-wide transition-colors"
                        >
                            {creating ? 'Creating...' : 'Create Blank Plan'}
                        </button>
                        {activePlanId && (
                            <button
                                onClick={() => handleCreate(true)}
                                disabled={creating || !newPlanName.trim()}
                                className="flex-1 px-4 py-3 bg-white border border-black text-black hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed font-normal text-sm uppercase tracking-wide transition-colors"
                                title="Duplicate current plan data"
                            >
                                {creating ? 'Creating...' : 'Duplicate Current'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t-2 border-black p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        disabled={creating}
                        className="px-6 py-2 border border-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-normal text-sm uppercase tracking-wide transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreatePlanModal
