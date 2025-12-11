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
    onSettingsClick: () => void
}

function Navbar({
    surplusPriority,
    deficitPriority,
    onSurplusPriorityChange,
    onDeficitPriorityChange,
    milestones,
    onMilestonesChange,
    onSettingsClick
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
                className="w-full border border-black p-3 mb-4 bg-white"
                style={{
                    minHeight: '60px'
                }}
            >
                <div className="flex items-center gap-8 h-full">
                    {/* Logo */}
                    <img
                        src="/chronos-logo.png"
                        alt="Chronos"
                        className="h-14"
                    />

                    {/* Navigation Items */}
                    <PlanSwitcher />

                    <MilestoneDropdown
                        milestones={milestones}
                        onAdd={handleAddMilestone}
                        onEdit={handleEditMilestone}
                        onDelete={handleDeleteMilestone}
                    />

                    <button
                        onClick={() => setSurplusModalOpen(true)}
                        className="px-6 py-3 bg-white border border-black text-black hover:bg-gray-50 text-sm font-light uppercase tracking-wide transition-colors"
                        title="Configure how surplus cash is allocated"
                    >
                        Surplus Priority
                    </button>
                    <button
                        onClick={() => setDeficitModalOpen(true)}
                        className="px-6 py-3 bg-white border border-black text-black hover:bg-gray-50 text-sm font-light uppercase tracking-wide transition-colors"
                        title="Configure how deficits are covered"
                    >
                        Deficit Priority
                    </button>
                    <button
                        onClick={onSettingsClick}
                        className="px-6 py-3 bg-white border border-black text-black hover:bg-gray-50 text-sm font-light uppercase tracking-wide transition-colors"
                        title="Open settings"
                    >
                        Settings
                    </button>
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
