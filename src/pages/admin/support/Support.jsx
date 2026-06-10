import React, { useState, useRef, useMemo, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import io from 'socket.io-client'
import { useAuth } from '../../../context/AuthContext.jsx'
import {
  HiPlus,
  HiMagnifyingGlass,
  HiTrash,
  HiEye,
  HiCheckCircle,
  HiExclamationCircle,
  HiClock,
  HiSparkles,
  HiPaperClip,
  HiCalendarDays,
  HiUser,
  HiBuildingOffice,
  HiDocument,
  HiFolder,
} from 'react-icons/hi2'
import Swal from 'sweetalert2'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import { resolveFileUrl } from '../../../utils/fileUrl.js'

// Dummy initial support tickets
const CATEGORIES = [
  'Technical Issue',
  'Payroll Issue',
  'Attendance Issue',
  'Login Problem',
  'Performance Module',
  'Expense Issue',
  'HR Query',
  'Other',
]

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']

const STATUS_OPTIONS = ['Open', 'In Progress', 'Waiting for Admin', 'Resolved', 'Closed']

// Get the next ticket ID
const getNextTicketId = (tickets) => {
  const ids = tickets.map(t => {
    const num = parseInt(t.id.split('-')[1])
    return num
  })
  const maxId = Math.max(...ids)
  return `SUP-${(maxId + 1).toString().padStart(4, '0')}`
}

// Status badge color mapping
const getStatusColor = (status) => {
  switch (status) {
    case 'Open':
      return 'blue'
    case 'In Progress':
      return 'orange'
    case 'Waiting for Admin':
      return 'amber'
    case 'Resolved':
      return 'green'
    case 'Closed':
      return 'gray'
    default:
      return 'gray'
  }
}

// Priority badge color mapping
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Low':
      return 'gray'
    case 'Medium':
      return 'yellow'
    case 'High':
      return 'orange'
    case 'Urgent':
      return 'red'
    default:
      return 'gray'
  }
}

const initialFormData = {
  adminName: 'John Admin',
  tenantName: 'Acme Corporation',
  subject: '',
  category: '',
  priority: '',
  description: '',
  attachmentFile: null,
  attachmentName: '',
}

