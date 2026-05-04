import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { 
  HiCheckCircle, 
  HiClock, 
  HiCurrencyDollar, 
  HiExclamationTriangle, 
  HiGlobeAlt, 
  HiUsers, 
  HiArrowTrendingUp,
  HiServerStack,
  HiShieldCheck
} from 'react-icons/hi2'

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [platformStatus] = useState({
    api: 'Healthy',
    database: 'Healthy',
    storage: 'Healthy',
    uptime: '99.98%'
  })

  const recentTenants = useMemo(() => [
    { id: 1, name: 'AlphaCorp HR', domain: 'alphacorp.hriscloud.io', plan: 'Enterprise', users: 342, status: 'Active', initials: 'AL', color: 'indigo' },
    { id: 2, name: 'HR Nexus', domain: 'hrnexus.hriscloud.io', plan: 'Growth', users: 87, status: 'Trial', initials: 'HR', color: 'cyan' },
    { id: 3, name: 'TalentCo', domain: 'talentco.com', plan: 'Pro', users: 156, status: 'SSL Issue', initials: 'TC', color: 'green' },
    { id: 4, name: 'Zenith People', domain: 'zenith.hriscloud.io', plan: 'Starter', users: 24, status: 'Suspended', initials: 'ZE', color: 'amber' },
  ], [])

  const recentActivity = useMemo(() => [
    { id: 1, action: 'New tenant onboarded', detail: 'AlphaCorp HR joined on Enterprise plan', time: '2 hours ago', color: 'green' },
    { id: 2, action: 'Custom domain verified', detail: 'nexushr.ae DNS propagated successfully', time: '5 hours ago', color: 'indigo' },
    { id: 3, action: 'SSL renewal triggered', detail: 'Auto-renew for alphacorp.hriscloud.io', time: '8 hours ago', color: 'amber' },
    { id: 4, action: 'Tenant suspended', detail: 'Zenith People — payment overdue 14d', time: '1 day ago', color: 'red' },
  ], [])

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Control Center</h1>
          <p className="mt-1 text-sm text-gray-500">Global overview of all tenant environments and system health.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">All Systems Operational</span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-xs font-medium text-gray-500">v2.5.0-stable</span>
        </div>
      </div>

      {/* Professional Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="TOTAL REVENUE (MRR)" value="$48,290" trend="+12.5%" trendColor="green" icon={HiCurrencyDollar} />
        <StatCard title="ACTIVE TENANTS" value="41" trend="+3 this week" trendColor="green" icon={HiGlobeAlt} />
        <StatCard title="TOTAL END USERS" value="8,429" trend="+212" trendColor="blue" icon={HiUsers} />
        <StatCard title="AVG. SESSION TIME" value="18m 42s" trend="+4%" trendColor="green" icon={HiClock} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Tenants Table */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">Recent Onboarding</h2>
                <p className="text-xs text-gray-500">Newly registered organizations across the platform.</p>
              </div>
              <Button label="Manage All Tenants" variant="ghost" size="sm" onClick={() => navigate('/superadmin/tenants')} />
            </div>
            <Table
              columns={[
                { key: 'tenant', label: 'Organization' },
                { key: 'plan', label: 'Plan' },
                { key: 'users', label: 'Users' },
                { key: 'status', label: 'Status' },
              ]}
              data={recentTenants.map((tenant) => ({
                tenant: (
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${tenant.color}-50 text-[10px] font-bold text-${tenant.color}-600 border border-${tenant.color}-100`}>
                      {tenant.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{tenant.name}</div>
                      <div className="text-[10px] text-gray-400">{tenant.domain}</div>
                    </div>
                  </div>
                ),
                plan: <Badge label={tenant.plan} color={tenant.plan === 'Enterprise' ? 'amber' : 'blue'} />,
                users: <span className="text-sm font-medium text-gray-700">{tenant.users}</span>,
                status: <Badge label={tenant.status} color={tenant.status === 'Active' ? 'green' : tenant.status === 'Trial' ? 'amber' : 'gray'} />,
              }))}
            />
          </div>

          {/* Revenue Trends (Simplified Mock) */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-gray-900">Revenue Growth</h2>
                <Badge label="Annual View" color="indigo" />
             </div>
             <div className="flex items-end gap-2 h-32">
                {[40, 55, 45, 60, 75, 70, 85, 90, 80, 95, 100, 110].map((h, i) => (
                  <div key={i} className="flex-1 bg-blue-500 rounded-t-sm opacity-20 hover:opacity-100 transition-all cursor-pointer" style={{ height: `${h}%` }} title={`Month ${i+1}: $${h}k`} />
                ))}
             </div>
             <div className="mt-4 flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>JAN</span><span>JUN</span><span>DEC</span>
             </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          {/* Platform Health Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HiServerStack className="text-blue-500" /> Platform Infrastructure
            </h2>
            <div className="space-y-3">
              {Object.entries(platformStatus).map(([key, status]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{key}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${status === 'Healthy' ? 'bg-green-500' : 'bg-blue-500'}`} />
                    <span className="text-xs font-bold text-gray-900">{status}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button label="View System Logs" variant="ghost" className="w-full mt-4 text-xs" onClick={() => navigate('/superadmin/audit')} />
          </div>

          {/* Critical Alerts */}
          <div className="rounded-xl border border-red-100 bg-red-50 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-red-900 mb-3 flex items-center gap-2">
              <HiExclamationTriangle /> Critical Alerts
            </h2>
            <div className="space-y-3">
               <div className="p-3 bg-white rounded-lg border border-red-100 shadow-sm">
                  <p className="text-[11px] font-bold text-red-800">SSL EXPIRING</p>
                  <p className="text-xs text-red-600 mt-0.5">talentco.com expires in 8 days.</p>
               </div>
               <div className="p-3 bg-white rounded-lg border border-amber-100 shadow-sm">
                  <p className="text-[11px] font-bold text-amber-800">TRIAL EXPIRING</p>
                  <p className="text-xs text-amber-600 mt-0.5">HR Nexus trial ends in 48h.</p>
               </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Platform Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3 relative">
                  <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-${activity.color}-500 shadow-[0_0_8px] shadow-${activity.color}-500/50`} />
                  <div>
                    <p className="text-xs font-bold text-gray-900">{activity.action}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{activity.detail}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{activity.time}</p>
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
