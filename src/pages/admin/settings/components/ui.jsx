import { useState } from 'react'

/* ── Layout primitives ─────────────────────────────────────────────── */

/** Optional in-tab header — prefer shell header on Settings.jsx */
export function SettingsPageHeader({ title, subtitle }) {
  return (
    <div className="mb-5 border-b border-slate-100 pb-4">
      <h3 className="text-xs font-black uppercase tracking-wider text-[#0F766E]">{title}</h3>
      {subtitle ? (
        <p className="mt-1 text-xs font-semibold text-slate-600">{subtitle}</p>
      ) : null}
    </div>
  )
}

export function SettingsSection({ children }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 min-w-0">
      {children}
    </div>
  )
}

export function SettingsLoading({ message = 'Loading settings…' }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-none border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-2xs">
      {message}
    </div>
  )
}

export function SettingsError({ message }) {
  return (
    <div className="rounded-none border border-red-100 bg-red-50 p-6 text-sm text-red-700 shadow-2xs">
      {message}
    </div>
  )
}

export function SettingsBanner({ type = 'ok', children }) {
  const ok = type === 'ok'
  return (
    <div
      className={`rounded-none px-4 py-3 text-sm ${
        ok
          ? 'border border-emerald-100 bg-emerald-50 text-emerald-800'
          : 'border border-red-100 bg-red-50 text-red-700'
      }`}
    >
      {children}
    </div>
  )
}

/* ── Section card + field grid (employee profile style) ────────────── */

export function SectionCard({ title, description, children, columns, noTable = false }) {
  const isMatrix = Array.isArray(columns) && columns.length > 2

  return (
    <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-2xs min-w-0">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#0F766E]">{title}</h3>
        {description ? (
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">{description}</p>
        ) : null}
      </div>
      {noTable ? (
        <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
      ) : isMatrix ? (
        <SettingsTable columns={columns}>{children}</SettingsTable>
      ) : (
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 px-4 py-4 sm:px-6 sm:py-5 md:grid-cols-2 animate-in fade-in duration-300">
          {children}
        </div>
      )}
    </div>
  )
}

export function SettingsTable({ columns = ['Setting', 'Value'], children }) {
  const cols = Array.isArray(columns) ? columns : ['Setting', 'Value']

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50/80">
          <tr>
            {cols.map((label, i) => (
              <th
                key={label}
                scope="col"
                className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:px-6 ${
                  i === 0 ? 'text-left' : 'text-center'
                }`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 bg-white">{children}</tbody>
      </table>
    </div>
  )
}

/** @deprecated Use SettingsTableRow — kept for existing imports */
export function FieldRow(props) {
  return <SettingsTableRow {...props} />
}

export function SettingsTableRow({
  label,
  hint,
  children,
  align = 'left',
  colSpan,
}) {
  if (colSpan) {
    return (
      <div className="md:col-span-2 rounded-none border border-slate-200 bg-slate-50/50 p-3.5">
        {children}
      </div>
    )
  }

  const innerAlign =
    align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'

  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      {hint ? <p className="mt-0.5 text-[9px] normal-case text-slate-400">{hint}</p> : null}
      <div className={`mt-1.5 flex min-h-9 items-center ${innerAlign}`}>
        <div className="w-full min-w-0">{children}</div>
      </div>
    </div>
  )
}

/** Multi-column table row (e.g. notifications matrix) */
export function SettingsMatrixRow({ label, cells }) {
  return (
    <tr className="hover:bg-slate-50/50">
      <td className="px-4 py-3.5 align-middle text-sm font-medium text-slate-900 sm:px-6">{label}</td>
      {cells.map((cell, i) => (
        <td key={i} className="px-4 py-3.5 text-center align-middle sm:px-6">
          <div className="flex min-h-9 items-center justify-center">{cell}</div>
        </td>
      ))}
    </tr>
  )
}

/* ── Form controls ─────────────────────────────────────────────────── */

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
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-none transition-colors focus:outline-none disabled:opacity-50 ${
        on ? 'bg-[#0F766E]' : 'bg-gray-200'
      }`}
      aria-pressed={on}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-none bg-white shadow transition-transform ${
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
    <span className={`inline-flex items-center rounded-none px-2 py-0.5 text-xs font-medium ${colors[color]}`}>
      {label}
    </span>
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
    'w-full min-w-0 rounded-none border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 shadow-2xs transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] disabled:opacity-50'

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
      className={`${shared} h-9 ${className}`}
      {...rest}
    />
  )
}

export function SelectInput({ options, value, defaultValue, onChange, disabled, className = '' }) {
  const controlled = value !== undefined
  return (
    <select
      {...(controlled ? { value, onChange } : { defaultValue, onChange })}
      disabled={disabled}
      className={`h-9 w-full min-w-0 cursor-pointer rounded-none border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] disabled:opacity-50 ${className}`}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}
