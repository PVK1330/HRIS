export function SASection({ children }) {
  return <div className="space-y-4">{children}</div>
}

export function SASectionCard({ title, description, children }) {
  return (
    <div className="border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">{title}</h3>
        {description && <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>}
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  )
}

export function SAFieldRow({ label, hint, children }) {
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-6 px-5 py-3">
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        {hint && <p className="mt-0.5 font-mono text-[10px] text-slate-400">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export function SABanner({ type = 'ok', children }) {
  return type === 'ok' ? (
    <div className="border border-teal-200 bg-teal-50 px-4 py-3 text-xs font-medium text-teal-800">
      {children}
    </div>
  ) : (
    <div className="border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
      {children}
    </div>
  )
}

export function SALoadingState({ message = 'Loading…' }) {
  return (
    <div className="space-y-3">
      <div className="animate-pulse space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[44px] w-full bg-slate-100" />
        ))}
      </div>
      <p className="text-center font-mono text-[10px] text-slate-400">{message}</p>
    </div>
  )
}

export function SASaveBar({ dirty, saving, onSave, onDiscard, disabled }) {
  return (
    <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-200 bg-slate-50 px-5 py-3">
      <button
        type="button"
        disabled={!dirty || saving || disabled}
        onClick={onDiscard}
        className="inline-flex h-9 items-center gap-1.5 border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-[#0F766E] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Discard
      </button>
      <button
        type="submit"
        disabled={disabled || saving || !dirty}
        className="inline-flex h-9 items-center gap-1.5 bg-[#0F766E] px-3 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-[#0c6b64] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  )
}

export const inp =
  'h-9 w-full max-w-[240px] rounded-none border border-slate-200 bg-white px-3 font-mono text-xs tabular-nums text-slate-800 shadow-2xs outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] disabled:opacity-50'

export const sel =
  'h-9 w-full max-w-[240px] cursor-pointer rounded-none border border-slate-200 bg-white px-3 font-mono text-xs text-slate-800 shadow-2xs outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] disabled:opacity-50'

export const textArea =
  'w-full max-w-[360px] resize-none rounded-none border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-800 shadow-2xs outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]'
