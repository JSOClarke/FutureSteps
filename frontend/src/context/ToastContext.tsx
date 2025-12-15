import { createContext, useContext, useState, useCallback } from 'react'
import { X, Check, AlertCircle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
    id: string
    title: string
    message?: string
    type: ToastType
    duration?: number
}

interface ToastContextType {
    toasts: Toast[]
    toast: (props: Omit<Toast, 'id'>) => void
    dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const toast = useCallback(({ title, message, type = 'info', duration = 3000 }: Omit<Toast, 'id'>) => {
        const id = crypto.randomUUID()
        const newToast: Toast = { id, title, message, type, duration }

        setToasts(prev => [...prev, newToast])

        if (duration > 0) {
            setTimeout(() => {
                dismiss(id)
            }, duration)
        }
    }, [dismiss])

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

// Internal Toast Components
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[], onDismiss: (id: string) => void }) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {toasts.map(t => (
                <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
            ))}
        </div>
    )
}

function ToastItem({ toast, onDismiss }: { toast: Toast, onDismiss: () => void }) {
    const icons = {
        success: <Check className="w-4 h-4 text-green-600" />,
        error: <AlertCircle className="w-4 h-4 text-red-600" />,
        warning: <AlertCircle className="w-4 h-4 text-orange-600" />,
        info: <Info className="w-4 h-4 text-blue-600" />
    }

    const borders = {
        success: 'border-green-200 bg-green-50',
        error: 'border-red-200 bg-red-50',
        warning: 'border-orange-200 bg-orange-50',
        info: 'border-blue-200 bg-blue-50'
    }

    return (
        <div className={`pointer-events-auto flex items-start p-4 border shadow-sm rounded-lg animate-in slide-in-from-right-full duration-300 ${borders[toast.type]}`}>
            <div className="flex-shrink-0 mt-0.5">
                {icons[toast.type]}
            </div>
            <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{toast.title}</p>
                {toast.message && (
                    <p className="mt-1 text-sm text-gray-500">{toast.message}</p>
                )}
            </div>
            <button
                onClick={onDismiss}
                className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}
