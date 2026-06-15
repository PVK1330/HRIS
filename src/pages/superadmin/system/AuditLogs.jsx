import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { superadminService } from '../../../services/superadminService.js'
import { ExportDropdown } from '../../../components/ui/ExportDropdown.jsx'
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Title Bar with Moved Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Audit Logs</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Platform</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Audit Logs</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ExportDropdown
            onExcel={() => superadminService.exportAuditLogs('excel')}
            onPDF={() => superadminService.exportAuditLogs('pdf')}
            excelFilename="audit_logs.xlsx"
            pdfFilename="audit_logs.pdf"
          />
          <button type="button" onClick={fetchAuditLogs} className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm">
            <HiArrowPath className="h-4 w-4" /> Sync
          </button>
        </div>
      </div>

      {/* Main Table Registry Area */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm mb-6">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Audit Trail</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="relative min-w-[250px] flex-1 max-w-md">
            <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Action, admin, target..." className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] cursor-pointer"
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
            >
              <option value="all">All Targets</option>
              {orgOptions.map((org) => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>
            <select
              className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] cursor-pointer"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="all">Any Category</option>
              <option value="Login">Authentication</option>
              <option value="Organisation">Infrastructure</option>
              <option value="Domain">DNS/Network</option>
              <option value="Billing">Financial</option>
            </select>
            <p className="text-xs font-medium text-slate-500 whitespace-nowrap">{filteredLogs.length} records</p>
            {searchQuery || orgFilter !== 'all' || actionFilter !== 'all' ? (
              <button type="button" onClick={() => { setSearchQuery(''); setOrgFilter('all'); setActionFilter('all'); }} className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50 whitespace-nowrap">Clear Filters</button>
            ) : null}
          </div>
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
            action: <Badge label={log.action} color={log.action.includes('Organisation') ? 'blue' : log.action.includes('Domain') ? 'indigo' : 'gray'} variant="glass" />,
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
    </div>
  )
}
