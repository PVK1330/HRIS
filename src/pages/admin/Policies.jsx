import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import FileUpload from '../../components/ui/FileUpload.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { policyDocuments, policyKpis } from '../../data/mockData.js'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const initialFormData = {
  policyTitle: '',
  policyCategory: '',
  policyCode: '',
  effectiveDate: '',
  reviewDate: '',
  applicableTo: '',
  department: '',
  version: '',
  summary: '',
  status: '',
}

function statusColor(s) {
  if (s === 'Published') return 'green'
  if (s === 'Draft') return 'orange'
  if (s === 'Review') return 'blue'
  return 'gray'
}

export default function Policies() {
  const [q, setQ] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [files, setFiles] = useState({})

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return policyDocuments
    return policyDocuments.filter((p) => `${p.name} ${p.owner}`.toLowerCase().includes(query))
  }, [q])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'applicableTo' && value !== 'Department') {
        next.department = ''
      }
      return next
    })
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

  const showDepartment = formData.applicableTo === 'Department'

  const columns = [
    { key: 'name', label: 'Policy' },
    { key: 'owner', label: 'Owner' },
    { key: 'updatedAt', label: 'Updated' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => <Button label="Open" variant="ghost" size="sm" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Policies</h1>
          <p className="mt-1 text-sm text-gray-500">Publish updates and track acknowledgements.</p>
        </div>
        <Button label="New policy" variant="primary" onClick={() => setModalOpen(true)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Published" value={policyKpis.published} subtitle="Live documents" color="green" />
        <StatCard title="Pending acknowledgement" value={policyKpis.pendingAck} subtitle="Employees" color="orange" />
        <StatCard title="Overdue" value={policyKpis.overdue} subtitle="Needs follow-up" color="red" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Search"
          name="q"
          placeholder="Policy name or owner…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Add Policy" size="lg">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0">
            Policy details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Policy Title"
              name="policyTitle"
              value={formData.policyTitle}
              onChange={handleFormChange}
              required
            />
            <div className="w-full">
              <label htmlFor="pol-category" className="mb-1 block text-sm font-medium text-gray-700">
                Policy Category
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="pol-category"
                name="policyCategory"
                value={formData.policyCategory}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select category
                </option>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Compliance">Compliance</option>
                <option value="Health & Safety">Health & Safety</option>
                <option value="Code of Conduct">Code of Conduct</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input
              label="Policy Code / Reference"
              name="policyCode"
              value={formData.policyCode}
              onChange={handleFormChange}
              placeholder="POL-001"
            />
            <Input
              label="Effective Date"
              name="effectiveDate"
              type="date"
              value={formData.effectiveDate}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Review Date"
              name="reviewDate"
              type="date"
              value={formData.reviewDate}
              onChange={handleFormChange}
            />
            <div className="w-full">
              <label htmlFor="pol-applicable" className="mb-1 block text-sm font-medium text-gray-700">
                Applicable To
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="pol-applicable"
                name="applicableTo"
                value={formData.applicableTo}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select audience
                </option>
                <option value="All Employees">All Employees</option>
                <option value="Department">Department</option>
                <option value="Role-specific">Role-specific</option>
              </select>
            </div>
            {showDepartment && (
              <div className="col-span-2 w-full">
                <label htmlFor="pol-department" className="mb-1 block text-sm font-medium text-gray-700">
                  Department
                </label>
                <select
                  id="pol-department"
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  className={selectClass}
                >
                  <option value="">Select department</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>
            )}
            <Input
              label="Version"
              name="version"
              value={formData.version}
              onChange={handleFormChange}
              placeholder="v1.0"
            />
            <div className="w-full">
              <label htmlFor="pol-status" className="mb-1 block text-sm font-medium text-gray-700">
                Status
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="pol-status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select status
                </option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="pol-summary" className="mb-1 block text-sm font-medium text-gray-700">
              Summary
            </label>
            <textarea
              id="pol-summary"
              name="summary"
              value={formData.summary}
              onChange={handleFormChange}
              className={textareaClass}
              rows={3}
              placeholder="Short description"
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Document upload
          </p>
          <FileUpload
            label="Policy Document"
            name="policyDocument"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange('policyDocument')}
            helpText="Upload policy PDF or Word doc"
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
