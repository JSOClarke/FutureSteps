import { useState, createContext, useContext } from 'react'
import { usePlans } from '../context/PlansContext'
import { GraphVisualization, ProjectionDetails } from '../components/projections'
import { FinancialCategoryCard } from '../components/financial'
import { Navbar } from '../components/shared'

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
            {/* Top bar with plan controls */}
            <Navbar
                surplusPriority={surplusPriority}
                deficitPriority={deficitPriority}
                onSurplusPriorityChange={handleSurplusPriorityChange}
                onDeficitPriorityChange={handleDeficitPriorityChange}
                milestones={milestones}
                onMilestonesChange={handleMilestonesChange}
                onSimulationClick={() => { }}
            />

            {/* Page content */}
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
        </PriorityContext.Provider>
    )
}
