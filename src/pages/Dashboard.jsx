import { useApp } from '../context/AppContext'
import Sidebar from '../components/layout/Sidebar'
import ClientsTab from '../components/clients/ClientsTab'
import OperationsTab from '../components/operations/OperationsTab'
import StatusTab from '../components/status/StatusTab'
import SettingsTab from '../components/settings/SettingsTab'
import WelcomeOnboarding from '../components/onboarding/WelcomeOnboarding'

export default function Dashboard() {
  const { activeTab, loadingData, onboardingComplete, clients } = useApp()

  const renderTab = () => {
    switch (activeTab) {
      case 'clients': return <ClientsTab />
      case 'operations': return <OperationsTab />
      case 'status': return <StatusTab />
      case 'settings': return <SettingsTab />
      default: return <ClientsTab />
    }
  }

  if (loadingData) {
    return (
      <div className="flex h-screen bg-[#fafbfa]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-sage-500 border-t-transparent"></div>
        </main>
      </div>
    )
  }

  // Show onboarding for new users with no clients
  if (!onboardingComplete && clients.length === 0) {
    return <WelcomeOnboarding />
  }

  return (
    <div className="flex h-screen bg-[#fafbfa]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {renderTab()}
      </main>
    </div>
  )
}
