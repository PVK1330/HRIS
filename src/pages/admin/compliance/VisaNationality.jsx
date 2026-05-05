import { useState,useMemo  } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { employees, visaSummary } from '../../../data/mockData.js'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

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

const rows = employees.map((e, idx) => ({
  id: `visa-${e.id}`,
  employeeId: e.id,
  employee: e.name,
  empId: e.empId,
  nationality: e.nationality,
  department: e.department,
  location: e.location,
  passportNumber: `P${1000 + idx}`,
  passportExpiry: '2026-06-15',
  visaType: idx % 2 === 0 ? 'Employment' : 'Dependent',
  visaExpiry: '2025-12-20',
  sponsoringEntity: 'Company LLC',
  daysLeft: 45 + idx,
  status: (45 + idx) < 30 ? 'Expired' : (45 + idx) < 90 ? 'Expiring Soon' : 'Valid',
}))

export default function VisaNationality() {
  const [modalOpen, setModalOpen] = useState(false)
  const [isRenewal, setIsRenewal] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [files, setFiles] = useState({})
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [locFilter, setLocFilter] = useState('')
  const [visaTypeFilter, setVisaTypeFilter] = useState('')
  const [expireDaysFilter, setExpireDaysFilter] = useState('')

  const deptOptions = useMemo(() => {
    const u = [...new Set(employees.map((e) => e.department))].sort()
    return [{ value: '', label: 'All departments' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [])

  const locOptions = useMemo(() => {
    const u = [...new Set(employees.map((e) => e.location))].sort()
    return [{ value: '', label: 'All locations' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [])

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
    return rows.filter((r) => {
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
  }, [search, deptFilter, locFilter, visaTypeFilter, expireDaysFilter])

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
      label: 'Employee',
      render: (_, row) => (
        <div>
          <div className="font-medium text-gray-900">{row.employee}</div>
          <div className="text-xs text-gray-500">{row.empId}</div>
        </div>
      ),
    },
    { key: 'nationality', label: 'Nationality' },
    { key: 'passportNumber', label: 'Passport No.' },
    { key: 'passportExpiry', label: 'Passport Expiry' },
    { key: 'visaType', label: 'Visa Type' },
    { key: 'visaExpiry', label: 'Visa Expiry' },
    { key: 'sponsoringEntity', label: 'Sponsor' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        const color = v === 'Expired' ? 'red' : v === 'Expiring Soon' ? 'orange' : 'green'
        return <Badge label={v} color={color} />
      },
    },
    {
      key: 'daysLeft',
      label: 'Days Left',
      render: (v) => {
        const n = Number(v)
        const color = n < 30 ? 'red' : n < 90 ? 'orange' : 'green'
        return <Badge label={`${n} days`} color={color} />
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          label="Renew"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            openRenewFromRow(row)
          }}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Visa &amp; Nationality</h1>
          <p className="mt-1 text-sm text-gray-500">Track renewals and compliance risk.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button label="Export report" variant="secondary" />
          <Button label="Add visa record" variant="primary" onClick={openAddVisa} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Tracked employees" value={rows.length} subtitle="Mock records" color="blue" />
        <StatCard
          title="Renewals under 90 days"
          value={visaSummary.renewalsUnder90Days}
          subtitle="Needs planning"
          color="orange"
        />
        <StatCard
          title="Completed"
          value={visaSummary.completedLast12Months}
          subtitle="Last 12 months"
          color="green"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <Input
            label="Search"
            name="search"
            placeholder="Name or employee ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Input
            label="Department"
            name="dept"
            type="select"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            options={deptOptions}
          />
          <Input
            label="Location"
            name="loc"
            type="select"
            value={locFilter}
            onChange={(e) => setLocFilter(e.target.value)}
            options={locOptions}
          />
          <Input
            label="Visa Type"
            name="visaType"
            type="select"
            value={visaTypeFilter}
            onChange={(e) => setVisaTypeFilter(e.target.value)}
            options={visaTypeOptions}
          />
          <Input
            label="Expiry Status"
            name="expireDays"
            type="select"
            value={expireDaysFilter}
            onChange={(e) => setExpireDaysFilter(e.target.value)}
            options={expireDaysOptions}
          />
        </div>
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={isRenewal ? 'Renew visa' : 'Add Visa Record'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
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
