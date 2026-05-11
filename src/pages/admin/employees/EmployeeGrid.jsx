import { useEffect, useMemo, useState } from 'react'
import {
  HiCalendarDays,
  HiChevronDown,
  HiMagnifyingGlass,
  HiPlus,
  HiUsers,
  HiXMark,
} from 'react-icons/hi2'
import Swal from 'sweetalert2'
import { Input } from '../../../components/ui/Input.jsx'
import { getEmployeeStats, getFilterOptions, listEmployees, createEmployee } from '../../../services/employeeService.js'
import { listDesignations } from '../../../services/designationService.js'

const cardProgressColors = ['bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-emerald-500']

const initialFormData = {
  firstName: '',
  lastName: '',
  employeeId: '',
  joiningDate: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  company: '',
  department: '',
  designation: '',
  about: '',
  status: '',
}

function toInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() || '')
    .slice(0, 2)
    .join('')
}

export default function EmployeeGrid() {
  const [employees, setEmployees] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, onLeave: 0 })
  const [filters, setFilters] = useState({ departments: [], statuses: [] })
  const [designationOptions, setDesignationOptions] = useState([])
  const [search, setSearch] = useState('')
  const [designationFilter, setDesignationFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState(initialFormData)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, filterRes, listRes, designationRes] = await Promise.all([
        getEmployeeStats(),
        getFilterOptions(),
        listEmployees({ page: 1, limit: 24 }),
        listDesignations().catch(() => []),
      ])
      setStats(statsRes || { total: 0, active: 0, onLeave: 0 })
      setFilters(filterRes || { departments: [], statuses: [] })
      setDesignationOptions(Array.isArray(designationRes) ? designationRes : [])
      setEmployees(Array.isArray(listRes?.employees) ? listRes.employees : [])
    } catch (err) {
      console.error('Failed to load employee grid data:', err)
      Swal.fire('Error', 'Failed to load employee grid.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!modalOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setModalOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [modalOpen])

  const cards = useMemo(() => {
    return employees
      .filter((e) => {
        const name = String(e.full_name || '').toLowerCase()
        const title = String(e.job_title || '').toLowerCase()
        const q = search.trim().toLowerCase()
        if (q && !`${name} ${title}`.includes(q)) return false
        if (designationFilter && String(e.job_title || '') !== designationFilter) return false
        if (statusFilter && String(e.employment_status || '') !== statusFilter) return false
        return true
      })
      .map((e, idx) => ({
        id: e.id,
        fullName: e.full_name,
        designation: e.job_title || 'Employee',
        initials: toInitials(e.full_name),
        projects: 10 + ((e.id || idx) % 20),
        done: 4 + ((e.id || idx) % 12),
        progress: 2 + ((e.id || idx) % 9),
        productivity: 20 + (((e.id || idx) * 7) % 71),
        progressColor: cardProgressColors[idx % cardProgressColors.length],
      }))
  }, [employees, search, designationFilter, statusFilter])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      Swal.fire('Validation', 'Password and confirm password must match.', 'warning')
      return
    }

    const fullName = `${formData.firstName} ${formData.lastName}`.trim()
    const payload = {
      empId: formData.employeeId,
      fullName,
      jobTitle: formData.designation || 'Employee',
      department: formData.department,
      employmentType: 'Full-time',
      joinDate: formData.joiningDate,
      workEmail: formData.email,
      phoneNumber: formData.phoneNumber || null,
      workLocation: formData.company || null,
      employmentStatus: formData.status || 'Active',
    }

    try {
      await createEmployee(payload)
      Swal.fire('Created!', 'Employee created successfully.', 'success')
      setModalOpen(false)
      setFormData(initialFormData)
      setActiveTab('basic')
      fetchData()
    } catch (err) {
      console.error('Failed to create employee:', err)
      Swal.fire('Error', 'Failed to create employee.', 'error')
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Employees Grid</h1>
            <p className="mt-1 text-sm text-slate-500">Employees &gt; Employees Grid</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Export <HiChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-none bg-[#F97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ea670f]"
            >
              <HiPlus className="h-4 w-4" />
              Add Employee
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {[
            { label: 'Total Employee', value: stats.total || 0, color: 'bg-[#111827]' },
            { label: 'Active', value: stats.active || 0, color: 'bg-emerald-500' },
            { label: 'Inactive', value: Math.max(0, (stats.total || 0) - (stats.active || 0)), color: 'bg-red-500' },
            { label: 'New Joiners', value: Math.max(0, Math.floor((stats.total || 0) * 0.07)), color: 'bg-blue-500' },
          ].map((s) => (
            <div key={s.label} className="border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 ${s.color} inline-flex items-center justify-center text-white`}>
                  <HiUsers className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-400">{s.label}</p>
                  <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">Employees Grid</h2>
            <div className="flex items-center gap-2">
              <select
                value={designationFilter}
                onChange={(e) => setDesignationFilter(e.target.value)}
                className="h-9 min-w-[150px] border border-slate-200 bg-white px-3 text-sm text-slate-700"
              >
                <option value="">Designation</option>
                {designationOptions.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 min-w-[160px] border border-slate-200 bg-white px-3 text-sm text-slate-700"
              >
                <option value="">Sort By : Last 7 Days</option>
                {(filters.statuses || []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search"
                  className="h-9 border border-slate-200 bg-white pl-9 pr-3 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            {(loading ? Array.from({ length: 8 }) : cards).map((c, idx) =>
              loading ? (
                <div key={`sk-${idx}`} className="border border-slate-200 p-4">
                  <div className="h-40 animate-pulse bg-slate-100" />
                </div>
              ) : (
                <div key={c.id} className="border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="h-5 w-5 border border-slate-200" />
                    <button type="button" className="text-slate-400">⋮</button>
                  </div>
                  <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center border-2 border-slate-200 bg-slate-50 text-xl font-bold text-slate-700">
                    {c.initials || 'EM'}
                  </div>
                  <p className="text-center text-sm font-semibold text-slate-900">{c.fullName}</p>
                  <p className="mt-0.5 text-center text-[11px] text-slate-500">{c.designation}</p>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="text-slate-400">Projects</p>
                      <p className="font-semibold text-slate-800">{c.projects}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Done</p>
                      <p className="font-semibold text-slate-800">{c.done}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Progress</p>
                      <p className="font-semibold text-slate-800">{c.progress}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-center text-xs text-slate-500">
                    Productivity : <span className="font-semibold text-slate-800">{c.productivity}%</span>
                  </p>
                  <div className="mt-2 h-1.5 bg-slate-100">
                    <div className={`h-full ${c.progressColor}`} style={{ width: `${c.productivity}%` }} />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            onClick={() => setModalOpen(false)}
            aria-label="Close modal"
          />
          <div className="relative w-full max-w-[900px] overflow-hidden border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-2xl font-semibold text-[#1f2a44]">Add New Employee</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <HiXMark className="h-5 w-5" />
              </button>
            </div>
            <div className="border-b border-slate-200 px-6 pt-3">
              <div className="flex items-center gap-6 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`border-b-2 pb-2 ${activeTab === 'basic' ? 'border-[#F97316] text-[#F97316]' : 'border-transparent text-slate-500'}`}
                >
                  Basic Information
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('permissions')}
                  className={`border-b-2 pb-2 ${activeTab === 'permissions' ? 'border-[#F97316] text-[#F97316]' : 'border-transparent text-slate-500'}`}
                >
                  Permissions
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 px-6 py-5">
                {activeTab === 'basic' ? (
                  <>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                      <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                      <Input label="Employee ID" name="employeeId" value={formData.employeeId} onChange={handleChange} required />
                      <Input label="Joining Date" name="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} required />
                      <Input label="Username" name="username" value={formData.username} onChange={handleChange} />
                      <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                      <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
                      <Input label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
                      <Input label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                      <Input label="Company" name="company" value={formData.company} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Input
                        label="Department Name"
                        name="department"
                        type="select"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        options={(filters.departments || []).map((d) => ({ label: d, value: d }))}
                        placeholder="Select"
                      />
                      <Input
                        label="Designation"
                        name="designation"
                        type="select"
                        value={formData.designation}
                        onChange={handleChange}
                        required
                        options={designationOptions.map((d) => ({ label: d.name, value: d.name }))}
                        placeholder="Select"
                      />
                    </div>
                    <Input
                      label="Status"
                      name="status"
                      type="select"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      options={[
                        { label: 'Active', value: 'Active' },
                        { label: 'Probation', value: 'Probation' },
                        { label: 'On Leave', value: 'On Leave' },
                      ]}
                      placeholder="Select"
                    />
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">About</label>
                      <textarea
                        name="about"
                        value={formData.about}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
                      />
                    </div>
                  </>
                ) : (
                  <div className="rounded-none border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Permissions configuration can be added here based on your RBAC rules.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="inline-flex h-9 items-center justify-center border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center bg-[#F97316] px-5 text-sm font-semibold text-white hover:bg-[#ea670f]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
