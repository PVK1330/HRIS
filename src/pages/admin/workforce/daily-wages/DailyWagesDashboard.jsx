import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiPlus, HiDocumentArrowDown, HiUsers, HiCheckCircle,
  HiCurrencyRupee, HiMapPin, HiExclamationCircle,
  HiArrowRight, HiClock, HiUserGroup,
} from 'react-icons/hi2'

const TODAY_ATTENDANCE = [
  { name: 'Rahul Sharma', id: 'WRK-DW001', site: 'Pune Plant', checkIn: '06:05', status: 'Present' },
  { name: 'Sunita Pawar', id: 'WRK-DW002', site: 'Warehouse Area', checkIn: '09:00', status: 'In Progress' },
  { name: 'Manoj Thakur', id: 'WRK-DW003', site: 'North Gate Zone', checkIn: '22:00', status: 'Present' },
  { name: 'Anita Desai', id: 'WRK-DW004', site: 'Admin Block', checkIn: null, status: 'Absent' },
  { name: 'Vijay Kumar Kadam', id: 'WRK-DW005', site: 'South Yard', checkIn: '14:00', status: 'Half Day' },
]

const ACTIVE_SITES = [
  { name: 'Pune Plant', coords: '18.5204°N, 73.8567°E', radius: '200m', workers: 4, active: true },
  { name: 'Warehouse Area', coords: '18.5310°N, 73.8455°E', radius: '150m', workers: 3, active: true },
  { name: 'North Gate Zone', coords: '18.5415°N, 73.8780°E', radius: '50m',  workers: 1, active: true },
  { name: 'Admin Block', coords: '18.5101°N, 73.8567°E', radius: '75m',  workers: 2, active: true },
]

const STATUS_STYLES = {
  'Present':     'bg-emerald-50 border-emerald-200 text-emerald-700',
  'In Progress': 'bg-blue-50 border-blue-200 text-blue-700',
  'Absent':      'bg-red-50 border-red-200 text-red-700',
  'Half Day':    'bg-amber-50 border-amber-200 text-amber-700',
}

const AVATAR_COLORS = ['bg-teal-600', 'bg-blue-600', 'bg-purple-600', 'bg-amber-600', 'bg-rose-600']

function initials(name) {
  const p = name.split(' ').filter(Boolean)
  return p.length >= 2 ? p[0][0] + p[1][0] : p[0]?.[0] ?? '?'
}

export default function DailyWagesDashboard() {
  const navigate = useNavigate()

  const stats = [
    {
      label: 'Active Workers', value: '8', sub: 'Across 4 sites',
      bg: 'bg-[#0F766E]', icon: HiUsers,
    },
    {
      label: 'Present Today', value: '6', sub: '2 absent · 75% attendance',
      bg: 'bg-[#10B981]', icon: HiCheckCircle,
    },
    {
      label: 'Wages Payable (Jun)', value: '₹91,840', sub: '163 days × avg. ₹563',
      bg: 'bg-[#F59E0B]', icon: HiCurrencyRupee,
    },
    {
      label: 'Geofenced Sites', value: '4', sub: 'All locations active',
      bg: 'bg-[#0F172A]', icon: HiMapPin,
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Daily Wages Overview</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span>Workforce Management</span><span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Daily Wages · Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex items-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
            <HiDocumentArrowDown className="h-4 w-4" />Export Report
          </button>
          <button type="button" onClick={() => navigate('/admin/daily-wages/workers')}
            className="inline-flex items-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0c6b64] shadow-sm">
            <HiPlus className="h-4 w-4" />Add Worker
          </button>
        </div>
      </div>

      {/* Isolation banner */}
      <div className="flex items-center gap-3 rounded-none border border-amber-200 bg-amber-50 px-4 py-3">
        <HiExclamationCircle className="h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-xs font-medium text-amber-800">
          Daily wages attendance and payroll data is held in a <strong>separate record</strong> — it does not merge with the standard employee attendance or payroll system.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-4 rounded-none border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-none ${s.bg} text-white shadow-sm`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
              <p className="mt-0.5 text-2xl font-black text-slate-900 leading-none">{s.value}</p>
              <p className="mt-1 text-[11px] text-slate-400">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2-column cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Today's Attendance */}
        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Today's Attendance</h2>
              <p className="text-[11px] text-teal-200">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-none border border-teal-500 bg-teal-700 px-2 py-0.5 text-[10px] font-bold text-teal-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
            </span>
          </div>
          <ul className="divide-y divide-slate-100">
            {TODAY_ATTENDANCE.map((w, i) => (
              <li key={w.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase text-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {initials(w.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{w.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {w.site}{w.checkIn ? ` · Check-in ${w.checkIn}` : ''}
                    </p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-none border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[w.status]}`}>
                  {w.status}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 px-5 py-3">
            <button type="button" onClick={() => navigate('/admin/daily-wages/attendance')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:underline">
              View full attendance<HiArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Active Geofenced Sites */}
        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Active Geofenced Sites</h2>
              <p className="text-[11px] text-teal-200">Geolocation perimeters</p>
            </div>
            <button type="button" onClick={() => navigate('/admin/daily-wages/areas')}
              className="rounded-none border border-teal-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700">
              Manage
            </button>
          </div>
          <ul className="divide-y divide-slate-100">
            {ACTIVE_SITES.map((s, i) => (
              <li key={s.name} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                  <p className="text-[11px] font-mono text-slate-400">{s.coords} · Radius: {s.radius}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-bold text-emerald-600">{s.workers} worker{s.workers !== 1 ? 's' : ''}</p>
                  <span className="inline-flex items-center gap-1 rounded-none bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Active</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>


    </div>
  )
}
