import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { HiBuildingOffice, HiPencil, HiTrash, HiUsers } from 'react-icons/hi2'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const initialFormData = {
  departmentName: '',
  departmentCode: '',
  departmentHead: '',
  location: '',
  description: '',
  status: 'Active',
}

function statusColor(status) {
  if (status === 'Active') return 'green'
  if (status === 'Inactive') return 'red'
  return 'gray'
}

export default function DepartmentManagement() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [search, setSearch] = useState('')

  const departments = useMemo(
    () => [
      {
        id: 1,
        name: 'IT',
        code: 'IT',
        head: 'John Smith',
        location: 'Dubai',
        employeeCount: 25,
        status: 'Active',
        description: 'Information Technology department',
      },
      {
        id: 2,
        name: 'Human Resources',
        code: 'HR',
        head: 'Sarah Johnson',
        location: 'Dubai',
        employeeCount: 8,
        status: 'Active',
        description: 'Human Resources department',
      },
      {
        id: 3,
        name: 'Finance',
        code: 'FIN',
        head: 'Michael Brown',
        location: 'Dubai',
        employeeCount: 12,
        status: 'Active',
        description: 'Finance department',
      },
      {
        id: 4,
        name: 'Marketing',
        code: 'MKT',
        head: 'Emily Davis',
        location: 'Remote',
        employeeCount: 10,
        status: 'Active',
        description: 'Marketing department',
      },
      {
        id: 5,
        name: 'Operations',
        code: 'OPS',
        head: 'David Wilson',
        location: 'Abu Dhabi',
        employeeCount: 15,
        status: 'Active',
        description: 'Operations department',
      },
    ],
    []
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return departments.filter((d) => {
      if (!query) return true
      return `${d.name} ${d.code} ${d.head}`.toLowerCase().includes(query)
    })
  }, [search])

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
    console.log({ formData, editMode, editingId })
    handleCloseModal()
  }

  const handleEdit = (id) => {
    const dept = departments.find((d) => d.id === id)
    if (dept) {
      setFormData({
        departmentName: dept.name,
        departmentCode: dept.code,
        departmentHead: dept.head,
        location: dept.location,
        description: dept.description,
        status: dept.status,
      })
      setEditMode(true)
      setEditingId(id)
      setModalOpen(true)
    }
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this department?')) {
      console.log('Delete department:', id)
    }
  }

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Department Name' },
    { key: 'head', label: 'Department Head' },
    { key: 'location', label: 'Location' },
    {
      key: 'employeeCount',
      label: 'Employees',
      render: (v) => `${v} employees`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button label="Edit" variant="ghost" size="sm" icon={HiPencil} onClick={() => handleEdit(row.id)} />
          <Button
            label="Delete"
            variant="ghost"
            size="sm"
            icon={HiTrash}
            onClick={() => handleDelete(row.id)}
            disabled={row.employeeCount > 0}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Department Management</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage organizational departments.</p>
        </div>
        <Button label="Add Department" variant="primary" onClick={() => setModalOpen(true)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <HiBuildingOffice className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{departments.length}</div>
              <div className="text-sm text-gray-500">Total Departments</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <HiUsers className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {departments.reduce((acc, d) => acc + d.employeeCount, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Employees</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <HiBuildingOffice className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {departments.filter((d) => d.status === 'Active').length}
              </div>
              <div className="text-sm text-gray-500">Active Departments</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input label="Search" name="search" placeholder="Search departments..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Table columns={columns} data={filtered} pageSize={10} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editMode ? 'Edit Department' : 'Add Department'} size="md">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Department Name"
              name="departmentName"
              value={formData.departmentName}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Department Code"
              name="departmentCode"
              value={formData.departmentCode}
              onChange={handleFormChange}
              placeholder="e.g. IT, HR, FIN"
              required
            />
            <Input
              label="Department Head"
              name="departmentHead"
              value={formData.departmentHead}
              onChange={handleFormChange}
              placeholder="Department manager name"
            />
            <div className="w-full">
              <label htmlFor="dept-location" className="mb-1 block text-sm font-medium text-gray-700">
                Location
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="dept-location"
                name="location"
                value={formData.location}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select location
                </option>
                <option value="Dubai">Dubai</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Remote">Remote</option>
                <option value="UK">UK</option>
                <option value="India">India</option>
              </select>
            </div>
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="dept-description" className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="dept-description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              className={textareaClass}
              rows={3}
              placeholder="Brief description of the department"
            />
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="dept-status" className="mb-1 block text-sm font-medium text-gray-700">
              Status
              <span className="text-red-500"> *</span>
            </label>
            <select
              id="dept-status"
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              className={selectClass}
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label={editMode ? 'Update Department' : 'Create Department'} variant="primary" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
