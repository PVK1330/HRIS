import { useState } from 'react'
import {
  HiArrowLeft, HiCheckCircle, HiXCircle, HiExclamationTriangle,
  HiCurrencyRupee, HiLockClosed, HiEnvelope,
  HiUsers, HiSignal, HiBuildingOffice2,
} from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'

const WORKER = { name: 'Rahul Sharma', id: 'WRK-DW001', role: 'Floor Supervisor', area: 'Pune Plant' }

const WEEK = [
  { day: 'Mon', date: 16, state: 'present', hours: '8h 05m' },
  { day: 'Tue', date: 17, state: 'present', hours: '7h 48m' },
  { day: 'Wed', date: 18, state: 'absent',  hours: 'Absent' },
  { day: 'Thu', date: 19, state: 'pending', hours: 'In progress' },
  { day: 'Fri', date: 20, state: 'na',      hours: '—' },
  { day: 'Sat', date: 21, state: 'na',      hours: '—' },
  { day: 'Sun', date: 22, state: 'na',      hours: '—' },
]

const DAY_DOT_STYLES = {
  present: { dot: 'bg-emerald-100',  symbol: '✓', text: 'text-emerald-700 font-bold' },
  absent:  { dot: 'bg-red-100',      symbol: '✗', text: 'text-red-600 font-bold' },
  pending: { dot: 'bg-amber-100',    symbol: '→', text: 'text-amber-700 font-bold' },
  na:      { dot: 'bg-slate-100',    symbol: '—', text: 'text-slate-400' },
}

const AREAS = ['Pune Plant (65m — within 200m)', 'Chinchwad Site (12.4km — out of range)', 'Warehouse Area (3.1km — out of range)']

