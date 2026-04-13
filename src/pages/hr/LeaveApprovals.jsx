import { useState } from 'react'
import Swal from 'sweetalert2'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { HiCheck, HiXMark, HiEye } from 'react-icons/hi2'

export default function LeaveApprovals() {
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [comment, setComment] = useState('')
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  
  const [pendingRequests, setPendingRequests] = useState([
    { id: 1, employee: 'Vijay More', type: 'Annual Leave', from: '12 Apr 2026', to: '14 Apr 2026', days: 3, reason: 'Family function', applied: '07 Apr' },
    { id: 2, employee: 'Seema Patil', type: 'Sick Leave', from: '09 Apr 2026', to: '09 Apr 2026', days: 1, reason: 'Fever', applied: '08 Apr' },
  ])
  
  const [history, setHistory] = useState([
    { id: 1, employee: 'Rohit Shah', type: 'Annual', from: '20 Mar', to: '21 Mar', days: 2, actionBy: 'Neha Jain', status: 'Approved' },
    { id: 2, employee: 'Priti Gupta', type: 'Casual', from: '15 Mar', to: '15 Mar', days: 1, actionBy: 'Neha Jain', status: 'Approved' },
    { id: 3, employee: 'Anita Nair', type: 'Sick', from: '28 Feb', to: '01 Mar', days: 2, actionBy: 'Neha Jain', status: 'Approved' },
    { id: 4, employee: 'Vijay More', type: 'Casual', from: '20 Feb', to: '20 Feb', days: 1, actionBy: 'Neha Jain', status: 'Rejected' },
  ])

  const balance = [
    { id: 1, employee: 'Rohit Shah', annual: 21, used: 7, remaining: 14, sick: 8, casual: 5, compOff: 1 },
    { id: 2, employee: 'Priti Gupta', annual: 21, used: 3, remaining: 18, sick: 10, casual: 7, compOff: 0 },
    { id: 3, employee: 'Anita Nair', annual: 21, used: 15, remaining: 6, sick: 4, casual: 2, compOff: 2 },
    { id: 4, employee: 'Vijay More', annual: 21, used: 12, remaining: 9, sick: 7, casual: 3, compOff: 0 },
    { id: 5, employee: 'Seema Patil', annual: 21, used: 1, remaining: 20, sick: 9, casual: 6, compOff: 1 },
  ]
  
  const handleApprove = (request, commentText = '') => {
    Swal.fire({
      title: 'Approve Leave Request?',
      text: `Approve ${request.employee}'s ${request.type}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== request.id))
        setHistory((prev) => [...prev, {
          id: history.length + 1,
          employee: request.employee,
          type: request.type,
          from: request.from,
          to: request.to,
          days: request.days,
          actionBy: 'Current User',
          status: 'Approved'
        }])
        setSelectedEmployee('')
        setComment('')
        Swal.fire({
          icon: 'success',
          title: 'Approved!',
          text: 'Leave request has been approved.',
          timer: 2000,
          showConfirmButton: false
        })
      }
    })
  }
  
  const handleReject = (request, commentText = '') => {
    Swal.fire({
      title: 'Reject Leave Request?',
      text: `Reject ${request.employee}'s ${request.type}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reject it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== request.id))
        setHistory((prev) => [...prev, {
          id: history.length + 1,
          employee: request.employee,
          type: request.type,
          from: request.from,
          to: request.to,
          days: request.days,
          actionBy: 'Current User',
          status: 'Rejected'
        }])
        setSelectedEmployee('')
        setComment('')
        Swal.fire({
          icon: 'success',
          title: 'Rejected!',
          text: 'Leave request has been rejected.',
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Leave Requests</h1>
        <p className="mt-1 text-sm text-text-secondary">Review and manage team leave requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border-tertiary">
        {[
          { id: 'pending', label: `Pending (${pendingRequests.length})` },
          { id: 'history', label: 'History' },
          { id: 'balance', label: 'Team Balance' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`border-b-2 px-4 py-2 text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-primary-DEFAULT text-primary-DEFAULT font-medium'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
            <Table
              columns={[
                { key: 'employee', label: 'Employee' },
                { key: 'type', label: 'Type' },
                { key: 'from', label: 'From' },
                { key: 'to', label: 'To' },
                { key: 'days', label: 'Days' },
                { key: 'reason', label: 'Reason' },
                { key: 'applied', label: 'Applied' },
                { key: 'action', label: 'Action' },
              ]}
              data={pendingRequests.map(req => ({
                employee: req.employee,
                type: <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${req.type.includes('Annual') ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-700'}`}>{req.type}</span>,
                from: req.from,
                to: req.to,
                days: req.days,
                reason: req.reason,
                applied: req.applied,
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

          <div className="rounded-xl border border-border-tertiary bg-background-secondary p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-text-primary">Reject / Approve with Comment</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-text-secondary">Select Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
                >
                  <option value="">Select...</option>
                  <option value="vijay">Vijay More — Annual Leave</option>
                  <option value="seema">Seema Patil — Sick Leave</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-text-secondary">Comment (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Add a comment or reason..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <Button label="Approve" variant="success" icon={HiCheck} onClick={() => {
                  const request = pendingRequests.find(r => r.employee.includes(selectedEmployee === 'vijay' ? 'Vijay' : 'Seema'))
                  if (request) handleApprove(request, comment)
                }} />
                <Button label="Reject" variant="danger" icon={HiXMark} onClick={() => {
                  const request = pendingRequests.find(r => r.employee.includes(selectedEmployee === 'vijay' ? 'Vijay' : 'Seema'))
                  if (request) handleReject(request, comment)
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
          <Table
            columns={[
              { key: 'employee', label: 'Employee' },
              { key: 'type', label: 'Type' },
              { key: 'from', label: 'From' },
              { key: 'to', label: 'To' },
              { key: 'days', label: 'Days' },
              { key: 'actionBy', label: 'Action By' },
              { key: 'status', label: 'Status' },
            ]}
            data={history.map(h => ({
              employee: h.employee,
              type: h.type,
              from: h.from,
              to: h.to,
              days: h.days,
              actionBy: h.actionBy,
              status: <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${h.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{h.status}</span>,
            }))}
          />
        </div>
      )}

      {/* Balance Tab */}
      {activeTab === 'balance' && (
        <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
          <Table
            columns={[
              { key: 'employee', label: 'Employee' },
              { key: 'annual', label: 'Annual' },
              { key: 'used', label: 'Used' },
              { key: 'remaining', label: 'Remaining' },
              { key: 'sick', label: 'Sick' },
              { key: 'casual', label: 'Casual' },
              { key: 'compOff', label: 'Comp Off' },
            ]}
            data={balance.map(b => ({
              employee: b.employee,
              annual: b.annual,
              used: b.used,
              remaining: b.remaining,
              sick: b.sick,
              casual: b.casual,
              compOff: b.compOff,
            }))}
          />
        </div>
      )}
      <Modal isOpen={viewModalOpen} onClose={handleCloseViewModal} title="Leave Request Details" size="md">
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Employee</label>
                <p className="text-sm font-semibold text-gray-900">{selectedRequest.employee}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Leave Type</label>
                <p className="text-sm font-semibold text-gray-900">{selectedRequest.type}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">From</label>
                <p className="text-sm text-gray-900">{selectedRequest.from}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">To</label>
                <p className="text-sm text-gray-900">{selectedRequest.to}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Days</label>
                <p className="text-sm text-gray-900">{selectedRequest.days}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Applied On</label>
                <p className="text-sm text-gray-900">{selectedRequest.applied}</p>
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
