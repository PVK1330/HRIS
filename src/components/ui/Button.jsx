import { memo } from 'react'
import { HiArrowPath } from 'react-icons/hi2'

const variantClasses = {
  primary: 'bg-[#C8102E] text-white hover:bg-[#a50e26]',
  secondary: 'bg-[#004CA5] text-white hover:bg-[#003a80]',
  teal: 'bg-teal-700 text-white hover:bg-teal-800',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-slate-600 hover:bg-slate-100',
  Approve: 'bg-emerald-600 text-white hover:bg-emerald-700',
}

const sizeClasses = {
  sm: 'min-h-[36px] px-3 py-1.5 text-xs',
  md: 'min-h-[40px] px-4 py-2 text-sm',
  lg: 'min-h-[44px] px-5 py-2.5 text-sm',
}

function resolveText(label, children) {
  if (label != null && label !== '') return label
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  return null
}

export const Button = memo(function Button({
  label,
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading,
  disabled,
  type = 'button',
  className = '',
  ariaLabel,
  title,
}) {
  const text = resolveText(label, children)
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-600 disabled:cursor-not-allowed disabled:opacity-50'
  const v = variantClasses[variant] ?? variantClasses.primary
  const s = sizeClasses[size] ?? sizeClasses.md

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={`${base} ${v} ${s} ${className}`}
      aria-label={ariaLabel ?? text ?? title ?? undefined}
    >
      {loading ? (
        <HiArrowPath className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
      ) : (
        Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />
      )}
      {text != null && text !== '' && <span className="whitespace-nowrap">{text}</span>}
    </button>
  )
})
