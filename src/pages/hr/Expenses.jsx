import { useState } from 'react'
import Swal from 'sweetalert2'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { HiCheck, HiXMark, HiEye, HiDocument } from 'react-icons/hi2'

export default function Expenses() {
  const [activeTab, setActiveTab] = useState('pending')
  const [comment, setComment] = useState('')
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState(null)
  
  const [pendingClaims, setPendingClaims] = useState([
    { id: 1, employee: 'Rohit Shah', category: 'Travel', amount: '₹4,200', date: '05 Apr 2026', description: 'Client visit — auto + train fare' },
  ])
  
  const [history, setHistory] = useState([
    { id: 1, employee: 'Priti Gupta', category: 'Meals', amount: '₹1,800', status: 'Approved', approvedBy: 'Neha Jain', date: '01 Apr 2026' },
    { id: 2, employee: 'Anita Nair', category: 'Communication', amount: '₹600', status: 'Approved', approvedBy: 'Neha Jain', date: '25 Mar 2026' },
    { id: 3, employee: 'Vijay More', category: 'Travel', amount: '₹3,500', status: 'Rejected', approvedBy: 'Neha Jain', date: '18 Mar 2026' },
  ])

  const handleApprove = (claim) => {
    Swal.fire({
      title: 'Approve Expense Claim?',
      text: `Approve ${claim.employee}'s expense claim of ${claim.amount}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setPendingClaims((prev) => prev.filter((c) => c.id !== claim.id))
        setHistory((prev) => [...prev, {
          id: history.length + 1,
          employee: claim.employee,
          category: claim.category,
          amount: claim.amount,
          status: 'Approved',
          approvedBy: 'Current User',
          date: claim.date
        }])
        setComment('')
        Swal.fire({
          icon: 'success',
          title: 'Approved!',
          text: 'Expense claim has been approved.',
          timer: 2000,
          showConfirmButton: false
        })
      }
    })
  }
  
  const handleReject = (claim) => {
    Swal.fire({
      title: 'Reject Expense Claim?',
      text: `Reject ${claim.employee}'s expense claim of ${claim.amount}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reject it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setPendingClaims((prev) => prev.filter((c) => c.id !== claim.id))
        setHistory((prev) => [...prev, {
          id: history.length + 1,
          employee: claim.employee,
          category: claim.category,
          amount: claim.amount,
          status: 'Rejected',
          approvedBy: 'Current User',
          date: claim.date
        }])
        setComment('')
        Swal.fire({
          icon: 'success',
          title: 'Rejected!',
          text: 'Expense claim has been rejected.',
          timer: 2000,
          showConfirmButton: false
        })
      }
    })
  }
  
  const handleView = (claim) => {
    setSelectedClaim(claim)
    setViewModalOpen(true)
  }
  
  const handleCloseViewModal = () => {
    setViewModalOpen(false)
    setSelectedClaim(null)
  }
  
  const handleViewReceipt = (claim) => {
    Swal.fire({
      icon: 'info',
      title: 'Receipt View',
      text: 'Receipt view functionality will be implemented soon.',
      timer: 2000,
      showConfirmButton: false
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Expense Claims</h1>
        <p className="mt-1 text-sm text-text-secondary">Review and approve expense claims</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border-tertiary">
        {[
          { id: 'pending', label: `Pending (${pendingClaims.length})` },
          { id: 'history', label: 'Approved / Rejected' },
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
                { key: 'category', label: 'Category' },
                { key: 'amount', label: 'Amount' },
                { key: 'date', label: 'Date' },
                { key: 'description', label: 'Description' },
                { key: 'receipt', label: 'Receipt' },
                { key: 'action', label: 'Action' },
              ]}
              data={pendingClaims.map(claim => ({
                employee: claim.employee,
                category: <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700">{claim.category}</span>,
                amount: claim.amount,
                date: claim.date,
                description: claim.description,
                receipt: <Button label="View" variant="secondary" size="sm" icon={HiDocument} onClick={() => handleViewReceipt(claim)} />,
                action: (
                  <div className="flex gap-2">
                    <Button label="Approve" variant="success" size="sm" icon={HiCheck} onClick={() => handleApprove(claim)} />
                    <Button label="Reject" variant="danger" size="sm" icon={HiXMark} onClick={() => handleReject(claim)} />
                    <Button label="View" variant="ghost" size="sm" icon={HiEye} onClick={() => handleView(claim)} />
                  </div>
                ),
              }))}
            />
          </div>

          <div className="rounded-xl border border-border-tertiary bg-background-secondary p-6 shadow-sm">
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Approval comment</label>
              <textarea
                rows={2}
                placeholder="Add remark before approving or rejecting..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Button label="Approve Claim" variant="success" icon={HiCheck} onClick={() => {
                if (pendingClaims.length > 0) handleApprove(pendingClaims[0])
              }} />
              <Button label="Reject" variant="danger" icon={HiXMark} onClick={() => {
                if (pendingClaims.length > 0) handleReject(pendingClaims[0])
              }} />
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
              { key: 'category', label: 'Category' },
              { key: 'amount', label: 'Amount' },
              { key: 'status', label: 'Status' },
              { key: 'approvedBy', label: 'Approved By' },
              { key: 'date', label: 'Date' },
            ]}
            data={history.map(h => ({
              employee: h.employee,
              category: h.category,
              amount: h.amount,
              status: <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${h.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{h.status}</span>,
              approvedBy: h.approvedBy,
              date: h.date,
            }))}
          />
        </div>
      )}

      <Modal isOpen={viewModalOpen} onClose={handleCloseViewModal} title="Expense Claim Details" size="md">
        {selectedClaim && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Employee</label>
                <p className="text-sm font-semibold text-gray-900">{selectedClaim.employee}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Category</label>
                <p className="text-sm text-gray-900">{selectedClaim.category}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Amount</label>
                <p className="text-sm font-semibold text-gray-900">{selectedClaim.amount}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Date</label>
                <p className="text-sm text-gray-900">{selectedClaim.date}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Description</label>
              <p className="text-sm text-gray-900">{selectedClaim.description}</p>
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button label="Approve" variant="success" icon={HiCheck} onClick={() => { handleCloseViewModal(); handleApprove(selectedClaim); }} />
              <Button label="Reject" variant="danger" icon={HiXMark} onClick={() => { handleCloseViewModal(); handleReject(selectedClaim); }} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
