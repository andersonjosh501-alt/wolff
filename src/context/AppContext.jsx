import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { defaultEmailTemplates } from '../lib/emailTemplates'
import toast from 'react-hot-toast'

const AppContext = createContext({})

function toDbClient(client, userId) {
  return {
    id: client.id,
    user_id: userId,
    name: client.name,
    email: client.email || null,
    phone: client.phone || null,
    type: client.type || 'personal',
    status: client.status || 'not_started',
    doc_status: client.docStatus || 'missing',
    missing_docs: client.missingDocs || [],
    received_docs: client.receivedDocs || [],
    last_contact: client.lastContact || null,
    notes: client.notes || null,
    bank_info: client.bankInfo || null,
    ssn_last4: client.ssn_last4 || null,
    filing_status: client.filing_status || null,
    address: client.address || null,
    ein: client.ein || null,
  }
}

function fromDbClient(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    type: row.type,
    status: row.status,
    docStatus: row.doc_status,
    missingDocs: row.missing_docs || [],
    receivedDocs: row.received_docs || [],
    lastContact: row.last_contact,
    notes: row.notes,
    bankInfo: row.bank_info,
    ssn_last4: row.ssn_last4,
    filing_status: row.filing_status,
    address: row.address,
    ein: row.ein,
    communications: [],
  }
}

