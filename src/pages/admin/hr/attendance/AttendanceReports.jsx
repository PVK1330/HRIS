import { useEffect, useState } from 'react'
import { HiArrowDownTray } from 'react-icons/hi2'
import { Button } from '../../../../components/ui/Button.jsx'
import { Table } from '../../../../components/ui/Table.jsx'
import {
  exportAttendanceExcel,
  exportAttendancePdf,
  getAttendanceReport,
} from '../../../../services/attendanceService.js'
import { listEmployees } from '../../../../services/employeeService.js'
import { buildReportColumns } from '../../../../utils/attendanceLabels.js'

const REPORT_TYPES = [
  { id: 'employee', label: 'Employee Attendance' },
  { id: 'department', label: 'Department' },
  { id: 'organization', label: 'Organization' },
  { id: 'summary', label: 'Summary' },
  { id: 'overtime', label: 'Overtime' },
  { id: 'late', label: 'Late Arrival' },
  { id: 'absenteeism', label: 'Absenteeism' },
  { id: 'regularization', label: 'Regularization' },
  { id: 'payroll', label: 'Payroll Attendance' },
]

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function AttendanceReports() {
  const [reportType, setReportType] = useState('summary')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [department, setDepartment] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [employees, setEmployees] = useState([])

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
    try {
      const blob = format === 'pdf'
        ? await exportAttendancePdf(params())
        : await exportAttendanceExcel(params())
      downloadBlob(blob, `attendance-${reportType}.${format === 'pdf' ? 'pdf' : 'xlsx'}`)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Export failed')
    }
  }

  const columns = buildReportColumns(rows[0])

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm">
            Report
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {REPORT_TYPES.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            From
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm">
            To
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm">
            Year
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm">
            Month
            <input type="number" min={1} max={12} value={month} onChange={(e) => setMonth(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm">
            Department
            <input value={department} onChange={(e) => setDepartment(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm">
            Employee
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="">All</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.full_name || e.name}</option>
              ))}
            </select>
          </label>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" onClick={runReport} disabled={loading}>Generate</Button>
          <Button type="button" variant="secondary" onClick={() => exportFile('pdf')} className="inline-flex items-center gap-2">
            <HiArrowDownTray className="h-4 w-4" /> PDF
          </Button>
          <Button type="button" variant="secondary" onClick={() => exportFile('excel')} className="inline-flex items-center gap-2">
            <HiArrowDownTray className="h-4 w-4" /> Excel
          </Button>
        </div>
      </div>

      <Table loading={loading} columns={columns} data={rows} emptyMessage="Run a report to see data" />
    </div>
  )
}
