import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody
} from '../ui/dialog'
import { getSubCategoriesForCategory } from '../../utils/subcategoryHelpers'
import type { FinancialCategory, FinancialSubCategory } from '../../types'

interface SubCategorySelectionModalProps {
    isOpen: boolean
    onClose: () => void
    category: FinancialCategory
    onSelect: (subCategory: FinancialSubCategory) => void
}

export default function SubCategorySelectionModal({
    isOpen,
    onClose,
    category,
    onSelect
}: SubCategorySelectionModalProps) {
    const subCategories = getSubCategoriesForCategory(category)

    if (!isOpen) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Select Category</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {subCategories.map((sub) => {
                            const Icon = sub.icon
                            return (
                                <button
                                    key={sub.value}
                                    onClick={() => onSelect(sub.value)}
                                    className="flex flex-col items-center justify-center p-4 border border-gray-200 hover:border-black hover:bg-gray-50 transition-all rounded-lg gap-3 group"
                                    data-testid={`subcategory-option-${sub.value}`}
                                >
                                    <div className="p-3 bg-gray-100 rounded-full group-hover:bg-white border border-transparent group-hover:border-gray-200 transition-all">
                                        <Icon size={24} className="text-gray-600 group-hover:text-black" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-black">
                                        {sub.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
}
