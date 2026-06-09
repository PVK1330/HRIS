import { useEffect, useRef, useState } from 'react'
import { HiChevronDown, HiDocumentArrowDown, HiTableCells, HiDocumentText } from 'react-icons/hi2'
import { exportAttendanceExcel, exportAttendancePdf } from '../../services/attendanceService.js'

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Reusable "Export ▾" dropdown for the attendance pages. Calls the existing
 * scope-safe backend export endpoint (GET /attendance/reports/export/{excel,pdf})
 * with the given reportType + filters.
 *
 * @param {string}  reportType  one of the backend report types (e.g. 'overtime',
 *                              'regularization', 'employee').
 * @param {object}  params      extra query filters (employeeId, dateFrom, dateTo,
 *                              year, month, status, ...). reportType is added here.
 * @param {string}  filenameBase prefix for the downloaded file.
 * @param {boolean} disabled
 */
export default function AttendanceExportMenu({
  reportType,
  params = {},
  filenameBase = 'attendance',
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(null)
  const [error, setError] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const runExport = async (format) => {
    setExporting(format)
    setError('')
    try {
      const query = { reportType, ...params }
      const blob = format === 'pdf'
        ? await exportAttendancePdf(query)
        : await exportAttendanceExcel(query)
      downloadBlob(blob, `${filenameBase}-${reportType}.${format === 'pdf' ? 'pdf' : 'xlsx'}`)
      setOpen(false)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Export failed')
    } finally {
      setExporting(null)
    }
  }

  const busy = exporting !== null

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => setOpen((p) => !p)}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
      >
        <HiDocumentArrowDown className="h-4 w-4" />
        {busy ? 'Exporting…' : 'Export'}
        <HiChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            disabled={busy}
            onClick={() => runExport('excel')}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <HiTableCells className="h-4 w-4 text-emerald-600" />
            Export as Excel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => runExport('pdf')}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <HiDocumentText className="h-4 w-4 text-rose-600" />
            Export as PDF
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="absolute right-0 top-full z-20 mt-1 whitespace-nowrap text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  )
}
