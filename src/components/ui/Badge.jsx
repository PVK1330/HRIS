const colorClasses = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-600',
  orange: 'bg-orange-100 text-orange-600',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
  yellow: 'bg-yellow-100 text-yellow-700',
  purple: 'bg-purple-100 text-purple-700',
}

export function Badge({ label, color = 'gray' }) {
  const c = colorClasses[color] ?? colorClasses.gray
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${c}`}
    >
      {label}
    </span>
  )
}
