import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Table } from '../../../components/ui/Table.jsx'

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('')
  const [tenantFilter, setTenantFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const auditLogs = useMemo(() => [
    { id: 1, timestamp: '2026-04-09 14:31:22', admin: 'Super Admin', action: 'Tenant Created', target: 'AlphaCorp HR', ip: '192.168.1.1', result: 'Success' },
    { id: 2, timestamp: '2026-04-09 12:15:44', admin: 'Raj Mehta', action: 'Domain Verified', target: 'nexushr.ae', ip: '10.0.0.42', result: 'Success' },
    { id: 3, timestamp: '2026-04-09 09:02:11', admin: 'Super Admin', action: 'Tenant Suspended', target: 'Zenith People', ip: '192.168.1.1', result: 'Success' },
    { id: 4, timestamp: '2026-04-08 18:55:30', admin: 'Sara Patel', action: 'Plan Changed', target: 'HR Nexus: Starter→Growth', ip: '10.0.0.55', result: 'Success' },
    { id: 5, timestamp: '2026-04-08 14:22:01', admin: 'Raj Mehta', action: 'Login', target: 'SuperAdmin Panel', ip: '10.0.0.42', result: 'Success' },
  ], [])

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.admin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTenant = tenantFilter === 'all' || log.target.includes(tenantFilter)
      const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter)
      return matchesSearch && matchesTenant && matchesAction
    })
  }, [auditLogs, searchQuery, tenantFilter, actionFilter])

  const actionColor = (action) => {
    const colors = {
      'Tenant Created': 'blue',
      'Domain Verified': 'indigo',
      'Tenant Suspended': 'red',
      'Plan Changed': 'amber',
      'Login': 'gray',
    }
    return colors[action] || 'gray'
  }

  const resultColor = (result) => {
    return result === 'Success' ? 'green' : 'red'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-gray-600">Track all administrative actions across the platform</p>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Search</label>
            <Input placeholder="Action, user, tenant..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Tenant</label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20"
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
            >
              <option value="all">All Tenants</option>
              <option value="AlphaCorp">AlphaCorp HR</option>
              <option value="HR Nexus">HR Nexus</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Action Type</label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="Login">Login</option>
              <option value="Domain">Domain</option>
              <option value="Billing">Billing</option>
              <option value="Settings">Settings</option>
              <option value="Tenant">Tenant</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Date From</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Date To</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <Table
          columns={[
            { key: 'timestamp', label: 'Timestamp' },
            { key: 'admin', label: 'Admin / Tenant' },
            { key: 'action', label: 'Action' },
            { key: 'target', label: 'Target' },
            { key: 'ip', label: 'IP Address' },
            { key: 'result', label: 'Result' },
          ]}
          data={filteredLogs.map((log) => ({
            timestamp: <span className="font-mono text-xs text-gray-500">{log.timestamp}</span>,
            admin: <span className="text-sm font-semibold text-gray-900">{log.admin}</span>,
            action: <Badge variant={actionColor(log.action)}>{log.action}</Badge>,
            target: <span className="text-sm text-gray-500">{log.target}</span>,
            ip: <span className="font-mono text-xs text-gray-500">{log.ip}</span>,
            result: <Badge variant={resultColor(log.result)}>{log.result}</Badge>,
          }))}
        />
      </div>
    </div>
  )
}
