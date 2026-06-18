import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiPlus, HiMagnifyingGlass, HiDocumentArrowDown, HiChevronDown,
  HiUsers, HiCheckBadge, HiUserCircle, HiCalendar,
  HiPencilSquare, HiTrash, HiEye, HiXMark, HiMapPin,
  HiCurrencyRupee, HiCloudArrowUp, HiChevronLeft, HiChevronRight,
  HiShieldCheck, HiPhone, HiEnvelope, HiBriefcase, HiBuildingLibrary,
  HiExclamationCircle, HiLockClosed,
} from 'react-icons/hi2'
import { Modal } from '../../../../components/ui/Modal.jsx'
import { Table } from '../../../../components/ui/Table.jsx'

// ─── Constants ────────────────────────────────────────────────────────────────
const DEPARTMENTS = ['Production', 'Warehouse', 'Security', 'Maintenance', 'Logistics', 'Housekeeping', 'Operations', 'Facilities']
const JOB_ROLES = ['General Labourer', 'Floor Supervisor', 'Loader', 'Security Guard', 'Cleaning Operative', 'Driver', 'Packer', 'Warehouse Operative', 'Site Assistant', 'Technician', 'Helper', 'Other']
const SUPERVISORS = ['Amit Joshi', 'Priya Mehta', 'Suresh Patil', 'Kavita Rane', 'Dinesh Kulkarni']
const SHIFTS = ['Morning (6AM–2PM)', 'Afternoon (2PM–10PM)', 'Night (10PM–6AM)', 'General (9AM–6PM)']
const AREAS_LIST = ['Pune Plant', 'Chinchwad Site', 'Warehouse Area', 'North Gate Zone', 'South Yard', 'Admin Block']
const ZONES_LIST = ['Gate A', 'Production Unit', 'Loading Dock', 'Storage Bay', 'Canteen Area', 'Parking Zone', 'Security Post']
const EMPLOYMENT_TYPES = ['Daily Paid (PAYE)', 'Daily Paid (Agency)', 'Zero Hours Contract']
const RELATIONSHIPS = ['Spouse / Partner', 'Parent', 'Sibling', 'Friend', 'Other']
const ACCOUNT_TYPES = ['Savings', 'Current', 'Salary']

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_WORKERS = [
  {
    id: 'DW-001', employeeCode: 'EMP-DW-001',
    firstName: 'Rahul', middleName: '', lastName: 'Sharma',
    dob: '1990-05-12', gender: 'Male', nationality: 'Indian',
    aadhaarNumber: '1234 5678 9012', workPermitRef: '',
    email: 'rahul.s@mail.com', mobile: '9876543210', alternatePhone: '',
    addressLine1: '14, MG Road', addressLine2: '',
    city: 'Pune', district: 'Pune', pincode: '411001',
    role: 'Floor Supervisor', department: 'Production', designation: 'Floor Supervisor',
    supervisor: 'Amit Joshi', employmentType: 'Daily Paid (PAYE)',
    dailyWage: 650, typicalHoursPerDay: 8, joiningDate: '2024-01-15', expectedEndDate: '',
    panNumber: 'ABCDE1234F', pfReferenceNo: 'MH/PUN/001234', shift: 'Morning (6AM–2PM)', status: 'Active',
    accountHolderName: 'Rahul Sharma', bankName: 'State Bank of India', branchName: 'MG Road', ifscCode: 'SBIN0001234', accountNumber: '12345678901', accountType: 'Savings',
    emergencyContactName: 'Sunita Sharma', emergencyRelationship: 'Spouse', emergencyPhone: '9876543211',
    areas: ['Pune Plant', 'Chinchwad Site'], zones: ['Gate A', 'Production Unit'], notes: '',
    sendCredentialsEmail: true, sendCredentialsSMS: false, requirePasswordChange: true,
  },
  {
    id: 'DW-002', employeeCode: 'EMP-DW-002',
    firstName: 'Sunita', middleName: '', lastName: 'Pawar',
    dob: '1995-08-22', gender: 'Female', nationality: 'Indian',
    aadhaarNumber: '9876 5432 1098', workPermitRef: '',
    email: 'sunita.p@mail.com', mobile: '9821345678', alternatePhone: '',
    addressLine1: '7, Shivaji Nagar', addressLine2: '',
    city: 'Pune', district: 'Pune', pincode: '411005',
    role: 'Packer', department: 'Warehouse', designation: 'Loader',
    supervisor: 'Priya Mehta', employmentType: 'Daily Paid (PAYE)',
    dailyWage: 520, typicalHoursPerDay: 8, joiningDate: '2024-03-01', expectedEndDate: '',
    panNumber: 'BCDEF2345G', pfReferenceNo: 'MH/PUN/002345', shift: 'General (9AM–6PM)', status: 'Active',
    accountHolderName: 'Sunita Pawar', bankName: 'Bank of Maharashtra', branchName: 'Shivaji Nagar', ifscCode: 'MAHB0001234', accountNumber: '23456789012', accountType: 'Savings',
    emergencyContactName: 'Ramesh Pawar', emergencyRelationship: 'Spouse', emergencyPhone: '9821345679',
    areas: ['Warehouse Area'], zones: ['Loading Dock', 'Storage Bay'], notes: '',
    sendCredentialsEmail: true, sendCredentialsSMS: false, requirePasswordChange: true,
  },
  {
    id: 'DW-003', employeeCode: 'EMP-DW-003',
    firstName: 'Manoj', middleName: '', lastName: 'Thakur',
    dob: '1988-12-01', gender: 'Male', nationality: 'Indian',
    aadhaarNumber: '4567 8901 2345', workPermitRef: '',
    email: 'manoj.t@mail.com', mobile: '9765432109', alternatePhone: '9765432100',
    addressLine1: '22, Kothrud', addressLine2: 'Near Paud Road',
    city: 'Pune', district: 'Pune', pincode: '411038',
    role: 'Security Guard', department: 'Security', designation: 'Security Guard',
    supervisor: 'Suresh Patil', employmentType: 'Daily Paid (Agency)',
    dailyWage: 580, typicalHoursPerDay: 12, joiningDate: '2023-11-20', expectedEndDate: '2025-11-19',
    panNumber: 'CDEFG3456H', pfReferenceNo: '', shift: 'Night (10PM–6AM)', status: 'Active',
    accountHolderName: 'Manoj Thakur', bankName: 'HDFC Bank', branchName: 'Kothrud', ifscCode: 'HDFC0001234', accountNumber: '34567890123', accountType: 'Salary',
    emergencyContactName: 'Geeta Thakur', emergencyRelationship: 'Parent', emergencyPhone: '9765432101',
    areas: ['North Gate Zone'], zones: ['Gate A', 'Security Post'], notes: 'Night shift guard — key access required.',
    sendCredentialsEmail: true, sendCredentialsSMS: true, requirePasswordChange: true,
  },
  {
    id: 'DW-004', employeeCode: 'EMP-DW-004',
    firstName: 'Anita', middleName: '', lastName: 'Desai',
    dob: '1992-03-18', gender: 'Female', nationality: 'Indian',
    aadhaarNumber: '2345 6789 0123', workPermitRef: '',
    email: 'anita.d@mail.com', mobile: '9654321098', alternatePhone: '',
    addressLine1: '5, Hadapsar', addressLine2: '',
    city: 'Pune', district: 'Pune', pincode: '411028',
    role: 'Cleaning Operative', department: 'Housekeeping', designation: 'Cleaner',
    supervisor: 'Kavita Rane', employmentType: 'Daily Paid (PAYE)',
    dailyWage: 480, typicalHoursPerDay: 8, joiningDate: '2023-06-10', expectedEndDate: '',
    panNumber: 'DEFGH4567I', pfReferenceNo: 'MH/PUN/004567', shift: 'General (9AM–6PM)', status: 'Inactive',
    accountHolderName: 'Anita Desai', bankName: 'Punjab National Bank', branchName: 'Hadapsar', ifscCode: 'PUNB0001234', accountNumber: '45678901234', accountType: 'Savings',
    emergencyContactName: 'Ramesh Desai', emergencyRelationship: 'Spouse', emergencyPhone: '9654321099',
    areas: ['Admin Block'], zones: ['Canteen Area'], notes: '',
    sendCredentialsEmail: true, sendCredentialsSMS: false, requirePasswordChange: true,
  },
  {
    id: 'DW-005', employeeCode: 'EMP-DW-005',
    firstName: 'Vijay', middleName: 'Kumar', lastName: 'Kadam',
    dob: '1986-07-25', gender: 'Male', nationality: 'Indian',
    aadhaarNumber: '3456 7890 1234', workPermitRef: '',
    email: 'vijay.k@mail.com', mobile: '9543210987', alternatePhone: '9543210988',
    addressLine1: '31, Viman Nagar', addressLine2: 'Phase 2',
    city: 'Pune', district: 'Pune', pincode: '411014',
    role: 'Driver', department: 'Logistics', designation: 'Driver',
    supervisor: 'Dinesh Kulkarni', employmentType: 'Daily Paid (PAYE)',
    dailyWage: 700, typicalHoursPerDay: 9, joiningDate: '2024-05-08', expectedEndDate: '',
    panNumber: 'EFGHI5678J', pfReferenceNo: 'MH/PUN/005678', shift: 'Afternoon (2PM–10PM)', status: 'Active',
    accountHolderName: 'Vijay Kumar Kadam', bankName: 'Axis Bank', branchName: 'Viman Nagar', ifscCode: 'UTIB0001234', accountNumber: '56789012345', accountType: 'Savings',
    emergencyContactName: 'Meena Kadam', emergencyRelationship: 'Spouse', emergencyPhone: '9543210989',
    areas: ['South Yard', 'Warehouse Area'], zones: ['Parking Zone', 'Loading Dock'], notes: '',
    sendCredentialsEmail: true, sendCredentialsSMS: false, requirePasswordChange: true,
  },
  {
    id: 'DW-006', employeeCode: 'EMP-DW-006',
    firstName: 'Rekha', middleName: '', lastName: 'Bhosale',
    dob: '1991-11-05', gender: 'Female', nationality: 'Indian',
    aadhaarNumber: '5678 9012 3456', workPermitRef: '',
    email: 'rekha.b@mail.com', mobile: '9432109876', alternatePhone: '',
    addressLine1: '9, Aundh', addressLine2: '',
    city: 'Pune', district: 'Pune', pincode: '411007',
    role: 'Warehouse Operative', department: 'Maintenance', designation: 'Technician',
    supervisor: 'Amit Joshi', employmentType: 'Daily Paid (PAYE)',
    dailyWage: 750, typicalHoursPerDay: 8, joiningDate: '2023-09-14', expectedEndDate: '',
    panNumber: 'FGHIJ6789K', pfReferenceNo: 'MH/PUN/006789', shift: 'Morning (6AM–2PM)', status: 'Active',
    accountHolderName: 'Rekha Bhosale', bankName: 'ICICI Bank', branchName: 'Aundh', ifscCode: 'ICIC0001234', accountNumber: '67890123456', accountType: 'Savings',
    emergencyContactName: 'Suresh Bhosale', emergencyRelationship: 'Spouse', emergencyPhone: '9432109877',
    areas: ['Pune Plant'], zones: ['Production Unit', 'Storage Bay'], notes: '',
    sendCredentialsEmail: true, sendCredentialsSMS: false, requirePasswordChange: true,
  },
  {
    id: 'DW-007', employeeCode: 'EMP-DW-007',
    firstName: 'Santosh', middleName: '', lastName: 'More',
    dob: '1998-02-14', gender: 'Male', nationality: 'Indian',
    aadhaarNumber: '6789 0123 4567', workPermitRef: '',
    email: 'santosh.m@mail.com', mobile: '9321098765', alternatePhone: '',
    addressLine1: '18, Pimpri', addressLine2: '',
    city: 'Pune', district: 'Pune', pincode: '411017',
    role: 'General Labourer', department: 'Production', designation: 'Helper',
    supervisor: 'Suresh Patil', employmentType: 'Zero Hours Contract',
    dailyWage: 430, typicalHoursPerDay: 8, joiningDate: '2024-06-01', expectedEndDate: '2024-12-31',
    panNumber: 'GHIJK7890L', pfReferenceNo: '', shift: 'Morning (6AM–2PM)', status: 'Active',
    accountHolderName: 'Santosh More', bankName: 'State Bank of India', branchName: 'Pimpri', ifscCode: 'SBIN0002345', accountNumber: '78901234567', accountType: 'Savings',
    emergencyContactName: 'Laxmi More', emergencyRelationship: 'Parent', emergencyPhone: '9321098766',
    areas: ['Chinchwad Site'], zones: ['Gate A'], notes: '',
    sendCredentialsEmail: false, sendCredentialsSMS: false, requirePasswordChange: true,
  },
  {
    id: 'DW-008', employeeCode: 'EMP-DW-008',
    firstName: 'Lata', middleName: '', lastName: 'Gaikwad',
    dob: '1993-09-30', gender: 'Female', nationality: 'Indian',
    aadhaarNumber: '7890 1234 5678', workPermitRef: '',
    email: 'lata.g@mail.com', mobile: '9210987654', alternatePhone: '',
    addressLine1: '2, Kondhwa', addressLine2: '',
    city: 'Pune', district: 'Pune', pincode: '411048',
    role: 'Cleaning Operative', department: 'Housekeeping', designation: 'Cleaner',
    supervisor: 'Kavita Rane', employmentType: 'Daily Paid (PAYE)',
    dailyWage: 460, typicalHoursPerDay: 8, joiningDate: '2023-04-22', expectedEndDate: '',
    panNumber: 'HIJKL8901M', pfReferenceNo: 'MH/PUN/008901', shift: 'General (9AM–6PM)', status: 'Inactive',
    accountHolderName: 'Lata Gaikwad', bankName: 'Canara Bank', branchName: 'Kondhwa', ifscCode: 'CNRB0001234', accountNumber: '89012345678', accountType: 'Savings',
    emergencyContactName: 'Prakash Gaikwad', emergencyRelationship: 'Spouse', emergencyPhone: '9210987655',
    areas: ['Admin Block'], zones: ['Canteen Area', 'Parking Zone'], notes: '',
    sendCredentialsEmail: true, sendCredentialsSMS: false, requirePasswordChange: true,
  },
]

