import StatusBadge from '../common/StatusBadge'
import DocIndicator from '../common/DocIndicator'
import { ChevronRight, Mail, Phone } from 'lucide-react'

export default function ClientCard({ client, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-5 bg-white rounded-xl border border-gray-100 hover:border-sage-200 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-sage-700 transition-colors">
            {client.name}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Mail size={12} /> {client.email}
            </span>
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-sage-400 transition-colors mt-1" />
      </div>

      <div className="flex items-center justify-between mt-4">
        <StatusBadge status={client.status} />
        <DocIndicator status={client.docStatus} />
      </div>

      {client.missingDocs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <p className="text-xs text-gray-400">
            Needs: <span className="text-gray-600">{client.missingDocs.slice(0, 2).join(', ')}</span>
            {client.missingDocs.length > 2 && <span className="text-gray-400"> +{client.missingDocs.length - 2} more</span>}
          </p>
        </div>
      )}
    </button>
  )
}
