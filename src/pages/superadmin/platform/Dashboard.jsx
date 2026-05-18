import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import api from '../../../services/api'
import { superadminService } from '../../../services/superadminService.js'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts'
import {
  HiExclamationTriangle,
  HiGlobeAlt,
  HiUsers,
  HiSignal,
  HiServerStack,
  HiSparkles,
  HiShieldCheck,
  HiCurrencyDollar
} from 'react-icons/hi2'

const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [platformStatus, setPlatformStatus] = useState({ api: 'Checking...', database: 'Checking...', storage: 'Checking...', uptime: 'N/A' })
  const [stats, setStats] = useState({ monthlyRevenue: 0, activeOrganizations: 0, totalUsers: 0 })
  const [recentOrganizations, setRecentOrganizations] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [revenueData, setRevenueData] = useState([{ month: 'N/A', amount: 0 }])
  const [growthData, setGrowthData] = useState([{ name: 'N/A', value: 0 }])
  const [sslAlerts, setSslAlerts] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [tenantsRes, paymentStatsRes, paymentsRes, announcementsRes] = await Promise.all([
          api.get('/tenants', { params: { page: 1, limit: 100 } }),
          superadminService.getPaymentStats(),
          superadminService.getPayments({ page: 1, limit: 200 }),
          superadminService.getAnnouncements(),
        ])

        const tenants = tenantsRes?.data?.data?.tenants || []
        const payments = paymentsRes?.data?.data?.payments || []
        const announcements = announcementsRes?.data?.data?.announcements || []
        const paymentStats = paymentStatsRes?.data?.data || {}

        setStats({
          monthlyRevenue: Number(paymentStats.monthly_revenue || 0),
          activeOrganizations: tenants.filter((t) => t.status === 'active').length,
          totalUsers: tenants.length,
        })

        setRecentOrganizations(
          tenants.slice(0, 6).map((t) => ({
            id: t.id,
            name: t.name,
            domain: t.db_name,
            plan: t.plan || 'N/A',
            users: 0,
            status: `${(t.status || '').charAt(0).toUpperCase()}${(t.status || '').slice(1)}`,
            initials: t.name.substring(0, 2).toUpperCase(),
          }))
        )

        const monthlyRevenueMap = {}
        payments.forEach((p) => {
          const m = new Date(p.created_at).toLocaleString('en-US', { month: 'short' })
          monthlyRevenueMap[m] = (monthlyRevenueMap[m] || 0) + Number(p.amount || 0)
        })
        const rData = monthOrder.filter((m) => monthlyRevenueMap[m] !== undefined).map((m) => ({ month: m, amount: monthlyRevenueMap[m] }))
        setRevenueData(rData.length ? rData : [{ month: 'N/A', amount: 0 }])

        const growthMap = {}
        tenants.forEach((t) => {
          const m = new Date(t.created_at).toLocaleString('en-US', { month: 'short' })
          growthMap[m] = (growthMap[m] || 0) + 1
        })
        const gData = monthOrder.filter((m) => growthMap[m] !== undefined).map((m) => ({ name: m, value: growthMap[m] }))
        setGrowthData(gData.length ? gData : [{ name: 'N/A', value: 0 }])

        setRecentActivity(
          announcements.slice(0, 4).map((a) => ({
            id: a.id,
            action: a.title,
            detail: a.message,
            time: a.sentDate || '-',
            color: 'indigo'
          }))
        )

        setSslAlerts(tenants.filter((t) => t.status === 'ssl issue' || t.status === 'ssl_issue').slice(0, 3))
        setPlatformStatus({ api: 'Healthy', database: 'Healthy', storage: 'Healthy', uptime: 'Live' })
      } catch (error) {
        console.error('Failed to load dashboard data', error)
        setPlatformStatus({ api: 'Issue', database: 'Issue', storage: 'Unknown', uptime: 'Unknown' })
      }
    }
    load()
  }, [])

  return (
    <div className="sa-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600 shadow-sm">
              <HiSparkles className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Dashboard</h1>
          </div>
          <p className="text-[10px] font-medium text-slate-500">Platform overview and system health.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="TOTAL REVENUE" value={`AED ${stats.monthlyRevenue.toLocaleString()}`} trendColor="green" icon={HiCurrencyDollar} />
        <StatCard title="ACTIVE ORGANIZATIONS" value={String(stats.activeOrganizations)} trendColor="green" icon={HiGlobeAlt} />
        <StatCard title="TOTAL USERS" value={String(stats.totalUsers)} trendColor="blue" icon={HiUsers} />
        <StatCard title="SYSTEM UPTIME" value={platformStatus.uptime} trendColor="green" icon={HiSignal} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="sa-card lg:col-span-2 p-3.5">
          <h3 className="text-xs font-bold text-slate-900 mb-3">Revenue Performance</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 500 }} />
                <ChartTooltip />
                <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2.5} fill="#e0e7ff" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="sa-card p-3.5">
          <h3 className="text-xs font-bold text-slate-900 mb-3">Organization Growth</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 500 }} />
                <ChartTooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {growthData.map((_, index) => <Cell key={`cell-${index}`} fill={index === growthData.length - 1 ? '#4f46e5' : '#f1f5f9'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="sa-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-50 p-3 bg-slate-50/30">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                  <HiShieldCheck className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-xs font-bold text-slate-900 tracking-tight">Recent Organizations</h2>
              </div>
              <Button label="View All" variant="ghost" size="sm" className="text-[10px]" onClick={() => navigate('/superadmin/tenants')} />
            </div>
            <Table
              columns={[
                { key: 'tenant', label: 'Organization' },
                { key: 'plan', label: 'Plan' },
                { key: 'users', label: 'Users' },
                { key: 'status', label: 'Status' },
              ]}
              data={recentOrganizations.map((org) => ({
                tenant: (
                  <div className="flex items-center gap-3 py-0.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-[10px] font-bold text-indigo-600 border border-indigo-100">{org.initials}</div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 tracking-tight">{org.name}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{org.domain}</div>
                    </div>
                  </div>
                ),
                plan: <Badge label={org.plan} color={org.plan === 'Enterprise' ? 'amber' : 'blue'} variant="glass" />,
                users: <span className="text-sm font-bold text-slate-700">{org.users}</span>,
                status: <Badge label={org.status} color={org.status === 'Active' ? 'green' : org.status === 'Trial' ? 'amber' : 'gray'} />,
              }))}
            />
          </div>

          <div className="sa-card p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <HiServerStack className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-xs font-bold text-slate-900 tracking-tight">Server Health</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {Object.entries(platformStatus).map(([key, status]) => (
                <div key={key} className="p-2.5 rounded-lg border border-slate-50 bg-slate-50/50">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{key}</p>
                  <p className="text-xs font-bold text-slate-900 mt-1">{status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 shadow-sm">
            <h2 className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <HiExclamationTriangle className="animate-pulse" /> Important Alerts
            </h2>
            <div className="space-y-2.5">
              {sslAlerts.length === 0 ? (
                <div className="p-3 bg-white rounded-lg border border-red-50 shadow-sm">
                  <p className="text-[10px] text-slate-500 font-medium">No SSL alerts right now.</p>
                </div>
              ) : sslAlerts.map((tenant) => (
                <div key={tenant.id} className="p-3 bg-white rounded-lg border border-red-50 shadow-sm">
                  <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">SSL Security</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{tenant.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Status: {tenant.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="sa-card p-4">
            <h2 className="text-xs font-bold text-slate-900 mb-4">Platform Activity</h2>
            <div className="space-y-4 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-100" />
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3 relative z-10">
                  <div className="mt-1 h-3 w-3 flex-shrink-0 rounded-full border-2 border-white bg-indigo-500 shadow-sm" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-900 tracking-tight">{activity.action}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{activity.detail}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase mt-0.5 tracking-widest">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
