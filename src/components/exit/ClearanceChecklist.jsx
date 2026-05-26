import { useMemo } from 'react'
import { Badge } from '../ui/Badge.jsx'

export default function ClearanceChecklist({ exitRequestId, tasks, onTaskUpdate, roleCanEdit, currentUserRole }) {
  const completedCount = tasks.filter((t) => t.is_completed).length
  const totalCount = tasks.length
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {deptTasks.map((task) => (
              <div
                key={task.id}
                className={`rounded-none border p-3 flex items-center justify-between gap-3 transition-colors ${
                  task.is_completed
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.is_completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {task.task_name}
                  </p>
                  {task.assigned_role && (
                    <Badge
                      label={task.assigned_role}
                      color="blue"
                      className="mt-1"
                    />
                  )}
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
