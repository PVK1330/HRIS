import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { 
  HiMagnifyingGlass, 
  HiFunnel, 
  HiArrowPath, 
  HiCalendarDays,
  HiShieldCheck
} from 'react-icons/hi2'

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('')
  const [tenantFilter, setTenantFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Security Audit</h1>
          <p className="mt-1 text-sm text-gray-500">Immutable trail of all administrative events across the entire tenant network.</p>
        </div>
        <div className="flex gap-2">
           <Button label="Export CSV" variant="ghost" size="sm" />
           <Button label="Refresh" variant="ghost" size="sm" icon={HiArrowPath} />
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Global Search</label>
            <div className="relative">
               <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
               <input 
                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                 placeholder="Search by action, user, or target..." 
                 value={searchQuery} 
                 onChange={(e) => setSearchQuery(e.target.value)} 
               />
            </div>
          </div>
          <div className="w-full lg:w-48 space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Tenant Network</label>
            <select
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
            >
              <option value="all">All Ecosystem</option>
              <option value="AlphaCorp">AlphaCorp HR</option>
              <option value="HR Nexus">HR Nexus</option>
            </select>
          </div>
          <div className="w-full lg:w-48 space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Event Category</label>
            <select
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="all">Any Action</option>
              <option value="Login">Access Events</option>
              <option value="Tenant">Provisioning</option>
              <option value="Domain">DNS/Domains</option>
              <option value="Billing">Financial</option>
            </select>
          </div>
          <Button label="Clear" variant="ghost" size="sm" className="h-[42px]" onClick={() => { setSearchQuery(''); setTenantFilter('all'); setActionFilter('all'); }} />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table
          columns={[
            { key: 'timestamp', label: 'Precise Timestamp' },
            { key: 'admin', label: 'Actor' },
            { key: 'action', label: 'Event Type' },
            { key: 'target', label: 'Affected Target' },
            { key: 'ip', label: 'IP / Location' },
            { key: 'result', label: 'Outcome' },
          ]}
          data={filteredLogs.map((log) => ({
            timestamp: (
              <div className="flex items-center gap-2">
                 <HiCalendarDays className="text-gray-400 h-4 w-4" />
                 <span className="font-mono text-[11px] text-gray-500">{log.timestamp}</span>
              </div>
            ),
            admin: <span className="text-sm font-bold text-gray-900">{log.admin}</span>,
            action: <Badge label={log.action} color={log.action.includes('Tenant') ? 'blue' : log.action.includes('Domain') ? 'indigo' : 'gray'} />,
            target: <span className="text-sm text-gray-700 font-medium">{log.target}</span>,
            ip: <span className="font-mono text-xs text-gray-400">{log.ip}</span>,
            result: (
              <div className="flex items-center gap-1.5">
                 <div className={`h-1.5 w-1.5 rounded-full ${log.result === 'Success' ? 'bg-green-500' : 'bg-red-500'}`} />
                 <span className={`text-[10px] font-bold uppercase ${log.result === 'Success' ? 'text-green-600' : 'text-red-600'}`}>{log.result}</span>
              </div>
            ),
          }))}
        />
        {filteredLogs.length === 0 && (
           <div className="py-20 text-center">
              <HiShieldCheck className="mx-auto h-12 w-12 text-gray-100" />
              <p className="mt-2 text-sm text-gray-400">No audit logs matching your filters.</p>
           </div>
        )}
      </div>
    </div>
  )
}
