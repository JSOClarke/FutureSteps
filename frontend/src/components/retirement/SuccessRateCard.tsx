interface SuccessRateCardProps {
    successRate: number
}

function SuccessRateCard({ successRate }: SuccessRateCardProps) {
    // Determine color and interpretation based on success rate
    const getColorClass = () => {
        if (successRate >= 90) return 'bg-green-50 border-green-500'
        if (successRate >= 75) return 'bg-yellow-50 border-yellow-500'
        return 'bg-red-50 border-red-500'
    }

    const getTextColorClass = () => {
        if (successRate >= 90) return 'text-green-700'
        if (successRate >= 75) return 'text-yellow-700'
        return 'text-red-700'
    }

    const getInterpretation = () => {
        if (successRate >= 95) return 'Excellent - Very High Success Rate'
        if (successRate >= 90) return 'Very Good - High Success Rate'
        if (successRate >= 80) return 'Good - Moderate Success Rate'
        if (successRate >= 70) return 'Fair - Consider Adjustments'
        return 'Risky - Recommend Reducing Withdrawal Rate'
    }

    return (
        <div className={`border-2 ${getColorClass()} p-8 text-center`}>
            <p className="text-sm text-gray-600 mb-2">Portfolio Success Rate</p>
            <p className={`text-7xl font-light ${getTextColorClass()} mb-4`}>
                {successRate.toFixed(1)}%
            </p>
            <p className={`text-lg ${getTextColorClass()} font-normal`}>
                {getInterpretation()}
            </p>
            <p className="text-sm text-gray-600 mt-4">
                Based on {successRate.toFixed(1)}% of simulations successfully lasting the full retirement period
            </p>
        </div>
    )
}

export default SuccessRateCard