const EMPTY_FORM = {
  // Personal
  firstName: '', middleName: '', lastName: '',
  dob: '', gender: '', nationality: '',
  aadhaarNumber: '', workPermitRef: '',
  // Contact
  email: '', mobile: '', alternatePhone: '',
  addressLine1: '', addressLine2: '',
  city: '', district: '', pincode: '',
  // Employment
  employeeCode: '', role: '', department: '', designation: '',
  supervisor: '', employmentType: 'Daily Paid (PAYE)',
  dailyWage: '', typicalHoursPerDay: '', joiningDate: '', expectedEndDate: '',
  panNumber: '', pfReferenceNo: '', shift: '', status: 'Active',
  // Bank
  accountHolderName: '', bankName: '', branchName: '', ifscCode: '', accountNumber: '', accountType: 'Savings',
  // Emergency
  emergencyContactName: '', emergencyRelationship: '', emergencyPhone: '',
  // Assignment
  areas: [], zones: [], notes: '',
  // Portal
  sendCredentialsEmail: true, sendCredentialsSMS: false, requirePasswordChange: true,
}

const TABS = ['Personal Details', 'Contact Info', 'Employment', 'Bank Details', 'Emergency Contact', 'Site Assignment', 'Portal Access']

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fullName(w) { return [w.firstName, w.middleName, w.lastName].filter(Boolean).join(' ') }
function maskedAadhaar(num) { if (!num) return '—'; const d = num.replace(/\s/g, ''); return d.length >= 4 ? `XXXX XXXX ${d.slice(-4)}` : num }

