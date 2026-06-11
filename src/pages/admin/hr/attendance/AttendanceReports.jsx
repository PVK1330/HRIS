import { useEffect, useState } from 'react'
import {
  HiArrowPath,
  HiDocumentChartBar,
  HiDocumentText,
  HiTableCells,
} from 'react-icons/hi2'
import { Button } from '../../../../components/ui/Button.jsx'
import { Tooltip } from '../../../../components/ui/Tooltip.jsx'
import { Table } from '../../../../components/ui/Table.jsx'
import {
  exportAttendanceExcel,
  exportAttendancePdf,
  getAttendanceReport,
} from '../../../../services/attendanceService.js'
import { listEmployees } from '../../../../services/employeeService.js'
import { buildReportColumns } from '../../../../utils/attendanceLabels.js'
import { useAuth } from '../../../../context/AuthContext.jsx'
import { canViewTeamAttendance, canViewAllAttendance } from '../../../../utils/rbac.js'

const REPORT_TYPES = [
  { id: 'employee', label: 'Employee Attendance' },
  { id: 'department', label: 'Department' },
  { id: 'organization', label: 'Organisation' },
  { id: 'summary', label: 'Summary' },
  { id: 'overtime', label: 'Overtime' },
  { id: 'late', label: 'Late Arrival' },
  { id: 'absenteeism', label: 'Absenteeism' },
  { id: 'regularization', label: 'Regularization' },
  { id: 'payroll', label: 'Payroll Attendance' },
]

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none'

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const defaultFilters = () => ({
  reportType: 'summary',
  dateFrom: '',
  dateTo: '',
  year: String(new Date().getFullYear()),
  month: String(new Date().getMonth() + 1),
  department: '',
  employeeId: '',
})

export default function AttendanceReports() {
  const { allowedModules } = useAuth()
  const canRun = canViewTeamAttendance(allowedModules) || canViewAllAttendance(allowedModules)

  const [filters, setFilters] = useState(defaultFilters)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(null)
  const [error, setError] = useState('')
  const [employees, setEmployees] = useState([])

  const { reportType, dateFrom, dateTo, year, month, department, employeeId } = filters

  useEffect(() => {
    listEmployees({ limit: 200 }).then((d) => setEmployees(d?.records || d || [])).catch(() => {})
  }, [])

  const params = () => ({
    reportType,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    year: dateFrom ? undefined : year,
    month: dateFrom ? undefined : month,
    department: department || undefined,
    employeeId: employeeId || undefined,
  })

  const runReport = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAttendanceReport(params())
      setRows(data.rows || [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Report failed')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  const exportFile = async (format) => {
    setExporting(format)
    setError('')
    try {
      const blob = format === 'pdf'
        ? await exportAttendancePdf(params())
        : await exportAttendanceExcel(params())
      downloadBlob(blob, `attendance-${reportType}.${format === 'pdf' ? 'pdf' : 'xlsx'}`)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Export failed')
    } finally {
      setExporting(null)
    }
  }

  const resetFilters = () => {
    setFilters(defaultFilters())
    setRows([])
    setError('')
  }

  const columns = buildReportColumns(rows[0])

  if (!canRun) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        You need team or organization attendance view permission to run reports.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Report filters</h2>
        <p className="mt-1 text-sm text-slate-500">Choose criteria, generate data, then export if needed.</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">
            Report type
            <select
              value={reportType}
              onChange={(e) => setFilters((f) => ({ ...f, reportType: e.target.value }))}
              className={inputClass}
            >
              {REPORT_TYPES.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Date from
            <input type="date" value={dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} className={inputClass} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Date to
            <input type="date" value={dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} className={inputClass} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Year
            <input type="number" value={year} onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))} className={inputClass} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Month
            <input type="number" min={1} max={12} value={month} onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value }))} className={inputClass} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Department
            <input value={department} onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))} className={inputClass} placeholder="Optional" />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Employee
            <select value={employeeId} onChange={(e) => setFilters((f) => ({ ...f, employeeId: e.target.value }))} className={inputClass}>
              <option value="">All employees</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.full_name || e.name}</option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Tooltip content="Run report with current filters">
            <Button
              type="button"
              variant="teal"
              size="md"
              label="Generate Report"
              icon={HiDocumentChartBar}
              loading={loading}
              disabled={loading || !!exporting}
              onClick={runReport}
            />
          </Tooltip>
          <Tooltip content="Download PDF with tenant branding">
            <Button
              type="button"
              variant="secondary"
              size="md"
              label="Export PDF"
              icon={HiDocumentText}
              loading={exporting === 'pdf'}
              disabled={loading || exporting === 'excel'}
              onClick={() => exportFile('pdf')}
            />
          </Tooltip>
          <Tooltip content="Download Excel workbook">
            <Button
              type="button"
              variant="secondary"
              size="md"
              label="Export Excel"
              icon={HiTableCells}
              loading={exporting === 'excel'}
              disabled={loading || exporting === 'pdf'}
              onClick={() => exportFile('excel')}
            />
          </Tooltip>
          <Tooltip content="Clear filters and results">
            <Button
              type="button"
              variant="outline"
              size="md"
              label="Reset Filters"
              icon={HiArrowPath}
              disabled={loading || !!exporting}
              onClick={resetFilters}
            />
          </Tooltip>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table loading={loading} columns={columns} data={rows} emptyMessage="Run a report to see data" />
      </div>
    </div>
  )
}
