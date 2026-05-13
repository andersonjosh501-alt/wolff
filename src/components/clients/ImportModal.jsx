import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { X, Upload, FileText, CheckCircle, AlertTriangle, ArrowRight, ArrowLeft, Table } from 'lucide-react'
import toast from 'react-hot-toast'
import Papa from 'papaparse'

const WOLFF_FIELDS = [
  { key: 'name', label: 'Name', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'phone', label: 'Phone', required: false },
  { key: 'type', label: 'Return Type', required: false },
  { key: 'priorYearFiled', label: 'Prior Year Filed', required: false },
]

const SKIP = '__skip__'

function normalizeType(raw) {
  if (!raw) return 'personal'
  const lower = raw.trim().toLowerCase()
  if (['estate', '1041'].includes(lower)) return 'estate'
  if (['corporate', 'corp', 'c-corp', 's-corp', '1120', '1065', 'partnership', 'llc'].includes(lower)) return 'corporate'
  if (['personal', '1040', 'individual'].includes(lower)) return 'personal'
  return 'personal'
}

function normalizePriorYear(raw) {
  if (!raw) return false
  const lower = String(raw).trim().toLowerCase()
  return ['yes', 'true', '1', 'y'].includes(lower)
}

function guessMapping(csvHeaders) {
  const mapping = {}
  const lowerHeaders = csvHeaders.map(h => h.toLowerCase().trim())

  for (const field of WOLFF_FIELDS) {
    let bestIndex = -1

    if (field.key === 'name') {
      bestIndex = lowerHeaders.findIndex(h =>
        h === 'name' || h === 'full name' || h === 'fullname' || h === 'client name' || h === 'client_name'
      )
    } else if (field.key === 'email') {
      bestIndex = lowerHeaders.findIndex(h =>
        h === 'email' || h === 'email address' || h === 'email_address' || h === 'e-mail'
      )
    } else if (field.key === 'phone') {
      bestIndex = lowerHeaders.findIndex(h =>
        h === 'phone' || h === 'phone number' || h === 'phone_number' || h === 'tel' || h === 'telephone'
      )
    } else if (field.key === 'type') {
      bestIndex = lowerHeaders.findIndex(h =>
        h === 'type' || h === 'return type' || h === 'return_type' || h === 'client type' || h === 'client_type'
      )
    } else if (field.key === 'priorYearFiled') {
      bestIndex = lowerHeaders.findIndex(h =>
        h === 'prior year filed' || h === 'prior_year_filed' || h === 'prior year' || h === 'prior_year' ||
        h === 'returning' || h === 'returning client' || h === 'returning_client'
      )
    }

    mapping[field.key] = bestIndex >= 0 ? csvHeaders[bestIndex] : SKIP
  }

  return mapping
}

