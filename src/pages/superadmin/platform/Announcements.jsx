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
    <div className="sa-page">
      {/* Hero */}
      <div className="sa-hero px-6 py-4">
        <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white shadow-inner">
                <HiMegaphone className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-widest">Announcements</h1>
                <p className="mt-0.5 text-xs text-emerald-100/80 leading-relaxed max-w-xl">
                  Send important updates to all platform tenants. Schedule ahead for precise delivery.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1.5">
           
            <Button
              label="Add Announcement"
              icon={HiSparkles}
              onClick={() => setShowCreateModal(true)}
              variant="ghost"
              className="mt-1 !bg-white !text-[#0F766E] hover:!bg-emerald-50 border-none shadow-lg text-[11px] font-black uppercase tracking-widest py-2"
            />
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
      </div>

      <div>
        {/* History Feed (full width) */}
        <div className="sa-card overflow-hidden">
          <div className="bg-[#0F766E] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <HiSignal className="h-4 w-4 opacity-90" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Previous Announcements</h2>
            </div>
            <p className="text-xs font-bold text-white/80">
              {isLoading ? 'Loading...' : `${announcements.length} Sent`}
            </p>
          </div>

          <div className="p-4">
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
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" icon={HiEye} className="text-slate-400 hover:text-slate-700" onClick={() => handleViewClick(ann)} />
                    <Button variant="ghost" size="sm" icon={HiPencilSquare} className="text-slate-400 hover:text-emerald-600" onClick={() => handleEditClick(ann)} />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={HiTrash}
                      className="text-slate-400 hover:text-rose-600"
                      onClick={() => {
                        setSelectedAnnouncement(ann)
                        setShowRevokeModal(true)
                      }}
                    />
                  </div>
                ),
              }))}
            />
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Announcement"
        description="Broadcast a new message to your tenant organizations."
        icon={HiMegaphone}
        size="md"
      >
        <div className="space-y-5 p-2">
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
              className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium focus:bg-white focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none shadow-sm"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-slate-900 transition-all cursor-pointer"
                
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-[#0F766E] transition-all cursor-pointer"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-[#0F766E] transition-all cursor-pointer"
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
                  className="border-emerald-100 bg-emerald-50/20"
                />
                {!!formErrors.scheduledAt && (
                  <p className="px-1 text-[11px] font-bold text-rose-600">{formErrors.scheduledAt}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-100">
            <Button
              label="Cancel"
              variant="ghost"
              className="flex-1 font-bold text-slate-400"
              onClick={() => setShowCreateModal(false)}
              disabled={isSubmitting}
            />
            <Button
              label={newAnnouncement.isScheduled ? 'Schedule Announcement' : 'Post Announcement'}
              variant="primary"
              icon={newAnnouncement.isScheduled ? HiCalendarDays : HiRocketLaunch}
              className="flex-1 bg-[#0F766E] hover:bg-[#0D5F57] border-none shadow-lg shadow-emerald-900/10 text-white text-[11px] uppercase tracking-widest font-black"
              onClick={async () => {
                const ok = await handleSend()
                if (ok) setShowCreateModal(false)
              }}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={viewAnnouncement?.title || 'Announcement'}
        description={`Audience: ${viewAnnouncement?.audience || '-'} · Type: ${viewAnnouncement?.type || '-'}`}
        icon={HiMegaphone}
        size="md"
      >
        <div className="space-y-5 p-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
              <div className="mt-1">
                {viewAnnouncement && <Badge label={viewAnnouncement.status} color={viewAnnouncement.status === 'Scheduled' ? 'amber' : viewAnnouncement.status === 'Processing' ? 'indigo' : 'green'} variant="glass" />}
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority</p>
              <div className="mt-1">
                {viewAnnouncement && <Badge label={viewAnnouncement.priority} color={viewAnnouncement.priority === 'Immediate' ? 'rose' : viewAnnouncement.priority === 'High' ? 'orange' : 'slate'} variant="glass" />}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Message</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{viewAnnouncement?.message}</p>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-xs font-semibold text-slate-600">Recipients: {viewAnnouncement?.recipients ?? 0}</span>
            <span className="text-xs font-semibold text-slate-600">
              {viewAnnouncement?.status === 'Scheduled' ? `Scheduled: ${viewAnnouncement?.scheduledAt || '-'}` : `Sent: ${viewAnnouncement?.sentDate || '-'}`}
            </span>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Announcement"
        description="Update the content or priority. Saving will resend the notification to organizations."
        icon={HiMegaphone}
        size="md"
      >
        <div className="space-y-6 p-2">
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-[#0F766E] transition-all cursor-pointer"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-[#0F766E] transition-all cursor-pointer"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-[#0F766E] transition-all cursor-pointer"
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
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium focus:bg-white focus:border-emerald-500 outline-none transition-all resize-none shadow-sm"
            value={editForm.message}
            onChange={(e) => {
              setEditErrors((p) => ({ ...p, message: undefined }))
              setEditForm({ ...editForm, message: e.target.value })
            }}
          />
          {!!editErrors.message && <p className="px-1 -mt-3 text-[11px] font-bold text-rose-600">{editErrors.message}</p>}
          <div className="flex gap-4 pt-6 border-t border-slate-50">
            <Button
              label="Cancel"
              variant="ghost"
              className="flex-1 font-bold text-slate-400"
              onClick={() => setShowEditModal(false)}
              disabled={isUpdating}
            />
            <Button
              label={isUpdating ? 'Saving…' : 'Save Changes'}
              variant="primary"
              className="flex-1 bg-[#0F766E] hover:bg-[#0D5F57] border-none shadow-lg shadow-emerald-900/10 text-white"
              onClick={handleSaveEdit}
              disabled={isUpdating}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        title="Delete Announcement"
        description="Are you sure you want to delete this announcement? This action cannot be undone."
        icon={HiExclamationTriangle}
      >
        <div className="space-y-6 p-2">
          <div className="flex gap-4 pt-2">
            <Button
              label="Cancel"
              variant="ghost"
              className="flex-1 font-bold text-slate-400 border-transparent"
              onClick={() => setShowRevokeModal(false)}
              disabled={isDeleting}
            />
            <Button
              label={isDeleting ? 'Deleting…' : 'Delete'}
              variant="danger"
              className="flex-1 bg-rose-600 border-none shadow-lg shadow-rose-100 uppercase text-[10px] font-black tracking-widest"
              onClick={handleRevoke}
              disabled={isDeleting}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
