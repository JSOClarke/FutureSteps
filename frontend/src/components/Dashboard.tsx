import { useState, createContext, useContext } from 'react'
import { usePlans } from '../context/PlansContext'
import { GraphVisualization, ProjectionDetails } from './projections'
import { FinancialCategoryCard } from './financial'
import Profile from './profile/Profile'
import { Sidebar } from './shared/Sidebar'
import { Navbar } from './shared'
import RunSimulation from './retirement/RunSimulation'


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

type Page = 'dashboard' | 'plans' | 'profile' | 'settings' | 'reports'

function Dashboard() {
    const [selectedYear, setSelectedYear] = useState<number | null>(null)
    const [currentPage, setCurrentPage] = useState<Page>('plans') // Start on plans page
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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
            <div className="flex min-h-screen bg-gray-50">
                {/* Sidebar */}
                <Sidebar
                    currentPage={currentPage}
                    onNavigate={(page) => setCurrentPage(page as Page)}
                    isCollapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                {/* Main content area - adjusts based on sidebar state */}
                <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                    {/* Top bar with plan controls (only on plans page) */}
                    {currentPage === 'plans' && (
                        <Navbar
                            surplusPriority={surplusPriority}
                            deficitPriority={deficitPriority}
                            onSurplusPriorityChange={handleSurplusPriorityChange}
                            onDeficitPriorityChange={handleDeficitPriorityChange}
                            milestones={milestones}
                            onMilestonesChange={handleMilestonesChange}
                            onSimulationClick={() => { }}
                        />
                    )}

                    {/* Page content */}
                    <div className="p-4">
                        {currentPage === 'dashboard' && (
                            <div className="max-w-4xl mx-auto text-center py-20">
                                <h1 className="text-4xl font-light mb-4">Dashboard</h1>
                                <p className="text-gray-600 text-lg">Coming soon...</p>
                            </div>
                        )}

                        {currentPage === 'plans' && (
                            <div className="space-y-4">
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
                        )}

                        {currentPage === 'profile' && (
                            <Profile />
                        )}

                        {currentPage === 'settings' && (
                            <div className="max-w-4xl mx-auto">
                                <h1 className="text-3xl font-light mb-8">Settings</h1>
                                <p className="text-gray-600">Settings page coming soon...</p>
                            </div>
                        )}

                        {currentPage === 'reports' && (
                            <div className="max-w-4xl mx-auto">
                                <h1 className="text-3xl font-light mb-8">Reports</h1>
                                <div className="space-y-4">
                                    <RunSimulation onBack={() => setCurrentPage('dashboard')} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PriorityContext.Provider >
    )
}

export default Dashboard
