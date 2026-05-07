import { useState, useMemo } from 'react'
import { 
  HiUsers, 
  HiExclamationTriangle, 
  HiClock, 
  HiMagnifyingGlass, 
  HiAdjustmentsHorizontal, 
  HiXMark, 
  HiIdentification,
  HiGlobeAmericas,
  HiArrowPath
} from 'react-icons/hi2'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import { employees } from '../../../data/mockData.js'

const selectClass =
  'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#0F766E] transition-all duration-200 hover:border-[#0F766E]/50'

const initialFormData = {
  employeeId: '',
  nationality: '',
  passportNumber: '',
  passportIssueDate: '',
  passportExpiryDate: '',
  countryOfIssue: '',
  visaType: '',
  visaNumber: '',
  visaIssueDate: '',
  visaExpiryDate: '',
  issuedBy: '',
  sponsoringEntity: '',
  emiratesIdNumber: '',
  emiratesIdExpiry: '',
}

const allRows = employees.map((e, idx) => ({
  id: `visa-${e.id}`,
  employeeId: e.id,
  employee: e.name,
  empId: e.empId,
  email: e.email,
  nationality: e.nationality,
  department: e.department,
  location: e.location,
  manager: e.manager,
  passportNumber: `P${1000 + idx}`,
  passportExpiry: '2026-06-15',
  visaType: idx % 2 === 0 ? 'Employment' : 'Dependent',
  visaExpiry: '2025-12-20',
  sponsoringEntity: 'Company LLC',
  daysLeft: 45 + idx,
  status: (45 + idx) < 30 ? 'Expired' : (45 + idx) < 90 ? 'Expiring Soon' : 'Valid',
}))

