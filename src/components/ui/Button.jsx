import { HiArrowPath } from 'react-icons/hi2'

const variantClasses = {
  primary: 'bg-[#C8102E] text-white hover:bg-[#a50e26]',
  secondary: 'bg-[#004CA5] text-white hover:bg-[#003a80]',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
  danger: 'bg-red-100 text-red-600 hover:bg-red-200',
  ghost: 'text-gray-500 hover:bg-gray-100',
  Approve: 'bg-green-100 text-green-600 hover:bg-green-200'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export function Button({
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading,
  disabled,
  type = 'button',
  className = '',
  ariaLabel,
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#004CA5] disabled:opacity-50 disabled:pointer-events-none'
  const v = variantClasses[variant] ?? variantClasses.primary
  const s = sizeClasses[size] ?? sizeClasses.md

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${v} ${s} ${className}`}
      aria-label={ariaLabel ?? (label ? undefined : 'Action')}
    >
      {loading ? (
        <HiArrowPath className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
      ) : (
        Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />
      )}
      {label != null && label !== '' && <span>{label}</span>}
    </button>
  )
}
