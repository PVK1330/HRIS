import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiPlus, HiMagnifyingGlass, HiPencilSquare, HiTrash, HiEye,
  HiMapPin, HiCheckBadge, HiXCircle, HiCalendarDays,
  HiCamera, HiClock, HiUsers, HiSignal,
} from 'react-icons/hi2'
import { Modal } from '../../../../components/ui/Modal.jsx'
import { Table } from '../../../../components/ui/Table.jsx'

const SITE_TYPES = [
  'Factory / Plant', 'Warehouse', 'Office', 'Construction Site',
  'Security Post', 'Distribution Centre', 'Canteen / Kitchen', 'Other',
]
const WORKER_OPTIONS = [
  'Rahul Sharma', 'Sunita Pawar', 'Manoj Thakur', 'Anita Desai',
  'Vijay Kumar Kadam', 'Rekha Bhosale', 'Santosh More', 'Lata Gaikwad',
]
const RADIUS_PRESETS = [50, 100, 150, 200, 300, 500, 1000]

const MOCK_AREAS = [
  {
    id: 'AREA-001', name: 'Pune Plant', code: 'PP-01', siteType: 'Factory / Plant',
    addressLine1: '14, MIDC Industrial Area', addressLine2: '', city: 'Pimpri-Chinchwad', district: 'Pune', pincode: '411019',
    lat: '18.5204', lng: '73.8567', radius: 200,
    checkInOpen: '05:30', checkInClose: '22:30', requirePhoto: true,
    description: 'Main production facility at Pimpri-Chinchwad',
    status: 'Active', createdDate: '2023-06-01', workerCount: 45,
    assignedWorkers: ['Rahul Sharma', 'Rekha Bhosale'],
  },
  {
    id: 'AREA-002', name: 'Chinchwad Site', code: 'CS-02', siteType: 'Factory / Plant',
    addressLine1: 'Plot 7, Chinchwad MIDC', addressLine2: 'Phase 2', city: 'Chinchwad', district: 'Pune', pincode: '411033',
    lat: '18.6488', lng: '73.7951', radius: 150,
    checkInOpen: '06:00', checkInClose: '22:00', requirePhoto: false,
    description: 'Secondary assembly and testing unit',
    status: 'Active', createdDate: '2023-07-15', workerCount: 32,
    assignedWorkers: ['Santosh More'],
  },
  {
    id: 'AREA-003', name: 'Warehouse Area', code: 'WA-03', siteType: 'Warehouse',
    addressLine1: 'Survey No. 45, Bhosari', addressLine2: '', city: 'Bhosari', district: 'Pune', pincode: '411026',
    lat: '18.5310', lng: '73.8455', radius: 150,
    checkInOpen: '07:00', checkInClose: '21:00', requirePhoto: true,
    description: 'Central storage and dispatch facility',
    status: 'Active', createdDate: '2023-08-10', workerCount: 18,
    assignedWorkers: ['Sunita Pawar', 'Vijay Kumar Kadam'],
  },
  {
    id: 'AREA-004', name: 'North Gate Zone', code: 'NG-04', siteType: 'Security Post',
    addressLine1: 'Gate No. 1, North Perimeter', addressLine2: '', city: 'Pimpri-Chinchwad', district: 'Pune', pincode: '411019',
    lat: '18.5415', lng: '73.8780', radius: 50,
    checkInOpen: '00:00', checkInClose: '23:59', requirePhoto: true,
    description: 'Northern entrance and security perimeter',
    status: 'Active', createdDate: '2023-09-01', workerCount: 8,
    assignedWorkers: ['Manoj Thakur'],
  },
  {
    id: 'AREA-005', name: 'South Yard', code: 'SY-05', siteType: 'Distribution Centre',
    addressLine1: 'South Perimeter Road', addressLine2: '', city: 'Pimpri-Chinchwad', district: 'Pune', pincode: '411019',
    lat: '18.5102', lng: '73.8567', radius: 300,
    checkInOpen: '06:00', checkInClose: '20:00', requirePhoto: false,
    description: 'Outdoor storage yard and vehicle parking',
    status: 'Inactive', createdDate: '2023-10-20', workerCount: 12,
    assignedWorkers: ['Vijay Kumar Kadam'],
  },
  {
    id: 'AREA-006', name: 'Admin Block', code: 'AB-06', siteType: 'Office',
    addressLine1: 'Building C, Corporate Park', addressLine2: '3rd Floor', city: 'Pimpri-Chinchwad', district: 'Pune', pincode: '411019',
    lat: '18.5101', lng: '73.8567', radius: 75,
    checkInOpen: '08:30', checkInClose: '20:00', requirePhoto: false,
    description: 'Administrative offices and support staff area',
    status: 'Active', createdDate: '2024-01-05', workerCount: 20,
    assignedWorkers: ['Anita Desai', 'Lata Gaikwad'],
  },
]

