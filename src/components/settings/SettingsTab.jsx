import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { defaultEmailTemplates, templateVariables } from '../../lib/emailTemplates'
import { Building, Users, Mail, Bell, Calendar, CreditCard, FileText, Save, RotateCcw, Info } from 'lucide-react'
import toast from 'react-hot-toast'

const sections = [
  { id: 'firm', label: 'Firm Information', icon: Building },
  { id: 'team', label: 'Team & Roles', icon: Users },
  { id: 'templates', label: 'Email Templates', icon: FileText },
  { id: 'integrations', label: 'Integrations', icon: Mail },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'automation', label: 'Automation', icon: Calendar },
  { id: 'billing', label: 'Billing', icon: CreditCard },
]

export default function SettingsTab() {
  const { firmSettings, updateFirmSettings } = useApp()
  const [activeSection, setActiveSection] = useState('firm')

  // Firm info local state
  const [firmName, setFirmName] = useState(firmSettings?.firmName || '')
  const [firmEmail, setFirmEmail] = useState(firmSettings?.firmEmail || '')
  const [firmPhone, setFirmPhone] = useState(firmSettings?.firmPhone || '')
  const [preparerName, setPreparerName] = useState(firmSettings?.preparerName || '')

  // Email templates local state
  const [templates, setTemplates] = useState(firmSettings?.emailTemplates || defaultEmailTemplates)
  const [templatesDirty, setTemplatesDirty] = useState(false)

  // Sync from context when firmSettings changes
  useEffect(() => {
    if (firmSettings) {
      setFirmName(firmSettings.firmName || '')
      setFirmEmail(firmSettings.firmEmail || '')
      setFirmPhone(firmSettings.firmPhone || '')
      setPreparerName(firmSettings.preparerName || '')
      setTemplates(firmSettings.emailTemplates || defaultEmailTemplates)
    }
  }, [firmSettings])

  const [updateFreq, setUpdateFreq] = useState('weekly')

  const handleSaveFirm = () => {
    console.log('[Wolff Settings] Saving firm info:', { firmName, firmEmail, firmPhone, preparerName })
    updateFirmSettings({ firmName, firmEmail, firmPhone, preparerName })
  }

  const handleUpdateTemplate = (key, field, value) => {
    const updated = {
      ...templates,
      [key]: { ...templates[key], [field]: value },
    }
    setTemplates(updated)
    setTemplatesDirty(true)
  }

  const handleSaveTemplates = () => {
    console.log('[Wolff Settings] Saving templates:', Object.keys(templates))
    console.log('[Wolff Settings] Template data:', templates)
    updateFirmSettings({ emailTemplates: templates })
    setTemplatesDirty(false)
  }

  const handleResetTemplate = (key) => {
    const updated = {
      ...templates,
      [key]: { ...defaultEmailTemplates[key] },
    }
    setTemplates(updated)
    setTemplatesDirty(true)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your firm and integrations</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map(s => {
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${activeSection === s.id ? 'bg-sage-50 text-sage-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  <Icon size={16} />
                  {s.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {activeSection === 'firm' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Firm Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Firm Name</label>
                  <input type="text" value={firmName} onChange={(e) => setFirmName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300" />
                  <p className="text-xs text-gray-400 mt-1">Used as the sender name in outbound emails</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preparer Name</label>
                  <input type="text" value={preparerName} onChange={(e) => setPreparerName(e.target.value)}
                    placeholder="e.g., John Anderson"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300" />
                  <p className="text-xs text-gray-400 mt-1">Used as {'{preparer_name}'} in email templates</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={firmEmail} onChange={(e) => setFirmEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" value={firmPhone} onChange={(e) => setFirmPhone(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300" />
                  </div>
                </div>
                <div className="pt-4">
                  <button onClick={handleSaveFirm}
                    className="px-6 py-2.5 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'team' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Team & Roles</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-400">{firmEmail || 'admin@yourfirm.com'}</p>
                  </div>
                  <span className="px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-xs font-medium">Admin</span>
                </div>
                <button className="w-full p-4 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-sage-300 hover:text-sage-600 transition-colors">
                  + Invite Team Member
                </button>
              </div>
            </div>
          )}

          {/* Email Templates */}
          {activeSection === 'templates' && (
            <div className="space-y-6">
              {/* Variable Reference */}
              <div className="bg-sage-50 rounded-xl border border-sage-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={16} className="text-sage-600" />
                  <h3 className="text-sm font-semibold text-sage-800">Template Variables</h3>
                </div>
                <p className="text-xs text-sage-700 mb-3">Use these variables in your templates. They'll be replaced with real values when emails are sent.</p>
                <div className="grid grid-cols-2 gap-2">
                  {templateVariables.map(v => (
                    <div key={v.key} className="flex items-center gap-2">
                      <code className="text-xs bg-white px-2 py-0.5 rounded border border-sage-200 text-sage-700 font-mono">{v.key}</code>
                      <span className="text-xs text-sage-600">{v.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Template editors */}
              {Object.entries(templates).map(([key, template]) => (
                <div key={key} className="bg-white rounded-xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-sage-100 rounded-lg flex items-center justify-center">
                        <Mail size={14} className="text-sage-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{template.name}</h3>
                        <p className="text-xs text-gray-400">
                          {key === 'status_update' && 'Sent when updating clients on their return progress'}
                          {key === 'request_docs' && 'Sent when requesting missing documents from clients'}
                          {key === 'request_bank' && 'Sent when requesting bank details for direct deposit'}
                          {key === 'ready_pickup' && 'Sent when a return is complete and ready for pickup'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleResetTemplate(key)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Reset to default"
                    >
                      <RotateCcw size={12} /> Reset
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Subject Line</label>
                      <input
                        type="text"
                        value={template.subject}
                        onChange={(e) => handleUpdateTemplate(key, 'subject', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Body</label>
                      <textarea
                        value={template.body}
                        onChange={(e) => handleUpdateTemplate(key, 'body', e.target.value)}
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none font-mono text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Save button */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {templatesDirty ? 'You have unsaved changes' : 'All changes saved'}
                </p>
                <button
                  onClick={handleSaveTemplates}
                  disabled={!templatesDirty}
                  className="flex items-center gap-2 px-6 py-2.5 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors disabled:opacity-40 shadow-sm"
                >
                  <Save size={14} /> Save Templates
                </button>
              </div>
            </div>
          )}

          {activeSection === 'integrations' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Gmail</h3>
                    <p className="text-xs text-gray-400">Sync emails and auto-route documents</p>
                  </div>
                  <button className="px-4 py-2 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors">
                    Connect
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Outlook</h3>
                    <p className="text-xs text-gray-400">Microsoft 365 email integration</p>
                  </div>
                  <button className="px-4 py-2 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors">
                    Connect
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Twilio</h3>
                    <p className="text-xs text-gray-400">SMS and AI voice call integration</p>
                  </div>
                  <button className="px-4 py-2 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors">
                    Connect
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: 'New document received', desc: 'When a client uploads a document' },
                  { label: 'Client message', desc: 'When a client sends a message' },
                  { label: 'Missing document reminder', desc: 'Daily digest of missing documents' },
                  { label: 'Status change', desc: 'When a return status changes' },
                ].map((item, i) => (
                  <label key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked
                      className="w-4 h-4 rounded border-gray-300 text-sage-600 focus:ring-sage-500" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'automation' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Automated Updates</h3>
              <p className="text-sm text-gray-500 mb-4">Set how often clients receive automatic status updates.</p>
              <div className="space-y-3">
                {['daily', 'weekly', 'biweekly', 'custom'].map(freq => (
                  <label key={freq} className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors
                    ${updateFreq === freq ? 'border-sage-400 bg-sage-50' : 'border-gray-200 hover:border-sage-200'}`}>
                    <input type="radio" name="freq" value={freq} checked={updateFreq === freq}
                      onChange={(e) => setUpdateFreq(e.target.value)}
                      className="text-sage-600 focus:ring-sage-500" />
                    <span className="text-sm font-medium text-gray-900 capitalize">{freq}</span>
                  </label>
                ))}
              </div>
              <button className="mt-6 px-6 py-2.5 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors">
                Save Schedule
              </button>
            </div>
          )}

          {activeSection === 'billing' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Billing & Subscription</h3>
              <div className="p-4 bg-sage-50 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Professional Plan</p>
                    <p className="text-xs text-gray-500">Unlimited clients, all features</p>
                  </div>
                  <p className="text-lg font-bold text-sage-700">$49/mo</p>
                </div>
              </div>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Manage Subscription
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
