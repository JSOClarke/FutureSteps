import { useState, useEffect } from 'react'
import type { FinancialItem, FinancialCategory, Frequency, FinancialSubCategory } from '../types'
import { getSubCategoryLabel, getSubCategoryIcon } from '../utils/subcategoryHelpers'
import { Button } from './ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogBody,
    DialogFooter
} from './ui/dialog'
import { FormRenderer } from './financial/forms/FormRenderer'
import { useSettings } from '../context/SettingsContext'
import SubCategorySelectionModal from './financial/SubCategorySelectionModal'
import { Edit as Edit2 } from '../icons'


interface FormState {
    name: string
    value: string
    startYear?: string
    endYear?: string
    frequency: Frequency
    growthRate?: string
    yieldRate?: string
    maxAnnualContribution?: string
    interestRate?: string
    minimumPayment?: string
    isAdjustedForInflation: boolean
    growthMode?: 'none' | 'inflation' | 'percentage'
    maxValue?: string
}

interface FinancialItemModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: Omit<FinancialItem, 'id' | 'category'>) => void
    initialData?: FinancialItem
    initialSubCategory?: FinancialSubCategory
    category: FinancialCategory
    simpleMode?: boolean
}

function FinancialItemModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    initialSubCategory,
    category,
    simpleMode,
}: FinancialItemModalProps) {
    const currentYear = new Date().getFullYear()
    const { defaultEndYear } = useSettings()

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
        maxAnnualContribution: initialData?.maxAnnualContribution?.toString() || '',
        interestRate: initialData?.interestRate ? (Math.round(initialData.interestRate * 10000) / 100).toString() : '',
        minimumPayment: initialData?.minimumPayment?.toString() || '',
        subCategory: initialData?.subCategory || initialSubCategory,
        isAdjustedForInflation: initialData?.isAdjustedForInflation || false,
        growthMode: initialData?.growthMode || (initialData?.isAdjustedForInflation ? 'inflation' : 'none'),
        maxValue: initialData?.maxValue?.toString() || ''
    })

    // Unified Form State
    const [formData, setFormData] = useState<FormState>(() => {
        const initial = getInitialValues()
        return {
            name: initial.name,
            value: initial.value,
            startYear: initial.startYear,
            endYear: initial.endYear,
            frequency: initial.frequency === 'annual' || initial.frequency === 'monthly' ? initial.frequency : 'annual',
            growthRate: initial.growthRate,
            yieldRate: initial.yieldRate,
            maxAnnualContribution: initial.maxAnnualContribution,
            interestRate: initial.interestRate,
            minimumPayment: initial.minimumPayment,
            isAdjustedForInflation: initial.isAdjustedForInflation,
            growthMode: initial.growthMode,
            maxValue: initial.maxValue
        }
    })

    const [subCategory, setSubCategory] = useState<FinancialSubCategory | undefined>(() =>
        initialData?.subCategory || initialSubCategory
    )

    const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false)

    const [errors, setErrors] = useState<Record<string, string>>({})

    // Reset/Initialize form when modal opens or item changes
    useEffect(() => {
        if (isOpen) {
            const values = getInitialValues()
            setFormData({
                name: values.name,
                value: values.value,
                startYear: values.startYear,
                endYear: values.endYear,
                frequency: values.frequency === 'annual' || values.frequency === 'monthly' ? values.frequency : 'annual',
                growthRate: values.growthRate,
                yieldRate: values.yieldRate,
                maxAnnualContribution: values.maxAnnualContribution,
                interestRate: values.interestRate,
                minimumPayment: values.minimumPayment,
                isAdjustedForInflation: values.isAdjustedForInflation,
                growthMode: values.growthMode,
                maxValue: values.maxValue
            })
            setSubCategory(initialData?.subCategory || initialSubCategory)
            setErrors({})
        }
    }, [initialData?.id, isOpen, initialSubCategory, category, defaultEndYear, currentYear])

    const handleFieldChange = (field: keyof FormState | keyof FinancialItem, value: any) => {
        // We cast to any for simplicity as FormState covers the fields we edit
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error for this field
        if (errors[field as string]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field as string]
                return newErrors
            })
        }
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        }

        if (!formData.value.trim()) {
            newErrors.value = 'Value is required'
        } else if (isNaN(Number(formData.value)) || Number(formData.value) < 0) {
            newErrors.value = 'Value must be a positive number'
        }

        // Validate temporal fields for income/expenses
        if (!simpleMode && (category === 'income' || category === 'expenses')) {
            if (formData.startYear && isNaN(Number(formData.startYear))) {
                newErrors.startYear = 'Must be a valid year'
            }
            if (formData.endYear && isNaN(Number(formData.endYear))) {
                newErrors.endYear = 'Must be a valid year'
            }
            if (formData.startYear && formData.endYear && Number(formData.startYear) > Number(formData.endYear)) {
                newErrors.endYear = 'End year must be after start year'
            }
        }

        // Validate asset fields
        if (!simpleMode && category === 'assets') {
            if (formData.growthRate && (isNaN(Number(formData.growthRate)) || Number(formData.growthRate) < 0)) {
                newErrors.growthRate = 'Must be a positive percentage'
            }
            if (formData.yieldRate && (isNaN(Number(formData.yieldRate)) || Number(formData.yieldRate) < 0)) {
                newErrors.yieldRate = 'Must be a positive percentage'
            }
            if (formData.maxAnnualContribution && (isNaN(Number(formData.maxAnnualContribution)) || Number(formData.maxAnnualContribution) < 0)) {
                newErrors.maxAnnualContribution = 'Must be a positive number'
            }
        }

        // Validate growth/cap fields for income/expenses
        if (!simpleMode && (category === 'income' || category === 'expenses')) {
            if (formData.growthMode === 'percentage') {
                if (!formData.growthRate) {
                    // Warning?? Or required? Let's make it optional but good practice to check
                } else if (isNaN(Number(formData.growthRate)) || Number(formData.growthRate) < 0) {
                    newErrors.growthRate = 'Must be a positive percentage'
                }
            }
            if (formData.maxValue && (isNaN(Number(formData.maxValue)) || Number(formData.maxValue) < 0)) {
                newErrors.maxValue = 'Must be a positive number'
            }
        }

        // Validate liability fields
        if (!simpleMode && category === 'liabilities') {
            if (formData.interestRate && (isNaN(Number(formData.interestRate)) || Number(formData.interestRate) < 0)) {
                newErrors.interestRate = 'Must be a positive percentage'
            }
            if (formData.minimumPayment && (isNaN(Number(formData.minimumPayment)) || Number(formData.minimumPayment) < 0)) {
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
                name: formData.name.trim(),
                value: Number(formData.value),
                subCategory: subCategory // Include subCategory
            }

            // Add fields based on what's present in formData

            if (formData.startYear) data.startYear = Number(formData.startYear)
            if (formData.endYear) data.endYear = Number(formData.endYear)
            if (formData.frequency) data.frequency = formData.frequency

            if (formData.growthRate) data.growthRate = Math.round(Number(formData.growthRate) * 100) / 10000
            if (formData.yieldRate) data.yieldRate = Math.round(Number(formData.yieldRate) * 100) / 10000
            if (formData.maxAnnualContribution) data.maxAnnualContribution = Number(formData.maxAnnualContribution)

            if (formData.interestRate) data.interestRate = Math.round(Number(formData.interestRate) * 100) / 10000
            if (formData.minimumPayment) data.minimumPayment = Number(formData.minimumPayment)

            // Only applicable for income/expenses
            if (category === 'income' || category === 'expenses') {
                data.growthMode = formData.growthMode || 'none'
                data.isAdjustedForInflation = data.growthMode === 'inflation'

                if (formData.maxValue) data.maxValue = Number(formData.maxValue)

                // If percentage mode, ensure growthRate is set on the item
                if (data.growthMode === 'percentage' && formData.growthRate) {
                    data.growthRate = Math.round(Number(formData.growthRate) * 100) / 10000
                }
            }

            onSave(data)
            handleClose()
        }
    }

    const handleClose = () => {
        // Reset form data to initial values or empty
        // We actually want to clear it, but using initial defaults is fine for empty state
        setFormData({
            name: '',
            value: '',
            startYear: currentYear.toString(),
            endYear: '',
            frequency: 'annual',
            growthRate: '',
            yieldRate: '',
            maxAnnualContribution: '',
            interestRate: '',
            minimumPayment: '',
            isAdjustedForInflation: false,
            growthMode: 'none',
            maxValue: ''
        })
        setSubCategory(undefined)
        setErrors({})
        onClose()
    }

    const handleSubCategoryChange = (newSubCategory: FinancialSubCategory) => {
        setSubCategory(newSubCategory)
        setIsSubCategoryModalOpen(false)
    }

    if (!isOpen) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {`${initialData ? 'Edit' : 'Add'} ${category === 'income' ? 'Income' :
                            category === 'liabilities' ? 'Liability' :
                                'Expense' // Defaults/Fallbacks
                            } Item`.replace('Expense Item', category === 'expenses' ? 'Expense Item' :
                                category === 'assets' ? 'Asset Item' : `${category} Item`)
                        }
                    </DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Update the details of this item.' : `Add a new item to your ${category}.`}
                    </DialogDescription>
                </DialogHeader>
                <DialogBody>
                    {subCategory && (
                        <div className="mb-6 p-4 bg-gray-50 border-l-2 border-black flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {(() => {
                                    const Icon = getSubCategoryIcon(subCategory)
                                    return <Icon size={20} className="text-black" />
                                })()}
                                <span className="font-medium text-xs uppercase tracking-widest text-black">
                                    {getSubCategoryLabel(subCategory)}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSubCategoryModalOpen(true)}
                                className="text-xs uppercase tracking-wide font-normal text-gray-500 hover:text-black transition-colors flex items-center gap-1.5"
                            >
                                <Edit2 size={12} />
                                Change
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <FormRenderer
                            category={category}
                            subCategory={subCategory}
                            data={formData as any}
                            onChange={handleFieldChange}
                            errors={errors}
                            simpleMode={simpleMode}
                        />

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" data-testid="financial-item-submit-button">
                                {initialData ? 'Save Changes' : 'Add Item'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogBody>
            </DialogContent>

            <SubCategorySelectionModal
                isOpen={isSubCategoryModalOpen}
                onClose={() => setIsSubCategoryModalOpen(false)}
                category={category}
                onSelect={handleSubCategoryChange}
            />
        </Dialog>
    )
}

export default FinancialItemModal
