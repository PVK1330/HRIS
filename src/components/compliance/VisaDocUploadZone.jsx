import React, { useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import { HiArrowUpTray, HiXMark } from 'react-icons/hi2'

const MAX_BYTES = 10 * 1024 * 1024
const ACCEPT = '.pdf,.jpg,.jpeg,.png'

function formatSize(n) {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${n} B`
}

/**
 * @param {{ label: string, required?: boolean, file: File | null, onChange: (f: File | null) => void, disabled?: boolean }} props
 */
export function VisaDocUploadZone({ label, required, file, onChange, disabled }) {
  const inputRef = useRef(null)

  const pick = useCallback(
    (f) => {
      if (!f) {
        onChange(null)
        return
      }
      if (f.size > MAX_BYTES) {
        toast.error('File must be 10MB or smaller.')
        onChange(null)
        return
      }
      const ok = /\.(pdf|jpe?g|png)$/i.test(f.name)
      if (!ok) {
        toast.error('Only PDF, JPG, or PNG files are allowed.')
        onChange(null)
        return
      }
      onChange(f)
    },
    [onChange],
  )

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    const f = e.dataTransfer?.files?.[0]
    pick(f)
  }

  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-[#1f2a44]">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </p>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center shadow-sm transition hover:border-[#0F766E]/50 ${
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            const f = e.target.files?.[0]
            pick(f)
            e.target.value = ''
          }}
        />
        {!file ? (
          <>
            <HiArrowUpTray className="mx-auto mb-2 h-8 w-8 text-slate-400" aria-hidden />
            <p className="text-sm font-medium text-slate-700">Click to browse or drag and drop files here</p>
            <p className="mt-1 text-xs text-slate-500">PDF, JPG, PNG up to 10MB</p>
          </>
        ) : (
          <div className="flex items-center justify-between gap-2 text-left">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
              <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                onChange(null)
              }}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
              aria-label="Remove file"
            >
              <HiXMark className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
