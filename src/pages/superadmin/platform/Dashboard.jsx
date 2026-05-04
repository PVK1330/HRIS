import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
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
  HiClock, 
  HiCurrencyDollar, 
  HiExclamationTriangle, 
  HiGlobeAlt, 
  HiUsers, 
  HiQuestionMarkCircle,
  HiSignal,
  HiServerStack,
  HiSparkles,
  HiShieldCheck
} from 'react-icons/hi2'

const revenueData = [
  { month: 'Jan', amount: 32000 },
  { month: 'Feb', amount: 35000 },
  { month: 'Mar', amount: 33000 },
  { month: 'Apr', amount: 38000 },
  { month: 'May', amount: 42000 },
  { month: 'Jun', amount: 48290 },
]

const growthData = [
  { name: 'Jan', value: 4 },
  { name: 'Feb', value: 7 },
  { name: 'Mar', value: 5 },
  { name: 'Apr', value: 8 },
  { name: 'May', value: 12 },
  { name: 'Jun', value: 15 },
]

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  
  const [platformStatus] = useState({
    api: 'Healthy',
    database: 'Healthy',
    storage: 'Healthy',
    uptime: '99.98%'
  })

  const recentOrganizations = useMemo(() => [
    { id: 1, name: 'AlphaCorp HR', domain: 'alphacorp.hriscloud.io', plan: 'Enterprise', users: 342, status: 'Active', initials: 'AL', color: 'indigo' },
    { id: 2, name: 'HR Nexus', domain: 'hrnexus.hriscloud.io', plan: 'Growth', users: 87, status: 'Trial', initials: 'HR', color: 'cyan' },
    { id: 3, name: 'TalentCo', domain: 'talentco.com', plan: 'Pro', users: 156, status: 'SSL Issue', initials: 'TC', color: 'green' },
    { id: 4, name: 'Zenith People', domain: 'zenith.hriscloud.io', plan: 'Starter', users: 24, status: 'Suspended', initials: 'ZE', color: 'amber' },
  ], [])

  const recentActivity = useMemo(() => [
    { id: 1, action: 'New organization onboarded', detail: 'AlphaCorp HR joined', time: '2h ago', color: 'green' },
    { id: 2, action: 'Custom domain verified', detail: 'nexushr.ae propagated', time: '5h ago', color: 'indigo' },
    { id: 3, action: 'SSL renewal triggered', detail: 'alphacorp.hriscloud.io', time: '8h ago', color: 'amber' },
    { id: 4, action: 'Organization suspended', detail: 'Zenith People overdue', time: '1d ago', color: 'red' },
  ], [])

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
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
        
        <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-100">
           <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[8px] font-bold text-slate-900 uppercase tracking-widest">Status: 100%</span>
           </div>
           <div className="h-3 w-px bg-slate-100" />
           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">v2.5.8</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="TOTAL REVENUE" value="$48,290" trend="+12.5%" trendColor="green" icon={HiCurrencyDollar} />
        <StatCard title="ACTIVE ORGANIZATIONS" value="41" trend="+3 New" trendColor="green" icon={HiGlobeAlt} />
        <StatCard title="TOTAL USERS" value="8,429" trend="+212" trendColor="blue" icon={HiUsers} />
        <StatCard title="SYSTEM UPTIME" value="99.98%" trend="Optimal" trendColor="green" icon={HiSignal} />
      </div>

      {/* Graphs Section - More Prominent */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Revenue Performance</h3>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Last 6 Months</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Revenue</span>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 500 }} 
                />
                <ChartTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', padding: '10px' }}
                  itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 500 }}
                  labelStyle={{ color: '#94a3b8', fontSize: '9px', marginBottom: '2px', fontWeight: 600, textTransform: 'uppercase' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#4f46e5" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Organization Growth</h3>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">New Signups</p>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 500 }} 
                />
                <ChartTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', padding: '10px' }}
                  itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 500 }}
                  labelStyle={{ color: '#94a3b8', fontSize: '9px', marginBottom: '2px', fontWeight: 600, textTransform: 'uppercase' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {growthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === growthData.length - 1 ? '#4f46e5' : '#f1f5f9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Organizations Table */}
          <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
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
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${org.color}-50 text-[10px] font-bold text-${org.color}-600 border border-${org.color}-100`}>
                      {org.initials}
                    </div>
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

          {/* Server Health */}
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                      <HiServerStack className="h-3.5 w-3.5" />
                   </div>
                   <h2 className="text-xs font-bold text-slate-900 tracking-tight">Server Health</h2>
                </div>
                <Badge label="Operational" color="green" variant="glass" />
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {Object.entries(platformStatus).map(([key, status]) => (
                   <div key={key} className="p-2.5 rounded-lg border border-slate-50 bg-slate-50/50">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{key}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                         <div className="h-1 w-1 rounded-full bg-emerald-500" />
                         <p className="text-xs font-bold text-slate-900">{status}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Alerts */}
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 shadow-sm">
            <h2 className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <HiExclamationTriangle className="animate-pulse" /> Important Alerts
            </h2>
            <div className="space-y-2.5">
               <div className="p-3 bg-white rounded-lg border border-red-50 shadow-sm">
                  <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">SSL Security</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">talentco.com</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Expiring in 8 days.</p>
               </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-bold text-slate-900 mb-4">Platform Activity</h2>
            <div className="space-y-4 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-100" />
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3 relative z-10">
                  <div className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full border-2 border-white bg-${activity.color}-500 shadow-sm`} />
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
