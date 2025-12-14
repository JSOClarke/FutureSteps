import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { DashboardItem, FinancialCategory } from '../../types'
import CurrencyInput from '../shared/CurrencyInput'
import { useCurrency } from '../../hooks/useCurrency'

interface DashboardItemModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: { name: string; amount: number }) => void
    initialData?: DashboardItem
    category: FinancialCategory
}

export function DashboardItemModal({ isOpen, onClose, onSave, initialData, category }: DashboardItemModalProps) {
    const [name, setName] = useState('')
    const [amount, setAmount] = useState('')
    const currency = useCurrency()

    useEffect(() => {
        if (initialData) {
            setName(initialData.name)
            setAmount(initialData.amount.toString())
        } else {
            setName('')
            setAmount('')
        }
    }, [initialData, isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim() || !amount) {
            alert('Please fill in all fields')
            return
        }

        const amountNum = parseFloat(amount)
        if (isNaN(amountNum) || amountNum <= 0) {
            alert('Please enter a valid amount')
            return
        }

        onSave({ name: name.trim(), amount: amountNum })
        onClose()
    }

    if (!isOpen) return null

    const categoryTitles: Record<FinancialCategory, string> = {
        income: 'Income',
        expenses: 'Expenses',
        assets: 'Assets',
        liabilities: 'Liabilities'
    }

    // Get currency symbol
    const getCurrencySymbol = () => {
        if (!currency) return '$'
        const symbols: Record<string, string> = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            JPY: '¥'
        }
        return symbols[currency] || currency
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-2 border-black w-full max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b-2 border-black">
                    <h2 className="text-xl font-normal">
                        {initialData ? 'Edit' : 'Add'} {categoryTitles[category]} Item
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-normal text-gray-600 uppercase tracking-wide mb-2">
                                Item Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Cash ISA, Rent, Salary"
                                className="w-full px-4 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-black"
                                autoFocus
                            />
                        </div>

                        {/* Amount Field - Using CurrencyInput */}
                        <div>
                            <CurrencyInput
                                value={amount}
                                onChange={setAmount}
                                placeholder="0.00"
                                label="Amount"
                                prefix={getCurrencySymbol()}
                                allowDecimals={true}
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-black hover:bg-gray-100 transition-colors text-sm font-normal uppercase tracking-wide"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm font-normal uppercase tracking-wide"
                        >
                            {initialData ? 'Update' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
