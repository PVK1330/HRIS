import { memo } from 'react'
import { Tooltip } from './Tooltip.jsx'

const tones = {
  approve: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  reject: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  neutral: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
}

/**
 * Table / toolbar icon action with visible label and tooltip.
 */
export const IconActionButton = memo(function IconActionButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  tone = 'neutral',
  tooltip,
}) {
  const btn = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={tooltip || label}
      aria-label={label}
      className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:opacity-50 ${tones[tone] || tones.neutral}`}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
      <span>{label}</span>
    </button>
  )

  return tooltip ? <Tooltip content={tooltip}>{btn}</Tooltip> : btn
})
