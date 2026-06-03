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
  const employeeId = user?.employeeId || user?.id
  const canPunch = canPunchAttendance(allowedModules, user)

  const [today, setToday] = useState(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [error, setError] = useState('')
  const [locationEnabled, setLocationEnabled] = useState(false)

  const refresh = useCallback(async () => {
    if (!canPunch) {
      setLoading(false)
      return
    }
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
  }, [canPunch])

  useEffect(() => {
    refresh()
    if (!canPunch) return undefined
    const id = setInterval(refresh, 60000)
    return () => clearInterval(id)
  }, [refresh, canPunch])

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

  if (!employeeId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 text-sm text-amber-900">
        Your account is not linked to an employee profile. Contact HR to enable attendance punch.
      </div>
    )
  }

  if (!canPunch) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">Today&apos;s attendance</p>
        <p className="mt-2 text-sm text-slate-600">
          You do not have the <strong>attendance.create</strong> permission. Ask your administrator
          to assign it to your role, then log out and log in again.
        </p>
      </div>
    )
  }

  const punchStatus = today?.punchStatus || 'Not Checked In'
  const canCheckIn = punchStatus === 'Not Checked In'
  const canCheckOut = punchStatus === 'Checked In'
  const checkedOut = punchStatus === 'Checked Out'

  return (
    <div className="rounded-xl border border-teal-200 bg-white p-6 shadow-sm ring-1 ring-teal-600/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-teal-800">Today&apos;s attendance</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{today?.date || '—'}</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading || acting}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
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

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          type="button"
          variant="primary"
          size="md"
          label="Check In"
          icon={HiPlay}
          disabled={!canCheckIn || acting || loading}
          loading={acting && canCheckIn}
          onClick={handleCheckIn}
          className="min-w-[140px] !bg-teal-700 hover:!bg-teal-800"
        />
        <Button
          type="button"
          variant="secondary"
          size="md"
          label="Check Out"
          icon={HiStop}
          disabled={!canCheckOut || acting || loading}
          loading={acting && canCheckOut}
          onClick={handleCheckOut}
          className="min-w-[140px]"
        />
      </div>

      {checkedOut && (
        <p className="mt-3 text-sm text-slate-500">You have completed today&apos;s attendance.</p>
      )}
      {loading && !today && (
        <p className="mt-3 text-sm text-slate-500">Loading attendance…</p>
      )}
    </div>
  )
}
