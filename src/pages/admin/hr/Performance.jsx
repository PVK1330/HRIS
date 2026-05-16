import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { employees, performanceKpis } from '../../../data/mockData.js'

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
  status: idx % 2 === 0 ? 'Completed' : 'Pending',
  workQuality: idx % 5 === 0 ? 5 : idx % 5 === 1 ? 4 : idx % 5 === 2 ? 3 : idx % 5 === 3 ? 4 : 5,
  productivity: idx % 5 === 0 ? 4 : idx % 5 === 1 ? 5 : idx % 5 === 2 ? 4 : idx % 5 === 3 ? 3 : 4,
  communication: idx % 5 === 0 ? 4 : idx % 5 === 1 ? 4 : idx % 5 === 2 ? 5 : idx % 5 === 3 ? 4 : 5,
  leadership: idx % 5 === 0 ? 5 : idx % 5 === 1 ? 3 : idx % 5 === 2 ? 4 : idx % 5 === 3 ? 4 : 3,
  overallRating: idx % 5 === 0 ? 5 : idx % 5 === 1 ? 4 : idx % 5 === 2 ? 4 : idx % 5 === 3 ? 3 : 4,
  strengths: `${e.name} demonstrates strong ${['technical', 'leadership', 'communication', 'problem-solving'][idx % 4]} skills with excellent attention to detail. Shows great initiative in team projects and consistently delivers high-quality work.`,
  goalsNextPeriod: `Focus on developing ${['advanced technical skills', 'team leadership capabilities', 'cross-functional collaboration', 'strategic planning'][idx % 4]}. Target to complete at least 2 professional development courses and mentor junior team members.`,
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
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [compModalOpen, setCompModalOpen] = useState(false)
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
    setFormData(initialFormData)
    setFiles({})
  }

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false)
    setSelectedReview(null)
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
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedReview(row)
              setDetailModalOpen(true)
            }}
            className="inline-flex w-full h-8 items-center justify-center border border-gray-200 bg-[#0F766E] rounded-xl text-white transition-colors text-sm"
            aria-label="View assessment"
          >
            view details
          </button>
        </div>
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

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Performance Cycle Configuration</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
            <div>
              <div className="font-medium text-gray-900">Q1 2026 Review Cycle</div>
              <div className="text-xs text-gray-500">Jan 1 - Mar 31, 2026 • Active</div>
            </div>
            <Badge label="Active" color="green" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
            <div>
              <div className="font-medium text-gray-900">Q2 2026 Review Cycle</div>
              <div className="text-xs text-gray-500">Apr 1 - Jun 30, 2026 • Upcoming</div>
            </div>
            <Badge label="Upcoming" color="blue" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
            <div>
              <div className="font-medium text-gray-900">Annual 2025 Review Cycle</div>
              <div className="text-xs text-gray-500">Jan 1 - Dec 31, 2025 • Completed</div>
            </div>
            <Badge label="Completed" color="gray" />
          </div>
        </div>
        <div className="mt-4">
          <Button label="Configure New Cycle" variant="secondary" className="w-full" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Performance Analytics</h2>
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-700">Exceeds Expectations</span>
                <span className="font-semibold text-gray-900">35%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-[35%] rounded-full bg-green-500" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-700">Meets Expectations</span>
                <span className="font-semibold text-gray-900">45%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-[45%] rounded-full bg-blue-500" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-700">Needs Improvement</span>
                <span className="font-semibold text-gray-900">15%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-[15%] rounded-full bg-orange-500" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-700">Below Expectations</span>
                <span className="font-semibold text-gray-900">5%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-[5%] rounded-full bg-red-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Department Performance</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  IT
                </div>
                <span className="text-sm font-medium text-gray-900">IT Department</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">4.2</div>
                <div className="text-xs text-gray-500">Avg Rating</div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                  HR
                </div>
                <span className="text-sm font-medium text-gray-900">HR Department</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">4.5</div>
                <div className="text-xs text-gray-500">Avg Rating</div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  FN
                </div>
                <span className="text-sm font-medium text-gray-900">Finance Department</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">4.1</div>
                <div className="text-xs text-gray-500">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Add Review / Set Goal" size="xl">
        <form onSubmit={handleSubmit} className="h-auto overflow-y-auto pr-1">
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

      {/* ── Performance Details View Modal ──────────────────────────────── */}
      <Modal
        isOpen={detailModalOpen}
        onClose={handleCloseDetailModal}
        size="lg"
        showClose
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">
              Performance Review Details
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Employee performance assessment information
            </p>
          </div>
        }
      >
        {selectedReview && (
          <div className="space-y-6 pt-2">
            {/* Employee & Manager Info */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-4">
                <p className="text-xs font-medium text-slate-500 mb-2">Employee Name</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[#0F766E] font-bold text-sm">
                    {selectedReview.employee.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{selectedReview.employee}</div>
                    <div className="text-xs font-medium text-slate-400 uppercase">{selectedReview.empId}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-4">
                <p className="text-xs font-medium text-slate-500 mb-2">Performance Lead/Manager</p>
                <div className="text-sm font-semibold text-slate-900">{selectedReview.manager}</div>
              </div>
            </div>

            {/* Review Period & Cycle */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-4">
                <p className="text-xs font-medium text-slate-500 mb-2">Review Cycle</p>
                <div className="text-sm font-semibold text-slate-900">{selectedReview.cycle}</div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-4">
                <p className="text-xs font-medium text-slate-500 mb-2">Performance Band</p>
                <Badge
                  label={selectedReview.rating}
                  color={selectedReview.rating === 'Outstanding' || selectedReview.rating === 'Exceeds' ? 'green' : selectedReview.rating === 'Meets' ? 'blue' : 'orange'}
                  className="rounded-md"
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-4">
                <p className="text-xs font-medium text-slate-500 mb-2">Status</p>
                <div className="flex items-center">
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold ${selectedReview.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${selectedReview.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {selectedReview.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Competency Ratings */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-4">
              <p className="text-xs font-bold text-slate-600 mb-4 uppercase tracking-wide">Competency Ratings</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { label: 'Work Quality', key: 'workQuality' },
                  { label: 'Productivity', key: 'productivity' },
                  { label: 'Communication', key: 'communication' },
                  { label: 'Leadership', key: 'leadership' },
                  { label: 'Overall Rating', key: 'overallRating' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-md border border-slate-100 bg-white p-3">
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <HiStar
                          key={star}
                          className={`h-4 w-4 ${star <= (selectedReview[item.key] || 0) ? 'text-amber-400' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-4">
                <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Key Contributions</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedReview.strengths || 'No contributions documented.'}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-4">
                <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Growth Objectives</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedReview.goalsNextPeriod || 'No growth objectives documented.'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={handleCloseDetailModal}
                className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-medium text-white hover:bg-[#0d5c56] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
