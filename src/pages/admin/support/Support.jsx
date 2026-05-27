import React, { useState, useRef, useMemo, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
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
  HiChevronDown,
  HiXMark,
  HiPaperClip,
  HiCalendarDays,
  HiUser,
  HiBuildingOffice,
} from 'react-icons/hi2'
import Swal from 'sweetalert2'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'

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

const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Closed']

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
  const [tickets, setTickets] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [submitting, setSubmitting] = useState(false)
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
    messages: ticket.messages || ticket.replies || [],
  })

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  const fetchTickets = async () => {
    try {
      // Fetch latest single-tenant tickets and also pull any superadmin replies/status
      const response = await axios.get(`${API_URL}/api/support/tickets`, {
        headers: authHeaders(),
      })
      const data = (response.data.data || []).map(normalizeTicket)
      setTickets(data)
    } catch (err) {
      console.error('Failed to load support tickets:', err)
      toast.error('Unable to load support tickets')
    }
  }

  useEffect(() => {
    if (user) {
      const adminName = user.name || user.email || 'Admin'
      const tenantName = user?.companyName || user?.company_name || user?.tenant_name || user?.tenantName || 'Company'
      setFormData((prev) => ({
        ...prev,
        adminName,
        tenantName,
      }))
    }
  }, [user])

  useEffect(() => {
    fetchTickets()
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
    setFormData(initialFormData)
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
      payload.append('status', 'Open')
      if (formData.attachmentFile) {
        payload.append('attachment', formData.attachmentFile)
      }

      const response = await axios.post(`${API_URL}/api/support/tickets`, payload, {
        headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
      })

      if (response?.data?.success) {
        setTickets((prev) => [normalizeTicket(response.data.data), ...prev])
        toast.success('Support ticket created successfully')
        handleCloseModal()
      } else {
        throw new Error(response?.data?.message || 'Failed to create ticket')
      }
    } catch (err) {
      console.error('Failed to create ticket:', err)
      toast.error(err?.response?.data?.message || 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewTicket = async (ticket) => {
    try {
      const response = await axios.get(`${API_URL}/api/support/tickets/${ticket.id}`, {
        headers: authHeaders(),
      })
      if (response?.data?.success) {
        const ticketData = normalizeTicket(response.data.data)
        setSelectedTicket({
          ...ticketData,
          messages: response.data.data.messages || [],
        })
      } else {
        setSelectedTicket(ticket)
      }
    } catch (err) {
      console.error('Failed to load ticket details:', err)
      setSelectedTicket(ticket)
    }
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
      await axios.delete(`${API_URL}/api/support/tickets/${ticketId}`, {
        headers: authHeaders(),
      })
      setTickets((prev) => prev.filter((t) => t.id !== ticketId))
      toast.success('Ticket deleted successfully')
    } catch (err) {
      console.error('Failed to delete ticket:', err)
      toast.error(err?.response?.data?.message || 'Failed to delete ticket')
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
              className={`group flex items-center gap-3.5 rounded-lg border p-4 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] min-w-0 shadow-sm ${
                isActiveFilter
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
                  className={`text-[11px] font-bold uppercase tracking-wider truncate leading-none ${
                    isActiveFilter ? 'text-[#0F766E]' : 'text-slate-400'
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
          loading={false}
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
        <form onSubmit={handleSubmit} className="pt-2">
          <div className="space-y-4">
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
          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
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
        size="xl"
        showClose
        header={
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Ticket Details</h2>
              {selectedTicket && (
                <Badge
                  label={selectedTicket.status}
                  color={getStatusColor(selectedTicket.status)}
                />
              )}
            </div>
            <p className="text-xs font-medium text-slate-500">View ticket information below.</p>
          </div>
        }
      >
        {selectedTicket && (
          <div className="pt-2 space-y-4">
            {/* Ticket ID and Basic Info */}
            <div className="rounded-lg bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Ticket ID</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{selectedTicket.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase text-right">Priority</p>
                  <div className="mt-0.5 flex justify-end">
                    <Badge label={selectedTicket.priority} color={getPriorityColor(selectedTicket.priority)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase mb-1">Subject</p>
              <p className="text-sm font-medium text-slate-800">{selectedTicket.subject}</p>
            </div>

            {/* Category & Created Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Category</p>
                <p className="text-sm font-medium text-slate-800">{selectedTicket.category}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <HiCalendarDays className="h-3 w-3" /> Created Date
                </p>
                <p className="text-sm font-medium text-slate-800">{selectedTicket.createdDate}</p>
              </div>
            </div>

            {/* Admin & Tenant */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <HiUser className="h-3 w-3" /> Admin Name
                </p>
                <p className="text-sm font-medium text-slate-800">{selectedTicket.adminName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <HiBuildingOffice className="h-3 w-3" /> Tenant
                </p>
                <p className="text-sm font-medium text-slate-800">{selectedTicket.tenantName}</p>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500 uppercase mb-2">Description</p>
              <p className="text-sm text-slate-700 leading-relaxed">{selectedTicket.description}</p>
            </div>

            {/* Attachment */}
            {selectedTicket.attachmentUrl && (
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
                <HiPaperClip className="h-4 w-4 text-slate-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500 uppercase mb-0.5">Attachment</p>
                  <a
                    href={selectedTicket.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-slate-800 truncate hover:text-[#0F766E]"
                  >
                    {selectedTicket.attachmentName || selectedTicket.attachmentUrl.split('/').pop()}
                  </a>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCloseViewModal}
                className="h-10 rounded-lg border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
