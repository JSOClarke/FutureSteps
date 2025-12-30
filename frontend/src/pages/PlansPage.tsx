import { useState, createContext, useContext } from 'react'
import { Pencil, TrendingUp, Plus } from 'lucide-react'
import { usePlans } from '../context/PlansContext'
import { GraphVisualization, ProjectionDetails } from '../components/projections'
import { FinancialCategoryCard } from '../components/financial'
import { PageHeader } from '../components/shared/PageHeader'
import { Navbar } from '../components/shared'
import { Loader } from '../components/shared/Loader'
import RunSimulation from '../components/retirement/RunSimulation'
import RenamePlanModal from '../components/plans/RenamePlanModal'
import CreatePlanModal from '../components/plans/CreatePlanModal'

// Create context for priority orders
interface PriorityContextType {
    surplusPriority: string[]
    deficitPriority: string[]
}

const PriorityContext = createContext<PriorityContextType>({
    surplusPriority: [],
    deficitPriority: []
})

export const usePriority = () => useContext(PriorityContext)

export function PlansPage() {
    const [selectedYear, setSelectedYear] = useState<number | null>(null)
    const [showSimulation, setShowSimulation] = useState(false)
    const [isRealValues, setIsRealValues] = useState(false)
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const { plans, activePlan, updatePlan, activePlanId, loading } = usePlans()
    const [renameModalOpen, setRenameModalOpen] = useState(false)

    if (loading) {
        return <Loader fullScreen text="Loading Plans" />
    }

    // Empty State
    if (plans.length === 0) {
        return (
            <>
                <PageHeader
                    title="Financial Plans"
                    subtitle="Create your first plan to get started"
                />
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 bg-gray-50 min-h-[50vh]">
                    <div className="bg-white p-4 rounded-full border-2 border-black mb-6">
                        <TrendingUp size={32} className="text-black" />
                    </div>
                    <h2 className="text-2xl font-normal mb-2">No Financial Plans Yet</h2>
                    <p className="text-gray-600 mb-8 max-w-md text-center">
                        Create multiple financial scenarios to compare different paths for your future.
                        Simulate retirement, major purchases, or career changes.
                    </p>
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors text-sm font-normal uppercase tracking-wide"
                    >
                        <Plus size={20} />
                        Create Your First Plan
                    </button>
                    <CreatePlanModal
                        isOpen={createModalOpen}
                        onClose={() => setCreateModalOpen(false)}
                    />
                </div>
            </>
        )
    }

    const surplusPriority = activePlan?.surplusPriority || []
    const deficitPriority = activePlan?.deficitPriority || []
    const milestones = activePlan?.milestones || []

    const handleSurplusPriorityChange = (priority: string[]) => {
        if (activePlanId && activePlan) {
            updatePlan(activePlanId, { surplusPriority: priority })
        }
    }

    const handleDeficitPriorityChange = (priority: string[]) => {
        if (activePlanId && activePlan) {
            updatePlan(activePlanId, { deficitPriority: priority })
        }
    }

    const handleMilestonesChange = (newMilestones: typeof milestones) => {
        if (activePlanId && activePlan) {
            updatePlan(activePlanId, { milestones: newMilestones })
        }
    }

    return (
        <PriorityContext.Provider value={{ surplusPriority, deficitPriority }}>
            <PageHeader
                title={
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <span>
                                <span className="text-gray-400">PLAN : </span>
                                {activePlan?.name || 'Financial Plan'}
                            </span>
                            {activePlan && (
                                <button
                                    onClick={() => setRenameModalOpen(true)}
                                    className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                                    title="Edit Plan"
                                >
                                    <Pencil size={18} />
                                </button>
                            )}
                        </div>
                        {activePlan?.description && (
                            <p className="text-sm text-gray-500 font-light max-w-2xl">
                                {activePlan.description}
                            </p>
                        )}
                    </div>
                }
            />

            {/* Top bar with plan controls */}
            <Navbar
                surplusPriority={surplusPriority}
                deficitPriority={deficitPriority}
                onSurplusPriorityChange={handleSurplusPriorityChange}
                onDeficitPriorityChange={handleDeficitPriorityChange}
                milestones={milestones}
                onMilestonesChange={handleMilestonesChange}
                onSimulationClick={() => setShowSimulation(true)}
            />

            {/* Page content */}
            <div className="space-y-4">
                {/* Top Section: Graph and Projection Details */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <GraphVisualization
                        selectedYear={selectedYear}
                        onYearSelect={setSelectedYear}
                        milestones={milestones}
                        isRealValues={isRealValues}
                    />
                    <ProjectionDetails
                        selectedYear={selectedYear}
                        onYearChange={setSelectedYear}
                        isRealValues={isRealValues}
                        onToggleRealValues={setIsRealValues}
                    />
                </div>

                {/* Bottom Section: Financial Categories */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <FinancialCategoryCard
                        title="Income"
                        category="income"
                        backgroundColor="#FFFFFF"
                    />
                    <FinancialCategoryCard
                        title="Expenses"
                        category="expenses"
                        backgroundColor="#FFFFFF"
                    />
                    <FinancialCategoryCard
                        title="Assets"
                        category="assets"
                        backgroundColor="#FFFFFF"
                    />
                    <FinancialCategoryCard
                        title="Liabilities"
                        category="liabilities"
                        backgroundColor="#FFFFFF"
                    />
                </div>
            </div>

            {/* Plan-Specific Simulation Modal */}
            {showSimulation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white border-2 border-black w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b-2 border-black p-4 flex justify-between items-center">
                            <h2 className="text-2xl font-normal">
                                Simulation: {activePlan?.name || 'Current Plan'}
                            </h2>
                            <button
                                onClick={() => setShowSimulation(false)}
                                className="px-4 py-2 border border-black hover:bg-gray-100 transition-colors text-sm font-normal uppercase tracking-wide"
                            >
                                Close
                            </button>
                        </div>
                        <div className="p-4">
                            <RunSimulation onBack={() => setShowSimulation(false)} lockToPlan={true} />
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Plan Modal */}
            {activePlan && (
                <RenamePlanModal
                    isOpen={renameModalOpen}
                    onClose={() => setRenameModalOpen(false)}
                    planId={activePlan.id}
                    currentName={activePlan.name}
                    currentDescription={activePlan.description}
                />
            )}

            {/* Create Plan Modal needs to be available even if plans exist, technically, 
                but usually Sidebar creates plans. 
                However, handling it here for consistency if we wanted an 'Add Plan' button 
                in the header later. For now only used in Empty State.
            */}
            <CreatePlanModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
            />
        </PriorityContext.Provider>
    )
}