export default function SupportManagement() {
  const { user } = useAuth()
  const getDefaultFormData = () => {
    const adminName = user?.name || user?.email || 'Admin'
    const tenantName =
      user?.companyName || user?.company_name || user?.tenant_name || user?.tenantName || 'Company'

    return {
      ...initialFormData,
      adminName,
      tenantName,
    }
  }

  const [tickets, setTickets] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [formData, setFormData] = useState(getDefaultFormData)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ticketStatus, setTicketStatus] = useState('Open')
  const [replyText, setReplyText] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingTicketDetails, setLoadingTicketDetails] = useState(false)

  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'super_admin'

  const fileInputRef = useRef(null)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const authHeaders = () => {
    const token = localStorage.getItem('hris_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const normalizeTicket = (ticket) => ({
    ...ticket,
    createdDate: ticket.createdAt ? new Date(ticket.createdAt).toISOString().split('T')[0] : '',
    attachmentName: ticket.attachmentUrl ? ticket.attachmentUrl.split('/').pop() : '',
    attachmentUrl: ticket.attachmentUrl || ticket.attachment_url || null,
    attachment: ticket.attachmentUrl || ticket.attachment_url || null,
    conversation: ticket.conversation || ticket.messages || ticket.replies || [],
    messages: ticket.conversation || ticket.messages || ticket.replies || [],
  })

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/v1/admin/support/tickets`, {
        headers: authHeaders(),
      })
      const data = (response.data.data || []).map(normalizeTicket)
      setTickets(data)
      toast.success('Support tickets refreshed')
    } catch (err) {
      console.error('[ADMIN SUPPORT] Failed to load support tickets:', err)
      toast.error('Unable to load support tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      setFormData(getDefaultFormData())
    }
  }, [user])

  // Fetch tickets on component mount
  useEffect(() => {
    fetchTickets()
  }, [])

  // Initialize Socket.io connection for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('hris_token')
    if (!token) return

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const socket = io(socketUrl, {
      auth: {
        token: `Bearer ${token}`,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
    })

    // Listen for ticket updates from Super Admin
    socket.on('ticket:updated', (updatedTicket) => {
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === updatedTicket.id
            ? {
              ...ticket,
              status: updatedTicket.status,
              superAdminDescription: updatedTicket.superAdminDescription,
            }
            : ticket
        )
      )
      toast.info(`Ticket ${updatedTicket.ticketCode || updatedTicket.id} updated by Super Admin`)
    })

    socket.on('disconnect', () => {
    })

    socket.on('error', (error) => {
      console.error('Socket.io error:', error)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // Filter and search tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        search === '' ||
        String(ticket.id).toLowerCase().includes(search.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
        ticket.category.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tickets, search, statusFilter, priorityFilter])

  // Calculate summary stats
  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'Open').length,
      inProgress: tickets.filter(t => t.status === 'In Progress').length,
      resolved: tickets.filter(t => t.status === 'Resolved').length,
    }
  }, [tickets])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        attachmentFile: file,
        attachmentName: file.name,
      }))
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setFormData(getDefaultFormData())
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCloseViewModal = () => {
    setViewModalOpen(false)
    setSelectedTicket(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    // Validation
    if (!formData.subject.trim()) {
      toast.error('Subject is required')
      return
    }
    if (!formData.category) {
      toast.error('Category is required')
      return
    }
    if (!formData.priority) {
      toast.error('Priority is required')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Description is required')
      return
    }

    setSubmitting(true)

    try {
      const payload = new FormData()
      payload.append('adminName', formData.adminName)
      payload.append('tenantName', formData.tenantName)
      payload.append('subject', formData.subject.trim())
      payload.append('category', formData.category)
      payload.append('priority', formData.priority)
      payload.append('description', formData.description.trim())
      payload.append('status', 'Waiting')
      if (formData.attachmentFile) {
        payload.append('attachment', formData.attachmentFile)
      }

      const response = await axios.post(`${API_URL}/api/v1/admin/support/tickets`, payload, {
        headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
      })

      if (response?.data?.success) {
        toast.success('Support ticket created successfully')
        handleCloseModal()
        // Refetch all tickets from backend to ensure sync
        await fetchTickets()
      } else {
        throw new Error(response?.data?.message || 'Failed to create ticket')
      }
    } catch (err) {
      console.error('[ADMIN SUPPORT] Failed to create ticket:', err)
      toast.error(err?.response?.data?.message || 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewTicket = async (ticket) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/support/tickets/${ticket.id}`, {
        headers: authHeaders(),
      })
      if (response?.data?.success) {
        const ticketData = normalizeTicket(response.data.data)
        setSelectedTicket({
          ...ticketData,
          conversation: response.data.data.conversation || ticketData.conversation || [],
          messages: response.data.data.conversation || ticketData.conversation || [],
        })
        setTickets((prev) => prev.map((t) => (t.id === ticketData.id ? ticketData : t)))
      } else {
        setSelectedTicket(ticket)
      }
    } catch (err) {
      console.error('Failed to load ticket details:', err)
      setSelectedTicket(ticket)
    }
    setTicketStatus(ticket.status || 'Open')
    setReplyText('')
    setViewModalOpen(true)
  }

  const handleDeleteTicket = async (ticketId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This ticket will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    })

    if (!result.isConfirmed) return

    try {
      await axios.delete(`${API_URL}/api/v1/admin/support/tickets/${ticketId}`, {
        headers: authHeaders(),
      })
      setTickets((prev) => prev.filter((t) => t.id !== ticketId))
      toast.success('Ticket deleted successfully')
    } catch (err) {
      console.error('Failed to delete ticket:', err)
      toast.error(err?.response?.data?.message || 'Failed to delete ticket')
    }
  }


  const handleSaveTicket = async () => {
    if (!selectedTicket) return
    if (!replyText.trim() && ticketStatus === selectedTicket.status) {
      toast.error('No changes detected. Please update status or add a response.')
      return
    }
    if (!replyText.trim()) {
      toast.error('Response is required when updating the ticket.')
      return
    }

    setSaving(true)
    try {
      const payload = new FormData()
      payload.append('message', replyText.trim())
      if (ticketStatus && ticketStatus !== selectedTicket.status) payload.append('status', ticketStatus)

      const response = await axios.put(`${API_URL}/api/v1/admin/support/tickets/${selectedTicket.id}`, payload, {
        headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
      })
      const updated = response?.data?.data?.ticket || response?.data?.data || response?.data

      if (!updated) {
        throw new Error('Ticket update returned invalid response')
      }

      const normalized = normalizeTicket(updated)
      setSelectedTicket(normalized)
      setTickets((prev) => prev.map((t) => (t.id === normalized.id ? { ...t, ...normalized } : t)))
      if (replyText.trim()) setReplyText('')
      setTicketStatus(normalized.status || 'Waiting for Admin')
      toast.success('Ticket updated successfully')
    } catch (err) {
      console.error('Failed to update ticket:', err)
      toast.error(err?.response?.data?.message || 'Failed to update ticket')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'id',
      label: 'Ticket ID',
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0F766E]/10 text-[#0F766E] shadow-sm">
            <HiSparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-slate-900">{v}</span>
        </div>
      ),
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (v) => (
        <span className="max-w-[200px] truncate text-sm font-medium text-slate-600" title={v}>
          {v}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (v) => <span className="text-sm font-medium text-slate-600">{v}</span>,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (v) => <Badge label={v} color={getPriorityColor(v)} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={getStatusColor(v)} />,
    },
    {
      key: 'createdDate',
      label: 'Created Date',
      render: (v) => (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <HiCalendarDays className="h-4 w-4 text-slate-400" />
          <span>{v}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => handleViewTicket(row)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors hover:bg-blue-600"
            aria-label="View ticket"
            title="View ticket details"
          >
            <HiEye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteTicket(row.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white transition-colors hover:bg-red-600"
            aria-label="Delete ticket"
            title="Delete ticket"
          >
            <HiTrash className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Top Title Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">
            Support Management
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Admin</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Support Tickets</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm shrink-0"
        >
          <HiPlus className="h-4 w-4" /> Create Ticket
        </button>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          {
            label: 'TOTAL TICKETS',
            count: stats.total,
            bgColor: 'bg-[#0F172A]',
            icon: HiSparkles,
            filterId: 'total',
          },
          {
            label: 'OPEN TICKETS',
            count: stats.open,
            bgColor: 'bg-blue-500',
            icon: HiExclamationCircle,
            filterId: 'open',
          },
          {
            label: 'IN PROGRESS',
            count: stats.inProgress,
            bgColor: 'bg-orange-500',
            icon: HiClock,
            filterId: 'in-progress',
          },
          {
            label: 'RESOLVED TICKETS',
            count: stats.resolved,
            bgColor: 'bg-green-500',
            icon: HiCheckCircle,
            filterId: 'resolved',
          },
        ].map((card, idx) => {
          const isActiveFilter = card.filterId === 'total' ? statusFilter === 'all' :
            card.filterId === 'open' ? statusFilter === 'Open' :
              card.filterId === 'in-progress' ? statusFilter === 'In Progress' :
                statusFilter === 'Resolved'

          const handleFilterClick = () => {
            if (card.filterId === 'total') setStatusFilter('all')
            else if (card.filterId === 'open') setStatusFilter('Open')
            else if (card.filterId === 'in-progress') setStatusFilter('In Progress')
            else setStatusFilter('Resolved')
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={handleFilterClick}
              title={`Filter by ${card.label}`}
              className={`group flex items-center gap-3.5 rounded-lg border p-4 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] min-w-0 shadow-sm ${isActiveFilter
                ? 'border-[#0F766E] bg-slate-50/40 ring-1 ring-[#0F766E]'
                : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${card.bgColor} text-white shadow-sm`}
              >
                <card.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-[11px] font-bold uppercase tracking-wider truncate leading-none ${isActiveFilter ? 'text-[#0F766E]' : 'text-slate-400'
                    }`}
                >
                  {card.label}
                </div>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">
                  {card.count}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Main Table Section */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Support Tickets</h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 max-w-md">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket ID, subject..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 min-w-[140px] rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Waiting for Admin">Waiting for Admin</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-10 min-w-[140px] rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer"
            >
              <option value="all">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-slate-500">{filteredTickets.length} tickets shown</p>
            <button
              type="button"
              onClick={fetchTickets}
              disabled={loading}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            {search || statusFilter !== 'all' || priorityFilter !== 'all' ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                  setPriorityFilter('all')
                }}
                className="inline-flex items-center rounded-lg border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
              >
                Reset Filters
              </button>
            ) : null}
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={filteredTickets}
          pageSize={10}
          loading={loading}
          square
          totalCount={filteredTickets.length}
          currentPage={0}
        />
      </div>

      {/* Create Ticket Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        size="lg"
        showClose
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Create Support Ticket</h2>
            <p className="text-xs font-medium text-slate-500">
              Submit a new support ticket to get help with your issue.
            </p>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex h-full max-h-[90vh] flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
            {/* Admin Name */}
            <Input
              label="Admin Name"
              name="adminName"
              value={formData.adminName}
              onChange={handleFormChange}
              placeholder="Enter admin name"
              disabled
              inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20 bg-slate-50"
              labelClassName="mb-1 block text-sm font-medium text-slate-800"
            />

            {/* Tenant Name */}
            <Input
              label="Company / Tenant Name"
              name="tenantName"
              value={formData.tenantName}
              onChange={handleFormChange}
              placeholder="Enter company/tenant name"
              inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
              labelClassName="mb-1 block text-sm font-medium text-slate-800"
            />

            {/* Subject */}
            <Input
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleFormChange}
              placeholder="Brief description of the issue"
              required
              inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
              labelClassName="mb-1 block text-sm font-medium text-slate-800"
            />

            {/* Category */}
            <Input
              label="Category"
              name="category"
              type="select"
              value={formData.category}
              onChange={handleFormChange}
              placeholder="Select category"
              required
              options={CATEGORIES.map((c) => ({ label: c, value: c }))}
              inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
              labelClassName="mb-1 block text-sm font-medium text-slate-800"
            />

            {/* Priority */}
            <Input
              label="Priority"
              name="priority"
              type="select"
              value={formData.priority}
              onChange={handleFormChange}
              placeholder="Select priority"
              required
              options={PRIORITIES.map((p) => ({ label: p, value: p }))}
              inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
              labelClassName="mb-1 block text-sm font-medium text-slate-800"
            />

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Detailed description of the issue"
                required
                rows="4"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/20 font-medium resize-none"
              />
            </div>

            {/* Attachment */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Attachment (Optional)</label>
              <div
                className="relative flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-slate-300 hover:bg-slate-100/50 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.jpg,.png,.jpeg"
                />
                <div className="flex flex-col items-center justify-center text-center">
                  <HiPaperClip className="h-6 w-6 text-slate-400 mb-1" />
                  <p className="text-xs font-medium text-slate-600">
                    {formData.attachmentName ? formData.attachmentName : 'Click to upload or drag file'}
                  </p>
                  {!formData.attachmentName && (
                    <p className="text-[11px] text-slate-500 mt-0.5">PDF, images, docs up to 10MB</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="h-10 rounded-lg border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-10 rounded-lg bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating…' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Ticket Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={handleCloseViewModal}
        size="custom"
        showClose={true}
        bodyClassName="p-0 bg-slate-50 overflow-y-auto"
        header={
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ticket Details</h2>
            <p className="text-sm font-medium text-slate-500">
              View ticket information, conversation history, and communicate directly regarding this support request.
            </p>
          </div>
        }
      >
        {selectedTicket && (
          <div className="flex flex-col min-h-0 w-full max-w-[1200px] mx-auto">
            <div className="p-6">
              {/* Information Card Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5"><HiSparkles className="w-4 h-4" /> Ticket ID</p>
                    <p className="text-sm font-bold text-slate-900">{selectedTicket.id}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5"><HiExclamationCircle className="w-4 h-4" /> Priority</p>
                    <div><Badge label={selectedTicket.priority || 'Normal'} color={getPriorityColor(selectedTicket.priority)} /></div>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5"><HiCheckCircle className="w-4 h-4" /> Status</p>
                    <div><Badge label={selectedTicket.status || 'Open'} color={getStatusColor(selectedTicket.status || 'Open')} /></div>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5"><HiCalendarDays className="w-4 h-4" /> Created Date</p>
                    <p className="text-sm font-bold text-slate-900">{selectedTicket.createdDate || '-'}</p>
                  </div>
                  <div className="col-span-2 flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><HiDocument className="w-4 h-4 text-slate-400" /> Subject</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{selectedTicket.subject || '-'}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">< HiFolder className="w-4 h-4 text-slate-400" /> Category</p>
                    <p className="text-sm font-bold text-slate-900">{selectedTicket.category || '-'}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><HiBuildingOffice className="w-4 h-4 text-slate-400" /> Tenant Name</p>
                    <p className="text-sm font-bold text-slate-900">{selectedTicket.tenantName || '-'}</p>
                  </div>
                  <div className="col-span-2 md:col-span-4 flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><HiUser className="w-4 h-4 text-slate-400" /> Admin Name</p>
                    <p className="text-sm font-bold text-slate-900">{selectedTicket.adminName || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side (70%) */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                      <HiUser className="w-5 h-5 text-[#0F766E]" />
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Conversation History</h3>
                    </div>

                    <div className="h-[450px] overflow-y-auto p-5 space-y-4 custom-scrollbar flex flex-col">
                      <div className="space-y-4 flex-1">
                        {(selectedTicket.conversation || []).length ? (
                          (selectedTicket.conversation || []).map((msg, i, arr) => {
                            const isLast = i === arr.length - 1;
                            return (
                              <div
                                key={`${msg.id}-${msg.createdAt}-${msg.senderRole}`}
                                className={`rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${msg.senderRole === 'admin' ? 'border-sky-200 ml-4' : 'border-[#0F766E]/20 mr-4'} ${isLast ? 'ring-2 ring-[#0F766E]/20 ring-offset-2' : ''}`}
                              >
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${msg.senderRole === 'admin' ? 'bg-sky-100 text-sky-700' : 'bg-[#0F766E]/10 text-[#0F766E]'}`}>
                                    {msg.senderName ? msg.senderName.charAt(0).toUpperCase() : (msg.senderRole === 'admin' ? 'A' : 'S')}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-bold text-slate-900 truncate">{msg.senderName || (msg.senderRole === 'admin' ? 'Admin' : 'Super Admin')}</span>
                                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${msg.senderRole === 'admin' ? 'bg-sky-50 text-sky-600' : 'bg-[#0F766E]/10 text-[#0F766E]'}`}>
                                        {msg.senderRole === 'admin' ? 'Admin' : 'Super Admin'}
                                      </span>
                                    </div>
                                    <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                                      {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                                    </div>
                                  </div>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap ml-13">{msg.message || msg.text}</p>
                              </div>
                            )
                          })
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <p className="text-sm text-slate-400 font-medium">No conversation history yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Send Response */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mt-2">
                    <div className="flex items-center gap-2 mb-4">
                      <HiPaperClip className="w-5 h-5 text-[#0F766E]" />
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Send Response</h3>
                    </div>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your response here..."
                      className="w-full min-h-[120px] resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-4 focus:ring-[#0F766E]/10"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-400">{replyText.length} characters</span>
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

                {/* Right Side (30%) */}
                <div className="lg:col-span-4">
                  <div className="sticky top-0 bg-gradient-to-b from-slate-50 to-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col gap-5">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-3">Ticket Summary</h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Ticket Number</span>
                        <span className="text-sm font-bold text-slate-900">{selectedTicket.id}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Priority</span>
                        <Badge label={selectedTicket.priority || 'Normal'} color={getPriorityColor(selectedTicket.priority)} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Status</span>
                        <Badge label={selectedTicket.status || 'Waiting'} color={getStatusColor(selectedTicket.status || 'Waiting')} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Category</span>
                        <span className="text-sm font-bold text-slate-900">{selectedTicket.category || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Tenant Name</span>
                        <span className="text-sm font-bold text-slate-900">{selectedTicket.tenantName || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Created Date</span>
                        <span className="text-sm font-bold text-slate-900">{selectedTicket.createdDate || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Description</span>
                        <span className="text-xs font-medium text-slate-700 truncate max-w-[120px]" title={selectedTicket.description}>{selectedTicket.description || '-'}</span>
                      </div>
                    </div>

                    {isSuperAdmin && (
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-2">Update Status</p>
                        <select
                          value={ticketStatus}
                          onChange={(e) => setTicketStatus(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#0F766E] focus:ring-4 focus:ring-[#0F766E]/10"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    )}

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
                          <span className="truncate">{selectedTicket.attachmentName || selectedTicket.attachmentUrl?.split('/').pop() || 'Download'}</span>
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
