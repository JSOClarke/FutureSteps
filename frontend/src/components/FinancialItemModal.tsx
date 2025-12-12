import { useState, useEffect } from 'react'
import type { FinancialItem, FinancialCategory, Frequency } from '../types'
import CurrencyInput from './shared/CurrencyInput'
import YearSelect from './shared/YearSelect'
import { useSettings } from '../context/SettingsContext'
import { usePlans } from '../context/PlansContext'
import { useUser } from '../context/UserContext'
import { calculateDeathDate } from '../data/lifeExpectancyData'

interface FinancialItemModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: Omit<FinancialItem, 'id' | 'category'>) => void
    initialData?: FinancialItem
    category: FinancialCategory
}

function FinancialItemModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    category,
}: FinancialItemModalProps) {
    const currentYear = new Date().getFullYear()
    const { defaultEndYear } = useSettings()
    const { activePlan } = usePlans()
    const { userProfile } = useUser()

    // Calculate max year based on death date
    const maxYear = userProfile?.customDeathDate
        ? new Date(userProfile.customDeathDate).getFullYear()
        : userProfile?.dateOfBirth && userProfile?.country
            ? new Date(calculateDeathDate(userProfile.dateOfBirth, userProfile.country)).getFullYear()
            : new Date().getFullYear() + 30 // Fallback
    // Basic fields
    const [name, setName] = useState('')
    const [value, setValue] = useState('')

    // Temporal fields (income/expenses)
    const [startYear, setStartYear] = useState(currentYear.toString())
    const [endYear, setEndYear] = useState('')
    const [frequency, setFrequency] = useState<Frequency>('annual')

    // Asset fields
    const [growthRate, setGrowthRate] = useState('')
    const [yieldRate, setYieldRate] = useState('')
    const [monthlyContribution, setMonthlyContribution] = useState('')

    // Liability fields
    const [interestRate, setInterestRate] = useState('')
    const [minimumPayment, setMinimumPayment] = useState('')

    const [errors, setErrors] = useState<Record<string, string>>({})

    // Reset form when modal opens with initial data
    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || '')
            setValue(initialData?.value?.toString() || '')
            setStartYear(initialData?.startYear?.toString() || currentYear.toString())

            // Use default end year from settings for new items (income/expenses only)
            if (!initialData && (category === 'income' || category === 'expenses') && defaultEndYear > 0) {
                setEndYear(defaultEndYear.toString())
            } else {
                setEndYear(initialData?.endYear?.toString() || '')
            }

            setFrequency(initialData?.frequency || 'annual')
            setGrowthRate(initialData?.growthRate ? (initialData.growthRate * 100).toString() : '')
            setYieldRate(initialData?.yieldRate ? (initialData.yieldRate * 100).toString() : '')
            setMonthlyContribution(initialData?.monthlyContribution?.toString() || '')
            setInterestRate(initialData?.interestRate ? (initialData.interestRate * 100).toString() : '')
            setMinimumPayment(initialData?.minimumPayment?.toString() || '')
            setErrors({})
        }
    }, [isOpen, initialData, currentYear, category, defaultEndYear])

    const validate = () => {
        const newErrors: Record<string, string> = {}

        if (!name.trim()) {
            newErrors.name = 'Name is required'
        }

        if (!value.trim()) {
            newErrors.value = 'Value is required'
        } else if (isNaN(Number(value)) || Number(value) < 0) {
            newErrors.value = 'Value must be a positive number'
        }

        // Validate temporal fields for income/expenses
        if (category === 'income' || category === 'expenses') {
            if (startYear && isNaN(Number(startYear))) {
                newErrors.startYear = 'Must be a valid year'
            }
            if (endYear && isNaN(Number(endYear))) {
                newErrors.endYear = 'Must be a valid year'
            }
            if (startYear && endYear && Number(startYear) > Number(endYear)) {
                newErrors.endYear = 'End year must be after start year'
            }
        }

        // Validate asset fields
        if (category === 'assets') {
            if (growthRate && (isNaN(Number(growthRate)) || Number(growthRate) < 0)) {
                newErrors.growthRate = 'Must be a positive percentage'
            }
            if (yieldRate && (isNaN(Number(yieldRate)) || Number(yieldRate) < 0)) {
                newErrors.yieldRate = 'Must be a positive percentage'
            }
            if (monthlyContribution && (isNaN(Number(monthlyContribution)) || Number(monthlyContribution) < 0)) {
                newErrors.monthlyContribution = 'Must be a positive number'
            }
        }

        // Validate liability fields
        if (category === 'liabilities') {
            if (interestRate && (isNaN(Number(interestRate)) || Number(interestRate) < 0)) {
                newErrors.interestRate = 'Must be a positive percentage'
            }
            if (minimumPayment && (isNaN(Number(minimumPayment)) || Number(minimumPayment) < 0)) {
                newErrors.minimumPayment = 'Must be a positive number'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (validate()) {
            const data: Omit<FinancialItem, 'id' | 'category'> = {
                name: name.trim(),
                value: Number(value),
            }

            // Add temporal fields for income/expenses
            if (category === 'income' || category === 'expenses') {
                if (startYear) data.startYear = Number(startYear)
                if (endYear) data.endYear = Number(endYear)
                data.frequency = frequency
            }

            // Add asset-specific fields
            if (category === 'assets') {
                if (growthRate) data.growthRate = Number(growthRate) / 100
                if (yieldRate) data.yieldRate = Number(yieldRate) / 100
                if (monthlyContribution) data.monthlyContribution = Number(monthlyContribution)
            }

            // Add liability-specific fields
            if (category === 'liabilities') {
                if (interestRate) data.interestRate = Number(interestRate) / 100
                if (minimumPayment) data.minimumPayment = Number(minimumPayment)
            }

            onSave(data)
            onClose()
        }
    }

    const handleClose = () => {
        setName('')
        setValue('')
        setStartYear(currentYear.toString())
        setEndYear('')
        setFrequency('annual')
        setGrowthRate('')
        setYieldRate('')
        setMonthlyContribution('')
        setInterestRate('')
        setMinimumPayment('')
        setErrors({})
        onClose()
    }

    if (!isOpen) return null

    const categoryColors: Record<FinancialCategory, { bg: string; border: string }> = {
        income: { bg: 'var(--pastel-green)', border: '#A7F3D0' },
        expenses: { bg: 'var(--pastel-red)', border: '#FECACA' },
        assets: { bg: 'var(--pastel-yellow)', border: '#FDE68A' },
        liabilities: { bg: 'var(--pastel-orange)', border: '#FED7AA' },
    }

    const colors = categoryColors[category]

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="mb-6 border-b border-gray-200 pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">
                        {initialData ? 'Edit' : 'Add'} {category === 'liabilities' ? 'Liability' : category.slice(0, -1)} Item
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {initialData ? 'Update the details of this item.' : `Add a new item to your ${category}.`}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Name - Full width */}
                        <div className="col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Salary, Rent, Savings Account"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* Value */}
                        <div>
                            <CurrencyInput
                                id="value"
                                label={
                                    category === 'assets' ? 'Current Value ($) *' :
                                        category === 'liabilities' ? 'Current Balance ($) *' :
                                            'Amount ($) *'
                                }
                                value={value}
                                onChange={setValue}
                                placeholder="e.g., 5000"
                                error={errors.value}
                                required
                            />
                        </div>

                        {/* Frequency - for income/expenses */}
                        {(category === 'income' || category === 'expenses') && (
                            <div>
                                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                                    Frequency *
                                </label>
                                <select
                                    id="frequency"
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value as Frequency)}
                                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="annual">Annual</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                        )}

                        {/* Temporal fields - for income/expenses */}
                        {(category === 'income' || category === 'expenses') && (
                            <>
                                <YearSelect
                                    id="startYear"
                                    label="Start Year"
                                    value={startYear}
                                    onChange={setStartYear}
                                    milestones={activePlan?.milestones || []}
                                    minYear={currentYear}
                                    maxYear={maxYear}
                                    error={errors.startYear}
                                />

                                <YearSelect
                                    id="endYear"
                                    label="End Year (optional)"
                                    value={endYear}
                                    onChange={setEndYear}
                                    milestones={activePlan?.milestones || []}
                                    minYear={currentYear}
                                    maxYear={maxYear}
                                    placeholder="Leave empty for ongoing"
                                    error={errors.endYear}
                                />
                            </>
                        )}

                        {/* ... (rest of form) */}


                        {/* Asset-specific fields */}
                        {category === 'assets' && (
                            <>
                                <div>
                                    <label htmlFor="growthRate" className="block text-sm font-medium text-gray-700 mb-2">
                                        Growth Rate (% per year)
                                    </label>
                                    <input
                                        type="number"
                                        id="growthRate"
                                        value={growthRate}
                                        onChange={(e) => setGrowthRate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 7 for 7%"
                                        step="0.01"
                                        min="0"
                                    />
                                    {errors.growthRate && <p className="text-red-500 text-sm mt-1">{errors.growthRate}</p>}
                                </div>

                                <div>
                                    <label htmlFor="yieldRate" className="block text-sm font-medium text-gray-700 mb-2">
                                        Yield/Dividend Rate (% per year)
                                    </label>
                                    <input
                                        type="number"
                                        id="yieldRate"
                                        value={yieldRate}
                                        onChange={(e) => setYieldRate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 2 for 2%"
                                        step="0.01"
                                        min="0"
                                    />
                                    {errors.yieldRate && <p className="text-red-500 text-sm mt-1">{errors.yieldRate}</p>}
                                </div>

                                <div className="col-span-2">
                                    <CurrencyInput
                                        id="monthlyContribution"
                                        label="Monthly Contribution ($)"
                                        value={monthlyContribution}
                                        onChange={setMonthlyContribution}
                                        placeholder="e.g., 500"
                                        error={errors.monthlyContribution}
                                    />
                                </div>
                            </>
                        )}

                        {/* Liability-specific fields */}
                        {category === 'liabilities' && (
                            <>
                                <div>
                                    <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-2">
                                        Interest Rate (% per year)
                                    </label>
                                    <input
                                        type="number"
                                        id="interestRate"
                                        value={interestRate}
                                        onChange={(e) => setInterestRate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 4.5 for 4.5%"
                                        step="0.01"
                                        min="0"
                                    />
                                    {errors.interestRate && <p className="text-red-500 text-sm mt-1">{errors.interestRate}</p>}
                                </div>

                                <div>
                                    <CurrencyInput
                                        id="minimumPayment"
                                        label="Annual Payment ($)"
                                        value={minimumPayment}
                                        onChange={setMinimumPayment}
                                        placeholder="e.g., 12000"
                                        error={errors.minimumPayment}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 text-white font-medium hover:opacity-90"
                            style={{ backgroundColor: colors.border }}
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default FinancialItemModal
