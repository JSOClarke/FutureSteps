import Dashboard from './components/Dashboard'
import Onboarding from './components/Onboarding'
import { UserProvider, useUser } from './context/UserContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PlansProvider } from './context/PlansContext'
import { FinancialItemsProvider } from './context/FinancialItemsContext'
import { SettingsProvider } from './context/SettingsContext'
import './index.css'

function AppContent() {
  const { loading: authLoading } = useAuth()
  const { userProfile, loading: profileLoading } = useUser()

  if (authLoading || profileLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <SettingsProvider>
      <PlansProvider>
        <FinancialItemsProvider>
          <div className="animate-fade-in">
            {!userProfile ? (
              <Onboarding />
            ) : (
              <div className="min-h-screen bg-gray-50 p-4">
                <Dashboard />
              </div>
            )}
          </div>
        </FinancialItemsProvider>
      </PlansProvider>
    </SettingsProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </AuthProvider>
  )
}

export default App
