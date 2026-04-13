import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { HiChartBar, HiStar, HiFlag } from 'react-icons/hi2'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

export default function EmployeePerformance() {
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    goalTitle: '',
    goalCategory: '',
    targetDate: '',
    progress: '',
    notes: '',
  })

  const performanceReviews = useMemo(
    () => [
      {
        id: 1,
        period: 'Q1 2026',
        reviewDate: '2026-04-15',
        reviewer: 'Sarah Johnson',
        overallRating: 4.2,
        workQuality: 4.5,
        productivity: 4.0,
        communication: 4.3,
        teamwork: 4.1,
        leadership: 3.8,
        status: 'Completed',
      },
      {
        id: 2,
        period: 'Q4 2025',
        reviewDate: '2026-01-10',
        reviewer: 'Sarah Johnson',
        overallRating: 4.0,
        workQuality: 4.2,
        productivity: 3.9,
        communication: 4.0,
        teamwork: 4.0,
        leadership: 3.5,
        status: 'Completed',
      },
    ],
    []
  )

  const goals = useMemo(
    () => [
      { id: 1, title: 'Complete React certification', category: 'Learning', targetDate: '2026-05-30', progress: 75, status: 'In Progress' },
      { id: 2, title: 'Lead 3 major projects', category: 'Career Growth', targetDate: '2026-06-30', progress: 50, status: 'In Progress' },
      { id: 3, title: 'Improve code review efficiency', category: 'Process', targetDate: '2026-04-30', progress: 90, status: 'On Track' },
      { id: 4, title: 'Mentor 2 junior developers', category: 'Leadership', targetDate: '2026-12-31', progress: 30, status: 'In Progress' },
    ],
    []
  )

  const statusColor = (status) => {
    if (status === 'Completed') return 'green'
    if (status === 'In Progress') return 'blue'
    if (status === 'On Track') return 'green'
    if (status === 'Behind') return 'orange'
    return 'gray'
  }

  const ratingColor = (rating) => {
    if (rating >= 4.5) return 'green'
    if (rating >= 4.0) return 'blue'
    if (rating >= 3.5) return 'orange'
    return 'red'
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setFormData({
      goalTitle: '',
      goalCategory: '',
      targetDate: '',
      progress: '',
      notes: '',
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(formData)
    handleCloseModal()
  }

  const reviewColumns = [
    { key: 'period', label: 'Review Period' },
    { key: 'reviewDate', label: 'Review Date' },
    { key: 'reviewer', label: 'Reviewer' },
    {
      key: 'overallRating',
      label: 'Overall Rating',
      render: (v) => <Badge label={v.toFixed(1)} color={ratingColor(v)} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
  ]

  const goalColumns = [
    { key: 'title', label: 'Goal' },
    { key: 'category', label: 'Category' },
    { key: 'targetDate', label: 'Target Date' },
    {
      key: 'progress',
      label: 'Progress',
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-blue-500" style={{ width: `${v}%` }} />
          </div>
          <span className="text-sm font-medium text-gray-900">{v}%</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Performance</h1>
          <p className="mt-1 text-sm text-gray-500">Track your performance reviews and goals.</p>
        </div>
        <Button label="Add New Goal" variant="primary" onClick={() => setModalOpen(true)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Current Rating" value="4.2" subtitle="Out of 5.0" color="green" icon={HiStar} />
        <StatCard title="Active Goals" value="4" subtitle="In progress" color="blue" icon={HiFlag} />
        <StatCard title="Completed Goals" value="8" subtitle="This year" color="green" icon={HiChartBar} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Performance Breakdown</h2>
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-700">Work Quality</span>
                <span className="font-semibold text-gray-900">4.5/5.0</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-[90%] rounded-full bg-green-500" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-700">Productivity</span>
                <span className="font-semibold text-gray-900">4.0/5.0</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-[80%] rounded-full bg-blue-500" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-700">Communication</span>
                <span className="font-semibold text-gray-900">4.3/5.0</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-[86%] rounded-full bg-green-500" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-700">Teamwork</span>
                <span className="font-semibold text-gray-900">4.1/5.0</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-[82%] rounded-full bg-blue-500" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-700">Leadership</span>
                <span className="font-semibold text-gray-900">3.8/5.0</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-[76%] rounded-full bg-orange-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Goal Progress</h2>
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-700">React Certification</span>
                <span className="font-semibold text-gray-900">75%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-[75%] rounded-full bg-blue-500" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-700">Lead Major Projects</span>
                <span className="font-semibold text-gray-900">50%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-[50%] rounded-full bg-orange-500" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-700">Code Review Efficiency</span>
                <span className="font-semibold text-gray-900">90%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-[90%] rounded-full bg-green-500" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-700">Mentor Junior Developers</span>
                <span className="font-semibold text-gray-900">30%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-[30%] rounded-full bg-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-gray-900">Performance Reviews</h2>
        <Table columns={reviewColumns} data={performanceReviews} pageSize={5} />
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-gray-900">My Goals</h2>
        <Table columns={goalColumns} data={goals} pageSize={5} />
      </div>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Add New Goal" size="md">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Goal Title"
              name="goalTitle"
              value={formData.goalTitle}
              onChange={handleFormChange}
              required
            />
            <div className="w-full">
              <label htmlFor="goal-category" className="mb-1 block text-sm font-medium text-gray-700">
                Category
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="goal-category"
                name="goalCategory"
                value={formData.goalCategory}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select category
                </option>
                <option value="Learning">Learning</option>
                <option value="Career Growth">Career Growth</option>
                <option value="Process">Process</option>
                <option value="Leadership">Leadership</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input
              label="Target Date"
              name="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Initial Progress (%)"
              name="progress"
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={handleFormChange}
              placeholder="0"
            />
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="goal-notes" className="mb-1 block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="goal-notes"
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              className={textareaClass}
              rows={3}
              placeholder="Describe your goal and how you plan to achieve it"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label="Save Goal" variant="primary" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
