import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
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

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [isLoading, setIsLoading] = useState(false)

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

  // Modal States
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRevokeModal, setShowRevokeModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [viewAnnouncement, setViewAnnouncement] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', message: '', audience: 'All Organizations', type: 'Info', priority: 'Normal', scheduledAt: '' })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const mapAnnouncement = (row) => ({
    id: row.id,
    title: row.title,
    message: row.message,
    audience: row.audience,
    type: row.type,
    priority: row.priority || 'Normal',
    status: row.status || 'Sent',
    sentDate: row.sent_date ? new Date(row.sent_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
    scheduledAt: row.scheduled_at ? new Date(row.scheduled_at).toLocaleString() : null,
    recipients: row.recipients ?? 0,
  })

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true)
      const response = await superadminService.getAnnouncements()
      const list = response?.data?.data?.announcements || []
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

  const handleSend = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Title and message are required.',
        confirmButtonColor: '#0F766E',
      })
      return
    }
    try {
      await superadminService.createAnnouncement({
        title: newAnnouncement.title,
        message: newAnnouncement.message,
        audience: newAnnouncement.audience,
        type: newAnnouncement.type,
        priority: newAnnouncement.priority,
        scheduledAt: newAnnouncement.isScheduled ? newAnnouncement.scheduledAt : null,
      })
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
      Swal.fire({
        icon: 'success',
        title: 'Announcement Sent',
        text: 'Announcement has been published successfully.',
        timer: 1400,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Failed to create announcement:', error)
      Swal.fire({
        icon: 'error',
        title: 'Create Failed',
        text: error.response?.data?.message || 'Failed to create announcement.',
        confirmButtonColor: '#0F766E',
      })
    }
  }

  const handleEditClick = (ann) => {
    setSelectedAnnouncement(ann)
    setEditForm({ title: ann.title, message: ann.message, audience: ann.audience, type: ann.type, priority: ann.priority })
    setShowEditModal(true)
  }

  const handleViewClick = (ann) => {
    setViewAnnouncement(ann)
    setShowViewModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedAnnouncement) return
    try {
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
    }
  }

  const handleRevoke = async () => {
    if (!selectedAnnouncement) return
    try {
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
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
             <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm">
                <HiMegaphone className="h-4.5 w-4.5" />
             </div>
             <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Announcements</h1>
             <div className="group relative">
                <HiQuestionMarkCircle className="h-4 w-4 text-slate-300 cursor-help hover:text-slate-900 transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-slate-900 text-white text-[10px] leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl border border-white/10">
                   <p className="font-bold text-emerald-400 mb-1 uppercase tracking-widest">Help Center</p>
                   Send important updates and news to all registered organizations.
                   <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
             </div>
          </div>
          <p className="text-[11px] font-medium text-slate-500">Communicate with all your platform tenants.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-100">
           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">System Status: Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Creation Panel */}
        <div className="lg:col-span-1">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] sticky top-6">
            <h2 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tight">
               <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                  <HiSparkles className="h-4 w-4" />
               </div>
               New Announcement
            </h2>
            <div className="space-y-6">
              <Input label="Announcement Title" placeholder="e.g. Scheduled Maintenance" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} />
              <div>
                <label className="mb-2 block text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Announcement Message</label>
                <textarea
                  rows={6}
                  className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all resize-none shadow-sm"
                  placeholder="Type your message here..."
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Target Audience</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-slate-900 transition-all cursor-pointer" value={newAnnouncement.audience} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, audience: e.target.value })}>
                    <option>All Organizations</option>
                    <option>Trial Only</option>
                    <option>Enterprise Only</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Priority</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-slate-900 transition-all cursor-pointer" value={newAnnouncement.priority} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}>
                    <option>Normal</option>
                    <option>High</option>
                    <option>Immediate</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Schedule Announcement</label>
                   <button 
                     onClick={() => setNewAnnouncement({ ...newAnnouncement, isScheduled: !newAnnouncement.isScheduled })}
                     className={`w-10 h-5 rounded-full transition-all duration-300 flex items-center px-1 ${newAnnouncement.isScheduled ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'}`}
                   >
                      <div className="h-3.5 w-3.5 bg-white rounded-full shadow-sm" />
                   </button>
                </div>
                
                {newAnnouncement.isScheduled && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <Input 
                      type="datetime-local" 
                      value={newAnnouncement.scheduledAt} 
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, scheduledAt: e.target.value })}
                      className="border-emerald-100 bg-emerald-50/20"
                    />
                  </div>
                )}
              </div>

              <div className="pt-6">
                <Button 
                  label={newAnnouncement.isScheduled ? "Schedule Announcement" : "Post Announcement"} 
                  variant="primary" 
                  icon={newAnnouncement.isScheduled ? HiCalendarDays : HiRocketLaunch} 
                  className="w-full bg-slate-900 hover:bg-slate-800 border-none shadow-lg shadow-slate-100 py-6 text-sm uppercase tracking-widest font-black" 
                  onClick={handleSend} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* History Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Previous Announcements</h2>
            <Badge label={isLoading ? 'Loading...' : `${announcements.length} Sent`} color="gray" variant="glass" />
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
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" icon={HiEye} className="text-slate-400 hover:text-slate-700" onClick={() => handleViewClick(ann)} />
                  <Button variant="ghost" size="sm" icon={HiPencilSquare} className="text-slate-400 hover:text-emerald-600" onClick={() => handleEditClick(ann)} />
                  <Button variant="ghost" size="sm" icon={HiTrash} className="text-slate-400 hover:text-rose-600" onClick={() => { setSelectedAnnouncement(ann); setShowRevokeModal(true); }} />
                </div>
              ),
            }))}
          />
        </div>
      </div>

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
          <Input label="Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
          <textarea
            rows={5}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium focus:bg-white focus:border-emerald-500 outline-none transition-all resize-none shadow-sm"
            value={editForm.message}
            onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
          />
          <div className="flex gap-4 pt-6 border-t border-slate-50">
            <Button label="Cancel" variant="ghost" className="flex-1 font-bold text-slate-400" onClick={() => setShowEditModal(false)} />
            <Button label="Save Changes" variant="primary" className="flex-1 bg-slate-900 border-none shadow-lg shadow-slate-100" onClick={handleSaveEdit} />
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
            <Button label="Cancel" variant="ghost" className="flex-1 font-bold text-slate-400 border-transparent" onClick={() => setShowRevokeModal(false)} />
            <Button label="Delete" variant="danger" className="flex-1 bg-rose-600 border-none shadow-lg shadow-rose-100 uppercase text-[10px] font-black tracking-widest" onClick={handleRevoke} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
