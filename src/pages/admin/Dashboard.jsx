import { useEffect, useMemo, useState } from 'react'
<<<<<<< HEAD
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
  HiQuestionMarkCircle,
  HiUsers,
  HiIdentification,
  HiCalendar,
  HiDocument,
  HiCog6Tooth,
  HiShieldCheck,
  HiGift ,
  HiFlag,
  HiClipboardDocumentCheck,
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
=======
import { Building2, Package, Users } from 'lucide-react'
>>>>>>> e1261c0e32a65addbf9500a15806cd87416cd18f
import { useAuth } from '../../context/AuthContext.jsx'
import ManagerDashboard from '../../components/manager/ManagerDashboard.jsx'
import { fetchAdminDashboard, fetchEmployeeDashboard } from '../../services/dashboardService.js'
import CompanyGrowthChart from './dashboard/CompanyGrowthChart.jsx'
import DashboardHeader from './dashboard/DashboardHeader.jsx'
import DashboardStats from './dashboard/DashboardStats.jsx'
import ExpiredPlans from './dashboard/ExpiredPlans.jsx'
import PlanDistribution from './dashboard/PlanDistribution.jsx'
import RecentTransactions from './dashboard/RecentTransactions.jsx'
import RegisteredCompanies from './dashboard/RegisteredCompanies.jsx'
import RevenueChart from './dashboard/RevenueChart.jsx'

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

const DEMO_TRANSACTIONS = [
  { id: 1, company: 'Aster Healthcare', transactionId: 'TXN-90342', date: '26 May 2026', packageName: 'Enterprise', amount: '$4,800', status: 'Paid' },
  { id: 2, company: 'Nexa Logistics', transactionId: 'TXN-90341', date: '25 May 2026', packageName: 'Premium', amount: '$2,150', status: 'Pending' },
  { id: 3, company: 'Orbit Systems', transactionId: 'TXN-90340', date: '24 May 2026', packageName: 'Standard', amount: '$1,250', status: 'Paid' },
  { id: 4, company: 'Bluewave Retail', transactionId: 'TXN-90338', date: '23 May 2026', packageName: 'Premium', amount: '$2,050', status: 'Failed' },
]

const DEMO_REGISTERED = [
  { id: 1, name: 'Vertex Capital', plan: 'Enterprise', users: 210, domain: 'vertex.example.com' },
  { id: 2, name: 'Crestline Foods', plan: 'Premium', users: 94, domain: 'crestline.example.com' },
  { id: 3, name: 'Prime Utilities', plan: 'Standard', users: 60, domain: 'primeu.example.com' },
]