export default function ImportModal({ onClose }) {
  const { bulkImportClients, setActiveTab } = useApp()

  // Step: 'upload' | 'mapping' | 'preview' | 'importing' | 'done'
  const [step, setStep] = useState('upload')
  const [dragOver, setDragOver] = useState(false)
  const [csvData, setCsvData] = useState(null)      // raw parsed rows
  const [csvHeaders, setCsvHeaders] = useState([])   // column headers
  const [parseError, setParseError] = useState(null)
  const [mapping, setMapping] = useState({})          // wolffField -> csvColumn
  const [results, setResults] = useState(null)        // import results

  // ── Step 1: Upload ──
  const handleFile = (file) => {
    if (!file) return
    setParseError(null)

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setParseError('Please upload a .csv file.')
      return
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0 && result.data.length === 0) {
          setParseError('Could not parse this CSV. Check that the file is valid and uses commas as delimiters.')
          console.log('[Wolff Import] Parse errors:', result.errors)
          return
        }
        if (result.data.length === 0) {
          setParseError('CSV file is empty — no data rows found.')
          return
        }
        const headers = result.meta.fields || []
        console.log('[Wolff Import] Parsed CSV:', result.data.length, 'rows,', headers.length, 'columns:', headers)
        setCsvData(result.data)
        setCsvHeaders(headers)
        setMapping(guessMapping(headers))
        setStep('mapping')
      },
      error: (err) => {
        console.error('[Wolff Import] Parse error:', err)
        setParseError('Failed to parse CSV file: ' + (err.message || 'Unknown error'))
      },
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  // ── Step 2: Mapping ──
  const updateMapping = (wolffField, csvColumn) => {
    setMapping(prev => ({ ...prev, [wolffField]: csvColumn }))
  }

  const requiredMapped = WOLFF_FIELDS
    .filter(f => f.required)
    .every(f => mapping[f.key] && mapping[f.key] !== SKIP)

  // ── Step 3: Preview ──
  const previewRows = useMemo(() => {
    if (!csvData || !mapping) return []
    return csvData.slice(0, 5).map(row => {
      const mapped = {}
      for (const field of WOLFF_FIELDS) {
        const col = mapping[field.key]
        if (!col || col === SKIP) {
          mapped[field.key] = ''
        } else {
          mapped[field.key] = row[col] || ''
        }
      }
      return mapped
    })
  }, [csvData, mapping])

  const totalRows = csvData?.length || 0
  const rowsMissingRequired = useMemo(() => {
    if (!csvData) return 0
    return csvData.filter(row => {
      const nameCol = mapping.name
      const emailCol = mapping.email
      const name = nameCol && nameCol !== SKIP ? (row[nameCol] || '').trim() : ''
      const email = emailCol && emailCol !== SKIP ? (row[emailCol] || '').trim() : ''
      return !name || !email
    }).length
  }, [csvData, mapping])

  // ── Step 4: Import ──
  const handleImport = async () => {
    setStep('importing')

    // Transform CSV rows using mapping
    const clientRows = csvData.map(row => {
      const nameCol = mapping.name
      const emailCol = mapping.email
      const phoneCol = mapping.phone
      const typeCol = mapping.type
      const priorCol = mapping.priorYearFiled

      const name = nameCol && nameCol !== SKIP ? (row[nameCol] || '').trim() : ''
      const email = emailCol && emailCol !== SKIP ? (row[emailCol] || '').trim() : ''
      const phone = phoneCol && phoneCol !== SKIP ? (row[phoneCol] || '').trim() : ''
      const rawType = typeCol && typeCol !== SKIP ? (row[typeCol] || '').trim() : ''
      const rawPrior = priorCol && priorCol !== SKIP ? (row[priorCol] || '').trim() : ''

      const type = normalizeType(rawType)

      return {
        name,
        email,
        phone,
        type,
        status: 'not_started',
        docStatus: 'missing',
        missingDocs: [],
        receivedDocs: [],
        lastContact: new Date().toISOString().split('T')[0],
        bankInfo: null,
        ssn_last4: null,
        filing_status: type === 'personal' ? 'Single' : type === 'estate' ? 'Trust' : 'C-Corporation',
        address: '',
        notes: '',
        ein: null,
        priorYearFiled: normalizePriorYear(rawPrior),
      }
    })

    console.log('[Wolff Import] Sending', clientRows.length, 'rows to bulkImportClients')
    const importResults = await bulkImportClients(clientRows)
    console.log('[Wolff Import] Results:', importResults)
    setResults(importResults)
    setStep('done')
  }

  // ── Step 5: Done ──
  const handleDone = () => {
    setActiveTab('clients')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Import Clients</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === 'upload' && 'Upload a CSV file to get started'}
              {step === 'mapping' && 'Map your CSV columns to Wolff fields'}
              {step === 'preview' && 'Review before importing'}
              {step === 'importing' && 'Importing...'}
              {step === 'done' && 'Import complete'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {/* Step indicator */}
        {step !== 'done' && step !== 'importing' && (
          <div className="flex items-center gap-2 px-8 pb-4">
            {['Upload', 'Map Columns', 'Preview & Import'].map((label, i) => {
              const stepOrder = ['upload', 'mapping', 'preview']
              const currentIdx = stepOrder.indexOf(step)
              const isActive = i === currentIdx
              const isComplete = i < currentIdx
              return (
                <div key={label} className="flex items-center gap-2">
                  {i > 0 && <div className={`w-8 h-0.5 ${isComplete ? 'bg-sage-400' : 'bg-gray-200'}`} />}
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                    ${isActive ? 'bg-sage-500 text-white' : isComplete ? 'bg-sage-100 text-sage-700' : 'bg-gray-100 text-gray-400'}`}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Content */}
        <div className="px-8 pb-8 overflow-auto flex-1">

          {/* ── Upload Step ── */}
          {step === 'upload' && (
            <div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors relative
                  ${dragOver ? 'border-sage-400 bg-sage-50' : 'border-gray-200 hover:border-sage-300'}`}
              >
                <Upload size={32} className="mx-auto text-gray-400 mb-4" />
                <p className="text-sm font-medium text-gray-700">Drop your CSV file here</p>
                <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {parseError && (
                <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                  <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{parseError}</p>
                </div>
              )}

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-2">Your CSV should have column headers in the first row. Common column names:</p>
                <code className="text-xs text-gray-500">Name, Email, Phone, Return Type, Prior Year Filed</code>
              </div>
            </div>
          )}

          {/* ── Mapping Step ── */}
          {step === 'mapping' && (
            <div>
              <div className="flex items-center gap-3 p-4 bg-sage-50 rounded-lg mb-6">
                <Table size={16} className="text-sage-600" />
                <p className="text-sm text-sage-800">
                  Found <strong>{csvData.length}</strong> rows with <strong>{csvHeaders.length}</strong> columns.
                  Map your columns to Wolff fields below.
                </p>
              </div>

              <div className="space-y-3">
                {WOLFF_FIELDS.map(field => (
                  <div key={field.key} className="flex items-center gap-4">
                    <div className="w-40 flex-shrink-0">
                      <span className="text-sm font-medium text-gray-900">{field.label}</span>
                      {field.required && <span className="text-red-500 ml-1 text-xs">*</span>}
                    </div>
                    <ArrowLeft size={14} className="text-gray-300 flex-shrink-0" />
                    <select
                      value={mapping[field.key] || SKIP}
                      onChange={(e) => updateMapping(field.key, e.target.value)}
                      className={`flex-1 px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300
                        ${mapping[field.key] === SKIP && field.required ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
                    >
                      <option value={SKIP}>— Skip (don't import) —</option>
                      {csvHeaders.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {!requiredMapped && (
                <div className="mt-4 flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">Name and Email are required. Please map them to proceed.</p>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => { setStep('upload'); setCsvData(null); setCsvHeaders([]); setParseError(null) }}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={() => setStep('preview')}
                  disabled={!requiredMapped}
                  className="flex items-center gap-2 px-6 py-2.5 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors disabled:opacity-40"
                >
                  Preview <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── Preview Step ── */}
          {step === 'preview' && (
            <div>
              <div className="overflow-x-auto mb-4 border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {WOLFF_FIELDS.filter(f => mapping[f.key] !== SKIP).map(f => (
                        <th key={f.key} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{f.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        {WOLFF_FIELDS.filter(f => mapping[f.key] !== SKIP).map(f => {
                          const val = row[f.key]
                          const isMissing = f.required && !val?.trim()
                          let displayVal = val
                          if (f.key === 'type' && val) displayVal = normalizeType(val)
                          if (f.key === 'priorYearFiled') displayVal = normalizePriorYear(val) ? 'Yes' : 'No'
                          return (
                            <td key={f.key} className={`px-4 py-2.5 ${isMissing ? 'text-red-500 italic' : 'text-gray-900'}`}>
                              {isMissing ? '(missing)' : displayVal || '—'}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalRows > 5 && (
                <p className="text-xs text-gray-400 mb-4">Showing first 5 of {totalRows} rows</p>
              )}

              {/* Summary */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-1.5 mb-6">
                <p className="text-sm text-gray-700"><strong>{totalRows}</strong> total rows in CSV</p>
                {rowsMissingRequired > 0 && (
                  <p className="text-sm text-amber-600">
                    <AlertTriangle size={12} className="inline mr-1" />
                    <strong>{rowsMissingRequired}</strong> row{rowsMissingRequired !== 1 ? 's' : ''} will be skipped (missing Name or Email)
                  </p>
                )}
                <p className="text-sm text-sage-700">
                  <strong>{totalRows - rowsMissingRequired}</strong> client{totalRows - rowsMissingRequired !== 1 ? 's' : ''} will be imported (duplicates checked at import time)
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('mapping')}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={handleImport}
                  className="flex items-center gap-2 px-6 py-2.5 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors shadow-sm"
                >
                  Import {totalRows - rowsMissingRequired} Client{totalRows - rowsMissingRequired !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}

          {/* ── Importing Step ── */}
          {step === 'importing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-sage-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-sm font-medium text-gray-700">Importing clients...</p>
              <p className="text-xs text-gray-400 mt-1">This may take a moment</p>
            </div>
          )}

          {/* ── Done Step ── */}
          {step === 'done' && results && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-sage-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Complete</h3>

              <div className="inline-block text-left bg-gray-50 rounded-xl p-6 space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-sage-500"></div>
                  <p className="text-sm text-gray-700"><strong>{results.imported}</strong> client{results.imported !== 1 ? 's' : ''} imported</p>
                </div>
                {results.skippedMissing > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    <p className="text-sm text-gray-700"><strong>{results.skippedMissing}</strong> skipped (missing required fields)</p>
                  </div>
                )}
                {results.skippedDuplicate > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <p className="text-sm text-gray-700"><strong>{results.skippedDuplicate}</strong> skipped (duplicate email)</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleDone}
                className="px-8 py-2.5 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors shadow-sm"
              >
                Go to Clients
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
