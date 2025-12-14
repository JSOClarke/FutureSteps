import RunSimulation from '../components/retirement/RunSimulation'

export function ReportsPage() {
    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-light mb-8">Reports</h1>
                <div className="space-y-4">
                    <RunSimulation onBack={() => { }} />
                </div>
            </div>
        </div>
    )
}
