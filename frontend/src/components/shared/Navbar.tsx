import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { PriorityModal } from '../priorities'
import { MilestoneDropdown, type Milestone } from '../milestones'
import { NavButton } from './NavButton'

interface NavbarProps {
    surplusPriority: string[]
    deficitPriority: string[]
    onSurplusPriorityChange: (priority: string[]) => void
    onDeficitPriorityChange: (priority: string[]) => void
    milestones: Milestone[]
    onMilestonesChange: (milestones: Milestone[]) => void
    onSimulationClick: () => void
}

function Navbar({
    surplusPriority,
    deficitPriority,
    onSurplusPriorityChange,
    onDeficitPriorityChange,
    milestones,
    onMilestonesChange,
    onSimulationClick
}: NavbarProps) {
    const [surplusModalOpen, setSurplusModalOpen] = useState(false)
    const [deficitModalOpen, setDeficitModalOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
                {/* Desktop Navigation (hidden on mobile) */}
                <div className="hidden lg:flex items-center gap-1.5 xl:gap-6 h-full flex-wrap max-w-full">
                    {/* Navigation Items */}
                    <MilestoneDropdown
                        milestones={milestones}
                        onAdd={handleAddMilestone}
                        onEdit={handleEditMilestone}
                        onDelete={handleDeleteMilestone}
                    />

                    <NavButton
                        onClick={() => setSurplusModalOpen(true)}
                        title="Configure how surplus cash is allocated"
                    >
                        Surplus
                    </NavButton>
                    <NavButton
                        onClick={() => setDeficitModalOpen(true)}
                        title="Configure how deficits are covered"
                    >
                        Deficit
                    </NavButton>
                    <NavButton
                        onClick={onSimulationClick}
                        title="Run retirement simulation"
                    >
                        Simulation
                    </NavButton>
                </div>

                {/* Mobile Navigation */}
                <div className="lg:hidden">
                    {/* Mobile Header: Logo + Hamburger */}
                    <div className="flex items-center justify-between">
                        <NavLink to="/dashboard" className="block hover:opacity-80 transition-opacity">
                            <img
                                src="/logo.png"
                                alt="FutureSteps"
                                className="h-10 mix-blend-multiply contrast-125 brightness-110"
                            />
                        </NavLink>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 hover:bg-gray-50 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {/* Hamburger Icon */}
                            <div className="w-6 h-5 flex flex-col justify-between">
                                <span className={`block h-0.5 w-full bg-black transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                                <span className={`block h-0.5 w-full bg-black transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                                <span className={`block h-0.5 w-full bg-black transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                            </div>
                        </button>
                    </div>

                    {/* Mobile Dropdown Menu */}
                    {mobileMenuOpen && (
                        <div className="mt-4 pt-4 border-t border-black space-y-2 [&>*]:w-full [&>*>button]:w-full">
                            <MilestoneDropdown
                                milestones={milestones}
                                onAdd={handleAddMilestone}
                                onEdit={handleEditMilestone}
                                onDelete={handleDeleteMilestone}
                            />

                            <NavButton
                                onClick={() => {
                                    setSurplusModalOpen(true)
                                    setMobileMenuOpen(false)
                                }}
                                className="w-full"
                            >
                                Surplus Priority
                            </NavButton>
                            <NavButton
                                onClick={() => {
                                    setDeficitModalOpen(true)
                                    setMobileMenuOpen(false)
                                }}
                                className="w-full"
                            >
                                Deficit Priority
                            </NavButton>
                            <NavButton
                                onClick={() => {
                                    onSimulationClick()
                                    setMobileMenuOpen(false)
                                }}
                                className="w-full"
                            >
                                Run Simulation
                            </NavButton>
                        </div>
                    )}
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
