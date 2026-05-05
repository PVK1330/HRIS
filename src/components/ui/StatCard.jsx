const colorMap = {
  blue: { border: 'border-l-4 border-blue-500', value: 'text-blue-600' },
  red: { border: 'border-l-4 border-[#C8102E]', value: 'text-[#C8102E]' },
  green: { border: 'border-l-4 border-green-500', value: 'text-green-600' },
  yellow: { border: 'border-l-4 border-yellow-500', value: 'text-yellow-600' },
  purple: { border: 'border-l-4 border-purple-500', value: 'text-purple-600' },
  orange: { border: 'border-l-4 border-orange-500', value: 'text-orange-600' },
}

export function StatCard({ title, value, subtitle, color = 'blue', icon: Icon }) {
  const cfg = colorMap[color] ?? colorMap.blue

  return (
    <div
      className={`rounded-xl bg-white p-4 shadow-sm ${cfg.border}`}
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</div>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />}
      </div>
      <div className={`font-display text-2xl font-bold ${cfg.value}`}>{value}</div>
      {subtitle && <div className="mt-0.5 text-[10px] text-gray-400">{subtitle}</div>}
    </div>
  )
}
