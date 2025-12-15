interface YearSelectorProps {
    selectedYear: number
    availableYears: number[]
    onYearChange: (year: number) => void
    className?: string
}

export function YearSelector({ selectedYear, availableYears, onYearChange, className = '' }: YearSelectorProps) {
    const currentIndex = availableYears.findIndex(y => y === selectedYear)
    const isFirstYear = currentIndex === 0
    const isLastYear = currentIndex === availableYears.length - 1

    const handlePrevious = () => {
        if (!isFirstYear) {
            onYearChange(availableYears[currentIndex - 1])
        }
    }

    const handleNext = () => {
        if (!isLastYear) {
            onYearChange(availableYears[currentIndex + 1])
        }
    }

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {/* Decrement Button */}
            <button
                onClick={handlePrevious}
                disabled={isFirstYear}
                className="px-2 py-2 border border-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous year"
                aria-label="Previous year"
            >
                ▼
            </button>

            {/* Dropdown */}
            <select
                value={selectedYear}
                onChange={(e) => onYearChange(parseInt(e.target.value))}
                className="flex-1 px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light text-center appearance-none bg-white cursor-pointer"
                aria-label="Select year"
            >
                {availableYears.map(year => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </select>

            {/* Increment Button */}
            <button
                onClick={handleNext}
                disabled={isLastYear}
                className="px-2 py-2 border border-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next year"
                aria-label="Next year"
            >
                ▲
            </button>
        </div>
    )
}
