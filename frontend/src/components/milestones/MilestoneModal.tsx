import { useState, useEffect } from 'react'
import CurrencyInput from '../shared/CurrencyInput'
import type { Milestone } from './types'

interface MilestoneModalProps {
    isOpen: boolean
    onClose: () => void
    initialMilestone: Milestone | null
    onSave: (milestone: Omit<Milestone, 'id'> | null) => void
}

const PRESET_COLORS = [
    '#22C55E', // Green (Default)
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#6366F1', // Indigo
]

function MilestoneModal({
    isOpen,
    onClose,
    initialMilestone,
    onSave
}: MilestoneModalProps) {
    const [name, setName] = useState('')
    const [value, setValue] = useState('')
    const [type, setType] = useState<'net_worth' | 'year'>('net_worth')
    const [color, setColor] = useState(PRESET_COLORS[0])

    useEffect(() => {
        if (isOpen) {
            if (initialMilestone) {
                setName(initialMilestone.name)
                setValue(initialMilestone.value.toString())
                setType(initialMilestone.type || 'net_worth')
                setColor(initialMilestone.color || PRESET_COLORS[0])
            } else {
                setName('')
                setValue('')
                setType('net_worth')
                setColor(PRESET_COLORS[0])
            }
        }
    }, [isOpen, initialMilestone])

    const handleSave = () => {
        if (name.trim() && value && Number(value) > 0) {
            onSave({
                name: name.trim(),
                value: Number(value),
                type,
                color
            })
            onClose()
        }
    }

    const handleClear = () => {
        onSave(null)
        setName('')
        setValue('')
        setType('net_worth')
        setColor(PRESET_COLORS[0])
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 w-full max-w-md border border-black">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialMilestone ? 'Edit Milestone' : 'Add Milestone'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Milestone Type
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setType('net_worth')}
                                className={`flex-1 py-2 px-3 text-sm font-medium border ${type === 'net_worth'
                                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Net Worth
                            </button>
                            <button
                                onClick={() => setType('year')}
                                className={`flex-1 py-2 px-3 text-sm font-medium border ${type === 'year'
                                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Year
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="milestone-name" className="block text-sm font-medium text-gray-700 mb-2">
                            Milestone Name *
                        </label>
                        <input
                            id="milestone-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={type === 'net_worth' ? "e.g., First Million" : "e.g., Move House"}
                            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {type === 'net_worth' ? (
                        <CurrencyInput
                            id="milestone-value"
                            label="Target Net Worth"
                            value={value}
                            onChange={setValue}
                            placeholder="1,000,000"
                            required
                            allowDecimals={false}
                        />
                    ) : (
                        <div>
                            <label htmlFor="milestone-year" className="block text-sm font-medium text-gray-700 mb-2">
                                Target Year *
                            </label>
                            <input
                                id="milestone-year"
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="2030"
                                min={new Date().getFullYear()}
                                max={2100}
                                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-gray-900 scale-110' : 'border-transparent'
                                        }`}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            ))}
                        </div>
                    </div>
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
                            Delete
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
