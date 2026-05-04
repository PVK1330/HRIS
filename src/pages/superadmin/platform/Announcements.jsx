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
  HiClock,
  HiQuestionMarkCircle,
  HiSparkles,
  HiSignal
} from 'react-icons/hi2'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'Platform Upgrade v2.4.0',
      message: 'New performance improvements and bug fixes deployed.',
      audience: 'All Organizations',
      type: 'Info',
      sentDate: '01 Apr 2026',
      recipients: 48,
    },
    {
      id: 2,
      title: 'Scheduled Maintenance',
      message: 'Planned downtime on 15 Apr from 02:00–04:00 UTC.',
      audience: 'All Organizations',
      type: 'Warning',
      sentDate: '08 Apr 2026',
      recipients: 48,
    },
    {
      id: 3,
      title: 'Trial Expiry Reminder',
      message: 'Your trial ends in 3 days. Please upgrade to continue.',
      audience: 'Trial Orgs',
      type: 'Critical',
      sentDate: '09 Apr 2026',
      recipients: 6,
    },
  ])

  // New Announcement Form State
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', audience: 'All Organizations', type: 'Info', schedule: '' })

  // Modal States
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRevokeModal, setShowRevokeModal] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', message: '', audience: 'All Organizations', type: 'Info' })

  const handleSend = () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      return
    }
    const id = Date.now()
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    setAnnouncements([{ ...newAnnouncement, id, sentDate: date, recipients: 48 }, ...announcements])
    setNewAnnouncement({ title: '', message: '', audience: 'All Organizations', type: 'Info', schedule: '' })
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
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
             <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-sm">
                <HiMegaphone className="h-4.5 w-4.5" />
             </div>
             <h1 className="text-xl font-bold text-slate-900 tracking-tight">Announcements</h1>
             <div className="group relative">
                <HiQuestionMarkCircle className="h-4 w-4 text-slate-300 cursor-help hover:text-amber-500 transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-slate-900 text-white text-[10px] leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl border border-white/10">
                   <p className="font-bold text-amber-400 mb-1 uppercase tracking-widest">Messaging Center</p>
                   Send important updates and news to all organizations.
                   <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
             </div>
          </div>
          <p className="text-[11px] font-medium text-slate-500">Send system updates to all organizations.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-100">
           <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
           <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Broadcast Engine: Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Professional Creation Panel */}
        <div className="lg:col-span-1">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] sticky top-6">
            <h2 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tight">
               <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                  <HiSparkles className="h-4 w-4" />
               </div>
               Compose Dispatch
            </h2>
            <div className="space-y-6">
              <Input label="Broadcast Headline" placeholder="e.g. Infrastructure Maintenance" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} />
              <div>
                <label className="mb-2 block text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Message Payload</label>
                <textarea
                  rows={6}
                  className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all resize-none shadow-sm"
                  placeholder="Draft your global communication..."
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Target Audience</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-amber-500 transition-all cursor-pointer" value={newAnnouncement.audience} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, audience: e.target.value })}>
                    <option>All Organizations</option><option>Trial Only</option><option>Enterprise Only</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Priority Node</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-amber-500 transition-all cursor-pointer" value={newAnnouncement.type} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}>
                    <option>Info</option><option>Warning</option><option>Critical</option><option>Update</option>
                  </select>
                </div>
              </div>
              <div className="pt-6 flex gap-3">
                <Button label="Schedule" variant="ghost" icon={HiCalendarDays} className="flex-1 font-bold text-slate-400 border-transparent" />
                <Button label="Save" variant="primary" icon={HiRocketLaunch} className="flex-1 bg-amber-500 hover:bg-amber-600 border-none shadow-lg shadow-amber-100" onClick={handleSend} />
              </div>
            </div>
          </div>
        </div>

        {/* Professional History Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transmission History</h2>
            <Badge label={`${announcements.length} Dispatches Sent`} color="gray" variant="glass" />
          </div>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="group relative rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_15px_40px_rgba(0,0,0,0.02)] transition-all hover:shadow-2xl hover:shadow-amber-50 hover:border-amber-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm ${
                        ann.type === 'Critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        ann.type === 'Warning' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                      {ann.type === 'Critical' ? <HiExclamationTriangle className="h-6 w-6" /> :
                        ann.type === 'Warning' ? <HiClock className="h-6 w-6" /> :
                          <HiInformationCircle className="h-6 w-6" />}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight">{ann.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ann.sentDate}</span>
                         <div className="h-1 w-1 rounded-full bg-slate-200" />
                         <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Platform Kernel Dispatch</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" icon={HiPencilSquare} className="text-slate-400 hover:text-blue-600" onClick={() => handleEditClick(ann)} />
                    <Button variant="ghost" size="sm" icon={HiTrash} className="text-slate-400 hover:text-rose-600" onClick={() => { setSelectedAnnouncement(ann); setShowRevokeModal(true); }} />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-600 leading-relaxed pl-16 pr-4">{ann.message}</p>
                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center gap-8 pl-16">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                       <HiUsers className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{ann.audience}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                       <HiSignal className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{ann.recipients} ECOSYSTEM NODES REACHED</span>
                  </div>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="rounded-[2.5rem] border border-dashed border-slate-200 py-20 text-center bg-slate-50/50">
                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                   <HiMegaphone className="h-8 w-8 text-slate-200" />
                </div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Transmission buffer empty</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Modals */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modify Governance Dispatch"
        description="Update the content or priority parameters of your active platform broadcast."
        icon={HiMegaphone}
        size="md"
      >
        <div className="space-y-6 p-2">
          <Input label="Dispatch Headline" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
          <textarea
            rows={5}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium focus:bg-white focus:border-amber-500 outline-none transition-all resize-none shadow-sm"
            value={editForm.message}
            onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
          />
          <div className="flex gap-4 pt-6 border-t border-slate-50">
            <Button label="Cancel" variant="ghost" className="flex-1 font-bold text-slate-400" onClick={() => setShowEditModal(false)} />
            <Button label="Save" variant="primary" className="flex-1 bg-amber-500 border-none shadow-lg shadow-amber-100" onClick={handleSaveEdit} />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        title="Security Authorization Required"
        description="Revoking this broadcast will immediately purge it from all organization dashboards globally. This security event will be recorded in the forensic audit logs."
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
