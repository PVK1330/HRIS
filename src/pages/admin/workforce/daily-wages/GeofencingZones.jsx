import { useState, useRef, useEffect } from 'react'
import {
  HiPlus, HiMagnifyingGlass, HiPencilSquare, HiTrash, HiEye,
  HiMapPin, HiSquares2X2, HiListBullet, HiXMark,
  HiCamera,
} from 'react-icons/hi2'
import { Modal } from '../../../../components/ui/Modal.jsx'
import { Table } from '../../../../components/ui/Table.jsx'

const SITE_TYPES = ['Manufacturing / Factory', 'Warehouse / Storage', 'Construction Site', 'Office / Admin Building', 'Outdoor / Open Yard', 'Retail / Commercial', 'Security Checkpoint', 'Transport Depot']
const WORKERS_LIST = [
  { id: 'DW-001', name: 'Rahul Sharma' },
  { id: 'DW-002', name: 'Sunita Pawar' },
  { id: 'DW-003', name: 'Manoj Thakur' },
  { id: 'DW-004', name: 'Anita Desai' },
  { id: 'DW-005', name: 'Vijay Kumar Kadam' },
  { id: 'DW-006', name: 'Rekha Bhosale' },
  { id: 'DW-007', name: 'Santosh More' },
  { id: 'DW-008', name: 'Lata Gaikwad' },
]

const MOCK_ZONES = [
  {
    id: 'GZ-001', name: 'Production Unit Alpha',
    siteType: 'Manufacturing / Factory', area: 'Pune Plant',
    lat: '18.5204', lng: '73.8567',
    fullAddress: '14-A, Industrial Estate, Pimpri Road, Pune', postcode: '411018',
    radius: 100, checkinFrom: '06:00', checkinTo: '09:00',
    requirePhoto: true, description: 'Main production floor — entry restricted during shift change.', status: 'Active', workers: ['DW-001', 'DW-006'],
  },
  {
    id: 'GZ-002', name: 'Warehouse Bay B',
    siteType: 'Warehouse / Storage', area: 'Warehouse Area',
    lat: '18.5310', lng: '73.8455',
    fullAddress: '22, MIDC, Chinchwad, Pune', postcode: '411019',
    radius: 200, checkinFrom: '07:00', checkinTo: '10:00',
    requirePhoto: false, description: 'Loading/unloading operations area.', status: 'Active', workers: ['DW-002', 'DW-005'],
  },
  {
    id: 'GZ-003', name: 'North Gate Security',
    siteType: 'Security Checkpoint', area: 'North Gate Zone',
    lat: '18.5415', lng: '73.8780',
    fullAddress: 'Gate No.1, North Campus, Pimpri Chinchwad', postcode: '411044',
    radius: 50, checkinFrom: '05:30', checkinTo: '22:30',
    requirePhoto: true, description: 'Main entry/exit security check-post. 24-hour guard coverage.', status: 'Active', workers: ['DW-003'],
  },
  {
    id: 'GZ-004', name: 'Admin Block Reception',
    siteType: 'Office / Admin Building', area: 'Admin Block',
    lat: '18.5101', lng: '73.8567',
    fullAddress: '5th Floor, Biz Tower, FC Road, Pune', postcode: '411004',
    radius: 75, checkinFrom: '08:30', checkinTo: '10:30',
    requirePhoto: false, description: 'Cleaning and housekeeping staff.', status: 'Active', workers: ['DW-004', 'DW-008'],
  },
  {
    id: 'GZ-005', name: 'South Yard Parking',
    siteType: 'Transport Depot', area: 'South Yard',
    lat: '18.4998', lng: '73.8612',
    fullAddress: 'Plot 88, South Yard, Hadapsar, Pune', postcode: '411028',
    radius: 300, checkinFrom: '07:00', checkinTo: '09:00',
    requirePhoto: false, description: 'Vehicle parking and dispatch area.', status: 'Inactive', workers: ['DW-005'],
  },
]

const EMPTY_FORM = {
  name: '', siteType: '', area: '', lat: '', lng: '',
  fullAddress: '', postcode: '',
  radius: 150,
  checkinFrom: '08:00', checkinTo: '10:00',
  requirePhoto: false,
  description: '', status: 'Active',
  workers: [],
}

function StatusBadge({ status }) {
  return status === 'Active'
    ? <span className="rounded-none bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Active</span>
    : <span className="rounded-none bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">Inactive</span>
}