function InitialsAvatar({ name, size = 'sm' }) {
  const parts = (name || '').split(' ').filter(Boolean)
  const initials = parts.length >= 2 ? parts[0][0] + parts[1][0] : (parts[0]?.[0] ?? '?')
  const colors = ['bg-teal-100 text-teal-700', 'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700']
  const ci = name ? name.charCodeAt(0) % colors.length : 0
  const sz = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
  return <div className={`flex shrink-0 items-center justify-center rounded-full font-bold uppercase ${sz} ${colors[ci]}`}>{initials.toUpperCase()}</div>
}

function StatusBadge({ status }) {
  return status === 'Active'
    ? <span className="inline-flex items-center rounded-none bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Active</span>
    : <span className="inline-flex items-center rounded-none bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">Inactive</span>
}

function MultiSelectDropdown({ label, options, selected, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
  const toggle = (opt) => onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => !disabled && setOpen(v => !v)}
        className={`flex h-10 w-full items-center justify-between rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none transition ${disabled ? 'pointer-events-none opacity-70' : 'focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] hover:border-slate-300'}`}>
        <span className={selected.length === 0 ? 'text-slate-400' : 'text-slate-800 font-medium'}>
          {selected.length === 0 ? label : `${selected.length} selected`}
        </span>
        <HiChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-44 overflow-y-auto rounded-none border border-slate-200 bg-white shadow-lg">
          {options.map(opt => (
            <label key={opt} className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50">
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="h-3.5 w-3.5 accent-[#0F766E]" />
              <span className="text-slate-700">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WorkerList() {
  const navigate = useNavigate()
  const [workers, setWorkers] = useState(MOCK_WORKERS)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [selected, setSelected] = useState([])
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [editTarget, setEditTarget] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    if (!exportOpen) return
    const h = (e) => { if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [exportOpen])

  const filtered = workers.filter(w => {
    const fn = fullName(w).toLowerCase()
    const q = search.toLowerCase()
    return (!q || fn.includes(q) || w.id.toLowerCase().includes(q) || w.mobile.includes(q) || w.email.toLowerCase().includes(q))
      && (!filterRole || w.role === filterRole)
      && (!filterStatus || w.status === filterStatus)
      && (!filterDept || w.department === filterDept)
  })

  const stats = {
    total: workers.length,
    active: workers.filter(w => w.status === 'Active').length,
    inactive: workers.filter(w => w.status === 'Inactive').length,
    recent: workers.filter(w => new Date(w.joiningDate) >= new Date('2024-04-01')).length,
  }

  const toggleSelect = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleSelectAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(w => w.id))

  function openAdd() { setForm({ ...EMPTY_FORM }); setModalMode('add'); setActiveTab(0); setModalOpen(true) }
  function openEdit(w) { setForm({ ...w }); setEditTarget(w.id); setModalMode('edit'); setActiveTab(0); setModalOpen(true) }
  function openView(w) { setForm({ ...w }); setModalMode('view'); setActiveTab(0); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditTarget(null) }

  function handleSave() {
    if (modalMode === 'add') {
      const newId = `DW-${String(workers.length + 1).padStart(3, '0')}`
      setWorkers(p => [...p, { ...form, id: newId }])
    } else {
      setWorkers(p => p.map(w => w.id === editTarget ? { ...form, id: editTarget } : w))
    }
    closeModal()
  }
  function handleDelete(id) { setWorkers(p => p.filter(w => w.id !== id)); setDeleteTarget(null) }
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const ro = modalMode === 'view'

  const inp = `h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]${ro ? ' pointer-events-none opacity-70' : ''}`
  const sel = `h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] cursor-pointer${ro ? ' pointer-events-none opacity-70' : ''}`
  const lbl = 'mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500'
  const sec = 'mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#0F766E] pb-2 border-b border-slate-100'

  const autoUsername = form.email || `worker.${(form.firstName || 'user').toLowerCase()}@portal`
  const autoPassword = 'Ws#' + new Date().getFullYear() + '!xQ'

  const statCards = [
    { label: 'TOTAL WORKERS', count: stats.total, bg: 'bg-[#0F172A]', icon: HiUsers, filter: () => setFilterStatus('') },
    { label: 'ACTIVE', count: stats.active, bg: 'bg-[#10B981]', icon: HiCheckBadge, filter: () => setFilterStatus('Active') },
    { label: 'INACTIVE', count: stats.inactive, bg: 'bg-[#EF4444]', icon: HiUserCircle, filter: () => setFilterStatus('Inactive') },
    { label: 'NEW JOINERS', count: stats.recent, bg: 'bg-[#3B82F6]', icon: HiCalendar, filter: () => {} },
  ]

  const columns = [
    {
      key: 'select', label: <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="h-3.5 w-3.5 accent-[#0F766E]" />,
      render: (_, row) => <input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleSelect(row.id)} className="h-3.5 w-3.5 accent-[#0F766E]" />
    },
    { key: 'id', label: 'Worker ID', render: (_, row) => <span className="font-mono text-xs font-bold text-[#0F766E]">{row.id}</span> },
    {
      key: 'name', label: 'Worker', render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <InitialsAvatar name={fullName(row)} />
          <div>
            <p className="text-sm font-semibold text-slate-900">{fullName(row)}</p>
            <p className="text-[11px] text-slate-400">{row.email}</p>
          </div>
        </div>
      )
    },
    { key: 'aadhaar', label: 'Aadhaar', render: (_, row) => <span className="font-mono text-xs text-slate-600">{maskedAadhaar(row.aadhaarNumber)}</span> },
    { key: 'mobile', label: 'Mobile', render: (_, row) => <span className="text-sm font-medium text-slate-700">{row.mobile}</span> },
    { key: 'role', label: 'Role / Designation', render: (_, row) => <div><p className="text-sm font-medium text-slate-800">{row.role}</p><p className="text-[11px] text-slate-400">{row.department}</p></div> },
    { key: 'employmentType', label: 'Emp. Type', render: (_, row) => <span className="text-xs font-medium text-slate-600">{row.employmentType}</span> },
    {
      key: 'dailyWage', label: 'Daily Rate', render: (_, row) => (
        <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-800">
          <HiCurrencyRupee className="h-3.5 w-3.5 text-slate-500" />{Number(row.dailyWage).toLocaleString()}
        </span>
      )
    },
    {
      key: 'areas', label: 'Assigned Sites', render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          {row.areas.map(a => <span key={a} className="rounded-none bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100">{a}</span>)}
        </div>
      )
    },
    { key: 'joiningDate', label: 'Start Date', render: (_, row) => <span className="text-sm text-slate-600">{row.joiningDate ? new Date(row.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span> },
    { key: 'status', label: 'Status', render: (_, row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions', label: 'Actions', render: (_, row) => (
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => openView(row)} title="View" className="rounded-none p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><HiEye className="h-4 w-4" /></button>
          <button type="button" onClick={() => openEdit(row)} title="Edit" className="rounded-none p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><HiPencilSquare className="h-4 w-4" /></button>
          <button type="button" onClick={() => setDeleteTarget(row)} title="Delete" className="rounded-none p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><HiTrash className="h-4 w-4" /></button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Daily Wages Workers</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span>Workforce Management</span><span className="text-slate-400">&gt;</span><span className="text-slate-600">Worker List</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {selected.length > 0 && <span className="inline-flex items-center rounded-none border border-dashed border-[#0F766E] px-3 py-2 text-xs font-bold text-[#0F766E]">{selected.length} selected</span>}
          <div className="relative" ref={exportRef}>
            <button type="button" onClick={() => setExportOpen(v => !v)} className="inline-flex items-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 shadow-sm">
              <HiDocumentArrowDown className="h-4 w-4" />Export<HiChevronDown className={`h-4 w-4 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 z-20 mt-2 w-44 rounded-none border border-slate-200 bg-white py-1 shadow-lg">
                <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><HiDocumentArrowDown className="h-4 w-4 text-slate-500" />Export as Excel</button>
                <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><HiDocumentArrowDown className="h-4 w-4 text-slate-500" />Export as PDF</button>
              </div>
            )}
          </div>
          <button type="button" onClick={() => navigate('/admin/daily-wages/workers')} className="inline-flex items-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0c6b64] shadow-sm">
            <HiPlus className="h-4 w-4" />Add Worker
          </button>
        </div>
      </div>

      {/* Isolation notice */}
      <div className="flex items-start gap-3 rounded-none border border-amber-200 bg-amber-50 px-4 py-3">
        <HiExclamationCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
        <p className="text-xs font-medium text-amber-800">Daily wages attendance and payroll data is held in a separate record — it does <strong>not</strong> merge with the standard employee attendance or payroll system.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {statCards.map((card, idx) => {
          const isActive = (card.label === 'TOTAL WORKERS' && filterStatus === '') || (card.label === 'ACTIVE' && filterStatus === 'Active') || (card.label === 'INACTIVE' && filterStatus === 'Inactive')
          return (
            <button key={idx} type="button" onClick={card.filter}
              className={`group flex items-center gap-3.5 rounded-none border p-4 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] shadow-sm ${isActive ? 'border-[#0F766E] bg-slate-50/40 ring-1 ring-[#0F766E]' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bg} text-white shadow-sm`}><card.icon className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className={`text-[11px] font-bold uppercase tracking-wider truncate leading-none ${isActive ? 'text-[#0F766E]' : 'text-slate-400'}`}>{card.label}</div>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Workers Register</h2>
          <span className="text-xs font-medium text-teal-200">{filtered.length} records</span>
        </div>
        <div className="grid grid-cols-1 gap-3 border-b border-slate-200 px-4 py-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative">
            <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, ID, email…" className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium" />
          </div>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] cursor-pointer font-medium">
            <option value="">All Departments</option>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] cursor-pointer font-medium">
            <option value="">All Roles</option>{JOB_ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] cursor-pointer font-medium">
            <option value="">All Statuses</option><option>Active</option><option>Inactive</option>
          </select>
          <div className="flex items-center justify-end">
            <button type="button" onClick={() => { setSearch(''); setFilterDept(''); setFilterRole(''); setFilterStatus('') }} className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:border-slate-300 hover:text-slate-900">Reset Filters</button>
          </div>
        </div>
        <Table columns={columns} data={filtered} pageSize={8} square />
      </div>

      {/* ── Add / Edit / View Modal ────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={closeModal} size="employee"
        title={modalMode === 'add' ? 'Register Daily Wages Worker' : modalMode === 'edit' ? 'Edit Worker' : 'Worker Details'}
        bodyClassName="p-0">

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50">
          {TABS.map((tab, i) => (
            <button key={tab} type="button" onClick={() => setActiveTab(i)}
              className={`shrink-0 py-3 px-4 text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === i ? 'border-b-2 border-[#0F766E] bg-white text-[#0F766E]' : 'text-slate-400 hover:text-slate-600'}`}>
              {i + 1}. {tab}
            </button>
          ))}
        </div>

        <div className="max-h-[58vh] overflow-y-auto p-6">

          {/* Tab 0 — Personal Details */}
          {activeTab === 0 && (
            <div className="space-y-5">
              <p className={sec}><span>Personal Details</span></p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div><label className={lbl}>First Name <span className="text-red-500">*</span></label><input value={form.firstName} onChange={e => setField('firstName', e.target.value)} placeholder="e.g. Rahul" className={inp} /></div>
                <div><label className={lbl}>Middle Name</label><input value={form.middleName} onChange={e => setField('middleName', e.target.value)} placeholder="Optional" className={inp} /></div>
                <div><label className={lbl}>Surname <span className="text-red-500">*</span></label><input value={form.lastName} onChange={e => setField('lastName', e.target.value)} placeholder="e.g. Sharma" className={inp} /></div>
                <div><label className={lbl}>Date of Birth <span className="text-red-500">*</span></label><input type="date" value={form.dob} onChange={e => setField('dob', e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Gender</label>
                  <select value={form.gender} onChange={e => setField('gender', e.target.value)} className={sel}>
                    <option value="">Select</option><option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                  </select>
                </div>
                <div><label className={lbl}>Nationality</label><input value={form.nationality} onChange={e => setField('nationality', e.target.value)} placeholder="e.g. Indian" className={inp} /></div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={lbl}>Aadhaar Number <span className="text-red-500">*</span></label>
                  <input value={form.aadhaarNumber} onChange={e => setField('aadhaarNumber', e.target.value)} placeholder="XXXX XXXX XXXX" className={inp} />
                  <p className="mt-1 text-[11px] text-slate-400">12-digit unique identification number (e.g. 1234 5678 9012)</p>
                </div>
                <div>
                  <label className={lbl}>Work Permit / Authorization Ref</label>
                  <input value={form.workPermitRef} onChange={e => setField('workPermitRef', e.target.value)} placeholder="Permit or reference number" className={inp} />
                  <p className="mt-1 text-[11px] text-slate-400">For migrant workers or contract labour — leave blank if not applicable</p>
                </div>
              </div>
              <div>
                <label className={lbl}>Profile Photo</label>
                <div className={`flex items-center gap-4 rounded-none border-2 border-dashed border-slate-200 p-4 transition hover:border-slate-300 ${ro ? 'pointer-events-none opacity-70' : 'cursor-pointer'}`}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100"><HiCloudArrowUp className="h-5 w-5 text-slate-400" /></div>
                  <div><p className="text-sm font-semibold text-slate-700">Upload profile photo</p><p className="text-xs text-slate-400">PNG or JPG, max 2 MB</p></div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 1 — Contact Info */}
          {activeTab === 1 && (
            <div className="space-y-5">
              <p className={sec}><HiPhone className="h-3.5 w-3.5" /><span>Contact Information</span></p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={lbl}>Email Address <span className="text-red-500">*</span></label>
                  <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="worker@example.com" className={inp} />
                  <p className="mt-1 text-[11px] text-slate-400">Login credentials will be sent to this address</p>
                </div>
                <div><label className={lbl}>Mobile Number <span className="text-red-500">*</span></label><input type="tel" value={form.mobile} onChange={e => setField('mobile', e.target.value)} placeholder="+91 98765 43210" className={inp} /></div>
                <div><label className={lbl}>Alternate Phone</label><input type="tel" value={form.alternatePhone} onChange={e => setField('alternatePhone', e.target.value)} placeholder="Optional second number" className={inp} /></div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className={lbl}>Address Line 1</label><input value={form.addressLine1} onChange={e => setField('addressLine1', e.target.value)} placeholder="House number and street name" className={inp} /></div>
                <div><label className={lbl}>Address Line 2</label><input value={form.addressLine2} onChange={e => setField('addressLine2', e.target.value)} placeholder="Flat, building name (optional)" className={inp} /></div>
                <div><label className={lbl}>City / Town</label><input value={form.city} onChange={e => setField('city', e.target.value)} placeholder="e.g. Pune" className={inp} /></div>
                <div><label className={lbl}>District</label><input value={form.district} onChange={e => setField('district', e.target.value)} placeholder="e.g. Pune" className={inp} /></div>
                <div><label className={lbl}>PIN Code</label><input value={form.pincode} onChange={e => setField('pincode', e.target.value)} placeholder="e.g. 411001" className={inp} /></div>
              </div>
            </div>
          )}

          {/* Tab 2 — Employment */}
          {activeTab === 2 && (
            <div className="space-y-5">
              <p className={sec}><HiBriefcase className="h-3.5 w-3.5" /><span>Employment Details</span></p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div><label className={lbl}>Employee Code</label><input value={form.employeeCode} onChange={e => setField('employeeCode', e.target.value)} placeholder="EMP-DW-001" className={inp} /></div>
                <div>
                  <label className={lbl}>Job Role / Occupation <span className="text-red-500">*</span></label>
                  <select value={form.role} onChange={e => setField('role', e.target.value)} className={sel}>
                    <option value="">Select role</option>{JOB_ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Department</label>
                  <select value={form.department} onChange={e => setField('department', e.target.value)} className={sel}>
                    <option value="">Select</option>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Employment Type <span className="text-red-500">*</span></label>
                  <select value={form.employmentType} onChange={e => setField('employmentType', e.target.value)} className={sel}>
                    {EMPLOYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Supervisor</label>
                  <select value={form.supervisor} onChange={e => setField('supervisor', e.target.value)} className={sel}>
                    <option value="">Select Supervisor</option>{SUPERVISORS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Shift Assignment</label>
                  <select value={form.shift} onChange={e => setField('shift', e.target.value)} className={sel}>
                    <option value="">Select Shift</option>{SHIFTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label className={lbl}>Daily Rate (₹) <span className="text-red-500">*</span></label>
                  <input type="number" value={form.dailyWage} onChange={e => setField('dailyWage', e.target.value)} placeholder="0.00" className={inp} />
                  <p className="mt-1 text-[11px] text-slate-400">Gross, before deductions</p>
                </div>
                <div><label className={lbl}>Typical Hours / Day</label><input type="number" value={form.typicalHoursPerDay} onChange={e => setField('typicalHoursPerDay', e.target.value)} placeholder="8" min="1" max="12" className={inp} /></div>
                <div><label className={lbl}>Start Date <span className="text-red-500">*</span></label><input type="date" value={form.joiningDate} onChange={e => setField('joiningDate', e.target.value)} className={inp} /></div>
                <div>
                  <label className={lbl}>Expected End Date</label>
                  <input type="date" value={form.expectedEndDate} onChange={e => setField('expectedEndDate', e.target.value)} className={inp} />
                  <p className="mt-1 text-[11px] text-slate-400">Leave blank if open-ended</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={lbl}>PAN Number</label>
                  <input value={form.panNumber} onChange={e => setField('panNumber', e.target.value)} placeholder="e.g. ABCDE1234F" className={inp} />
                  <p className="mt-1 text-[11px] text-slate-400">Permanent Account Number (Income Tax)</p>
                </div>
                <div>
                  <label className={lbl}>PF / ESIC Reference No.</label>
                  <input value={form.pfReferenceNo} onChange={e => setField('pfReferenceNo', e.target.value)} placeholder="e.g. MH/PUN/001234" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Employment Status</label>
                  <select value={form.status} onChange={e => setField('status', e.target.value)} className={sel}>
                    <option>Active</option><option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3 — Bank Details */}
          {activeTab === 3 && (
            <div className="space-y-5">
              <p className={sec}><HiBuildingLibrary className="h-3.5 w-3.5" /><span>Bank Details (for wage payment)</span></p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className={lbl}>Account Holder Name</label><input value={form.accountHolderName} onChange={e => setField('accountHolderName', e.target.value)} placeholder="Full legal name on bank account" className={inp} /></div>
                <div><label className={lbl}>Bank Name</label><input value={form.bankName} onChange={e => setField('bankName', e.target.value)} placeholder="e.g. State Bank of India" className={inp} /></div>
                <div><label className={lbl}>Branch Name</label><input value={form.branchName} onChange={e => setField('branchName', e.target.value)} placeholder="e.g. MG Road, Pune" className={inp} /></div>
                <div>
                  <label className={lbl}>IFSC Code</label>
                  <input value={form.ifscCode} onChange={e => setField('ifscCode', e.target.value)} placeholder="e.g. SBIN0001234" className={inp} />
                  <p className="mt-1 text-[11px] text-slate-400">11-character bank branch identifier</p>
                </div>
                <div><label className={lbl}>Account Number</label><input value={form.accountNumber} onChange={e => setField('accountNumber', e.target.value)} placeholder="Account number" className={inp} /></div>
                <div>
                  <label className={lbl}>Account Type</label>
                  <select value={form.accountType} onChange={e => setField('accountType', e.target.value)} className={sel}>
                    {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4 — Emergency Contact */}
          {activeTab === 4 && (
            <div className="space-y-5">
              <p className={sec}><HiPhone className="h-3.5 w-3.5" /><span>Emergency Contact</span></p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div><label className={lbl}>Contact Name</label><input value={form.emergencyContactName} onChange={e => setField('emergencyContactName', e.target.value)} placeholder="Full name" className={inp} /></div>
                <div>
                  <label className={lbl}>Relationship</label>
                  <select value={form.emergencyRelationship} onChange={e => setField('emergencyRelationship', e.target.value)} className={sel}>
                    <option value="">Select</option>{RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>Phone Number</label><input type="tel" value={form.emergencyPhone} onChange={e => setField('emergencyPhone', e.target.value)} placeholder="+91 98765 43210" className={inp} /></div>
              </div>
            </div>
          )}

          {/* Tab 5 — Site Assignment */}
          {activeTab === 5 && (
            <div className="space-y-4">
              <p className={sec}><HiMapPin className="h-3.5 w-3.5" /><span>Site Assignment</span></p>
              <div>
                <label className={lbl}>Assigned Areas (Multi-Select)</label>
                <MultiSelectDropdown label="Select Areas…" options={AREAS_LIST} selected={form.areas} onChange={v => setField('areas', v)} disabled={ro} />
                {form.areas.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 rounded-none border border-slate-100 bg-slate-50 p-3">
                    {form.areas.map(a => (
                      <span key={a} className="inline-flex items-center gap-1 rounded-none border border-blue-200 bg-white px-2 py-1 text-xs font-semibold text-blue-700">
                        <HiMapPin className="h-3 w-3" />{a}
                        {!ro && <button type="button" onClick={() => setField('areas', form.areas.filter(x => x !== a))} className="ml-0.5 text-blue-400 hover:text-red-500"><HiXMark className="h-3 w-3" /></button>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className={lbl}>Assigned Geofencing Zones (Multi-Select)</label>
                <MultiSelectDropdown label="Select Zones…" options={ZONES_LIST} selected={form.zones} onChange={v => setField('zones', v)} disabled={ro} />
                {form.zones.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 rounded-none border border-slate-100 bg-slate-50 p-3">
                    {form.zones.map(z => (
                      <span key={z} className="inline-flex items-center gap-1 rounded-none border border-purple-200 bg-white px-2 py-1 text-xs font-semibold text-purple-700">
                        <HiMapPin className="h-3 w-3" />{z}
                        {!ro && <button type="button" onClick={() => setField('zones', form.zones.filter(x => x !== z))} className="ml-0.5 text-purple-400 hover:text-red-500"><HiXMark className="h-3 w-3" /></button>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className={lbl}>Notes</label>
                <textarea value={form.notes} onChange={e => setField('notes', e.target.value)} rows={3} placeholder="Additional notes or instructions…"
                  className={`w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] resize-none ${ro ? 'pointer-events-none opacity-70' : ''}`} />
              </div>
            </div>
          )}

          {/* Tab 6 — Portal Access */}
          {activeTab === 6 && (
            <div className="space-y-5">
              <p className={sec}><HiLockClosed className="h-3.5 w-3.5" /><span>Worker Portal Login Credentials</span></p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={lbl}>Username (auto-populated from email)</label>
                  <input type="text" value={autoUsername} disabled className="h-10 w-full rounded-none border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500 outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className={lbl}>Temporary Password (auto-generated)</label>
                  <input type="text" value={autoPassword} disabled className="h-10 w-full rounded-none border border-slate-200 bg-slate-100 px-3 text-sm font-mono text-slate-500 outline-none cursor-not-allowed" />
                  <p className="mt-1 text-[11px] text-slate-400">Worker will be prompted to change this on first login</p>
                </div>
              </div>
              <div className="space-y-3 rounded-none border border-slate-200 bg-slate-50 p-4">
                {[
                  { key: 'sendCredentialsEmail', label: 'Send login credentials to worker\'s email address immediately after saving' },
                  { key: 'sendCredentialsSMS', label: 'Also send a welcome SMS to worker\'s mobile number' },
                  { key: 'requirePasswordChange', label: 'Require password change on first login' },
                ].map(opt => (
                  <label key={opt.key} className={`flex items-center gap-3 text-sm text-slate-700 ${ro ? 'pointer-events-none opacity-70' : 'cursor-pointer'}`}>
                    <input type="checkbox" checked={!!form[opt.key]} onChange={e => setField(opt.key, e.target.checked)}
                      className="h-4 w-4 rounded accent-[#0F766E]" />
                    {opt.label}
                  </label>
                ))}
              </div>
              <div className="rounded-none border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-xs font-medium text-blue-800">
                  <HiShieldCheck className="mr-1.5 inline h-3.5 w-3.5" />
                  Portal URL: <strong>yourcompany.worksite.in/worker</strong> — Workers can check in / out and view their attendance using this login.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setActiveTab(t => Math.max(0, t - 1))} disabled={activeTab === 0}
              className="inline-flex items-center gap-1.5 rounded-none border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-white disabled:opacity-40">
              <HiChevronLeft className="h-3.5 w-3.5" />Prev
            </button>
            <span className="text-xs text-slate-400">{activeTab + 1} / {TABS.length}</span>
            <button type="button" onClick={() => setActiveTab(t => Math.min(TABS.length - 1, t + 1))} disabled={activeTab === TABS.length - 1}
              className="inline-flex items-center gap-1.5 rounded-none border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-white disabled:opacity-40">
              Next<HiChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={closeModal} className="rounded-none border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Cancel</button>
            {!ro && (
              <>
                <button type="button" onClick={handleSave} className="rounded-none border border-[#0F766E] px-4 py-2 text-sm font-semibold text-[#0F766E] hover:bg-teal-50">Save as Draft</button>
                <button type="button" onClick={handleSave} className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64]">
                  {modalMode === 'add' ? 'Save & Send Credentials' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm" title="Delete Worker">
        <div className="p-6">
          <p className="text-sm text-slate-600">Are you sure you want to delete <span className="font-bold text-slate-900">{deleteTarget ? fullName(deleteTarget) : ''}</span>? This action cannot be undone.</p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-none border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={() => handleDelete(deleteTarget?.id)} className="rounded-none bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
