import { useCallback, useEffect, useState } from 'react'
import { HiUsers, HiClock, HiHome, HiExclamationTriangle } from 'react-icons/hi2'
import { getAttendanceDashboard } from '../../../../services/attendanceService.js'
import AttendancePunchCard from '../../../../components/attendance/AttendancePunchCard.jsx'

function Widget({ label, value, icon: Icon, tone = 'slate' }) {
  const tones = {
    emerald: 'text-emerald-600 bg-emerald-50',
    red: 'text-red-600 bg-red-50',
    amber: 'text-amber-600 bg-amber-50',
    blue: 'text-blue-600 bg-blue-50',
    slate: 'text-slate-600 bg-slate-50',
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`rounded-lg p-2 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value ?? 0}</p>
    </div>
  )
}

export default function AttendanceDashboard() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [widgets, setWidgets] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAttendanceDashboard({ date })
      setWidgets(data.widgets || data)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    load()
    const id = setInterval(load, 90000)
    return () => clearInterval(id)
  }, [load])

  const w = widgets || {}

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-600">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="ml-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <AttendancePunchCard />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Widget label="Present today" value={w.present_today} icon={HiUsers} tone="emerald" />
          <Widget label="Absent today" value={w.absent_today} icon={HiUsers} tone="red" />
          <Widget label="Late today" value={w.late_today} icon={HiClock} tone="amber" />
          <Widget label="On leave" value={w.on_leave} icon={HiUsers} tone="blue" />
          <Widget label="Work from home" value={w.work_from_home} icon={HiHome} tone="blue" />
          <Widget label="Overtime today" value={w.overtime_employees} icon={HiClock} tone="amber" />
          <Widget label="Pending regularizations" value={w.pending_regularizations} icon={HiExclamationTriangle} tone="amber" />
        </div>
      )}
    </div>
  )
}
