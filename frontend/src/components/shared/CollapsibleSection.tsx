import { useState } from 'react'

interface CollapsibleSectionProps {
    title: React.ReactNode
    children: React.ReactNode
    defaultExpanded?: boolean
    rightContent?: React.ReactNode
    activeBorderColor?: string
}

function CollapsibleSection({ title, children, defaultExpanded = false, rightContent, activeBorderColor }: CollapsibleSectionProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)

    return (
        <div className="border-b border-black">
            {isExpanded && activeBorderColor && (
                <div
                    className="h-[4px] w-full"
                    style={{ backgroundColor: activeBorderColor }}
                />
            )}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-2 flex-1">
                    <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
                    {rightContent && (
                        <div className="ml-auto mr-2 text-sm">
                            {rightContent}
                        </div>
                    )}
                </div>
                <span className="text-gray-500 text-xs">
                    {isExpanded ? '▼' : '▶'}
                </span>
            </button>
            {isExpanded && (
                <div className="px-3 pb-2 pt-0 text-sm text-gray-600">
                    {children}
                </div>
            )}
        </div>
    )
}

export default CollapsibleSection
