import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { superadminService } from '../../../services/superadminService.js'
import { resolveFileUrl } from '../../../utils/fileUrl.js'
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
    } catch (err) {
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
      const response = await superadminService.getSupportTicketById(ticket.id)
      const data = response?.data?.data
      if (data) {
        setSelectedTicket(data)
        setTicketStatus(data.status || 'Waiting')
      }
    } catch (err) {
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
          {
            label: 'New Tickets',
            count: stats.total.toString(),
            color: 'text-orange-500',
            borderColor: 'border-orange-200',
            bgColor: 'bg-orange-50',
            icon: HiTicket,
            barColor: 'bg-orange-500',
            trendBg: 'bg-orange-50',
            trendColor: 'text-orange-500',
            trend: '+19.01%',
          },
          {
            label: 'Open Tickets',
            count: stats.waiting.toString(),
            color: 'text-purple-500',
            borderColor: 'border-purple-200',
            bgColor: 'bg-purple-50',
            icon: HiFolderOpen,
            barColor: 'bg-purple-500',
            trendBg: 'bg-slate-100',
            trendColor: 'text-slate-700',
            trend: '+19.01%',
          },
          {
            label: 'Solved Tickets',
            count: stats.resolved.toString(),
            color: 'text-green-500',
            borderColor: 'border-green-200',
            bgColor: 'bg-green-50',
            icon: HiCheckCircle,
            barColor: 'bg-green-500',
            trendBg: 'bg-blue-100',
            trendColor: 'text-blue-500',
            trend: '+19.01%',
          },
          {
            label: 'Pending Tickets',
            count: stats.inProgress.toString(),
            color: 'text-blue-500',
            borderColor: 'border-blue-200',
            bgColor: 'bg-blue-50',
            icon: HiExclamationCircle,
            barColor: 'bg-cyan-500',
            trendBg: 'bg-slate-100',
            trendColor: 'text-slate-700',
            trend: '+19.01%',
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-100 bg-white p-5 flex flex-col justify-between shadow-sm min-w-0"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full border border-dashed ${card.borderColor} ${card.bgColor} shrink-0`}
              >
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div
                className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${card.trendBg} ${card.trendColor}`}
              >
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 10.5C3.5 10.5 5 7.5 7 8.5C9 9.5 11 4.5 14 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {card.trend}
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs font-medium text-slate-500 mb-1">{card.label}</div>
                <div className="text-2xl font-bold text-slate-800">{card.count}</div>
              </div>
              <div className="flex items-end gap-0.5 h-10 w-24">
                {[40, 60, 30, 80, 50, 90, 70, 40, 60, 100].map((h, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-[1px] ${card.barColor}`}
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
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
              label: 'Organization',
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
                    className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-slate-500 text-white transition-colors hover:bg-slate-600"
                    title="View Details"
                  >
                    <HiEye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTicket(ticket.id)}
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
        size="custom"
        showClose={true}
        bodyClassName="p-0 bg-slate-50 overscroll-contain"
        header={
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Ticket Details
            </h2>
            <p className="text-sm font-medium text-slate-500">
              View ticket information, conversation history, and communicate directly regarding this
              support request.
            </p>
          </div>
        }
      >
        {selectedTicket && (
          <div className="flex flex-col min-h-0 w-full max-w-[1200px] mx-auto">
            <div className="p-6 overflow-y-auto">
              {/* Information Card Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100 min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5 font-medium">
                      <HiTicket className="w-4 h-4" /> Ticket ID
                    </p>
                    <p className="text-sm font-bold text-slate-900 break-words">
                      {selectedTicket.ticketId ||
                        `TKT-${String(selectedTicket.id).padStart(3, '0')}`}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-orange-50/50 border border-orange-100 min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5 font-medium">
                      <HiShieldExclamation className="w-4 h-4" /> Priority
                    </p>
                    <div>
                      <Badge
                        label={selectedTicket.priority || 'Normal'}
                        color={getPriorityColor(selectedTicket.priority)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-purple-50/50 border border-purple-100 min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5 font-medium">
                      <HiLifebuoy className="w-4 h-4" /> Status
                    </p>
                    <div>
                      <Badge
                        label={selectedTicket.status || 'Waiting'}
                        color={getStatusColor(selectedTicket.status || 'Waiting')}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5 font-medium">
                      <HiCalendarDays className="w-4 h-4" /> Created Date
                    </p>
                    <p className="text-sm font-bold text-slate-900 break-words">
                      {selectedTicket.createdAt
                        ? new Date(selectedTicket.createdAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })
                        : '-'}
                    </p>
                  </div>
                  <div className="min-w-0 sm:col-span-2 flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-medium">
                      <HiTag className="w-4 h-4 text-slate-400" /> Subject
                    </p>
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {selectedTicket.subject || '-'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-medium">
                      <HiFolderOpen className="w-4 h-4 text-slate-400" /> Category
                    </p>
                    <p className="text-sm font-bold text-slate-900 break-words">
                      {selectedTicket.category || '-'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-medium">
                      <HiBuildingOffice className="w-4 h-4 text-slate-400" /> Tenant Name
                    </p>
                    <p className="text-sm font-bold text-slate-900 break-words">
                      {selectedTicket.tenantName || '-'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-medium">
                      <HiUser className="w-4 h-4 text-slate-400" /> Admin Name
                    </p>
                    <p className="text-sm font-bold text-slate-900 break-words">
                      {selectedTicket.adminName || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* FIX: Main Content Layout — right side panel is now a proper sibling column */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side (col-span-8) */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                      <HiUserCircle className="w-5 h-5 text-[#0F766E]" />
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        Conversation History
                      </h3>
                    </div>

                    <div
                      className="h-[450px] overflow-y-auto p-5 space-y-4 custom-scrollbar flex flex-col"
                      ref={conversationContainerRef}
                    >
                      <div className="space-y-4 flex-1">
                        {(selectedTicket.conversation || []).length > 0 ? (
                          (selectedTicket.conversation || []).map((msg, i, arr) => {
                            const isLast = i === arr.length - 1

                            return (
                              <div
                                key={`${msg.id || i}-${msg.createdAt}-${msg.senderRole}`}
                                className={`rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${msg.senderRole === 'admin'
                                    ? 'border-sky-200 ml-4'
                                    : 'border-[#0F766E]/20 mr-4'
                                  } ${isLast ? 'ring-2 ring-[#0F766E]/20 ring-offset-2' : ''}`}
                              >
                                <div className="flex items-center gap-3 mb-3">
                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${msg.senderRole === 'admin'
                                        ? 'bg-sky-100 text-sky-700'
                                        : 'bg-[#0F766E]/10 text-[#0F766E]'
                                      }`}
                                  >
                                    {msg.senderName
                                      ? msg.senderName.charAt(0).toUpperCase()
                                      : msg.senderRole === 'admin'
                                        ? 'A'
                                        : 'S'}
                                  </div>

                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-bold text-slate-900 truncate">
                                        {msg.senderName ||
                                          (msg.senderRole === 'admin' ? 'Admin' : 'Super Admin')}
                                      </span>
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${msg.senderRole === 'admin'
                                            ? 'bg-sky-50 text-sky-600'
                                            : 'bg-[#0F766E]/10 text-[#0F766E]'
                                          }`}
                                      >
                                        {msg.senderRole === 'admin' ? 'Admin' : 'Super Admin'}
                                      </span>
                                    </div>

                                    <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                                      {msg.createdAt
                                        ? new Date(msg.createdAt).toLocaleDateString('en-GB', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric',
                                        })
                                        : '-'}
                                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                      {msg.createdAt
                                        ? new Date(msg.createdAt).toLocaleTimeString('en-GB', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: true,
                                        })
                                        : ''}
                                    </div>
                                  </div>
                                </div>

                                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                                  {msg.message}
                                </p>
                              </div>
                            )
                          })
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <p className="text-sm text-slate-400 font-medium">
                              No conversation history yet.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Send Response */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mt-2">
                      <div className="flex items-center gap-2 mb-4">
                        <HiPaperClip className="w-5 h-5 text-[#0F766E]" />
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                          Send Response
                        </h3>
                      </div>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your response here..."
                        className="w-full min-h-[120px] resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-4 focus:ring-[#0F766E]/10"
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-400">
                          {replyText.length} characters
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setReplyText('')}
                            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveTicket}
                            disabled={saving || loadingTicketDetails || !replyText.trim()}
                            className="flex items-center gap-2 rounded-xl bg-[#0F766E] px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#0c6b64] hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <HiPaperClip className="w-4 h-4" />
                            {saving ? 'Sending...' : 'Send Response'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FIX: Right Side (col-span-4) — moved out of left column, now a proper sibling */}
                <div className="lg:col-span-4">
                  <div className="sticky top-0 bg-gradient-to-b from-slate-50 to-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col gap-5">
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
