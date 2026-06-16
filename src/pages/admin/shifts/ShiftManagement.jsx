import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  RiTimeLine,
  RiAddLine,
  RiSearchLine,
  RiDeleteBinLine,
} from 'react-icons/ri'
import api from '../../../services/api'

// ─── Constants ───────────────────────────────────────────────────────────────

const BREAK_OPTIONS = [
  { label: '00:15', value: 15 },
  { label: '00:30', value: 30 },
  { label: '00:45', value: 45 },
  { label: '01:00', value: 60 },
  { label: '01:30', value: 90 },
  { label: '02:00', value: 120 },
  { label: '02:30', value: 150 },
  { label: '03:00', value: 180 },
]

const GRACE_OPTIONS = [0, 5, 10, 15, 20, 30, 45, 60]

const EMPTY_FORM = {
  name: '',
  startTime: '09:00',
  endTime: '18:00',
  breakMinutes: 60,
  graceIn: 15,
  graceOut: 15,
  status: 'active',
}

function formFromRecord(r) {
  return {
    name: r.name ?? '',
    startTime: r.start_time ?? '09:00',
    endTime: r.end_time ?? '18:00',
    breakMinutes: r.break_minutes ?? 60,
    graceIn: r.grace_in_minutes ?? r.grace_minutes ?? 15,
    graceOut: r.grace_out_minutes ?? r.grace_minutes ?? 15,
    status: r.status ?? 'active',
  }
}

