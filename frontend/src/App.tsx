import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Onboarding from './components/Onboarding'
import { UserProvider, useUser } from './context/UserContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PlansProvider } from './context/PlansContext'
import { FinancialItemsProvider } from './context/FinancialItemsContext'
import { SnapshotsProvider } from './context/SnapshotsContext'
import { DashboardItemsProvider } from './context/DashboardItemsContext'
import { SettingsProvider } from './context/SettingsContext'
import { ToastProvider } from './context/ToastContext'
import { MainLayout } from './components/layouts/MainLayout'
import { DashboardPage, PlansPage, ReportsPage } from './pages'
import Profile from './components/profile/Profile'
import './index.css'

function AppContent() {
  const { loading: authLoading, user } = useAuth()
  const { userProfile, loading: profileLoading } = useUser()

  if (authLoading || profileLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
        <p className="text-sm font-light text-gray-500 animate-pulse uppercase tracking-widest">Loading Application</p>
      </div>
    </div>

  }

  // Show Onboarding if not logged in AND no guest profile
  if (!user && !userProfile) {
    return <Onboarding />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <SettingsProvider>
            <PlansProvider>
              <FinancialItemsProvider>
                <SnapshotsProvider>
                  <DashboardItemsProvider>
                    <ToastProvider>
                      <AppContent />
                    </ToastProvider>
                  </DashboardItemsProvider>
                </SnapshotsProvider>
              </FinancialItemsProvider>
            </PlansProvider>
          </SettingsProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
