export function Input({
  label,
  labelClassName,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required,
  helpText,
  options,
  className = '',
  suffix,
  inputClassName = '',
}) {
  const baseInput =
    'w-full rounded-lg border text-sm transition-shadow focus:outline-none focus:ring-2'
  const normalBorder =
    'border-gray-300 focus:border-[#004CA5] focus:ring-blue-100'
  const errorBorder = 'border-red-400 focus:border-red-400 focus:ring-red-200'
  const borderClass = error ? errorBorder : normalBorder

  const id = name ?? `field-${label?.replace(/\s+/g, '-').toLowerCase() ?? 'input'}`

  const isSelect = type === 'select' && Array.isArray(options)

  const labelClasses = labelClassName ?? 'mb-1 block text-sm font-medium text-gray-700'

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      {isSelect ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className={`${baseInput} ${borderClass} bg-white px-3 py-2`}
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
      ) : suffix ? (
        <div className="relative">
          <input
            id={id}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`${baseInput} ${borderClass} py-2 pl-3 pr-10 ${inputClassName}`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
            {suffix}
          </span>
        </div>
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${baseInput} ${borderClass} px-3 py-2 ${inputClassName}`}
        />
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {helpText && !error && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
  )
}