function fmt12(time24) {
  if (!time24) return '—'
  const [hStr, mStr] = time24.split(':')
  let h = parseInt(hStr, 10)
  const m = mStr || '00'
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m} ${ampm}`
}

// ─── Styles (match LocationManagement) ───────────────────────────────────────

const inp =
  'h-9 w-full rounded-none border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]'

const sel =
  'h-9 w-full cursor-pointer rounded-none border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]'

function Label({ children, required }) {
  return (
    <label className="mb-1 block text-xs font-semibold text-gray-600">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-[#4F46E5]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ShiftManagement() {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null) // null | 'new' | {id,...}
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const debounceRef = useRef(null)

  const load = useCallback(async (q = '') => {
    setLoading(true)
    try {
      const res = await api.get('/shifts', { params: { search: q, limit: 200 } })
      const rows = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
      setShifts(rows)
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to load shifts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSearch = (val) => {
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => load(val), 350)
  }

  const selectShift = (shift) => {
    setSelected(shift)
    setForm(formFromRecord(shift))
    setErrors({})
  }

  const startNew = () => {
    setSelected('new')
    setForm(EMPTY_FORM)
    setErrors({})
  }

  const cancelForm = () => {
    setSelected(null)
    setErrors({})
  }

  const patchForm = (patch) => {
    setForm((f) => ({ ...f, ...patch }))
    const key = Object.keys(patch)[0]
    if (key && errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Shift name is required'
    if (!form.startTime) e.startTime = 'Start time is required'
    if (!form.endTime) e.endTime = 'End time is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const payload = {
      name: form.name.trim(),
      start_time: form.startTime,
      end_time: form.endTime,
      break_minutes: Number(form.breakMinutes),
      grace_minutes: Number(form.graceIn),
      grace_in_minutes: Number(form.graceIn),
      grace_out_minutes: Number(form.graceOut),
      status: form.status,
    }

    setSaving(true)
    try {
      let result
      if (selected === 'new') {
        const res = await api.post('/shifts', payload)
        result = Array.isArray(res.data) ? res.data[0] : (res.data?.data ?? res.data)
        toast.success('Shift created')
      } else {
        const res = await api.put(`/shifts/${selected.id}`, payload)
        result = Array.isArray(res.data) ? res.data[0] : (res.data?.data ?? res.data)
        toast.success('Shift updated')
      }
      await load(search)
      if (result?.id) {
        setSelected(result)
        setForm(formFromRecord(result))
      }
      setErrors({})
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to save shift')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selected || selected === 'new') return
    if (!window.confirm(`Delete "${selected.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await api.delete(`/shifts/${selected.id}`)
      toast.success('Shift deleted')
      setSelected(null)
      await load(search)
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete shift')
    } finally {
      setDeleting(false)
    }
  }

  const isEditing = selected !== null
  const isNew = selected === 'new'

  return (
    <div className="flex min-h-[24rem] flex-col gap-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">

        {/* ── Left: Shift List ── */}
        <div className="w-full rounded-none border border-gray-200 bg-white shadow-sm lg:w-72 lg:shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <span className="text-sm font-bold text-slate-800">Shift List</span>
            <button
              type="button"
              onClick={startNew}
              className="inline-flex items-center gap-1 rounded-none bg-[#4F46E5] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#4338CA] transition-colors"
            >
              <RiAddLine className="h-3.5 w-3.5" />
              Add Shift
            </button>
          </div>

          {/* Search */}
          <div className="border-b border-gray-100 px-3 py-2">
            <div className="relative">
              <RiSearchLine className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search shifts..."
                className="h-8 w-full rounded-none border border-gray-200 bg-gray-50 pl-8 pr-3 text-xs text-gray-700 outline-none focus:border-[#4F46E5] focus:bg-white focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-[calc(100vh-18rem)] overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            ) : shifts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <RiTimeLine className="h-8 w-8 text-gray-300" />
                <p className="text-xs text-gray-400">No shifts found</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {shifts.map((shift) => {
                  const isActive = selected && selected !== 'new' && selected.id === shift.id
                  return (
                    <li key={shift.id}>
                      <button
                        type="button"
                        onClick={() => selectShift(shift)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                          <RiTimeLine className="h-4 w-4 text-[#4F46E5]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900">{shift.name}</p>
                          {(shift.start_time || shift.end_time) && (
                            <p className="truncate text-xs text-gray-500">
                              {fmt12(shift.start_time)} – {fmt12(shift.end_time)}
                            </p>
                          )}
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            (shift.status ?? 'active') === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {(shift.status ?? 'active') === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Footer count */}
          {!loading && shifts.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2 text-[11px] text-gray-400">
              Showing 1 to {shifts.length} of {shifts.length} shift{shifts.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* ── Right: Form / Empty state ── */}
        <div className="min-w-0 flex-1 rounded-none border border-gray-200 bg-white shadow-sm">
          {!isEditing ? (
            <div className="flex flex-col items-center justify-center gap-3 py-32 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                <RiTimeLine className="h-8 w-8 text-[#4F46E5]" />
              </div>
              <p className="text-base font-semibold text-gray-700">Select a shift to view details</p>
              <p className="max-w-xs text-sm text-gray-400">
                Click a shift from the list, or use + Add Shift to create a new one.
              </p>
              <button
                type="button"
                onClick={startNew}
                className="mt-2 inline-flex items-center gap-1.5 rounded-none bg-[#4F46E5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4338CA] transition-colors"
              >
                <RiAddLine className="h-4 w-4" />
                Add Shift
              </button>
            </div>
          ) : (
            <>
              {/* Form header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-base font-bold text-slate-900">
                  {isNew ? 'Add Shift Form' : 'Shift Details'}
                </h2>
              </div>

              {/* Form body */}
              <div className="px-6 py-5 space-y-5">

                {/* Shift Name */}
                <div>
                  <Label required>Shift Name</Label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => patchForm({ name: e.target.value })}
                    placeholder="e.g. General Shift"
                    className={`${inp} ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-400' : ''}`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Start Time + End Time */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label required>Start Time</Label>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => patchForm({ startTime: e.target.value })}
                      className={`${inp} ${errors.startTime ? 'border-red-400' : ''}`}
                    />
                    {errors.startTime && <p className="mt-1 text-xs text-red-500">{errors.startTime}</p>}
                  </div>
                  <div>
                    <Label required>End Time</Label>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => patchForm({ endTime: e.target.value })}
                      className={`${inp} ${errors.endTime ? 'border-red-400' : ''}`}
                    />
                    {errors.endTime && <p className="mt-1 text-xs text-red-500">{errors.endTime}</p>}
                  </div>
                </div>

                {/* Break Duration */}
                <div>
                  <Label>Break Duration (hrs)</Label>
                  <select
                    value={form.breakMinutes}
                    onChange={(e) => patchForm({ breakMinutes: Number(e.target.value) })}
                    className={sel}
                  >
                    {BREAK_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Grace In + Grace Out */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Grace In (mins)</Label>
                    <select
                      value={form.graceIn}
                      onChange={(e) => patchForm({ graceIn: Number(e.target.value) })}
                      className={sel}
                    >
                      {GRACE_OPTIONS.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Grace Out (mins)</Label>
                    <select
                      value={form.graceOut}
                      onChange={(e) => patchForm({ graceOut: Number(e.target.value) })}
                      className={sel}
                    >
                      {GRACE_OPTIONS.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status toggle */}
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={form.status === 'active'}
                    onChange={(val) => patchForm({ status: val ? 'active' : 'inactive' })}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {form.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
                <div>
                  {!isNew && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting || saving}
                      className="inline-flex items-center gap-1.5 rounded-none border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <RiDeleteBinLine className="h-3.5 w-3.5" />
                      {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={cancelForm}
                    disabled={saving || deleting}
                    className="rounded-none border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || deleting}
                    className="rounded-none bg-[#4F46E5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4338CA] transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {saving ? 'Saving…' : 'Save Shift'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
