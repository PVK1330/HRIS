import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import FileUpload from '../../components/ui/FileUpload.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { employees, performanceKpis } from '../../data/mockData.js'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const RATING_VALUES = ['1', '2', '3', '4', '5']

const initialFormData = {
  employeeId: '',
  reviewPeriod: '',
  reviewType: '',
  reviewerName: '',
  reviewDate: '',
  workQuality: '',
  productivity: '',
  communication: '',
  teamwork: '',
  leadership: '',
  overallRating: '',
  strengths: '',
  areasToImprove: '',
  goalsNextPeriod: '',
}

const reviews = employees.slice(0, 8).map((e, idx) => ({
  id: `pr-${e.id}`,
  employeeId: e.id,
  employee: e.name,
  cycle: 'H1 2026',
  rating: idx % 3 === 0 ? 'Exceeds' : idx % 3 === 1 ? 'Meets' : 'Developing',
  manager: e.manager,
  due: '2026-04-30',
}))

function RatingSelect({ id, label, name, value, onChange }) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select id={id} name={name} value={value} onChange={onChange} className={selectClass}>
        <option value="">Select</option>
        {RATING_VALUES.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function Performance() {
  const [q, setQ] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [files, setFiles] = useState({})

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return reviews
    return reviews.filter((r) => `${r.employee} ${r.manager}`.toLowerCase().includes(query))
  }, [q])

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

  const openAddReview = () => {
    resetModal()
    setModalOpen(true)
  }

  const openReviewFromRow = (row) => {
    setFormData({ ...initialFormData, employeeId: row.employeeId ?? '' })
    setFiles({})
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ formData, files })
    handleCloseModal()
  }

  const columns = [
    { key: 'employee', label: 'Employee' },
    { key: 'cycle', label: 'Cycle' },
    {
      key: 'rating',
      label: 'Rating',
      render: (v) => (
        <Badge
          label={v}
          color={v === 'Exceeds' ? 'green' : v === 'Meets' ? 'blue' : 'orange'}
        />
      ),
    },
    { key: 'manager', label: 'Manager' },
    { key: 'due', label: 'Due' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          label="Open review"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            openReviewFromRow(row)
          }}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Performance</h1>
          <p className="mt-1 text-sm text-gray-500">Review cycles and manager assessments.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button label="Start cycle" variant="secondary" />
          <Button label="Add review" variant="primary" onClick={openAddReview} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Active cycles"
          value={performanceKpis.activeCycles}
          subtitle="Company-wide"
          color="blue"
        />
        <StatCard
          title="Due this month"
          value={performanceKpis.dueThisMonth}
          subtitle="Needs submission"
          color="orange"
        />
        <StatCard
          title="Completed"
          value={performanceKpis.completedLast12Months}
          subtitle="Last 12 months"
          color="green"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Search"
          name="q"
          placeholder="Employee or manager…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Add Review / Set Goal" size="lg">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0">
            Performance review
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 w-full sm:col-span-1">
              <label htmlFor="perf-employee" className="mb-1 block text-sm font-medium text-gray-700">
                Employee
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="perf-employee"
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
              <label htmlFor="perf-period" className="mb-1 block text-sm font-medium text-gray-700">
                Review Period
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="perf-period"
                name="reviewPeriod"
                value={formData.reviewPeriod}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select period
                </option>
                <option value="Q1 2025">Q1 2025</option>
                <option value="Q2 2025">Q2 2025</option>
                <option value="Q3 2025">Q3 2025</option>
                <option value="Q4 2025">Q4 2025</option>
                <option value="Annual 2025">Annual 2025</option>
              </select>
            </div>
            <div className="w-full">
              <label htmlFor="perf-type" className="mb-1 block text-sm font-medium text-gray-700">
                Review Type
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="perf-type"
                name="reviewType"
                value={formData.reviewType}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select type
                </option>
                <option value="Self">Self</option>
                <option value="Manager">Manager</option>
                <option value="Peer">Peer</option>
                <option value="360 Degree">360 Degree</option>
              </select>
            </div>
            <Input
              label="Reviewer Name"
              name="reviewerName"
              value={formData.reviewerName}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Review Date"
              name="reviewDate"
              type="date"
              value={formData.reviewDate}
              onChange={handleFormChange}
              required
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Ratings
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <RatingSelect
              id="perf-rq"
              label="Work Quality"
              name="workQuality"
              value={formData.workQuality}
              onChange={handleFormChange}
            />
            <RatingSelect
              id="perf-prod"
              label="Productivity"
              name="productivity"
              value={formData.productivity}
              onChange={handleFormChange}
            />
            <RatingSelect
              id="perf-comm"
              label="Communication"
              name="communication"
              value={formData.communication}
              onChange={handleFormChange}
            />
            <RatingSelect
              id="perf-team"
              label="Teamwork"
              name="teamwork"
              value={formData.teamwork}
              onChange={handleFormChange}
            />
            <RatingSelect
              id="perf-lead"
              label="Leadership"
              name="leadership"
              value={formData.leadership}
              onChange={handleFormChange}
            />
            <RatingSelect
              id="perf-overall"
              label="Overall Rating"
              name="overallRating"
              value={formData.overallRating}
              onChange={handleFormChange}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Comments
          </p>
          <div className="space-y-3">
            <div className="w-full">
              <label htmlFor="perf-strengths" className="mb-1 block text-sm font-medium text-gray-700">
                Strengths
              </label>
              <textarea
                id="perf-strengths"
                name="strengths"
                value={formData.strengths}
                onChange={handleFormChange}
                className={textareaClass}
                rows={3}
              />
            </div>
            <div className="w-full">
              <label htmlFor="perf-improve" className="mb-1 block text-sm font-medium text-gray-700">
                Areas to Improve
              </label>
              <textarea
                id="perf-improve"
                name="areasToImprove"
                value={formData.areasToImprove}
                onChange={handleFormChange}
                className={textareaClass}
                rows={3}
              />
            </div>
            <div className="w-full">
              <label htmlFor="perf-goals" className="mb-1 block text-sm font-medium text-gray-700">
                Goals for Next Period
              </label>
              <textarea
                id="perf-goals"
                name="goalsNextPeriod"
                value={formData.goalsNextPeriod}
                onChange={handleFormChange}
                className={textareaClass}
                rows={3}
              />
            </div>
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Document
          </p>
          <FileUpload
            label="Review Document / Signed Form"
            name="reviewDocument"
            accept=".pdf,.doc,.docx,.jpg,.png"
            onChange={handleFileChange('reviewDocument')}
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
