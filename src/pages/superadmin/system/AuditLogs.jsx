import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { superadminService } from '../../../services/superadminService.js'
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
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const orgOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        auditLogs
          .map((log) => String(log.target || '').trim())
          .filter(Boolean)
      )
    )
    return values
  }, [auditLogs])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const response = await superadminService.getAuditLogs()
      setAuditLogs(response?.data?.data?.logs || [])
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
      setAuditLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const action = String(log.action || '')
      const admin = String(log.admin || '')
      const target = String(log.target || '')
      const matchesSearch = action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        target.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesOrg = orgFilter === 'all' || String(log.target || '').includes(orgFilter)
      const matchesAction = actionFilter === 'all' || action.includes(actionFilter)
      return matchesSearch && matchesOrg && matchesAction
    })
  }, [auditLogs, searchQuery, orgFilter, actionFilter])

  const handleExport = () => {
    const headers = ['Timestamp', 'Admin', 'Action', 'Target', 'IP', 'Result']
    const rows = filteredLogs.map((log) => [
      new Date(log.timestamp).toLocaleString(),
      log.admin || '',
      log.action || '',
      log.target || '',
      log.ip || '',
      log.result || '',
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="sa-page">
      {/* Header */}
      <div className="sa-hero px-6 py-5">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white shadow-inner">
                <HiShieldCheck className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-black text-white tracking-widest uppercase">Forensic Audit Logs</h1>
            </div>
            <p className="text-xs text-emerald-100/90 font-medium">
              Immutable trail of administrative actions, infrastructure updates, and security events.
            </p>
          </div>
          <div className="flex gap-2">
            <Button label="Export CSV" variant="ghost" icon={HiArrowDownTray} className="bg-white text-[#0F766E] hover:bg-emerald-50 border-none font-bold" onClick={handleExport} />
            <Button label="Sync" variant="ghost" icon={HiArrowPath} className="bg-white/15 text-white hover:bg-white/20 border border-white/20 font-bold" onClick={fetchAuditLogs} />
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
      </div>

      {/* Filters */}
      <div className="sa-card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex-1 space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Search</label>
            <div className="relative group">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 group-focus-within:text-slate-900 transition-colors" />
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F766E] outline-none transition-all"
                placeholder="Action, admin, target..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Target Node</label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#0F766E] transition-all appearance-none cursor-pointer"
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
            >
              <option value="all">All Targets</option>
              {orgOptions.map((org) => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Action Type</label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#0F766E] transition-all appearance-none cursor-pointer"
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
          <div className="flex items-end">
            <Button label="Clear Filters" variant="ghost" className="h-[42px] px-6 text-slate-400 font-bold w-full" onClick={() => { setSearchQuery(''); setOrgFilter('all'); setActionFilter('all'); }} />
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="sa-card overflow-hidden">
        <div className="sa-card-head">
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Audit Trail</h2>
          <p className="text-xs font-bold text-slate-500">{filteredLogs.length} records</p>
        </div>
        <Table
          loading={loading}
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
                <span className="font-mono text-[11px] font-bold text-slate-500">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
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
      </div>

      {/* Security Advisory */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900 p-6 flex gap-4 items-start shadow-xl shadow-slate-200">
        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/5 shadow-inner">
           <HiExclamationCircle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-black text-white uppercase tracking-[0.2em] mb-2">Immutable Policy Enforcement</p>
          <p className="text-xs font-medium text-white/70 leading-relaxed max-w-4xl">
            Audit logs are cryptographically sealed and cannot be modified or deleted by any administrative user, including SuperAdmins. 
            This ensures a complete, forensic-grade chain of custody for all platform kernel activities.
          </p>
        </div>
      </div>
    </div>
  )
}
