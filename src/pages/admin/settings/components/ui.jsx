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
        on ? 'bg-indigo-600' : 'bg-gray-200'
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

export function SectionCard({ title, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-3.5">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export function FieldRow({ label, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-50 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {hint ? <p className="mt-0.5 text-xs text-gray-400">{hint}</p> : null}
      </div>
      <div className="flex-shrink-0">{children}</div>
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
    'w-full max-w-xs rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200 disabled:opacity-50'

  if (type === 'textarea' || rows) {
    return (
      <textarea
        placeholder={placeholder}
        {...(controlledValue ? { value, onChange } : { defaultValue, onChange })}
        rows={rows || 3}
        disabled={disabled}
        className={`${shared} min-h-[72px] py-2 ${className}`}
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
      className={`${shared} h-8 ${className}`}
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
      className="h-8 w-full max-w-xs rounded-lg border border-gray-200 bg-gray-50 px-2 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200 disabled:opacity-50"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}
