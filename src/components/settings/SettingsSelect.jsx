/**
 * Native <select> styled to match the Settings spec.
 *
 * Props:
 *  - value:      current value
 *  - onChange:   (newValue) => void  (receives the value, NOT the event)
 *  - options:    Array<{ value: string, label: string }>
 *  - placeholder?: string
 *  - disabled?:  boolean
 *  - className?: string
 *  - name?:      string
 *  - id?:        string
 */
export default function SettingsSelect({
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  className = '',
  name,
  id,
}) {
  return (
    <select
      id={id}
      name={name}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className={`block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-shadow focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 ${className}`}
    >
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
