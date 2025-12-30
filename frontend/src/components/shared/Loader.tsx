interface LoaderProps {
    className?: string
    text?: string
    fullScreen?: boolean
}

export function Loader({ className = '', text, fullScreen = false }: LoaderProps) {
    const content = (
        <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
            <div
                className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"
                role="status"
                aria-label="Loading"
            />
            {text && (
                <p className="text-sm font-light text-gray-500 animate-pulse uppercase tracking-widest">
                    {text}
                </p>
            )}
        </div>
    )

    if (fullScreen) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-100px)] w-full">
                {content}
            </div>
        )
    }

    return content
}