const EMPTY_FORM = {
  name: '', code: '', siteType: '',
  addressLine1: '', addressLine2: '', city: '', district: '', pincode: '',
  lat: '', lng: '',
  radius: 200, checkInOpen: '06:00', checkInClose: '22:00', requirePhoto: false,
  description: '', status: 'Active',
  assignedWorkers: [],
}

function StatusBadge({ status }) {
  return status === 'Active'
    ? <span className="inline-flex items-center gap-1 rounded-none bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700"><HiCheckBadge className="h-3 w-3" />Active</span>
    : <span className="inline-flex items-center gap-1 rounded-none bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700"><HiXCircle className="h-3 w-3" />Inactive</span>
}

function WorkerMultiSelect({ selected, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
  const toggle = (w) => onChange(selected.includes(w) ? selected.filter(s => s !== w) : [...selected, w])
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => !disabled && setOpen(v => !v)}
        className={`flex h-10 w-full items-center justify-between rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none transition ${disabled ? 'pointer-events-none opacity-70' : 'focus:border-[#0F766E] hover:border-slate-300'}`}>
        <span className={selected.length === 0 ? 'text-slate-400' : 'text-slate-800 font-medium'}>
          {selected.length === 0 ? 'Assign workers…' : `${selected.length} worker${selected.length !== 1 ? 's' : ''} assigned`}
        </span>
        <HiUsers className="h-4 w-4 text-slate-400" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-44 overflow-y-auto rounded-none border border-slate-200 bg-white shadow-lg">
          {WORKER_OPTIONS.map(w => (
            <label key={w} className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50">
              <input type="checkbox" checked={selected.includes(w)} onChange={() => toggle(w)} className="h-3.5 w-3.5 accent-[#0F766E]" />
              <span className="text-slate-700">{w}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AreasManagement() {
  const navigate = useNavigate()
  const [areas, setAreas] = useState(MOCK_AREAS)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = areas.filter(a => {
    const q = search.toLowerCase()
    return (!q || a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || (a.city || '').toLowerCase().includes(q))
      && (!filterStatus || a.status === filterStatus)
      && (!filterType || a.siteType === filterType)
  })

  const stats = {
    total: areas.length,
    active: areas.filter(a => a.status === 'Active').length,
    inactive: areas.filter(a => a.status === 'Inactive').length,
    recent: areas.filter(a => new Date(a.createdDate) >= new Date('2024-01-01')).length,
  }

  function openAdd() { setForm({ ...EMPTY_FORM }); setModalMode('add'); setModalOpen(true) }
  function openEdit(a) { setForm({ ...a }); setEditTarget(a.id); setModalMode('edit'); setModalOpen(true) }
  function openView(a) { setForm({ ...a }); setModalMode('view'); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditTarget(null) }

  function handleSave() {
    if (modalMode === 'add') {
      const newId = `AREA-${String(areas.length + 1).padStart(3, '0')}`
      setAreas(prev => [...prev, { ...form, id: newId, createdDate: new Date().toISOString().split('T')[0], workerCount: form.assignedWorkers.length }])
    } else {
      setAreas(prev => prev.map(a => a.id === editTarget ? { ...a, ...form } : a))
    }
    closeModal()
  }
  function handleDelete(id) { setAreas(prev => prev.filter(a => a.id !== id)); setDeleteTarget(null) }
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const ro = modalMode === 'view'
  const inp = `h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]${ro ? ' pointer-events-none opacity-70' : ''}`
  const sel = `h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] cursor-pointer${ro ? ' pointer-events-none opacity-70' : ''}`
  const lbl = 'mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500'
  const sec = 'mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#0F766E] pb-2 border-b border-slate-100'

  const statCards = [
    { label: 'TOTAL SITES', count: stats.total, bg: 'bg-[#0F172A]', icon: HiMapPin },
    { label: 'ACTIVE', count: stats.active, bg: 'bg-[#10B981]', icon: HiCheckBadge },
    { label: 'INACTIVE', count: stats.inactive, bg: 'bg-[#EF4444]', icon: HiXCircle },
    { label: 'ADDED THIS YEAR', count: stats.recent, bg: 'bg-[#3B82F6]', icon: HiCalendarDays },
  ]

  const columns = [
    {
      key: 'name', label: 'Site Name', render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-teal-50 border border-teal-100">
            <HiMapPin className="h-4 w-4 text-[#0F766E]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{row.name}</p>
            <p className="text-[11px] text-slate-400">{row.siteType} · <span className="font-mono">{row.code}</span></p>
          </div>
        </div>
      )
    },
    {
      key: 'address', label: 'Address', render: (_, row) => (
        <div className="max-w-[180px]">
          <p className="text-xs text-slate-700 truncate">{row.addressLine1}</p>
          <p className="text-[11px] text-slate-400">{row.city}, {row.pincode}</p>
        </div>
      )
    },
    {
      key: 'coords', label: 'Coordinates', render: (_, row) => (
        <div className="font-mono text-[10px] text-slate-500 whitespace-nowrap">
          <p>{row.lat}°N</p>
          <p>{row.lng}°E</p>
        </div>
      )
    },
    {
      key: 'radius', label: 'Radius', render: (_, row) => (
        <span className="inline-flex items-center gap-1 rounded-none border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
          <HiSignal className="h-3 w-3" />{row.radius}m
        </span>
      )
    },
    {
      key: 'checkIn', label: 'Check-in Window', render: (_, row) => (
        <div className="flex items-center gap-1 text-xs font-medium text-slate-700 whitespace-nowrap">
          <HiClock className="h-3.5 w-3.5 text-slate-400" />
          {row.checkInOpen} – {row.checkInClose}
        </div>
      )
    },
    {
      key: 'photo', label: 'Photo', render: (_, row) => row.requirePhoto
        ? <span className="inline-flex items-center gap-1 rounded-none bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] font-bold text-purple-700"><HiCamera className="h-3 w-3" />Required</span>
        : <span className="text-[11px] text-slate-400">—</span>
    },
    {
      key: 'workers', label: 'Workers', render: (_, row) => (
        <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-700">
          <HiUsers className="h-3.5 w-3.5 text-slate-400" />{row.workerCount}
        </span>
      )
    },
    { key: 'status', label: 'Status', render: (_, row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions', label: 'Actions', render: (_, row) => (
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => openView(row)} title="View"
            className="rounded-none p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
            <HiEye className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => openEdit(row)} title="Edit"
            className="rounded-none p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600">
            <HiPencilSquare className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setDeleteTarget(row)} title="Delete"
            className="rounded-none p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600">
            <HiTrash className="h-4 w-4" />
          </button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Locations &amp; Geofencing</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span>Workforce Management</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Sites / Geofenced Zones</span>
          </div>
        </div>
        <button type="button" onClick={() => navigate('/admin/daily-wages/areas/add')}
          className="inline-flex items-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0c6b64] shadow-sm shrink-0">
          <HiPlus className="h-4 w-4" />Add Location
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {statCards.map((card, idx) => (
          <div key={idx} className="flex items-center gap-3.5 rounded-none border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bg} text-white shadow-sm`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-wider truncate leading-none text-slate-400">{card.label}</div>
              <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Geofenced Locations</h2>
          <span className="text-xs font-medium text-teal-200">{filtered.length} sites</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, code, city…"
              className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none transition focus:border-[#0F766E] cursor-pointer">
            <option value="">All Types</option>
            {SITE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none transition focus:border-[#0F766E] cursor-pointer">
            <option value="">All Statuses</option>
            <option>Active</option><option>Inactive</option>
          </select>
          {(search || filterStatus || filterType) && (
            <button type="button" onClick={() => { setSearch(''); setFilterStatus(''); setFilterType('') }}
              className="rounded-none border border-dashed border-slate-200 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:border-slate-300">
              Reset
            </button>
          )}
        </div>

        <Table columns={columns} data={filtered} pageSize={8} square />
      </div>

      {/* ── Add / Edit / View Modal ──────────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={closeModal} size="2xl"
        title={modalMode === 'add' ? 'Add New Location' : modalMode === 'edit' ? 'Edit Location' : 'Location Details'}>
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">

          {/* Section 1 — Site Details */}
          <div className="space-y-4">
            <p className={sec}><HiMapPin className="h-3.5 w-3.5" /><span>Site Details</span></p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={lbl}>Site Name <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Pune Plant" className={inp} />
              </div>
              <div>
                <label className={lbl}>Site Code <span className="text-red-500">*</span></label>
                <input value={form.code} onChange={e => setField('code', e.target.value)} placeholder="e.g. PP-01" className={inp} />
              </div>
              <div>
                <label className={lbl}>Site Type</label>
                <select value={form.siteType} onChange={e => setField('siteType', e.target.value)} className={sel}>
                  <option value="">Select type</option>
                  {SITE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={lbl}>Description</label>
              <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={2}
                placeholder="Brief description of this location…"
                className={`w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm placeholder-slate-400 outline-none transition focus:border-[#0F766E] resize-none${ro ? ' pointer-events-none opacity-70' : ''}`} />
            </div>
            <div>
              <label className={lbl}>Status</label>
              <div className="flex items-center gap-6 pt-1">
                {['Active', 'Inactive'].map(s => (
                  <label key={s} className={`flex cursor-pointer items-center gap-2 ${ro ? 'pointer-events-none opacity-70' : ''}`}>
                    <input type="radio" name="site-status" value={s} checked={form.status === s}
                      onChange={() => setField('status', s)} className="accent-[#0F766E]" />
                    <span className="text-sm font-medium text-slate-700">{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2 — Address & Coordinates */}
          <div className="space-y-4">
            <p className={sec}><span>Address &amp; Coordinates</span></p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={lbl}>Address Line 1</label>
                <input value={form.addressLine1} onChange={e => setField('addressLine1', e.target.value)} placeholder="Plot / building number and street" className={inp} />
              </div>
              <div>
                <label className={lbl}>Address Line 2</label>
                <input value={form.addressLine2} onChange={e => setField('addressLine2', e.target.value)} placeholder="Area, landmark (optional)" className={inp} />
              </div>
              <div>
                <label className={lbl}>City / Town</label>
                <input value={form.city} onChange={e => setField('city', e.target.value)} placeholder="e.g. Pimpri-Chinchwad" className={inp} />
              </div>
              <div>
                <label className={lbl}>District</label>
                <input value={form.district} onChange={e => setField('district', e.target.value)} placeholder="e.g. Pune" className={inp} />
              </div>
              <div>
                <label className={lbl}>PIN Code</label>
                <input value={form.pincode} onChange={e => setField('pincode', e.target.value)} placeholder="e.g. 411019" className={inp} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={lbl}>Latitude</label>
                <input value={form.lat} onChange={e => setField('lat', e.target.value)} placeholder="e.g. 18.5204" className={inp} />
                <p className="mt-1 text-[11px] text-slate-400">Decimal degrees (e.g. 18.5204 for 18°N)</p>
              </div>
              <div>
                <label className={lbl}>Longitude</label>
                <input value={form.lng} onChange={e => setField('lng', e.target.value)} placeholder="e.g. 73.8567" className={inp} />
                <p className="mt-1 text-[11px] text-slate-400">Decimal degrees (e.g. 73.8567 for 73°E)</p>
              </div>
            </div>
          </div>

          {/* Section 3 — Geofencing */}
          <div className="space-y-4">
            <p className={sec}><HiSignal className="h-3.5 w-3.5" /><span>Geofencing Configuration</span></p>

            {/* Radius slider */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className={lbl + ' mb-0'}>Check-in Radius</label>
                <span className="rounded-none border border-[#0F766E] bg-teal-50 px-2.5 py-0.5 text-sm font-black text-[#0F766E]">{form.radius}m</span>
              </div>
              <input
                type="range" min={50} max={1000} step={25}
                value={form.radius}
                onChange={e => setField('radius', Number(e.target.value))}
                disabled={ro}
                className="h-2 w-full cursor-pointer accent-[#0F766E] disabled:opacity-60"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {RADIUS_PRESETS.map(p => (
                  <button key={p} type="button"
                    disabled={ro}
                    onClick={() => setField('radius', p)}
                    className={`rounded-none border px-2.5 py-1 text-[11px] font-bold transition disabled:opacity-50 ${form.radius === p ? 'border-[#0F766E] bg-teal-50 text-[#0F766E]' : 'border-slate-200 text-slate-600 hover:border-[#0F766E] hover:text-[#0F766E]'}`}>
                    {p}m
                  </button>
                ))}
              </div>
            </div>

            {/* Check-in window */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={lbl}>Check-in Window — Opens</label>
                <input type="time" value={form.checkInOpen} onChange={e => setField('checkInOpen', e.target.value)}
                  disabled={ro} className={inp} />
                <p className="mt-1 text-[11px] text-slate-400">Workers can check in from this time</p>
              </div>
              <div>
                <label className={lbl}>Check-in Window — Closes</label>
                <input type="time" value={form.checkInClose} onChange={e => setField('checkInClose', e.target.value)}
                  disabled={ro} className={inp} />
                <p className="mt-1 text-[11px] text-slate-400">Check-in is blocked after this time</p>
              </div>
            </div>

            {/* Photo requirement */}
            <label className={`flex cursor-pointer items-start gap-3 rounded-none border border-slate-200 bg-slate-50 p-4 ${ro ? 'pointer-events-none opacity-70' : 'hover:bg-slate-100'}`}>
              <input type="checkbox" checked={form.requirePhoto} onChange={e => setField('requirePhoto', e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#0F766E]" />
              <div>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <HiCamera className="h-4 w-4 text-purple-500" />Require photo on check-in
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Workers must take a photo selfie when checking in at this location. Used for identity verification.</p>
              </div>
            </label>
          </div>

          {/* Section 4 — Assigned Workers */}
          <div className="space-y-4">
            <p className={sec}><HiUsers className="h-3.5 w-3.5" /><span>Assigned Workers</span></p>
            <div>
              <label className={lbl}>Workers Assigned to this Site</label>
              <WorkerMultiSelect selected={form.assignedWorkers} onChange={v => setField('assignedWorkers', v)} disabled={ro} />
              {form.assignedWorkers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 rounded-none border border-slate-100 bg-slate-50 p-3">
                  {form.assignedWorkers.map(w => (
                    <span key={w} className="inline-flex items-center gap-1 rounded-none border border-teal-200 bg-white px-2 py-1 text-xs font-semibold text-teal-700">
                      <HiUsers className="h-3 w-3" />{w}
                      {!ro && (
                        <button type="button"
                          onClick={() => setField('assignedWorkers', form.assignedWorkers.filter(x => x !== w))}
                          className="ml-0.5 text-teal-400 hover:text-red-500 text-xs leading-none">×</button>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button type="button" onClick={closeModal}
            className="rounded-none border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            {ro ? 'Close' : 'Cancel'}
          </button>
          {!ro && (
            <button type="button" onClick={handleSave}
              className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64]">
              {modalMode === 'add' ? 'Add Location' : 'Save Changes'}
            </button>
          )}
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm" title="Delete Location">
        <div className="p-6">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <span className="font-bold text-slate-900">{deleteTarget?.name}</span>?
            {deleteTarget?.workerCount > 0 && (
              <span className="mt-2 block rounded-none border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                Warning: {deleteTarget.workerCount} workers are assigned to this location.
              </span>
            )}
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setDeleteTarget(null)}
              className="rounded-none border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="button" onClick={() => handleDelete(deleteTarget?.id)}
              className="rounded-none bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
