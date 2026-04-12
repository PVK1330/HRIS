import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { Toggle } from '../../components/ui/Toggle.jsx'
import { employees, letterTemplates, lettersKpis } from '../../data/mockData.js'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

function suggestReference() {
  const y = new Date().getFullYear()
  const n = Math.floor(1000 + Math.random() * 9000)
  return `REF-${y}-${n}`
}

const initialFormData = {
  employeeId: '',
  letterType: '',
  letterDate: '',
  validUntil: '',
  addressedTo: '',
  referenceNumber: '',
  specialNotes: '',
  authorizedSignatory: '',
  includeCompanyStamp: false,
  includeSignature: false,
}

function statusColor(s) {
  if (s === 'Active') return 'green'
  if (s === 'Draft') return 'orange'
  return 'gray'
}

export default function LettersTemplates() {
  const [q, setQ] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return letterTemplates
    return letterTemplates.filter((t) => `${t.name} ${t.category}`.toLowerCase().includes(query))
  }, [q])

  const openModal = () => {
    setFormData({
      ...initialFormData,
      referenceNumber: suggestReference(),
    })
    setModalOpen(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggle = (name) => (checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setFormData(initialFormData)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ formData })
    handleCloseModal()
  }

  const isCustom = formData.letterType === 'Custom'

  const columns = [
    { key: 'name', label: 'Template' },
    { key: 'category', label: 'Category' },
    { key: 'updatedAt', label: 'Updated' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => <Button label="Generate" variant="ghost" size="sm" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Letters &amp; Templates</h1>
          <p className="mt-1 text-sm text-gray-500">Standard HR letters and merge-ready templates.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button label="New template" variant="outline" />
          <Button label="Generate letter" variant="primary" onClick={openModal} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Templates" value={lettersKpis.templates} subtitle="Library" color="blue" />
        <StatCard title="Generated this month" value={lettersKpis.generatedThisMonth} subtitle="Letters" color="green" />
        <StatCard title="Pending signatures" value={lettersKpis.pendingSignatures} subtitle="Awaiting" color="orange" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Search"
          name="q"
          placeholder="Template name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Generate Letter" size="lg">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0">
            Letter details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 w-full sm:col-span-1">
              <label htmlFor="lt-employee" className="mb-1 block text-sm font-medium text-gray-700">
                Employee
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="lt-employee"
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
              <label htmlFor="lt-type" className="mb-1 block text-sm font-medium text-gray-700">
                Letter Type
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="lt-type"
                name="letterType"
                value={formData.letterType}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select letter type
                </option>
                <option value="Offer Letter">Offer Letter</option>
                <option value="Appointment Letter">Appointment Letter</option>
                <option value="Salary Certificate">Salary Certificate</option>
                <option value="Experience Letter">Experience Letter</option>
                <option value="NOC Letter">NOC Letter</option>
                <option value="Warning Letter">Warning Letter</option>
                <option value="Probation Confirmation">Probation Confirmation</option>
                <option value="Termination Letter">Termination Letter</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <Input
              label="Letter Date"
              name="letterDate"
              type="date"
              value={formData.letterDate}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Valid Until"
              name="validUntil"
              type="date"
              value={formData.validUntil}
              onChange={handleFormChange}
            />
            <Input
              label="Addressed To"
              name="addressedTo"
              value={formData.addressedTo}
              onChange={handleFormChange}
              placeholder="To Whom It May Concern"
            />
            <Input
              label="Reference Number"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleFormChange}
              placeholder="REF-YYYY-####"
            />
            <div className="w-full">
              <label htmlFor="lt-signatory" className="mb-1 block text-sm font-medium text-gray-700">
                Authorized Signatory
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="lt-signatory"
                name="authorizedSignatory"
                value={formData.authorizedSignatory}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select signatory
                </option>
                <option value="HR Manager">HR Manager</option>
                <option value="CEO">CEO</option>
                <option value="Department Head">Department Head</option>
              </select>
            </div>
          </div>

          {isCustom && (
            <div className="mt-3 w-full">
              <label htmlFor="lt-custom" className="mb-1 block text-sm font-medium text-gray-700">
                Special Notes / Custom Content
              </label>
              <textarea
                id="lt-custom"
                name="specialNotes"
                value={formData.specialNotes}
                onChange={handleFormChange}
                className={textareaClass}
                rows={4}
              />
            </div>
          )}

          <div className="mt-4 flex flex-col gap-4">
            <Toggle
              label="Include Company Stamp"
              checked={formData.includeCompanyStamp}
              onChange={handleToggle('includeCompanyStamp')}
            />
            <Toggle
              label="Include Signature"
              checked={formData.includeSignature}
              onChange={handleToggle('includeSignature')}
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
