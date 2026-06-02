import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { HiCheckCircle, HiPencil, HiTrash, HiClock, HiFlag, HiPlus, HiCheck, HiEye } from 'react-icons/hi2'
import * as tasksService from '../../../services/tasksService'
import api from '../../../services/api'
import toast from 'react-hot-toast'

const selectClass =
  'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'
const textareaClass =
  'w-full min-h-[88px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const initialFormData = {
  title: '',
  description: '',
  assignee_id: '',
  priority: 'Medium',
  due_date: '',
  status: 'Pending',
}

function priorityColor(priority) {
  if (priority === 'High') return 'red'
  if (priority === 'Medium') return 'orange'
  if (priority === 'Low') return 'green'
  return 'gray'
}

function statusColor(status) {
  if (status === 'Completed') return 'green'
  if (status === 'In Progress') return 'blue'
  if (status === 'Pending') return 'orange'
  if (status === 'Overdue') return 'red'
  return 'gray'
}

function normalizeTask(task = {}) {
  return {
    id: task.id,
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'Medium',
    status: task.status || 'Pending',
    due_date: task.due_date || task.dueDate || null,
    assignee_id: task.assignee_id ?? task.assigneeId ?? null,
    assignee_name: task.assignee_name || task.assigneeName || '',
    assigner_name: task.assigner_name || task.assignerName || '',
    created_at: task.created_at || task.createdAt || null,
  }
}

export default function TaskManagement() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  
  const [taskList, setTaskList] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  useEffect(() => {
    fetchTasks()
    fetchEmployees()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const res = await tasksService.getTasks()
      const list = Array.isArray(res?.data) ? res.data : []
      setTaskList(list.map(normalizeTask))
    } catch (err) {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees?limit=1000') // Adjust as needed
      const payload = res?.data
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.data?.records)
            ? payload.data.records
            : Array.isArray(payload?.data?.employees)
              ? payload.data.employees
              : Array.isArray(payload?.employees)
                ? payload.employees
                : []
      setEmployees(list)
    } catch (err) {
      setEmployees([])
    }
  }

  const statusOptions = useMemo(() => [
    { value: '', label: 'All statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Overdue', label: 'Overdue' },
  ], [])

  const priorityOptions = useMemo(() => [
    { value: '', label: 'All priorities' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
  ], [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return taskList.filter((t) => {
      if (query && !`${t.title} ${t.assignee_name}`.toLowerCase().includes(query)) return false
      if (statusFilter && t.status !== statusFilter) return false
      if (priorityFilter && t.priority !== priorityFilter) return false
      return true
    })
  }, [search, statusFilter, priorityFilter, taskList])

  const summary = useMemo(() => {
    const pending = taskList.filter((t) => t.status === 'Pending').length
    const inProgress = taskList.filter((t) => t.status === 'In Progress').length
    const completed = taskList.filter((t) => t.status === 'Completed').length
    const highPriority = taskList.filter((t) => t.priority === 'High' && t.status !== 'Completed').length
    return { pending, inProgress, completed, highPriority }
  }, [taskList])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        due_date: formData.due_date || null,
        status: formData.status,
        assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : null
      }

      if (editMode) {
        await tasksService.updateTask(editingId, payload)
        toast.success('Task updated successfully!')
      } else {
        await tasksService.createTask(payload)
        toast.success('Task created successfully!')
      }
      fetchTasks()
      handleCloseModal()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed')
    }
  }

  const handleEdit = (id) => {
    const task = taskList.find((t) => t.id === id)
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assignee_id: task.assignee_id || '',
        priority: task.priority || 'Medium',
        due_date: task.due_date ? String(task.due_date).split('T')[0] : '',
        status: task.status || 'Pending',
      })
      setEditMode(true)
      setEditingId(id)
      setModalOpen(true)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksService.deleteTask(id)
        toast.success('Task deleted successfully!')
        fetchTasks()
      } catch (err) {
        toast.error('Failed to delete task')
      }
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await tasksService.updateTask(id, { status: newStatus })
      toast.success('Task status updated!')
      fetchTasks()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const columns = [
    { key: 'title', label: 'Task' },
    { key: 'assignee_name', label: 'Assigned To', render: (v) => v || 'Unassigned' },
    {
      key: 'priority',
      label: 'Priority',
      render: (v) => <Badge label={v} color={priorityColor(v)} />,
    },
    { key: 'due_date', label: 'Due Date', render: (v) => v ? new Date(v).toLocaleDateString() : 'N/A' },
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
          <Link to={`/admin/tasks/${row.id}`}>
            <Button
              label="View"
              variant="ghost"
              size="sm"
              icon={HiEye}
            />
          </Link>
          <Button
            label="Complete"
            variant="Approve"
            size="sm"
            icon={HiCheckCircle}
            onClick={() => handleStatusChange(row.id, 'Completed')}
            disabled={row.status === 'Completed'}
          />
          <Button label="Edit" className="bg-blue-500 text-blue-600 hover:bg-blue-500" size="sm" icon={HiPencil} onClick={() => handleEdit(row.id)} />
          <Button label="Delete" variant="danger" size="sm" icon={HiTrash} onClick={() => handleDelete(row.id)} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage tasks with team assignments.</p>
        </div>
        <Button label="Add Task" variant="primary" icon={HiPlus} onClick={() => setModalOpen(true)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <HiFlag className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{summary.pending}</div>
              <div className="text-sm text-gray-500">Pending Tasks</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <HiClock className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{summary.inProgress}</div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <HiCheckCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{summary.completed}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <HiFlag className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{summary.highPriority}</div>
              <div className="text-sm text-gray-500">High Priority</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Search" name="search" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Input label="Priority" name="priority" type="select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} options={priorityOptions} />
          <Input label="Status" name="status" type="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={statusOptions} />
        </div>
      </div>

      {loading ? <div className="text-center p-4">Loading tasks...</div> : <Table columns={columns} data={filtered} pageSize={10} />}

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editMode ? 'Edit Task' : 'Add Task'} size="xl" showClose>
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Task Title"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              required
            />
            <div className="w-full">
              <label htmlFor="task-assignee" className="mb-1 block text-sm font-medium text-gray-700">
                Assign To
              </label>
              <select
                id="task-assignee"
                name="assignee_id"
                value={formData.assignee_id}
                onChange={handleFormChange}
                className={selectClass}
              >
                <option value="">Unassigned</option>
                {(Array.isArray(employees) ? employees : []).map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {`${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unnamed'} ({emp.employee_id || emp.emp_id || 'N/A'})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <label htmlFor="task-priority" className="mb-1 block text-sm font-medium text-gray-700">
                Priority
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="task-priority"
                name="priority"
                value={formData.priority}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <Input
              label="Due Date"
              name="due_date"
              type="date"
              value={formData.due_date}
              onChange={handleFormChange}
            />
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="task-description" className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="task-description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              className={textareaClass}
              rows={3}
              placeholder="Detailed task description"
            />
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="task-status" className="mb-1 block text-sm font-medium text-gray-700">
              Status
              <span className="text-red-500"> *</span>
            </label>
            <select
              id="task-status"
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              className={selectClass}
              required
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" ariaLabel="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" ariaLabel={editMode ? 'Update Task' : 'Create Task'} variant="primary" icon={HiCheck} />
          </div>
        </form>
      </Modal>
    </div>
  )
}
