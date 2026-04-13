import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Toggle } from '../../../components/ui/Toggle.jsx'
import { dashboardStats } from '../../../data/mockData.js'
import { HiBuildingOffice, HiUsers, HiKey, HiCog6Tooth, HiShieldCheck, HiPencil, HiTrash } from 'react-icons/hi2'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

export default function Settings() {
  const [companyName, setCompanyName] = useState('HRIS Holdings')
  const [timezone, setTimezone] = useState('Asia/Dubai')
  const [notify, setNotify] = useState(true)
  const [files, setFiles] = useState({})
  const [activeTab, setActiveTab] = useState('company')
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  const [editTeamMode, setEditTeamMode] = useState(false)
  const [editingTeamId, setEditingTeamId] = useState(null)
  const [teamFormData, setTeamFormData] = useState({ name: '', email: '', role: '', department: '', status: 'Active' })
  const [searchTeam, setSearchTeam] = useState('')
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [editRoleMode, setEditRoleMode] = useState(false)
  const [editingRoleId, setEditingRoleId] = useState(null)
  const [roleFormData, setRoleFormData] = useState({ name: '', description: '', permissions: [] })

  const teamMembers = useMemo(
    () => [
      { id: 1, name: 'Sarah Johnson', email: 'sarah.johnson@hris.com', role: 'HR Admin', department: 'HR', status: 'Active', lastLogin: '2026-04-13' },
      { id: 2, name: 'Michael Brown', email: 'michael.brown@hris.com', role: 'Manager', department: 'IT', status: 'Active', lastLogin: '2026-04-12' },
      { id: 3, name: 'Emily Davis', email: 'emily.davis@hris.com', role: 'HR Admin', department: 'HR', status: 'Active', lastLogin: '2026-04-13' },
      { id: 4, name: 'David Wilson', email: 'david.wilson@hris.com', role: 'Manager', department: 'Operations', status: 'Active', lastLogin: '2026-04-10' },
      { id: 5, name: 'John Smith', email: 'john.smith@hris.com', role: 'Employee', department: 'IT', status: 'Active', lastLogin: '2026-04-13' },
    ],
    []
  )

  const customRoles = useMemo(
    () => [
      { id: 1, name: 'HR Admin', description: 'Full HR module access', userCount: 8, isSystem: true },
      { id: 2, name: 'Manager', description: 'Team management access', userCount: 12, isSystem: true },
      { id: 3, name: 'Employee', description: 'Self-service access', userCount: 45, isSystem: true },
    ],
    []
  )

  const availablePermissions = useMemo(
    () => [
      { key: 'employee_directory', label: 'Employee Directory' },
      { key: 'attendance', label: 'Attendance & Timesheet' },
      { key: 'leave', label: 'Leave Management' },
      { key: 'performance', label: 'Performance Management' },
      { key: 'documents', label: 'Documents' },
      { key: 'visa', label: 'Visa & Nationality' },
      { key: 'departments', label: 'Departments' },
      { key: 'projects', label: 'Projects' },
      { key: 'tasks', label: 'Tasks' },
      { key: 'templates', label: 'Template Generator' },
      { key: 'reports', label: 'Reports' },
      { key: 'settings', label: 'Settings' },
    ],
    []
  )

  const filteredTeam = useMemo(() => {
    const query = searchTeam.trim().toLowerCase()
    return teamMembers.filter((m) => {
      if (!query) return true
      return `${m.name} ${m.email} ${m.role}`.toLowerCase().includes(query)
    })
  }, [searchTeam])

  const handleTeamFormChange = (e) => {
    const { name, value } = e.target
    setTeamFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetTeamModal = () => {
    setTeamFormData({ name: '', email: '', role: '', department: '', status: 'Active' })
    setEditTeamMode(false)
    setEditingTeamId(null)
  }

  const handleTeamSubmit = (e) => {
    e.preventDefault()
    console.log({ teamFormData, editTeamMode, editingTeamId })
    resetTeamModal()
    setTeamModalOpen(false)
  }

  const handleEditTeam = (id) => {
    const member = teamMembers.find((m) => m.id === id)
    if (member) {
      setTeamFormData({
        name: member.name,
        email: member.email,
        role: member.role,
        department: member.department,
        status: member.status,
      })
      setEditTeamMode(true)
      setEditingTeamId(id)
      setTeamModalOpen(true)
    }
  }

  const handleDeleteTeam = (id) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      console.log('Delete team member:', id)
    }
  }

  const handleRoleFormChange = (e) => {
    const { name, value } = e.target
    setRoleFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePermissionToggle = (permissionKey) => {
    setRoleFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionKey)
        ? prev.permissions.filter((p) => p !== permissionKey)
        : [...prev.permissions, permissionKey],
    }))
  }

  const resetRoleModal = () => {
    setRoleFormData({ name: '', description: '', permissions: [] })
    setEditRoleMode(false)
    setEditingRoleId(null)
  }

  const handleRoleSubmit = (e) => {
    e.preventDefault()
    console.log({ roleFormData, editRoleMode, editingRoleId })
    resetRoleModal()
    setRoleModalOpen(false)
  }

  const handleEditRole = (id) => {
    const role = customRoles.find((r) => r.id === id)
    if (role) {
      setRoleFormData({
        name: role.name,
        description: role.description,
        permissions: [],
      })
      setEditRoleMode(true)
      setEditingRoleId(id)
      setRoleModalOpen(true)
    }
  }

  const handleDeleteRole = (id) => {
    if (confirm('Are you sure you want to delete this role?')) {
      console.log('Delete role:', id)
    }
  }

  const teamColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'department', label: 'Department' },
    { key: 'lastLogin', label: 'Last Login' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={v === 'Active' ? 'green' : 'red'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button label="Edit" variant="ghost" size="sm" icon={HiPencil} onClick={() => handleEditTeam(row.id)} />
          <Button label="Delete" variant="ghost" size="sm" icon={HiTrash} onClick={() => handleDeleteTeam(row.id)} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Settings & Permissions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Organization defaults and system configuration. Employees tracked: {dashboardStats.totalEmployees}.
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'company'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Company Profile
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'team'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Team & Roles
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'permissions'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Module Permissions
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'security'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Security
        </button>
      </div>

      {activeTab === 'company' && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold text-gray-900">Company Profile</h2>
              <div className="mt-4 space-y-4">
                <FileUpload
                  label="Company logo"
                  name="companyLogo"
                  accept=".jpg,.jpeg,.png,.webp,.svg"
                  onChange={(fileList) => setFiles((prev) => ({ ...prev, companyLogo: fileList }))}
                  helpText="PNG, JPG, WebP, or SVG. Square image recommended."
                />
                <Input
                  label="Company name"
                  name="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <Input
                  label="Timezone"
                  name="timezone"
                  type="select"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  options={[
                    { value: 'Asia/Dubai', label: 'Asia/Dubai' },
                    { value: 'Asia/Riyadh', label: 'Asia/Riyadh' },
                    { value: 'Europe/London', label: 'Europe/London' },
                    { value: 'America/New_York', label: 'America/New_York' },
                  ]}
                />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold text-gray-900">Notifications & Security</h2>
              <div className="mt-4 space-y-4">
                <Toggle checked={notify} onChange={setNotify} label="Email HR admins for critical alerts" />
                <Toggle checked={true} onChange={() => {}} label="Two-factor authentication required" />
                <Toggle checked={true} onChange={() => {}} label="Session timeout after 30 minutes" />
                <Toggle checked={false} onChange={() => {}} label="IP whitelist enabled" />
                <p className="text-xs text-gray-500">
                  Toggle state is local only (no backend).
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold text-gray-900">Role & Permission Management</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">Super Admin</div>
                    <div className="text-xs text-gray-500">Full system access</div>
                  </div>
                  <Badge label="3 users" color="blue" />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">HR Admin</div>
                    <div className="text-xs text-gray-500">HR module access</div>
                  </div>
                  <Badge label="8 users" color="green" />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">Manager</div>
                    <div className="text-xs text-gray-500">Team management access</div>
                  </div>
                  <Badge label="12 users" color="orange" />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">Employee</div>
                    <div className="text-xs text-gray-500">Self-service access</div>
                  </div>
                  <Badge label="45 users" color="gray" />
                </div>
                <Button label="Manage Roles" variant="secondary" className="w-full" />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold text-gray-900">Module Visibility Control</h2>
              <div className="mt-4 space-y-3">
                <Toggle checked={true} onChange={() => {}} label="Employee Directory" />
                <Toggle checked={true} onChange={() => {}} label="Attendance & Timesheet" />
                <Toggle checked={true} onChange={() => {}} label="Leave Management" />
                <Toggle checked={true} onChange={() => {}} label="Performance Management" />
                <Toggle checked={true} onChange={() => {}} label="Documents" />
                <Toggle checked={true} onChange={() => {}} label="Visa & Nationality" />
                <Toggle checked={false} onChange={() => {}} label="Payroll (Coming Soon)" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold text-gray-900">Sensitive Data Access</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Salary Information</span>
                  <select className={selectClass}>
                    <option>Admin Only</option>
                    <option>HR Admin</option>
                    <option>Manager</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Performance Reviews</span>
                  <select className={selectClass}>
                    <option>Admin Only</option>
                    <option>HR Admin</option>
                    <option>Manager</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Visa & Passport Data</span>
                  <select className={selectClass}>
                    <option>Admin Only</option>
                    <option>HR Admin</option>
                    <option>Manager</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Personal Contact Details</span>
                  <select className={selectClass}>
                    <option>Admin Only</option>
                    <option>HR Admin</option>
                    <option>Manager</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold text-gray-900">Attendance & Leave Configuration</h2>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Working Hours</label>
                  <Input placeholder="9:00 AM - 6:00 PM" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Working Days</label>
                  <select className={selectClass}>
                    <option>Monday - Friday</option>
                    <option>Monday - Saturday</option>
                    <option>Sunday - Thursday</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Annual Leave Days</label>
                  <Input type="number" placeholder="30" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Sick Leave Days</label>
                  <Input type="number" placeholder="15" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-gray-900">Team Members</h2>
              <p className="mt-1 text-sm text-gray-500">Manage team members, roles, and permissions</p>
            </div>
            <Button label="Add Team Member" variant="primary" onClick={() => setTeamModalOpen(true)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <HiUsers className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{teamMembers.length}</div>
                  <div className="text-sm text-gray-500">Total Members</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <HiKey className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{teamMembers.filter((m) => m.role === 'HR Admin').length}</div>
                  <div className="text-sm text-gray-500">HR Admins</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <HiUsers className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{teamMembers.filter((m) => m.role === 'Manager').length}</div>
                  <div className="text-sm text-gray-500">Managers</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <HiUsers className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{teamMembers.filter((m) => m.status === 'Active').length}</div>
                  <div className="text-sm text-gray-500">Active</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <Input label="Search" name="search" placeholder="Search team members..." value={searchTeam} onChange={(e) => setSearchTeam(e.target.value)} />
          </div>

          <Table columns={teamColumns} data={filteredTeam} pageSize={10} />

          <Modal isOpen={teamModalOpen} onClose={() => { resetTeamModal(); setTeamModalOpen(false) }} title={editTeamMode ? 'Edit Team Member' : 'Add Team Member'} size="md">
            <form onSubmit={handleTeamSubmit}>
              <div className="space-y-4">
                <Input label="Full Name" name="name" value={teamFormData.name} onChange={handleTeamFormChange} required />
                <Input label="Email" name="email" type="email" value={teamFormData.email} onChange={handleTeamFormChange} required />
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                  <select className={selectClass} name="role" value={teamFormData.role} onChange={handleTeamFormChange} required>
                    <option value="">Select role</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="HR Admin">HR Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Department</label>
                  <select className={selectClass} name="department" value={teamFormData.department} onChange={handleTeamFormChange} required>
                    <option value="">Select department</option>
                    <option value="HR">HR</option>
                    <option value="IT">IT</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                  <select className={selectClass} name="status" value={teamFormData.status} onChange={handleTeamFormChange} required>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" label="Cancel" variant="ghost" onClick={() => { resetTeamModal(); setTeamModalOpen(false) }} />
                <Button type="submit" label={editTeamMode ? 'Update' : 'Add'} variant="primary" />
              </div>
            </form>
          </Modal>
        </div>
      )}

      {activeTab === 'permissions' && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold text-gray-900">Module Visibility Control</h2>
              <div className="mt-4 space-y-3">
                <Toggle checked={true} onChange={() => {}} label="Employee Directory" />
                <Toggle checked={true} onChange={() => {}} label="Attendance & Timesheet" />
                <Toggle checked={true} onChange={() => {}} label="Leave Management" />
                <Toggle checked={true} onChange={() => {}} label="Performance Management" />
                <Toggle checked={true} onChange={() => {}} label="Documents" />
                <Toggle checked={true} onChange={() => {}} label="Visa & Nationality" />
                <Toggle checked={true} onChange={() => {}} label="Departments" />
                <Toggle checked={true} onChange={() => {}} label="Projects" />
                <Toggle checked={true} onChange={() => {}} label="Tasks" />
                <Toggle checked={false} onChange={() => {}} label="Payroll (Coming Soon)" />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold text-gray-900">Role-Based Access</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">Super Admin</div>
                    <div className="text-xs text-gray-500">Full system access</div>
                  </div>
                  <Badge label="3 users" color="blue" />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">HR Admin</div>
                    <div className="text-xs text-gray-500">HR module access</div>
                  </div>
                  <Badge label="8 users" color="green" />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">Manager</div>
                    <div className="text-xs text-gray-500">Team management access</div>
                  </div>
                  <Badge label="12 users" color="orange" />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">Employee</div>
                    <div className="text-xs text-gray-500">Self-service access</div>
                  </div>
                  <Badge label="45 users" color="gray" />
                </div>
                <Button label="Manage Roles" variant="secondary" className="w-full" onClick={() => setRoleModalOpen(true)} />
              </div>
            </div>
          </div>

          <Modal isOpen={roleModalOpen} onClose={() => { resetRoleModal(); setRoleModalOpen(false) }} title={editRoleMode ? 'Edit Role' : 'Create Role'} size="lg">
            <form onSubmit={handleRoleSubmit}>
              <div className="space-y-4">
                <Input label="Role Name" name="name" value={roleFormData.name} onChange={handleRoleFormChange} required />
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className={textareaClass}
                    name="description"
                    value={roleFormData.description}
                    onChange={handleRoleFormChange}
                    rows={2}
                    placeholder="Brief description of the role"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Permissions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePermissions.map((perm) => (
                      <label key={perm.key} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={roleFormData.permissions.includes(perm.key)}
                          onChange={() => handlePermissionToggle(perm.key)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" label="Cancel" variant="ghost" onClick={() => { resetRoleModal(); setRoleModalOpen(false) }} />
                <Button type="submit" label={editRoleMode ? 'Update Role' : 'Create Role'} variant="primary" />
              </div>
            </form>
          </Modal>
        </>
      )}

      {activeTab === 'security' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-bold text-gray-900">Security Settings</h2>
            <div className="mt-4 space-y-3">
              <Toggle checked={true} onChange={() => {}} label="Two-factor authentication required" />
              <Toggle checked={true} onChange={() => {}} label="Session timeout after 30 minutes" />
              <Toggle checked={false} onChange={() => {}} label="IP whitelist enabled" />
              <Toggle checked={true} onChange={() => {}} label="Password complexity requirements" />
              <Toggle checked={true} onChange={() => {}} label="Login attempt monitoring" />
              <p className="text-xs text-gray-500">Toggle state is local only (no backend).</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-bold text-gray-900">Sensitive Data Access</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Salary Information</span>
                <select className={selectClass}>
                  <option>Admin Only</option>
                  <option>HR Admin</option>
                  <option>Manager</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Performance Reviews</span>
                <select className={selectClass}>
                  <option>Admin Only</option>
                  <option>HR Admin</option>
                  <option>Manager</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Visa & Passport Data</span>
                <select className={selectClass}>
                  <option>Admin Only</option>
                  <option>HR Admin</option>
                  <option>Manager</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Personal Contact Details</span>
                <select className={selectClass}>
                  <option>Admin Only</option>
                  <option>HR Admin</option>
                  <option>Manager</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'company' && (
        <div className="flex justify-end">
          <Button
            label="Save changes"
            variant="secondary"
            onClick={() => console.log({ companyName, timezone, notify, files })}
          />
        </div>
      )}
    </div>
  )
}
