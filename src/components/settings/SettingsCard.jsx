export default function SettingsCard({ title, description, actions, children, className = '' }) {
  return (
    <section
      className={`rounded-lg border border-gray-100 bg-white p-6 shadow-sm ${className}`}
    >
      {(title || actions) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}
      <div>{children}</div>
    </section>
  )
}
