import { useState } from 'react'

export function Toggle({ checked, defaultChecked = false, onChange, disabled = false }) {
  const [internal, setInternal] = useState(defaultChecked)
  const controlled = typeof checked === 'boolean' && typeof onChange === 'function'
  const on = controlled ? checked : internal

  const flip = () => {
    if (disabled) return
    if (controlled) {
      onChange(!checked)
    } else {
      setInternal((v) => !v)
    }
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={flip}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
        on ? 'bg-[#0F766E]' : 'bg-gray-200'
      }`}
      aria-pressed={on}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          on ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export function Badge({ label, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    gray: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[color]}`}>
      {label}
    </span>
  )
}

export function SectionCard({ title, description, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-slate-50/60 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-gray-500">{description}</p>
        ) : null}
      </div>
      <div className="px-5 pb-1 pt-2 sm:px-6 sm:pb-2 sm:pt-3">{children}</div>
    </div>
  )
}

export function FieldRow({ label, hint, children }) {
  return (
    <div className="grid grid-cols-1 gap-2 border-b border-gray-100 py-4 last:border-0 sm:grid-cols-12 sm:items-start sm:gap-6 sm:py-4">
      <div className="min-w-0 sm:col-span-5">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {hint ? <p className="mt-1 text-xs leading-relaxed text-gray-500">{hint}</p> : null}
      </div>
      <div className="min-w-0 sm:col-span-7">{children}</div>
    </div>
  )
}

export function TextInput(props) {
  const {
    placeholder,
    value,
    defaultValue,
    type = 'text',
    onChange,
    disabled,
    className = '',
    rows,
    ...rest
  } = props

  const controlledValue = value !== undefined

  const shared =
    'w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-sm transition-[border-color,box-shadow] placeholder:text-gray-400 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/15 disabled:opacity-50'

  if (type === 'textarea' || rows) {
    return (
      <textarea
        placeholder={placeholder}
        {...(controlledValue ? { value, onChange } : { defaultValue, onChange })}
        rows={rows || 3}
        disabled={disabled}
        className={`${shared} min-h-[88px] py-2.5 ${className}`}
        {...rest}
      />
    )
  }

  return (
    <input
      type={type}
      placeholder={placeholder}
      {...(controlledValue ? { value, onChange } : { defaultValue, onChange })}
      disabled={disabled}
      className={`${shared} h-10 ${className}`}
      {...rest}
    />
  )
}

export function SelectInput({ options, value, defaultValue, onChange, disabled }) {
  const controlled = value !== undefined
  return (
    <select
      {...(controlled ? { value, onChange } : { defaultValue, onChange })}
      disabled={disabled}
      className="h-10 w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-sm focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/15 disabled:opacity-50"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}
