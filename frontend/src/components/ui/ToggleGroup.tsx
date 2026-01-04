import React from 'react'

interface ToggleOption {
    label: string
    value: string
    disabled?: boolean
    title?: string
}

interface ToggleGroupProps {
    options: ToggleOption[]
    value: string
    onChange: (value: string) => void
    className?: string
}

export function ToggleGroup({ options, value, onChange, className = '' }: ToggleGroupProps) {
    // Determine grid columns based on number of options
    const gridCols = `grid-cols-${options.length}`

    return (
        <div className={`grid ${gridCols} gap-3 ${className}`}>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    disabled={option.disabled}
                    title={option.title}
                    className={`
                        px-3 py-2 text-sm border transition-colors text-center
                        ${value === option.value
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }
                        ${option.disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 hover:bg-gray-100' : ''}
                    `}
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}
