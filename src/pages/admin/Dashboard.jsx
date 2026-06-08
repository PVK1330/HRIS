import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiArrowTrendingUp,
  HiBellAlert,
  HiCalendarDays,
  HiChartBar,
  HiClock,
  HiCreditCard,
  HiMegaphone,
  HiQuestionMarkCircle,
  HiUsers,
  HiIdentification,
  HiCalendar,
  HiDocument,
  HiCog6Tooth,
  HiClipboardDocumentCheck,
  HiChatBubbleLeftRight,
} from 'react-icons/hi2'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge } from '../../components/ui/Badge.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import ManagerDashboard from '../../components/manager/ManagerDashboard.jsx'
import { fetchAdminDashboard, fetchEmployeeDashboard } from '../../services/dashboardService.js'
import DashboardHeader from './dashboard/DashboardHeader.jsx'
import DashboardStats from './dashboard/DashboardStats.jsx'
import AttendancePunchCard from '../../components/attendance/AttendancePunchCard.jsx'
import { canPunchAttendance } from '../../utils/rbac.js'

function MetricCard({ label, value, subtitle, tone = 'slate' }) {
  const toneStyles = {
    slate: 'text-slate-900',
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    amber: 'text-amber-600',
  }

  return (
    <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className={`mt-3 text-3xl font-bold ${toneStyles[tone] || toneStyles.slate}`}>{value ?? 0}</p>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}

const EMPTY_STATS = {
  employees: { total: 0, active: 0, probation: 0, notice: 0 },
  attendance: { present: 0, remote: 0, onLeave: 0, absent: 0 },
  pending: { leaves: 0, documents: 0, expenses: 0 },
  personal: { leaveBalance: 0, attendanceRate: '—', pendingTasks: 0 },
  growthData: [],
  celebrations: [],
  expiryAlerts: [],
  joinersExits: { newJoiners: [], exits: [] },
  announcements: [],
}

function EmployeeDashboard({ dashboardData, dateRange, setDateRange, todayLabel, showPunchCard, setSelectedAnnouncement }) {
  const announcements = dashboardData.announcements || []
  const notifications = dashboardData.notifications || []
  const notificationsUnread = dashboardData.notificationsUnread || 0
  const unreadMessages = dashboardData.unreadMessages || 0
  const recentConversations = dashboardData.recentConversations || []

  return (
    <div className="space-y-6 pb-10">
      <DashboardHeader
        title="My Dashboard"
        subtitle={todayLabel}
        dateRange={dateRange}
        onDateChange={setDateRange}
      />

      {showPunchCard ? <AttendancePunchCard /> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Leave Balance"
          value={dashboardData?.personal?.leaveBalance || 0}
          subtitle="Available leave days"
          tone="emerald"
        />
        <MetricCard
          label="Attendance Rate"
          value={dashboardData?.personal?.attendanceRate || '—'}
          subtitle="Current month"
          tone="blue"
        />
        <MetricCard
          label="Pending Tasks"
          value={dashboardData?.personal?.pendingTasks || 0}
          subtitle="Claims / actions pending"
          tone="amber"
        />
      </div>

      <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">My Announcements</h3>
          <HiMegaphone className="h-4 w-4 text-[#0F766E]" />
        </div>
        <div className="space-y-3">
          {announcements.length > 0 ? (
            announcements.map((ann) => (
              <button
                key={ann.id}
                type="button"
                onClick={() => setSelectedAnnouncement(ann)}
                className="w-full rounded-none border border-slate-200 bg-slate-50/60 p-3 text-left hover:bg-white"
              >
                <p className="text-xs font-semibold text-slate-900">{ann.title}</p>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500">{ann.content}</p>
              </button>
            ))
          ) : (
            <p className="text-sm text-slate-500">No announcements yet.</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">My Notifications</h3>
            <Badge label={notificationsUnread} color={notificationsUnread > 0 ? 'amber' : 'blue'} />
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 4).map((n) => (
              <div key={n.id || n.notificationId} className="rounded-none border border-slate-200 bg-slate-50/60 p-3">
                <p className="text-xs font-semibold text-slate-900">{n.title || 'Notification'}</p>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500">{n.message || n.body || '—'}</p>
              </div>
            ))}
            {!notifications.length ? <p className="text-sm text-slate-500">No notifications.</p> : null}
          </div>
        </div>
        <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">My Messages</h3>
            <Badge label={unreadMessages} color={unreadMessages > 0 ? 'emerald' : 'blue'} />
          </div>
          <div className="space-y-2">
            {recentConversations.slice(0, 4).map((c) => (
              <div key={c.id || c.conversationId} className="rounded-none border border-slate-200 bg-slate-50/60 p-3">
                <p className="text-xs font-semibold text-slate-900">{c.other?.full_name || c.otherName || 'Conversation'}</p>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500">{c.last_message?.body || c.lastMessage || 'No recent message'}</p>
              </div>
            ))}
            {!recentConversations.length ? <p className="text-sm text-slate-500">No messages yet.</p> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, allowedModules } = useAuth()
  const hasEmployeeProfile = Boolean(user?.employeeId || user?.id)
  const showPunchCard = hasEmployeeProfile
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('Last 30 days')
  const [dashboardData, setDashboardData] = useState(EMPTY_STATS)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [birthdays, setBirthdays] = useState([])

  const isManager = user?.role === 'manager'
  const isHRAdmin = user?.role === 'admin' || user?.role === 'hr_admin'
  const isEmployee = user?.role === 'employee'
  const isHrView = user?.role === 'admin' || user?.role === 'hr_admin' || user?.role === 'hr_executive'

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [],
  )

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    const run = async () => {
      try {
        if (user?.role === 'employee') {
          const employeeId = user?.employeeId || user?.id
          if (employeeId) {
            const data = await fetchEmployeeDashboard(employeeId)
            if (!cancelled) setDashboardData((prev) => ({ ...prev, ...data }))
          }
        } else {
          const data = await fetchAdminDashboard()
          if (!cancelled) setDashboardData(data)
        }
      } catch (err) {
        if (!cancelled) console.error('Dashboard load failed:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    run()
    return () => { cancelled = true }
  }, [user?.id, user?.employeeId, user?.role])

  const announcements = dashboardData.announcements || []
  const notifications = dashboardData.notifications || []
  const notificationsUnread = dashboardData.notificationsUnread || 0
  const unreadMessages = dashboardData.unreadMessages || 0
  const recentConversations = dashboardData.recentConversations || []

  if (isLoading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="h-16 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        <div className="h-40 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        <DashboardStats items={[]} loading />
      </div>
    )
  }

  if (isManager) return <ManagerDashboard />
  if (isEmployee) {
    return (
      <EmployeeDashboard
        dashboardData={dashboardData}
        dateRange={dateRange}
        setDateRange={setDateRange}
        todayLabel={todayLabel}
        showPunchCard={showPunchCard}
        setSelectedAnnouncement={setSelectedAnnouncement}
      />
    )
  }

  const statsItems = [
    {
      key: 'employees',
      label: 'Active Employees',
      value: dashboardData.employees.active || 0,
      change: 4.8,
      subtitle: 'workforce active',
      graph: [20, 24, 26, 31, 30, 34, 37],
    },
    {
      key: 'onLeave',
      label: 'On Leave Today',
      value: dashboardData.attendance.onLeave || 0,
      change: 0.8,
      subtitle: 'daily attendance',
      graph: [8, 10, 12, 9, 11, 10, 9],
    },
    {
      key: 'approvals',
      label: 'Pending Approvals',
      value: dashboardData.pending.leaves + dashboardData.pending.expenses + dashboardData.pending.documents,
      change: -1.4,
      subtitle: 'awaiting review',
      graph: [16, 18, 17, 15, 13, 12, 11],
    },
  ]

  const growthData = dashboardData.growthData?.length
    ? dashboardData.growthData.slice(-7)
    : [{ name: 'Now', headcount: dashboardData.employees.total || 0 }]

  return (
    <>
    <div className="space-y-6 pb-12 min-w-0">


      <section className="overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-r from-[#0F766E] to-[#0f766e]/90 p-6 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome Back, Admin</h2>
            <p className="mt-1 text-sm text-emerald-50">
              Manage workforce activity, attendance and approvals in one place.
            </p>
          </div>
        </div>
      </section>

      <DashboardStats items={statsItems} loading={false} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Pending Approvals</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link to="/admin/leave" className="rounded-none border border-slate-200 bg-slate-50/60 p-4 hover:bg-white">
                <p className="text-xs font-semibold text-slate-500">Leave Requests</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{dashboardData.pending.leaves}</p>
              </Link>
              <Link to="/admin/expenses" className="rounded-none border border-slate-200 bg-slate-50/60 p-4 hover:bg-white">
                <p className="text-xs font-semibold text-slate-500">Expense Claims</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{dashboardData.pending.expenses}</p>
              </Link>
              <Link to="/admin/documents" className="rounded-none border border-slate-200 bg-slate-50/60 p-4 hover:bg-white">
                <p className="text-xs font-semibold text-slate-500">Document Audits</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{dashboardData.pending.documents}</p>
              </Link>
            </div>
          </div>

          <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Announcements</h3>
              <HiMegaphone className="h-4 w-4 text-[#0F766E]" />
            </div>
            <div className="space-y-3">
              {announcements.slice(0, 5).map((ann) => (
                <button
                  key={ann.id}
                  type="button"
                  onClick={() => setSelectedAnnouncement(ann)}
                  className="w-full rounded-none border border-slate-200 bg-slate-50/60 p-3 text-left hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{ann.title}</p>
                    <Badge label={ann.priority || 'Standard'} color={ann.priority === 'High' ? 'red' : 'blue'} />
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">{ann.content}</p>
                </button>
              ))}
              {!announcements.length ? <p className="text-sm text-slate-500">No announcements available.</p> : null}
            </div>
          </div>

          <div className="rounded-none border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Workforce Evolution</h3>
              <HiArrowTrendingUp className="h-5 w-5 text-[#0F766E]" />
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ border: '1px solid #f1f5f9', borderRadius: '0px' }} />
                  <Area type="monotone" dataKey="headcount" stroke="#0F766E" strokeWidth={2} fill="#0F766E" fillOpacity={0.08} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
              <HiBellAlert className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mb-2 text-xs font-semibold text-slate-600">Unread: {notificationsUnread}</div>
            <div className="space-y-2">
              {notifications.slice(0, 4).map((n) => (
                <div key={n.id || n.notificationId} className="rounded-none border border-slate-200 bg-slate-50/60 p-3">
                  <p className="text-xs font-semibold text-slate-900">{n.title || 'Notification'}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">{n.message || n.body || '—'}</p>
                </div>
              ))}
              {!notifications.length ? <p className="text-sm text-slate-500">No notifications available.</p> : null}
            </div>
          </div>

          <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Messages</h3>
              <HiChatBubbleLeftRight className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mb-2 text-xs font-semibold text-slate-600">Unread: {unreadMessages}</div>
            <div className="space-y-2">
              {recentConversations.slice(0, 4).map((c) => (
                <Link
                  key={c.id || c.conversationId}
                  to="/admin/messages"
                  className="block rounded-none border border-slate-200 bg-slate-50/60 p-3 hover:bg-white"
                >
                  <p className="text-xs font-semibold text-slate-900">{c.other?.full_name || c.otherName || 'Conversation'}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">{c.last_message?.body || c.lastMessage || 'No recent message'}</p>
                </Link>
              ))}
              {!recentConversations.length ? <p className="text-sm text-slate-500">No conversations yet.</p> : null}
            </div>
          </div>

          <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Quick Links</h3>
            <div className="space-y-2">
              {[
                { label: 'Employee Directory', icon: HiUsers, path: '/admin/employee-directory' },
                { label: 'Attendance', icon: HiClock, path: '/admin/attendance' },
                { label: 'Leave', icon: HiCalendar, path: '/admin/leave' },
                { label: 'Documents', icon: HiDocument, path: '/admin/documents' },
                { label: 'Messages', icon: HiChatBubbleLeftRight, path: '/admin/messages' },
                { label: 'Support', icon: HiQuestionMarkCircle, path: '/admin/support' },
                ...(isHRAdmin ? [{ label: 'Settings', icon: HiCog6Tooth, path: '/admin/settings' }] : []),
              ].map((item) => (
                <Link key={item.label} to={item.path} className="flex items-center gap-2 rounded-none border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700 hover:bg-white">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedAnnouncement ? (
        <Modal title="Announcement" isOpen onClose={() => setSelectedAnnouncement(null)} size="lg">
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <Badge label={selectedAnnouncement.priority || 'Standard'} color={selectedAnnouncement.priority === 'High' ? 'red' : 'blue'} />
              <span className="text-xs text-slate-500">{new Date(selectedAnnouncement.created_at).toLocaleString()}</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">{selectedAnnouncement.title}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{selectedAnnouncement.content}</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="h-9 rounded-none bg-[#0F766E] px-4 text-sm font-semibold text-white hover:bg-[#0c6b64]"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      ): null}
    </div>
    </>
  )
}
