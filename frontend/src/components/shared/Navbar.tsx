import { useState } from 'react'
import { PriorityModal } from '../priorities'
import { MilestoneDropdown, type Milestone } from '../milestones'
import { PlanSwitcher } from '../plans'

interface NavbarProps {
    surplusPriority: string[]
    deficitPriority: string[]
    onSurplusPriorityChange: (priority: string[]) => void
    onDeficitPriorityChange: (priority: string[]) => void
    milestones: Milestone[]
    onMilestonesChange: (milestones: Milestone[]) => void
}

function Navbar({
    surplusPriority,
    deficitPriority,
    onSurplusPriorityChange,
    onDeficitPriorityChange,
    milestones,
    onMilestonesChange
}: NavbarProps) {
    const [surplusModalOpen, setSurplusModalOpen] = useState(false)
    const [deficitModalOpen, setDeficitModalOpen] = useState(false)

    const handleAddMilestone = (milestone: Omit<Milestone, 'id'>) => {
        const newMilestone: Milestone = {
            ...milestone,
            id: Date.now().toString()
        }
        onMilestonesChange([...milestones, newMilestone])
    }

    const handleEditMilestone = (id: string, milestone: Omit<Milestone, 'id'>) => {
        onMilestonesChange(
            milestones.map(m => m.id === id ? { ...milestone, id } : m)
        )
    }

    const handleDeleteMilestone = (id: string) => {
        onMilestonesChange(milestones.filter(m => m.id !== id))
    }

    return (
        <>
            <nav
                className="w-full border border-black p-6 mb-4 bg-white"
                style={{
                    minHeight: '80px'
                }}
            >
                <div className="flex items-center justify-between h-full">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Finance Projection Calculator
                    </h1>

                    <div className="flex items-center gap-3">
                        <PlanSwitcher />

                        <MilestoneDropdown
                            milestones={milestones}
                            onAdd={handleAddMilestone}
                            onEdit={handleEditMilestone}
                            onDelete={handleDeleteMilestone}
                        />

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
