import { useState } from 'react'
import { Building, Users, Mail, Bell, Calendar, CreditCard } from 'lucide-react'

const sections = [
  { id: 'firm', label: 'Firm Information', icon: Building },
  { id: 'team', label: 'Team & Roles', icon: Users },
  { id: 'integrations', label: 'Integrations', icon: Mail },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'automation', label: 'Automation', icon: Calendar },
  { id: 'billing', label: 'Billing', icon: CreditCard },
]

export default function SettingsTab() {
  const [activeSection, setActiveSection] = useState('firm')
  const [firmName, setFirmName] = useState('Springfield Tax Services')
  const [firmEmail, setFirmEmail] = useState('contact@springfieldtax.com')
  const [firmPhone, setFirmPhone] = useState('(555) 000-0000')
  const [updateFreq, setUpdateFreq] = useState('weekly')

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
                  <button className="px-6 py-2.5 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors">
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
                    <p className="text-xs text-gray-400">admin@springfieldtax.com</p>
                  </div>
                  <span className="px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-xs font-medium">Admin</span>
                </div>
                <button className="w-full p-4 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-sage-300 hover:text-sage-600 transition-colors">
                  + Invite Team Member
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
