/**
 * Lightweight tooltip — wraps controls; shows on hover and keyboard focus.
 */
export function Tooltip({ content, children, placement = 'top' }) {
  if (!content) return children

  const pos =
    placement === 'bottom'
      ? 'top-full mt-2 left-1/2 -translate-x-1/2'
      : 'bottom-full mb-2 left-1/2 -translate-x-1/2'

  return (
    <span className="relative inline-flex group/tooltip">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute ${pos} z-50 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100`}
      >
        {content}
      </span>
    </span>
  )
}
