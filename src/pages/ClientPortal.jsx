import { useState } from 'react'
import StatusBadge from '../components/common/StatusBadge'
import { Upload, FileText, Check, X, Eye, Shield } from 'lucide-react'

// Demo client data for the portal
const demoClient = {
  name: 'John Smith',
  status: 'in_progress',
  receivedDocs: ['W-2 (Employer A)', '1095-A', 'Prior Year Return'],
  missingDocs: ['W-2 (Employer B)', '1099-INT'],
  notifications: [
    { date: '2026-05-07', message: 'Reminder: Please send your W-2 from Employer B' },
    { date: '2026-05-05', message: 'We received your W-2 from Employer A. Thank you!' },
  ],
}

export default function ClientPortal() {
  const [activeView, setActiveView] = useState('status')
  const [uploadedFiles, setUploadedFiles] = useState([])

  return (
    <div className="min-h-screen bg-[#fafbfa]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sage-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Wolff</span>
            <span className="text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full font-medium ml-2">Client Portal</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield size={14} className="text-sage-500" />
            Secure Portal
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {demoClient.name}</h1>
          <p className="text-sm text-gray-500 mt-1">View your return status and upload documents</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-1 mb-8 bg-gray-100 rounded-lg p-1 w-fit">
          {[
            { id: 'status', label: 'Return Status' },
            { id: 'upload', label: 'Upload Documents' },
            { id: 'bank', label: 'Bank Information' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${activeView === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status View */}
        {activeView === 'status' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-900">Return Status</h2>
                <StatusBadge status={demoClient.status} size="md" />
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-2 mb-8">
                {['Gathering Docs', 'In Progress', 'Under Review', 'Complete'].map((step, i) => {
                  const activeStep = 1 // In Progress
                  return (
                    <div key={step} className="flex-1">
                      <div className={`h-2 rounded-full ${i <= activeStep ? 'bg-sage-400' : 'bg-gray-200'}`}></div>
                      <p className={`text-xs mt-2 ${i <= activeStep ? 'text-sage-700 font-medium' : 'text-gray-400'}`}>{step}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Documents</h2>
              <div className="space-y-2">
                {demoClient.receivedDocs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-sage-50 rounded-lg">
                    <Check size={14} className="text-sage-600" />
                    <span className="text-sm text-gray-900">{doc}</span>
                    <span className="ml-auto text-xs text-sage-600">Received</span>
                  </div>
                ))}
                {demoClient.missingDocs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <X size={14} className="text-red-400" />
                    <span className="text-sm text-gray-900">{doc}</span>
                    <span className="ml-auto text-xs text-red-500">Needed</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Notifications</h2>
              <div className="space-y-3">
                {demoClient.notifications.map((n, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upload View */}
        {activeView === 'upload' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Upload Documents</h2>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center hover:border-sage-300 transition-colors">
                <Upload size={32} className="mx-auto text-gray-400 mb-4" />
                <p className="text-sm font-medium text-gray-700">Drop files here or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB each</p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size }))
                    setUploadedFiles(prev => [...prev, ...files])
                  }}
                  className="mt-4"
                />
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-sage-50 rounded-lg">
                      <FileText size={14} className="text-sage-600" />
                      <span className="text-sm text-gray-900">{file.name}</span>
                      <span className="ml-auto text-xs text-sage-600">Uploaded</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-2">Still Needed</h2>
              <p className="text-xs text-gray-400 mb-4">Please upload the following documents</p>
              <div className="space-y-2">
                {demoClient.missingDocs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                    <FileText size={14} className="text-amber-500" />
                    <span className="text-sm text-gray-900">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bank Info View */}
        {activeView === 'bank' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield size={16} className="text-sage-600" />
              <h2 className="font-semibold text-gray-900">Secure Bank Information</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Provide your bank details for direct deposit of your refund. This information is encrypted and secure.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input type="text" placeholder="e.g., First National Bank"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number</label>
                <input type="text" placeholder="9 digits"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input type="text" placeholder="Account number"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300">
                  <option>Checking</option>
                  <option>Savings</option>
                </select>
              </div>
              <button className="px-6 py-2.5 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors">
                Save Bank Information
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
