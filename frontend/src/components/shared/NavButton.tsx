import type { ButtonHTMLAttributes } from 'react'

interface NavButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean
}

export function NavButton({ className = '', active, ...props }: NavButtonProps) {
    return (
        <button
            className={`
                px-3 lg:px-6 py-3 
                bg-white border border-black 
                text-black hover:bg-gray-50 
                text-sm font-light uppercase tracking-wide 
                transition-colors whitespace-nowrap
                ${active ? 'bg-gray-100' : ''}
                ${className}
            `}
            {...props}
        />
    )
}
