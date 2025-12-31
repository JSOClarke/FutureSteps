import { Delete as Trash2 } from '../../icons'
import { formatCurrency } from '../../utils/formatters'
import { useCurrency } from '../../hooks/useCurrency'
import type { FinancialItem } from '../../types'
import { getSubCategoryLabel } from '../../utils/subcategoryHelpers'

interface FinancialItemCardProps {
    item: FinancialItem
    onEdit: (item: FinancialItem) => void
    onDelete: (id: string) => void
}

export function FinancialItemCard({ item, onEdit, onDelete }: FinancialItemCardProps) {
    const currency = useCurrency()
    // Build info text for temporal and rate data
    const infoItems: string[] = []

    // Add subcategory if present
    if (item.subCategory) {
        infoItems.push(getSubCategoryLabel(item.subCategory))
    }

    // Add temporal information
    if (item.startYear || item.endYear) {
        const start = item.startYear || '—'
        const end = item.endYear || '—'
        infoItems.push(`${start} - ${end}`)
    }

    // Add rate information based on category (Assets only)
    if (item.category === 'assets') {
        if (item.growthRate !== undefined && item.growthRate !== 0) {
            infoItems.push(`Growth: ${(item.growthRate * 100).toFixed(1)}%`)
        }
        if (item.yieldRate !== undefined && item.yieldRate !== 0) {
            infoItems.push(`Yield: ${(item.yieldRate * 100).toFixed(1)}%`)
        }
    }
    if (item.category === 'liabilities') {
        if (item.interestRate !== undefined && item.interestRate !== 0) {
            infoItems.push(`Interest: ${(item.interestRate * 100).toFixed(1)}%`)
        }
    }

    return (
        <div
            onClick={() => onEdit(item)}
            className="px-3 py-2 border border-black bg-white hover:bg-gray-50 transition-all shadow-sm flex justify-between items-center group cursor-pointer"
        >
            <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium text-black text-base">{item.name}</span>
                {infoItems.length > 0 && (
                    <span className="text-xs text-gray-500 font-light uppercase tracking-wide">
                        {infoItems.join(' • ')}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-bold text-black text-base">
                    {formatCurrency(item.value, currency)}
                </span>

                <div className="flex gap-1 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation() // Prevent card click
                            onDelete(item.id)
                        }}
                        className="p-1.5 text-black hover:bg-black hover:text-white rounded-full transition-colors"
                        title="Delete item"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}
