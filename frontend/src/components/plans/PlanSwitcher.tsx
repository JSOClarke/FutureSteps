import { useState } from 'react'
import { usePlans } from '../../context/PlansContext'
import PlanModal from './PlanModal'

function PlanSwitcher() {
    const { plans, activePlanId, activePlan, setActivePlan } = usePlans()
    const [isOpen, setIsOpen] = useState(false)
    const [showModal, setShowModal] = useState(false)

    if (!activePlan) {
        return (
            <>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 bg-black text-white hover:bg-gray-800 text-sm font-normal uppercase tracking-wide transition-colors"
                >
                    Create Plan
                </button>
                <PlanModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                />
            </>
        )
    }

    return (
        <>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="px-6 py-3 bg-white border border-black text-black hover:bg-gray-50 text-sm font-light uppercase tracking-wide transition-colors flex items-center gap-2"
                    title="Switch between plans"
                >
                    {activePlan.name}
                    <span className="text-xs normal-case tracking-normal">(Plan {plans.findIndex(p => p.id === activePlanId) + 1}/{plans.length})</span>
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
                        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-black shadow-xl z-20 max-h-96 overflow-y-auto">
                            {/* Quick switch plans */}
                            <div className="p-2 border-b border-gray-200">
                                <div className="text-xs font-light text-gray-600 px-2 py-1 uppercase tracking-wide">
                                    Switch To:
                                </div>
                                {plans.map(plan => (
                                    <button
                                        key={plan.id}
                                        onClick={() => {
                                            setActivePlan(plan.id)
                                            setIsOpen(false)
                                        }}
                                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center justify-between ${plan.id === activePlanId ? 'bg-gray-100 font-normal' : 'font-light'
                                            }`}
                                    >
                                        <div>
                                            <div className="font-normal">{plan.name}</div>
                                            <div className="text-xs text-gray-600 font-light">
                                                {plan.financialItems.length} items • {plan.milestones.length} milestones
                                            </div>
                                        </div>
                                        {plan.id === activePlanId && (
                                            <span className="text-black font-bold">✓</span>
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
                                className="w-full px-3 py-2 bg-black text-white hover:bg-gray-800 font-normal text-sm uppercase tracking-wide"
                            >
                                Manage Plans
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
