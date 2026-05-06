import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { HiFolder, HiPencil, HiTrash, HiUsers, HiCalendar, HiPlus, HiCheck } from 'react-icons/hi2'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const initialFormData = {
  projectName: '',
  projectCode: '',
  department: '',
  projectManager: '',
  startDate: '',
  endDate: '',
  budget: '',
  description: '',
  status: 'Active',
}

function statusColor(status) {
  if (status === 'Active') return 'green'
  if (status === 'On Hold') return 'orange'
  if (status === 'Completed') return 'blue'
  if (status === 'Cancelled') return 'red'
  return 'gray'
}

export default function ProjectManagement() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('')
  const [status, setStatus] = useState('')
  const [projectList, setProjectList] = useState([
    {
      id: 1,
      name: 'HRIS Platform',
      code: 'HRIS-001',
      department: 'IT',
      manager: 'John Smith',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      budget: 500000,
      teamSize: 15,
      status: 'Active',
      description: 'Complete HRIS platform development',
    },
    {
      id: 2,
      name: 'Mobile App Development',
      code: 'MOB-002',
      department: 'IT',
      manager: 'Sarah Johnson',
      startDate: '2026-03-01',
      endDate: '2026-09-30',
      budget: 300000,
      teamSize: 8,
      status: 'Active',
      description: 'Mobile application for HRIS',
    },
    {
      id: 3,
      name: 'Website Redesign',
      code: 'WEB-003',
      department: 'Marketing',
      manager: 'Emily Davis',
      startDate: '2026-02-01',
      endDate: '2026-05-31',
      budget: 150000,
      teamSize: 5,
      status: 'Completed',
      description: 'Company website redesign',
    },
    {
      id: 4,
      name: 'Process Automation',
      code: 'OPS-004',
      department: 'Operations',
      manager: 'David Wilson',
      startDate: '2026-04-01',
      endDate: '2026-08-31',
      budget: 200000,
      teamSize: 6,
      status: 'On Hold',
      description: 'Business process automation',
    },
  ])


  const departmentOptions = useMemo(
    () => [
      { value: '', label: 'All departments' },
      { value: 'IT', label: 'IT' },
      { value: 'HR', label: 'HR' },
      { value: 'Finance', label: 'Finance' },
      { value: 'Marketing', label: 'Marketing' },
      { value: 'Operations', label: 'Operations' },
    ],
    []
  )

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'All statuses' },
      { value: 'Active', label: 'Active' },
      { value: 'On Hold', label: 'On Hold' },
      { value: 'Completed', label: 'Completed' },
      { value: 'Cancelled', label: 'Cancelled' },
    ],
    []
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return projectList.filter((p) => {
      if (query && !`${p.name} ${p.code} ${p.manager}`.toLowerCase().includes(query)) return false
      if (dept && p.department !== dept) return false
      if (status && p.status !== status) return false
      return true
    })
  }, [search, dept, status, projectList])

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
      // Update existing project
      setProjectList((prev) => 
        prev.map((proj) => 
          proj.id === editingId 
            ? { 
                ...proj, 
                name: formData.projectName,
                code: formData.projectCode,
                department: formData.department,
                manager: formData.projectManager,
                startDate: formData.startDate,
                endDate: formData.endDate,
                budget: parseFloat(formData.budget) || 0,
                description: formData.description,
                status: formData.status
              } 
            : proj
        )
      )
      alert('Project updated successfully!')
    } else {
      // Add new project
      const newProject = {
        id: projectList.length + 1,
        name: formData.projectName,
        code: formData.projectCode,
        department: formData.department,
        manager: formData.projectManager,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: parseFloat(formData.budget) || 0,
        teamSize: 0,
        status: formData.status,
        description: formData.description
      }
      setProjectList((prev) => [...prev, newProject])
      alert('Project added successfully!')
    }
    
    handleCloseModal()
  }

  const handleEdit = (id) => {
    const project = projectList.find((p) => p.id === id)
    if (project) {
      setFormData({
        projectName: project.name,
        projectCode: project.code,
        department: project.department,
        projectManager: project.manager,
        startDate: project.startDate,
        endDate: project.endDate,
        budget: project.budget.toString(),
        description: project.description,
        status: project.status,
      })
      setEditMode(true)
      setEditingId(id)
      setModalOpen(true)
    }
  }

  const handleDelete = (id) => {
    const project = projectList.find((p) => p.id === id)
    if (project && project.status === 'Completed') {
      alert('Cannot delete completed projects.')
      return
    }
    if (confirm('Are you sure you want to delete this project?')) {
      setProjectList((prev) => prev.filter((p) => p.id !== id))
      alert('Project deleted successfully!')
    }
  }

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Project Name' },
    { key: 'department', label: 'Department' },
    { key: 'manager', label: 'Project Manager' },
    {
      key: 'budget',
      label: 'Budget',
      render: (v) => `AED ${v.toLocaleString()}`,
    },
    {
      key: 'teamSize',
      label: 'Team',
      render: (v) => `${v} members`,
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
          <Button ariaLabel="Edit Project" variant="Approve" size="sm" icon={HiPencil} onClick={() => handleEdit(row.id)} />
          <Button
            ariaLabel="Delete Project"
            variant="danger"
            size="sm"
            icon={HiTrash}
            onClick={() => handleDelete(row.id)}
            disabled={row.status === 'Completed'}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Project Management</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage organizational projects.</p>
        </div>
        <Button label="Add Project" variant="primary" icon={HiPlus} onClick={() => setModalOpen(true)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <HiFolder className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{projectList.length}</div>
              <div className="text-sm text-gray-500">Total Projects</div>
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
                {projectList.reduce((acc, p) => acc + p.teamSize, 0)}
              </div>
              <div className="text-sm text-gray-500">Team Members</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <HiCalendar className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {projectList.filter((p) => p.status === 'Active').length}
              </div>
              <div className="text-sm text-gray-500">Active Projects</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Search" name="search" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Input label="Department" name="dept" type="select" value={dept} onChange={(e) => setDept(e.target.value)} options={departmentOptions} />
          <Input label="Status" name="status" type="select" value={status} onChange={(e) => setStatus(e.target.value)} options={statusOptions} />
        </div>
      </div>

      <Table columns={columns} data={filtered} pageSize={10} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editMode ? 'Edit Project' : 'Add Project'} size="xl">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Project Name"
              name="projectName"
              value={formData.projectName}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Project Code"
              name="projectCode"
              value={formData.projectCode}
              onChange={handleFormChange}
              placeholder="e.g. HRIS-001"
              required
            />
            <div className="w-full">
              <label htmlFor="proj-dept" className="mb-1 block text-sm font-medium text-gray-700">
                Department
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="proj-dept"
                name="department"
                value={formData.department}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select department
                </option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <Input
              label="Project Manager"
              name="projectManager"
              value={formData.projectManager}
              onChange={handleFormChange}
              placeholder="Project manager name"
            />
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleFormChange}
              required
            />
            <Input
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Budget (AED)"
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleFormChange}
              placeholder="0.00"
            />
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="proj-description" className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="proj-description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              className={textareaClass}
              rows={3}
              placeholder="Brief description of the project"
            />
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="proj-status" className="mb-1 block text-sm font-medium text-gray-700">
              Status
              <span className="text-red-500"> *</span>
            </label>
            <select
              id="proj-status"
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              className={selectClass}
              required
            >
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label="Save Project" variant="primary" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
