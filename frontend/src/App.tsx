import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Onboarding from './components/Onboarding'
import { UserProvider, useUser } from './context/UserContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PlansProvider } from './context/PlansContext'
import { FinancialItemsProvider } from './context/FinancialItemsContext'
import { SettingsProvider } from './context/SettingsContext'
import { MainLayout } from './components/layouts/MainLayout'
import { DashboardPage, PlansPage, SettingsPage, ReportsPage } from './pages'
import Profile from './components/profile/Profile'
import './index.css'

function AppContent() {
  const { loading: authLoading } = useAuth()
  const { userProfile, loading: profileLoading } = useUser()

  if (authLoading || profileLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!userProfile) {
    return <Onboarding />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/plans" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <SettingsProvider>
          <PlansProvider>
            <FinancialItemsProvider>
              <AppContent />
            </FinancialItemsProvider>
          </PlansProvider>
        </SettingsProvider>
      </UserProvider>
    </AuthProvider>
  )
}

export default App
