import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { X, Upload, FileText, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Papa from 'papaparse'

export default function ImportModal({ onClose }) {
  const { addClient } = useApp()
  const [dragOver, setDragOver] = useState(false)
  const [parsed, setParsed] = useState(null)
  const [importing, setImporting] = useState(false)

  const handleFile = (file) => {
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsed(results.data)
      },
      error: () => {
        toast.error('Failed to parse CSV file')
      }
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleImport = () => {
    setImporting(true)
    let count = 0
    parsed.forEach(row => {
      if (row.name || row.Name) {
        addClient({
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
    })
    toast.success(`Imported ${count} clients`)
    setImporting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Import Clients</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {!parsed ? (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors
                ${dragOver ? 'border-sage-400 bg-sage-50' : 'border-gray-200'}`}
            >
              <Upload size={32} className="mx-auto text-gray-400 mb-4" />
              <p className="text-sm font-medium text-gray-700">Drop your CSV file here</p>
              <p className="text-xs text-gray-400 mt-1">or click to browse</p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ position: 'relative' }}
              />
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-600 mb-2">Expected CSV columns:</p>
              <code className="text-xs text-gray-500">name, email, phone, address, type, filing_status, notes</code>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 p-4 bg-sage-50 rounded-lg mb-4">
              <CheckCircle size={20} className="text-sage-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{parsed.length} clients found</p>
                <p className="text-xs text-gray-500">Ready to import</p>
              </div>
            </div>
            <div className="max-h-48 overflow-auto mb-4">
              {parsed.slice(0, 5).map((row, i) => (
                <div key={i} className="flex items-center gap-2 py-2 border-b border-gray-100 text-sm">
                  <FileText size={14} className="text-gray-400" />
                  <span className="font-medium text-gray-900">{row.name || row.Name}</span>
                  <span className="text-gray-400 text-xs">{row.email || row.Email}</span>
                </div>
              ))}
              {parsed.length > 5 && (
                <p className="text-xs text-gray-400 py-2">...and {parsed.length - 5} more</p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setParsed(null)} className="px-4 py-2.5 text-sm font-medium text-gray-600">Back</button>
              <button onClick={handleImport} disabled={importing}
                className="px-6 py-2.5 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors disabled:opacity-50">
                {importing ? 'Importing...' : 'Import All'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
