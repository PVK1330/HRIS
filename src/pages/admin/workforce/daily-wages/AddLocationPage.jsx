import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiCheck, HiMapPin, HiPlus, HiCamera, HiExclamationTriangle,
  HiSignal, HiXMark,
} from 'react-icons/hi2'

const SITE_TYPES = [
  'Fixed Site', 'Depot / Warehouse', 'Factory / Plant', 'Construction Site',
  'Office', 'Security Post', 'Distribution Centre', 'Canteen / Kitchen',
  'Mobile / Temporary', 'Other',
]

const WORKERS = [
  'Rahul Sharma', 'Sunita Pawar', 'Manoj Thakur', 'Anita Desai',
  'Vijay Kumar Kadam', 'Rekha Bhosale', 'Santosh More', 'Lata Gaikwad',
  'Dinesh Kulkarni', 'Priya Mehta',
]

const MOCK_ASSIGNED = ['Mumbai Site A', 'Pune Warehouse']

let _uid = 1
const makeId = () => _uid++

const newSite = () => ({
  id: makeId(),
  name: '', siteType: 'Fixed Site', code: '',
  lat: '', lng: '', postcode: '',
  address: '',
  radius: 200,
  checkInOpen: '07:30', checkInClose: '09:30',
  requirePhoto: false,
  expanded: true,
})

