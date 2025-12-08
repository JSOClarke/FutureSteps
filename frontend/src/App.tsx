import Dashboard from './components/Dashboard'
import { FinancialItemsProvider } from './context/FinancialItemsContext'
import './index.css'

function App() {
  return (
    <FinancialItemsProvider>
      <div className="min-h-screen bg-gray-50 p-4">
        <Dashboard />
      </div>
    </FinancialItemsProvider>
  )
}

export default App
