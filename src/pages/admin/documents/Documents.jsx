import { useMemo, useState } from 'react'
import { HiArrowDownTray } from 'react-icons/hi2'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { employees } from '../../../data/mockData.js'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const mandatoryDocuments = [
  'Passport',
  'National ID',
  'Education Certificates',
  'Contract',
  'Offer Letter',
  'Experience Letters',
]

const docRows = employees.slice(0, 8).map((e, idx) => ({
  id: `doc-${e.id}`,
  employee: e.name,
  empId: e.empId,
  department: e.department,
  docType: idx % 3 === 0 ? 'Contract' : idx % 3 === 1 ? 'National ID' : 'Passport',
  version: `v${1 + (idx % 3)}`,
  updated: '2026-04-04',
  status: idx % 4 === 0 ? 'Pending' : idx % 4 === 1 ? 'Submitted' : idx % 4 === 2 ? 'Rejected' : 'Approved',
  hrComments: idx % 4 === 2 ? 'Please provide clearer scan' : '',
  submittedDate: '2026-04-01',
}))

const initialFormData = {
  employeeId: '',
  documentType: '',
  documentTitle: '',
  documentNumber: '',
  issueDate: '',
  expiryDate: '',
  issuedBy: '',
  notes: '',
}

export default function Documents() {
  const [q, setQ] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [files, setFiles] = useState({})

  const deptOptions = useMemo(() => {
    const u = [...new Set(employees.map((e) => e.department))].sort()
    return [{ value: '', label: 'All departments' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [])

  const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Submitted', label: 'Submitted' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
  ]

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return docRows.filter((r) => {
      if (query && !`${r.employee} ${r.empId}`.toLowerCase().includes(query)) return false
      if (deptFilter && r.department !== deptFilter) return false
      if (statusFilter && r.status !== statusFilter) return false
      return true
    })
  }, [q, deptFilter, statusFilter])

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
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    resetModal()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ formData, files })
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
    { key: 'department', label: 'Department' },
    { key: 'docType', label: 'Document Type' },
    { key: 'version', label: 'Version' },
    { key: 'submittedDate', label: 'Submitted' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        const color = v === 'Pending' ? 'orange' : v === 'Rejected' ? 'red' : v === 'Approved' ? 'green' : 'blue'
        return <Badge label={v} color={color} />
      },
    },
    {
      key: 'hrComments',
      label: 'HR Comments',
      render: (v) => <span className="text-xs text-gray-600">{v || '-'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button label="View" variant="ghost" size="sm" />
          <Button label="Download" variant="ghost" size="sm" icon={HiArrowDownTray} />
          {row.status === 'Pending' && <Button label="Approve" variant="outline" size="sm" />}
          {row.status === 'Pending' && <Button label="Reject" variant="ghost" size="sm" />}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">Contracts, IDs, and acknowledgements.</p>
        </div>
        <Button label="Upload document" variant="primary" onClick={() => setModalOpen(true)} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Search"
            name="q"
            placeholder="Employee name or ID"
            value={q}
            onChange={(e) => setQ(e.target.value)}
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
            label="Document Status"
            name="status"
            type="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Mandatory Document Checklist</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mandatoryDocuments.map((doc) => (
            <div key={doc} className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                ✓
              </div>
              <span className="text-sm font-medium text-gray-700">{doc}</span>
            </div>
          ))}
        </div>
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Upload Document" size="md">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0">
            Document details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 w-full sm:col-span-1">
              <label htmlFor="doc-employee" className="mb-1 block text-sm font-medium text-gray-700">
                Employee
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="doc-employee"
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
            <div className="w-full">
              <label htmlFor="doc-type" className="mb-1 block text-sm font-medium text-gray-700">
                Document Type
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="doc-type"
                name="documentType"
                value={formData.documentType}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select type
                </option>
                <option value="Passport">Passport</option>
                <option value="Emirates ID">Emirates ID</option>
                <option value="Visa">Visa</option>
                <option value="Offer Letter">Offer Letter</option>
                <option value="Contract">Contract</option>
                <option value="Payslip">Payslip</option>
                <option value="Certificate">Certificate</option>
                <option value="Insurance">Insurance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input
              label="Document Title"
              name="documentTitle"
              value={formData.documentTitle}
              onChange={handleFormChange}
              placeholder="e.g. Passport - John Doe"
              required
            />
            <Input
              label="Document Number"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleFormChange}
            />
            <Input
              label="Issue Date"
              name="issueDate"
              type="date"
              value={formData.issueDate}
              onChange={handleFormChange}
            />
            <Input
              label="Expiry Date"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleFormChange}
            />
            <Input
              label="Issued By / Authority"
              name="issuedBy"
              value={formData.issuedBy}
              onChange={handleFormChange}
            />
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="doc-notes" className="mb-1 block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="doc-notes"
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              className={textareaClass}
              rows={3}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Upload
          </p>
          <FileUpload
            label="Document File"
            name="documentFile"
            accept=".jpg,.png,.pdf,.doc,.docx"
            onChange={handleFileChange('documentFile')}
            helpText="Max 10MB"
            required
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label="Save" variant="primary" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