export default function AddLocationPage() {
  const navigate = useNavigate()
  const [worker, setWorker]           = useState('')
  const [assigned, setAssigned]       = useState([...MOCK_ASSIGNED])
  const [sites, setSites]             = useState([newSite()])

  const inp = 'h-10 w-full rounded-none border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]'
  const sel = 'h-10 w-full rounded-none border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] cursor-pointer'
  const lbl = 'mb-1.5 block text-xs font-medium text-slate-700'

  const update = (id, k, v) =>
    setSites(prev => prev.map(s => s.id === id ? { ...s, [k]: v } : s))
  const toggle = (id) =>
    setSites(prev => prev.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s))
  const remove = (id) =>
    setSites(prev => prev.filter(s => s.id !== id))
  const removeAssigned = (name) =>
    setAssigned(prev => prev.filter(s => s !== name))

  return (
    <div className="animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <p className="mb-2 text-xs text-slate-400">Daily wages › Location manager</p>

      {/* Header row */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Geofenced Location Manager</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Set and manage site locations for daily wages workers — multiple sites per worker supported
          </p>
        </div>
        <button type="button" onClick={() => setSites(prev => [...prev, newSite()])}
          className="inline-flex items-center gap-1.5 rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64]">
          <HiPlus className="h-4 w-4" />+ Add New Site
        </button>
      </div>

      {/* Warning banner */}
      <div className="mb-5 flex items-start gap-3 rounded-none border border-amber-200 bg-amber-50 px-4 py-3">
        <HiExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-xs text-amber-800">
          Workers must be within the geofence radius at the time of check-in. Location is captured using the
          device's GPS or browser Geolocation API. Ensure workers have location permissions enabled on their device.
        </p>
      </div>

      {/* Assign sites to worker */}
      <div className="mb-6 overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="p-5">
          <h2 className="mb-0.5 text-base font-bold text-slate-900">Assign Sites to Worker</h2>
          <p className="mb-4 text-xs text-slate-500">Search for a worker and assign one or more geofenced sites</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className={lbl}>Select Worker <span className="text-red-500">*</span></label>
              <select value={worker} onChange={e => setWorker(e.target.value)} className={sel}>
                <option value="">Search or select worker...</option>
                {WORKERS.map(w => <option key={w}>{w}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className={lbl}>Currently Assigned Sites</label>
              <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-none border border-slate-200 bg-white px-3 py-1.5">
                {assigned.length === 0 && (
                  <span className="text-xs text-slate-400">No sites assigned</span>
                )}
                {assigned.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {s}
                    <button type="button" onClick={() => removeAssigned(s)}
                      className="ml-0.5 text-slate-400 hover:text-red-500">
                      <HiXMark className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Site cards */}
      <div className="space-y-4">
        {sites.map((site, idx) => (
          <div key={site.id} className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">

            {/* Collapsed header */}
            {!site.expanded && (
              <div className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400">Site {idx + 1}</span>
                  <span className="text-sm font-bold text-slate-900">{site.name || 'Unnamed Site'}</span>
                  <span className="rounded-none border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => toggle(site.id)}
                    className="rounded-none border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                    Edit
                  </button>
                  <button type="button" onClick={() => remove(site.id)}
                    className="rounded-none border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Expanded form */}
            {site.expanded && (
              <div className="space-y-5 p-5">
                {/* Card top: site number + collapse/remove */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Site {idx + 1}</span>
                  {sites.length > 1 && (
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => toggle(site.id)}
                        className="text-xs text-slate-400 hover:text-slate-600">
                        Collapse
                      </button>
                      <button type="button" onClick={() => remove(site.id)}
                        className="text-xs font-semibold text-red-500 hover:text-red-700">
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Map placeholder */}
                <div className="flex h-28 flex-col items-center justify-center rounded-none border-2 border-dashed border-slate-200 bg-slate-50">
                  <HiMapPin className="mb-1.5 h-6 w-6 text-slate-300" />
                  <p className="text-xs font-medium text-slate-400">Map preview — click to open in Google Maps</p>
                  {site.lat && site.lng ? (
                    <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                      {site.lat}°N, {site.lng}°E{site.address ? ` · ${site.address.split(',').slice(-2).join(',').trim()}` : ''}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[11px] text-slate-300">Enter coordinates above to preview</p>
                  )}
                </div>

                {/* Row 1: Site Name | Site Type | Site Code */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className={lbl}>Site Name <span className="text-red-500">*</span></label>
                    <input value={site.name} onChange={e => update(site.id, 'name', e.target.value)}
                      placeholder="e.g. Pune Plant" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Site Type</label>
                    <select value={site.siteType} onChange={e => update(site.id, 'siteType', e.target.value)} className={sel}>
                      {SITE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Site Code / Reference</label>
                    <input value={site.code} onChange={e => update(site.id, 'code', e.target.value)}
                      placeholder="e.g. PP-01" className={inp} />
                  </div>
                </div>

                {/* Row 2: Latitude | Longitude | PIN Code */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className={lbl}>Latitude <span className="text-red-500">*</span></label>
                    <input value={site.lat} onChange={e => update(site.id, 'lat', e.target.value)}
                      placeholder="e.g. 18.5204" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Longitude <span className="text-red-500">*</span></label>
                    <input value={site.lng} onChange={e => update(site.id, 'lng', e.target.value)}
                      placeholder="e.g. 73.8567" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>PIN Code</label>
                    <input value={site.postcode} onChange={e => update(site.id, 'postcode', e.target.value)}
                      placeholder="e.g. 411019" className={inp} />
                  </div>
                </div>

                {/* Full Address */}
                <div>
                  <label className={lbl}>Full Address</label>
                  <input value={site.address} onChange={e => update(site.id, 'address', e.target.value)}
                    placeholder="e.g. Plot 12, Phase II Industrial Area, Pimpri-Chinchwad, Maharashtra 411019"
                    className={inp} />
                </div>

                {/* Geofence Radius + Check-in Window */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-700">
                        Geofence Radius <span className="text-red-500">*</span>
                      </label>
                      <span className="rounded-none border border-[#0F766E] bg-teal-50 px-2.5 py-0.5 text-sm font-bold text-[#0F766E]">
                        {site.radius}m
                      </span>
                    </div>
                    <input type="range" min={50} max={1000} step={25} value={site.radius}
                      onChange={e => update(site.id, 'radius', Number(e.target.value))}
                      className="h-2 w-full cursor-pointer accent-[#0F766E]" />
                    <p className="mt-1 text-[10px] text-slate-400">50m minimum — typical construction site: 200–500m</p>
                  </div>

                  <div>
                    <label className={lbl}>
                      Allowed Check-In Window <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input type="time" value={site.checkInOpen}
                        onChange={e => update(site.id, 'checkInOpen', e.target.value)}
                        className={inp} />
                      <span className="shrink-0 text-xs text-slate-400">to</span>
                      <input type="time" value={site.checkInClose}
                        onChange={e => update(site.id, 'checkInClose', e.target.value)}
                        className={inp} />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">Workers can only check in within this window</p>
                  </div>
                </div>

                {/* Require photo */}
                <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                  <input type="checkbox" checked={site.requirePhoto}
                    onChange={e => update(site.id, 'requirePhoto', e.target.checked)}
                    className="h-4 w-4 accent-[#0F766E]" />
                  <HiCamera className="h-4 w-4 text-purple-500" />
                  Require photo on check-in (optional evidence)
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add another location */}
      <button type="button" onClick={() => setSites(prev => [...prev, newSite()])}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-none border-2 border-dashed border-slate-300 py-4 text-sm font-semibold text-slate-500 transition-colors hover:border-[#0F766E] hover:text-[#0F766E]">
        <HiPlus className="h-4 w-4" />+ Add Another Location
      </button>

      {/* Bottom actions */}
      <div className="mt-6 flex items-center justify-end gap-3 rounded-none border border-slate-200 bg-white px-6 py-4">
        <button type="button" onClick={() => navigate('/admin/daily-wages/areas')}
          className="rounded-none border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button type="button" onClick={() => navigate('/admin/daily-wages/areas')}
          className="inline-flex items-center gap-2 rounded-none bg-[#0F766E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64]">
          <HiCheck className="h-4 w-4" />Save All Locations
        </button>
      </div>
    </div>
  )
}
