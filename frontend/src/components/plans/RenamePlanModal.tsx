import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
} from '../ui/dialog'
import { usePlans } from '../../context/PlansContext'
import { useToast } from '../../context/ToastContext'

interface RenamePlanModalProps {
    isOpen: boolean
    onClose: () => void
    planId: string
    currentName: string
    currentDescription?: string
}

export default function RenamePlanModal({
    isOpen,
    onClose,
    planId,
    currentName,
    currentDescription
}: RenamePlanModalProps) {
    const [name, setName] = useState(currentName)
    const [description, setDescription] = useState(currentDescription || '')
    const [loading, setLoading] = useState(false)
    const { updatePlan } = usePlans()
    const { toast } = useToast()

    useEffect(() => {
        if (isOpen) {
            setName(currentName)
            setDescription(currentDescription || '')
        }
    }, [isOpen, currentName, currentDescription])

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()

        if (!name.trim()) {
            toast({
                title: 'Validation Error',
                message: 'Plan name cannot be empty',
                type: 'error'
            })
            return
        }

        if (name === currentName && description === (currentDescription || '')) {
            onClose()
            return
        }

        try {
            setLoading(true)
            await updatePlan(planId, { name: name.trim(), description: description.trim() })
            toast({
                title: 'Plan Updated',
                message: 'Plan details updated successfully',
                type: 'success'
            })
            onClose()
        } catch (error) {
            console.error('Failed to rename plan:', error)
            toast({
                title: 'Error',
                message: 'Failed to update plan name',
                type: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Plan</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="plan-name" className="block text-sm font-medium text-gray-700 mb-2">
                                Plan Name
                            </label>
                            <input
                                id="plan-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter plan name"
                                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                                autoFocus
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label htmlFor="planDescription" className="block text-sm font-medium text-gray-700">
                                    Description <span className="text-gray-400 font-normal text-xs">(optional)</span>
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
                                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black resize-none text-sm"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 border border-black hover:bg-gray-100 transition-colors text-sm font-normal uppercase tracking-wide disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !name.trim() || description.length > 144}
                                className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm font-normal uppercase tracking-wide disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
}
