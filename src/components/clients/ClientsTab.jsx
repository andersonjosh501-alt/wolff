import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import ClientCard from './ClientCard'
import ClientDetail from './ClientDetail'
import AddClientModal from './AddClientModal'
import ImportModal from './ImportModal'
import { Plus, Upload, Search } from 'lucide-react'

const subTabs = [
  { id: 'personal', label: 'Personal Returns', desc: '1040' },
  { id: 'estate', label: 'Estate Returns', desc: '1041' },
  { id: 'corporate', label: 'Corporate Returns', desc: '1120 / 1065' },
]

export default function ClientsTab() {
  const { clients, clientSubTab, setClientSubTab, selectedClient, setSelectedClient } = useApp()
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  const filteredClients = clients
    .filter(c => c.type === clientSubTab)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) ||
                 c.email.toLowerCase().includes(search.toLowerCase()))

  if (selectedClient) {
    const client = clients.find(c => c.id === selectedClient)
    if (client) return <ClientDetail client={client} onBack={() => setSelectedClient(null)} />
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all your tax clients</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Upload size={16} /> Import
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Client
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setClientSubTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${clientSubTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.label} <span className="text-xs text-gray-400 ml-1">{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-400 bg-white"
        />
      </div>

      {/* Client Grid */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No clients found</p>
          <p className="text-sm mt-1">Add a client or try a different search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClients.map(client => (
            <ClientCard key={client.id} client={client} onClick={() => setSelectedClient(client.id)} />
          ))}
        </div>
      )}

      {showAddModal && <AddClientModal onClose={() => setShowAddModal(false)} type={clientSubTab} />}
      {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} />}
    </div>
  )
}
