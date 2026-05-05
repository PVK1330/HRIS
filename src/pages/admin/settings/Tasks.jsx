import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { HiCheckCircle, HiPencil, HiTrash, HiUser, HiClock, HiFlag, HiPlus, HiCheck } from 'react-icons/hi2'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const initialFormData = {
  taskTitle: '',
  taskDescription: '',
  project: '',
  department: '',
  assignedTo: '',
  priority: '',
  dueDate: '',
  estimatedHours: '',
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

export default function TaskManagement() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [project, setProject] = useState('')
  const [taskList, setTaskList] = useState([
    {
      id: 1,
      title: 'Design employee dashboard',
      description: 'Create UI/UX for employee dashboard',
      project: 'HRIS Platform',
      department: 'IT',
      assignedTo: 'John Smith',
      priority: 'High',
      dueDate: '2026-04-20',
      estimatedHours: 40,
      status: 'In Progress',
    },
    {
      id: 2,
      title: 'Implement leave management',
      description: 'Build leave request and approval system',
      project: 'HRIS Platform',
      department: 'IT',
      assignedTo: 'Sarah Johnson',
      priority: 'High',
      dueDate: '2026-04-25',
      estimatedHours: 60,
      status: 'Pending',
    },
    {
      id: 3,
      title: 'Create API documentation',
      description: 'Document all API endpoints',
      project: 'HRIS Platform',
      department: 'IT',
      assignedTo: 'Michael Brown',
      priority: 'Medium',
      dueDate: '2026-05-10',
      estimatedHours: 30,
      status: 'Pending',
    },
    {
      id: 4,
      title: 'Setup testing framework',
      description: 'Configure unit and integration tests',
      project: 'HRIS Platform',
      department: 'IT',
      assignedTo: 'Emily Davis',
      priority: 'Medium',
      dueDate: '2026-04-15',
      estimatedHours: 25,
      status: 'Completed',
    },
    {
      id: 5,
      title: 'Database optimization',
      description: 'Optimize database queries',
      project: 'HRIS Platform',
      department: 'IT',
      assignedTo: 'David Wilson',
      priority: 'Low',
      dueDate: '2026-06-01',
      estimatedHours: 20,
      status: 'Pending',
    },
  ])


  const employees = useMemo(
    () => [
      { value: '', label: 'Unassigned' },
      { value: 'John Smith', label: 'John Smith (EMP001)' },
      { value: 'Sarah Johnson', label: 'Sarah Johnson (EMP002)' },
      { value: 'Michael Brown', label: 'Michael Brown (EMP003)' },
      { value: 'Emily Davis', label: 'Emily Davis (EMP004)' },
      { value: 'David Wilson', label: 'David Wilson (EMP005)' },
    ],
    []
  )

  const projects = useMemo(
    () => [
      { value: '', label: 'All projects' },
      { value: 'HRIS Platform', label: 'HRIS Platform' },
      { value: 'Mobile App', label: 'Mobile App' },
      { value: 'Website', label: 'Website' },
    ],
    []
  )

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'All statuses' },
      { value: 'Pending', label: 'Pending' },
      { value: 'In Progress', label: 'In Progress' },
      { value: 'Completed', label: 'Completed' },
      { value: 'Overdue', label: 'Overdue' },
    ],
    []
  )

  const priorityOptions = useMemo(
    () => [
      { value: '', label: 'All priorities' },
      { value: 'High', label: 'High' },
      { value: 'Medium', label: 'Medium' },
      { value: 'Low', label: 'Low' },
    ],
    []
  )

  const projectOptions = useMemo(
    () => [
      { value: '', label: 'All projects' },
      { value: 'HRIS Platform', label: 'HRIS Platform' },
      { value: 'Mobile App Development', label: 'Mobile App Development' },
      { value: 'Website Redesign', label: 'Website Redesign' },
      { value: 'Process Automation', label: 'Process Automation' },
    ],
    []
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return taskList.filter((t) => {
      if (query && !`${t.title} ${t.assignedTo}`.toLowerCase().includes(query)) return false
      if (status && t.status !== status) return false
      if (priority && t.priority !== priority) return false
      if (project && t.project !== project) return false
      return true
    })
  }, [search, status, priority, project, taskList])

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

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editMode) {
      // Update existing task
      setTaskList((prev) => 
        prev.map((task) => 
          task.id === editingId 
            ? { 
                ...task, 
                title: formData.taskTitle,
                description: formData.taskDescription,
                project: formData.project,
                department: formData.department,
                assignedTo: formData.assignedTo,
                priority: formData.priority,
                dueDate: formData.dueDate,
                estimatedHours: parseFloat(formData.estimatedHours) || 0,
                status: formData.status
              } 
            : task
        )
      )
      alert('Task updated successfully!')
    } else {
      // Add new task
      const newTask = {
        id: taskList.length + 1,
        title: formData.taskTitle,
        description: formData.taskDescription,
        project: formData.project,
        department: formData.department,
        assignedTo: formData.assignedTo,
        priority: formData.priority,
        dueDate: formData.dueDate,
        estimatedHours: parseFloat(formData.estimatedHours) || 0,
        status: formData.status
      }
      setTaskList((prev) => [...prev, newTask])
      alert('Task added successfully!')
    }
    
    handleCloseModal()
  }

  const handleEdit = (id) => {
    const task = taskList.find((t) => t.id === id)
    if (task) {
      setFormData({
        taskTitle: task.title,
        taskDescription: task.description,
        project: task.project,
        department: task.department,
        assignedTo: task.assignedTo,
        priority: task.priority,
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours.toString(),
        status: task.status,
      })
      setEditMode(true)
      setEditingId(id)
      setModalOpen(true)
    }
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTaskList((prev) => prev.filter((t) => t.id !== id))
      alert('Task deleted successfully!')
    }
  }

  const handleStatusChange = (id, newStatus) => {
    setTaskList((prev) => 
      prev.map((task) => 
        task.id === id ? { ...task, status: newStatus } : task
      )
    )
    alert('Task status updated successfully!')
  }

  const columns = [
    { key: 'title', label: 'Task' },
    { key: 'project', label: 'Project' },
    { key: 'assignedTo', label: 'Assigned To' },
    {
      key: 'priority',
      label: 'Priority',
      render: (v) => <Badge label={v} color={priorityColor(v)} />,
    },
    { key: 'dueDate', label: 'Due Date' },
    {
      key: 'estimatedHours',
      label: 'Hours',
      render: (v) => `${v}h`,
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
          <Button
            ariaLabel="Complete"
            variant="ghost"
            size="sm"
            icon={HiCheckCircle}
            onClick={() => handleStatusChange(row.id, 'Completed')}
            disabled={row.status === 'Completed'}
          />
          <Button ariaLabel="Edit Task" variant="ghost" size="sm" icon={HiPencil} onClick={() => handleEdit(row.id)} />
          <Button ariaLabel="Delete Task" variant="ghost" size="sm" icon={HiTrash} onClick={() => handleDelete(row.id)} />
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
        <Button ariaLabel="Add Task" variant="primary" icon={HiPlus} onClick={() => setModalOpen(true)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-4">
          <Input label="Search" name="search" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Input label="Project" name="project" type="select" value={project} onChange={(e) => setProject(e.target.value)} options={projectOptions} />
          <Input label="Priority" name="priority" type="select" value={priority} onChange={(e) => setPriority(e.target.value)} options={priorityOptions} />
          <Input label="Status" name="status" type="select" value={status} onChange={(e) => setStatus(e.target.value)} options={statusOptions} />
        </div>
      </div>

      <Table columns={columns} data={filtered} pageSize={10} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editMode ? 'Edit Task' : 'Add Task'} size="lg">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Task Title"
              name="taskTitle"
              value={formData.taskTitle}
              onChange={handleFormChange}
              required
            />
            <div className="w-full">
              <label htmlFor="task-project" className="mb-1 block text-sm font-medium text-gray-700">
                Project
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="task-project"
                name="project"
                value={formData.project}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select project
                </option>
                <option value="HRIS Platform">HRIS Platform</option>
                <option value="Mobile App">Mobile App</option>
                <option value="Website">Website</option>
              </select>
            </div>
            <div className="w-full">
              <label htmlFor="task-dept" className="mb-1 block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                id="task-dept"
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
              </select>
            </div>
            <div className="w-full">
              <label htmlFor="task-assignee" className="mb-1 block text-sm font-medium text-gray-700">
                Assign To
              </label>
              <select
                id="task-assignee"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleFormChange}
                className={selectClass}
              >
                {employees.map((emp) => (
                  <option key={emp.value} value={emp.value}>
                    {emp.label}
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
                <option value="" disabled hidden>
                  Select priority
                </option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <Input
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Estimated Hours"
              name="estimatedHours"
              type="number"
              value={formData.estimatedHours}
              onChange={handleFormChange}
              placeholder="0"
            />
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="task-description" className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="task-description"
              name="taskDescription"
              value={formData.taskDescription}
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
