import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Toggle } from '../../../components/ui/Toggle.jsx'
import {
  HiPencilSquare,
  HiTrash,
  HiMegaphone,
  HiUsers,
  HiCalendarDays,
  HiExclamationTriangle,
  HiInformationCircle,
  HiRocketLaunch,
  HiClock,
  HiQuestionMarkCircle,
  HiSparkles,
  HiSignal,
  HiEye
} from 'react-icons/hi2'
import { Input } from '../../../components/ui/Input.jsx'
import { superadminService } from '../../../services/superadminService'

const AUDIENCE_OPTIONS = ['All Organizations', 'Trial Only', 'Enterprise Only']
const TYPE_OPTIONS = ['Info', 'Warning', 'Critical']
const PRIORITY_OPTIONS = ['Normal', 'High', 'Immediate']

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // New Announcement Form State
  const [newAnnouncement, setNewAnnouncement] = useState({ 
    title: '', 
    message: '', 
    audience: 'All Organizations', 
    type: 'Info', 
    priority: 'Normal',
    scheduledAt: '', 
    isScheduled: false 
  })
  const [formErrors, setFormErrors] = useState({})

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRevokeModal, setShowRevokeModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [viewAnnouncement, setViewAnnouncement] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '',
    message: '',
    audience: 'All Organizations',
    type: 'Info',
    priority: 'Normal',
    scheduledAt: '',
  })
  const [editErrors, setEditErrors] = useState({})

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const mapAnnouncement = (row) => {
    const sentAt = row.sent_date || row.sentDate || row.created_at || row.createdAt || null
    const scheduledAt = row.scheduled_at || row.scheduledAt || null

    return {
      id: row.id,
      title: row.title || '',
      message: row.message || '',
      audience: row.audience || 'All Organizations',
      type: row.type || 'Info',
      priority: row.priority || 'Normal',
      status: row.status || (scheduledAt ? 'Scheduled' : 'Sent'),
      sentDate: sentAt
        ? new Date(sentAt).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '-',
      scheduledAt: scheduledAt ? new Date(scheduledAt).toLocaleString() : null,
      recipients: Number(row.recipients ?? 0),
    }
  }

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true)
      const response = await superadminService.getAnnouncements()
      const list =
        response?.data?.data?.announcements ||
        response?.data?.announcements ||
        response?.data?.data ||
        []
      setAnnouncements(list.map(mapAnnouncement))
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
      Swal.fire({
        icon: 'error',
        title: 'Load Failed',
        text: error.response?.data?.message || 'Failed to load announcements.',
        confirmButtonColor: '#0F766E',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const validateNewAnnouncement = () => {
    const next = {}
    if (!newAnnouncement.title.trim()) next.title = 'Title is required.'
    if (!newAnnouncement.message.trim()) next.message = 'Message is required.'
    if (newAnnouncement.isScheduled) {
      if (!newAnnouncement.scheduledAt) {
        next.scheduledAt = 'Scheduled date/time is required.'
      }
    }
    return next
  }

  const handleSend = async () => {
    const nextErrors = validateNewAnnouncement()
    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors)
      return false
    }

    try {
      setIsSubmitting(true)
      setFormErrors({})
      const payload = {
        title: newAnnouncement.title,
        message: newAnnouncement.message,
        audience: newAnnouncement.audience,
        type: newAnnouncement.type,
        priority: newAnnouncement.priority,
        scheduledAt: newAnnouncement.isScheduled ? newAnnouncement.scheduledAt : null,
      }
      const createRes = await superadminService.createAnnouncement(payload)
      const created = createRes?.data?.data?.announcement || createRes?.data?.announcement || null

      if (created) {
        const normalized = mapAnnouncement({
          ...created,
          priority: created.priority || payload.priority,
          status: created.status || (payload.scheduledAt ? 'Scheduled' : 'Sent'),
          scheduled_at: created.scheduled_at || payload.scheduledAt,
        })
        setAnnouncements((prev) => [normalized, ...prev.filter((item) => item.id !== normalized.id)])
      }

      await fetchAnnouncements()
      setNewAnnouncement({ 
        title: '', 
        message: '', 
        audience: 'All Organizations', 
        type: 'Info', 
        priority: 'Normal',
        scheduledAt: '', 
        isScheduled: false 
      })
      setFormErrors({})
      Swal.fire({
        icon: 'success',
        title: 'Announcement Sent',
        text: 'Announcement has been published successfully.',
        timer: 1400,
        showConfirmButton: false,
      })
      return true
    } catch (error) {
      console.error('Failed to create announcement:', error)
      Swal.fire({
        icon: 'error',
        title: 'Create Failed',
        text: error.response?.data?.message || 'Failed to create announcement.',
        confirmButtonColor: '#0F766E',
      })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (ann) => {
    setSelectedAnnouncement(ann)
    setEditForm({ title: ann.title, message: ann.message, audience: ann.audience, type: ann.type, priority: ann.priority })
    setEditErrors({})
    setShowEditModal(true)
  }

  const handleViewClick = (ann) => {
    setViewAnnouncement(ann)
    setShowViewModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedAnnouncement) return
    try {
      setIsUpdating(true)
      setEditErrors({})
      if (!editForm.title.trim()) {
        setEditErrors({ title: 'Title is required.' })
        return
      }
      if (!editForm.message.trim()) {
        setEditErrors({ message: 'Message is required.' })
        return
      }
      await superadminService.updateAnnouncement(selectedAnnouncement.id, editForm)
      await fetchAnnouncements()
      setShowEditModal(false)
      Swal.fire({
        icon: 'success',
        title: 'Announcement Updated',
        text: 'Announcement has been updated and resent.',
        timer: 1200,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Failed to update announcement:', error)
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Failed to update announcement.',
        confirmButtonColor: '#0F766E',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRevoke = async () => {
    if (!selectedAnnouncement) return
    try {
      setIsDeleting(true)
      await superadminService.deleteAnnouncement(selectedAnnouncement.id)
      await fetchAnnouncements()
      setShowRevokeModal(false)
      Swal.fire({
        icon: 'success',
        title: 'Announcement Deleted',
        timer: 1200,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Failed to delete announcement:', error)
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: error.response?.data?.message || 'Failed to delete announcement.',
        confirmButtonColor: '#0F766E',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Title Bar with Moved Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Announcements</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Platform</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Announcements</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => setShowCreateModal(true)} className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm">
            <HiSparkles className="h-4 w-4" /> Add Announcement
          </button>
        </div>
      </div>

      {/* Main Table Registry Area */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Previous Announcements</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 w-full">
            <p className="text-xs font-medium text-slate-500 whitespace-nowrap">{isLoading ? 'Loading...' : `${announcements.length} records`}</p>
          </div>
        </div>

        <Table
              loading={isLoading}
              pageSize={6}
              emptyMessage="No announcements yet"
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'audience', label: 'Audience' },
                { key: 'type', label: 'Type' },
                { key: 'priority', label: 'Priority' },
                { key: 'status', label: 'Status' },
                { key: 'sentDate', label: 'Sent / Scheduled' },
                { key: 'recipients', label: 'Recipients' },
                { key: 'actions', label: 'Actions' },
              ]}
              data={announcements.map((ann) => ({
                id: ann.id,
                title: (
                  <div className="max-w-[220px]">
                    <p className="truncate text-sm font-bold text-slate-900">{ann.title}</p>
                    <p className="truncate text-[11px] text-slate-500">{ann.message}</p>
                  </div>
                ),
                audience: <span className="text-xs font-semibold text-slate-700">{ann.audience}</span>,
                type: <Badge label={ann.type} color={ann.type === 'Critical' ? 'red' : ann.type === 'Warning' ? 'amber' : 'indigo'} variant="glass" />,
                priority: <Badge label={ann.priority} color={ann.priority === 'Immediate' ? 'rose' : ann.priority === 'High' ? 'orange' : 'slate'} variant="glass" />,
                status: <Badge label={ann.status} color={ann.status === 'Scheduled' ? 'amber' : ann.status === 'Processing' ? 'indigo' : 'green'} variant="glass" />,
                sentDate: <span className="text-xs font-semibold text-slate-600">{ann.status === 'Scheduled' ? ann.scheduledAt : ann.sentDate}</span>,
                recipients: <span className="text-xs font-black text-emerald-600">{ann.recipients}</span>,
                actions: (
                  <div className="flex items-center justify-start gap-2">
                    <button type="button" onClick={() => handleViewClick(ann)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-slate-500 text-white transition-colors hover:bg-slate-600" title="View"><HiEye className="h-4 w-4" /></button>
                    <button type="button" onClick={() => handleEditClick(ann)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-blue-500 text-white transition-colors hover:bg-blue-600" title="Edit"><HiPencilSquare className="h-4 w-4" /></button>
                    <button type="button" onClick={() => { setSelectedAnnouncement(ann); setShowRevokeModal(true); }} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600" title="Delete"><HiTrash className="h-4 w-4" /></button>
                  </div>
                ),
              }))}
            />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Create Announcement</h2>
            <p className="text-sm text-slate-500">Broadcast a new message to your tenant organizations.</p>
          </div>
        }
        size="md"
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Input
              label="Announcement Title"
              placeholder="e.g. Scheduled Maintenance"
              value={newAnnouncement.title}
              onChange={(e) => {
                setFormErrors((p) => ({ ...p, title: undefined }))
                setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
              }}
            />
            {!!formErrors.title && <p className="px-1 text-[11px] font-bold text-rose-600">{formErrors.title}</p>}
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Announcement Message</label>
            <textarea
              rows={6}
              className="w-full rounded-none border border-slate-200 bg-white px-5 py-4 text-sm font-medium focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none transition-all resize-none"
              placeholder="Type your message here..."
              value={newAnnouncement.message}
              onChange={(e) => {
                setFormErrors((p) => ({ ...p, message: undefined }))
                setNewAnnouncement({ ...newAnnouncement, message: e.target.value })
              }}
            />
            {!!formErrors.message && <p className="px-1 mt-1 text-[11px] font-bold text-rose-600">{formErrors.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Target Audience</label>
              <select
                className="w-full rounded-none border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all cursor-pointer"
                
                value={newAnnouncement.audience}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, audience: e.target.value })}
              >
                {AUDIENCE_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Priority</label>
              <select
                className="w-full rounded-none border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all cursor-pointer"
                value={newAnnouncement.priority}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
              >
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Announcement Type</label>
              <select
                className="w-full rounded-none border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all cursor-pointer"
                value={newAnnouncement.type}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Schedule Announcement
              </label>
              <Toggle
                checked={newAnnouncement.isScheduled}
                onChange={(v) =>
                  setNewAnnouncement((prev) => ({
                    ...prev,
                    isScheduled: v,
                    scheduledAt: v ? prev.scheduledAt : '',
                  }))
                }
              />
            </div>

            {newAnnouncement.isScheduled && (
              <div className="animate-in slide-in-from-top-2 duration-300 space-y-1">
                <Input
                  type="datetime-local"
                  value={newAnnouncement.scheduledAt}
                  onChange={(e) => {
                    setFormErrors((p) => ({ ...p, scheduledAt: undefined }))
                    setNewAnnouncement({ ...newAnnouncement, scheduledAt: e.target.value })
                  }}
                />
                {!!formErrors.scheduledAt && (
                  <p className="px-1 text-[11px] font-bold text-rose-600">{formErrors.scheduledAt}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button type="button" onClick={() => setShowCreateModal(false)} disabled={isSubmitting} className="rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="button" onClick={async () => {
                const ok = await handleSend()
                if (ok) setShowCreateModal(false)
              }} disabled={isSubmitting} className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64] disabled:opacity-50 transition-colors inline-flex items-center gap-1.5">{newAnnouncement.isScheduled ? <HiCalendarDays className="h-4 w-4"/> : <HiRocketLaunch className="h-4 w-4" />}{newAnnouncement.isScheduled ? 'Schedule Announcement' : 'Post Announcement'}</button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">{viewAnnouncement?.title || 'Announcement'}</h2>
            <p className="text-sm text-slate-500">Audience: {viewAnnouncement?.audience || '-'} · Type: {viewAnnouncement?.type || '-'}</p>
          </div>
        }
        size="md"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-none border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</p>
              <div className="mt-1">
                {viewAnnouncement && <Badge label={viewAnnouncement.status} color={viewAnnouncement.status === 'Scheduled' ? 'amber' : viewAnnouncement.status === 'Processing' ? 'indigo' : 'green'} />}
              </div>
            </div>
            <div className="rounded-none border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Priority</p>
              <div className="mt-1">
                {viewAnnouncement && <Badge label={viewAnnouncement.priority} color={viewAnnouncement.priority === 'Immediate' ? 'rose' : viewAnnouncement.priority === 'High' ? 'orange' : 'slate'} />}
              </div>
            </div>
          </div>
          <div className="rounded-none border border-slate-200 bg-white p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Message</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{viewAnnouncement?.message}</p>
          </div>
          <div className="flex items-center justify-between rounded-none border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-xs font-semibold text-slate-600">Recipients: {viewAnnouncement?.recipients ?? 0}</span>
            <span className="text-xs font-semibold text-slate-600">
              {viewAnnouncement?.status === 'Scheduled' ? `Scheduled: ${viewAnnouncement?.scheduledAt || '-'}` : `Sent: ${viewAnnouncement?.sentDate || '-'}`}
            </span>
          </div>
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button type="button" onClick={() => setShowViewModal(false)} className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64] transition-colors">Close</button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Edit Announcement</h2>
            <p className="text-sm text-slate-500">Update the content or priority. Saving will resend the notification.</p>
          </div>
        }
        size="md"
      >
        <div className="space-y-6">
          <div className="space-y-1.5">
            <Input
              label="Title"
              value={editForm.title}
              onChange={(e) => {
                setEditErrors((p) => ({ ...p, title: undefined }))
                setEditForm({ ...editForm, title: e.target.value })
              }}
            />
            {!!editErrors.title && <p className="px-1 text-[11px] font-bold text-rose-600">{editErrors.title}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Audience</label>
              <select
                className="w-full rounded-none border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all cursor-pointer"
                value={editForm.audience}
                onChange={(e) => setEditForm({ ...editForm, audience: e.target.value })}
              >
                {AUDIENCE_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Type</label>
              <select
                className="w-full rounded-none border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all cursor-pointer"
                value={editForm.type}
                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Priority</label>
              <select
                className="w-full rounded-none border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all cursor-pointer"
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
              >
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            rows={5}
            className="w-full rounded-none border border-slate-200 bg-white px-5 py-4 text-sm font-medium focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none transition-all resize-none shadow-sm"
            value={editForm.message}
            onChange={(e) => {
              setEditErrors((p) => ({ ...p, message: undefined }))
              setEditForm({ ...editForm, message: e.target.value })
            }}
          />
          {!!editErrors.message && <p className="px-1 -mt-3 text-[11px] font-bold text-rose-600">{editErrors.message}</p>}
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button type="button" onClick={() => setShowEditModal(false)} disabled={isUpdating} className="rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="button" onClick={handleSaveEdit} disabled={isUpdating} className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64] disabled:opacity-50 transition-colors">{isUpdating ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Delete Announcement</h2>
            <p className="text-sm text-slate-500">Are you sure you want to delete this announcement? This action cannot be undone.</p>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button type="button" onClick={() => setShowRevokeModal(false)} disabled={isDeleting} className="rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="button" onClick={handleRevoke} disabled={isDeleting} className="rounded-none border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"><HiTrash className="h-4 w-4"/> {isDeleting ? 'Deleting…' : 'Delete'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
