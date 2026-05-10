const statusConfig = {
  not_started: { label: 'Not Started', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  waiting_documents: { label: 'Waiting on Docs', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  ready_review: { label: 'Ready for Review', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400' },
  complete: { label: 'Complete', bg: 'bg-sage-50', text: 'text-sage-700', dot: 'bg-sage-500' },
  picked_up: { label: 'Picked Up', bg: 'bg-sage-100', text: 'text-sage-800', dot: 'bg-sage-600' },
}

export default function StatusBadge({ status, size = 'sm' }) {
  const config = statusConfig[status] || statusConfig.not_started
  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  )
}

export { statusConfig }
