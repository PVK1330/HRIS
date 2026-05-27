import { useMemo, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '../ui/Badge.jsx'
import { listEmployeesDropdown } from '../../services/employeeService.js'
import { uploadClearanceProof } from '../../services/exitManagementService.js'

function TaskDueDateBadge({ dueDate, isCompleted, isEscalated }) {
  if (!dueDate) return null

  const due = new Date(dueDate)
  const now = new Date()
  const diffTime = due - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const isOverdue = diffTime < 0

  if (isCompleted) {
    return (
      <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5">
        Due: {due.toLocaleDateString('en-GB')}
      </span>
    )
  }

  if (isOverdue || isEscalated) {
    return (
      <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 animate-pulse flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" />
        BREACHED (Overdue by {Math.abs(diffDays)}d)
      </span>
    )
  }

  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 border ${
      diffDays <= 2 
        ? 'text-amber-600 bg-amber-50 border-amber-200' 
        : 'text-[#0F766E] bg-teal-50 border-teal-100'
    }`}>
      Due in {diffDays}d ({due.toLocaleDateString('en-GB')})
    </span>
  )
}

export default function ClearanceChecklist({ exitRequestId, tasks, onTaskUpdate, roleCanEdit, currentUserRole }) {
  const completedCount = tasks.filter((t) => t.is_completed).length
  const totalCount = tasks.length
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const [employees, setEmployees] = useState([])
  const [uploadingTaskId, setUploadingTaskId] = useState(null)

  useEffect(() => {
    if (roleCanEdit) {
      listEmployeesDropdown()
        .then((data) => {
          setEmployees(data?.employees || data || [])
        })
        .catch((err) => {
          console.error('Failed to fetch employees list for task assignment:', err)
        })
    }
  }, [roleCanEdit])

  const groupedTasks = useMemo(() => {
    const groups = {}
    tasks.forEach((task) => {
      const dept = task.department || 'General'
      if (!groups[dept]) groups[dept] = []
      groups[dept].push(task)
    })
    return groups
  }, [tasks])

  const handleToggle = (task) => {
    if (!roleCanEdit) return
    onTaskUpdate(task.id, { is_completed: !task.is_completed })
  }

  const handleFileUpload = async (taskId, file) => {
    if (!file) return
    setUploadingTaskId(taskId)
    try {
      await uploadClearanceProof(exitRequestId, taskId, file)
      toast.success('Clearance proof document uploaded successfully')
      onTaskUpdate(taskId, {}) // trigger refresh in parent
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload clearance proof document')
    } finally {
      setUploadingTaskId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-none border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {completedCount} of {totalCount} tasks completed
          </span>
          <span className="text-sm font-semibold text-[#0F766E]">{percentage}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#0F766E] transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {Object.entries(groupedTasks).map(([department, deptTasks]) => (
        <div key={department} className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-1">
            {department}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deptTasks.map((task) => (
              <div
                key={task.id}
                className={`rounded-none border p-4 flex flex-col justify-between gap-3 transition-colors ${
                  task.is_completed
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : task.is_escalated
                    ? 'border-red-200 bg-red-50/20'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.is_completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                      {task.task_name}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {(task.assigned_to_role || task.assigned_role) && (
                        <Badge
                          label={task.assigned_to_role || task.assigned_role}
                          color="blue"
                        />
                      )}
                      {task.is_completed && task.completed_by_name && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5">
                          Done by {task.completed_by_name}
                        </span>
                      )}
                      <TaskDueDateBadge 
                        dueDate={task.due_date} 
                        isCompleted={task.is_completed} 
                        isEscalated={task.is_escalated}
                      />
                    </div>
                    {task.remarks && (
                      <p className="mt-1 text-xs italic text-gray-400">{task.remarks}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle(task)}
                    disabled={!roleCanEdit}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] ${
                      task.is_completed ? 'bg-[#0F766E]' : 'bg-gray-300'
                    } ${!roleCanEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    aria-label={`Toggle ${task.task_name}`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        task.is_completed ? 'translate-x-[18px]' : 'translate-x-[3px]'
                       }`}
                    />
                  </button>
                </div>

                {/* Proof Attachments Section */}
                <div className="border-t border-gray-100 pt-2.5 mt-1 flex flex-col gap-1.5">
                  <span className="block text-[9px] font-black uppercase tracking-wider text-gray-400">Proof Attachment</span>
                  {task.document_url ? (
                    <div className="flex items-center justify-between text-xs bg-gray-50 border border-gray-100 p-1.5">
                      <a 
                        href={task.document_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="font-semibold text-[#0F766E] truncate max-w-[180px] hover:underline"
                        title={task.document_name}
                      >
                        📎 {task.document_name || 'View uploaded proof'}
                      </a>
                      {!task.is_completed && (
                        <label className="text-[10px] text-gray-500 hover:text-gray-800 cursor-pointer font-bold">
                          Change
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileUpload(task.id, e.target.files[0])}
                            disabled={uploadingTaskId === task.id}
                          />
                        </label>
                      )}
                    </div>
                  ) : (
                    !task.is_completed ? (
                      <div className="text-xs">
                        <label className={`inline-flex items-center gap-1 px-2.5 py-1.5 border border-dashed border-gray-300 text-gray-500 hover:text-gray-800 hover:border-gray-400 cursor-pointer font-semibold transition-all ${
                          uploadingTaskId === task.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}>
                          📁 {uploadingTaskId === task.id ? 'Uploading...' : 'Upload Proof File'}
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileUpload(task.id, e.target.files[0])}
                            disabled={uploadingTaskId === task.id}
                          />
                        </label>
                      </div>
                    ) : (
                      <span className="text-xs italic text-gray-400">No proof submitted</span>
                    )
                  )}
                </div>

                {/* Task Assignment Dropdown for HR, or static assignee badge for employees */}
                <div className="border-t border-gray-100 pt-2.5 mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roleCanEdit ? (
                    <>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-wider text-gray-400">Assign To</label>
                        <select
                          value={task.assigned_to || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            onTaskUpdate(task.id, { assigned_to: val ? parseInt(val, 10) : null });
                          }}
                          disabled={task.is_completed}
                          className="mt-1 block w-full text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-none py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                        >
                          <option value="">-- Select Assignee --</option>
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.full_name || [emp.first_name, emp.last_name].filter(Boolean).join(' ') || `ID: ${emp.id}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-wider text-gray-400">Due Date</label>
                        <input
                          type="datetime-local"
                          value={task.due_date ? new Date(new Date(task.due_date).getTime() - new Date(task.due_date).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                          onChange={(e) => {
                            onTaskUpdate(task.id, { due_date: e.target.value ? new Date(e.target.value).toISOString() : null });
                          }}
                          disabled={task.is_completed}
                          className="mt-1 block w-full text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-none py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs col-span-2">
                      <span className="text-gray-400 font-medium">Assigned to:</span>
                      {task.assigned_to_name ? (
                        <span className="font-bold text-gray-700 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
                          {task.assigned_to_name}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {tasks.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-8">No clearance tasks assigned yet.</p>
      )}
    </div>
  )
}
