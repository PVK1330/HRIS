import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { HiCheck, HiClock, HiCurrencyDollar, HiExclamationTriangle, HiGlobeAlt, HiUsers } from 'react-icons/hi2'

export default function SuperAdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('')

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
    { id: 5, action: 'Plan upgraded', detail: 'HR Nexus: Starter → Growth plan', time: '2 days ago', color: 'cyan' },
  ], [])

  const statusColor = (status) => {
    const colors = {
      'Active': 'green',
      'Trial': 'amber',
      'SSL Issue': 'orange',
      'Suspended': 'gray',
    }
    return colors[status] || 'gray'
  }

  const planColor = (plan) => {
    const colors = {
      'Enterprise': 'amber',
      'Growth': 'cyan',
      'Pro': 'indigo',
      'Starter': 'gray',
    }
    return colors[plan] || 'gray'
  }

  const activityColor = (color) => {
    const colors = {
      'green': 'bg-green-500',
      'indigo': 'bg-indigo-500',
      'amber': 'bg-amber-500',
      'red': 'bg-red-500',
      'cyan': 'bg-cyan-500',
    }
    return colors[color] || 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
          <p className="mt-1 text-sm text-gray-600">Real-time control center — All systems operational</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-semibold text-green-600">All Systems Online</span>
          <span className="text-sm text-gray-500 ml-2">9 Apr 2026, 14:32 UTC</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Tenants"
          value="48"
          trend="+6 this month"
          trendColor="green"
          icon={HiUsers}
        />
        <StatCard
          title="Active Tenants"
          value="41"
          trend="Active"
          trendColor="green"
          icon={HiCheck}
        />
        <StatCard
          title="Total End Users"
          value="8,429"
          trend="+212"
          trendColor="cyan"
          icon={HiUsers}
        />
        <StatCard
          title="Monthly Revenue"
          value="$47.2k"
          trend="MRR"
          trendColor="amber"
          icon={HiCurrencyDollar}
        />
        <StatCard
          title="SSL Expiring Soon"
          value="3"
          trend="Action needed"
          trendColor="red"
          icon={HiExclamationTriangle}
        />
        <StatCard
          title="Custom Domains"
          value="19"
          trend="Custom"
          trendColor="indigo"
          icon={HiGlobeAlt}
        />
      </div>

      {/* Alerts */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          <HiExclamationTriangle className="h-4 w-4" />
          SSL certificate for <strong>talentco.com</strong> expires in 8 days. Renew immediately.
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
          <HiClock className="h-4 w-4" />
          Tenant <strong>HR Nexus Pvt Ltd</strong> trial expires in 3 days. Send upgrade prompt.
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm font-semibold text-indigo-700">
          <HiCheck className="h-4 w-4" />
          Platform update v2.5.0 scheduled for deployment on 15 Apr 2026 at 02:00 UTC.
        </div>
      </div>

      {/* Recent Tenants & Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Tenants */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900">Recent Tenants</h2>
              <Button label="View All →" variant="ghost" size="sm" />
            </div>
            <Table
              columns={[
                { key: 'tenant', label: 'Tenant' },
                { key: 'plan', label: 'Plan' },
                { key: 'users', label: 'Users' },
                { key: 'status', label: 'Status' },
              ]}
              data={recentTenants.map((tenant) => ({
                tenant: (
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-${tenant.color}-100 text-xs font-bold text-${tenant.color}-600`}>
                      {tenant.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{tenant.name}</div>
                      <div className="text-xs text-gray-500">{tenant.domain}</div>
                    </div>
                  </div>
                ),
                plan: <Badge variant={planColor(tenant.plan)}>{tenant.plan}</Badge>,
                users: <span className="font-semibold text-gray-900">{tenant.users}</span>,
                status: <Badge variant={statusColor(tenant.status)}>{tenant.status}</Badge>,
              }))}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="space-y-3 p-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-2">
                  <div className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${activityColor(activity.color)}`} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{activity.action}</div>
                    <div className="text-xs text-gray-500">{activity.detail}</div>
                    <div className="mt-1 text-xs text-gray-400">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Plan Distribution</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: 'STARTER', count: 12, percent: 25, color: 'gray', price: '$299/mo avg' },
            { name: 'GROWTH', count: 18, percent: 38, color: 'cyan', price: '$699/mo avg' },
            { name: 'PRO', count: 11, percent: 23, color: 'indigo', price: '$1,299/mo avg' },
            { name: 'ENTERPRISE', count: 7, percent: 15, color: 'amber', price: '$2,999/mo avg' },
          ].map((plan) => (
            <div key={plan.name} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="mb-2 text-xs font-bold tracking-wider text-gray-500">{plan.name}</div>
              <div className="text-2xl font-bold text-gray-900">{plan.count}</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
                <div className={`h-full rounded-full bg-${plan.color}-500`} style={{ width: `${plan.percent}%` }} />
              </div>
              <div className="mt-2 text-xs text-gray-500">{plan.percent}% of tenants · {plan.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
