import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext({})

// Demo data for the application
const initialClients = [
  {
    id: '1', name: 'John Smith', email: 'john.smith@email.com', phone: '(555) 123-4567',
    type: 'personal', status: 'in_progress', docStatus: 'partial',
    missingDocs: ['W-2 (Employer B)', '1099-INT'], receivedDocs: ['W-2 (Employer A)', '1095-A', 'Prior Year Return'],
    lastContact: '2026-05-07', notes: 'Second year client, switched jobs mid-year.',
    bankInfo: null, ssn_last4: '4523', filing_status: 'Married Filing Jointly',
    address: '123 Oak Street, Springfield, IL 62701',
    communications: [
      { date: '2026-05-07', type: 'email', direction: 'outbound', message: 'Reminder: Please send W-2 from Employer B', status: 'delivered' },
      { date: '2026-05-05', type: 'email', direction: 'inbound', message: 'Here is my W-2 from Employer A', status: 'received' },
    ]
  },
  {
    id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '(555) 234-5678',
    type: 'personal', status: 'waiting_documents', docStatus: 'missing',
    missingDocs: ['W-2', '1099-NEC', '1098 (Mortgage Interest)'], receivedDocs: ['Prior Year Return'],
    lastContact: '2026-05-01', notes: 'Freelance income this year. First time filing with us.',
    bankInfo: null, ssn_last4: '8891', filing_status: 'Single',
    address: '456 Maple Ave, Springfield, IL 62702',
    communications: [
      { date: '2026-05-01', type: 'email', direction: 'outbound', message: 'Welcome! Please upload your tax documents.', status: 'delivered' },
    ]
  },
  {
    id: '3', name: 'Robert Chen', email: 'rchen@email.com', phone: '(555) 345-6789',
    type: 'personal', status: 'ready_review', docStatus: 'complete',
    missingDocs: [], receivedDocs: ['W-2', '1099-DIV', '1099-INT', '1098', 'Prior Year Return', 'K-1'],
    lastContact: '2026-05-08', notes: 'Complex return with partnership income.',
    bankInfo: { routing: '****1234', account: '****5678' }, ssn_last4: '3345', filing_status: 'Married Filing Jointly',
    address: '789 Pine Road, Springfield, IL 62703',
    communications: [
      { date: '2026-05-08', type: 'email', direction: 'outbound', message: 'Your return is ready for review.', status: 'delivered' },
    ]
  },
  {
    id: '4', name: 'Emily Davis', email: 'emily.d@email.com', phone: '(555) 456-7890',
    type: 'personal', status: 'complete', docStatus: 'complete',
    missingDocs: [], receivedDocs: ['W-2', '1099-INT', 'Prior Year Return'],
    lastContact: '2026-05-06', notes: 'Simple return. E-filed successfully.',
    bankInfo: { routing: '****4321', account: '****8765' }, ssn_last4: '7712', filing_status: 'Single',
    address: '321 Elm Street, Springfield, IL 62704',
    communications: []
  },
  {
    id: '5', name: 'Williams Family Trust', email: 'williams.trust@email.com', phone: '(555) 567-8901',
    type: 'estate', status: 'in_progress', docStatus: 'partial',
    missingDocs: ['Trust Agreement Amendment', 'Brokerage Statement'], receivedDocs: ['Trust Document', '1099-DIV', 'Prior Year 1041'],
    lastContact: '2026-05-04', notes: 'Irrevocable trust. Distributes income to 3 beneficiaries.',
    bankInfo: null, ssn_last4: '1198', filing_status: 'Trust',
    address: '100 Trust Way, Springfield, IL 62701',
    communications: []
  },
  {
    id: '6', name: 'Henderson Estate', email: 'henderson.estate@lawfirm.com', phone: '(555) 678-9012',
    type: 'estate', status: 'waiting_documents', docStatus: 'missing',
    missingDocs: ['Death Certificate', 'Estate Inventory', 'Probate Documents'], receivedDocs: ['Prior Year 1041'],
    lastContact: '2026-04-28', notes: 'New estate. Awaiting probate completion.',
    bankInfo: null, ssn_last4: '5543', filing_status: 'Estate',
    address: '200 Legal Drive, Springfield, IL 62702',
    communications: []
  },
  {
    id: '7', name: 'Greenfield Corp', email: 'accounting@greenfieldcorp.com', phone: '(555) 789-0123',
    type: 'corporate', status: 'in_progress', docStatus: 'partial',
    missingDocs: ['Q4 Payroll Reports', 'Depreciation Schedule'], receivedDocs: ['Trial Balance', 'Prior Year 1120', 'Bank Statements', 'Accounts Receivable Aging'],
    lastContact: '2026-05-06', notes: 'C-Corp. 50 employees. Revenue ~$5M.',
    bankInfo: { routing: '****9999', account: '****1111' }, ssn_last4: null, filing_status: 'C-Corporation',
    address: '500 Corporate Blvd, Springfield, IL 62705',
    ein: '12-3456789',
    communications: []
  },
  {
    id: '8', name: 'TechStart LLC', email: 'admin@techstartllc.com', phone: '(555) 890-1234',
    type: 'corporate', status: 'not_started', docStatus: 'missing',
    missingDocs: ['All financial statements', 'Bank Statements', 'Payroll Records'], receivedDocs: [],
    lastContact: '2026-04-15', notes: 'New client. LLC taxed as partnership. 3 members.',
    bankInfo: null, ssn_last4: null, filing_status: 'Partnership',
    address: '600 Startup Lane, Springfield, IL 62706',
    ein: '98-7654321',
    communications: []
  },
]

export function AppProvider({ children }) {
  const [clients, setClients] = useState(initialClients)
  const [activeTab, setActiveTab] = useState('clients')
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientSubTab, setClientSubTab] = useState('personal')

  const updateClient = useCallback((id, updates) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }, [])

  const addClient = useCallback((client) => {
    setClients(prev => [...prev, { ...client, id: String(Date.now()), communications: [] }])
  }, [])

  const addCommunication = useCallback((clientId, comm) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return { ...c, communications: [comm, ...c.communications], lastContact: new Date().toISOString().split('T')[0] }
      }
      return c
    }))
  }, [])

  const getClientsByType = useCallback((type) => {
    return clients.filter(c => c.type === type)
  }, [clients])

  const getClientsByStatus = useCallback((status) => {
    return clients.filter(c => c.status === status)
  }, [clients])

  const stats = {
    total: clients.length,
    not_started: clients.filter(c => c.status === 'not_started').length,
    waiting_documents: clients.filter(c => c.status === 'waiting_documents').length,
    in_progress: clients.filter(c => c.status === 'in_progress').length,
    ready_review: clients.filter(c => c.status === 'ready_review').length,
    complete: clients.filter(c => c.status === 'complete').length,
    picked_up: clients.filter(c => c.status === 'picked_up').length,
  }

  return (
    <AppContext.Provider value={{
      clients, setClients, updateClient, addClient, addCommunication,
      getClientsByType, getClientsByStatus, stats,
      activeTab, setActiveTab,
      selectedClient, setSelectedClient,
      clientSubTab, setClientSubTab,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
