import type { ButtonHTMLAttributes } from 'react'

interface NavButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean
    variant?: 'primary' | 'secondary'
}

export function NavButton({ className = '', active, variant = 'secondary', ...props }: NavButtonProps) {
    const baseStyles = "px-2 xl:px-6 py-2 xl:py-3 border text-xs xl:text-sm font-light uppercase tracking-wide transition-colors whitespace-nowrap"
    const variants = {
        primary: "bg-black text-white border-black hover:bg-gray-800",
        secondary: "bg-white text-black border-black hover:bg-gray-50"
    }

    return (
        <button
            className={`
                ${baseStyles}
                ${variants[variant]}
                ${active ? 'bg-gray-100' : ''}
                ${className}
            `}
            {...props}
        />
    )
}
