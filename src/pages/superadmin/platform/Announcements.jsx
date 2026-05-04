import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { 
  HiOutlineChatBubbleLeftRight, 
  HiPencilSquare, 
  HiTrash, 
  HiMegaphone, 
  HiUsers, 
  HiCalendarDays,
  HiExclamationTriangle,
  HiInformationCircle,
  HiRocketLaunch,
  HiClock
} from 'react-icons/hi2'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'Platform Upgrade v2.4.0',
      message: 'New performance improvements and bug fixes deployed.',
      audience: 'All Tenants',
      type: 'Info',
      sentDate: '01 Apr 2026',
      recipients: 48,
    },
    {
      id: 2,
      title: 'Scheduled Maintenance',
      message: 'Planned downtime on 15 Apr from 02:00–04:00 UTC.',
      audience: 'All Tenants',
      type: 'Warning',
      sentDate: '08 Apr 2026',
      recipients: 48,
    },
    {
      id: 3,
      title: 'Trial Expiry Reminder',
      message: 'Your trial ends in 3 days. Please upgrade to continue.',
      audience: 'Trial Tenants',
      type: 'Critical',
      sentDate: '09 Apr 2026',
      recipients: 6,
    },
  ])

  // New Announcement Form State
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', audience: 'All Tenants', type: 'Info', schedule: '' })

  // Modal States
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRevokeModal, setShowRevokeModal] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', message: '', audience: 'All Tenants', type: 'Info' })

  const handleSend = () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      alert('Title and Message are required.')
      return
    }
    const id = Date.now()
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    setAnnouncements([{ ...newAnnouncement, id, sentDate: date, recipients: 48 }, ...announcements])
    setNewAnnouncement({ title: '', message: '', audience: 'All Tenants', type: 'Info', schedule: '' })
    alert('Announcement broadcasted successfully!')
  }

  const handleEditClick = (ann) => {
    setSelectedAnnouncement(ann)
    setEditForm({ title: ann.title, message: ann.message, audience: ann.audience, type: ann.type })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    setAnnouncements(announcements.map(a => a.id === selectedAnnouncement.id ? { ...a, ...editForm } : a))
    setShowEditModal(false)
  }

  const handleRevoke = () => {
    setAnnouncements(announcements.filter(a => a.id !== selectedAnnouncement.id))
    setShowRevokeModal(false)
    alert('Announcement revoked and removed from tenant dashboards.')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Broadcast</h1>
          <p className="mt-1 text-sm text-gray-500">Communicate critical updates and news to your tenant network.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Professional Creation Panel */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sticky top-6">
            <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
              <HiMegaphone className="text-blue-500 h-5 w-5" />
              Compose Message
            </h2>
            <div className="space-y-4">
              <Input label="Broadcast Title" placeholder="e.g. System Maintenance Notice" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} />
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-500 uppercase tracking-wider">Content Body</label>
                <textarea
                  rows={6}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                  placeholder="What would you like to announce?"
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Target Audience</label>
                    <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none" value={newAnnouncement.audience} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, audience: e.target.value })}>
                      <option>All Tenants</option><option>Trial Only</option><option>Enterprise Only</option>
                    </select>
                 </div>
                 <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Priority Level</label>
                    <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none" value={newAnnouncement.type} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}>
                      <option>Info</option><option>Warning</option><option>Critical</option><option>Update</option>
                    </select>
                 </div>
              </div>
              <div className="pt-4 flex gap-2">
                <Button label="Schedule" variant="ghost" icon={HiCalendarDays} className="flex-1" onClick={() => alert('Scheduling feature coming soon!')} />
                <Button label="Broadcast Now" variant="primary" icon={HiRocketLaunch} className="flex-1" onClick={handleSend} />
              </div>
            </div>
          </div>
        </div>

        {/* Professional History Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Broadcast History</h2>
            <Badge label={`${announcements.length} Sent`} color="gray" />
          </div>
          
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      ann.type === 'Critical' ? 'bg-red-50 text-red-600' : 
                      ann.type === 'Warning' ? 'bg-amber-50 text-amber-600' : 
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {ann.type === 'Critical' ? <HiExclamationTriangle className="h-5 w-5" /> : 
                       ann.type === 'Warning' ? <HiClock className="h-5 w-5" /> : 
                       <HiInformationCircle className="h-5 w-5" />}
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-gray-900">{ann.title}</h3>
                       <p className="text-[10px] text-gray-400 uppercase tracking-wider">{ann.sentDate} · BY PLATFORM ADMIN</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" icon={HiPencilSquare} onClick={() => handleEditClick(ann)} />
                    <Button variant="ghost" size="sm" icon={HiTrash} className="text-red-500 hover:bg-red-50" onClick={() => { setSelectedAnnouncement(ann); setShowRevokeModal(true); }} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed pl-11">{ann.message}</p>
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-6 pl-11">
                   <div className="flex items-center gap-1.5">
                      <HiUsers className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{ann.audience}</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <HiRocketLaunch className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{ann.recipients} REACHED</span>
                   </div>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
               <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
                  <HiMegaphone className="mx-auto h-12 w-12 text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400">No active announcements in history.</p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Modals */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Modify Broadcast" size="md">
        <div className="space-y-4">
          <Input label="Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
          <textarea
            rows={5}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
            value={editForm.message}
            onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
          />
          <div className="flex gap-2 pt-4">
            <Button label="Cancel" variant="ghost" className="flex-1" onClick={() => setShowEditModal(false)} />
            <Button label="Save Changes" variant="primary" className="flex-1" onClick={handleSaveEdit} />
          </div>
        </div>
      </Modal>

      <Modal isOpen={showRevokeModal} onClose={() => setShowRevokeModal(false)} title="Security Confirmation">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Revoking this broadcast will immediately remove it from all tenant dashboards. This action is recorded in the platform audit logs.
          </p>
          <div className="flex gap-2 pt-2">
            <Button label="Cancel" variant="ghost" className="flex-1" onClick={() => setShowRevokeModal(false)} />
            <Button label="Revoke Broadcast" variant="danger" className="flex-1" onClick={handleRevoke} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
