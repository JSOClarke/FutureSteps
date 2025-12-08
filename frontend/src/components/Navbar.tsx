import { useState } from 'react'
import PriorityModal from './PriorityModal'

interface NavbarProps {
    surplusPriority: string[]
    deficitPriority: string[]
    onSurplusPriorityChange: (priority: string[]) => void
    onDeficitPriorityChange: (priority: string[]) => void
}

function Navbar({
    surplusPriority,
    deficitPriority,
    onSurplusPriorityChange,
    onDeficitPriorityChange
}: NavbarProps) {
    const [surplusModalOpen, setSurplusModalOpen] = useState(false)
    const [deficitModalOpen, setDeficitModalOpen] = useState(false)

    return (
        <>
            <nav
                className="w-full border-2 p-6 mb-4 bg-white"
                style={{
                    borderColor: '#F0ABFC',
                    minHeight: '80px'
                }}
            >
                <div className="flex items-center justify-between h-full">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Finance Projection Calculator
                    </h1>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setSurplusModalOpen(true)}
                            className="px-4 py-2 bg-green-100 border-2 border-green-300 text-green-800 hover:bg-green-200 text-sm font-medium transition-colors"
                            title="Configure how surplus cash is allocated"
                        >
                            ⬆ Surplus Priority
                        </button>
                        <button
                            onClick={() => setDeficitModalOpen(true)}
                            className="px-4 py-2 bg-red-100 border-2 border-red-300 text-red-800 hover:bg-red-200 text-sm font-medium transition-colors"
                            title="Configure how deficits are covered"
                        >
                            ⬇ Deficit Priority
                        </button>
                    </div>
                </div>
            </nav>

            <PriorityModal
                isOpen={surplusModalOpen}
                onClose={() => setSurplusModalOpen(false)}
                type="surplus"
                initialPriority={surplusPriority}
                onSave={onSurplusPriorityChange}
            />

            <PriorityModal
                isOpen={deficitModalOpen}
                onClose={() => setDeficitModalOpen(false)}
                type="deficit"
                initialPriority={deficitPriority}
                onSave={onDeficitPriorityChange}
            />
        </>
    )
}

export default Navbar
