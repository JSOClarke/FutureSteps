import { useState, useEffect } from 'react'

interface CurrencyInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    id?: string
    label?: string
    error?: string
    required?: boolean
    prefix?: string
    allowDecimals?: boolean
}

function CurrencyInput({
    value,
    onChange,
    placeholder = '0',
    className = '',
    id,
    label,
    error,
    required = false,
    prefix = '$',
    allowDecimals = true,
}: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState('')

    // Format number with commas
    const formatNumber = (num: string): string => {
        if (!num) return ''

        // Remove all non-numeric characters except decimal point
        const cleaned = num.replace(/[^\d.]/g, '')

        // Split into integer and decimal parts
        const parts = cleaned.split('.')
        const integerPart = parts[0]
        const decimalPart = parts[1]

        // Add commas to integer part
        const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

        // Reconstruct with decimal if present and allowed
        if (allowDecimals && decimalPart !== undefined) {
            return `${formatted}.${decimalPart}`
        }

        return formatted
    }

    // Update display value when prop value changes
    useEffect(() => {
        if (value) {
            setDisplayValue(formatNumber(value))
        } else {
            setDisplayValue('')
        }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value

        // Remove commas and prefix to get raw number
        const rawValue = inputValue.replace(/[,$]/g, '')

        // Validate it's a valid number format
        if (allowDecimals) {
            // Allow numbers with optional decimal point
            if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
                setDisplayValue(formatNumber(rawValue))
                onChange(rawValue)
            }
        } else {
            // Allow only integers
            if (rawValue === '' || /^\d*$/.test(rawValue)) {
                setDisplayValue(formatNumber(rawValue))
                onChange(rawValue)
            }
        }
    }

    const handleBlur = () => {
        // Clean up trailing decimal point on blur
        if (displayValue.endsWith('.')) {
            const cleaned = displayValue.slice(0, -1)
            setDisplayValue(cleaned)
            onChange(cleaned.replace(/,/g, ''))
        }
    }

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
                    {label} {required && '*'}
                </label>
            )}
            <div className="relative">
                {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        {prefix}
                    </span>
                )}
                <input
                    type="text"
                    id={id}
                    value={displayValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full ${prefix ? 'pl-7' : 'pl-3'} pr-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light ${className}`}
                    placeholder={placeholder}
                    inputMode="decimal"
                />
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    )
}

export default CurrencyInput
