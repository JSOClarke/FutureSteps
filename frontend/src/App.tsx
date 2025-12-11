import Dashboard from './components/Dashboard'
import Onboarding from './components/Onboarding'
import { UserProvider, useUser } from './context/UserContext'
import { PlansProvider } from './context/PlansContext'
import { FinancialItemsProvider } from './context/FinancialItemsContext'
import { SettingsProvider } from './context/SettingsContext'
import './index.css'

function AppContent() {
  const { userProfile } = useUser()

  // Show onboarding if no user profile exists
  if (!userProfile) {
    return <Onboarding />
  }

  // Show dashboard if user profile exists
  return (
    <div className="animate-fade-in">
      <SettingsProvider>
        <PlansProvider>
          <FinancialItemsProvider>
            <div className="min-h-screen bg-gray-50 p-4">
              <Dashboard />
            </div>
          </FinancialItemsProvider>
        </PlansProvider>
      </SettingsProvider>
    </div>
  )
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  )
}

export default App
