import { useState, useEffect } from 'react'
import CurrencyInput from '../shared/CurrencyInput'
import type { Milestone } from './types'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
} from '../ui/dialog'

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

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {initialMilestone ? 'Edit Milestone' : 'Add Milestone'}
                    </DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Milestone Type
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setType('net_worth')}
                                    disabled={!!initialMilestone}
                                    className={`flex-1 py-2 px-3 text-sm font-medium border transition-colors ${type === 'net_worth'
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        } ${initialMilestone ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Net Worth
                                </button>
                                <button
                                    onClick={() => setType('year')}
                                    disabled={!!initialMilestone}
                                    className={`flex-1 py-2 px-3 text-sm font-medium border transition-colors ${type === 'year'
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        } ${initialMilestone ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
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
                                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
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

                    <div className="flex flex-col gap-3 mt-6">
                        <button
                            onClick={handleSave}
                            disabled={!name.trim() || !value || Number(value) <= 0}
                            className="w-full px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-normal uppercase tracking-wide transition-colors"
                        >
                            Save Milestone
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-white text-black border border-black hover:bg-gray-50 text-sm font-normal uppercase tracking-wide transition-colors"
                            >
                                Cancel
                            </button>
                            {initialMilestone && (
                                <button
                                    onClick={handleClear}
                                    className="flex-1 px-4 py-2 bg-white text-red-600 border border-red-600 hover:bg-red-50 text-sm font-normal uppercase tracking-wide transition-colors"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
}

export default MilestoneModal
