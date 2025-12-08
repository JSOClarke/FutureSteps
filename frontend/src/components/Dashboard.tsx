import { useState, createContext, useContext } from 'react'
import { usePlans } from '../context/PlansContext'
import { Navbar } from './shared'
import { GraphVisualization, ProjectionDetails } from './projections'
import { FinancialCategoryCard } from './financial'

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

function Dashboard() {
    const [selectedYear, setSelectedYear] = useState<number | null>(null)
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
                {/* Navbar */}
                <Navbar
                    surplusPriority={surplusPriority}
                    deficitPriority={deficitPriority}
                    onSurplusPriorityChange={handleSurplusPriorityChange}
                    onDeficitPriorityChange={handleDeficitPriorityChange}
                    milestones={milestones}
                    onMilestonesChange={handleMilestonesChange}
                />

                {/* Top Section: Graph and Projection Details */}
                <div className="flex gap-4">
                    <GraphVisualization
                        selectedYear={selectedYear}
                        onYearSelect={setSelectedYear}
                        milestones={milestones}
                    />
                    <ProjectionDetails selectedYear={selectedYear} />
                </div>

                {/* Bottom Section: Financial Categories */}
                <div className="flex gap-4">
                    <FinancialCategoryCard
                        title="Income"
                        category="income"
                        backgroundColor="#D4F4DD"
                        itemColor="#A8E6C1"
                    />
                    <FinancialCategoryCard
                        title="Expenses"
                        category="expenses"
                        backgroundColor="#FFDCE0"
                        itemColor="#FFC4CB"
                    />
                    <FinancialCategoryCard
                        title="Assets"
                        category="assets"
                        backgroundColor="#FFF3CD"
                        itemColor="#FFE89A"
                    />
                    <FinancialCategoryCard
                        title="Liabilities"
                        category="liabilities"
                        backgroundColor="#FFE5D9"
                        itemColor="#FFD4B8"
                    />
                </div>
            </div>
        </PriorityContext.Provider>
    )
}

export default Dashboard
