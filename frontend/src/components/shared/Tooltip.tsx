import React, { useState } from 'react'
import { InfoIcon } from '../../icons'

interface TooltipProps {
    content: string
    children?: React.ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <div
            className="relative flex items-center group"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children || <InfoIcon size={14} className="text-gray-400 hover:text-black transition-colors cursor-help" />}

            {isVisible && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black text-white text-[10px] rounded shadow-xl z-[100] pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                    {content}
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black" />
                </div>
            )}
        </div>
    )
}
