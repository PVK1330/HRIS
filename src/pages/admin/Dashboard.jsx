import { useEffect, useMemo, useState } from 'react'
import { Building2, Package, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import ManagerDashboard from '../../components/manager/ManagerDashboard.jsx'
import {
  fetchAdminDashboard,
  fetchEmployeeDashboard,
} from '../../services/dashboardService.js'
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
    ? dashboardData.growthData
        .slice(-7)
        .map((item) => ({ name: item.name, companies: item.headcount }))
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
      color: '#f59e0b',
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

      <div className="grid gap-4 lg:grid-cols-2">
        <RegisteredCompanies companies={DEMO_REGISTERED} loading={false} />
        <ExpiredPlans plans={DEMO_EXPIRED} loading={false} />
      </div>
    </div>
  )
}
