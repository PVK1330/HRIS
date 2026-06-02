import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext.jsx'
import { io } from 'socket.io-client'
import api from '../../../services/api.js'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import {
  HiBell,
  HiCheckCircle,
  HiExclamationCircle,
  HiInformationCircle,
  HiTrash,
  HiXCircle,
  HiTicket,
  HiArrowLeftOnRectangle,
  HiOutlineCheck,
  HiOutlineCheckCircle
} from 'react-icons/hi2'
import toast from 'react-hot-toast'

export default function NotificationCenter() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const isSuperadmin = String(user?.role || user?.panel || '').toLowerCase().replace(/_/g, '') === 'superadmin'

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/notifications')
      const notificationsList = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.notifications)
          ? response.data.notifications
          : Array.isArray(response.data?.data?.notifications)
            ? response.data.data.notifications
            : Array.isArray(response.data?.data)
              ? response.data.data
              : []

      const mappedNotifications = notificationsList.map((n) => ({
        id: n.id ?? n.notificationId ?? n._id ?? null,
        title: n.title ?? n.subject ?? 'Notification',
        message: n.message ?? n.body ?? n.description ?? '',
        read: typeof n.read === 'boolean' ? n.read : (typeof n.isRead === 'boolean' ? n.isRead : (typeof n.is_read === 'boolean' ? n.is_read : false)),
        ticketId: n.ticketId ?? n.ticket_id ?? n.relatedId ?? n.referenceId ?? null,
        relatedId: n.relatedId ?? n.ticketId ?? n.ticket_id ?? null,
        redirectUrl: n.redirectUrl ?? n.redirect_url ?? null,
        type: n.type ?? 'info',
        time: n.time || (n.createdAt || n.created_at ? `${new Date(n.createdAt ?? n.created_at).toLocaleDateString()} ${new Date(n.createdAt ?? n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''),
      }))

      setNotifications(mappedNotifications)
    } catch (err) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user?.id) return
    fetchNotifications()
  }, [user, fetchNotifications])

  const handleMarkAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    try {
      await api.patch(`/notifications/${id}/read`)
    } catch (err) {
      toast.error('Failed to mark read')
    }
  }

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    try {
      await api.patch('/notifications/mark-all-read')
      toast.success('All notifications marked as read')
    } catch (err) {
      toast.error('Failed to mark all read')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this notification?')) {
      setNotifications(prev => prev.filter(n => n.id !== id))
      try {
        await api.delete(`/notifications/${id}`)
        toast.success('Notification deleted')
      } catch (err) {
        toast.error('Failed to delete notification')
      }
    }
  }

  const handleRowClick = (n) => {
    handleMarkAsRead(n.id)
    if (n.redirectUrl) {
      navigate(n.redirectUrl)
    } else if (n.type === 'support_ticket' && (n.ticketId || n.relatedId)) {
      const ticketId = n.ticketId || n.relatedId
      const supportPath = isSuperadmin ? `/superadmin/support` : `/admin/support`
      navigate(`${supportPath}#ticket-${ticketId}`)
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <HiCheckCircle className="h-5 w-5 text-success-DEFAULT" />
      case 'warning':
        return <HiExclamationCircle className="h-5 w-5 text-warning-DEFAULT" />
      case 'danger':
      case 'error':
        return <HiXCircle className="h-5 w-5 text-danger-DEFAULT" />
      case 'exit_management':
        return <HiArrowLeftOnRectangle className="h-5 w-5 text-danger-DEFAULT" />
      case 'support_ticket':
        return <HiTicket className="h-5 w-5 text-blue-500" />
      default:
        return <HiInformationCircle className="h-5 w-5 text-primary" />
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return notifications.filter(n => {
      if (q && !(n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q))) return false
      if (filter === 'unread' && n.read) return false
      if (filter === 'read' && !n.read) return false
      return true
    })
  }, [notifications, search, filter])

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (_, row) => getIcon(row.type),
    },
    {
      key: 'title',
      label: 'Notification',
      render: (_, row) => (
        <div className="cursor-pointer" onClick={() => handleRowClick(row)}>
          <div className={`font-semibold ${row.read ? 'text-gray-600' : 'text-gray-900'}`}>{row.title}</div>
          <div className="text-sm text-gray-500 line-clamp-1">{row.message}</div>
        </div>
      )
    },
    {
      key: 'time',
      label: 'Received At',
      render: (v) => <span className="text-sm text-gray-500">{v}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => (
        <Badge label={row.read ? 'Read' : 'Unread'} color={row.read ? 'gray' : 'blue'} />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          {!row.read && (
            <Button
              label="Mark Read"
              variant="ghost"
              size="sm"
              icon={HiOutlineCheck}
              onClick={(e) => { e.stopPropagation(); handleMarkAsRead(row.id); }}
            />
          )}
          <Button
            label="Delete"
            variant="danger"
            size="sm"
            icon={HiTrash}
            onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
          />
        </div>
      )
    }
  ]

  const typeOptions = [
    { value: '', label: 'All Notifications' },
    { value: 'unread', label: 'Unread Only' },
    { value: 'read', label: 'Read Only' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HiBell className="h-6 w-6 text-primary" />
            Notification Center
          </h1>
          <p className="mt-1 text-sm text-gray-500">View and manage all your notifications.</p>
        </div>
        <Button label="Mark All as Read" variant="primary" icon={HiOutlineCheckCircle} onClick={handleMarkAllRead} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Search"
            name="search"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Input
            label="Filter"
            name="filter"
            type="select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={typeOptions}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8 text-gray-500">Loading notifications...</div>
      ) : (
        <Table columns={columns} data={filtered} pageSize={15} />
      )}
    </div>
  )
}
