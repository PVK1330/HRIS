import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { HiXMark } from 'react-icons/hi2'

// Elements that can receive keyboard focus, used to scope the focus trap.
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

const sizeClasses = {
  sm: 'max-w-sm sm:max-w-md',
  md: 'max-w-md sm:max-w-lg',
  lg: 'max-w-lg sm:max-w-2xl',
  xl: 'max-w-xl sm:max-w-4xl',
  '2xl': 'max-w-2xl sm:max-w-6xl',
  '3xl': 'max-w-3xl sm:max-w-7xl',
  full: 'max-w-[calc(100vw-2rem)]',
  employee: 'max-w-[min(1000px,calc(100vw-2rem))]',
  visa: 'max-w-[min(640px,calc(100vw-1.5rem))]',
  exit: 'max-w-md sm:max-w-4xl',
  announcement: 'max-w-[min(720px,calc(100vw-2rem))]',
  custom: 'max-w-[1200px]',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  header,
  subHeader,
  children,
  footer,
  stickyFooter,
  size = 'md',
  bodyClassName = '',
  showClose = true,
  icon: Icon,
}) {
  const dialogRef = useRef(null)
  const previouslyFocusedRef = useRef(null)
  const titleId = useId()

  // Keep the latest onClose without re-running the focus effect when its
  // identity changes (which would otherwise disturb focus mid-open).
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return

    // Remember the trigger so focus can be restored to it on close.
    previouslyFocusedRef.current = document.activeElement

    const getFocusable = () => {
      const node = dialogRef.current
      if (!node) return []
      return Array.from(node.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement,
      )
    }

    // Move focus into the dialog unless an autoFocus child already claimed it.
    if (!dialogRef.current?.contains(document.activeElement)) {
      const focusables = getFocusable()
      ;(focusables[0] || dialogRef.current)?.focus()
    }

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current?.()
        return
      }
      if (e.key !== 'Tab') return

      // Focus trap: keep Tab / Shift+Tab cycling within the dialog.
      const items = getFocusable()
      if (items.length === 0) {
        e.preventDefault()
        dialogRef.current?.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey) {
        if (active === first || !dialogRef.current?.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else if (active === last || !dialogRef.current?.contains(active)) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow

      // Restore focus to the element that opened the modal.
      const toRestore = previouslyFocusedRef.current
      if (toRestore && typeof toRestore.focus === 'function') {
        toRestore.focus()
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const maxW = sizeClasses[size] ?? sizeClasses.md

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative w-full ${maxW} max-h-[90vh] sm:max-h-[calc(100vh-4rem)] flex flex-col overflow-hidden rounded-lg bg-white shadow-2xl z-[9999] focus:outline-none`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title || header ? titleId : undefined}
        aria-label={!title && !header ? 'Dialog' : undefined}
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
          <div className="px-4 sm:px-5 pt-5 sm:pt-6 pb-2 sm:pb-2">
            {header ? (
              <div id={titleId} className="pr-8 sm:pr-10">{header}</div>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4">
                {Icon && (
                  <div className="flex h-10 sm:h-12 w-10 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="h-5 sm:h-6 w-5 sm:w-6" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h2 id={titleId} className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                    {title}
                  </h2>

                  {description && (
                    <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-500">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {subHeader && (
            <div className="shrink-0">{subHeader}</div>
          )}

          <div className={`flex-1 px-4 sm:px-5 py-2 sm:py-1 custom-scrollbar ${bodyClassName.includes('overflow-') ? bodyClassName : 'overflow-y-auto ' + bodyClassName}`}>
            <div className="pb-6 sm:pb-8">{children}</div>
          </div>
          {stickyFooter && (
            <div className="shrink-0 border-t border-slate-200 bg-white px-4 sm:px-5 py-3 sm:py-4">
              {stickyFooter}
            </div>
          )}
          {footer && (
            <div className="rounded-b-lg border-t border-slate-200 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 sm:flex sm:flex-row-reverse sm:px-6">
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