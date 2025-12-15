interface PageHeaderProps {
    title: string | React.ReactNode
    subtitle?: string
    children?: React.ReactNode // For optional action buttons or other elements
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
    return (
        <div className={`mb-6 ${children ? 'flex justify-between items-start' : ''}`}>
            <div>
                <h1 className="text-3xl font-normal">{title}</h1>
                {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
            </div>
            {children && <div>{children}</div>}
        </div>
    )
}
