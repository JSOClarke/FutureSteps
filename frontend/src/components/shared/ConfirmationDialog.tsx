import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogBody
} from '../ui/dialog'
import { AlertTriangle } from 'lucide-react'

interface ConfirmationDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'danger' | 'warning' | 'info'
    loading?: boolean
}

export function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    loading = false
}: ConfirmationDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] overflow-hidden">
                <DialogHeader className="bg-white border-b-0 pb-0">
                    <div className="flex items-center gap-2">
                        {variant === 'danger' && <AlertTriangle className="text-red-600 w-5 h-5" />}
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                </DialogHeader>

                <DialogBody className="pt-2">
                    <DialogDescription className="text-base">
                        {description}
                    </DialogDescription>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 border border-black hover:bg-gray-100 transition-colors text-sm font-normal uppercase tracking-wide disabled:opacity-50"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`px-4 py-2 text-white transition-colors text-sm font-normal uppercase tracking-wide disabled:opacity-50 flex items-center gap-2
                                ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                                    variant === 'warning' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-black hover:bg-gray-800'}`}
                        >
                            {loading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {confirmLabel}
                        </button>
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
}
