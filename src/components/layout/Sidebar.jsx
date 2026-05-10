import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { Users, Wrench, BarChart3, Settings, LogOut } from 'lucide-react'

const tabs = [
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'operations', label: 'Operations', icon: Wrench },
  { id: 'status', label: 'Status', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const { activeTab, setActiveTab } = useApp()
  const { signOut } = useAuth()

  return (
    <aside className="w-[220px] bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-sage-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">W</span>
        </div>
        <span className="text-lg font-semibold tracking-tight text-gray-900">Wolff</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1
                ${isActive
                  ? 'bg-sage-50 text-sage-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <LogOut size={18} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
