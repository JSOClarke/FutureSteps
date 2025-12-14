import { useState, useEffect } from 'react'
import type { FinancialItem, FinancialCategory, Frequency } from '../types'
import CurrencyInput from './shared/CurrencyInput'
import YearSelect from './shared/YearSelect'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogBody,
} from './ui/dialog'
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

    // Helper function to get initial values
    const getInitialValues = () => ({
        name: initialData?.name || '',
        value: initialData?.value?.toString() || '',
        startYear: initialData?.startYear?.toString() || currentYear.toString(),
        endYear: (!initialData && (category === 'income' || category === 'expenses') && defaultEndYear > 0)
            ? defaultEndYear.toString()
            : (initialData?.endYear?.toString() || ''),
        frequency: initialData?.frequency || 'annual' as Frequency,
        growthRate: initialData?.growthRate ? (Math.round(initialData.growthRate * 10000) / 100).toString() : '',
        yieldRate: initialData?.yieldRate ? (Math.round(initialData.yieldRate * 10000) / 100).toString() : '',
        monthlyContribution: initialData?.monthlyContribution?.toString() || '',
        interestRate: initialData?.interestRate ? (Math.round(initialData.interestRate * 10000) / 100).toString() : '',
        minimumPayment: initialData?.minimumPayment?.toString() || '',
    })

    // Initialize state with correct values immediately (lazy initialization)
    const [name, setName] = useState(() => initialData?.name || '')
    const [value, setValue] = useState(() => initialData?.value?.toString() || '')
    const [startYear, setStartYear] = useState(() => initialData?.startYear?.toString() || currentYear.toString())
    const [endYear, setEndYear] = useState(() => {
        if (!initialData && (category === 'income' || category === 'expenses') && defaultEndYear > 0) {
            return defaultEndYear.toString()
        }
        return initialData?.endYear?.toString() || ''
    })
    const [frequency, setFrequency] = useState<Frequency>(() => initialData?.frequency || 'annual')
    const [growthRate, setGrowthRate] = useState(() =>
        initialData?.growthRate ? (Math.round(initialData.growthRate * 10000) / 100).toString() : ''
    )
    const [yieldRate, setYieldRate] = useState(() =>
        initialData?.yieldRate ? (Math.round(initialData.yieldRate * 10000) / 100).toString() : ''
    )
    const [monthlyContribution, setMonthlyContribution] = useState(() => initialData?.monthlyContribution?.toString() || '')
    const [interestRate, setInterestRate] = useState(() =>
        initialData?.interestRate ? (Math.round(initialData.interestRate * 10000) / 100).toString() : ''
    )
    const [minimumPayment, setMinimumPayment] = useState(() => initialData?.minimumPayment?.toString() || '')

    const [errors, setErrors] = useState<Record<string, string>>({})

    // Update form when initialData changes (for when editing different items)
    useEffect(() => {
        if (isOpen) {
            const values = getInitialValues()
            setName(values.name)
            setValue(values.value)
            setStartYear(values.startYear)
            setEndYear(values.endYear)
            setFrequency(values.frequency)
            setGrowthRate(values.growthRate)
            setYieldRate(values.yieldRate)
            setMonthlyContribution(values.monthlyContribution)
            setInterestRate(values.interestRate)
            setMinimumPayment(values.minimumPayment)
            setErrors({})
        }
    }, [initialData?.id, isOpen]) // Only re-run when the item ID changes

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
                if (growthRate) data.growthRate = Math.round(Number(growthRate) * 100) / 10000
                if (yieldRate) data.yieldRate = Math.round(Number(yieldRate) * 100) / 10000
                if (monthlyContribution) data.monthlyContribution = Number(monthlyContribution)
            }

            // Add liability-specific fields
            if (category === 'liabilities') {
                if (interestRate) data.interestRate = Math.round(Number(interestRate) * 100) / 10000
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

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {`${initialData ? 'Edit' : 'Add'} ${category === 'liabilities' ? 'Liability' : category.slice(0, -1)} Item`}
                    </DialogTitle>
                    {(initialData ? 'Update the details of this item.' : `Add a new item to your ${category}.`) && (
                        <DialogDescription>
                            {initialData ? 'Update the details of this item.' : `Add a new item to your ${category}.`}
                        </DialogDescription>
                    )}
                </DialogHeader>
                <DialogBody>
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
                                    className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
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
                                        className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
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
                                            className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
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
                                            className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
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
                                            className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
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

                        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-2 bg-white text-black border border-black hover:bg-gray-50 text-sm font-normal uppercase tracking-wide transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-800 text-sm font-normal uppercase tracking-wide transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
}

export default FinancialItemModal
