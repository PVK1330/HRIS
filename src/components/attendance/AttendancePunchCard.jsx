import { useCallback, useEffect, useState } from 'react'
import { HiArrowPath, HiClock, HiPlay, HiStop } from 'react-icons/hi2'
import { Button } from '../ui/Button.jsx'
import { Badge } from '../ui/Badge.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { canPunchAttendance } from '../../utils/rbac.js'
import { checkIn, checkOut, getMyToday } from '../../services/attendanceService.js'

function statusTone(status) {
  if (status === 'Checked In') return 'bg-emerald-50 text-emerald-700'
  if (status === 'Checked Out') return 'bg-slate-50 text-slate-700'
  return 'bg-amber-50 text-amber-700'
}

export default function AttendancePunchCard() {
  const { user, allowedModules } = useAuth()
  const mayPunch = canPunchAttendance(allowedModules) && Boolean(user?.employeeId || user?.id)

  const [today, setToday] = useState(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [error, setError] = useState('')
  const [locationEnabled, setLocationEnabled] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMyToday()
      setToday(data)
      setLocationEnabled(data?.locationTrackingEnabled === true)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load attendance')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!mayPunch) {
      setLoading(false)
      return undefined
    }
    refresh()
    const id = setInterval(refresh, 60000)
    return () => clearInterval(id)
  }, [refresh, mayPunch])

  const captureLocation = () => new Promise((resolve) => {
    if (!locationEnabled || !navigator.geolocation) {
      resolve({})
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }),
      () => resolve({}),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  })

  const punchPayload = async (extra = {}) => {
    const loc = await captureLocation()
    return { workMode: 'In Office', ...loc, ...extra }
  }

  const handleCheckIn = async () => {
    setActing(true)
    setError('')
    try {
      await checkIn(await punchPayload())
      await refresh()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Check-in failed')
    } finally {
      setActing(false)
    }
  }

  const handleCheckOut = async () => {
    setActing(true)
    setError('')
    try {
      await checkOut(await punchPayload())
      await refresh()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Check-out failed')
    } finally {
      setActing(false)
    }
  }

  const punchStatus = today?.punchStatus || 'Not Checked In'
  const canCheckIn = mayPunch && punchStatus === 'Not Checked In'
  const canCheckOut = mayPunch && punchStatus === 'Checked In'

  if (!mayPunch) {
    return null
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">Today&apos;s attendance</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{today?.date || '—'}</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Refresh"
        >
          <HiArrowPath className={loading ? 'h-5 w-5 animate-spin' : 'h-5 w-5'} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusTone(punchStatus)}`}>
          {today?.status || punchStatus}
        </span>
        {today?.isLate && <Badge tone="warning">Late</Badge>}
        {Number(today?.overtimeHours) > 0 && <Badge tone="info">OT {today.overtimeHours}h</Badge>}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <HiClock className="h-4 w-4 text-slate-400" />
          <span>In: {today?.record?.check_in_time || '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <HiClock className="h-4 w-4 text-slate-400" />
          <span>Out: {today?.record?.check_out_time || '—'}</span>
        </div>
        <div>
          Hours: <strong>{today?.workedHours ?? 0}</strong>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={!canCheckIn || acting || loading}
          onClick={handleCheckIn}
          className="inline-flex items-center gap-2"
        >
          <HiPlay className="h-4 w-4" />
          Check In
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={!canCheckOut || acting || loading}
          onClick={handleCheckOut}
          className="inline-flex items-center gap-2"
        >
          <HiStop className="h-4 w-4" />
          Check Out
        </Button>
      </div>
    </div>
  )
}
