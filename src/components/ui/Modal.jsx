import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { HiXMark } from 'react-icons/hi2'

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  description,
  children, 
  size = 'md',
  showClose = true,
  icon: Icon
}) {
  useEffect(() => {
    if (!isOpen) return
    
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const maxW = sizeClasses[size] ?? sizeClasses.md

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Box */}
      <div 
        className={`relative w-full ${maxW} transform rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 transition-all duration-300 ease-out animate-in fade-in zoom-in-95`}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
            aria-label="Close"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        )}

        <div className="flex flex-col">
          {/* Header */}
          <div className="px-6 pt-8 pb-4 sm:px-8">
            <div className="flex items-center gap-4">
              {Icon && (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon className="h-6 w-6" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-2 sm:px-8 max-h-[calc(100vh-16rem)] overflow-y-auto custom-scrollbar">
            <div className="pb-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.getElementById('modal-root'))
}
