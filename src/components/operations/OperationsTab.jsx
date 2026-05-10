import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import StatusBadge from '../common/StatusBadge'
import DocIndicator from '../common/DocIndicator'
import { Check, X, Send, MessageSquare, Phone, Mail, FileText, Zap, ChevronRight } from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import toast from 'react-hot-toast'

export default function OperationsTab() {
  const { clients, updateClient, addCommunication, setActiveTab, setSelectedClient } = useApp()
  const [selectedId, setSelectedId] = useState(null)
  const [aiPrompt, setAiPrompt] = useState('')

  // Clients needing action — sorted by urgency
  const actionQueue = [...clients]
    .filter(c => c.status !== 'complete' && c.status !== 'picked_up')
    .sort((a, b) => {
      const priority = { waiting_documents: 0, not_started: 1, in_progress: 2, ready_review: 3 }
      return (priority[a.status] ?? 99) - (priority[b.status] ?? 99)
    })

  const selected = clients.find(c => c.id === selectedId)

  const handleQuickAction = (action) => {
    if (!selected) return

    let message = ''
    switch (action) {
      case 'request_docs':
        message = `Hi ${selected.name.split(' ')[0]}, we're missing the following documents for your tax return: ${selected.missingDocs.join(', ')}. Please upload them at your earliest convenience.`
        break
      case 'status_update':
        message = `Hi ${selected.name.split(' ')[0]}, just a quick update on your tax return. Current status: ${selected.status.replace(/_/g, ' ')}. We'll keep you posted on any changes.`
        break
      case 'request_bank':
        message = `Hi ${selected.name.split(' ')[0]}, we need your bank account information for direct deposit of your refund. Please provide your routing and account numbers through your secure client portal.`
        break
      case 'ready_pickup':
        message = `Hi ${selected.name.split(' ')[0]}, great news! Your tax return is ready. Please contact us to arrange pickup or we can mail it to you.`
        break
    }

    addCommunication(selected.id, {
      date: new Date().toISOString().split('T')[0],
      type: 'email',
      direction: 'outbound',
      message,
      status: 'delivered',
    })

    toast.success(`Message sent to ${selected.name}`)
  }

  const handleAiPrompt = () => {
    if (!aiPrompt.trim() || !selected) return

    // Simulate AI processing
    addCommunication(selected.id, {
      date: new Date().toISOString().split('T')[0],
      type: 'email',
      direction: 'outbound',
      message: aiPrompt,
      status: 'delivered',
    })

    toast.success(`AI processed: "${aiPrompt.slice(0, 50)}..."`)
    setAiPrompt('')
  }

  const toggleDoc = (doc, isReceived) => {
    if (!selected) return
    if (isReceived) {
      // Move from received to missing
      updateClient(selected.id, {
        receivedDocs: selected.receivedDocs.filter(d => d !== doc),
        missingDocs: [...selected.missingDocs, doc],
        docStatus: 'partial',
      })
    } else {
      // Move from missing to received
      const newMissing = selected.missingDocs.filter(d => d !== doc)
      updateClient(selected.id, {
        missingDocs: newMissing,
        receivedDocs: [...selected.receivedDocs, doc],
        docStatus: newMissing.length === 0 ? 'complete' : 'partial',
      })
    }
  }

  return (
    <div className="flex h-full">
      {/* Left — Client Queue */}
      <div className="w-80 border-r border-gray-100 bg-white overflow-auto flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Action Queue</h2>
          <p className="text-xs text-gray-400 mt-1">{actionQueue.length} clients need attention</p>
        </div>
        {actionQueue.map(client => (
          <button
            key={client.id}
            onClick={() => setSelectedId(client.id)}
            className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors
              ${selectedId === client.id ? 'bg-sage-50 border-l-2 border-l-sage-500' : ''}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">{client.name}</span>
              <ChevronRight size={14} className="text-gray-300" />
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={client.status} />
            </div>
            {client.missingDocs.length > 0 && (
              <p className="text-xs text-red-500 mt-1.5">{client.missingDocs.length} missing doc{client.missingDocs.length !== 1 ? 's' : ''}</p>
            )}
          </button>
        ))}
        {actionQueue.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <Check size={24} className="mx-auto mb-2" />
            <p className="text-sm">All caught up!</p>
          </div>
        )}
      </div>

      {/* Right — Work Panel */}
      <div className="flex-1 overflow-auto">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <MessageSquare size={32} className="mx-auto mb-3" />
              <p className="font-medium">Select a client from the queue</p>
              <p className="text-sm mt-1">to begin working on their return</p>
            </div>
          </div>
        ) : (
          <div className="p-8">
            {/* Client Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{selected.email} &middot; {selected.phone}</p>
              </div>
              <select
                value={selected.status}
                onChange={(e) => updateClient(selected.id, { status: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
              >
                <option value="not_started">Not Started</option>
                <option value="waiting_documents">Waiting on Docs</option>
                <option value="in_progress">In Progress</option>
                <option value="ready_review">Ready for Review</option>
                <option value="complete">Complete</option>
                <option value="picked_up">Picked Up</option>
              </select>
            </div>

            {/* Document Checklist */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-1">Document Checklist</h3>
              <p className="text-xs text-gray-400 mb-4">Based on prior year — check off received documents</p>

              <div className="space-y-2">
                {selected.receivedDocs.map((doc, i) => (
                  <label key={`r-${i}`} className="flex items-center gap-3 p-3 bg-sage-50 rounded-lg cursor-pointer hover:bg-sage-100 transition-colors">
                    <input type="checkbox" checked onChange={() => toggleDoc(doc, true)}
                      className="w-4 h-4 rounded border-sage-300 text-sage-600 focus:ring-sage-500" />
                    <FileText size={14} className="text-sage-600" />
                    <span className="text-sm text-gray-900">{doc}</span>
                    <span className="ml-auto text-xs text-sage-600 font-medium">Received</span>
                  </label>
                ))}
                {selected.missingDocs.map((doc, i) => (
                  <label key={`m-${i}`} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
                    <input type="checkbox" onChange={() => toggleDoc(doc, false)}
                      className="w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500" />
                    <FileText size={14} className="text-red-400" />
                    <span className="text-sm text-gray-900">{doc}</span>
                    <span className="ml-auto text-xs text-red-500 font-medium">Missing</span>
                  </label>
                ))}
              </div>
            </div>

            {/* AI Prompt */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-sage-600" />
                <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiPrompt()}
                  placeholder={`"Ask ${selected.name.split(' ')[0]} for their W-2 and 1099"`}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
                />
                <button
                  onClick={handleAiPrompt}
                  disabled={!aiPrompt.trim()}
                  className="px-5 py-3 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleQuickAction('request_docs')}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg text-sm hover:bg-sage-50 hover:border-sage-200 transition-colors text-left">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center"><FileText size={16} className="text-red-500" /></div>
                  <div><p className="font-medium text-gray-900">Request Missing Docs</p><p className="text-xs text-gray-400">Send doc request</p></div>
                </button>
                <button onClick={() => handleQuickAction('status_update')}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg text-sm hover:bg-sage-50 hover:border-sage-200 transition-colors text-left">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><Mail size={16} className="text-blue-500" /></div>
                  <div><p className="font-medium text-gray-900">Send Status Update</p><p className="text-xs text-gray-400">Inform client</p></div>
                </button>
                <button onClick={() => handleQuickAction('request_bank')}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg text-sm hover:bg-sage-50 hover:border-sage-200 transition-colors text-left">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center"><Phone size={16} className="text-purple-500" /></div>
                  <div><p className="font-medium text-gray-900">Request Bank Info</p><p className="text-xs text-gray-400">For direct deposit</p></div>
                </button>
                <button onClick={() => handleQuickAction('ready_pickup')}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg text-sm hover:bg-sage-50 hover:border-sage-200 transition-colors text-left">
                  <div className="w-8 h-8 bg-sage-50 rounded-lg flex items-center justify-center"><Check size={16} className="text-sage-600" /></div>
                  <div><p className="font-medium text-gray-900">Ready for Pickup</p><p className="text-xs text-gray-400">Notify completion</p></div>
                </button>
              </div>
            </div>

            {/* Recent Communications */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Communications</h3>
              {selected.communications.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No communications yet</p>
              ) : (
                <div className="space-y-3">
                  {selected.communications.slice(0, 5).map((comm, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${comm.direction === 'inbound' ? 'bg-blue-100' : 'bg-gray-200'}`}>
                        {comm.direction === 'inbound' ? <MessageSquare size={12} className="text-blue-600" /> : <Send size={12} className="text-gray-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">{comm.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{format(parseISO(comm.date), 'MMM d')} &middot; {comm.type} &middot; {comm.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
