import type { IconProps } from '../../icons'
import { formatCurrency } from '../../utils/formatters'
import { useCurrency } from '../../hooks/useCurrency'

interface FinancialSummaryCardProps {
    title: string
    amount: number
    icon: React.ComponentType<IconProps>
    color?: string
}

export function FinancialSummaryCard({ title, amount, icon: Icon, color = 'black' }: FinancialSummaryCardProps) {
    const currency = useCurrency()

    return (
        <div className="border border-black bg-white p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-normal text-gray-600 uppercase tracking-wide">{title}</span>
                <Icon size={20} style={{ color }} />
            </div>
            <div className="text-2xl font-bold" style={{ color }}>
                {formatCurrency(amount, currency)}
            </div>
        </div>
    )
}
