import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Avatar } from '../../../components/ui/Avatar.jsx'
import { superadminService } from '../../../services/superadminService.js'
import { resolveFileUrl } from '../../../utils/fileUrl.js'
import {
  HiPaperClip,
  HiCheckCircle,
  HiClock,
  HiExclamationCircle,
  HiChatBubbleLeftRight,
  HiPaperAirplane,
  HiCheck,
  HiTrash,
  HiArrowPath,
  HiQuestionMarkCircle,
  HiTicket,
  HiLifebuoy,
  HiHeart,
  HiEye,
  HiXMark,
  HiCalendarDays,
  HiUser,
  HiBuildingOffice,
  HiFolderOpen,
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

// Tenant-unique identity for a ticket. `support_tickets.id` is a per-tenant
// serial, so two tenants can both have ticket #1 — keying React rows / list
// updates on `id` alone collides them (duplicate keys → ghost rows on re-render,
// and updates/deletes hitting the wrong tenant's ticket). Key on tenant + id.
const ticketKey = (t) => `${t?.dbName ?? t?.tenantId ?? ''}:${t?.id ?? ''}`

export default function SupportTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [ticketStatus, setTicketStatus] = useState('Waiting')
  const [replyText, setReplyText] = useState('')
  const [saving, setSaving] = useState(false)
  const conversationContainerRef = useRef(null)

  const [loadingTicketDetails, setLoadingTicketDetails] = useState(false)
  const [pendingTicketId, setPendingTicketId] = useState(null)

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superadminService.getSupportTickets()
      const payload = response?.data?.data
      setTickets(Array.isArray(payload) ? payload : [])
    } catch {
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
    const ticket = tickets.find(
      (t) => Number(t.id) === pendingTicketId || Number(t.ticketId) === pendingTicketId
    )
    if (ticket) {
      handleViewTicket(ticket, { setHash: false })
      setPendingTicketId(null)
    }
  }, [pendingTicketId, tickets])

  // FIX: Removed empty useEffect(() => {}, [tickets]) — it served no purpose.

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
      const response = await superadminService.getSupportTicketById(ticket.id, ticket.dbName)
      const data = response?.data?.data
      if (data) {
        setSelectedTicket(data)
        setTicketStatus(data.status || 'Waiting')
      }
    } catch {
      toast.error('Failed to load ticket details')
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
        tenantDb: selectedTicket.dbName,
      }
      if (ticketStatus && ticketStatus !== selectedTicket.status) payload.status = ticketStatus

      const response = await superadminService.updateSupportTicket(selectedTicket.id, payload)
      const updated = response?.data?.data?.ticket || response?.data?.data || response?.data

      if (!updated) {
        throw new Error('Ticket update returned invalid response')
      }

      setSelectedTicket((prev) => ({ ...prev, ...updated }))
      setTickets((prev) => prev.map((t) => (ticketKey(t) === ticketKey(selectedTicket) ? { ...t, ...updated } : t)))
      if (replyText.trim()) setReplyText('')
      setTicketStatus(updated.status || 'Waiting')
      toast.success('Ticket updated successfully')
      // Keep the modal open (chat-style) so the new message shows in the thread.
      await fetchTickets()
    } catch {
      toast.error('Unable to update ticket. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedTicket || ticketStatus === selectedTicket.status) return
    setSaving(true)
    try {
      const response = await superadminService.updateSupportTicketStatus(
        selectedTicket.id,
        ticketStatus,
        selectedTicket.dbName,
      )
      const updated = response?.data?.data || response?.data
      const newStatus = updated?.status || ticketStatus
      // Merge only status/updatedAt so the existing conversation thread is preserved.
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus, updatedAt: updated?.updatedAt ?? prev.updatedAt } : prev))
      setTickets((prev) => prev.map((t) => (ticketKey(t) === ticketKey(selectedTicket) ? { ...t, status: newStatus } : t)))
      setTicketStatus(newStatus)
      toast.success('Status updated')
    } catch {
      toast.error('Unable to update status. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTicket = async (ticket) => {
    const ticketId = ticket?.id
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
      await superadminService.deleteSupportTicket(ticketId, ticket?.dbName)
      setTickets((prev) => prev.filter((t) => ticketKey(t) !== ticketKey(ticket)))
      toast.success('Ticket deleted successfully')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete ticket')
    }
  }

  // Calculate stats
  const stats = {
    total: tickets.length,
    waiting: tickets.filter((t) => (t.status || 'Waiting') === 'Waiting').length,
    inProgress: tickets.filter((t) => t.status === 'In Progress').length,
    resolved: tickets.filter((t) => t.status === 'Resolved').length,
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">
            Support Tickets
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Support</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Tickets</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchTickets}
            className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm"
          >
            <HiArrowPath className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          { label: 'Total Tickets', count: stats.total, solid: 'bg-[#0F172A]', icon: HiTicket },
          { label: 'Open / Waiting', count: stats.waiting, solid: 'bg-amber-500', icon: HiFolderOpen },
          { label: 'In Progress', count: stats.inProgress, solid: 'bg-blue-500', icon: HiExclamationCircle },
          { label: 'Resolved', count: stats.resolved, solid: 'bg-emerald-500', icon: HiCheckCircle },
        ].map((card, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 min-w-0"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${card.solid} text-white shadow-sm`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-wider truncate leading-none text-slate-400">
                {card.label}
              </div>
              <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">
                {card.count}
              </div>
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
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Ticket Registry</h2>
        </div>
        <Table
          maxHeightClass="max-h-[600px]"
          loading={loading}
          emptyMessage={
            tickets.length === 0 && !loading ? 'No support tickets found' : 'No data to display'
          }
          columns={[
            {
              key: 'ticket',
              label: 'Ticket ID & Subject',
              render: (_, ticket) => (
                <div className="space-y-1">
                  <div className="text-sm font-bold text-blue-600">
                    {ticket.ticketId || `TKT-${String(ticket.id).padStart(3, '0')}`}
                  </div>
                  <div className="text-xs text-slate-500 truncate max-w-[200px]">
                    {ticket.subject || '-'}
                  </div>
                </div>
              ),
            },
            {
              key: 'org',
              label: 'Organisation',
              render: (_, ticket) => (
                <div className="flex items-center gap-2">
                  <HiBuildingOffice className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-700">
                    {ticket.tenantName || ticket.organization || '-'}
                  </span>
                </div>
              ),
            },
            {
              key: 'createdAt',
              label: 'Created Date & Time',
              render: (_, ticket) => (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <HiCalendarDays className="h-4 w-4 text-slate-400" />
                  {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '-'}
                </div>
              ),
            },
            {
              key: 'priority',
              label: 'Priority',
              render: (_, ticket) => {
                const color = getPriorityColor(ticket.priority)
                return <Badge label={ticket.priority || 'Normal'} color={color} />
              },
            },
            {
              key: 'status',
              label: 'Status',
              render: (_, ticket) => {
                const color = getStatusColor(ticket.status || 'Waiting')
                return <Badge label={ticket.status || 'Waiting'} color={color} />
              },
            },
            {
              key: 'actions',
              label: 'Control',
              render: (_, ticket) => (
                <div className="flex items-center justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewTicket(ticket)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-[#0F766E] text-white transition-colors hover:bg-[#0c6b64]"
                    title="View Details"
                  >
                    <HiEye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTicket(ticket)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600"
                    title="Delete Ticket"
                  >
                    <HiTrash className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
          data={tickets}
          rowKey={ticketKey}
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
        size="xl"
        showClose={true}
        bodyClassName="p-0 bg-slate-50 overscroll-contain"
        header={
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#0F766E] text-white shadow-sm">
              <HiLifebuoy className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Ticket Details
              </h2>
              <p className="text-sm font-medium text-slate-500">
                View ticket information, conversation history, and communicate directly regarding this
                support request.
              </p>
            </div>
          </div>
        }
      >
        {selectedTicket && (
          <div className="flex flex-col min-h-0 w-full mx-auto">
            <div className="p-4 sm:p-5 overflow-y-auto">
              {/* FIX: Main Content Layout — right side panel is now a proper sibling column */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left Side (col-span-8) */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[400px] sm:h-[480px]">
                    {/* Chat header */}
                    <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50 shrink-0">
                      <HiChatBubbleLeftRight className="w-5 h-5 text-[#0F766E]" />
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Conversation</h3>
                    </div>

                    {/* Messages */}
                    <div
                      className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 custom-scrollbar bg-white"
                      ref={conversationContainerRef}
                    >
                      {(selectedTicket.conversation || []).length > 0 ? (
                        (selectedTicket.conversation || []).map((msg, i) => {
                          // Superadmin is the viewer: their own (non-admin) messages sit on the right.
                          const isMine = msg.senderRole !== 'admin'
                          const name = msg.senderName || (msg.senderRole === 'admin' ? 'Admin' : 'Super Admin')
                          const text = msg.message || msg.text || ''
                          const time = msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })
                            : ''
                          return (
                            <div key={`${msg.id || i}-${msg.createdAt}-${msg.senderRole}`} className={`flex items-end gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                              <Avatar name={name} size="sm" />
                              <div className={`flex max-w-[75%] flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                <div
                                  className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${isMine
                                    ? 'bg-[#0F766E] text-white rounded-2xl rounded-br-sm'
                                    : 'bg-slate-100 text-slate-700 rounded-2xl rounded-bl-sm'}`}
                                >
                                  {text}
                                </div>
                                <div className={`mt-1 flex items-center gap-1.5 text-[11px] text-slate-400 ${isMine ? 'flex-row-reverse' : ''}`}>
                                  <span className="font-semibold text-slate-500">{isMine ? 'You' : name}</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                                  <span>{time}</span>
                                  {isMine && (
                                    <span className="inline-flex items-center text-emerald-500" title="Sent">
                                      <HiCheck className="h-3.5 w-3.5" />
                                      <HiCheck className="h-3.5 w-3.5 -ml-2.5" />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-sm text-slate-400 font-medium">No conversation history yet.</p>
                        </div>
                      )}
                    </div>

                    {/* Composer bar */}
                    <div className="border-t border-slate-100 p-3 sm:p-4 bg-white shrink-0">
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 transition-colors focus-within:border-[#0F766E] focus-within:bg-white">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && replyText.trim() && !saving) {
                              e.preventDefault()
                              handleSaveTicket()
                            }
                          }}
                          placeholder="Type Your Message"
                          className="flex-1 bg-transparent px-1 py-1.5 text-sm text-slate-800 placeholder-slate-400 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSaveTicket}
                          disabled={saving || loadingTicketDetails || !replyText.trim()}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F766E] text-white shadow-sm transition-all hover:bg-[#0c6b64] disabled:cursor-not-allowed disabled:opacity-50"
                          title="Send"
                        >
                          <HiPaperAirplane className="h-4 w-4 -rotate-45" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FIX: Right Side (col-span-4) — moved out of left column, now a proper sibling */}
                <div className="lg:col-span-4">
                  <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col gap-5 h-[400px] sm:h-[480px] overflow-y-auto custom-scrollbar">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-3">
                      Ticket Summary
                    </h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Ticket Number</span>
                        <span className="text-sm font-bold text-slate-900">
                          {selectedTicket.ticketId ||
                            `TKT-${String(selectedTicket.id).padStart(3, '0')}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Priority</span>
                        <Badge
                          label={selectedTicket.priority || 'Normal'}
                          color={getPriorityColor(selectedTicket.priority)}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Status</span>
                        <Badge
                          label={selectedTicket.status || 'Waiting'}
                          color={getStatusColor(selectedTicket.status || 'Waiting')}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Category</span>
                        <span className="text-sm font-bold text-slate-900">
                          {selectedTicket.category || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Tenant Name</span>
                        <span className="text-sm font-bold text-slate-900">
                          {selectedTicket.tenantName || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Created Date</span>
                        <span className="text-sm font-bold text-slate-900">
                          {selectedTicket.createdAt
                            ? new Date(selectedTicket.createdAt).toLocaleDateString()
                            : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Last Updated</span>
                        <span className="text-sm font-bold text-slate-900">
                          {selectedTicket.updatedAt
                            ? new Date(selectedTicket.updatedAt).toLocaleDateString()
                            : '-'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Update Status</p>
                      <select
                        value={ticketStatus}
                        onChange={(e) => setTicketStatus(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#0F766E] focus:ring-4 focus:ring-[#0F766E]/10"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleUpdateStatus}
                        disabled={saving || loadingTicketDetails || ticketStatus === selectedTicket.status}
                        className="mt-2 w-full rounded-xl bg-[#0F766E] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#0c6b64] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving ? 'Updating…' : 'Update Status'}
                      </button>
                    </div>

                    {(selectedTicket.attachmentUrl || selectedTicket.attachment_url) && (
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-2">Attachment</p>
                        <a
                          href={resolveFileUrl(selectedTicket.attachmentUrl || selectedTicket.attachment_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-[#0F766E] hover:bg-slate-100 transition-colors"
                        >
                          <HiPaperClip className="w-4 h-4" />
                          <span className="truncate">
                            {selectedTicket.attachmentUrl?.split('/').pop() ||
                              selectedTicket.attachment_url?.split('/').pop() ||
                              'Download'}
                          </span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
