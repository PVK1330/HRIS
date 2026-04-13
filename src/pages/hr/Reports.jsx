import { useState } from 'react'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'

export default function Reports() {
  const [reportType, setReportType] = useState('Attendance')
  const [fromDate, setFromDate] = useState('2026-04-01')
  const [toDate, setToDate] = useState('2026-04-30')
  const [selectedEmployees, setSelectedEmployees] = useState('All Team Members')
  const [exportFormat, setExportFormat] = useState('Excel (.xlsx)')

  const reports = [
    { title: 'Attendance Summary', description: 'Monthly team attendance report' },
    { title: 'Leave Utilization', description: 'Leave taken vs balance by type' },
    { title: 'Performance Summary', description: 'Ratings and goal completion' },
    { title: 'Expense Report', description: 'Claims submitted and approved' },
    { title: 'Team Headcount', description: 'Active, probation, notice count' },
    { title: 'Overtime Log', description: 'Extra hours by employee' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
        <p className="mt-1 text-sm text-text-secondary">Generate and export HR reports</p>
      </div>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <div
            key={report.title}
            className="cursor-pointer rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm transition-colors hover:bg-background-secondary"
          >
            <div className="text-sm font-medium text-text-primary">{report.title}</div>
            <div className="mt-1 text-xs text-text-secondary">{report.description}</div>
            <Button label="Generate" variant="primary" size="sm" className="mt-3" />
          </div>
        ))}
      </div>

      {/* Custom Report Builder */}
      <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
        <h2 className="text-lg font-bold text-text-primary">Custom Report Builder</h2>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
              >
                <option>Attendance</option>
                <option>Leave</option>
                <option>Performance</option>
                <option>Expense</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">From Date</label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">To Date</label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Employees</label>
              <select
                value={selectedEmployees}
                onChange={(e) => setSelectedEmployees(e.target.value)}
                className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
              >
                <option>All Team Members</option>
                <option>Rohit Shah</option>
                <option>Priti Gupta</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Export Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
              >
                <option>Excel (.xlsx)</option>
                <option>CSV</option>
                <option>PDF</option>
              </select>
            </div>
          </div>
          <Button label="Generate Report" variant="primary" />
        </div>
      </div>
    </div>
  )
}
