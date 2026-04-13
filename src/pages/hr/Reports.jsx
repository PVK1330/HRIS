import { useState } from 'react'
import Swal from 'sweetalert2'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { HiSparkles, HiDocumentText } from 'react-icons/hi2'

export default function Reports() {
  const [reportType, setReportType] = useState('Attendance')
  const [fromDate, setFromDate] = useState('2026-04-01')
  const [toDate, setToDate] = useState('2026-04-30')
  const [selectedEmployees, setSelectedEmployees] = useState('All Team Members')
  const [exportFormat, setExportFormat] = useState('Excel (.xlsx)')
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  
  const [reports, setReports] = useState([
    { id: 1, title: 'Attendance Summary', description: 'Monthly team attendance report' },
    { id: 2, title: 'Leave Utilization', description: 'Leave taken vs balance by type' },
    { id: 3, title: 'Performance Summary', description: 'Ratings and goal completion' },
    { id: 4, title: 'Expense Report', description: 'Claims submitted and approved' },
    { id: 5, title: 'Team Headcount', description: 'Active, probation, notice count' },
    { id: 6, title: 'Overtime Log', description: 'Extra hours by employee' },
  ])

  const handleQuickReport = (report) => {
    setSelectedReport(report)
    setPreviewModalOpen(true)
  }
  
  const handleGenerateCustomReport = () => {
    Swal.fire({
      icon: 'success',
      title: 'Report Generated!',
      text: `${reportType} report for ${fromDate} to ${toDate} is being generated in ${exportFormat} format.`,
      timer: 3000,
      showConfirmButton: false
    })
  }
  
  const handleClosePreviewModal = () => {
    setPreviewModalOpen(false)
    setSelectedReport(null)
  }
  
  const handleDownloadReport = (report) => {
    Swal.fire({
      icon: 'success',
      title: 'Downloading...',
      text: `${report.title} is being downloaded.`,
      timer: 2000,
      showConfirmButton: false
    })
    handleClosePreviewModal()
  }

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
            onClick={() => handleQuickReport(report)}
            className="cursor-pointer rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm transition-colors hover:bg-background-secondary"
          >
            <div className="text-sm font-medium text-text-primary">{report.title}</div>
            <div className="mt-1 text-xs text-text-secondary">{report.description}</div>
            <Button label="Generate" variant="primary" size="sm" icon={HiSparkles} className="mt-3" onClick={(e) => {
              e.stopPropagation()
              handleQuickReport(report)
            }} />
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
          <Button label="Generate Report" variant="primary" icon={HiSparkles} onClick={handleGenerateCustomReport} />
        </div>
      </div>

      <Modal isOpen={previewModalOpen} onClose={handleClosePreviewModal} title="Report Preview" size="lg">
        {selectedReport && (
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900">{selectedReport.title}</h3>
              <p className="text-sm text-gray-500">{selectedReport.description}</p>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">Total Records</p>
                  <p className="text-lg font-semibold text-gray-900">24</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">Generated On</p>
                  <p className="text-sm font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs font-medium text-gray-500 mb-2">Report Summary</p>
                <p className="text-gray-700">This report contains comprehensive data related to {selectedReport.title.toLowerCase()}. The data includes all relevant metrics and analytics for the selected period.</p>
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button label="Download Report" variant="primary" icon={HiDocumentText} onClick={() => handleDownloadReport(selectedReport)} />
              <Button label="Cancel" variant="ghost" onClick={handleClosePreviewModal} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
