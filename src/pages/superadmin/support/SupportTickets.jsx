import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { superadminService } from '../../../services/superadminService.js'
import {
  HiPaperClip,
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
  HiEye,
  HiXMark,
  HiCalendarDays,
  HiUser,
  HiBuildingOffice,
  HiTag,
} from 'react-icons/hi2'
import Swal from 'sweetalert2'

// Status color mapping
const getStatusColor = (status) => {
  switch (status) {
    case 'Waiting':
      return 'amber'
    case 'In Progress':
      return 'blue'
    case 'Resolved':
      return 'green'
    case 'Closed':
    case 'Rejected':
      return 'slate'
    case 'Open':
    default:
      return 'red'
  }
}

// Priority color mapping
const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'low':
      return 'green'
    case 'medium':
      return 'orange'
    case 'high':
      return 'red'
    default:
      return 'slate'
  }
}

const STATUS_OPTIONS = ['Waiting', 'In Progress', 'Resolved', 'Closed']

export default function SupportTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [ticketStatus, setTicketStatus] = useState('Waiting')
  const [replyText, setReplyText] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingTicketDetails, setLoadingTicketDetails] = useState(false)
  const [pendingTicketId, setPendingTicketId] = useState(null)

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superadminService.getSupportTickets()
      const payload = response?.data?.data
      setTickets(Array.isArray(payload) ? payload : [])
    } catch (error) {
      setTickets([])
      setError('Unable to load support tickets. Please refresh or try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || ''
      if (hash.startsWith('#ticket-')) {
        const ticketId = parseInt(hash.replace('#ticket-', ''), 10)
        if (Number.isInteger(ticketId) && ticketId > 0) {
          setPendingTicketId(ticketId)
        }
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (!pendingTicketId || tickets.length === 0) return
    const ticket = tickets.find((t) => Number(t.id) === pendingTicketId || Number(t.ticketId) === pendingTicketId)
    if (ticket) {
      handleViewTicket(ticket, { setHash: false })
      setPendingTicketId(null)
    }
  }, [pendingTicketId, tickets])

  useEffect(() => {

  }, [tickets])

  const handleViewTicket = async (ticket, { setHash = true } = {}) => {
    if (setHash && ticket?.id) {
      window.history.replaceState(null, '', `#ticket-${ticket.id}`)
    }
    setSelectedTicket(ticket)
    setTicketStatus(ticket.status || 'Waiting')
    setReplyText('')
    setLoadingTicketDetails(true)
    setShowDetailsModal(true)

    try {
      const response = await superadminService.getSupportTicketById(ticket.id)
      const data = response?.data?.data
      if (data) {
        setSelectedTicket(data)
        setTicketStatus(data.status || 'Waiting')
      }
    } catch (error) {
      toast.error('Unable to load ticket details')
    } finally {
      setLoadingTicketDetails(false)
    }
  }

  const handleSaveTicket = async () => {
    if (!selectedTicket) return
    if (!replyText.trim() && ticketStatus === selectedTicket.status) {
      toast.error('No changes detected. Please update status or add a response.')
      return
    }
    if (!replyText.trim()) {
      toast.error('Super Admin response is required when updating the ticket.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        message: replyText.trim(),
      }
      if (ticketStatus && ticketStatus !== selectedTicket.status) payload.status = ticketStatus


      const response = await superadminService.updateSupportTicket(selectedTicket.id, payload)
      const updated = response?.data?.data?.ticket || response?.data?.data || response?.data

      if (!updated) {
        throw new Error('Ticket update returned invalid response')
      }

      setSelectedTicket(updated)
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)))
      if (replyText.trim()) setReplyText('')
      setTicketStatus(updated.status || 'Waiting')
      toast.success('Ticket updated successfully')
      setShowDetailsModal(false)
      if (window.location.hash.startsWith('#ticket-')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
      await fetchTickets()
    } catch (error) {
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
      confirmButtonColor: '#dc2626',
    })

    if (!result.isConfirmed) return

    try {
      await superadminService.deleteSupportTicket(ticketId)
      setTickets((prev) => prev.filter((t) => t.id !== ticketId))
      toast.success('Ticket deleted successfully')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete ticket')
    }
  }

  // Calculate stats
  const stats = {
    total: tickets.length,
    waiting: tickets.filter(t => (t.status || 'Waiting') === 'Waiting').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
  }

  const selectedTicketStatus = selectedTicket?.status || 'Waiting'

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      {/* Top Title Bar with Moved Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Support Tickets</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Support</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Tickets</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={fetchTickets} className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm">
            <HiArrowPath className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {/* Stats Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          { label: 'TOTAL', count: stats.total.toString(), bgColor: 'bg-[#0F172A]', icon: HiTicket },
          { label: 'WAITING', count: stats.waiting.toString(), bgColor: 'bg-[#F59E0B]', icon: HiClock },
          { label: 'IN PROGRESS', count: stats.inProgress.toString(), bgColor: 'bg-[#3B82F6]', icon: HiExclamationCircle },
          { label: 'RESOLVED', count: stats.resolved.toString(), bgColor: 'bg-[#10B981]', icon: HiCheckCircle }
        ].map((card, idx) => (
            <div
              key={idx}
              className="group flex items-center gap-3.5 rounded-none border border-slate-200 p-4 text-left transition-all hover:bg-slate-50/50 min-w-0 shadow-sm bg-white"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}><card.icon className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold uppercase tracking-wider truncate leading-none text-slate-400">{card.label}</div>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
              </div>
            </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
          <HiExclamationCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Main Table Registry Area */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Ticket Registry</h2>
        </div>
        <Table
          maxHeightClass="max-h-full"
          loading={loading}
          emptyMessage={tickets.length === 0 && !loading ? 'No support tickets found' : 'No data to display'}
          columns={[
            {
              key: 'ticket',
              label: 'Ticket ID & Subject',
              render: (_, ticket) => (
                <div className="space-y-1">
                  <div className="text-sm font-bold text-blue-600">{ticket.ticketId || `TKT-${String(ticket.id).padStart(3, '0')}`}</div>
                  <div className="text-xs text-slate-500 truncate max-w-[200px]">{ticket.subject || '-'}</div>
                </div>
              )
            },
            {
              key: 'org',
              label: 'Organization',
              render: (_, ticket) => (
                <div className="flex items-center gap-2">
                  <HiBuildingOffice className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-700">{ticket.tenantName || ticket.organization || '-'}</span>
                </div>
              )
            },
            {
              key: 'createdAt',
              label: 'Created Date & Time',
              render: (_, ticket) => (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <HiCalendarDays className="h-4 w-4 text-slate-400" />
                  {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '-'}
                </div>
              )
            },
            {
              key: 'priority',
              label: 'Priority',
              render: (_, ticket) => {
                const color = getPriorityColor(ticket.priority)
                return <Badge label={ticket.priority || 'Normal'} color={color} />
              }
            },
            {
              key: 'status',
              label: 'Status',
              render: (_, ticket) => {
                const color = getStatusColor(ticket.status || 'Waiting')
                return <Badge label={ticket.status || 'Waiting'} color={color} />
              }
            },
            {
              key: 'actions',
              label: 'Control',
              render: (_, ticket) => (
                <div className="flex items-center justify-start gap-2">
                  <button type="button" onClick={() => handleViewTicket(ticket)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-slate-500 text-white transition-colors hover:bg-slate-600" title="View Details"><HiEye className="h-4 w-4" /></button>
                  <button type="button" onClick={() => handleDeleteTicket(ticket.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600" title="Delete Ticket"><HiTrash className="h-4 w-4" /></button>
                </div>
              )
            },
          ]}
          data={tickets}
          rowClassName={() => 'hover:bg-slate-50 transition-colors'}
        />
      </div>

      {/* Ticket Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          if (window.location.hash.startsWith('#ticket-')) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
          }
        }}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">{selectedTicket?.subject || 'Ticket Details'}</h2>
            <p className="text-sm text-slate-500">{selectedTicket ? (selectedTicket.ticketId || `TKT-${String(selectedTicket.id).padStart(3, '0')}`) : ''}</p>
          </div>
        }
        size="2xl"
        bodyClassName="overflow-hidden"
      >
        {selectedTicket && (
          <div className="flex h-full min-h-[calc(90vh-140px)] flex-col overflow-hidden">
            <div className="overflow-y-auto px-6 py-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Ticket ID</p>
                        <p className="text-lg font-semibold text-slate-900 mt-1">{selectedTicket.ticketId || `TKT-${String(selectedTicket.id).padStart(3, '0')}`}</p>
                      </div>
                      <Badge label={selectedTicket.status || 'Waiting'} color={getStatusColor(selectedTicket.status || 'Waiting')} />
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Category</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{selectedTicket.category || '-'}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Priority</p>
                        <Badge label={selectedTicket.priority || 'Normal'} color={getPriorityColor(selectedTicket.priority)} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Admin Name</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{selectedTicket.adminName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Organization</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{selectedTicket.tenantName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Created</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : '-'}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 mb-3">Description</p>
                    <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{selectedTicket.description || '-'}</p>
                  </div>

                  {(selectedTicket.attachmentUrl || selectedTicket.attachment_url) && (
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 mb-2">Attachment</p>
                      <a
                        href={selectedTicket.attachmentUrl || selectedTicket.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-emerald-700"
                      >
                        <HiPaperClip className="h-4 w-4 text-slate-500" />
                        {selectedTicket.attachmentUrl?.split('/').pop() || selectedTicket.attachment_url?.split('/').pop() || 'Download attachment'}
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 mb-2">Update Status</p>
                      <select
                        value={ticketStatus}
                        onChange={(e) => setTicketStatus(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 mb-2">Super Admin Response</p>
                      <textarea
                        className="h-full w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 resize-none"
                        placeholder="Add response, notes, or resolution details..."
                        rows={8}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Conversation History</p>
                    <p className="text-[11px] text-slate-400">All messages related to this ticket</p>
                  </div>
                  <span className="text-[11px] text-slate-500">{(selectedTicket.conversation || []).length} messages</span>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {(selectedTicket.conversation || []).length ? (
                    (selectedTicket.conversation || []).map((msg) => (
                      <div
                        key={`${msg.id}-${msg.createdAt}-${msg.senderRole}`}
                        className={`rounded-3xl border-l-4 bg-white p-4 shadow-sm ${msg.senderRole === 'admin' ? 'border-sky-500' : 'border-emerald-500'}`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${msg.senderRole === 'admin' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {msg.senderRole === 'admin' ? 'Admin' : 'Super Admin'}
                            </span>
                            <span className="text-xs font-semibold text-slate-700">{msg.senderName}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <Badge label={msg.status || selectedTicket.status || 'Waiting'} color={getStatusColor(msg.status || selectedTicket.status || 'Waiting')} />
                            <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</span>
                            <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}</span>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No conversation history yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTicket}
                  disabled={saving || loadingTicketDetails || (!replyText.trim() && ticketStatus === selectedTicketStatus)}
                  className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64] disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}



