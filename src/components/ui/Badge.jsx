import { memo } from 'react'

const colorClasses = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-600',
  orange: 'bg-orange-100 text-orange-600',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
  yellow: 'bg-yellow-100 text-yellow-700',
  purple: 'bg-purple-100 text-purple-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  teal: 'bg-teal-100 text-teal-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  coral: 'bg-rose-100 text-rose-600',
}

export const Badge = memo(function Badge({ label, color = 'gray', className = '' }) {
  const c = colorClasses[color] ?? colorClasses.gray
  return (
    <span
      className={`inline-flex items-center rounded-none px-2.5 py-0.5 text-xs font-semibold ${c} ${className}`}
    >
      {label}
    </span>
  )
})
