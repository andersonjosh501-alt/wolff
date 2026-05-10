import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import ClientPortal from './pages/ClientPortal'

function AppContent() {
  const { user, loading } = useAuth()
  const [demoMode, setDemoMode] = useState(false)

  // Check if URL has portal param
  const isPortal = window.location.search.includes('portal=')

  if (isPortal) {
    return <ClientPortal />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafbfa]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-sage-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!user && !demoMode) {
    return <LandingPage onDemoLogin={() => setDemoMode(true)} />
  }

  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#1a1a1a',
            border: '1px solid #e6f0e6',
            borderRadius: '8px',
            fontSize: '14px',
          },
        }}
      />
      <AppContent />
    </AuthProvider>
  )
}
