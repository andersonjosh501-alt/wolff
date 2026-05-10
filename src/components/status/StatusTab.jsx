import { useApp } from '../../context/AppContext'
import StatusBadge, { statusConfig } from '../common/StatusBadge'
import { BarChart3, Clock, CalendarDays, AlertTriangle, TrendingUp } from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'

const pipelineStages = [
  { key: 'not_started', label: 'Not Started', color: 'bg-gray-200' },
  { key: 'waiting_documents', label: 'Waiting on Docs', color: 'bg-amber-300' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-300' },
  { key: 'ready_review', label: 'Ready for Review', color: 'bg-purple-300' },
  { key: 'complete', label: 'Complete', color: 'bg-sage-400' },
  { key: 'picked_up', label: 'Picked Up', color: 'bg-sage-600' },
]

export default function StatusTab() {
  const { clients, stats, setSelectedClient, setActiveTab } = useApp()
  const today = new Date()

  const clientsWithMeta = clients.map(c => ({
    ...c,
    daysSinceContact: differenceInDays(today, parseISO(c.lastContact)),
  })).sort((a, b) => b.daysSinceContact - a.daysSinceContact)

  const completionRate = clients.length > 0
    ? Math.round(((stats.complete + stats.picked_up) / stats.total) * 100)
    : 0

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Status Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Bird's eye view of all returns</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-sage-100 rounded-lg flex items-center justify-center">
              <BarChart3 size={18} className="text-sage-600" />
            </div>
            <span className="text-sm text-gray-500">Total Clients</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock size={18} className="text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">Waiting on Docs</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.waiting_documents}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={18} className="text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">In Progress</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.in_progress}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-sage-100 rounded-lg flex items-center justify-center">
              <CalendarDays size={18} className="text-sage-600" />
            </div>
            <span className="text-sm text-gray-500">Completion Rate</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{completionRate}%</p>
        </div>
      </div>

      {/* Pipeline View */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-6">Pipeline</h3>
        <div className="flex gap-2 h-8 rounded-lg overflow-hidden mb-4">
          {pipelineStages.map(stage => {
            const count = clients.filter(c => c.status === stage.key).length
            const pct = clients.length > 0 ? (count / clients.length) * 100 : 0
            if (pct === 0) return null
            return (
              <div
                key={stage.key}
                className={`${stage.color} relative group transition-all`}
                style={{ width: `${pct}%`, minWidth: count > 0 ? '32px' : 0 }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-sm">{count}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-4">
          {pipelineStages.map(stage => {
            const count = clients.filter(c => c.status === stage.key).length
            return (
              <div key={stage.key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                <span className="text-xs text-gray-600">{stage.label} ({count})</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Client Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">All Clients</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Client</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Type</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Last Contact</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Days Since</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Next Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clientsWithMeta.map(client => (
                <tr
                  key={client.id}
                  onClick={() => { setSelectedClient(client.id); setActiveTab('clients') }}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-400">{client.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-gray-500 capitalize">{client.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{format(parseISO(client.lastContact), 'MMM d, yyyy')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${client.daysSinceContact > 7 ? 'text-red-500' : client.daysSinceContact > 3 ? 'text-amber-500' : 'text-gray-600'}`}>
                      {client.daysSinceContact}d
                      {client.daysSinceContact > 7 && <AlertTriangle size={12} className="inline ml-1" />}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500">
                      {client.status === 'waiting_documents' && 'Follow up on documents'}
                      {client.status === 'not_started' && 'Begin return preparation'}
                      {client.status === 'in_progress' && 'Continue preparation'}
                      {client.status === 'ready_review' && 'Review and finalize'}
                      {client.status === 'complete' && 'Notify for pickup'}
                      {client.status === 'picked_up' && 'Done'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
