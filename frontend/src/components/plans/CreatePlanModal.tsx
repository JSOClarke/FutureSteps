import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlans } from '../../context/PlansContext'
import { useUser } from '../../context/UserContext'
import { useToast } from '../../context/ToastContext'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
} from '../ui/dialog'
import { ToggleGroup } from '../ui/ToggleGroup'

interface CreatePlanModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function CreatePlanModal({ isOpen, onClose }: CreatePlanModalProps) {
    const navigate = useNavigate()
    const { createPlan, duplicatePlan, plans } = usePlans()
    const { userProfile, updateProfile } = useUser()
    const { toast } = useToast()

    const [newPlanName, setNewPlanName] = useState('')
    const [description, setDescription] = useState('')
    const [creating, setCreating] = useState(false)
    const [mode, setMode] = useState<'scratch' | 'clone'>('scratch')
    const [sourcePlanId, setSourcePlanId] = useState('')

    // Profile fields (if needed)
    const [fullName, setFullName] = useState('')
    const [dateOfBirth, setDateOfBirth] = useState('')

    const needsProfile = !userProfile?.full_name || !userProfile?.dateOfBirth

    useEffect(() => {
        if (isOpen) {
            setNewPlanName('')
            setDescription('')
            setMode('scratch')
            setSourcePlanId('')
            setFullName(userProfile?.full_name || '')
            setDateOfBirth(userProfile?.dateOfBirth || '')
        }
    }, [isOpen, userProfile])

    const handleCreate = async () => {
        if (creating) return

        try {
            setCreating(true)

            // Update profile if needed
            if (needsProfile) {
                await updateProfile({
                    full_name: fullName.trim(),
                    dateOfBirth: dateOfBirth
                })
            }

            // Create or Duplicate logic
            let newPlanId: string
            if (mode === 'clone' && sourcePlanId) {
                newPlanId = await duplicatePlan(sourcePlanId, newPlanName.trim(), description.trim())
            } else {
                newPlanId = await createPlan(newPlanName.trim(), description.trim())
            }

            toast({
                title: mode === 'clone' ? 'Plan Cloned' : 'Plan Created',
                message: `"${newPlanName}" has been ${mode === 'clone' ? 'cloned' : 'created'} successfully`,
                type: 'success'
            })

            onClose()
            navigate(`/plans/${newPlanId}`)
        } catch (error) {
            console.error('Failed to create plan:', error)
            alert('Failed to complete setup. Please try again.')
        } finally {
            setCreating(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Plan</DialogTitle>
                    <p className="text-sm text-gray-600 mt-1 font-light">Start building your financial projection</p>
                </DialogHeader>
                <DialogBody>
                    <div className="space-y-4">
                        {needsProfile && (
                            <div className="bg-gray-50 p-4 border border-gray-200 mb-4 animate-in fade-in slide-in-from-top-4">
                                <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 text-gray-800">Step 1: About You</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label htmlFor="create-profile-name" className="block text-sm font-normal mb-1">Full Name</label>
                                        <input
                                            id="create-profile-name"
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Your full name"
                                            className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                                            data-testid="create-profile-name-input"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="create-profile-dob" className="block text-sm font-normal mb-1">Date of Birth</label>
                                        <input
                                            id="create-profile-dob"
                                            type="date"
                                            value={dateOfBirth}
                                            onChange={(e) => setDateOfBirth(e.target.value)}
                                            className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                                            data-testid="create-profile-dob-input"
                                        />
                                    </div>
                                </div>
                                <div className="h-px bg-gray-200 my-4" />
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-800">Step 2: Plan Details</h3>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-normal mb-2 uppercase tracking-wide">
                                Start From
                            </label>
                            <ToggleGroup
                                options={[
                                    { label: 'Scratch', value: 'scratch' },
                                    {
                                        label: 'Existing Plan',
                                        value: 'clone',
                                        disabled: plans.length === 0,
                                        title: plans.length === 0 ? "No plans available to clone" : ""
                                    }
                                ]}
                                value={mode}
                                onChange={(val) => setMode(val as 'scratch' | 'clone')}
                            />
                        </div>

                        {mode === 'clone' && (
                            <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                                <label htmlFor="sourcePlan" className="block text-sm font-normal mb-2 uppercase tracking-wide">
                                    Source Plan
                                </label>
                                <select
                                    id="sourcePlan"
                                    value={sourcePlanId}
                                    onChange={(e) => {
                                        setSourcePlanId(e.target.value)
                                        // Auto-fill name if empty
                                        if (!newPlanName && e.target.value) {
                                            const plan = plans.find(p => p.id === e.target.value)
                                            if (plan) setNewPlanName(`${plan.name} (Copy)`)
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black bg-white appearance-none"
                                >
                                    <option value="">Select a plan to clone...</option>
                                    {plans.map(plan => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name}
                                        </option>
                                    ))}
                                </select>
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
                                autoFocus={!needsProfile}
                                disabled={creating}
                                data-testid="create-plan-name-input"
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
                                data-testid="create-plan-description-input"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={onClose}
                                disabled={creating}
                                className="px-6 py-2 border border-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-normal text-sm uppercase tracking-wide transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleCreate()}
                                disabled={creating || !newPlanName.trim() || description.length > 144 || (needsProfile && (!fullName.trim() || !dateOfBirth)) || (mode === 'clone' && !sourcePlanId)}
                                className="w-full px-4 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed font-normal text-sm uppercase tracking-wide transition-colors"
                                data-testid="create-plan-submit-button"
                            >
                                {creating ? 'Creating...' : (mode === 'clone' ? 'Clone Plan' : 'Create Plan')}
                            </button>
                        </div>
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
}
