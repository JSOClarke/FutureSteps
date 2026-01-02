import { useRef, useState } from 'react'

interface InteractiveSectionProps {
    children: React.ReactNode
    className?: string
    id?: string
}

export function InteractiveSection({ children, className = '', id }: InteractiveSectionProps) {
    const containerRef = useRef<HTMLElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [opacity, setOpacity] = useState(0)

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
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
        <section
            ref={containerRef}
            id={id}
            className={`relative ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Interactive Gradient Background */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-in-out"
                style={{
                    opacity,
                    background: `radial-gradient(1000px circle at ${position.x}px ${position.y}px, rgba(59, 130, 246, 0.08), transparent 40%)`,
                    zIndex: 0
                }}
            />

            {/* Content Container - Ensure z-index is above background */}
            <div className="relative z-10">
                {children}
            </div>
        </section>
    )
}
