import { useEffect, useState } from 'react'
import { HiCircleStack, HiCommandLine, HiArrowPath, HiShieldCheck, HiServer } from 'react-icons/hi2'
import toast from 'react-hot-toast'

import settingsService from '../../../services/settingsService.js'

function formatBytes(bytes) {
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) return '—'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

function formatUptime(seconds) {
  if (typeof seconds !== 'number') return '—'
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${h}h ${m}m ${s}s`
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    </div>
  )
}

export default function SystemInfo() {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await settingsService.getSystem()
        if (!cancelled) setInfo(res?.data || null)
      } catch (err) {
        if (!cancelled) toast.error(err?.message || 'Failed to load system info')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0">
      {/* Page Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Diagnostics</h1>
          <p className="mt-0.5 text-slate-500 text-[11px] font-medium">Real-time telemetry and environment state.</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-md">
          <HiCircleStack className="h-5 w-5" />
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : !info ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
           <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <HiCircleStack className="h-6 w-6" />
           </div>
           <div>
              <h3 className="text-sm font-black text-slate-900">Diagnostics Unavailable</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Relay could not retrieve system telemetry.</p>
           </div>
           <button 
             onClick={() => window.location.reload()}
             className="rounded-xl bg-slate-900 px-6 py-2 text-[10px] font-black text-white shadow-lg transition-all hover:bg-black active:scale-95"
           >
             Retry Connection
           </button>
        </div>
      ) : (
        <div className="space-y-6 pb-24">
          {/* Main Status Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
             <StatCard 
               label="App Runtime" 
               value={info?.appVersion || '—'} 
               subValue={`Node ${info?.nodeVersion || '—'}`} 
               icon={HiCommandLine} 
               color="blue"
             />
             <StatCard 
               label="Server Uptime" 
               value={formatUptime(info?.uptime)} 
               subValue={info?.platform || '—'} 
               icon={HiArrowPath} 
               color="emerald"
             />
             <StatCard 
               label="Environment" 
               value={String(info?.environment || '—').toUpperCase()} 
               subValue="Runtime Mode" 
               icon={HiShieldCheck} 
               color={info?.environment === 'production' ? 'green' : 'amber'}
             />
          </div>

          {/* Detailed Info Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
             {/* Memory Usage */}
             <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg">
                    <HiCircleStack className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-wider">Memory Governance</h3>
                  </div>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Heap Usage</span>
                      <span className="text-xs font-black text-slate-900">{formatBytes(info?.memoryUsage?.heapUsed)} / {formatBytes(info?.memoryUsage?.heapTotal)}</span>
                   </div>
                   <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                      <div 
                        className="h-full rounded-full bg-indigo-500 transition-all duration-1000" 
                        style={{ width: `${Math.min(100, ((info?.memoryUsage?.heapUsed || 0) / (info?.memoryUsage?.heapTotal || 1)) * 100)}%` }}
                      />
                   </div>
                   <p className="text-[9px] font-medium text-slate-400 italic leading-relaxed">Dynamic memory allocation and heap telemetry.</p>
                </div>
             </div>

             {/* Database & Persistence */}
             <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg">
                    <HiServer className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-wider">Data Persistence</h3>
                  </div>
                </div>
                <div className="space-y-3">
                   <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary DB</span>
                      <span className="text-xs font-black text-slate-900 font-mono">{info?.mainDatabase || '—'}</span>
                   </div>
                   <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Status</span>
                      <div className="flex items-center gap-1.5">
                         <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-xs font-black text-emerald-700">ONLINE</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Operational Footer */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center border-dashed">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Last Sweep: <span className="text-slate-900">{new Date().toLocaleString()}</span>
             </p>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, subValue, icon: Icon, color }) {
  const colorMap = {
    blue: 'bg-blue-600 shadow-blue-100',
    emerald: 'bg-emerald-600 shadow-emerald-100',
    amber: 'bg-amber-500 shadow-amber-100',
    green: 'bg-green-600 shadow-green-100',
  }

  return (
    <div className="group relative rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg ${colorMap[color] || 'bg-slate-900 shadow-slate-100'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1">
           <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Live</span>
        </div>
      </div>
      <div className="space-y-0.5">
        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</h4>
        <div className="text-lg font-black text-slate-900 tracking-tight">{value}</div>
        <p className="text-[10px] font-bold text-slate-500">{subValue}</p>
      </div>
    </div>
  )
}
