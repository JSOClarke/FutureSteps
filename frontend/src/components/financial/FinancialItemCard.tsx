import { Trash2 } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'
import { useCurrency } from '../../hooks/useCurrency'
import type { FinancialItem } from '../../types'

interface FinancialItemCardProps {
    item: FinancialItem
    onEdit: (item: FinancialItem) => void
    onDelete: (id: string) => void
}

export function FinancialItemCard({ item, onEdit, onDelete }: FinancialItemCardProps) {
    const currency = useCurrency()
    // Build info text for temporal and rate data
    const infoItems: string[] = []

    // Add temporal information
    if (item.startYear || item.endYear) {
        const start = item.startYear || '—'
        const end = item.endYear || '—'
        infoItems.push(`${start} - ${end}`)
    }

    // Add rate information based on category
    if (item.growthRate !== undefined && item.growthRate !== 0) {
        infoItems.push(`Growth: ${(item.growthRate * 100).toFixed(1)}%`)
    }
    if (item.yieldRate !== undefined && item.yieldRate !== 0) {
        infoItems.push(`Yield: ${(item.yieldRate * 100).toFixed(1)}%`)
    }
    if (item.interestRate !== undefined && item.interestRate !== 0) {
        infoItems.push(`Interest: ${(item.interestRate * 100).toFixed(1)}%`)
    }

    return (
        <div
            onClick={() => onEdit(item)}
            className="p-4 border border-black bg-white hover:bg-gray-50 transition-all shadow-sm flex justify-between items-center group cursor-pointer"
        >
            <div className="flex flex-col">
                <span className="font-medium text-black text-lg">{item.name}</span>
                {infoItems.length > 0 && (
                    <span className="text-xs text-gray-500 mt-1 font-light uppercase tracking-wide">
                        {infoItems.join(' • ')}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4">
                <span className="font-bold text-black text-lg">
                    {formatCurrency(item.value, currency)}
                </span>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation() // Prevent card click
                            onDelete(item.id)
                        }}
                        className="p-2 text-black hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                        title="Delete item"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}
