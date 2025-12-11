import { useState, createContext, useContext } from 'react'
import { usePlans } from '../context/PlansContext'
import { Navbar } from './shared'
import { GraphVisualization, ProjectionDetails } from './projections'
import { FinancialCategoryCard } from './financial'
import Settings from './Settings'

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

type View = 'dashboard' | 'settings'

function Dashboard() {
    const [selectedYear, setSelectedYear] = useState<number | null>(null)
    const [currentView, setCurrentView] = useState<View>('dashboard')
    const { activePlan, updatePlan, activePlanId } = usePlans()

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
            <div className="w-full space-y-4">
                {/* Navbar - always shown */}
                {currentView === 'dashboard' && (
                    <Navbar
                        surplusPriority={surplusPriority}
                        deficitPriority={deficitPriority}
                        onSurplusPriorityChange={handleSurplusPriorityChange}
                        onDeficitPriorityChange={handleDeficitPriorityChange}
                        milestones={milestones}
                        onMilestonesChange={handleMilestonesChange}
                        onSettingsClick={() => setCurrentView('settings')}
                    />
                )}

                {/* Conditional view rendering */}
                {currentView === 'settings' ? (
                    <Settings onBack={() => setCurrentView('dashboard')} />
                ) : (
                    <>
                        {/* Top Section: Graph and Projection Details */}
                        <div className="flex flex-col lg:flex-row gap-4">
                            <GraphVisualization
                                selectedYear={selectedYear}
                                onYearSelect={setSelectedYear}
                                milestones={milestones}
                            />
                            <ProjectionDetails
                                selectedYear={selectedYear}
                                onYearChange={setSelectedYear}
                            />
                        </div>

                        {/* Bottom Section: Financial Categories */}
                        <div className="flex flex-col lg:flex-row gap-4">
                            <FinancialCategoryCard
                                title="Income"
                                category="income"
                                backgroundColor="#FFFFFF"
                                itemColor="#F3F4F6"
                            />
                            <FinancialCategoryCard
                                title="Expenses"
                                category="expenses"
                                backgroundColor="#FFFFFF"
                                itemColor="#F3F4F6"
                            />
                            <FinancialCategoryCard
                                title="Assets"
                                category="assets"
                                backgroundColor="#FFFFFF"
                                itemColor="#F3F4F6"
                            />
                            <FinancialCategoryCard
                                title="Liabilities"
                                category="liabilities"
                                backgroundColor="#FFFFFF"
                                itemColor="#F3F4F6"
                            />
                        </div>
                    </>
                )}
            </div>
        </PriorityContext.Provider>
    )
}

export default Dashboard
