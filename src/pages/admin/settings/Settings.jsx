import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Toggle } from '../../../components/ui/Toggle.jsx'
import { dashboardStats } from '../../../data/mockData.js'
import { HiBuildingOffice, HiUsers, HiKey, HiCog6Tooth, HiShieldCheck, HiPencil, HiTrash, HiCalendarDays, HiPlus, HiPhoto, HiDevicePhoneMobile, HiQrCode } from 'react-icons/hi2'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const MOCK_LEAVE_TYPES = [
  { id: 1, name: 'Annual Leave', days: 30, carryForward: true, carryLimit: 10, color: 'blue' },
  { id: 2, name: 'Sick Leave', days: 15, carryForward: false, carryLimit: 0, color: 'red' },
  { id: 3, name: 'Maternity Leave', days: 90, carryForward: false, carryLimit: 0, color: 'purple' },
  { id: 4, name: 'Paternity Leave', days: 5, carryForward: false, carryLimit: 0, color: 'orange' },
];

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
  
  // Security settings state
  const [twoFactorAuth, setTwoFactorAuth] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState(true)
  const [ipWhitelist, setIpWhitelist] = useState(false)
  const [passwordComplexity, setPasswordComplexity] = useState(true)
  const [loginMonitoring, setLoginMonitoring] = useState(true)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [faStep, setFaStep] = useState(1)
  
  // Module visibility state
  const [moduleVisibility, setModuleVisibility] = useState({
    employeeDirectory: true,
    attendance: true,
    leave: true,
    performance: true,
    documents: true,
    visa: true,
    departments: true,
    projects: true,
    tasks: true,
    payroll: true
  })
  
  // Attendance & Leave configuration state
  const [workingHours, setWorkingHours] = useState('9:00 AM - 6:00 PM')
  const [workingDays, setWorkingDays] = useState('Monday - Friday')
  const [annualLeaveDays, setAnnualLeaveDays] = useState('30')
  const [sickLeaveDays, setSickLeaveDays] = useState('15')
  
  // Leave Type state
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [editLeaveMode, setEditLeaveMode] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({ name: '', days: '', carryForward: false, carryLimit: 0 });

  // Sensitive data access state
  const [salaryAccess, setSalaryAccess] = useState('Admin Only')
  const [performanceAccess, setPerformanceAccess] = useState('Admin Only')
  const [visaAccess, setVisaAccess] = useState('Admin Only')
  const [contactAccess, setContactAccess] = useState('Admin Only')

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

  const [customRoles, setCustomRoles] = useState([
    { id: 1, name: 'HR Admin', description: 'Full HR module access', userCount: 8, isSystem: true, permissions: ['employee_directory', 'attendance', 'leave', 'performance', 'documents', 'visa', 'departments', 'projects', 'tasks', 'templates', 'reports'] },
    { id: 2, name: 'Manager', description: 'Team management access', userCount: 12, isSystem: true, permissions: ['employee_directory', 'attendance', 'leave', 'performance', 'documents'] },
    { id: 3, name: 'Employee', description: 'Self-service access', userCount: 45, isSystem: true, permissions: ['attendance', 'leave', 'documents'] },
  ])

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

  const handlePermissionToggle = (permission) => {
    setRoleFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission]
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
    if (role && !role.isSystem) {
      setRoleFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions || []
      })
      setEditRoleMode(true)
      setEditingRoleId(id)
      setRoleModalOpen(true)
    }
  }

  const handleDeleteRole = (id) => {
    const role = customRoles.find((r) => r.id === id)
    if (role && !role.isSystem && confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      setCustomRoles((prev) => prev.filter((r) => r.id !== id))
    }
  }

  const handleModuleVisibilityToggle = (module) => {
    setModuleVisibility((prev) => ({ ...prev, [module]: !prev[module] }))
  }

  const handleSaveCompanySettings = () => {
    alert('Company settings saved successfully!')
  }

  const handleSaveSecuritySettings = () => {
    alert('Security settings saved successfully!')
  }

  const handleSaveAttendanceSettings = () => {
    alert('Attendance & Leave settings saved successfully!')
  }

  const handleSaveDataAccessSettings = () => {
    alert('Data access settings saved successfully!')
  }

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    console.log('Leave Type Data:', leaveFormData);
    setLeaveModalOpen(false);
  };

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
          Organization defaults and system configuration.
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'company', label: 'Company Profile', icon: HiBuildingOffice },
          { id: 'team', label: 'Team & Roles', icon: HiUsers },
          { id: 'leave', label: 'Leave Settings', icon: HiCalendarDays },
          { id: 'permissions', label: 'Module Permissions', icon: HiKey },
          { id: 'security', label: 'Security', icon: HiShieldCheck },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'company' && (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold text-gray-900">Company Profile</h2>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-slate-500 px-1 uppercase tracking-widest">Company Logo</label>
                    <div className="relative group overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 flex flex-col items-center justify-center transition-all hover:border-blue-500 hover:bg-white">
                        <img src="/HRIS_Logo.png" alt="Current Logo" className="h-12 w-auto object-contain mb-4 group-hover:scale-105 transition-transform" />
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-900 mb-0.5">Change Logo</p>
                          <p className="text-[9px] text-slate-400">PNG, SVG (Max 1MB)</p>
                        </div>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-slate-500 px-1 uppercase tracking-widest">Favicon Icon</label>
                    <div className="relative group overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 flex flex-col items-center justify-center transition-all hover:border-blue-500 hover:bg-white h-full">
                        <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <img src="/HRIS_Logo.png" alt="Current Favicon" className="h-5 w-5 object-contain" />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-900 mb-0.5">Change Favicon</p>
                          <p className="text-[9px] text-slate-400">ICO, PNG (32x32)</p>
                        </div>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>
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
              <div className="mt-6 flex justify-end">
                <Button label="Save Changes" variant="primary" onClick={handleSaveCompanySettings} />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold text-gray-900">Localization</h2>
              <div className="mt-4 space-y-4">
                 <Input label="Fiscal Year Start" type="select" options={[{value: 'Jan', label: 'January'}]} value="Jan" />
                 <Input label="Currency" type="select" options={[{value: 'AED', label: 'AED (Dirham)'}]} value="AED" />
                 <Input label="Date Format" type="select" options={[{value: 'YYYY-MM-DD', label: 'YYYY-MM-DD'}]} value="YYYY-MM-DD" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-gray-900">Team Members</h2>
              <p className="mt-1 text-sm text-gray-500">Manage team members, roles, and permissions</p>
            </div>
            <Button label="Add Team Member" variant="primary" icon={HiPlus} onClick={() => setTeamModalOpen(true)} />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <Input label="Search" name="search" placeholder="Search team members..." value={searchTeam} onChange={(e) => setSearchTeam(e.target.value)} />
          </div>

          <Table columns={teamColumns} data={filteredTeam} pageSize={10} />

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-gray-900">Roles</h2>
              <Button label="Add Role" variant="outline" size="sm" onClick={() => { resetRoleModal(); setRoleModalOpen(true) }} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {customRoles.map((role) => (
                <div key={role.id} className="rounded-lg border border-gray-200 p-4 relative group">
                  <h3 className="font-bold text-gray-900">{role.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge label={`${role.userCount} Users`} color="blue" />
                    {!role.isSystem && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditRole(role.id)} className="p-1 text-gray-400 hover:text-blue-500"><HiPencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteRole(role.id)} className="p-1 text-gray-400 hover:text-red-500"><HiTrash className="h-4 w-4" /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leave' && (
        <div className="space-y-6">
           <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-gray-900">Leave Policies</h2>
              <p className="mt-1 text-sm text-gray-500">Configure leave types, accruals and carry-forward rules</p>
            </div>
            <Button label="Add Leave Type" variant="primary" icon={HiPlus} onClick={() => { setEditLeaveMode(false); setLeaveModalOpen(true); }} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {MOCK_LEAVE_TYPES.map((type) => (
              <div key={type.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className={`h-12 w-12 rounded-xl bg-${type.color}-100 flex items-center justify-center text-${type.color}-600`}>
                      <HiCalendarDays className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{type.name}</h3>
                      <p className="text-sm text-gray-500">{type.days} Days / Year</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                     <Button variant="ghost" size="sm" icon={HiPencil} onClick={() => { setEditLeaveMode(true); setLeaveModalOpen(true); }} />
                     <Button variant="ghost" size="sm" icon={HiTrash} />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                   <div>
                     <p className="text-xs font-bold text-gray-400 uppercase">Carry Forward</p>
                     <p className="text-sm font-medium mt-1">{type.carryForward ? `Enabled (${type.carryLimit} days)` : 'Disabled'}</p>
                   </div>
                   <div>
                     <p className="text-xs font-bold text-gray-400 uppercase">Accrual Method</p>
                     <p className="text-sm font-medium mt-1">Monthly</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-bold text-gray-900">Module Visibility Control</h2>
            <div className="mt-4 space-y-3">
              {Object.keys(moduleVisibility).map((key) => (
                <Toggle 
                  key={key}
                  checked={moduleVisibility[key]} 
                  onChange={() => handleModuleVisibilityToggle(key)} 
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-bold text-gray-900">Sensitive Data Access</h2>
            <div className="mt-4 space-y-4">
              {['Salary Information', 'Performance Reviews', 'Visa Data'].map((label) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{label}</span>
                  <select className={selectClass} style={{ width: '150px' }}>
                    <option>Admin Only</option>
                    <option>HR Admin</option>
                    <option>Manager</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="max-w-2xl">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
            <h2 className="font-display text-lg font-bold text-gray-900">Security Configuration</h2>
            <div className="space-y-4">
              <Toggle checked={twoFactorAuth} onChange={setTwoFactorAuth} label="Require 2FA for all Admin users" />
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 mt-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                    <HiDevicePhoneMobile className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Personal 2FA</p>
                    <p className="text-[11px] text-slate-500">Configure your authenticator app.</p>
                  </div>
                </div>
                <Button label="Configure" variant="outline" size="sm" onClick={() => { setFaStep(1); setShow2FAModal(true); }} />
              </div>

              <Toggle checked={sessionTimeout} onChange={setSessionTimeout} label="Automatic logout after 30m inactivity" />
              <Toggle checked={passwordComplexity} onChange={setPasswordComplexity} label="Enforce complex password rules" />
              <Toggle checked={loginMonitoring} onChange={setLoginMonitoring} label="Email on new device login" />
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-end">
               <Button label="Update Security Policy" variant="primary" onClick={handleSaveSecuritySettings} />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={teamModalOpen} onClose={() => { resetTeamModal(); setTeamModalOpen(false) }} title={editTeamMode ? 'Edit Team Member' : 'Add Team Member'} size="md">
        <form onSubmit={handleTeamSubmit} className="space-y-4">
          <Input label="Full Name" name="name" value={teamFormData.name} onChange={handleTeamFormChange} required />
          <Input label="Email" name="email" type="email" value={teamFormData.email} onChange={handleTeamFormChange} required />
          <Input label="Role" name="role" type="select" options={[{value: 'HR Admin', label: 'HR Admin'}, {value: 'Manager', label: 'Manager'}]} value={teamFormData.role} onChange={handleTeamFormChange} required />
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={() => setTeamModalOpen(false)} />
            <Button type="submit" label="Save Member" variant="primary" />
          </div>
        </form>
      </Modal>

      <Modal isOpen={leaveModalOpen} onClose={() => setLeaveModalOpen(false)} title={editLeaveMode ? 'Edit Leave Type' : 'Add Leave Type'} size="md">
        <form onSubmit={handleLeaveSubmit} className="space-y-4">
          <Input label="Leave Name" name="name" value={leaveFormData.name} onChange={(e) => setLeaveFormData({...leaveFormData, name: e.target.value})} required placeholder="e.g. Vacation" />
          <Input label="Days Per Year" name="days" type="number" value={leaveFormData.days} onChange={(e) => setLeaveFormData({...leaveFormData, days: e.target.value})} required />
          <div className="flex items-center gap-4 py-2">
            <Toggle checked={leaveFormData.carryForward} onChange={(val) => setLeaveFormData({...leaveFormData, carryForward: val})} label="Enable Carry Forward" />
          </div>
          {leaveFormData.carryForward && (
            <Input label="Carry Forward Limit (Days)" type="number" value={leaveFormData.carryLimit} onChange={(e) => setLeaveFormData({...leaveFormData, carryLimit: e.target.value})} />
          )}
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={() => setLeaveModalOpen(false)} />
            <Button type="submit" label="Save Policy" variant="primary" />
          </div>
        </form>
      </Modal>

      <Modal isOpen={roleModalOpen} onClose={() => setRoleModalOpen(false)} title={editRoleMode ? 'Edit Role' : 'Add Role'} size="lg">
        <form onSubmit={handleRoleSubmit} className="space-y-4">
          <Input label="Role Name" name="name" value={roleFormData.name} onChange={handleRoleFormChange} required />
          <Input label="Description" name="description" value={roleFormData.description} onChange={handleRoleFormChange} />
          <div className="mt-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Module Permissions</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {availablePermissions.map((perm) => (
                <div key={perm.key} className="flex items-center gap-2">
                  <input type="checkbox" id={`perm-${perm.key}`} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <label htmlFor={`perm-${perm.key}`} className="text-sm text-gray-700">{perm.label}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={() => setRoleModalOpen(false)} />
            <Button type="submit" label="Create Role" variant="primary" />
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={show2FAModal} 
        onClose={() => setShow2FAModal(false)} 
        title="Setup Two-Factor Auth"
        size="md"
      >
        <div className="p-2">
          {faStep === 1 ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <HiQrCode className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Scan QR Code</h3>
                <p className="text-sm text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                  Open <strong>Google Authenticator</strong> or your preferred 2FA app to scan the code.
                </p>
              </div>
              
              {/* Live Scannable QR Code */}
              <div className="mx-auto w-44 h-44 bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-xl flex items-center justify-center relative overflow-hidden">
                <img 
                   src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=otpauth://totp/HRIS:Admin?secret=B477H7S8L99S&issuer=HRIS" 
                   alt="Authenticator QR Code" 
                   className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Manual Setup Code</p>
                 <div className="flex items-center justify-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                    <code className="text-xs font-bold text-slate-700">KJHA 82HS 12LK P092</code>
                    <button className="text-indigo-600 text-[10px] font-bold">Copy Code</button>
                 </div>
              </div>

              <div className="flex items-center justify-center gap-4 grayscale opacity-30">
                 <span className="text-[9px] font-bold uppercase tracking-widest border border-slate-900 px-2 py-1 rounded">Google</span>
                 <span className="text-[9px] font-bold uppercase tracking-widest border border-slate-900 px-2 py-1 rounded">Microsoft</span>
                 <span className="text-[9px] font-bold uppercase tracking-widest border border-slate-900 px-2 py-1 rounded">Authy</span>
              </div>

              <Button 
                label="Next: Verify Token" 
                variant="primary" 
                className="w-full py-3 bg-slate-900 rounded-xl" 
                onClick={() => setFaStep(2)}
              />
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <HiShieldCheck className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Verification</h3>
                <p className="text-sm text-slate-500">Enter the 6-digit code from your app.</p>
              </div>

              <div className="flex justify-center gap-2">
                {Array.from({length: 6}).map((_, i) => (
                  <input 
                    key={i}
                    type="text" 
                    maxLength={1}
                    className="w-10 h-12 bg-slate-50 border-2 border-transparent rounded-lg text-center text-lg font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                    placeholder="0"
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button label="Back" variant="ghost" className="flex-1" onClick={() => setFaStep(1)} />
                <Button label="Enable 2FA" variant="primary" className="flex-2 bg-indigo-600 rounded-xl" onClick={() => {
                  alert('2FA enabled!');
                  setShow2FAModal(false);
                }} />
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
