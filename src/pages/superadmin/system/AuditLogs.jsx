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
  HiShieldCheck,
  HiQuestionMarkCircle,
  HiFingerPrint,
  HiCommandLine,
  HiGlobeAlt,
  HiExclamationCircle,
  HiArrowDownTray
} from 'react-icons/hi2'

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('')
  const [orgFilter, setOrgFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')

  const auditLogs = useMemo(() => [
    { id: 1, timestamp: '2026-04-09 14:31:22', admin: 'Super Admin', action: 'OrganizationCreated', target: 'AlphaCorp HR', ip: '192.168.1.1', result: 'Success' },
    { id: 2, timestamp: '2026-04-09 12:15:44', admin: 'Raj Mehta', action: 'Domain Verified', target: 'nexushr.ae', ip: '10.0.0.42', result: 'Success' },
    { id: 3, timestamp: '2026-04-09 09:02:11', admin: 'Super Admin', action: 'OrganizationSuspended', target: 'Zenith People', ip: '192.168.1.1', result: 'Success' },
    { id: 4, timestamp: '2026-04-08 18:55:30', admin: 'Sara Patel', action: 'Plan Changed', target: 'HR Nexus: Starter→Growth', ip: '10.0.0.55', result: 'Success' },
    { id: 5, timestamp: '2026-04-08 14:22:01', admin: 'Raj Mehta', action: 'Login', target: 'SuperAdmin Panel', ip: '10.0.0.42', result: 'Success' },
  ], [])

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.admin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesOrg = orgFilter === 'all' || log.target.includes(orgFilter)
      const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter)
      return matchesSearch && matchesOrg && matchesAction
    })
  }, [auditLogs, searchQuery, orgFilter, actionFilter])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Premium Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-100">
                <HiShieldCheck className="h-6 w-6" />
             </div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Forensic Audit Logs</h1>
             <div className="group relative">
                <HiQuestionMarkCircle className="h-5 w-5 text-slate-300 cursor-help hover:text-slate-900 transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-4 bg-slate-900 text-white text-[11px] leading-relaxed rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-2xl border border-white/10 text-center">
                   <p className="font-bold text-indigo-400 mb-1 uppercase tracking-widest">Immutable Chain of Custody</p>
                   An irreversible trail of all internal administrative events, data modifications, and security authentications across the platform kernel.
                   <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
             </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Global administrative event orchestration and forensic security trail.</p>
        </div>
        <div className="flex gap-3">
          <Button label="Export Forensic CSV" variant="ghost" icon={HiArrowDownTray} className="font-bold text-slate-500" />
          <Button label="Sync Trail" variant="ghost" icon={HiArrowPath} className="font-bold text-slate-500" />
        </div>
      </div>

      {/* Advanced Forensic Filter Matrix */}
      <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Global Event Search</label>
            <div className="relative group">
              <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-slate-900 transition-colors" />
              <input
                className="w-full pl-12 pr-5 py-3.5 bg-slate-50/50 border border-transparent rounded-[1.5rem] text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-500/5 outline-none transition-all shadow-sm"
                placeholder="Filter by action, administrator, or target node..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full lg:w-56 space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Ecosystem Node</label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-slate-500 transition-all appearance-none cursor-pointer shadow-sm"
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
            >
              <option value="all">Global Network</option>
              <option value="AlphaCorp">AlphaCorp HR</option>
              <option value="HR Nexus">HR Nexus</option>
            </select>
          </div>
          <div className="w-full lg:w-56 space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Event Domain</label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-slate-500 transition-all appearance-none cursor-pointer shadow-sm"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="all">Any Category</option>
              <option value="Login">Authentication</option>
              <option value="Organization">Infrastructure</option>
              <option value="Domain">DNS/Network</option>
              <option value="Billing">Financial</option>
            </select>
          </div>
          <Button label="Clear Filters" variant="ghost" className="h-[52px] px-6 text-slate-400 font-bold" onClick={() => { setSearchQuery(''); setOrgFilter('all'); setActionFilter('all'); }} />
        </div>
      </div>

      {/* Forensic Audit Table */}
      <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
        <Table
          columns={[
            { key: 'timestamp', label: 'Precise Event Timestamp' },
            { key: 'admin', label: 'Primary Actor' },
            { key: 'action', label: 'Event Protocol' },
            { key: 'target', label: 'Target Node' },
            { key: 'ip', label: 'Network Origin' },
            { key: 'result', label: 'Outcome' },
          ]}
          data={filteredLogs.map((log) => ({
            timestamp: (
              <div className="flex items-center gap-3 py-1">
                <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                   <HiCalendarDays className="h-4 w-4" />
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-500">{log.timestamp}</span>
              </div>
            ),
            admin: (
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                     <HiFingerPrint className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-black text-slate-900 tracking-tight">{log.admin}</span>
               </div>
            ),
            action: <Badge label={log.action} color={log.action.includes('Organization') ? 'blue' : log.action.includes('Domain') ? 'indigo' : 'gray'} variant="glass" />,
            target: (
               <div className="flex items-center gap-2">
                  <HiGlobeAlt className="h-3.5 w-3.5 text-slate-300" />
                  <span className="text-sm text-slate-700 font-bold tracking-tight">{log.target}</span>
               </div>
            ),
            ip: (
               <div className="flex items-center gap-2">
                  <HiCommandLine className="h-3.5 w-3.5 text-slate-300" />
                  <span className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.ip}</span>
               </div>
            ),
            result: (
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <div className={`h-1.5 w-1.5 rounded-full ${log.result === 'Success' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${log.result === 'Success' ? 'text-emerald-600' : 'text-rose-600'}`}>{log.result}</span>
              </div>
            ),
          }))}
        />
        {filteredLogs.length === 0 && (
          <div className="py-24 text-center bg-slate-50/50">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
               <HiShieldCheck className="h-8 w-8 text-slate-200" />
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Forensic buffer empty</p>
          </div>
        )}
      </div>

      {/* Security Advisory */}
      <div className="rounded-[2rem] border border-slate-900 bg-slate-900 p-8 flex gap-6 items-start shadow-xl shadow-slate-200">
        <div className="h-12 w-12 rounded-[1.25rem] bg-white/10 flex items-center justify-center text-white border border-white/5 shadow-inner">
           <HiExclamationCircle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-black text-white uppercase tracking-[0.2em] mb-2">Immutable Policy Enforcement</p>
          <p className="text-sm font-medium text-white/60 leading-relaxed max-w-4xl">
            Audit logs are cryptographically sealed and cannot be modified or deleted by any administrative user, including SuperAdmins. 
            This ensures a complete, forensic-grade chain of custody for all platform kernel activities.
          </p>
        </div>
      </div>
    </div>
  )
}
