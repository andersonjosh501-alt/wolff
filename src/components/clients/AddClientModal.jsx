import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AddClientModal({ onClose, type }) {
  const { addClient } = useApp()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    filing_status: type === 'personal' ? 'Single' : type === 'estate' ? 'Trust' : 'C-Corporation',
    notes: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    addClient({
      ...form,
      type,
      status: 'not_started',
      docStatus: 'missing',
      missingDocs: [],
      receivedDocs: [],
      lastContact: new Date().toISOString().split('T')[0],
      bankInfo: null,
      ssn_last4: null,
    })
    toast.success(`${form.name} added successfully`)
    onClose()
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Add New Client</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input type="text" value={form.name} onChange={update('name')} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={update('email')} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={update('phone')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" value={form.address} onChange={update('address')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filing Status</label>
            <select value={form.filing_status} onChange={update('filing_status')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300">
              {type === 'personal' && <>
                <option>Single</option><option>Married Filing Jointly</option>
                <option>Married Filing Separately</option><option>Head of Household</option>
              </>}
              {type === 'estate' && <><option>Trust</option><option>Estate</option></>}
              {type === 'corporate' && <><option>C-Corporation</option><option>S-Corporation</option><option>Partnership</option><option>LLC</option></>}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={update('notes')} rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors">Add Client</button>
          </div>
        </form>
      </div>
    </div>
  )
}
