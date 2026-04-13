import { useState } from 'react'
import Swal from 'sweetalert2'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { HiPlus, HiCheck, HiXMark, HiEye, HiUserPlus } from 'react-icons/hi2'

export default function Onboarding() {
  const [activeTab, setActiveTab] = useState('pending')
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    joinDate: '',
    salary: ''
  })
  
  const [pendingCandidates, setPendingCandidates] = useState([
    { id: 1, name: 'Amit Kumar', email: 'amit.kumar@email.com', phone: '+91 98765 43210', position: 'Software Engineer', department: 'Engineering', joinDate: '15 Apr 2026', salary: '₹8,00,000', status: 'Pending' },
    { id: 2, name: 'Priya Sharma', email: 'priya.sharma@email.com', phone: '+91 98765 43211', position: 'Marketing Manager', department: 'Marketing', joinDate: '20 Apr 2026', salary: '₹12,00,000', status: 'Pending' },
  ])
  
  const [completedCandidates, setCompletedCandidates] = useState([
    { id: 3, name: 'Rahul Verma', email: 'rahul.verma@email.com', phone: '+91 98765 43212', position: 'Data Analyst', department: 'Analytics', joinDate: '01 Mar 2026', salary: '₹7,00,000', status: 'Completed' },
  ])
  
  const handleView = (candidate) => {
    setSelectedCandidate(candidate)
    setViewModalOpen(true)
  }
  
  const handleCloseViewModal = () => {
    setViewModalOpen(false)
    setSelectedCandidate(null)
  }
  
  const handleApprove = (candidate) => {
    Swal.fire({
      title: 'Approve Onboarding?',
      text: `Approve ${candidate.name}'s onboarding process?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setPendingCandidates((prev) => prev.filter((c) => c.id !== candidate.id))
        setCompletedCandidates((prev) => [...prev, { ...candidate, status: 'Completed' }])
        Swal.fire({
          icon: 'success',
          title: 'Approved!',
          text: 'Onboarding has been approved successfully.',
          timer: 2000,
          showConfirmButton: false
        })
      }
    })
  }
  
  const handleReject = (candidate) => {
    Swal.fire({
      title: 'Reject Onboarding?',
      text: `Reject ${candidate.name}'s onboarding process?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reject it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setPendingCandidates((prev) => prev.filter((c) => c.id !== candidate.id))
        Swal.fire({
          icon: 'success',
          title: 'Rejected!',
          text: 'Onboarding has been rejected.',
          timer: 2000,
          showConfirmButton: false
        })
      }
    })
  }
  
  const handleAddCandidate = () => {
    if (!formData.name || !formData.email || !formData.position || !formData.joinDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields.',
        timer: 2000,
        showConfirmButton: false
      })
      return
    }
    
    setPendingCandidates((prev) => [...prev, {
      id: pendingCandidates.length + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      position: formData.position,
      department: formData.department,
      joinDate: formData.joinDate,
      salary: formData.salary,
      status: 'Pending'
    }])
    
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      joinDate: '',
      salary: ''
    })
    
    setAddModalOpen(false)
    
    Swal.fire({
      icon: 'success',
      title: 'Added!',
      text: 'New candidate has been added successfully.',
      timer: 2000,
      showConfirmButton: false
    })
  }
  
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Onboarding</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage new employee onboarding process</p>
        </div>
        <Button label="Add Candidate" variant="primary" icon={HiPlus} onClick={() => setAddModalOpen(true)} />
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border-tertiary">
        {[
          { id: 'pending', label: `Pending (${pendingCandidates.length})` },
          { id: 'completed', label: `Completed (${completedCandidates.length})` },
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
        <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
          <Table
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              { key: 'position', label: 'Position' },
              { key: 'department', label: 'Department' },
              { key: 'joinDate', label: 'Join Date' },
              { key: 'salary', label: 'Salary' },
              { key: 'status', label: 'Status' },
              { key: 'action', label: 'Action' },
            ]}
            data={pendingCandidates.map(candidate => ({
              name: candidate.name,
              email: candidate.email,
              phone: candidate.phone,
              position: candidate.position,
              department: candidate.department,
              joinDate: candidate.joinDate,
              salary: candidate.salary,
              status: <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800">{candidate.status}</span>,
              action: (
                <div className="flex gap-2">
                  <Button label="View" variant="ghost" size="sm" icon={HiEye} onClick={() => handleView(candidate)} />
                  <Button label="Approve" variant="success" size="sm" icon={HiCheck} onClick={() => handleApprove(candidate)} />
                  <Button label="Reject" variant="danger" size="sm" icon={HiXMark} onClick={() => handleReject(candidate)} />
                </div>
              ),
            }))}
          />
        </div>
      )}

      {/* Completed Tab */}
      {activeTab === 'completed' && (
        <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
          <Table
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              { key: 'position', label: 'Position' },
              { key: 'department', label: 'Department' },
              { key: 'joinDate', label: 'Join Date' },
              { key: 'salary', label: 'Salary' },
              { key: 'status', label: 'Status' },
              { key: 'action', label: 'Action' },
            ]}
            data={completedCandidates.map(candidate => ({
              name: candidate.name,
              email: candidate.email,
              phone: candidate.phone,
              position: candidate.position,
              department: candidate.department,
              joinDate: candidate.joinDate,
              salary: candidate.salary,
              status: <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">{candidate.status}</span>,
              action: (
                <div className="flex gap-2">
                  <Button label="View" variant="ghost" size="sm" icon={HiEye} onClick={() => handleView(candidate)} />
                </div>
              ),
            }))}
          />
        </div>
      )}

      {/* View Modal */}
      <Modal isOpen={viewModalOpen} onClose={handleCloseViewModal} title="Candidate Details" size="md">
        {selectedCandidate && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Name</label>
                <p className="text-sm font-semibold text-gray-900">{selectedCandidate.name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900">{selectedCandidate.email}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Phone</label>
                <p className="text-sm text-gray-900">{selectedCandidate.phone}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Position</label>
                <p className="text-sm text-gray-900">{selectedCandidate.position}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Department</label>
                <p className="text-sm text-gray-900">{selectedCandidate.department}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Join Date</label>
                <p className="text-sm text-gray-900">{selectedCandidate.joinDate}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Salary</label>
                <p className="text-sm font-semibold text-gray-900">{selectedCandidate.salary}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Status</label>
                <p className="text-sm text-gray-900">{selectedCandidate.status}</p>
              </div>
            </div>
            {selectedCandidate.status === 'Pending' && (
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Button label="Approve" variant="success" icon={HiCheck} onClick={() => { handleCloseViewModal(); handleApprove(selectedCandidate); }} />
                <Button label="Reject" variant="danger" icon={HiXMark} onClick={() => { handleCloseViewModal(); handleReject(selectedCandidate); }} />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Candidate Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Candidate" size="md">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">Full Name *</label>
            <Input placeholder="Enter full name" value={formData.name} onChange={(e) => handleFormChange('name', e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">Email *</label>
            <Input type="email" placeholder="Enter email address" value={formData.email} onChange={(e) => handleFormChange('email', e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">Phone</label>
            <Input placeholder="Enter phone number" value={formData.phone} onChange={(e) => handleFormChange('phone', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500">Position *</label>
              <Input placeholder="Job title" value={formData.position} onChange={(e) => handleFormChange('position', e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500">Department</label>
              <Input placeholder="Department" value={formData.department} onChange={(e) => handleFormChange('department', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500">Join Date *</label>
              <Input type="date" value={formData.joinDate} onChange={(e) => handleFormChange('joinDate', e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500">Salary</label>
              <Input placeholder="Annual salary" value={formData.salary} onChange={(e) => handleFormChange('salary', e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button label="Cancel" variant="ghost" onClick={() => setAddModalOpen(false)} />
            <Button label="Add Candidate" variant="primary" icon={HiUserPlus} onClick={handleAddCandidate} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
