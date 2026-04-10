export function Toggle({ checked, onChange, label, disabled }) {
  const id = `toggle-${label?.replace(/\s+/g, '-').toLowerCase() ?? 'field'}`

  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
        />
        <span
          className="absolute inset-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-[#004CA5] peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#004CA5] peer-focus-visible:ring-offset-2"
          aria-hidden
        />
        <span
          className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-out peer-checked:translate-x-5"
          aria-hidden
        />
      </span>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
    </label>
  )
}
