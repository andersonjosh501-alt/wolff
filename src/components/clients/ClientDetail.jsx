import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import StatusBadge, { statusConfig } from '../common/StatusBadge'
import { ArrowLeft, Mail, Phone, MapPin, FileText, Check, X, Upload, MessageSquare, Clock, Send } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default function ClientDetail({ client, onBack }) {
  const { updateClient } = useApp()
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'Documents' },
    { id: 'communications', label: 'Communications' },
  ]

  return (
    <div className="p-8">
      {/* Back button & header */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Clients
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-gray-500 flex items-center gap-1.5"><Mail size={14} /> {client.email}</span>
            <span className="text-sm text-gray-500 flex items-center gap-1.5"><Phone size={14} /> {client.phone}</span>
            <span className="text-sm text-gray-500 flex items-center gap-1.5"><MapPin size={14} /> {client.address}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={client.status} size="md" />
          <select
            value={client.status}
            onChange={(e) => updateClient(client.id, { status: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
          >
            {Object.entries(statusConfig).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-100">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeSection === s.id
                ? 'border-sage-500 text-sage-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Client Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Filing Status</span><span className="font-medium">{client.filing_status}</span></div>
              {client.ssn_last4 && <div className="flex justify-between"><span className="text-gray-500">SSN</span><span className="font-medium">***-**-{client.ssn_last4}</span></div>}
              {client.ein && <div className="flex justify-between"><span className="text-gray-500">EIN</span><span className="font-medium">{client.ein}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Last Contact</span><span className="font-medium">{format(parseISO(client.lastContact), 'MMM d, yyyy')}</span></div>
              {client.bankInfo && <div className="flex justify-between"><span className="text-gray-500">Bank Info</span><span className="font-medium text-sage-600">On file</span></div>}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Notes</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{client.notes}</p>
          </div>

          {/* Quick Doc Summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4">Document Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Received</h4>
                {client.receivedDocs.length === 0 ? (
                  <p className="text-sm text-gray-400">No documents received</p>
                ) : (
                  <ul className="space-y-2">
                    {client.receivedDocs.map((doc, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check size={14} className="text-sage-500" /> {doc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Missing</h4>
                {client.missingDocs.length === 0 ? (
                  <p className="text-sm text-sage-600 font-medium">All documents received</p>
                ) : (
                  <ul className="space-y-2">
                    {client.missingDocs.map((doc, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-red-600">
                        <X size={14} /> {doc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'documents' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Documents</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors">
              <Upload size={14} /> Upload Document
            </button>
          </div>
          <div className="space-y-3">
            {client.receivedDocs.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-sage-600" />
                  <span className="text-sm font-medium text-gray-900">{doc}</span>
                </div>
                <span className="text-xs text-sage-600 font-medium">Received</span>
              </div>
            ))}
            {client.missingDocs.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-red-400" />
                  <span className="text-sm font-medium text-gray-900">{doc}</span>
                </div>
                <span className="text-xs text-red-500 font-medium">Missing</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'communications' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Communication History</h3>
          {client.communications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No communications yet</p>
          ) : (
            <div className="space-y-4">
              {client.communications.map((comm, i) => (
                <div key={i} className={`flex gap-4 p-4 rounded-lg ${comm.direction === 'inbound' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${comm.direction === 'inbound' ? 'bg-blue-100' : 'bg-gray-200'}`}>
                    {comm.direction === 'inbound' ? <MessageSquare size={14} className="text-blue-600" /> : <Send size={14} className="text-gray-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500 uppercase">{comm.type}</span>
                      <span className="text-xs text-gray-400">{comm.direction === 'inbound' ? 'Received' : 'Sent'}</span>
                      <span className="text-xs text-gray-400 ml-auto flex items-center gap-1"><Clock size={12} /> {format(parseISO(comm.date), 'MMM d, yyyy')}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comm.message}</p>
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${comm.status === 'delivered' ? 'bg-sage-100 text-sage-700' : 'bg-blue-100 text-blue-700'}`}>
                      {comm.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
