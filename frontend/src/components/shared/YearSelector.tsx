interface YearSelectorProps {
    selectedYear: number
    availableYears: number[]
    onYearChange: (year: number) => void
    className?: string
    formatLabel?: (year: number) => string
}

export function YearSelector({ selectedYear, availableYears, onYearChange, className = '', formatLabel }: YearSelectorProps) {
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
                className="px-0 py-0.5 border border-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs w-10 flex items-center justify-center"
                title="Previous year"
                aria-label="Previous year"
            >
                ▼
            </button>

            {/* Dropdown */}
            <select
                value={selectedYear}
                onChange={(e) => onYearChange(parseInt(e.target.value))}
                className="flex-1 px-2 py-0.5 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light text-center appearance-none bg-white cursor-pointer text-sm"
                aria-label="Select year"
            >
                {availableYears.map(year => (
                    <option key={year} value={year}>
                        {formatLabel ? formatLabel(year) : year}
                    </option>
                ))}

            </select>

            {/* Increment Button */}
            <button
                onClick={handleNext}
                disabled={isLastYear}
                className="px-0 py-0.5 border border-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs w-10 flex items-center justify-center"
                title="Next year"
                aria-label="Next year"
            >
                ▲
            </button>
        </div >
    )
}
