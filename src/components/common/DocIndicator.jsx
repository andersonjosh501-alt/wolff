import { CheckCircle, AlertCircle, Circle } from 'lucide-react'

export default function DocIndicator({ status }) {
  if (status === 'complete') {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-sage-600">
        <CheckCircle size={14} /> All docs received
      </span>
    )
  }
  if (status === 'partial') {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
        <AlertCircle size={14} /> Missing documents
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-red-500">
      <Circle size={14} /> No docs received
    </span>
  )
}
