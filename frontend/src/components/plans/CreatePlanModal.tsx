import { useState } from 'react'
import { usePlans } from '../../context/PlansContext'
import { useUser } from '../../context/UserContext'
import { useNavigate } from 'react-router-dom'

interface CreatePlanModalProps {
    isOpen: boolean
    onClose: () => void
}

function CreatePlanModal({ isOpen, onClose }: CreatePlanModalProps) {
    const { createPlan } = usePlans()
    const { userProfile, updateProfile } = useUser()
    const navigate = useNavigate()

    const [newPlanName, setNewPlanName] = useState('')
    const [description, setDescription] = useState('')
    const [creating, setCreating] = useState(false)

    // JIT Profile State
    const needsProfile = !userProfile?.dateOfBirth || !userProfile?.full_name
    const [fullName, setFullName] = useState(userProfile?.full_name || '')
    const [dateOfBirth, setDateOfBirth] = useState(userProfile?.dateOfBirth || '')
    // Default death age if not set? UserContext/Profile usually handles this or defaults. 
    // We'll leave customDeathDate optional or default.

    const handleCreate = async () => {
        if (!newPlanName.trim()) {
            alert('Please enter a plan name')
            return
        }

        if (needsProfile) {
            if (!fullName.trim() || !dateOfBirth) {
                alert('Please complete your profile details to continue.')
                return
            }
        }

        setCreating(true)
        try {
            // 1. Update Profile if needed
            if (needsProfile) {
                await updateProfile({
                    full_name: fullName.trim(),
                    dateOfBirth: dateOfBirth
                })
            }

            // 2. Create Plan
            await createPlan(newPlanName.trim(), description.trim())

            navigate('/plans')
            setNewPlanName('')
            setDescription('')
            onClose()
        } catch (error) {
            console.error('Failed to create plan:', error)
            alert('Failed to complete setup. Please try again.')
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
                    {needsProfile && (
                        <div className="bg-gray-50 p-4 border border-gray-200 mb-4 animate-in fade-in slide-in-from-top-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 text-gray-800">Step 1: About You</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-normal mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-normal mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                                    />
                                </div>
                            </div>
                            <div className="h-px bg-gray-200 my-4" />
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-800">Step 2: Plan Details</h3>
                        </div>
                    )}

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
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            autoFocus
                            disabled={creating}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label htmlFor="planDescription" className="block text-sm font-normal uppercase tracking-wide">
                                Description <span className="text-gray-400 lowercase font-light">(optional)</span>
                            </label>
                            <span className={`text-xs ${description.length > 144 ? 'text-red-500' : 'text-gray-400'}`}>
                                {description.length}/144
                            </span>
                        </div>
                        <textarea
                            id="planDescription"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={144}
                            placeholder="Briefly describe the goal of this plan..."
                            className="w-full px-4 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black resize-none text-sm"
                            disabled={creating}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => handleCreate()}
                            disabled={creating || !newPlanName.trim() || description.length > 144 || (needsProfile && (!fullName.trim() || !dateOfBirth))}
                            className="w-full px-4 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed font-normal text-sm uppercase tracking-wide transition-colors"
                        >
                            {creating ? 'Creating...' : 'Create Plan'}
                        </button>
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
