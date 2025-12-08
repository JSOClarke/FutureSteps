import { useState } from 'react'

interface CollapsibleSectionProps {
    title: string
    children: React.ReactNode
    defaultExpanded?: boolean
}

function CollapsibleSection({ title, children, defaultExpanded = false }: CollapsibleSectionProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)

    return (
        <div className="border-b">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
            >
                <h3 className="font-semibold text-gray-700">{title}</h3>
                <span className="text-gray-500">
                    {isExpanded ? '▼' : '▶'}
                </span>
            </button>
            {isExpanded && (
                <div className="p-3 pt-0 text-sm text-gray-600">
                    {children}
                </div>
            )}
        </div>
    )
}

export default CollapsibleSection
