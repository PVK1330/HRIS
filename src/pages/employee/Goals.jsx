import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { HiFlag, HiPencil, HiTrash, HiCheck } from 'react-icons/hi2'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const initialFormData = {
  goalTitle: '',
  goalCategory: '',
  targetDate: '',
  progress: '',
  notes: '',
}

function statusColor(status) {
  if (status === 'Completed') return 'green'
  if (status === 'In Progress') return 'blue'
  if (status === 'On Track') return 'green'
  if (status === 'Behind') return 'orange'
  return 'gray'
}

export default function EmployeeGoals() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)

  const goals = useMemo(
    () => [
      {
        id: 1,
        title: 'Complete React certification',
        category: 'Learning',
        targetDate: '2026-05-30',
        progress: 75,
        status: 'In Progress',
        notes: 'Currently on module 5 of 8',
      },
      {
        id: 2,
        title: 'Lead 3 major projects',
        category: 'Career Growth',
        targetDate: '2026-06-30',
        progress: 50,
        status: 'On Track',
        notes: 'Currently leading 1 project',
      },
      {
        id: 3,
        title: 'Improve code review efficiency',
        category: 'Process',
        targetDate: '2026-04-30',
        progress: 90,
        status: 'On Track',
        notes: 'Reduced review time by 30%',
      },
      {
        id: 4,
        title: 'Mentor 2 junior developers',
        category: 'Leadership',
        targetDate: '2026-12-31',
        progress: 30,
        status: 'In Progress',
        notes: 'Currently mentoring 1 junior',
      },
      {
        id: 5,
        title: 'Complete AWS certification',
        category: 'Learning',
        targetDate: '2026-09-30',
        progress: 0,
        status: 'Not Started',
        notes: 'Planning to start in Q3',
      },
    ],
    []
  )

  const summary = useMemo(() => {
    const inProgress = goals.filter((g) => g.status === 'In Progress').length
    const onTrack = goals.filter((g) => g.status === 'On Track').length
    const completed = goals.filter((g) => g.status === 'Completed').length
    const avgProgress = goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0
    return { inProgress, onTrack, completed, avgProgress }
  }, [goals])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetModal = () => {
    setFormData(initialFormData)
    setEditMode(false)
    setEditingId(null)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    resetModal()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ formData, editMode, editingId })
    handleCloseModal()
  }

  const handleEdit = (id) => {
    const goal = goals.find((g) => g.id === id)
    if (goal) {
      setFormData({
        goalTitle: goal.title,
        goalCategory: goal.category,
        targetDate: goal.targetDate,
        progress: goal.progress.toString(),
        notes: goal.notes,
      })
      setEditMode(true)
      setEditingId(id)
      setModalOpen(true)
    }
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      console.log('Delete goal:', id)
    }
  }

  const handleUpdateProgress = (id) => {
    const goal = goals.find((g) => g.id === id)
    if (goal) {
      const newProgress = prompt(`Update progress for "${goal.title}" (0-100):`, goal.progress)
      if (newProgress !== null && !isNaN(newProgress)) {
        console.log('Update progress:', id, newProgress)
      }
    }
  }

  const handleView = (id) => {
    const goal = goals.find((g) => g.id === id)
    if (goal) {
      setSelectedGoal(goal)
      setViewModalOpen(true)
    }
  }

  const columns = [
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
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button label="View" variant="ghost" size="sm" icon={HiCheck} onClick={() => handleView(row.id)} />
          <Button
            label="Update Progress"
            variant="ghost"
            size="sm"
            icon={HiFlag}
            onClick={() => handleUpdateProgress(row.id)}
          />
          <Button label="Edit" variant="ghost" size="sm" icon={HiPencil} onClick={() => handleEdit(row.id)} />
          <Button label="Delete" variant="ghost" size="sm" icon={HiTrash} onClick={() => handleDelete(row.id)} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">My Goals</h1>
          <p className="mt-1 text-sm text-gray-500">Set and track your professional development goals.</p>
        </div>
        <Button label="Add New Goal" variant="primary" onClick={() => setModalOpen(true)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="Active Goals" value={summary.inProgress + summary.onTrack} subtitle="In progress" color="blue" icon={HiFlag} />
        <StatCard title="Completed" value={summary.completed} subtitle="This year" color="green" icon={HiCheck} />
        <StatCard title="Average Progress" value={`${summary.avgProgress}%`} subtitle="Across all goals" color="orange" icon={HiFlag} />
        <StatCard title="Total Goals" value={goals.length} subtitle="All time" color="blue" icon={HiFlag} />
      </div>

      <Table columns={columns} data={goals} pageSize={10} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editMode ? 'Edit Goal' : 'Add New Goal'} size="md">
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
            {editMode && (
              <Input
                label="Progress (%)"
                name="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={handleFormChange}
                placeholder="0"
              />
            )}
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
            <Button type="submit" label={editMode ? 'Update Goal' : 'Save Goal'} variant="primary" />
          </div>
        </form>
      </Modal>

      {selectedGoal && (
        <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title={`Goal Details - ${selectedGoal.title}`} size="md">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Category</h3>
              <p className="text-gray-900">{selectedGoal.category}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Target Date</h3>
              <p className="text-gray-900">{selectedGoal.targetDate}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Progress</h3>
              <div className="flex items-center gap-2">
                <div className="h-2 w-48 rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${selectedGoal.progress}%` }} />
                </div>
                <span className="text-sm font-medium text-gray-900">{selectedGoal.progress}%</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Status</h3>
              <Badge label={selectedGoal.status} color={statusColor(selectedGoal.status)} />
            </div>
            {selectedGoal.notes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Notes</h3>
                <p className="text-gray-900">{selectedGoal.notes}</p>
              </div>
            )}
            <div className="flex justify-end">
              <Button label="Close" variant="secondary" onClick={() => setViewModalOpen(false)} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