export default function VisaNationality() {
  const { user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [isRenewal, setIsRenewal] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [files, setFiles] = useState({})
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [locFilter, setLocFilter] = useState('')
  const [visaTypeFilter, setVisaTypeFilter] = useState('')
  const [expireDaysFilter, setExpireDaysFilter] = useState('')

  const isHR = user?.role === 'hr_admin' || user?.role === 'admin' || user?.role === 'superadmin'
  const isManager = user?.role === 'manager'

  const clearFilters = () => {
    setSearch('')
    setDeptFilter('')
    setLocFilter('')
    setVisaTypeFilter('')
    setExpireDaysFilter('')
  }

  // 1. Role-based visibility filtering
  const visibleRows = useMemo(() => {
    if (isHR) return allRows
    if (isManager) return allRows.filter(r => r.manager === user.name)
    return allRows.filter(r => r.email === user.email)
  }, [user, isHR, isManager])

  // 2. Dynamic statistics based on visible data
  const stats = useMemo(() => {
    return {
      total: visibleRows.length,
      under90: visibleRows.filter(r => r.daysLeft < 90 && r.daysLeft >= 30).length,
      expired: visibleRows.filter(r => r.daysLeft < 30).length
    }
  }, [visibleRows])

  const deptOptions = useMemo(() => {
    const u = [...new Set(visibleRows.map((e) => e.department))].sort()
    return [{ value: '', label: 'All departments' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [visibleRows])

  const locOptions = useMemo(() => {
    const u = [...new Set(visibleRows.map((e) => e.location))].sort()
    return [{ value: '', label: 'All locations' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [visibleRows])

  const visaTypeOptions = [
    { value: '', label: 'All types' },
    { value: 'Employment', label: 'Employment' },
    { value: 'Residence', label: 'Residence' },
    { value: 'Visit', label: 'Visit' },
    { value: 'Investor', label: 'Investor' },
    { value: 'Student', label: 'Student' },
    { value: 'Dependent', label: 'Dependent' },
  ]

  const expireDaysOptions = [
    { value: '', label: 'All' },
    { value: '30', label: 'Expired (< 30 days)' },
    { value: '90', label: 'Expiring Soon (30-90 days)' },
    { value: '180', label: 'Valid (> 90 days)' },
  ]

  const filtered = useMemo(() => {
    return visibleRows.filter((r) => {
      const q = search.trim().toLowerCase()
      if (q && !`${r.employee} ${r.empId}`.toLowerCase().includes(q)) return false
      if (deptFilter && r.department !== deptFilter) return false
      if (locFilter && r.location !== locFilter) return false
      if (visaTypeFilter && r.visaType !== visaTypeFilter) return false
      if (expireDaysFilter) {
        const days = Number(expireDaysFilter)
        if (days === 30 && r.daysLeft >= 30) return false
        if (days === 90 && (r.daysLeft < 30 || r.daysLeft >= 90)) return false
        if (days === 180 && r.daysLeft < 90) return false
      }
      return true
    })
  }, [visibleRows, search, deptFilter, locFilter, visaTypeFilter, expireDaysFilter])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (key) => (fileList) => {
    setFiles((prev) => ({ ...prev, [key]: fileList }))
  }

  const resetModal = () => {
    setFormData(initialFormData)
    setFiles({})
    setIsRenewal(false)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    resetModal()
  }

  const openAddVisa = () => {
    resetModal()
    setModalOpen(true)
  }

  const openRenewFromRow = (row) => {
    setFormData({
      ...initialFormData,
      employeeId: row.employeeId ?? '',
      nationality: row.nationality ?? '',
      visaType: row.visaType ?? '',
    })
    setFiles({})
    setIsRenewal(true)
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ mode: isRenewal ? 'renew' : 'add', formData, files })
    handleCloseModal()
  }

  const columns = [
    {
      key: 'employee',
      label: 'Employee Name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F766E]/10 text-[#0F766E] font-bold text-xs">
            {row.employee.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.employee}</div>
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{row.empId}</div>
          </div>
        </div>
      ),
    },
    { 
      key: 'nationality', 
      label: 'Nationality',
      render: (v) => (
        <div className="flex items-center gap-2">
          <HiGlobeAmericas className="h-4 w-4 text-slate-400" />
          <span className="text-sm">{v}</span>
        </div>
      )
    },
    { 
      key: 'visaType', 
      label: 'Visa Type',
      render: (v) => (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
          {v}
        </span>
      )
    },
    {
      key: 'visaExpiry',
      label: 'Visa Expiry',
      render: (v) => (
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <HiClock className="h-3.5 w-3.5 text-slate-400" />
          {v}
        </div>
      )
    },
    {
      key: 'passportExpiry',
      label: 'Passport Expiry',
      render: (v) => <span className="text-slate-500 text-sm">{v}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (v, row) => {
        const n = Number(row.daysLeft)
        const label = n < 30 ? 'Expired' : n < 90 ? 'Expiring Soon' : 'Valid'
        const color = n < 30 ? 'red' : n < 90 ? 'orange' : 'green'
        return <Badge label={label} color={color} />
      },
    },
    { key: 'sponsoringEntity', label: 'Sponsor' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        isHR && (
          <Button
            label="Renew"
            variant="primary"
            size="sm"
            className="rounded-full px-4 shadow-md shadow-emerald-500/20"
            onClick={(e) => {
              e.stopPropagation()
              openRenewFromRow(row)
            }}
          />
        )
      ),
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl shadow-emerald-900/20">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Visa &amp; Nationality</h1>
            <p className="mt-2 text-emerald-100/80 text-sm max-w-md leading-relaxed">
              {isHR 
                ? 'Centralized workforce identity management and automated compliance monitoring for global operations.' 
                : 'Monitor your visa status, passport validity, and essential identity documents in one secure location.'}
            </p>
          </div>
          {isHR && (
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 border border-white/10">
                <HiArrowPath className="h-4 w-4" /> Export Report
              </button>
              <button 
                onClick={openAddVisa}
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#0F766E] shadow-lg transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
              >
                + Add Record
              </button>
            </div>
          )}
        </div>
        
        {/* Background Decorative Circles */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-black/5" />
      </div>

      {/* Stats Section */}
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard 
          title={isHR ? "Identity Registry" : "My Documents"} 
          value={stats.total} 
          subtitle={isHR ? "Active organizational records" : "Personal document count"} 
          color="blue" 
          icon={HiUsers}
        />
        <StatCard
          title="Renewal Runway"
          value={stats.under90}
          subtitle="Critical Window (Under 90 Days)"
          color="orange"
          icon={HiClock}
        />
        <StatCard
          title="Compliance Alert"
          value={stats.expired}
          subtitle="Immediate action required"
          color="red"
          icon={HiExclamationTriangle}
        />
      </div>

      {/* Filter Bar */}
      <div className="group relative rounded-2xl border border-slate-200 bg-white/50 p-6 backdrop-blur-xl shadow-sm transition-all hover:shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <HiAdjustmentsHorizontal className="h-5 w-5 text-[#0F766E]" />
            <span className="text-sm font-bold uppercase tracking-widest">Workspace Filters</span>
          </div>
          {(search || deptFilter || locFilter || visaTypeFilter || expireDaysFilter) && (
            <button 
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
            >
              <HiXMark className="h-4 w-4" /> Reset All
            </button>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative group">
            <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Identity</label>
            <div className="relative">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Name or ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {isHR && (
            <>
              <div className="relative group">
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none appearance-none transition-all"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  {deptOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="relative group">
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none appearance-none transition-all"
                  value={locFilter}
                  onChange={(e) => setLocFilter(e.target.value)}
                >
                  {locOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </>
          )}

          <div className="relative group">
            <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visa Category</label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none appearance-none transition-all"
              value={visaTypeFilter}
              onChange={(e) => setVisaTypeFilter(e.target.value)}
            >
              {visaTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div className="relative group">
            <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Risk</label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none appearance-none transition-all"
              value={expireDaysFilter}
              onChange={(e) => setExpireDaysFilter(e.target.value)}
            >
              {expireDaysOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-slate-700">Document Registry ({filtered.length})</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity Intelligence</div>
          </div>
        </div>
        <Table columns={columns} data={filtered} pageSize={5} />
      </div>

      {/* Modal is unchanged as it already has the required fields */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={isRenewal ? 'Renew visa' : 'Add Visa Record'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="pr-1">
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0">
            Personal identity
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 w-full sm:col-span-1">
              <label htmlFor="visa-employee" className="mb-1 block text-sm font-medium text-gray-700">
                Employee
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="visa-employee"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select employee
                </option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.empId})
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Passport Number"
              name="passportNumber"
              value={formData.passportNumber}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Passport Issue Date"
              name="passportIssueDate"
              type="date"
              value={formData.passportIssueDate}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Passport Expiry Date"
              name="passportExpiryDate"
              type="date"
              value={formData.passportExpiryDate}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Country of Issue"
              name="countryOfIssue"
              value={formData.countryOfIssue}
              onChange={handleFormChange}
              required
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Visa details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="w-full">
              <label htmlFor="visa-type" className="mb-1 block text-sm font-medium text-gray-700">
                Visa Type
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="visa-type"
                name="visaType"
                value={formData.visaType}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select visa type
                </option>
                <option value="Employment">Employment</option>
                <option value="Residence">Residence</option>
                <option value="Visit">Visit</option>
                <option value="Investor">Investor</option>
                <option value="Student">Student</option>
                <option value="Dependent">Dependent</option>
              </select>
            </div>
            <Input
              label="Visa Number"
              name="visaNumber"
              value={formData.visaNumber}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Visa Issue Date"
              name="visaIssueDate"
              type="date"
              value={formData.visaIssueDate}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Visa Expiry Date"
              name="visaExpiryDate"
              type="date"
              value={formData.visaExpiryDate}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Issued By"
              name="issuedBy"
              value={formData.issuedBy}
              onChange={handleFormChange}
              placeholder="e.g. GDRFA Dubai"
            />
            <Input
              label="Sponsoring Entity"
              name="sponsoringEntity"
              value={formData.sponsoringEntity}
              onChange={handleFormChange}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Emirates ID
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Emirates ID Number"
              name="emiratesIdNumber"
              value={formData.emiratesIdNumber}
              onChange={handleFormChange}
            />
            <Input
              label="Emirates ID Expiry"
              name="emiratesIdExpiry"
              type="date"
              value={formData.emiratesIdExpiry}
              onChange={handleFormChange}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Documents
          </p>
          <div className="space-y-4">
            <FileUpload
              label="Passport Scan"
              name="passportScan"
              accept=".jpg,.png,.pdf"
              onChange={handleFileChange('passportScan')}
              required
            />
            <FileUpload
              label="Visa Copy"
              name="visaCopy"
              accept=".jpg,.png,.pdf"
              onChange={handleFileChange('visaCopy')}
              required
            />
            <FileUpload
              label="Emirates ID Front"
              name="emiratesIdFront"
              accept=".jpg,.png,.pdf"
              onChange={handleFileChange('emiratesIdFront')}
            />
            <FileUpload
              label="Emirates ID Back"
              name="emiratesIdBack"
              accept=".jpg,.png,.pdf"
              onChange={handleFileChange('emiratesIdBack')}
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label="Save" variant="primary" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
