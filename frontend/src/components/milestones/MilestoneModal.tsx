import { useState, useEffect } from 'react'
import CurrencyInput from '../shared/CurrencyInput'

interface MilestoneModalProps {
    isOpen: boolean
    onClose: () => void
    initialMilestone: { name: string; value: number } | null
    onSave: (milestone: { name: string; value: number } | null) => void
}

function MilestoneModal({
    isOpen,
    onClose,
    initialMilestone,
    onSave
}: MilestoneModalProps) {
    const [name, setName] = useState('')
    const [value, setValue] = useState('')

    useEffect(() => {
        if (isOpen) {
            if (initialMilestone) {
                setName(initialMilestone.name)
                setValue(initialMilestone.value.toString())
            } else {
                setName('')
                setValue('')
            }
        }
    }, [isOpen, initialMilestone])

    const handleSave = () => {
        if (name.trim() && value && Number(value) > 0) {
            onSave({ name: name.trim(), value: Number(value) })
            onClose()
        }
    }

    const handleClear = () => {
        onSave(null)
        setName('')
        setValue('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 w-full max-w-md border border-black">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Set Net Worth Milestone</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="milestone-name" className="block text-sm font-medium text-gray-700 mb-2">
                            Milestone Name *
                        </label>
                        <input
                            id="milestone-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., First Million"
                            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <CurrencyInput
                        id="milestone-value"
                        label="Target Net Worth"
                        value={value}
                        onChange={setValue}
                        placeholder="1,000,000"
                        required
                        allowDecimals={false}
                    />
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleSave}
                        disabled={!name.trim() || !value || Number(value) <= 0}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Save Milestone
                    </button>
                    {initialMilestone && (
                        <button
                            onClick={handleClear}
                            className="px-4 py-2 bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MilestoneModal
