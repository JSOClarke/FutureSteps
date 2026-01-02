import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { InfoIcon } from '../../icons'

interface TooltipProps {
    content: string
    children?: React.ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
    const triggerRef = useRef<HTMLDivElement>(null)

    const handleMouseEnter = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            setPosition({
                top: rect.top - 8, // Just above the element
                left: rect.left + rect.width / 2
            })
            setIsVisible(true)
        }
    }

    return (
        <>
            <div
                ref={triggerRef}
                className="relative flex items-center group cursor-help"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setIsVisible(false)}
            >
                {children || <InfoIcon size={14} className="text-gray-400 hover:text-black transition-colors" />}
            </div>

            {isVisible && position && createPortal(
                <div
                    className="fixed -translate-x-1/2 -translate-y-full mb-2 w-48 p-2 bg-black text-white text-[10px] rounded shadow-xl z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                    style={{
                        top: position.top,
                        left: position.left
                    }}
                >
                    {content}
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black" />
                </div>,
                document.body
            )}
        </>
    )
}