function fromDbComm(row) {
  return {
    id: row.id,
    date: row.date,
    type: row.type,
    direction: row.direction,
    message: row.message,
    status: row.status,
  }
}

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  // Persist activeTab to localStorage so Settings survives refresh
  const [activeTab, setActiveTabState] = useState(() => {
    try { return localStorage.getItem('wolff_activeTab') || 'clients' } catch { return 'clients' }
  })
  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab)
    try { localStorage.setItem('wolff_activeTab', tab) } catch {}
  }, [])

  const [selectedClient, setSelectedClient] = useState(null)
  const [clientSubTab, setClientSubTab] = useState('personal')
  const [loadingData, setLoadingData] = useState(true)
  const [onboardingComplete, setOnboardingComplete] = useState(true) // default true, set false if new user
  const [firmSettings, setFirmSettings] = useState({
    firmName: 'Wolff',
    firmEmail: '',
    firmPhone: '',
    preparerName: '',
    emailTemplates: defaultEmailTemplates,
  })

  useEffect(() => {
    if (!user || isDemoMode) {
      // Demo mode — skip Supabase, show onboarding
      setLoadingData(false)
      setOnboardingComplete(false)
      return
    }
    loadClients()
    loadOnboardingStatus()
  }, [user])

  async function loadOnboardingStatus() {
    console.log('[Wolff DB] READ user_settings for user:', user.id)
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      console.log('[Wolff DB] No user_settings row found — new user, showing onboarding', error)
      // No settings row means new user — show onboarding
      setOnboardingComplete(false)
      return
    }

    console.log('[Wolff DB] Loaded user_settings:', {
      onboarding_complete: data.onboarding_complete,
      firm_name: data.firm_name,
      firm_email: data.firm_email,
      firm_phone: data.firm_phone,
      preparer_name: data.preparer_name,
      has_templates: !!data.email_templates,
      template_keys: data.email_templates ? Object.keys(data.email_templates) : [],
    })

    setOnboardingComplete(data.onboarding_complete || false)
    setFirmSettings({
      firmName: data.firm_name || 'Wolff',
      firmEmail: data.firm_email || '',
      firmPhone: data.firm_phone || '',
      preparerName: data.preparer_name || '',
      emailTemplates: { ...defaultEmailTemplates, ...(data.email_templates || {}) },
    })
  }

  async function loadClients() {
    setLoadingData(true)
    const { data: clientRows, error: clientErr } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (clientErr) {
      toast.error('Failed to load clients')
      setLoadingData(false)
      return
    }

    const { data: commRows, error: commErr } = await supabase
      .from('communications')
      .select('*')
      .order('created_at', { ascending: false })

    if (commErr) {
      toast.error('Failed to load communications')
    }

    const mapped = (clientRows || []).map(row => {
      const client = fromDbClient(row)
      client.communications = (commRows || [])
        .filter(c => c.client_id === row.id)
        .map(fromDbComm)
      return client
    })

    setClients(mapped)
    setLoadingData(false)
  }

  const updateClient = useCallback(async (id, updates) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))

    const dbUpdates = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.email !== undefined) dbUpdates.email = updates.email
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone
    if (updates.type !== undefined) dbUpdates.type = updates.type
    if (updates.status !== undefined) dbUpdates.status = updates.status
    if (updates.docStatus !== undefined) dbUpdates.doc_status = updates.docStatus
    if (updates.missingDocs !== undefined) dbUpdates.missing_docs = updates.missingDocs
    if (updates.receivedDocs !== undefined) dbUpdates.received_docs = updates.receivedDocs
    if (updates.lastContact !== undefined) dbUpdates.last_contact = updates.lastContact
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes
    if (updates.bankInfo !== undefined) dbUpdates.bank_info = updates.bankInfo
    if (updates.ssn_last4 !== undefined) dbUpdates.ssn_last4 = updates.ssn_last4
    if (updates.filing_status !== undefined) dbUpdates.filing_status = updates.filing_status
    if (updates.address !== undefined) dbUpdates.address = updates.address
    if (updates.ein !== undefined) dbUpdates.ein = updates.ein

    if (!isDemoMode && Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from('clients').update(dbUpdates).eq('id', id)
      if (error) toast.error('Failed to save changes')
    }
  }, [])

  const addClient = useCallback(async (client) => {
    if (!user) {
      // Demo mode — add locally without Supabase
      const localClient = {
        ...client,
        id: String(Date.now()) + String(Math.random()).slice(2, 6),
        communications: [],
      }
      setClients(prev => [localClient, ...prev])
      return
    }

    const dbClient = toDbClient(client, user.id)
    delete dbClient.id

    const { data, error } = await supabase.from('clients').insert(dbClient).select().single()

    if (error) {
      toast.error('Failed to add client')
      return
    }

    const newClient = fromDbClient(data)
    newClient.communications = []
    setClients(prev => [newClient, ...prev])
    toast.success(`${newClient.name} added`)
  }, [user])

  const addCommunication = useCallback(async (clientId, comm) => {
    const today = new Date().toISOString().split('T')[0]
    const newComm = {
      id: String(Date.now()),
      date: comm.date || today,
      type: comm.type || 'email',
      direction: comm.direction || 'outbound',
      message: comm.message,
      status: comm.status || 'delivered',
    }

    if (!isDemoMode && user) {
      const dbComm = {
        client_id: clientId,
        user_id: user.id,
        ...newComm,
      }
      delete dbComm.id

      const { data, error } = await supabase.from('communications').insert(dbComm).select().single()

      if (error) {
        toast.error('Failed to save communication')
        return
      }

      newComm.id = data.id
      await supabase.from('clients').update({ last_contact: today }).eq('id', clientId)
    }

    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return { ...c, communications: [newComm, ...c.communications], lastContact: today }
      }
      return c
    }))
  }, [user])

  // Save firm settings — uses upsert so it works whether or not a row exists
  const updateFirmSettings = useCallback(async (updates) => {
    const merged = { ...firmSettings, ...updates }
    setFirmSettings(merged)

    if (!isDemoMode && user) {
      const dbRow = {
        user_id: user.id,
        onboarding_complete: true, // if they're in settings, onboarding is done
      }
      if (updates.firmName !== undefined) dbRow.firm_name = updates.firmName
      if (updates.firmEmail !== undefined) dbRow.firm_email = updates.firmEmail
      if (updates.firmPhone !== undefined) dbRow.firm_phone = updates.firmPhone
      if (updates.preparerName !== undefined) dbRow.preparer_name = updates.preparerName
      if (updates.emailTemplates !== undefined) dbRow.email_templates = updates.emailTemplates

      console.log('[Wolff DB] WRITE updateFirmSettings — upserting user_settings:', dbRow)

      const { data, error } = await supabase
        .from('user_settings')
        .upsert(dbRow, { onConflict: 'user_id' })
        .select()

      if (error) {
        console.error('[Wolff DB] updateFirmSettings FAILED:', error)
        toast.error('Failed to save settings: ' + error.message)
        return
      }

      console.log('[Wolff DB] updateFirmSettings SUCCESS:', data)
    }

    toast.success('Settings saved')
  }, [user, firmSettings])

  // Save partial firm info during onboarding (before "Finish Setup")
  const saveFirmDraft = useCallback(async (draft) => {
    if (!user || isDemoMode) return

    const dbRow = {
      user_id: user.id,
      onboarding_complete: false, // still in onboarding
    }
    if (draft.firmName !== undefined) dbRow.firm_name = draft.firmName
    if (draft.firmEmail !== undefined) dbRow.firm_email = draft.firmEmail
    if (draft.firmPhone !== undefined) dbRow.firm_phone = draft.firmPhone
    if (draft.preparerName !== undefined) dbRow.preparer_name = draft.preparerName

    console.log('[Wolff DB] WRITE saveFirmDraft — upserting partial settings:', dbRow)

    const { data, error } = await supabase
      .from('user_settings')
      .upsert(dbRow, { onConflict: 'user_id' })
      .select()

    if (error) {
      console.error('[Wolff DB] saveFirmDraft FAILED:', error)
    } else {
      console.log('[Wolff DB] saveFirmDraft SUCCESS:', data)
      // Update local state with saved values
      setFirmSettings(prev => ({ ...prev, ...draft }))
    }
  }, [user])

  const completeOnboarding = useCallback(async (settings) => {
    if (!user) {
      // Demo mode — just set local state
      setOnboardingComplete(true)
      setFirmSettings(settings)
      return
    }

    const row = {
      user_id: user.id,
      onboarding_complete: true,
      firm_name: settings.firmName || null,
      firm_email: settings.firmEmail || null,
      firm_phone: settings.firmPhone || null,
      preparer_name: settings.preparerName || null,
      email_templates: settings.emailTemplates || null,
    }

    console.log('[Wolff DB] WRITE completeOnboarding — upserting:', row)

    const { data, error } = await supabase
      .from('user_settings')
      .upsert(row, { onConflict: 'user_id' })
      .select()

    if (error) {
      console.error('[Wolff DB] completeOnboarding FAILED:', error)
      toast.error('Failed to save settings: ' + error.message)
      return
    }

    console.log('[Wolff DB] completeOnboarding SUCCESS:', data)

    setOnboardingComplete(true)
    setFirmSettings(settings)
  }, [user])

  const deleteClient = useCallback(async (id) => {
    if (!isDemoMode) {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) {
        toast.error('Failed to delete client')
        return
      }
    }
    setClients(prev => prev.filter(c => c.id !== id))
    toast.success('Client removed')
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
      clients, setClients, updateClient, addClient, addCommunication, deleteClient,
      getClientsByType, getClientsByStatus, stats,
      activeTab, setActiveTab,
      selectedClient, setSelectedClient,
      clientSubTab, setClientSubTab,
      loadingData,
      onboardingComplete, completeOnboarding, saveFirmDraft, firmSettings, updateFirmSettings,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
