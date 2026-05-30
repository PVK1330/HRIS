import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { superadminService } from '../../../services/superadminService.js'
import {
  HiPaperAirplane,
  HiUserPlus,
  HiChatBubbleLeftRight,
  HiCheckCircle,
  HiClock,
  HiExclamationCircle,
  HiUserCircle,
  HiTrash,
  HiArrowPath,
  HiQuestionMarkCircle,
  HiTicket,
  HiLifebuoy,
  HiShieldExclamation,
  HiHeart,
  HiEye
} from 'react-icons/hi2'
import Swal from 'sweetalert2'

export default function SupportTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showReplyModal, setShowReplyModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [ticketStatus, setTicketStatus] = useState('Open')
  const [replyText, setReplyText] = useState('')
  const [assignee, setAssignee] = useState('')
  const [saving, setSaving] = useState(false)
  const STATUS_OPTIONS = ['Open', 'In Progress', 'Waiting for Admin', 'Resolved', 'Closed']

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superadminService.getSupportTickets()
      const payload = response?.data?.data
      setTickets(Array.isArray(payload) ? payload : [])
    } catch (error) {
      console.error('Failed to fetch support tickets:', error)
      setTickets([])
      setError('Unable to load support tickets. Please refresh or try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleViewTicket = async (ticket) => {
    setSelectedTicket(ticket)
    setTicketStatus(ticket.status || 'Open')
    setReplyText('')
    setShowReplyModal(true)

    try {
      const response = await superadminService.getSupportTicketById(ticket.id)
      const data = response?.data?.data
      if (data) {
        setSelectedTicket(data)
        setTicketStatus(data.status || 'Open')
      }
    } catch (error) {
      console.error('Failed to load ticket details:', error)
      toast.error('Unable to load ticket details')
    }
  }

  const handleSaveTicket = async () => {
    if (!selectedTicket) return
    if (!ticketStatus && !replyText.trim()) {
      toast.error('Select a status or enter a description to update the ticket')
      return
    }

    setSaving(true)
    try {
      const payload = {}
      if (ticketStatus && ticketStatus !== selectedTicket.status) payload.status = ticketStatus
      if (replyText.trim()) payload.superAdminDescription = replyText.trim()

      const response = await superadminService.updateSupportTicket(selectedTicket.id, payload)
      const updated = response?.data?.data

      if (updated) {
        setSelectedTicket(updated)
        setTickets((prev) => prev.map((t) => (t.id === updated.id ? { ...t, status: updated.status, superAdminDescription: updated.superAdminDescription } : t)))
        toast.success('Ticket updated successfully')
        if (replyText.trim()) setReplyText('')
        setTicketStatus(updated.status)
        await fetchTickets()
        setShowReplyModal(false)
      }
    } catch (error) {
      console.error('Failed to update ticket:', error)
      toast.error('Unable to update ticket. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTicket = async (ticketId) => {
    const result = await Swal.fire({
      title: 'Delete ticket?',
      text: 'This will permanently delete the ticket and its conversation.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      confirmButtonColor: '#0F766E',
    })

    if (!result.isConfirmed) return

    try {
      await superadminService.deleteSupportTicket(ticketId)
      setTickets((prev) => prev.filter((t) => t.id !== ticketId))
      toast.success('Ticket deleted successfully')
    } catch (err) {
      console.error('Failed to delete ticket:', err)
      toast.error(err?.response?.data?.message || 'Failed to delete ticket')
    }
  }

  const handleAssign = async () => {
    if (!selectedTicket) return
    if (!assignee) return
    try {
      await superadminService.updateSupportTicket(selectedTicket.id, { assignedTo: assignee, status: 'In Progress' })
      await fetchTickets()
      toast.success('Ticket assigned successfully')
    } catch (error) {
      console.error('Failed to assign ticket:', error)
      toast.error('Unable to assign ticket')
    }
  }

  const handleResolve = async (ticketId) => {
    try {
      await superadminService.updateSupportTicket(ticketId, { status: 'Resolved' })
      await fetchTickets()
      setShowReplyModal(false)
      toast.success('Ticket marked resolved')
    } catch (error) {
      console.error('Failed to resolve ticket:', error)
      toast.error('Unable to resolve ticket')
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <HiLifebuoy className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Support</h1>
            <div className="group relative">
              <HiQuestionMarkCircle className="h-4 w-4 text-slate-300 cursor-help hover:text-emerald-500 transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-slate-900 text-white text-[10px] leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl border border-white/10">
                <p className="font-bold text-emerald-400 mb-1 uppercase tracking-widest">Support Center</p>
                Manage and resolve help requests from organization admins.
                <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
              </div>
            </div>
          </div>
          <p className="text-[11px] font-medium text-slate-500">Manage and resolve help requests.</p>
        </div>
        <Button label="Refresh" variant="ghost" icon={HiArrowPath} size="sm" className="text-slate-500 font-bold" onClick={fetchTickets} />
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="PENDING" value={tickets.filter(t => t.status === 'Open').length.toString()} icon={HiShieldExclamation} trendColor="red" />
        <StatCard title="ACTIVE" value={tickets.filter(t => t.status === 'In Progress').length.toString()} icon={HiClock} trendColor="amber" />
        <StatCard title="RESOLVED" value={tickets.filter(t => t.status === 'Resolved').length.toString()} icon={HiCheckCircle} trendColor="green" />
        <StatCard title="SATISFACTION" value="N/A" icon={HiHeart} trendColor="rose" />
      </div>

      {error && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Ticket Table */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <Table
          loading={loading}
          columns={[
            { key: 'ticket', label: 'Ticket ID & Subject' },
            { key: 'org', label: 'Organization' },
            { key: 'createdAt', label: 'Created Date & Time' },
            { key: 'priority', label: 'Priority' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: 'Control' },
          ]}
          data={tickets.map((ticket) => ({
            ticket: (
              <div className="flex flex-col py-1">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{ticket.ticketCode || `TKT-${ticket.id}`}</span>
                <span className="text-sm font-bold text-slate-900 tracking-tight truncate max-w-[280px]">{ticket.subject}</span>
              </div>
            ),
            org: <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{ticket.tenantName || ticket.tenant_name || ticket.org || ticket.org_name || 'Unknown'}</span>,
            createdAt: (
              <div className="flex flex-col py-1">
                <span className="text-sm font-semibold text-slate-900">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</span>
                <span className="text-[11px] text-slate-400 mt-1">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}</span>
              </div>
            ),
            priority: <Badge label={ticket.priority} color={ticket.priority === 'Critical' ? 'red' : ticket.priority === 'High' ? 'amber' : 'blue'} variant="glass" />,
            status: <Badge label={ticket.status} color={ticket.status === 'Open' ? 'red' : ticket.status === 'In Progress' || ticket.status === 'Waiting for Admin' ? 'amber' : ticket.status === 'Resolved' ? 'green' : 'gray'} />,
            actions: (
              <div className="flex gap-2">
                <Button  variant="ghost" size="sm" icon={HiEye} ariaLabel="View ticket" className='text-blue-600'  onClick={() => handleViewTicket(ticket)} />
                <Button variant="ghost" size="sm" icon={HiTrash} ariaLabel="Delete ticket" className="text-rose-600" onClick={() => handleDeleteTicket(ticket.id)} />
              </div>
            ),
          }))}
        />
      </div>

      {/* Professional Support Interface */}
      <Modal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        title={selectedTicket?.subject || ''}
        description={selectedTicket ? `ID: ${selectedTicket.ticketCode || selectedTicket.id} · Origin: ${selectedTicket.tenantName || selectedTicket.tenant_name || selectedTicket.org || selectedTicket.org_name || ''}` : ''}
        icon={HiTicket}
        size="lg"
      >
        {selectedTicket && (
          <div className="flex flex-col h-[700px] p-2">
            <div className="flex items-center justify-between border-b border-slate-50 pb-6 mb-6">
              <div className="flex items-center gap-4">
                <Badge label={selectedTicket.status} color={selectedTicket.status === 'Open' ? 'red' : selectedTicket.status === 'In Progress' || selectedTicket.status === 'Waiting for Admin' ? 'amber' : selectedTicket.status === 'Resolved' ? 'green' : 'gray'} variant="glass" />
                <div className="h-4 w-px bg-slate-100" />
                <div className="flex items-center gap-2">
                  <HiClock className="h-4 w-4 text-slate-300" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA: In Tracking</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Ticket ID</p>
                <p className="text-sm font-semibold text-slate-900">{selectedTicket.ticketCode || selectedTicket.id}</p>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Tenant</p>
                <p className="text-sm font-semibold text-slate-900">{selectedTicket.tenantName || selectedTicket.tenant_name || selectedTicket.org || selectedTicket.org_name || '-'}</p>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 md:col-span-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Subject</p>
                <p className="text-sm font-semibold text-slate-900">{selectedTicket.subject}</p>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Category</p>
                <p className="text-sm font-semibold text-slate-900">{selectedTicket.category}</p>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Priority</p>
                <p className="text-sm font-semibold text-slate-900">{selectedTicket.priority}</p>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Status</label>
                <select value={ticketStatus} onChange={(e) => setTicketStatus(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 transition-all">
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Created Date</p>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Created Time</p>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 md:col-span-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Description</p>
                <p className="text-sm font-medium text-slate-700 leading-relaxed">{selectedTicket.description || '-'}</p>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 md:col-span-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Attachment</p>
                {selectedTicket.attachmentUrl || selectedTicket.attachment_url ? (
                  <a href={selectedTicket.attachmentUrl || selectedTicket.attachment_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 underline">
                    View attachment
                  </a>
                ) : (
                  <p className="text-sm text-slate-500">No attachment</p>
                )}
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Assign to</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="Assignee name or email"
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 transition-all"
                  />
                  <Button variant="ghost" label="Assign" icon={HiUserPlus} onClick={handleAssign} disabled={!assignee.trim()} />
                </div>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">
                  Super Admin Description
                </label>

                <textarea
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none"
                  placeholder="Add description or update for this ticket..."
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" label="Save" className="h-[52px] rounded-[1.25rem] bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 px-6" onClick={handleSaveTicket} disabled={saving || (!replyText.trim() && ticketStatus === selectedTicket.status)} />
                <Button variant="ghost" label="Mark Resolved" icon={HiCheckCircle} className="h-[52px] rounded-[1.25rem] px-6" onClick={() => handleResolve(selectedTicket.id)} disabled={selectedTicket.status === 'Resolved'} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}


