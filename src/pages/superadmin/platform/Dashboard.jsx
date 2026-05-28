import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge.jsx'
import { superadminService } from '../../../services/superadminService.js'
import {
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  HiArrowPath,
  HiBuildingOffice,
  HiDocumentArrowDown,
  HiUsers,
  HiCurrencyDollar,
} from 'react-icons/hi2'

const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const weekOrder = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function toNumber(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function cap(v) {
  return `${String(v || '').charAt(0).toUpperCase()}${String(v || '').slice(1)}`
}

function formatDate(v) {
  if (!v) return '-'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function MetricTile({ icon: Icon, label, value, tone = 'slate' }) {
  const tones = {
    slate: 'from-slate-900 to-slate-700',
    green: 'from-[#0F766E] to-[#0c6b64]',
    blue: 'from-blue-600 to-blue-500',
    emerald: 'from-emerald-600 to-emerald-500',
  }
  return (
    <div className="rounded-none border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-none bg-gradient-to-r text-white shadow-sm ${tones[tone] || tones.slate}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    totalSubscribers: 0,
    totalEarnings: 0,
  })
  const [weeklyCompanies, setWeeklyCompanies] = useState(weekOrder.map((d) => ({ day: d, companies: 0 })))
  const [revenueData, setRevenueData] = useState(monthOrder.map((m) => ({ month: m, amount: 0 })))
  const [topPlans, setTopPlans] = useState([
    { name: 'Basic', value: 0, color: '#f97316' },
    { name: 'Premium', value: 0, color: '#3b82f6' },
    { name: 'Enterprise', value: 0, color: '#facc15' },
  ])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [recentlyRegistered, setRecentlyRegistered] = useState([])
  const [recentPlanExpired, setRecentPlanExpired] = useState([])

  const load = async () => {
    setLoading(true)
    try {
      const [tenantsRes, paymentsRes, paymentStatsRes] = await Promise.all([
        superadminService.getTenants(),
        superadminService.getPayments({ page: 1, limit: 200 }),
        superadminService.getPaymentStats(),
      ])

      const tenants = tenantsRes?.data?.data?.tenants || []
      const payments = paymentsRes?.data?.data?.payments || []
      const paymentStats = paymentStatsRes?.data?.data || {}

      const activeCompanies = tenants.filter((t) => String(t.status || '').toLowerCase() === 'active').length
      const totalEarnings =
        toNumber(paymentStats.total_revenue) ||
        toNumber(paymentStats.monthly_revenue) ||
        payments.reduce((sum, p) => sum + toNumber(p.amount), 0)

      setStats({
        totalCompanies: tenants.length,
        activeCompanies,
        totalSubscribers: payments.length,
        totalEarnings,
      })

      // Weekly company registration bars
      const dayCounts = { SUN: 0, MON: 0, TUE: 0, WED: 0, THU: 0, FRI: 0, SAT: 0 }
      tenants.forEach((t) => {
        if (!t.created_at) return
        const d = new Date(t.created_at)
        if (Number.isNaN(d.getTime())) return
        const key = weekOrder[d.getDay()]
        dayCounts[key] += 1
      })
      setWeeklyCompanies(weekOrder.map((day) => ({ day, companies: dayCounts[day] || 0 })))

      // Monthly revenue bars
      const monthRevenue = {}
      payments.forEach((p) => {
        if (!p.created_at) return
        const month = new Date(p.created_at).toLocaleString('en-US', { month: 'short' })
        monthRevenue[month] = (monthRevenue[month] || 0) + toNumber(p.amount)
      })
      setRevenueData(monthOrder.map((month) => ({ month, amount: monthRevenue[month] || 0 })))

      // Top plans donut
      const planCounts = { Basic: 0, Premium: 0, Enterprise: 0 }
      tenants.forEach((t) => {
        const plan = String(t.plan || t.plan_name || '').toLowerCase()
        if (plan.includes('enterprise')) planCounts.Enterprise += 1
        else if (plan.includes('premium')) planCounts.Premium += 1
        else planCounts.Basic += 1
      })
      setTopPlans([
        { name: 'Basic', value: planCounts.Basic, color: '#f97316' },
        { name: 'Premium', value: planCounts.Premium, color: '#3b82f6' },
        { name: 'Enterprise', value: planCounts.Enterprise, color: '#facc15' },
      ])

      setRecentTransactions(
        payments.slice(0, 6).map((p) => ({
          id: p.id,
          name: p.customer_name || p.tenant_name || `Tenant #${p.tenant_id || p.id}`,
          code: `#${p.invoice_no || p.id}`,
          date: formatDate(p.created_at),
          amount: toNumber(p.amount),
          plan: cap(p.plan_name || p.plan || p.billing_cycle || 'Subscription'),
        })),
      )

      setRecentlyRegistered(
        tenants.slice(0, 6).map((t) => ({
          id: t.id,
          name: t.name,
          plan: cap(t.plan || t.plan_name || 'Basic'),
          users: toNumber(t.user_count || t.users || 0),
          domain: t.domain || t.subdomain || t.db_name || '-',
        })),
      )

      const now = new Date()
      const expired = tenants
        .filter((t) => {
          const status = String(t.status || '').toLowerCase()
          if (status.includes('expired')) return true
          const expiry = t.expires_at || t.expiry_date || t.plan_expiry
          if (!expiry) return false
          const d = new Date(expiry)
          return !Number.isNaN(d.getTime()) && d < now
        })
        .slice(0, 6)
        .map((t) => ({
          id: t.id,
          name: t.name,
          expiredOn: formatDate(t.expires_at || t.expiry_date || t.plan_expiry),
          plan: cap(t.plan || t.plan_name || 'Basic'),
        }))
      setRecentPlanExpired(expired)
    } catch (error) {
      console.error('Failed to load superadmin dashboard', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const totalPlans = useMemo(
    () => topPlans.reduce((sum, p) => sum + p.value, 0),
    [topPlans],
  )

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-xs text-slate-500">Super Admin / Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="inline-flex h-9 items-center gap-2 rounded-none border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <HiArrowPath className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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

      <div className="rounded-none border border-slate-200 bg-gradient-to-r from-[#0F766E] to-[#0c6b64] p-5 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-bold">Welcome Back, Super Admin</p>
            <p className="mt-1 text-sm text-emerald-50">
              {stats.totalCompanies} companies tracked across the platform.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-8 rounded-none bg-slate-900 px-4 text-xs font-semibold text-white">Companies</button>
            <button className="h-8 rounded-none bg-white px-4 text-xs font-semibold text-slate-900">All Packages</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile icon={HiBuildingOffice} label="Total Companies" value={stats.totalCompanies} />
        <MetricTile icon={HiUsers} label="Active Companies" value={stats.activeCompanies} tone="blue" />
        <MetricTile icon={HiUsers} label="Total Subscribers" value={stats.totalSubscribers} tone="emerald" />
        <MetricTile icon={HiCurrencyDollar} label="Total Earnings" value={`$${stats.totalEarnings.toLocaleString()}`} tone="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-none border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Companies</h3>
            <span className="text-xs text-slate-400">This week</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyCompanies}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <ChartTooltip />
                <Bar dataKey="companies" radius={[6, 6, 0, 0]} fill="#111827" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-none border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Revenue</h3>
            <span className="text-xs text-slate-400">{new Date().getFullYear()}</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <ChartTooltip />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-none border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Top Plans</h3>
          <span className="text-xs text-slate-400">This month</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topPlans} dataKey="value" innerRadius={52} outerRadius={84} paddingAngle={2}>
                  {topPlans.map((p) => (
                    <Cell key={p.name} fill={p.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 self-center">
            {topPlans.map((plan) => {
              const percent = totalPlans ? Math.round((plan.value / totalPlans) * 100) : 0
              return (
                <div key={plan.name} className="flex items-center justify-between border-b border-slate-100 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: plan.color }} />
                    <span className="text-sm text-slate-700">{plan.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{percent}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="rounded-none border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Recent Transactions</h3>
          <button
            type="button"
            onClick={() => navigate('/superadmin/payments')}
            className="text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            View all
          </button>
        </div>
        <div className="space-y-3">
          {recentTransactions.length ? recentTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{tx.name}</p>
                <p className="text-xs text-slate-500">{tx.code} • {tx.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-emerald-600">+${tx.amount}</p>
                <p className="text-xs text-slate-500">{tx.plan}</p>
              </div>
            </div>
          )) : (
            <p className="text-sm text-slate-500">No transactions found.</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-none border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Recently Registered</h3>
            <button
              type="button"
              onClick={() => navigate('/superadmin/tenants')}
              className="text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {recentlyRegistered.length ? recentlyRegistered.map((t) => (
              <div key={t.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.domain}</p>
                </div>
                <div className="text-right">
                  <Badge label={t.plan} color={t.plan.toLowerCase().includes('enterprise') ? 'amber' : 'blue'} />
                  <p className="mt-1 text-xs text-slate-500">{t.users} users</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No recent registrations.</p>
            )}
          </div>
        </div>

        <div className="rounded-none border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Recent Plan Expired</h3>
            <button
              type="button"
              onClick={() => navigate('/superadmin/tenants')}
              className="text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              Expired
            </button>
          </div>
          <div className="space-y-3">
            {recentPlanExpired.length ? recentPlanExpired.map((t) => (
              <div key={t.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">Expired: {t.expiredOn}</p>
                </div>
                <button
                  type="button"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Send Reminder
                </button>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No expired plans.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
