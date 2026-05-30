import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { HiXMark } from 'react-icons/hi2'

const sizeClasses = {
  sm: 'max-w-md',
  /** Employee add/edit wizard (a little narrower) */
  employee: 'max-w-[min(1000px,calc(100vw-2rem))]',
  /** Visa & nationality stepped form — compact width */
  visa: 'max-w-[min(640px,calc(100vw-1.5rem))]',
  /** Exit management view modal */
  exit: 'max-w-4xl',
  /** Announcements / compact forms */
  announcement: 'max-w-[min(720px,calc(100vw-2rem))]',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-6xl',
  custom: 'max-w-[1200px]',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  /** When set, replaces the default title + description header block */
  header,
  children,
  /** Sticky footer — stays visible while body scrolls */
  footer,
  size = 'md',
  showClose = true,
  icon: Icon,
  bodyClassName = '',
}) {
  useEffect(() => {
    if (!isOpen) return

    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }

    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const maxW = sizeClasses[size] ?? sizeClasses.md

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel — fixed max height; only the body scrolls */}
      <div
        className={`relative z-10 flex w-full ${maxW} max-h-[min(85dvh,calc(100dvh-1.5rem))] min-h-0 flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-200 transition-all duration-300 ease-out animate-in fade-in zoom-in-95`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-20 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
            aria-label="Close"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        )}

        {/* Header */}
        <div className="shrink-0 border-b border-slate-100 px-5 py-4 sm:px-6">
          {header ? (
            <div className="pr-8">{header}</div>
          ) : (
            <div className="flex items-center gap-3 pr-8">
              {Icon && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  {title}
                </h2>
                {description && (
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                    {description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y px-5 py-4 sm:px-6 custom-scrollbar ${bodyClassName}`}
        >
          {children}
        </div>

        {/* Sticky footer */}
        {footer ? (
          <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )

  const mount =
    typeof document !== 'undefined' &&
    (document.getElementById('modal-root') || document.body)
  if (!mount) return null
  return createPortal(modalContent, mount)
}
