import { PageHeader } from '../components/shared/PageHeader'
import RunSimulation from '../components/retirement/RunSimulation'

export function ReportsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Reports & Simulations"
                subtitle="Run custom financial projections and analyze scenarios"
            />
            <RunSimulation />
        </div>
    )
}
