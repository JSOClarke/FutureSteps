import { useState } from 'react'
import Navbar from './Navbar'
import GraphVisualization from './GraphVisualization'
import ProjectionDetails from './ProjectionDetails'
import FinancialCategoryCard from './FinancialCategoryCard'

function Dashboard() {
    const [selectedYear, setSelectedYear] = useState<number | null>(null)
    const [surplusPriority, setSurplusPriority] = useState<string[]>([])
    const [deficitPriority, setDeficitPriority] = useState<string[]>([])

    return (
        <div className="w-full space-y-4">
            {/* Navbar */}
            <Navbar
                surplusPriority={surplusPriority}
                deficitPriority={deficitPriority}
                onSurplusPriorityChange={setSurplusPriority}
                onDeficitPriorityChange={setDeficitPriority}
            />

            {/* Top Section: Graph and Projection Details */}
            <div className="flex gap-4">
                <GraphVisualization
                    selectedYear={selectedYear}
                    onYearSelect={setSelectedYear}
                />
                <ProjectionDetails selectedYear={selectedYear} />
            </div>

            {/* Bottom Section: Financial Categories */}
            <div className="flex gap-4">
                <FinancialCategoryCard
                    title="Income"
                    category="income"
                    borderColor="#A7F3D0"
                />
                <FinancialCategoryCard
                    title="Expenses"
                    category="expenses"
                    borderColor="#FECACA"
                />
                <FinancialCategoryCard
                    title="Assets"
                    category="assets"
                    borderColor="#FDE68A"
                />
                <FinancialCategoryCard
                    title="Liabilities"
                    category="liabilities"
                    borderColor="#FED7AA"
                />
            </div>
        </div>
    )
}

export default Dashboard
