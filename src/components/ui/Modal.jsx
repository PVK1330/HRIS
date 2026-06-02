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
  xl: 'max-w-8xl',
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
  bodyClassName = '',
  showClose = true,
  icon: Icon,
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
        className={`relative w-full ${maxW} max-h-full flex flex-col transform rounded-lg bg-white shadow-2xl ring-1 ring-slate-200 transition-all duration-300 ease-out animate-in fade-in zoom-in-95`}
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

        <div className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="px-5 pt-6 pb-2 sm:px-6">
            {header ? (
              <div className="pr-10">{header}</div>
            ) : (
              <div className="flex items-center gap-4">
                {Icon && (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="h-6 w-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    {title}
                  </h2>
                  {description && (
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 px-5 py-1 sm:px-6 overflow-y-auto custom-scrollbar">
            <div className="pb-8">
              {children}
            </div>
          </div>
          {footer && (
            <div className="rounded-b-lg border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )

      const mount =
      typeof document !== 'undefined' &&
      (document.getElementById('modal-root') || document.body)
      if (!mount) return null
      return createPortal(modalContent, mount)
}
