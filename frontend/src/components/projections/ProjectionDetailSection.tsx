import { CollapsibleSection } from '../shared'

interface DetailItem {
    label: string
    value: string
    colorClass?: string
    subItems?: { label: string; value: string }[]
}

interface ProjectionDetailSectionProps {
    title: string
    headerValue: React.ReactNode
    items: DetailItem[]
    emptyMessage: string
    accentColor?: string
}

export function ProjectionDetailSection({ title, headerValue, items, emptyMessage, accentColor }: ProjectionDetailSectionProps) {
    return (
        <CollapsibleSection
            title={
                <div className="flex items-center gap-2">
                    {accentColor && (
                        <div
                            className="w-2 h-2 flex-shrink-0"
                            style={{ backgroundColor: accentColor }}
                        />
                    )}
                    <span>{title}</span>
                </div>
            }
            rightContent={headerValue}
            activeBorderColor={accentColor}
        >
            <div className="space-y-1">
                {items.length === 0 ? (
                    <p className="font-light text-gray-400">{emptyMessage}</p>
                ) : (
                    items.map((item, idx) => (
                        <div key={idx} className="mb-1 last:mb-0">
                            <div className="flex justify-between hover:bg-gray-50 transition-colors px-2 py-0.5 -mx-2">
                                <span className="font-light truncate mr-2">{item.label}</span>
                                <span className={`font-medium whitespace-nowrap ${item.colorClass || ''}`}>
                                    {item.value}
                                </span>
                            </div>
                            {item.subItems && item.subItems.length > 0 && (
                                <div className="ml-4 space-y-0.5 text-xs text-gray-500 mt-0.5">
                                    {item.subItems.map((sub, sIdx) => (
                                        <div key={sIdx} className="flex justify-between">
                                            <span className="font-light">↳ {sub.label}:</span>
                                            <span>{sub.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </CollapsibleSection>
    )
}
