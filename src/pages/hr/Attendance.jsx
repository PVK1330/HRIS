import { useState } from 'react'
import Swal from 'sweetalert2'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { HiCheck, HiXMark, HiEye, HiArrowDown } from 'react-icons/hi2'

export default function Attendance() {
  const [selectedMonth, setSelectedMonth] = useState('April 2026')
  const [selectedMember, setSelectedMember] = useState('All Members')
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  
  const [regularizationRequests, setRegularizationRequests] = useState([
    { id: 1, employee: 'Seema Patil', date: '07 Apr 2026', originalStatus: 'Late', reason: 'Traffic jam — reached by 10:20 AM', submitted: '07 Apr' },
    { id: 2, employee: 'Vijay More', date: '04 Apr 2026', originalStatus: 'Absent', reason: 'Medical emergency — docs attached', submitted: '05 Apr' },
  ])
  
  const [attendanceLog, setAttendanceLog] = useState([
    { id: 1, employee: 'Rohit Shah', present: 6, absent: 0, late: 1, onLeave: 0, wfh: 1, overtime: '4h' },
    { id: 2, employee: 'Priti Gupta', present: 7, absent: 0, late: 0, onLeave: 0, wfh: 2, overtime: '2h' },
    { id: 3, employee: 'Anita Nair', present: 5, absent: 0, late: 0, onLeave: 2, wfh: 3, overtime: '0' },
    { id: 4, employee: 'Vijay More', present: 4, absent: 1, late: 2, onLeave: 0, wfh: 0, overtime: '0' },
    { id: 5, employee: 'Seema Patil', present: 6, absent: 0, late: 2, onLeave: 0, wfh: 0, overtime: '1h' },
  ])

  const handleApprove = (request) => {
    Swal.fire({
      title: 'Approve Regularization Request?',
      text: `Approve ${request.employee}'s regularization request?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setRegularizationRequests((prev) => prev.filter((r) => r.id !== request.id))
        Swal.fire({
          icon: 'success',
          title: 'Approved!',
          text: 'Regularization request has been approved.',
          timer: 2000,
          showConfirmButton: false
        })
      }
    })
  }
  
  const handleReject = (request) => {
    Swal.fire({
      title: 'Reject Regularization Request?',
      text: `Reject ${request.employee}'s regularization request?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reject it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setRegularizationRequests((prev) => prev.filter((r) => r.id !== request.id))
        Swal.fire({
          icon: 'success',
          title: 'Rejected!',
          text: 'Regularization request has been rejected.',
          timer: 2000,
          showConfirmButton: false
        })
      }
    })
  }
  
  const handleView = (request) => {
    setSelectedRequest(request)
    setViewModalOpen(true)
  }
  
  const handleCloseViewModal = () => {
    setViewModalOpen(false)
    setSelectedRequest(null)
  }
  
  const handleExport = () => {
    Swal.fire({
      icon: 'info',
      title: 'Export Data',
      text: 'Attendance data export functionality will be implemented soon.',
      timer: 2000,
      showConfirmButton: false
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Attendance Approvals</h1>
        <p className="mt-1 text-sm text-text-secondary">Review attendance and regularization requests</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
          style={{ width: '150px' }}
        >
          <option>April 2026</option>
          <option>March 2026</option>
          <option>February 2026</option>
        </select>
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
          style={{ width: '140px' }}
        >
          <option>All Members</option>
          <option>Rohit Shah</option>
          <option>Seema Patil</option>
          <option>Priti Gupta</option>
        </select>
        <Button label="Export" variant="secondary" size="sm" icon={HiArrowDown} onClick={handleExport} />
      </div>

      {/* Regularization Requests */}
      <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
        <h2 className="text-lg font-bold text-text-primary">Regularization Requests</h2>
        <Table
          columns={[
            { key: 'employee', label: 'Employee' },
            { key: 'date', label: 'Date' },
            { key: 'originalStatus', label: 'Original Status' },
            { key: 'reason', label: 'Reason' },
            { key: 'submitted', label: 'Submitted' },
            { key: 'action', label: 'Action' },
          ]}
          data={regularizationRequests.map(req => ({
            employee: req.employee,
            date: req.date,
            originalStatus: <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${req.originalStatus === 'Late' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>{req.originalStatus}</span>,
            reason: req.reason,
            submitted: req.submitted,
            action: (
              <div className="flex gap-2">
                <Button label="Approve" variant="success" size="sm" icon={HiCheck} onClick={() => handleApprove(req)} />
                <Button label="Reject" variant="danger" size="sm" icon={HiXMark} onClick={() => handleReject(req)} />
                <Button label="View" variant="ghost" size="sm" icon={HiEye} onClick={() => handleView(req)} />
              </div>
            ),
          }))}
        />
      </div>

      {/* Team Attendance Log */}
      <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
        <h2 className="text-lg font-bold text-text-primary">Team Attendance Log — {selectedMonth}</h2>
        <Table
          columns={[
            { key: 'employee', label: 'Employee' },
            { key: 'present', label: 'Present Days' },
            { key: 'absent', label: 'Absent' },
            { key: 'late', label: 'Late' },
            { key: 'onLeave', label: 'On Leave' },
            { key: 'wfh', label: 'WFH' },
            { key: 'overtime', label: 'Overtime Hrs' },
          ]}
          data={attendanceLog.map(log => ({
            employee: log.employee,
            present: log.present,
            absent: log.absent,
            late: log.late,
            onLeave: log.onLeave,
            wfh: log.wfh,
            overtime: log.overtime,
          }))}
        />
      </div>

      <Modal isOpen={viewModalOpen} onClose={handleCloseViewModal} title="Regularization Request Details" size="md">
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Employee</label>
                <p className="text-sm font-semibold text-gray-900">{selectedRequest.employee}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Date</label>
                <p className="text-sm text-gray-900">{selectedRequest.date}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Original Status</label>
                <p className="text-sm text-gray-900">{selectedRequest.originalStatus}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Submitted On</label>
                <p className="text-sm text-gray-900">{selectedRequest.submitted}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Reason</label>
              <p className="text-sm text-gray-900">{selectedRequest.reason}</p>
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button label="Approve" variant="success" icon={HiCheck} onClick={() => { handleCloseViewModal(); handleApprove(selectedRequest); }} />
              <Button label="Reject" variant="danger" icon={HiXMark} onClick={() => { handleCloseViewModal(); handleReject(selectedRequest); }} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
