import { useRef, useState } from 'react'

interface InteractiveBackdropProps {
    skewDirection?: 'left' | 'right'
    className?: string
}

export function InteractiveBackdrop({ skewDirection = 'left', className = '' }: InteractiveBackdropProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [opacity, setOpacity] = useState(0)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        })
        setOpacity(1)
    }

    const handleMouseLeave = () => {
        setOpacity(0)
    }

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 z-0 ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                // Expand hit area slightly to catch mouse movements near edges
                margin: '-20px',
                padding: '20px'
            }}
        >
            <div className="relative w-full h-full">
                {/* 1. Solid Skewed Background Box (The "Structure") */}
                <div
                    className={`
                        absolute inset-0 bg-blue-100 rounded-xl transition-transform duration-300
                        ${skewDirection === 'right'
                            ? 'transform rotate-1 skew-y-1'
                            : 'transform -rotate-1 skew-y-1'
                        }
                    `}
                />

                {/* 2. Interactive Gradient Glow (The "Highlight") */}
                {/* Sits on top of the blue box but behind the content/image */}
                <div
                    className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 ease-in-out"
                    style={{
                        opacity,
                        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(59, 130, 246, 0.4), transparent 40%)`,
                        // Apply same skew transform to match the box shape if desired, 
                        // or keep it un-skewed for a more natural light source feel. 
                        // Let's skew it to match the "plane".
                        transform: skewDirection === 'right' ? 'rotate(1deg) skewY(1deg)' : 'rotate(-1deg) skewY(1deg)'
                    }}
                />
            </div>
        </div>
    )
}
