import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiArrowPath,
  HiArrowTrendingUp,
  HiBellAlert,
  HiBriefcase,
  HiCalendarDays,
  HiChartBar,
  HiCheckCircle,
  HiClock,
  HiCreditCard,
  HiDocumentArrowDown,
  HiMegaphone,
  HiUserGroup,
  HiUsers,
} from 'react-icons/hi2'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Avatar } from '../../components/ui/Avatar.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import ManagerDashboard from '../../components/manager/ManagerDashboard.jsx'
import { fetchAdminDashboard, fetchEmployeeDashboard } from '../../services/dashboardService.js'

const FALLBACK_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Annual General Meeting 2026',
    content: 'The annual general meeting for all shareholders and employees will be held in the main auditorium.',
    priority: 'High',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'New Health Insurance Policy',
    content: 'We have updated our health insurance provider to ensure better coverage for all employees.',
    priority: 'Standard',
    created_at: new Date().toISOString(),
  },
]

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

function MetricCard({ label, value, subtitle, tone = 'slate' }) {
  const tones = {
    slate: 'from-slate-900 to-slate-800',
    blue: 'from-blue-600 to-blue-500',
    emerald: 'from-emerald-600 to-emerald-500',
    amber: 'from-amber-600 to-amber-500',
  }
  return (
    <div className="rounded-none border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${tones[tone] || tones.slate}`} />
      </div>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [dashboardData, setDashboardData] = useState(EMPTY_STATS)

  const isManager = user?.role === 'manager'
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

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      if (isEmployee) {
        const employeeId = user?.employeeId || user?.id
        if (employeeId) {
          const data = await fetchEmployeeDashboard(employeeId)
          setDashboardData((prev) => ({ ...prev, ...data }))
        }
      } else {
        const data = await fetchAdminDashboard()
        setDashboardData(data)
      }
    } catch (err) {
      console.error('Dashboard load failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [user?.id, user?.employeeId, user?.role])

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <HiArrowPath className="h-8 w-8 animate-spin text-[#0F766E]" />
          <p className="text-xs font-semibold text-slate-500">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  if (isManager) return <ManagerDashboard />

  const announcements = dashboardData.announcements?.length
    ? dashboardData.announcements
    : FALLBACK_ANNOUNCEMENTS

  const attendancePieData = [
    { name: 'In Office', value: dashboardData.attendance.present },
    { name: 'Remote', value: dashboardData.attendance.remote },
    { name: 'On Leave', value: dashboardData.attendance.onLeave },
  ]

  const growthData = dashboardData.growthData?.length
    ? dashboardData.growthData
    : [{ name: 'NOW', headcount: dashboardData.employees.total }]

  const events = dashboardData.celebrations?.length
    ? dashboardData.celebrations
    : [{ name: 'No upcoming events', type: 'Event', date: '—', dept: '—', icon: '📅' }]

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isHrView ? 'HR Dashboard' : 'Employee Dashboard'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{todayLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadDashboardData}
            className="inline-flex h-9 items-center gap-2 rounded-none border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <HiArrowPath className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-none border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <HiDocumentArrowDown className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {isHrView ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total Employees" value={dashboardData.employees.total} subtitle="Headcount overview" />
            <MetricCard label="Active Employees" value={dashboardData.employees.active} subtitle="Currently active" tone="emerald" />
            <MetricCard label="On Probation" value={dashboardData.employees.probation} subtitle="Under evaluation" tone="amber" />
            <MetricCard label="Notice Period" value={dashboardData.employees.notice} subtitle="Potential exits" tone="blue" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Attendance Trend</h3>
                  <HiArrowTrendingUp className="h-4 w-4 text-[#0F766E]" />
                </div>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="headcount" stroke="#0F766E" fill="#0F766E" fillOpacity={0.12} strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

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
                  <Link to="/admin/attendance" className="rounded-none border border-slate-200 bg-slate-50/60 p-4 hover:bg-white">
                    <p className="text-xs font-semibold text-slate-500">Regularizations</p>
                    <p className="mt-2 text-xl font-bold text-slate-900">{dashboardData.pending.documents}</p>
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">Employee Status</h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={attendancePieData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3}>
                        <Cell fill="#0F766E" />
                        <Cell fill="#3B82F6" />
                        <Cell fill="#F59E0B" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Announcements</h3>
                  <HiMegaphone className="h-4 w-4 text-[#0F766E]" />
                </div>
                <div className="space-y-3">
                  {announcements.slice(0, 3).map((ann) => (
                    <button
                      key={ann.id}
                      type="button"
                      onClick={() => setSelectedAnnouncement(ann)}
                      className="w-full rounded-none border border-slate-200 bg-slate-50/60 p-3 text-left hover:bg-white"
                    >
                      <p className="text-xs font-semibold text-slate-900">{ann.title}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{ann.content}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar name={user?.name || 'Employee'} size="lg" />
                <div>
                  <p className="text-lg font-bold text-slate-900">{user?.name || 'Employee'}</p>
                  <p className="text-sm text-slate-500">{user?.role?.replace('_', ' ') || 'Employee'}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p><span className="font-medium">Email:</span> {user?.email || '—'}</p>
                <p><span className="font-medium">Department:</span> {user?.department || '—'}</p>
              </div>
            </div>

            <MetricCard label="Leave Balance" value={dashboardData.personal.leaveBalance} subtitle="Available days" tone="emerald" />
            <MetricCard label="Attendance Rate" value={dashboardData.personal.attendanceRate} subtitle="This month" tone="blue" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">My Attendance</h3>
                  <HiClock className="h-4 w-4 text-[#0F766E]" />
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <MetricCard label="In Office" value={dashboardData.attendance.present} subtitle="Today" />
                  <MetricCard label="Remote" value={dashboardData.attendance.remote} subtitle="Today" tone="blue" />
                  <MetricCard label="On Leave" value={dashboardData.attendance.onLeave} subtitle="Today" tone="amber" />
                  <MetricCard label="Pending Tasks" value={dashboardData.personal.pendingTasks} subtitle="Claims pending" />
                </div>
              </div>

              <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">My Announcements</h3>
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <button
                      key={ann.id}
                      type="button"
                      onClick={() => setSelectedAnnouncement(ann)}
                      className="w-full rounded-none border border-slate-200 bg-slate-50/60 p-3 text-left hover:bg-white"
                    >
                      <div className="flex items-center gap-2">
                        <Badge label={ann.priority || 'Standard'} color={ann.priority === 'High' ? 'red' : 'blue'} />
                        <span className="text-xs text-slate-400">{new Date(ann.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{ann.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Team Events</h3>
                  <HiCalendarDays className="h-4 w-4 text-[#0F766E]" />
                </div>
                <div className="space-y-3">
                  {events.slice(0, 5).map((event, i) => (
                    <div key={`${event.name}-${i}`} className="flex items-center gap-3 rounded-none border border-slate-200 bg-slate-50/60 p-3">
                      <Avatar name={event.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{event.name}</p>
                        <p className="text-xs text-slate-500">{event.type} • {event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">Quick Links</h3>
                <div className="space-y-2">
                  <Link to="/admin/leave" className="flex items-center gap-2 rounded-none border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700 hover:bg-white">
                    <HiCalendarDays className="h-4 w-4" />
                    Apply Leave
                  </Link>
                  <Link to="/admin/attendance" className="flex items-center gap-2 rounded-none border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700 hover:bg-white">
                    <HiClock className="h-4 w-4" />
                    View Attendance
                  </Link>
                  <Link to="/admin/employee-profile" className="flex items-center gap-2 rounded-none border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700 hover:bg-white">
                    <HiUsers className="h-4 w-4" />
                    My Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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
      ) : null}
    </div>
  )
}
