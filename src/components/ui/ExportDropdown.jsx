import { useState } from 'react'
import toast from 'react-hot-toast'
import { HiArrowDownTray, HiChevronDown } from 'react-icons/hi2'

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Delay revoke so the browser has time to initiate the download
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Dropdown button that triggers backend Excel or PDF export.
 *
 * Props:
 *   onExcel        — async fn that returns an axios response (responseType: 'blob')
 *   onPDF          — async fn that returns an axios response (responseType: 'blob')
 *   excelFilename  — suggested download filename, e.g. "tenants.xlsx"
 *   pdfFilename    — suggested download filename, e.g. "tenants.pdf"
 *   disabled?      — disables the button
 */
export function ExportDropdown({ onExcel, onPDF, excelFilename, pdfFilename, disabled }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const run = async (fn, filename) => {
    setOpen(false)
    setBusy(true)
    const tid = toast.loading('Preparing export…')
    try {
      const res = await fn()
      const blob = res?.data instanceof Blob ? res?.data : new Blob([res?.data])
      triggerDownload(blob, filename)
      toast.success('Download started', { id: tid })
    } catch (e) {
      console.error('Export failed', e)
      toast.error(e?.response?.data?.message || 'Export failed. Please try again.', { id: tid })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
      >
        <HiArrowDownTray className="h-4 w-4" />
        {busy ? 'Exporting…' : 'Export'}
        <HiChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <>
          {/* Click-outside overlay */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-md border border-gray-100 bg-white shadow-lg">
            <button
              type="button"
              onClick={() => run(onExcel, excelFilename)}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <span className="w-8 rounded bg-green-50 px-1 py-0.5 text-center text-[10px] font-bold text-green-700">XLS</span>
              Excel
            </button>
            <div className="mx-3 border-t border-gray-100" />
            <button
              type="button"
              onClick={() => run(onPDF, pdfFilename)}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <span className="w-8 rounded bg-red-50 px-1 py-0.5 text-center text-[10px] font-bold text-red-600">PDF</span>
              PDF
            </button>
          </div>
        </>
      )}
    </div>
  )
}
