import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { defaultEmailTemplates } from '../../lib/emailTemplates'
import { Building, UserPlus, Mail, ArrowRight, ArrowLeft, Check, Upload, Plus, X, FileText, Sparkles } from 'lucide-react'
import Papa from 'papaparse'
import toast from 'react-hot-toast'

const steps = [
  { id: 'firm', label: 'Firm Setup', icon: Building },
  { id: 'clients', label: 'Add Clients', icon: UserPlus },
  { id: 'templates', label: 'Email Templates', icon: Mail },
]

export default function WelcomeOnboarding() {
  const { addClient, completeOnboarding, saveFirmDraft, firmSettings } = useApp()
  const [currentStep, setCurrentStep] = useState(0)

  // Step 1: Firm setup — hydrate from firmSettings (loaded from Supabase)
  const [firmName, setFirmName] = useState('')
  const [firmEmail, setFirmEmail] = useState('')
  const [firmPhone, setFirmPhone] = useState('')

  // Hydrate form from Supabase data on mount
  useEffect(() => {
    if (firmSettings) {
      console.log('[Wolff Onboarding] Hydrating form from firmSettings:', firmSettings)
      if (firmSettings.firmName && firmSettings.firmName !== 'Wolff') setFirmName(firmSettings.firmName)
      if (firmSettings.firmEmail) setFirmEmail(firmSettings.firmEmail)
      if (firmSettings.firmPhone) setFirmPhone(firmSettings.firmPhone)
    }
  }, [firmSettings])

  // Step 2: Add clients
  const [addMethod, setAddMethod] = useState(null) // 'manual' | 'import'
  const [manualClient, setManualClient] = useState({ name: '', email: '', phone: '', type: 'personal' })
  const [addedClients, setAddedClients] = useState([])
  const [importedData, setImportedData] = useState(null)

  // Step 3: Templates — use the same keyed-object format as Settings
  const [templates, setTemplates] = useState(() => {
    // If firmSettings already has templates from Supabase, use those
    if (firmSettings?.emailTemplates && Object.keys(firmSettings.emailTemplates).length > 0) {
      return { ...defaultEmailTemplates, ...firmSettings.emailTemplates }
    }
    return { ...defaultEmailTemplates }
  })
  const [editingTemplate, setEditingTemplate] = useState(null)

  const canProceed = () => {
    if (currentStep === 0) return firmName.trim().length > 0
    return true // steps 2 & 3 are optional
  }

  const handleNext = async () => {
    // Save firm info to Supabase when leaving step 1
    if (currentStep === 0 && firmName.trim()) {
      console.log('[Wolff Onboarding] Saving firm draft on Continue:', { firmName, firmEmail, firmPhone })
      await saveFirmDraft({ firmName, firmEmail, firmPhone })
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Save firm info on blur for each field
  const handleFirmBlur = () => {
    if (firmName.trim()) {
      console.log('[Wolff Onboarding] Saving firm draft on blur:', { firmName, firmEmail, firmPhone })
      saveFirmDraft({ firmName, firmEmail, firmPhone })
    }
  }

  const handleFinish = async () => {
    const settings = {
      firmName,
      firmEmail,
      firmPhone,
      preparerName: firmSettings?.preparerName || '',
      emailTemplates: templates,
    }
    console.log('[Wolff Onboarding] Finishing setup with:', settings)
    await completeOnboarding(settings)
    toast.success('Welcome to Wolff! Your firm is set up.')
  }

  const handleAddManualClient = async () => {
    if (!manualClient.name.trim()) return

    await addClient({
      name: manualClient.name,
      email: manualClient.email,
      phone: manualClient.phone,
      type: manualClient.type,
      address: '',
      filing_status: manualClient.type === 'personal' ? 'Single' : manualClient.type === 'estate' ? 'Trust' : 'C-Corporation',
      notes: '',
      status: 'not_started',
      docStatus: 'missing',
      missingDocs: [],
      receivedDocs: [],
      lastContact: new Date().toISOString().split('T')[0],
      bankInfo: null,
      ssn_last4: null,
    })

    setAddedClients(prev => [...prev, { name: manualClient.name, email: manualClient.email }])
    setManualClient({ name: '', email: '', phone: '', type: 'personal' })
  }

  const handleImportFile = (file) => {
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setImportedData(results.data)
      },
      error: () => {
        toast.error('Failed to parse CSV file')
      },
    })
  }

  const handleImportConfirm = async () => {
    if (!importedData) return
    let count = 0
    for (const row of importedData) {
      if (row.name || row.Name) {
        await addClient({
          name: row.name || row.Name || '',
          email: row.email || row.Email || '',
          phone: row.phone || row.Phone || '',
          address: row.address || row.Address || '',
          type: (row.type || row.Type || 'personal').toLowerCase(),
          filing_status: row.filing_status || row['Filing Status'] || 'Single',
          notes: row.notes || row.Notes || '',
          status: 'not_started',
          docStatus: 'missing',
          missingDocs: [],
          receivedDocs: [],
          lastContact: new Date().toISOString().split('T')[0],
          bankInfo: null,
          ssn_last4: null,
        })
        count++
      }
    }
    setAddedClients(prev => [...prev, ...importedData.filter(r => r.name || r.Name).map(r => ({ name: r.name || r.Name, email: r.email || r.Email }))])
    setImportedData(null)
    toast.success(`Imported ${count} clients`)
  }

  const updateTemplate = (key, field, value) => {
    setTemplates(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafbfa] p-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-sage-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Wolff</h1>
          <p className="text-gray-500 mt-2">Let's get your firm set up in a few quick steps.</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((step, i) => {
            const Icon = step.icon
            const isActive = i === currentStep
            const isComplete = i < currentStep
            return (
              <div key={step.id} className="flex items-center gap-2">
                {i > 0 && (
                  <div className={`w-12 h-0.5 ${isComplete ? 'bg-sage-400' : 'bg-gray-200'}`} />
                )}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${isActive ? 'bg-sage-500 text-white' : isComplete ? 'bg-sage-100 text-sage-700' : 'bg-gray-100 text-gray-400'}`}>
                  {isComplete ? <Check size={14} /> : <Icon size={14} />}
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

          {/* Step 1: Firm Setup */}
          {currentStep === 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center">
                  <Building size={20} className="text-sage-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Firm Information</h2>
                  <p className="text-sm text-gray-500">Basic details about your tax practice</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Firm Name *</label>
                  <input
                    type="text"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    onBlur={handleFirmBlur}
                    placeholder="e.g., Springfield Tax Services"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={firmEmail}
                      onChange={(e) => setFirmEmail(e.target.value)}
                      onBlur={handleFirmBlur}
                      placeholder="contact@yourfirm.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={firmPhone}
                      onChange={(e) => setFirmPhone(e.target.value)}
                      onBlur={handleFirmBlur}
                      placeholder="(555) 000-0000"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Add Clients */}
          {currentStep === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center">
                  <UserPlus size={20} className="text-sage-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Add Your Clients</h2>
                  <p className="text-sm text-gray-500">Import existing clients or add them one by one. You can skip this step.</p>
                </div>
              </div>

              {!addMethod && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setAddMethod('manual')}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-sage-300 hover:bg-sage-50 transition-colors text-left"
                  >
                    <Plus size={24} className="text-sage-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Add Manually</h3>
                    <p className="text-xs text-gray-500">Enter client details one at a time</p>
                  </button>
                  <button
                    onClick={() => setAddMethod('import')}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-sage-300 hover:bg-sage-50 transition-colors text-left"
                  >
                    <Upload size={24} className="text-sage-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Import CSV</h3>
                    <p className="text-xs text-gray-500">Bulk import from a spreadsheet</p>
                  </button>
                </div>
              )}

              {addMethod === 'manual' && (
                <div>
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                        <input
                          type="text"
                          value={manualClient.name}
                          onChange={(e) => setManualClient({ ...manualClient, name: e.target.value })}
                          placeholder="Full name"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                        <input
                          type="email"
                          value={manualClient.email}
                          onChange={(e) => setManualClient({ ...manualClient, email: e.target.value })}
                          placeholder="client@email.com"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={manualClient.phone}
                          onChange={(e) => setManualClient({ ...manualClient, phone: e.target.value })}
                          placeholder="(555) 123-4567"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Return Type</label>
                        <select
                          value={manualClient.type}
                          onChange={(e) => setManualClient({ ...manualClient, type: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
                        >
                          <option value="personal">Personal (1040)</option>
                          <option value="estate">Estate (1041)</option>
                          <option value="corporate">Corporate (1120)</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={handleAddManualClient}
                      disabled={!manualClient.name.trim()}
                      className="w-full py-2.5 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors disabled:opacity-40"
                    >
                      Add Client
                    </button>
                  </div>

                  <button onClick={() => setAddMethod(null)} className="text-xs text-gray-400 hover:text-gray-600">
                    &larr; Back to options
                  </button>
                </div>
              )}

              {addMethod === 'import' && !importedData && (
                <div>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-sage-300 transition-colors relative">
                    <Upload size={28} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-700">Drop your CSV file here</p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">or click to browse</p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleImportFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-gray-600">Expected columns:</span> name, email, phone, type, filing_status
                    </p>
                  </div>
                  <button onClick={() => setAddMethod(null)} className="mt-3 text-xs text-gray-400 hover:text-gray-600">
                    &larr; Back to options
                  </button>
                </div>
              )}

              {addMethod === 'import' && importedData && (
                <div>
                  <div className="flex items-center gap-3 p-4 bg-sage-50 rounded-lg mb-4">
                    <Check size={18} className="text-sage-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{importedData.length} clients found</p>
                      <p className="text-xs text-gray-500">Ready to import</p>
                    </div>
                  </div>
                  <div className="max-h-36 overflow-auto mb-4 space-y-1">
                    {importedData.slice(0, 5).map((row, i) => (
                      <div key={i} className="flex items-center gap-2 py-1.5 text-sm">
                        <FileText size={12} className="text-gray-400" />
                        <span className="font-medium text-gray-900">{row.name || row.Name}</span>
                        <span className="text-gray-400 text-xs">{row.email || row.Email}</span>
                      </div>
                    ))}
                    {importedData.length > 5 && (
                      <p className="text-xs text-gray-400">+{importedData.length - 5} more</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setImportedData(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Back</button>
                    <button onClick={handleImportConfirm} className="flex-1 py-2.5 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors">
                      Import All
                    </button>
                  </div>
                </div>
              )}

              {/* Added clients list */}
              {addedClients.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">Added ({addedClients.length})</p>
                  <div className="space-y-1.5 max-h-32 overflow-auto">
                    {addedClients.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check size={12} className="text-sage-500" />
                        <span className="text-gray-700">{c.name}</span>
                        {c.email && <span className="text-gray-400 text-xs">{c.email}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Email Templates — uses same keyed format as Settings */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center">
                  <Mail size={20} className="text-sage-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Email Templates</h2>
                  <p className="text-sm text-gray-500">Customize the messages Wolff sends to your clients. You can edit these later.</p>
                </div>
              </div>

              <div className="space-y-3">
                {Object.entries(templates).map(([key, template]) => (
                  <div key={key} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setEditingTemplate(editingTemplate === key ? null : key)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Mail size={14} className="text-sage-500" />
                        <span className="text-sm font-medium text-gray-900">{template.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{editingTemplate === key ? 'Collapse' : 'Edit'}</span>
                    </button>

                    {editingTemplate === key && (
                      <div className="px-4 pb-4 space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Subject Line</label>
                          <input
                            type="text"
                            value={template.subject}
                            onChange={(e) => updateTemplate(key, 'subject', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Body</label>
                          <textarea
                            value={template.body}
                            onChange={(e) => updateTemplate(key, 'body', e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none font-mono text-xs leading-relaxed"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {['{client_name}', '{firm_name}', '{preparer_name}', '{document_list}'].map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-sage-50 text-sage-600 rounded text-xs font-mono">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <div>
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {currentStep < steps.length - 1 && (
              <button
                onClick={async () => {
                  // Save firm draft before skipping
                  if (currentStep === 0 && firmName.trim()) {
                    await saveFirmDraft({ firmName, firmEmail, firmPhone })
                  }
                  setCurrentStep(steps.length - 1)
                }}
                className="px-4 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Skip to finish
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2.5 bg-sage-500 text-white rounded-xl text-sm font-medium hover:bg-sage-600 transition-colors disabled:opacity-40 shadow-sm"
              >
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-2.5 bg-sage-500 text-white rounded-xl text-sm font-medium hover:bg-sage-600 transition-colors shadow-sm"
              >
                <Sparkles size={16} /> Finish Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