const DEMO_EXPIRED = [
  { id: 1, company: 'Delta Dynamics', packageName: 'Premium', expiryDate: '20 May 2026' },
  { id: 2, company: 'Urban Works', packageName: 'Standard', expiryDate: '18 May 2026' },
  { id: 3, company: 'Sterling Hub', packageName: 'Enterprise', expiryDate: '15 May 2026' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('Last 30 days')
  const [dashboardData, setDashboardData] = useState(EMPTY_STATS)
  const [expiryAlerts, setExpiryAlerts] = useState([])
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
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Employee Dashboard</h2>
        <p className="mt-2 text-sm text-slate-600">
          Employee experience remains unchanged. This update delivers the redesigned enterprise
          admin dashboard for admin and HR roles.
        </p>
      </div>
    )
  }

  const statsItems = [
    {
      key: 'companies',
      label: 'Total Companies',
      value: dashboardData.employees.total || 0,
      change: 8.2,
      subtitle: 'vs last month',
      graph: [30, 42, 35, 50, 62, 58, 72],
    },
    {
      key: 'employees',
      label: 'Active Employees',
      value: dashboardData.employees.active || 0,
      change: 4.8,
      subtitle: 'workforce active',
      graph: [20, 24, 26, 31, 30, 34, 37],
    },
    {
      key: 'subscriptions',
      label: 'Total Subscriptions',
      value: dashboardData.pending.leaves + dashboardData.pending.expenses + dashboardData.pending.documents,
      change: -2.1,
      subtitle: 'renewal queue',
      graph: [60, 54, 58, 45, 48, 40, 36],
    },
    {
      key: 'revenue',
      label: 'Total Revenue',
      value: `$${(dashboardData.employees.active * 125).toLocaleString()}`,
      change: 6.4,
      subtitle: 'this cycle',
      graph: [24, 30, 33, 40, 44, 50, 58],
    },
  ]

  const companyGrowth = dashboardData.growthData?.length
    ? dashboardData.growthData.slice(-7).map((item) => ({ name: item.name, companies: item.headcount }))
    : [{ name: 'Now', companies: dashboardData.employees.total || 0 }]

  const revenueSeries = companyGrowth.map((item, index) => ({
    name: item.name,
    amount: (item.companies || 0) * (95 + index * 4),
  }))

  const planDistribution = [
    { name: 'Enterprise', value: Math.max(0, dashboardData.employees.notice), color: '#1e40af' },
    { name: 'Premium', value: Math.max(0, dashboardData.employees.probation), color: '#0F766E' },
    {
      name: 'Standard',
      value: Math.max(0, dashboardData.employees.active - dashboardData.employees.notice - dashboardData.employees.probation),
      color: '#3b82f6',
    },
  ]

  return (
    <div className="space-y-6 pb-12 min-w-0">
      <DashboardHeader
        title={isHrView ? 'Admin Dashboard' : 'Dashboard'}
        subtitle={todayLabel}
        dateRange={dateRange}
        onDateChange={setDateRange}
      />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-r from-[#0F766E] to-[#0f766e]/90 p-6 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome Back, Admin</h2>
            <p className="mt-1 text-sm text-emerald-50">
              Monitor companies, subscriptions, workforce activity and revenue in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex h-9 items-center gap-2 rounded-xl bg-white px-3 text-sm font-medium text-[#0F766E] transition-colors duration-200 hover:bg-slate-100">
              <Building2 className="h-4 w-4" />
              Companies
            </button>
            <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-200/60 bg-white/10 px-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/20">
              <Package className="h-4 w-4" />
              Packages
            </button>
            <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-200/60 bg-white/10 px-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/20">
              <Users className="h-4 w-4" />
              Employees
            </button>
          </div>
        </div>
      </section>

      <DashboardStats items={statsItems} loading={false} />

      <div className="grid gap-4 lg:grid-cols-2">
        <CompanyGrowthChart data={companyGrowth} loading={false} />
        <RevenueChart data={revenueSeries} loading={false} />
      </div>

      <PlanDistribution data={planDistribution} loading={false} />
      <RecentTransactions transactions={DEMO_TRANSACTIONS} loading={false} />

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
          </>
      )}

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
                  <MetricCard label="Pending Tasks" value={dashboardData?.personal?.pendingTasks || 0} subtitle="Claims pending" />
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

           {/* Trends / Graphs */}
           {!isEmployee && (
              <div className="rounded-none border border-slate-200 bg-white p-8 shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Workforce Evolution Index</h3>
                    <HiArrowTrendingUp className="h-5 w-5 text-[#0F766E]" />
                 </div>
                 <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={growthData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 900}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 900}} />
                          <Tooltip contentStyle={{ border: '1px solid #f1f5f9', borderRadius: '0px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                          <Area type="stepAfter" dataKey="headcount" stroke="#0F766E" strokeWidth={3} fill="#0F766E" fillOpacity={0.05} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           )}

           {/* Quick Access Grid */}
           <div className="rounded-none border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Execution Gateways</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                    { label: 'Directory', icon: HiUsers, path: '/admin/employee-directory', color: 'blue' },
                    { label: 'Profile', icon: HiIdentification, path: '/admin/employee-profile', color: 'emerald' },
                    { label: 'Attendance', icon: HiClock, path: '/admin/attendance', color: 'amber' },
                    { label: 'Leave', icon: HiCalendar, path: '/admin/leave', color: 'rose' },
                    { label: 'Documents', icon: HiDocument, path: '/admin/documents', color: 'indigo' },
                    { label: 'Visa/Nat', icon: HiCreditCard, path: '/admin/visa', color: 'purple' },
                    { label: 'Policies', icon: HiClipboardDocumentCheck, path: '/admin/policies', color: 'emerald' },
                    { label: 'Performance', icon: HiChartBar, path: '/admin/performance', color: 'blue' },
                    { label: 'Support', icon: HiQuestionMarkCircle, path: '/admin/support', color: 'slate' },
                    ...(isHRAdmin ? [{ label: 'Settings', icon: HiCog6Tooth, path: '/admin/settings', color: 'slate' }] : [])
                 ].map((mod) => (
                    <Link key={mod.label} to={mod.path} className="flex flex-col items-center p-4 border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#0F766E] transition-all group">
                       <mod.icon className="h-5 w-5 text-slate-400 mb-3 group-hover:text-[#0F766E] transition-colors" />
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{mod.label}</span>
                    </Link>
                 ))}
              </div>
           </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-8">
           {/* Pending Approvals */}
           {(isHRAdmin || isManager) && (
              <div className="rounded-none border border-slate-200 bg-white p-8 shadow-sm">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                    PENDING_ACTION <HiBellAlert className="h-4 w-4 text-amber-500" />
                 </h3>
                 <div className="space-y-3">
                    {[
                       { label: 'Leave Requests', count: dashboardData.pending.leaves, path: '/admin/leave' },
                       { label: 'Expense Claims', count: dashboardData.pending.expenses, path: '/admin/expenses' },
                       { label: 'Document Audits', count: dashboardData.pending.documents, path: '/admin/documents' }
                    ].map(item => (
                       <Link key={item.label} to={item.path} className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#0F766E] transition-all">
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{item.label}</span>
                          <span className="text-[11px] font-black text-[#0F766E]">{item.count}</span>
                       </Link>
                    ))}
                 </div>
              </div>
           )}

           {/* Compliance Alerts */}
           {isHRAdmin && (
              <div className="rounded-none border border-slate-200 bg-white p-8 shadow-sm">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                    COMPLIANCE_PROTOCOL <HiShieldCheck className="h-4 w-4 text-rose-500" />
                 </h3>
                 <div className="space-y-3">
                    {expiryAlerts.map(alert => (
                       <div key={alert.name} className="p-4 border border-slate-100 bg-slate-50/50">
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{alert.name}</span>
                             <Badge label={alert.count} color={alert.color} variant="soft" className="text-[9px] font-black" />
                          </div>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-tight truncate">{alert.items.join(', ')}</p>
                       </div>
                    ))}
                 </div>
              </div>
           )}

           {/* Celebrations: Visual List */}
           <div className="rounded-none border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                 EVENT_LOG <HiGift className="h-4 w-4 text-rose-500" />
              </h3>
              <div className="space-y-4">
                 {birthdays.map((b, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 bg-slate-50/50 hover:bg-white transition-all group">
                       <Avatar name={b.name} size="sm" className="rounded-none border-2 border-white shadow-sm" />
                       <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-slate-900 mb-1 uppercase tracking-tight truncate">{b.name}</p>
                          <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest">{b.type} • {b.date.toUpperCase()}</p>
                       </div>
                       <div className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">
                          {b.icon}
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Upcoming Holidays */}
           <div className="rounded-none border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                 CALENDAR_PROTOCOL <HiFlag className="h-4 w-4 text-[#0F766E]" />
              </h3>
              <div className="space-y-3">
                 {[
                    { name: 'EID AL ADHA', date: '16 JUNE', days: 'IN 40 DAYS', color: 'emerald' },
                    { name: 'ISLAMIC NEW YEAR', date: '07 JULY', days: 'UPCOMING', color: 'blue' }
                 ].map(h => (
                    <div key={h.name} className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50/50">
                       <div className="flex items-center gap-4">
                          <div className={`h-8 w-1 bg-${h.color}-500`} />
                          <div>
                             <p className="text-[10px] font-black text-slate-900 leading-none mb-1">{h.name}</p>
                             <p className="text-[8px] text-slate-400 font-black uppercase">{h.date}</p>
                          </div>
                       </div>
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{h.days}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
  )
      

      {/* Broadcasts & New Talent */}
      <div className="grid gap-8 lg:grid-cols-3">
         <div className="lg:col-span-2 rounded-none border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Broadcast Repository</h3>
               <HiMegaphone className="h-5 w-5 text-[#0F766E]" />
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
      <div className="grid gap-4 lg:grid-cols-2">
        <RegisteredCompanies companies={DEMO_REGISTERED} loading={false} />
        <ExpiredPlans plans={DEMO_EXPIRED} loading={false} />
      </div>
    </div>
  )
}
   


     

