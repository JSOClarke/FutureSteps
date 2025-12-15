import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    description?: string
    children: ReactNode
    maxWidth?: string
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    maxWidth = 'max-w-2xl'
}: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className={`bg-white w-full ${maxWidth} max-h-[90vh] overflow-y-auto border border-black shadow-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-black">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-normal text-black uppercase tracking-wide">
                                {title}
                            </h2>
                            {description && (
                                <p className="text-sm text-gray-500 mt-1 font-light">
                                    {description}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-black hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}
