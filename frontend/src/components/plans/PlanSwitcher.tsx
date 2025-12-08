import { useState } from 'react'
import { usePlans } from '../../context/PlansContext'
import PlanModal from './PlanModal'

function PlanSwitcher() {
    const { plans, activePlanId, activePlan, setActivePlan } = usePlans()
    const [isOpen, setIsOpen] = useState(false)
    const [showModal, setShowModal] = useState(false)

    if (!activePlan) return null

    return (
        <>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="px-4 py-2 bg-purple-100 border-2 border-purple-300 text-purple-800 hover:bg-purple-200 text-sm font-medium transition-colors flex items-center gap-2"
                    title="Switch between plans"
                >
                    📊 {activePlan.name}
                    <span className="text-xs">(Plan {plans.findIndex(p => p.id === activePlanId) + 1}/{plans.length})</span>
                    <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {isOpen && (
                    <>
                        {/* Backdrop to close dropdown */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown menu */}
                        <div className="absolute top-full left-0 mt-1 w-72 bg-white border-2 border-gray-300 shadow-xl z-20 max-h-96 overflow-y-auto">
                            {/* Quick switch plans */}
                            <div className="p-2 border-b border-gray-200">
                                <div className="text-xs font-semibold text-gray-600 px-2 py-1">
                                    SWITCH TO:
                                </div>
                                {plans.map(plan => (
                                    <button
                                        key={plan.id}
                                        onClick={() => {
                                            setActivePlan(plan.id)
                                            setIsOpen(false)
                                        }}
                                        className={`w-full text-left px-3 py-2 hover:bg-purple-50 transition-colors flex items-center justify-between ${plan.id === activePlanId ? 'bg-purple-100 font-semibold' : ''
                                            }`}
                                    >
                                        <div>
                                            <div className="font-medium">{plan.name}</div>
                                            <div className="text-xs text-gray-600">
                                                {plan.financialItems.length} items • {plan.milestones.length} milestones
                                            </div>
                                        </div>
                                        {plan.id === activePlanId && (
                                            <span className="text-purple-600 font-bold">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Manage plans button */}
                            <button
                                onClick={() => {
                                    setShowModal(true)
                                    setIsOpen(false)
                                }}
                                className="w-full px-3 py-2 bg-purple-500 text-white hover:bg-purple-600 font-medium text-sm"
                            >
                                ⚙️ Manage Plans
                            </button>
                        </div>
                    </>
                )}
            </div>

            <PlanModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </>
    )
}

export default PlanSwitcher
