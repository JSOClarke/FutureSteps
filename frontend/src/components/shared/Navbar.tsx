import { useState } from 'react'
import { PriorityModal } from '../priorities'
import { MilestoneDropdown, type Milestone } from '../milestones'
import { PlanSwitcher } from '../plans'
import { LoginButton } from './LoginButton'

import { NavButton } from './NavButton'

interface NavbarProps {
    surplusPriority: string[]
    deficitPriority: string[]
    onSurplusPriorityChange: (priority: string[]) => void
    onDeficitPriorityChange: (priority: string[]) => void
    milestones: Milestone[]
    onMilestonesChange: (milestones: Milestone[]) => void
    onProfileClick: () => void
    onSimulationClick: () => void
}

function Navbar({
    surplusPriority,
    deficitPriority,
    onSurplusPriorityChange,
    onDeficitPriorityChange,
    milestones,
    onMilestonesChange,
    onProfileClick,
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
                <div className="hidden lg:flex items-center gap-2 xl:gap-8 h-full">
                    {/* Logo */}
                    <img
                        src="/chronos-logo.png"
                        alt="Chronos"
                        className="h-14 mix-blend-multiply contrast-125 brightness-110"
                    />

                    {/* Navigation Items */}
                    <PlanSwitcher />

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
                        Surplus Priority
                    </NavButton>
                    <NavButton
                        onClick={() => setDeficitModalOpen(true)}
                        title="Configure how deficits are covered"
                    >
                        Deficit Priority
                    </NavButton>
                    <NavButton
                        onClick={onSimulationClick}
                        title="Run retirement simulation"
                    >
                        Run Simulation
                    </NavButton>
                    <NavButton
                        onClick={onProfileClick}
                        title="Open profile"
                    >
                        Profile
                    </NavButton>
                    <div className="ml-auto">
                        <LoginButton />
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="lg:hidden">
                    {/* Mobile Header: Logo + Hamburger */}
                    <div className="flex items-center justify-between">
                        <img
                            src="/chronos-logo.png"
                            alt="Chronos"
                            className="h-10 mix-blend-multiply contrast-125 brightness-110"
                        />
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
                            <PlanSwitcher />

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
                            <NavButton
                                onClick={() => {
                                    onProfileClick()
                                    setMobileMenuOpen(false)
                                }}
                                className="w-full"
                            >
                                Profile
                            </NavButton>
                            <div className="pt-2 border-t border-gray-200">
                                <LoginButton />
                            </div>
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
