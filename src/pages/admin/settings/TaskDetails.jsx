import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { HiArrowLeft, HiPaperClip, HiChatBubbleLeftEllipsis } from 'react-icons/hi2'
import * as tasksService from '../../../services/tasksService'
import toast from 'react-hot-toast'
import { resolveFileUrl } from '../../../utils/fileUrl.js'

function normalizeTask(task = {}) {
  return {
    ...task,
    created_at: task.created_at || task.createdAt || null,
    due_date: task.due_date || task.dueDate || null,
    assignee_name: task.assignee_name || task.assigneeName || '',
    assigner_name: task.assigner_name || task.assignerName || '',
  }
}

function normalizeComment(comment = {}) {
  return {
    ...comment,
    employee_name: comment.employee_name || comment.employeeName || '',
    created_at: comment.created_at || comment.createdAt || null,
  }
}

function normalizeAttachment(attachment = {}) {
  return {
    ...attachment,
    file_name: attachment.file_name || attachment.fileName || '',
    file_url: attachment.file_url || attachment.fileUrl || '',
    file_size: attachment.file_size || attachment.fileSize || 0,
  }
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

export default function TaskDetails() {
  const { id } = useParams()
  const [task, setTask] = useState(null)
  const [comments, setComments] = useState([])
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    fetchTaskDetails()
  }, [id])

  const fetchTaskDetails = async () => {
    try {
      setLoading(true)
      const res = await tasksService.getTaskById(id)
      setTask(normalizeTask(res?.data?.task || {}))
      setComments((Array.isArray(res?.data?.comments) ? res.data.comments : []).map(normalizeComment))
      setAttachments((Array.isArray(res?.data?.attachments) ? res.data.attachments : []).map(normalizeAttachment))
    } catch (err) {
      toast.error('Failed to load task details')
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      await tasksService.addTaskComment(id, newComment)
      setNewComment('')
      fetchTaskDetails()
      toast.success('Comment added')
    } catch (err) {
      toast.error('Failed to add comment')
    }
  }

  if (loading) return <div className="p-8 text-center">Loading task details...</div>
  if (!task) return <div className="p-8 text-center text-red-500">Task not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/tasks" className="text-gray-500 hover:text-gray-900">
          <HiArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task: {task.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span>Created on {new Date(task.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <Badge label={task.status} color={statusColor(task.status)} />
            <Badge label={task.priority + ' Priority'} color={priorityColor(task.priority)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Description</h2>
            <div className="text-gray-700 whitespace-pre-wrap">{task.description || 'No description provided.'}</div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HiChatBubbleLeftEllipsis className="h-5 w-5 text-gray-400" />
              Comments ({comments.length})
            </h2>
            <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="font-semibold text-gray-700">{c.employee_name || 'System'}</span>
                    <span>{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-gray-800">{c.comment}</div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-sm text-gray-500">No comments yet.</p>}
            </div>
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <Button type="submit" variant="primary" label="Post" />
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Details</h2>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-gray-500">Assignee</div>
                <div className="font-semibold text-gray-900">{task.assignee_name || 'Unassigned'}</div>
              </div>
              <div>
                <div className="text-gray-500">Assigned By</div>
                <div className="font-semibold text-gray-900">{task.assigner_name || 'System'}</div>
              </div>
              <div>
                <div className="text-gray-500">Due Date</div>
                <div className="font-semibold text-gray-900">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'None'}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HiPaperClip className="h-5 w-5 text-gray-400" />
              Attachments ({attachments.length})
            </h2>
            <div className="space-y-2">
              {attachments.map(a => (
                <div key={a.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                  <a href={resolveFileUrl(a.file_url)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate w-4/5">
                    {a.file_name}
                  </a>
                  <span className="text-gray-400 text-xs">{Math.round(a.file_size / 1024)} KB</span>
                </div>
              ))}
              {attachments.length === 0 && <p className="text-sm text-gray-500">No attachments.</p>}
            </div>
            {/* Future: Add attachment upload form here */}
          </div>
        </div>
      </div>
    </div>
  )
}