export default function GeofencingZones() {
  const [zones, setZones] = useState(MOCK_ZONES)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [viewMode, setViewMode] = useState('table')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [workerSearch, setWorkerSearch] = useState('')
  const [workerDropOpen, setWorkerDropOpen] = useState(false)
  const workerDropRef = useRef(null)

  useEffect(() => {
    if (!workerDropOpen) return
    const h = (e) => { if (workerDropRef.current && !workerDropRef.current.contains(e.target)) setWorkerDropOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [workerDropOpen])

  const filtered = zones.filter(z =>
    (!search || z.name.toLowerCase().includes(search.toLowerCase()) || z.area.toLowerCase().includes(search.toLowerCase()))
    && (!filterStatus || z.status === filterStatus)
    && (!filterType || z.siteType === filterType)
  )

  function openAdd() { setForm({ ...EMPTY_FORM }); setWorkerSearch(''); setModalMode('add'); setModalOpen(true) }
  function openEdit(z) { setForm({ ...z }); setWorkerSearch(''); setEditTarget(z.id); setModalMode('edit'); setModalOpen(true) }
  function openView(z) { setForm({ ...z }); setModalMode('view'); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditTarget(null) }
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const ro = modalMode === 'view'

  function handleSave() {
    if (modalMode === 'add') {
      const newId = `GZ-${String(zones.length + 1).padStart(3, '0')}`
      setZones(p => [...p, { ...form, id: newId }])
    } else {
      setZones(p => p.map(z => z.id === editTarget ? { ...form, id: editTarget } : z))
    }
    closeModal()
  }
  function handleDelete(id) { setZones(p => p.filter(z => z.id !== id)); setDeleteTarget(null) }

  const toggleWorker = (id) => setForm(f => ({ ...f, workers: f.workers.includes(id) ? f.workers.filter(x => x !== id) : [...f.workers, id] }))
  const filteredWorkers = WORKERS_LIST.filter(w => w.name.toLowerCase().includes(workerSearch.toLowerCase()))

  const inp = `h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]${ro ? ' pointer-events-none opacity-70' : ''}`
  const sel = `h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] cursor-pointer${ro ? ' pointer-events-none opacity-70' : ''}`
  const lbl = 'mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500'
  const sec = 'mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#0F766E] pb-2 border-b border-slate-100'

  const columns = [
    { key: 'id', label: 'Zone ID', render: (r) => <span className="font-mono text-xs font-bold text-[#0F766E]">{r.id}</span> },
    {
      key: 'name', label: 'Zone Name', render: (r) => (
        <div>
          <p className="text-sm font-semibold text-slate-900">{r.name}</p>
          <p className="text-[11px] text-slate-400">{r.area}</p>
        </div>
      )
    },
    { key: 'siteType', label: 'Site Type', render: (r) => <span className="text-xs text-slate-600">{r.siteType}</span> },
    { key: 'address', label: 'Address', render: (r) => <span className="text-xs text-slate-600 max-w-[180px] block truncate">{r.fullAddress}{r.postcode ? ` – ${r.postcode}` : ''}</span> },
    {
      key: 'radius', label: 'Geofence Radius', render: (r) => (
        <div className="flex items-center gap-2">
          <div className="relative h-1.5 w-20 rounded-none bg-slate-200">
            <div className="absolute h-1.5 rounded-none bg-[#0F766E]" style={{ width: `${((r.radius - 50) / 950) * 100}%` }} />
          </div>
          <span className="text-xs font-bold text-slate-700">{r.radius}m</span>
        </div>
      )
    },
    { key: 'checkin', label: 'Check-in Window', render: (r) => <span className="text-xs font-medium text-slate-600">{r.checkinFrom} – {r.checkinTo}</span> },
    {
      key: 'requirePhoto', label: 'Photo', render: (r) => r.requirePhoto
        ? <span className="inline-flex items-center gap-1 rounded-none bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-700"><HiCamera className="h-3 w-3" />Yes</span>
        : <span className="text-[10px] font-bold text-slate-400">No</span>
    },
    { key: 'workers', label: 'Workers', render: (r) => <span className="inline-flex items-center gap-1 rounded-none bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-bold text-blue-700">{r.workers.length} assigned</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: 'Actions', render: (r) => (
        <div className="flex gap-1">
          <button type="button" onClick={() => openView(r)} className="rounded-none p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><HiEye className="h-4 w-4" /></button>
          <button type="button" onClick={() => openEdit(r)} className="rounded-none p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><HiPencilSquare className="h-4 w-4" /></button>
          <button type="button" onClick={() => setDeleteTarget(r)} className="rounded-none p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><HiTrash className="h-4 w-4" /></button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Geofencing Zones</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span>Workforce Management</span><span className="text-slate-400">&gt;</span><span className="text-slate-600">Geofencing Zones</span>
          </div>
        </div>
        <button type="button" onClick={openAdd} className="inline-flex items-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0c6b64] shadow-sm">
          <HiPlus className="h-4 w-4" />Add Zone
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Zones', count: zones.length, color: 'bg-[#0F172A]' },
          { label: 'Active', count: zones.filter(z => z.status === 'Active').length, color: 'bg-[#10B981]' },
          { label: 'Photo Required', count: zones.filter(z => z.requirePhoto).length, color: 'bg-[#0F766E]' },
        ].map((c, i) => (
          <div key={i} className="flex items-center gap-4 rounded-none border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-none ${c.color} text-white`}><HiMapPin className="h-5 w-5" /></div>
            <div><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{c.label}</p><p className="text-2xl font-black text-slate-900">{c.count}</p></div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Zones Register</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-teal-200">{filtered.length} records</span>
            <button type="button" onClick={() => setViewMode(v => v === 'table' ? 'card' : 'table')}
              className="rounded-none border border-teal-500 bg-transparent p-1.5 text-white hover:bg-teal-700">
              {viewMode === 'table' ? <HiSquares2X2 className="h-4 w-4" /> : <HiListBullet className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 border-b border-slate-200 px-4 py-3 md:grid-cols-4">
          <div className="relative">
            <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search zones…"
              className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none transition focus:border-[#0F766E] cursor-pointer">
            <option value="">All Site Types</option>{SITE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none transition focus:border-[#0F766E] cursor-pointer">
            <option value="">All Statuses</option><option>Active</option><option>Inactive</option>
          </select>
          <div className="flex items-center justify-end">
            <button type="button" onClick={() => { setSearch(''); setFilterType(''); setFilterStatus('') }}
              className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:border-slate-300">Reset</button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <Table columns={columns} data={filtered} pageSize={8} />
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(z => (
              <div key={z.id} className="rounded-none border border-slate-200 bg-white p-4 shadow-sm hover:border-[#0F766E] transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{z.name}</p>
                    <p className="text-[11px] text-[#0F766E] font-semibold mt-0.5">{z.siteType}</p>
                  </div>
                  <StatusBadge status={z.status} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{z.fullAddress}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
                  <span className="font-bold text-[#0F766E]">{z.radius}m</span>
                  <span>{z.checkinFrom} – {z.checkinTo}</span>
                  {z.requirePhoto && <span className="flex items-center gap-1 text-teal-600 font-semibold"><HiCamera className="h-3 w-3" />Photo</span>}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{z.workers.length} worker{z.workers.length !== 1 ? 's' : ''} assigned</span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => openView(z)} className="rounded-none p-1.5 text-slate-400 hover:text-slate-700"><HiEye className="h-4 w-4" /></button>
                    <button type="button" onClick={() => openEdit(z)} className="rounded-none p-1.5 text-slate-400 hover:text-blue-600"><HiPencilSquare className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setDeleteTarget(z)} className="rounded-none p-1.5 text-slate-400 hover:text-red-600"><HiTrash className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit / View Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} size="xl"
        title={modalMode === 'add' ? 'Add Geofencing Zone' : modalMode === 'edit' ? 'Edit Zone' : 'Zone Details'}>
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">

          {/* Worker Assignment widget */}
          <div className="rounded-none border border-slate-200 bg-slate-50 p-4">
            <p className={`${lbl} mb-3`}>Assigned Workers</p>
            <div className="relative" ref={workerDropRef}>
              <div className={`flex h-10 w-full items-center gap-2 rounded-none border border-slate-200 bg-white px-3 text-sm ${ro ? 'pointer-events-none opacity-70' : 'cursor-pointer'}`}
                onClick={() => !ro && setWorkerDropOpen(v => !v)}>
                <HiMagnifyingGlass className="h-4 w-4 text-slate-400 shrink-0" />
                <input type="text" value={workerSearch} onChange={e => { setWorkerSearch(e.target.value); setWorkerDropOpen(true) }}
                  placeholder="Search & add workers to this zone…"
                  className="flex-1 bg-transparent outline-none placeholder-slate-400 text-sm" />
              </div>
              {workerDropOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-36 overflow-y-auto rounded-none border border-slate-200 bg-white shadow-lg">
                  {filteredWorkers.map(w => (
                    <label key={w.id} className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50">
                      <input type="checkbox" checked={form.workers.includes(w.id)} onChange={() => toggleWorker(w.id)} className="h-3.5 w-3.5 accent-[#0F766E]" />
                      <span>{w.name}</span><span className="ml-auto font-mono text-[11px] text-slate-400">{w.id}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {form.workers.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.workers.map(id => {
                  const w = WORKERS_LIST.find(x => x.id === id)
                  return (
                    <span key={id} className="inline-flex items-center gap-1 rounded-none bg-teal-50 border border-teal-200 px-2 py-0.5 text-xs font-semibold text-teal-700">
                      {w?.name ?? id}
                      {!ro && <button type="button" onClick={() => toggleWorker(id)}><HiXMark className="h-3 w-3 hover:text-red-500" /></button>}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* Site Info */}
          <div>
            <p className={sec}>Zone / Site Information</p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className={lbl}>Zone Name <span className="text-red-500">*</span></label><input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Production Unit Alpha" className={inp} /></div>
              <div>
                <label className={lbl}>Site Type</label>
                <select value={form.siteType} onChange={e => setField('siteType', e.target.value)} className={sel}>
                  <option value="">Select type</option>{SITE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label className={lbl}>Area / Site</label><input value={form.area} onChange={e => setField('area', e.target.value)} placeholder="e.g. Pune Plant" className={inp} /></div>
              <div className="sm:col-span-2"><label className={lbl}>Full Address</label><input value={form.fullAddress} onChange={e => setField('fullAddress', e.target.value)} placeholder="Building name, street, locality, city" className={inp} /></div>
              <div><label className={lbl}>Postcode / PIN Code</label><input value={form.postcode} onChange={e => setField('postcode', e.target.value)} placeholder="e.g. 411001" className={inp} /></div>
              <div><label className={lbl}>Latitude</label><input type="number" step="any" value={form.lat} onChange={e => setField('lat', e.target.value)} placeholder="e.g. 18.5204" className={inp} /></div>
              <div><label className={lbl}>Longitude</label><input type="number" step="any" value={form.lng} onChange={e => setField('lng', e.target.value)} placeholder="e.g. 73.8567" className={inp} /></div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="flex h-36 items-center justify-center rounded-none border-2 border-dashed border-slate-200 bg-slate-50">
            <div className="text-center">
              <HiMapPin className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-1 text-xs font-medium text-slate-400">Map preview — click to set pin location</p>
              {form.lat && form.lng && <p className="mt-1 font-mono text-[11px] text-[#0F766E]">{form.lat}, {form.lng}</p>}
            </div>
          </div>

          {/* Geofence & Check-in */}
          <div>
            <p className={sec}>Geofence &amp; Check-in Settings</p>
            <div className="mt-3 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={lbl + ' mb-0'}>Geofence Radius</label>
                  <span className="text-sm font-black text-[#0F766E]">{form.radius}m</span>
                </div>
                <input type="range" min="50" max="1000" step="25" value={form.radius}
                  onChange={e => setField('radius', Number(e.target.value))}
                  disabled={ro}
                  className="w-full h-2 accent-[#0F766E] cursor-pointer disabled:opacity-60" />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>50m</span><span>525m</span><span>1000m</span></div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[50, 100, 150, 200, 300, 500, 1000].map(v => (
                    <button key={v} type="button" onClick={() => !ro && setField('radius', v)}
                      className={`rounded-none border px-2.5 py-1 text-[11px] font-bold transition ${form.radius === v ? 'border-[#0F766E] bg-teal-50 text-[#0F766E]' : 'border-slate-200 text-slate-500 hover:border-slate-300'} ${ro ? 'pointer-events-none' : ''}`}>
                      {v}m
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Check-in Window — From</label>
                  <input type="time" value={form.checkinFrom} onChange={e => setField('checkinFrom', e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Check-in Window — To</label>
                  <input type="time" value={form.checkinTo} onChange={e => setField('checkinTo', e.target.value)} className={inp} />
                </div>
              </div>
              <label className={`flex items-center gap-3 text-sm font-medium text-slate-700 ${ro ? 'pointer-events-none opacity-70' : 'cursor-pointer'}`}>
                <input type="checkbox" checked={form.requirePhoto} onChange={e => setField('requirePhoto', e.target.checked)} className="h-4 w-4 rounded accent-[#0F766E]" />
                <HiCamera className="h-4 w-4 text-slate-400" />
                Require photo on check-in (worker must take a selfie)
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={lbl}>Description / Notes</label>
              <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={3} placeholder="Additional notes…"
                className={`w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] resize-none ${ro ? 'pointer-events-none opacity-70' : ''}`} />
            </div>
            <div>
              <label className={lbl}>Status</label>
              <div className={`flex gap-4 pt-2 ${ro ? 'pointer-events-none opacity-70' : ''}`}>
                {['Active', 'Inactive'].map(s => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                    <input type="radio" name="zone-status" checked={form.status === s} onChange={() => setField('status', s)} className="h-4 w-4 accent-[#0F766E]" />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button type="button" onClick={closeModal} className="rounded-none border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Cancel</button>
          {!ro && <button type="button" onClick={handleSave} className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64]">{modalMode === 'add' ? 'Save Zone' : 'Save Changes'}</button>}
        </div>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm" title="Delete Zone">
        <div className="p-6">
          <p className="text-sm text-slate-600">Delete zone <span className="font-bold text-slate-900">"{deleteTarget?.name}"</span>? This cannot be undone.</p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-none border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={() => handleDelete(deleteTarget?.id)} className="rounded-none bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
