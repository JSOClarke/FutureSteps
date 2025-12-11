import Dashboard from './components/Dashboard'
import { PlansProvider } from './context/PlansContext'
import { FinancialItemsProvider } from './context/FinancialItemsContext'
import { SettingsProvider } from './context/SettingsContext'
import './index.css'

function App() {
  return (
    <SettingsProvider>
      <PlansProvider>
        <FinancialItemsProvider>
          <div className="min-h-screen bg-gray-50 p-4">
            <Dashboard />
          </div>
        </FinancialItemsProvider>
      </PlansProvider>
    </SettingsProvider>
  )
}

export default App
