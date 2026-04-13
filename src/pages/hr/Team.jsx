import { useState } from 'react'
import Swal from 'sweetalert2'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { Avatar } from '../../components/ui/Avatar.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { HiPencil, HiTrash, HiEye, HiPlus } from 'react-icons/hi2'

const selectClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const initialFormData = {
  name: '',
  designation: '',
  joinDate: '',
  status: 'Active',
  dateOfBirth: '',
  phone: '',
  email: '',
  location: '',
  confirmationDate: '',
  employmentType: 'Full-Time',
  noticePeriod: '30 days',
  goalsProgress: 0,
}

function statusColor(status) {
  if (status === 'Active') return 'green'
  if (status === 'Probation') return 'orange'
  if (status === 'Notice') return 'red'
  return 'gray'
}

export default function Team() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [employees, setEmployees] = useState([
    { id: 'EMP018', name: 'Rohit Shah', designation: 'Sales Executive', joinDate: '15 Oct 2024', status: 'Active', goalsProgress: 75, dateOfBirth: '12 May 1998', phone: '+91 98123 45678', email: 'rohit@hrmatrix.com', location: 'Mumbai', confirmationDate: '15 Apr 2026', employmentType: 'Full-Time', noticePeriod: '30 days' },
    { id: 'EMP022', name: 'Priti Gupta', designation: 'Sr. Sales Exec', joinDate: '03 Jan 2023', status: 'Active', goalsProgress: 90, dateOfBirth: '08 Aug 1995', phone: '+91 98765 43210', email: 'priti@hrmatrix.com', location: 'Delhi', confirmationDate: '03 Jul 2023', employmentType: 'Full-Time', noticePeriod: '30 days' },
    { id: 'EMP031', name: 'Anita Nair', designation: 'Marketing Exec', joinDate: '20 Jun 2023', status: 'Active', goalsProgress: 50, dateOfBirth: '15 Nov 1997', phone: '+91 98765 12345', email: 'anita@hrmatrix.com', location: 'Bangalore', confirmationDate: '20 Dec 2023', employmentType: 'Full-Time', noticePeriod: '30 days' },
    { id: 'EMP044', name: 'Vijay More', designation: 'Sales Trainee', joinDate: '01 Feb 2026', status: 'Probation', goalsProgress: 30, dateOfBirth: '22 Mar 2000', phone: '+91 91234 56789', email: 'vijay@hrmatrix.com', location: 'Mumbai', confirmationDate: '01 Aug 2026', employmentType: 'Full-Time', noticePeriod: '30 days' },
  ])

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || emp.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetModal = () => {
    setFormData(initialFormData)
    setEditMode(false)
    setEditingId(null)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    resetModal()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editMode) {
      // Update existing employee
      setEmployees((prev) => 
        prev.map((emp) => 
          emp.id === editingId 
            ? { 
                ...emp, 
                name: formData.name,
                designation: formData.designation,
                joinDate: formData.joinDate,
                status: formData.status,
                dateOfBirth: formData.dateOfBirth,
                phone: formData.phone,
                email: formData.email,
                location: formData.location,
                confirmationDate: formData.confirmationDate,
                employmentType: formData.employmentType,
                noticePeriod: formData.noticePeriod,
                goalsProgress: parseInt(formData.goalsProgress) || 0
              } 
            : emp
        )
      )
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Team member updated successfully!',
        timer: 2000,
        showConfirmButton: false
      })
    } else {
      // Add new team member
      const newId = `EMP${String(employees.length + 18).padStart(3, '0')}`
      const newEmployee = {
        id: newId,
        name: formData.name,
        designation: formData.designation,
        joinDate: formData.joinDate,
        status: formData.status,
        goalsProgress: parseInt(formData.goalsProgress) || 0,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone,
        email: formData.email,
        location: formData.location,
        confirmationDate: formData.confirmationDate,
        employmentType: formData.employmentType,
        noticePeriod: formData.noticePeriod,
      }
      setEmployees((prev) => [...prev, newEmployee])
      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'Team member added successfully!',
        timer: 2000,
        showConfirmButton: false
      })
    }
    
    handleCloseModal()
  }

  const handleView = (employee) => {
    setSelectedEmployee(employee)
    setViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setViewModalOpen(false)
    setSelectedEmployee(null)
  }

  const handleEdit = (employee) => {
    setFormData({
      name: employee.name,
      designation: employee.designation,
      joinDate: employee.joinDate,
      status: employee.status,
      dateOfBirth: employee.dateOfBirth,
      phone: employee.phone,
      email: employee.email,
      location: employee.location,
      confirmationDate: employee.confirmationDate,
      employmentType: employee.employmentType,
      noticePeriod: employee.noticePeriod,
      goalsProgress: employee.goalsProgress.toString(),
    })
    setEditMode(true)
    setEditingId(employee.id)
    setModalOpen(true)
    setSelectedEmployee(null)
    setViewModalOpen(false)
  }

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setEmployees((prev) => prev.filter((emp) => emp.id !== id))
        setSelectedEmployee(null)
        setViewModalOpen(false)
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Team member removed successfully!',
          timer: 2000,
          showConfirmButton: false
        })
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Team</h1>
        <p className="mt-1 text-sm text-text-secondary">Manage team members and their performance</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search team member..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-[220px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
          style={{ width: '130px' }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="probation">Probation</option>
          <option value="notice">Notice</option>
        </select>
        <Button label="Add Member" variant="primary" size="sm" icon={HiPlus} onClick={() => { resetModal(); setModalOpen(true) }} />
      </div>

      {/* Employee Table */}
      <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
        <Table
          columns={[
            { key: 'employee', label: 'Employee' },
            { key: 'id', label: 'ID' },
            { key: 'designation', label: 'Designation' },
            { key: 'joinDate', label: 'Join Date' },
            { key: 'status', label: 'Status' },
            { key: 'goals', label: 'Goals' },
            { key: 'action', label: 'Action' },
          ]}
          data={filteredEmployees.map(emp => ({
            employee: (
              <div className="flex items-center gap-2">
                <Avatar name={emp.name} />
                <span>{emp.name}</span>
              </div>
            ),
            id: emp.id,
            designation: emp.designation,
            joinDate: emp.joinDate,
            status: <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${emp.status === 'Active' ? 'bg-green-100 text-green-700' : emp.status === 'Probation' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>{emp.status}</span>,
            goals: (
              <div className="flex items-center gap-2">
                <div className="h-2 w-20 rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${emp.goalsProgress}%` }} />
                </div>
                <span className="text-xs text-gray-500">{emp.goalsProgress}%</span>
              </div>
            ),
            action: (
              <div className="flex gap-2">
                <Button label="View" variant="ghost" size="sm" icon={HiEye} onClick={() => handleView(emp)} />
                <Button label="Edit" variant="ghost" size="sm" icon={HiPencil} onClick={() => handleEdit(emp)} />
                <Button label="Delete" variant="ghost" size="sm" icon={HiTrash} onClick={() => handleDelete(emp.id)} />
              </div>
            ),
          }))}
        />
      </div>

      <Modal isOpen={viewModalOpen} onClose={handleCloseViewModal} title="Employee Profile" size="md">
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <Avatar name={selectedEmployee.name} />
              <div>
                <h3 className="font-semibold text-gray-900">{selectedEmployee.name}</h3>
                <p className="text-sm text-gray-500">{selectedEmployee.id} • {selectedEmployee.designation}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Personal</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date of Birth</span>
                    <span className="text-gray-900">{selectedEmployee.dateOfBirth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span className="text-gray-900">{selectedEmployee.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="text-blue-600">{selectedEmployee.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location</span>
                    <span className="text-gray-900">{selectedEmployee.location}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Employment</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Joining Date</span>
                    <span className="text-gray-900">{selectedEmployee.joinDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Confirmation</span>
                    <span className="text-gray-900">{selectedEmployee.confirmationDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Employment Type</span>
                    <span className="text-gray-900">{selectedEmployee.employmentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Notice Period</span>
                    <span className="text-gray-900">{selectedEmployee.noticePeriod}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button label="Edit" variant="secondary" icon={HiPencil} onClick={() => handleEdit(selectedEmployee)} />
              <Button label="Write Review" variant="secondary" />
              <Button label="Generate Letter" variant="secondary" />
              <Button label="Initiate Exit" variant="danger" />
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editMode ? 'Edit Team Member' : 'Add Team Member'} size="lg">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Designation"
              name="designation"
              value={formData.designation}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Join Date"
              name="joinDate"
              type="date"
              value={formData.joinDate}
              onChange={handleFormChange}
              required
            />
            <div className="w-full">
              <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
              <select
                className={selectClass}
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Probation">Probation</option>
                <option value="Notice">Notice</option>
              </select>
            </div>
            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleFormChange}
            />
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
            />
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleFormChange}
            />
            <Input
              label="Confirmation Date"
              name="confirmationDate"
              type="date"
              value={formData.confirmationDate}
              onChange={handleFormChange}
            />
            <div className="w-full">
              <label className="mb-1 block text-sm font-medium text-gray-700">Employment Type</label>
              <select
                className={selectClass}
                name="employmentType"
                value={formData.employmentType}
              onChange={handleFormChange}
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
            <Input
              label="Notice Period"
              name="noticePeriod"
              value={formData.noticePeriod}
              onChange={handleFormChange}
            />
            <Input
              label="Goals Progress (%)"
              name="goalsProgress"
              type="number"
              min="0"
              max="100"
              value={formData.goalsProgress}
              onChange={handleFormChange}
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label={editMode ? 'Update' : 'Save'} variant="primary" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