const GPS_STATES = {
  searching: {
    label: 'Detecting location…',
    sub: 'Please wait — acquiring GPS signal',
    bg: 'bg-amber-50 border-amber-200',
    iconBg: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: HiExclamationTriangle,
    iconColor: 'text-amber-600',
    badge: null,
  },
  ok: {
    label: 'Location detected',
    sub: '18.5204°N, 73.8567°E · Accuracy ±8m',
    bg: 'bg-emerald-50 border-emerald-200',
    iconBg: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    icon: HiCheckCircle,
    iconColor: 'text-emerald-600',
    badge: { label: 'Within zone', style: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  },
  error: {
    label: 'Outside geofence',
    sub: '18.4110°N, 73.9234°E · 1.4km from zone',
    bg: 'bg-red-50 border-red-200',
    iconBg: 'bg-red-100',
    textColor: 'text-red-800',
    icon: HiXCircle,
    iconColor: 'text-red-600',
    badge: { label: 'Out of range', style: 'bg-red-100 text-red-700 border-red-200' },
  },
  locked: {
    label: 'GPS ready',
    sub: 'Press "Detect Location" to verify your position',
    bg: 'bg-slate-50 border-slate-200',
    iconBg: 'bg-slate-100',
    textColor: 'text-slate-700',
    icon: HiSignal,
    iconColor: 'text-slate-500',
    badge: null,
  },
}

export default function WorkerPortalPreview() {
  const navigate = useNavigate()
  const [checkInTime, setCheckInTime] = useState(null)
  const [checkedOut, setCheckedOut] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('locked')
  const [selectedArea, setSelectedArea] = useState(AREAS[0])
  const [workDesc, setWorkDesc] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')

  const gps = GPS_STATES[gpsStatus]
  const GpsIcon = gps.icon

  function handleDetect() {
    setGpsStatus('searching')
    setTimeout(() => setGpsStatus('ok'), 1400)
  }
  function handleCheckIn() {
    if (gpsStatus !== 'ok') { handleDetect(); return }
    const now = new Date()
    setCheckInTime(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`)
  }
  function handleCheckOut() { setCheckedOut(true) }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
          <HiArrowLeft className="h-4 w-4" />Back to Workers
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Worker Portal Preview</h1>
          <p className="text-xs text-slate-500 mt-0.5">This is the login and attendance screen seen by daily wages workers on their device.</p>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Left — Login Card */}
        <div className="overflow-hidden rounded-none border border-slate-200 shadow-sm">
          {/* Navy header */}
          <div className="bg-[#0F172A] px-8 py-7 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-none bg-[#0F766E] text-white font-bold text-sm">WS</div>
              <span className="text-white font-bold text-base">WorkSite</span>
            </div>
            <p className="text-slate-400 text-xs">Worker Portal — Daily Paid Staff</p>
          </div>

          <div className="bg-white p-7">
            <div className="mb-5 text-center">
              <p className="text-base font-bold text-slate-900">Sign in to your account</p>
              <p className="text-xs text-slate-400 mt-1">Use the credentials sent to your email address</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Email address or username</label>
                <div className="relative">
                  <HiEnvelope className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="rahul.s@example.com"
                    className="h-10 w-full rounded-none border border-slate-200 bg-slate-50 px-3 pl-9 text-sm placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Password</label>
                  <span className="text-[11px] text-[#0F766E] font-medium cursor-pointer hover:underline">Forgotten password?</span>
                </div>
                <div className="relative">
                  <HiLockClosed className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Enter your password"
                    className="h-10 w-full rounded-none border border-slate-200 bg-slate-50 px-3 pl-9 text-sm placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]" />
                </div>
              </div>
              <button type="button" className="h-11 w-full rounded-none bg-[#0F766E] text-sm font-bold text-white hover:bg-[#0c6b64] transition">
                Sign in
              </button>
            </div>
            <p className="mt-5 text-center text-xs text-slate-400">Having trouble signing in? Contact your site manager.</p>
          </div>
        </div>

        {/* Right — Mark Attendance Card */}
        <div className="overflow-hidden rounded-none border border-slate-200 shadow-sm">
          {/* Card header */}
          <div className="flex items-center justify-between bg-[#0F172A] px-5 py-4">
            <div>
              <p className="text-sm font-bold text-white">Mark Attendance</p>
              <p className="text-[11px] text-slate-400">{WORKER.name} · Thursday 19 Jun 2024</p>
            </div>
            <span className="rounded-none border border-teal-600 bg-teal-800 px-2 py-0.5 font-mono text-[11px] font-bold text-teal-100">{WORKER.id}</span>
          </div>

          <div className="bg-white p-5 space-y-4">

            {/* GPS Status row */}
            <div className={`flex items-center gap-3 rounded-none border px-4 py-3 ${gps.bg}`}>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${gps.iconBg}`}>
                <GpsIcon className={`h-5 w-5 ${gps.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold ${gps.textColor}`}>{gps.label}</p>
                <p className={`text-[11px] font-mono ${gps.textColor} opacity-75`}>{gps.sub}</p>
              </div>
              {gps.badge
                ? <span className={`shrink-0 rounded-none border px-2 py-0.5 text-[10px] font-bold ${gps.badge.style}`}>{gps.badge.label}</span>
                : <button type="button" onClick={handleDetect} className={`shrink-0 rounded-none border px-2.5 py-1 text-[11px] font-bold ${gps.textColor} border-current hover:opacity-70`}>
                    {gpsStatus === 'searching' ? 'Locating…' : 'Detect Location'}
                  </button>
              }
            </div>

            {/* Site select */}
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Select site for today <span className="text-red-500">*</span></label>
              <div className="relative">
                <HiBuildingOffice2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select value={selectedArea} onChange={e => setSelectedArea(e.target.value)}
                  className="h-10 w-full rounded-none border border-slate-200 bg-slate-50 px-3 pl-9 text-sm outline-none transition focus:border-[#0F766E] cursor-pointer">
                  {AREAS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>

            {/* Work description */}
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Work description (optional)</label>
              <input type="text" value={workDesc} onChange={e => setWorkDesc(e.target.value)} placeholder="e.g. Production floor, machine loading"
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50 px-3 text-sm placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white" />
            </div>

            {/* Check-in / Check-out buttons */}
            <button type="button" onClick={handleCheckIn} disabled={!!checkInTime}
              className={`h-11 w-full rounded-none text-sm font-bold transition flex items-center justify-center gap-2 ${checkInTime ? 'bg-emerald-100 text-emerald-700 cursor-default border border-emerald-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
              {checkInTime ? `✓ Checked in at ${checkInTime}` : `Check in — ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}`}
            </button>
            <button type="button" onClick={handleCheckOut} disabled={!checkInTime || checkedOut}
              className={`h-10 w-full rounded-none text-sm font-bold transition ${checkedOut ? 'bg-red-100 text-red-600 cursor-default border border-red-200' : !checkInTime ? 'border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed' : 'border border-red-500 bg-white text-red-600 hover:bg-red-50'}`}>
              {checkedOut ? 'Checked Out' : 'Check Out'}
            </button>

            {/* Divider */}
            <div className="border-t border-slate-200" />

            {/* Week strip */}
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">This week</p>
              <div className="grid grid-cols-7 gap-1.5">
                {WEEK.map(d => {
                  const cfg = DAY_DOT_STYLES[d.state]
                  return (
                    <div key={d.day} className="flex flex-col items-center gap-1">
                      <p className="text-[10px] font-bold uppercase text-slate-400">{d.day}</p>
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${cfg.dot} ${cfg.text}`}>
                        {cfg.symbol}
                      </div>
                      <p className="text-[10px] text-slate-400 text-center leading-tight">{d.hours}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-none border border-slate-200 bg-slate-50">
              {[
                { label: 'Days present', val: '2', color: 'text-[#0F172A]' },
                { label: 'Gross earned (Jun)', val: '₹1,300', color: 'text-emerald-700' },
                { label: 'Daily rate', val: '₹650', color: 'text-[#0F766E]' },
              ].map(s => (
                <div key={s.label} className="px-3 py-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">{s.label}</p>
                  <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom — Credential Email Preview */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Credential Email Preview</h2>
            <p className="text-[11px] text-teal-200 mt-0.5">Sent automatically on worker registration — from noreply@yourcompany.worksite.in</p>
          </div>
          <button type="button" className="rounded-none border border-teal-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700">
            Send Test Email
          </button>
        </div>
        <div className="p-6">
          <div className="rounded-none border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1">
            <p><span className="font-bold text-slate-700">From:</span> WorkSite HRMS &lt;noreply@yourcompany.worksite.in&gt;</p>
            <p><span className="font-bold text-slate-700">To:</span> rahul.s@mail.com</p>
            <p><span className="font-bold text-slate-700">Subject:</span> Your WorkSite Worker Portal login details</p>
          </div>
          <div className="mt-4 rounded-none border border-slate-200 bg-white p-6 space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>Dear <strong>Rahul</strong>,</p>
            <p>Welcome to WorkSite HRMS. Your account has been set up by your employer. Please use the details below to sign in to the Worker Portal to record your attendance.</p>
            <div className="rounded-none border border-slate-200 bg-slate-50 p-5 font-mono text-sm space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 min-w-[110px] mt-0.5">Portal URL</span>
                <span className="font-bold text-[#0F766E]">yourcompany.worksite.in/worker</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 min-w-[110px] mt-0.5">Username</span>
                <span className="font-bold text-slate-800">rahul.s@mail.com</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 min-w-[110px] mt-0.5">Temp. Password</span>
                <span className="font-bold text-slate-800">Ws#2024!xQ</span>
              </div>
            </div>
            <p>You will be asked to set a new password when you first sign in. If you have any difficulties, please speak to your site manager or contact HR.</p>
            <p className="text-xs text-slate-400 border-t border-slate-100 pt-3">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
