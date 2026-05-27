import { useState } from 'react'

/* ── Layout primitives ─────────────────────────────────────────────── */

export function SettingsPageHeader({ title, subtitle }) {
  return (
    <div className="border-b border-gray-100 pb-4">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
    </div>
  )
}

export function SettingsLoading({ message = 'Loading settings…' }) {
  return (
    <div className="rounded-none border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
      {message}
    </div>
  )
}

export function SettingsError({ message }) {
  return (
    <div className="rounded-none border border-red-100 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
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

/* ── Section card + data table ─────────────────────────────────────── */

export function SectionCard({ title, description, children, columns, noTable = false }) {
  return (
    <div className="overflow-hidden rounded-none border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-slate-50/60 px-4 py-3 sm:px-5">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{description}</p>
        ) : null}
      </div>
      {noTable ? (
        <div className="px-4 py-4 sm:px-5">{children}</div>
      ) : (
        <SettingsTable columns={columns}>{children}</SettingsTable>
      )}
    </div>
  )
}

export function SettingsTable({ columns = ['Setting', 'Value'], children }) {
  const cols = Array.isArray(columns) ? columns : ['Setting', 'Value']

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {cols.map((label, i) => (
              <th
                key={label}
                scope="col"
                className={`whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-5 ${
                  i === 0 ? 'text-left w-[42%]' : cols.length === 2 ? 'text-right' : 'text-center'
                }`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>
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
  align = 'right',
  colSpan,
}) {
  if (colSpan) {
    return (
      <tr className="hover:bg-gray-50/50">
        <td colSpan={colSpan} className="px-4 py-3 sm:px-5">
          {children}
        </td>
      </tr>
    )
  }

  const valueAlign =
    align === 'left'
      ? 'text-left'
      : align === 'center'
        ? 'text-center'
        : 'text-right'

  const valueFlex =
    align === 'left'
      ? 'justify-start'
      : align === 'center'
        ? 'justify-center'
        : 'justify-end'

  return (
    <tr className="hover:bg-gray-50/50">
      <td className="whitespace-nowrap px-4 py-3 align-middle sm:px-5">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {hint ? <p className="mt-0.5 text-xs text-gray-500">{hint}</p> : null}
      </td>
      <td className={`px-4 py-3 align-middle sm:px-5 ${valueAlign}`}>
        <div className={`flex min-w-0 ${valueFlex}`}>{children}</div>
      </td>
    </tr>
  )
}

/** Multi-column table row (e.g. notifications matrix) */
export function SettingsMatrixRow({ label, cells }) {
  return (
    <tr className="hover:bg-gray-50/50">
      <td className="px-4 py-3 text-sm font-medium text-gray-900 sm:px-5">{label}</td>
      {cells.map((cell, i) => (
        <td key={i} className="px-4 py-3 text-center align-middle sm:px-5">
          <div className="flex justify-center">{cell}</div>
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
    'w-full min-w-0 rounded-none border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-sm transition-[border-color,box-shadow] placeholder:text-gray-400 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/15 disabled:opacity-50'

  if (type === 'textarea' || rows) {
    return (
      <textarea
        placeholder={placeholder}
        {...(controlledValue ? { value, onChange } : { defaultValue, onChange })}
        rows={rows || 3}
        disabled={disabled}
        className={`${shared} min-h-[88px] max-w-md py-2.5 ${className}`}
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
      className={`${shared} h-10 max-w-md ${className}`}
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
      className={`h-10 w-full min-w-0 max-w-md rounded-none border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-sm focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/15 disabled:opacity-50 ${className}`}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}
