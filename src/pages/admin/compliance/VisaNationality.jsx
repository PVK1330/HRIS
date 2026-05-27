import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import {
  HiArrowPath,
  HiArrowUpTray,
  HiBriefcase,
  HiChevronDown,
  HiChevronRight,
  HiClock,
  HiCreditCard,
  HiDocumentArrowDown,
  HiDocumentText,
  HiExclamationTriangle,
  HiEye,
  HiIdentification,
  HiMagnifyingGlass,
  HiPencilSquare,
  HiPlus,
  HiShieldCheck,
  HiTrash,
  HiCheckCircle,
} from 'react-icons/hi2'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Avatar } from '../../../components/ui/Avatar.jsx'
import { VisaDocUploadZone } from '../../../components/compliance/VisaDocUploadZone.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import { listEmployeesDropdown } from '../../../services/employeeService.js'
import {
  createVisaRecord,
  getVisaFilterOptions,
  getVisaRecord,
  getVisaRecordStats,
  listVisaRecords,
  updateVisaRecord,
} from '../../../services/visaRecordService.js'
import { createVisaType, deleteVisaType, listVisaTypes, updateVisaType } from '../../../services/visaTypeService.js'
import { triggerExport } from '../../../utils/exportHelper.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const initialForm = {
  employee_id: '',
  nationality: '',
  passport_number: '',
  passport_issue_date: '',
  passport_expiry_date: '',
  country_of_issue: '',
  visa_type_id: '',
  visa_number: '',
  visa_issue_date: '',
  visa_expiry_date: '',
  issued_by: '',
  sponsoring_entity: '',
  emirates_id_number: '',
  emirates_id_expiry: '',
}

function fileUrl(path) {
  if (!path) return ''
  if (String(path).startsWith('http')) return path
  return `${API_URL}${path}`
}

function formatDateDMY(d) {
  if (!d) return '—'
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return String(d).slice(0, 10)
  const dd = String(dt.getDate()).padStart(2, '0')
  const mon = dt.toLocaleString('en-GB', { month: 'short' })
  const yy = dt.getFullYear()
  return `${dd} ${mon} ${yy}`
}

/** Client-side status from visa expiry (per spec). */
function visaClientStatus(visaExpiry) {
  if (!visaExpiry) return { label: 'Valid', key: 'valid' }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(visaExpiry)
  d.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((d.getTime() - today.getTime()) / 86400000)
  if (diffDays < 0) return { label: 'Expired', key: 'expired' }
  if (diffDays <= 60) return { label: 'Expiring Soon', key: 'soon' }
  return { label: 'Valid', key: 'valid' }
}

function initials(name) {
  const p = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  const s = (p[0]?.[0] || '') + (p[1]?.[0] || p[0]?.[1] || '')
  return s.toUpperCase().slice(0, 2) || 'EM'
}

function errMsg(e) {
  const d = e?.response?.data
  if (Array.isArray(d?.errors) && d.errors.length) {
    return d.errors.map((x) => x.message).join('; ')
  }
  return d?.message || e?.message || 'Request failed'
}

const EXPIRY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: '30', label: 'Expiring in 30 days' },
  { value: '60', label: 'Expiring in 60 days' },
  { value: '90', label: 'Expiring in 90 days' },
  { value: 'expired', label: 'Already expired' },
]

/** Visa modal fields — unified min-height + padding (overrides Input’s py-2 via !py-2.5) */
const MODAL_INPUT =
  'box-border min-h-[2.75rem] w-full !rounded-md !border-slate-200 bg-white !px-3 !py-2.5 text-sm leading-normal text-slate-800 !shadow-sm outline-none transition placeholder:text-slate-400 focus:!border-[#0F766E] focus:!ring-1 focus:!ring-[#0F766E]/25 disabled:cursor-not-allowed disabled:bg-slate-50'
const MODAL_LABEL = 'mb-1 block text-xs font-semibold text-[#1f2a44]'

/** Decorative static sparkline (matches dashboard-style reference) */
function VisaStatSparkline({ className, stroke = '#F97316', variant = 0 }) {
  const paths = [
    'M1,18 L10.5,12 L20,17 L29.5,9 L39,14 L48.5,7 L58,11 L61,15',
    'M1,14 L11,20 L21,11 L31,16 L41,8 L51,13 L61,10',
    'M1,16 L12,22 L23,12 L34,19 L45,10 L56,15 L61,12',
    'M1,20 L11,13 L22,18 L33,9 L44,14 L55,6 L61,11',
  ]
  const d = paths[variant % paths.length]
  return (
    <svg viewBox="0 0 62 26" className={className} preserveAspectRatio="none" aria-hidden>
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export default function VisaNationality() {
  const { user } = useAuth()
  const isHR = user?.role === 'hr_admin' || user?.role === 'admin' || user?.role === 'superadmin'

  const [records, setRecords] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, valid: 0, expiringSoon: 0, expired: 0 })

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [dept, setDept] = useState('')
  const [location, setLocation] = useState('')
  const [visaType, setVisaType] = useState('')
  const [expiryWindow, setExpiryWindow] = useState('all')

  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    locations: [],
    visaTypes: [],
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialForm)
  const [formTab, setFormTab] = useState(1)
  const [uploadedFiles, setUploadedFiles] = useState({
    passport_scan: null,
    visa_copy: null,
    emirates_id_front: null,
    emirates_id_back: null,
  })
  const [submitting, setSubmitting] = useState(false)

  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [viewSection, setViewSection] = useState('passport')

  const [visaTypePanelOpen, setVisaTypePanelOpen] = useState(false)
  const [visaTypes, setVisaTypes] = useState([])
  const [vtLoading, setVtLoading] = useState(false)
  const [vtAdd, setVtAdd] = useState({ name: '', description: '', is_active: true })
  const [vtEditingId, setVtEditingId] = useState(null)
  const [vtEdit, setVtEdit] = useState({ name: '', description: '', is_active: true })

  const [employees, setEmployees] = useState([])
  const [employeeListLoading, setEmployeeListLoading] = useState(false)
  const [empSearch, setEmpSearch] = useState('')
  const [empDropdownOpen, setEmpDropdownOpen] = useState(false)
  const empFieldRef = useRef(null)

  const [exportOpen, setExportOpen] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const exportRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, dept, location, visaType, expiryWindow])

  const loadFilterOptions = useCallback(async () => {
    try {
      const data = await getVisaFilterOptions()
      setFilterOptions({
        departments: data?.departments ?? [],
        locations: data?.locations ?? [],
        visaTypes: data?.visaTypes ?? [],
      })
    } catch (e) {
      console.error(e)
    }
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const data = await getVisaRecordStats()
      setStats({
        total: data?.total ?? 0,
        valid: data?.valid ?? 0,
        expiringSoon: data?.expiringSoon ?? 0,
        expired: data?.expired ?? 0,
      })
    } catch (e) {
      console.error(e)
    }
  }, [])

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        search: debouncedSearch,
        department: dept,
        location,
        visaType: visaType || undefined,
        expiryWindow,
        sortBy: 'visa_expiry_date',
        sortOrder: 'asc',
      }
      const data = await listVisaRecords(params)
      setRecords(data?.records ?? [])
      setTotalRecords(data?.pagination?.total ?? 0)
    } catch (e) {
      console.error(e)
      toast.error(errMsg(e))
      setRecords([])
      setTotalRecords(0)
    } finally {
      setLoading(false)
    }
  }, [currentPage, debouncedSearch, dept, location, visaType, expiryWindow])

  useEffect(() => {
    loadFilterOptions()
  }, [loadFilterOptions])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  /** Full list from GET /employees/dropdown (no pagination); filter in UI with empSearch. */
  useEffect(() => {
    if (!modalOpen) return undefined
    let cancelled = false
    setEmployeeListLoading(true)
    ;(async () => {
      try {
        const data = await listEmployeesDropdown()
        const list = data?.employees ?? []
        if (!cancelled) setEmployees(Array.isArray(list) ? list : [])
      } catch (e) {
        if (!cancelled) {
          setEmployees([])
          toast.error(errMsg(e) || 'Could not load employees')
        }
      } finally {
        if (!cancelled) setEmployeeListLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [modalOpen])

  useEffect(() => {
    if (!empDropdownOpen) return undefined
    const onDown = (e) => {
      if (empFieldRef.current && !empFieldRef.current.contains(e.target)) {
        setEmpDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [empDropdownOpen])

  useEffect(() => {
    const onDoc = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false)
    }
    if (exportOpen) document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [exportOpen])

  const selectedEmployeeLabel = useMemo(() => {
    const id = Number(formData.employee_id)
    const em = employees.find((x) => Number(x.id) === id)
    if (!em) return ''
    const name = em.full_name || em.name || 'Employee'
    const eid = em.emp_id || em.empId || ''
    return `${name} (${eid})`
  }, [formData.employee_id, employees])

  /** Client filter over full list loaded from /employees/dropdown */
  const filteredEmployees = useMemo(() => {
    const q = empSearch.trim().toLowerCase()
    if (!q) return employees
    return employees.filter((e) => {
      const n = String(e.full_name || e.name || '').toLowerCase()
      const id = String(e.emp_id || e.empId || '').toLowerCase()
      return n.includes(q) || id.includes(q)
    })
  }, [employees, empSearch])

  const liveVisaBadge = useMemo(() => visaClientStatus(formData.visa_expiry_date), [formData.visa_expiry_date])

  const resetFilters = () => {
    setSearch('')
    setDept('')
    setLocation('')
    setVisaType('')
    setExpiryWindow('all')
  }

  const openAdd = () => {
    setEditMode(false)
    setEditingId(null)
    setFormData(initialForm)
    setFormTab(1)
    setUploadedFiles({
      passport_scan: null,
      visa_copy: null,
      emirates_id_front: null,
      emirates_id_back: null,
    })
    setEmpSearch('')
    setModalOpen(true)
  }

  const mapRecordToForm = (r) => ({
    employee_id: String(r.employee_id ?? ''),
    nationality: r.nationality ?? '',
    passport_number: r.passport_number ?? '',
    passport_issue_date: r.passport_issue_date ? String(r.passport_issue_date).slice(0, 10) : '',
    passport_expiry_date: r.passport_expiry_date ? String(r.passport_expiry_date).slice(0, 10) : '',
    country_of_issue: r.country_of_issue ?? '',
    visa_type_id: String(r.visa_type_id ?? ''),
    visa_number: r.visa_number ?? '',
    visa_issue_date: r.visa_issue_date ? String(r.visa_issue_date).slice(0, 10) : '',
    visa_expiry_date: r.visa_expiry_date ? String(r.visa_expiry_date).slice(0, 10) : '',
    issued_by: r.issued_by ?? '',
    sponsoring_entity: r.sponsoring_entity ?? '',
    emirates_id_number: r.emirates_id_number ?? '',
    emirates_id_expiry: r.emirates_id_expiry ? String(r.emirates_id_expiry).slice(0, 10) : '',
  })

  const openEdit = async (row, startTab = 1) => {
    try {
      const r = await getVisaRecord(row.id)
      setEditMode(true)
      setEditingId(r.id)
      setFormData(mapRecordToForm(r))
      setFormTab(startTab)
      setUploadedFiles({
        passport_scan: null,
        visa_copy: null,
        emirates_id_front: null,
        emirates_id_back: null,
      })
      setEmpSearch(r.full_name || '')
      setModalOpen(true)
    } catch (e) {
      toast.error(errMsg(e))
    }
  }

  const openView = async (row) => {
    try {
      const r = await getVisaRecord(row.id)
      setSelectedRecord(r)
      setViewSection('passport')
      setViewModalOpen(true)
    } catch (e) {
      toast.error(errMsg(e))
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditMode(false)
    setEditingId(null)
    setFormData(initialForm)
    setFormTab(1)
    setUploadedFiles({
      passport_scan: null,
      visa_copy: null,
      emirates_id_front: null,
      emirates_id_back: null,
    })
  }

  const validateTab = (tab) => {
    if (tab === 1) {
      if (!formData.employee_id) {
        toast.error('Select an employee.')
        return false
      }
      if (!formData.nationality?.trim()) {
        toast.error('Nationality is required.')
        return false
      }
      if (!formData.passport_number?.trim()) {
        toast.error('Passport number is required.')
        return false
      }
      if (!formData.passport_issue_date) {
        toast.error('Passport issue date is required.')
        return false
      }
      if (!formData.passport_expiry_date) {
        toast.error('Passport expiry date is required.')
        return false
      }
      if (!formData.country_of_issue?.trim()) {
        toast.error('Country of issue is required.')
        return false
      }
    }
    if (tab === 2) {
      if (!formData.visa_type_id) {
        toast.error('Visa type is required.')
        return false
      }
      if (!formData.visa_number?.trim()) {
        toast.error('Visa number is required.')
        return false
      }
      if (!formData.visa_issue_date) {
        toast.error('Visa issue date is required.')
        return false
      }
      if (!formData.visa_expiry_date) {
        toast.error('Visa expiry date is required.')
        return false
      }
    }
    if (tab === 4 && !editMode) {
      if (!uploadedFiles.passport_scan) {
        toast.error('Passport scan is required.')
        return false
      }
      if (!uploadedFiles.visa_copy) {
        toast.error('Visa copy is required.')
        return false
      }
    }
    return true
  }

  const goNext = () => {
    if (!validateTab(formTab)) return
    setFormTab((t) => Math.min(4, t + 1))
  }

  const goPrev = () => setFormTab((t) => Math.max(1, t - 1))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validateTab(1) || !validateTab(2) || !validateTab(4)) return
    setSubmitting(true)
    const body = {
      employee_id: Number(formData.employee_id),
      nationality: formData.nationality.trim(),
      passport_number: formData.passport_number.trim(),
      passport_issue_date: formData.passport_issue_date,
      passport_expiry_date: formData.passport_expiry_date,
      country_of_issue: formData.country_of_issue.trim(),
      visa_type_id: Number(formData.visa_type_id),
      visa_number: formData.visa_number.trim(),
      visa_issue_date: formData.visa_issue_date,
      visa_expiry_date: formData.visa_expiry_date,
      issued_by: formData.issued_by?.trim() || undefined,
      sponsoring_entity: formData.sponsoring_entity?.trim() || undefined,
      emirates_id_number: formData.emirates_id_number?.trim() || undefined,
      emirates_id_expiry: formData.emirates_id_expiry || undefined,
    }
    try {
      if (editMode) {
        await updateVisaRecord(editingId, body, uploadedFiles)
        toast.success('Record updated.')
      } else {
        await createVisaRecord(body, uploadedFiles)
        toast.success('Record created.')
      }
      closeModal()
      fetchRecords()
      loadStats()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setSubmitting(false)
    }
  }

  const runExport = async (type) => {
    const ext = type === 'pdf' ? 'pdf' : 'xlsx'
    const today = new Date().toISOString().slice(0, 10)
    const filename = `visa_records_${today}.${ext}`
    const filters = {
      search: debouncedSearch,
      department: dept,
      location,
      visaType: visaType || undefined,
      expiryWindow,
      sortBy: 'visa_expiry_date',
      sortOrder: 'asc',
    }
    setExportLoading(true)
    const tid = toast.loading('Preparing export…')
    try {
      await triggerExport('visa-records', filters, type, filename)
      toast.success('Export ready.', { id: tid })
    } catch (err) {
      console.error(err)
      toast.error('Export failed.', { id: tid })
    } finally {
      setExportLoading(false)
      setExportOpen(false)
    }
  }

  const loadVisaTypesPanel = async () => {
    try {
      setVtLoading(true)
      const data = await listVisaTypes({ status: 'all', limit: 200, page: 1 })
      setVisaTypes(data?.records ?? [])
    } catch (e) {
      toast.error(errMsg(e))
    } finally {
      setVtLoading(false)
    }
  }

  useEffect(() => {
    if (visaTypePanelOpen) loadVisaTypesPanel()
  }, [visaTypePanelOpen])

  const handleVtAdd = async (ev) => {
    ev.preventDefault()
    if (!vtAdd.name?.trim()) return toast.error('Name is required.')
    try {
      await createVisaType({
        name: vtAdd.name.trim(),
        description: vtAdd.description?.trim() || null,
        is_active: vtAdd.is_active,
      })
      toast.success('Visa type added.')
      setVtAdd({ name: '', description: '', is_active: true })
      loadVisaTypesPanel()
      loadFilterOptions()
    } catch (e) {
      toast.error(errMsg(e))
    }
  }

  const saveVtInline = async (id) => {
    try {
      await updateVisaType(id, {
        name: vtEdit.name.trim(),
        description: vtEdit.description?.trim() || null,
        is_active: vtEdit.is_active,
      })
      toast.success('Visa type updated.')
      setVtEditingId(null)
      loadVisaTypesPanel()
      loadFilterOptions()
    } catch (e) {
      toast.error(errMsg(e))
    }
  }

  const handleVtDelete = async (id) => {
    const r = await Swal.fire({
      title: 'Archive this visa type?',
      text: 'It will be marked inactive (soft delete).',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, archive',
    })
    if (!r.isConfirmed) return
    try {
      await deleteVisaType(id)
      toast.success('Visa type archived.')
      loadVisaTypesPanel()
      loadFilterOptions()
    } catch (e) {
      toast.error(errMsg(e))
    }
  }

  const rowBg = (row) => {
    const st = visaClientStatus(row.visa_expiry_date).key
    if (st === 'soon') return 'bg-[rgba(250,238,218,0.4)]'
    if (st === 'expired') return 'bg-[rgba(252,235,235,0.4)]'
    return ''
  }

  const columns = [
      {
        key: 'full_name',
        label: 'Employee Name',
        render: (_, row) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-[#0F766E] shadow-sm">
              {initials(row.full_name)}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{row.full_name || '—'}</div>
              <div className="text-[11px] font-medium text-slate-500">{row.emp_id || '—'}</div>
            </div>
          </div>
        ),
      },
      {
        key: 'emp_id',
        label: 'Emp ID',
        render: (v) => <span className="text-sm font-medium text-slate-700">{v || '—'}</span>,
      },
      {
        key: 'nationality',
        label: 'Nationality',
        render: (v) => <span className="text-sm text-slate-600">{v || '—'}</span>,
      },
      {
        key: 'passport_number',
        label: 'Passport Number',
        render: (v) => <span className="text-sm text-slate-700">{v || '—'}</span>,
      },
      {
        key: 'passport_expiry_date',
        label: 'Passport Expiry',
        render: (v) => <span className="text-sm text-slate-700">{formatDateDMY(v)}</span>,
      },
      {
        key: 'visa_type_display',
        label: 'Visa / Work Permit Type',
        render: (v, row) => (
          <span className="inline-flex rounded-none bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
            {v || row.visa_type_name || '—'}
          </span>
        ),
      },
      {
        key: 'visa_expiry_date',
        label: 'Visa Expiry',
        render: (v) => {
          const st = visaClientStatus(v)
          const warn = st.key !== 'valid'
          return (
            <span
              className={`inline-flex items-center gap-1 text-sm font-medium ${
                st.key === 'expired' ? 'text-red-600' : st.key === 'soon' ? 'text-orange-600' : 'text-slate-800'
              }`}
            >
              {warn ? <HiExclamationTriangle className="h-4 w-4 shrink-0" aria-hidden /> : null}
              {formatDateDMY(v)}
            </span>
          )
        },
      },
      {
        key: 'sponsoring_entity',
        label: 'Sponsoring Entity',
        render: (v) => (
          <span className="max-w-[160px] truncate text-sm text-slate-600" title={v || ''}>
            {v || '—'}
          </span>
        ),
      },
      {
        key: '_status',
        label: 'Status',
        render: (_, row) => {
          const st = visaClientStatus(row.visa_expiry_date)
          const cls =
            st.key === 'valid'
              ? 'bg-emerald-100 text-emerald-800'
              : st.key === 'soon'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-red-100 text-red-800'
          return (
            <span className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  st.key === 'valid' ? 'bg-emerald-500' : st.key === 'soon' ? 'bg-orange-500' : 'bg-red-500'
                }`}
              />
              {st.label}
            </span>
          )
        },
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (_, row) => (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openView(row)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
              aria-label="View"
            >
              <HiEye className="h-4 w-4" />
            </button>
            {isHR ? (
              <>
                <button
                  type="button"
                  onClick={() => openEdit(row, 1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-[#0F766E] text-white transition-colors hover:bg-[#0d5c56]"
                  aria-label="Edit"
                >
                  <HiPencilSquare className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(row, 4)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-sky-500 text-white transition-colors hover:bg-sky-600"
                  aria-label="Upload docs"
                >
                  <HiArrowUpTray className="h-4 w-4" />
                </button>
              </>
            ) : null}
          </div>
        ),
      },
    ]

  const viewStatus = selectedRecord ? visaClientStatus(selectedRecord.visa_expiry_date) : null

  const docCard = (label, url) => (
    <div
      key={label}
      className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-4 py-3"
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-800">{url ? 'Uploaded' : '—'}</p>
      </div>
      {url ? (
        <a
          href={fileUrl(url)}
          target="_blank"
          rel="noreferrer"
          className="rounded-none bg-[#0F766E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0d5c56]"
        >
          Download
        </a>
      ) : null}
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">

      {/* Top Title Bar with Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Visa & Nationality</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Compliance</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Visa & Nationality Records</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={exportRef}>
            <button
              type="button"
              disabled={exportLoading}
              onClick={() => setExportOpen((o) => !o)}
              className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 shadow-sm"
            >
              <HiDocumentArrowDown className="h-4 w-4" />
              Export
              <HiChevronDown className={`h-4 w-4 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
            </button>
            {exportOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-none border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  disabled={exportLoading}
                  onClick={() => runExport('pdf')}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <HiDocumentArrowDown className="h-4 w-4 text-slate-500" />
                  Export as PDF
                </button>
                <button
                  type="button"
                  disabled={exportLoading}
                  onClick={() => runExport('excel')}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <HiDocumentArrowDown className="h-4 w-4 text-slate-500" />
                  Export as Excel
                </button>
              </div>
            ) : null}
          </div>
          {isHR ? (
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
            >
              <HiPlus className="h-4 w-4" /> Add Record
            </button>
          ) : null}
        </div>
      </div>

      {/* Requested KPI Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          {
            label: 'TOTAL RECORDS',
            count: stats.total,
            bgColor: 'bg-[#0F172A]',
            icon: HiShieldCheck,
            onClickFilter: () => setExpiryWindow('all')
          },
          {
            label: 'ACTIVE VISAS',
            count: stats.valid,
            bgColor: 'bg-[#10B981]',
            icon: HiCheckCircle,
            onClickFilter: () => setExpiryWindow('all')
          },
          {
            label: 'EXPIRING SOON',
            count: stats.expiringSoon,
            bgColor: 'bg-[#F59E0B]',
            icon: HiClock,
            onClickFilter: () => setExpiryWindow('60')
          },
          {
            label: 'EXPIRED',
            count: stats.expired,
            bgColor: 'bg-[#EF4444]',
            icon: HiExclamationTriangle,
            onClickFilter: () => setExpiryWindow('expired')
          }
        ].map((card, idx) => {
          const isActiveFilter = 
            (card.label === 'TOTAL RECORDS' && expiryWindow === 'all') ||
            (card.label === 'EXPIRING SOON' && expiryWindow === '60') ||
            (card.label === 'EXPIRED' && expiryWindow === 'expired');

          return (
            <button
              key={idx}
              type="button"
              onClick={card.onClickFilter}
              title={`Filter by ${card.label}`}
              className={`group flex items-center gap-3.5 rounded-none border p-4 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] min-w-0 shadow-sm ${
                isActiveFilter
                  ? 'border-[#0F766E] bg-slate-50/40 ring-1 ring-[#0F766E]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-[11px] font-bold uppercase tracking-wider truncate leading-none ${isActiveFilter ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                  {card.label}
                </div>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main listing card */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0d5c56] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold tracking-wide text-white">Visa & nationality records</h2>
          <button
            type="button"
            onClick={() => {
              loadStats()
              fetchRecords()
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-white/90 hover:text-white"
          >
            <HiArrowPath className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="relative min-w-[200px] flex-1">
            <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or emp ID"
              className="h-10 w-full rounded-none border border-slate-200 bg-slate-50 px-3 pl-9 text-sm text-slate-700 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-2 focus:ring-[#0F766E]/10"
            />
          </div>
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="h-10 min-w-[160px] rounded-none border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-[#0F766E]"
          >
            <option value="">Department</option>
            {filterOptions.departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-10 min-w-[160px] rounded-none border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-[#0F766E]"
          >
            <option value="">Location</option>
            {filterOptions.locations.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={visaType}
            onChange={(e) => setVisaType(e.target.value)}
            className="h-10 min-w-[160px] rounded-none border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-[#0F766E]"
          >
            <option value="">Visa Type</option>
            {filterOptions.visaTypes.map((vt) => (
              <option key={vt.id} value={String(vt.id)}>
                {vt.name}
              </option>
            ))}
          </select>
          <select
            value={expiryWindow}
            onChange={(e) => setExpiryWindow(e.target.value)}
            className="h-10 min-w-[200px] rounded-none border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-[#0F766E]"
          >
            {EXPIRY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={resetFilters}
            className="h-10 rounded-none border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Reset Filters
          </button>
        </div>

        <Table
          columns={columns}
          data={records}
          pageSize={10}
          loading={loading}
          square
          totalCount={totalRecords}
          currentPage={currentPage - 1}
          onPageChange={(idx) => setCurrentPage(idx + 1)}
          rowClassName={rowBg}
        />
      </div>

      {/* Manage visa types */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setVisaTypePanelOpen((o) => !o)}
          className="flex w-full items-center justify-between border-b border-[#0d5c56] bg-[#0F766E] px-5 py-3 text-left transition-colors hover:bg-[#0c6b64]"
        >
          <span className="text-sm font-semibold tracking-wide text-white">Manage Visa Types</span>
          <HiChevronRight className={`h-5 w-5 shrink-0 text-white/90 transition-transform ${visaTypePanelOpen ? 'rotate-90' : ''}`} />
        </button>
        {visaTypePanelOpen ? (
          <div className="space-y-4 px-4 py-4">
            <form onSubmit={handleVtAdd} className="flex flex-wrap items-end gap-2 border-b border-slate-100 pb-4">
              <div className="min-w-[140px] flex-1">
                <label className="mb-1 block text-xs font-semibold text-[#1f2a44]">Name *</label>
                <input
                  value={vtAdd.name}
                  onChange={(e) => setVtAdd((p) => ({ ...p, name: e.target.value }))}
                  className="h-10 w-full rounded-none border border-slate-200 px-3 text-sm focus:border-[#0F766E]"
                  placeholder="Visa type name"
                />
              </div>
              <div className="min-w-[180px] flex-[2]">
                <label className="mb-1 block text-xs font-semibold text-[#1f2a44]">Description</label>
                <input
                  value={vtAdd.description}
                  onChange={(e) => setVtAdd((p) => ({ ...p, description: e.target.value }))}
                  className="h-10 w-full rounded-none border border-slate-200 px-3 text-sm focus:border-[#0F766E]"
                  placeholder="Optional"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={vtAdd.is_active}
                  onChange={(e) => setVtAdd((p) => ({ ...p, is_active: e.target.checked }))}
                />
                Active
              </label>
              <button
                type="submit"
                className="h-10 rounded-none bg-[#0F766E] px-4 text-sm font-semibold text-white hover:bg-[#0c6b64]"
              >
                Add
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-slate-600">#</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-slate-600">Visa Type Name</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-slate-600">Description</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-slate-600">Status</th>
                    <th className="px-3 py-2 text-center text-xs font-bold uppercase text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vtLoading ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                        Loading…
                      </td>
                    </tr>
                  ) : (
                    visaTypes.map((vt, idx) =>
                      vtEditingId === vt.id ? (
                        <tr key={vt.id} className="bg-indigo-50/40">
                          <td className="px-3 py-2 text-slate-500">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <input
                              value={vtEdit.name}
                              onChange={(e) => setVtEdit((p) => ({ ...p, name: e.target.value }))}
                              className="h-9 w-full rounded-none border border-slate-200 px-2 text-sm"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={vtEdit.description}
                              onChange={(e) => setVtEdit((p) => ({ ...p, description: e.target.value }))}
                              className="h-9 w-full rounded-none border border-slate-200 px-2 text-sm"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={vtEdit.is_active}
                                onChange={(e) => setVtEdit((p) => ({ ...p, is_active: e.target.checked }))}
                              />
                              Active
                            </label>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => saveVtInline(vt.id)}
                                className="rounded-none bg-[#0F766E] px-3 py-1 text-xs font-semibold text-white"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setVtEditingId(null)}
                                className="rounded-none border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={vt.id}>
                          <td className="px-3 py-2 text-slate-500">{idx + 1}</td>
                          <td className="px-3 py-2 font-medium text-slate-900">{vt.name}</td>
                          <td className="max-w-[240px] truncate px-3 py-2 text-slate-600" title={vt.description || ''}>
                            {vt.description || '—'}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex rounded-none px-2 py-0.5 text-[10px] font-semibold ${
                                vt.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {vt.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex justify-center gap-2">
                              {isHR ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setVtEditingId(vt.id)
                                      setVtEdit({
                                        name: vt.name || '',
                                        description: vt.description || '',
                                        is_active: !!vt.is_active,
                                      })
                                    }}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-sky-500 text-white hover:bg-sky-600"
                                    aria-label="Edit visa type"
                                  >
                                    <HiPencilSquare className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleVtDelete(vt.id)}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white hover:bg-red-600"
                                    aria-label="Delete visa type"
                                  >
                                    <HiTrash className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                '—'
                              )}
                            </div>
                          </td>
                        </tr>
                      ),
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      {/* Add / Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        size="visa"
        showClose
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">
              {editMode ? 'Edit Visa & Nationality Record' : 'Add Visa & Nationality Record'}
            </h2>
            {selectedEmployeeLabel ? (
              <p className="text-xs font-medium text-slate-500">{selectedEmployeeLabel}</p>
            ) : null}
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4 pt-1 [&_input]:min-h-[2.75rem] [&_select]:min-h-[2.75rem]">
          <div className="-mx-1 flex gap-4 overflow-x-auto border-b border-slate-200 pb-px text-sm font-medium whitespace-nowrap [scrollbar-width:thin]">
            {['Passport', 'Visa Details', 'Emirates ID', 'Documents'].map((label, i) => {
              const n = i + 1
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setFormTab(n)}
                  className={`border-b-2 px-2 py-2 transition ${
                    formTab === n ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {formTab === 1 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div ref={empFieldRef} className="relative sm:col-span-2">
                <label htmlFor="visa-emp-search" className={MODAL_LABEL}>
                  Employee *
                </label>
                <div className="relative">
                  <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="visa-emp-search"
                    type="text"
                    value={empSearch}
                    disabled={editMode}
                    onChange={(e) => {
                      setEmpSearch(e.target.value)
                      setEmpDropdownOpen(true)
                    }}
                    onFocus={() => !editMode && setEmpDropdownOpen(true)}
                    placeholder="Search by employee name or ID…"
                    autoComplete="off"
                    className={`${MODAL_INPUT} pl-9`}
                  />
                </div>
                {empDropdownOpen && !editMode ? (
                  <div className="absolute left-0 right-0 z-30 mt-1 max-h-56 overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5">
                    {employeeListLoading ? (
                      <p className="px-3 py-3 text-center text-xs text-slate-500">Loading employees…</p>
                    ) : employees.length === 0 ? (
                      <p className="px-3 py-3 text-center text-xs text-slate-500">No employees found.</p>
                    ) : filteredEmployees.length === 0 ? (
                      <p className="px-3 py-3 text-center text-xs text-slate-500">
                        No matches for &quot;{empSearch.trim()}&quot;. Try a different name or ID.
                      </p>
                    ) : (
                      filteredEmployees.map((em) => {
                        const name = em.full_name || em.name || '—'
                        const eid = em.emp_id || em.empId || '—'
                        return (
                          <button
                            key={em.id}
                            type="button"
                            className="grid w-full grid-cols-[1fr_auto] items-center gap-2 px-3 py-2 text-left text-sm hover:bg-emerald-50/80"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setFormData((p) => ({ ...p, employee_id: String(em.id) }))
                              setEmpSearch(`${name} (${eid})`)
                              setEmpDropdownOpen(false)
                            }}
                          >
                            <span className="min-w-0 truncate font-medium text-slate-900" title={name}>
                              {name}
                            </span>
                            <span
                              className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-600"
                              title={`Emp ID: ${eid}`}
                            >
                              {eid}
                            </span>
                          </button>
                        )
                      })
                    )}
                  </div>
                ) : null}
              </div>
              <Input
                label="Nationality *"
                name="nationality"
                placeholder="e.g. United Arab Emirates"
                value={formData.nationality}
                onChange={(e) => setFormData((p) => ({ ...p, nationality: e.target.value }))}
                required
                inputClassName={MODAL_INPUT}
                labelClassName={MODAL_LABEL}
              />
              <Input
                label="Passport Number *"
                name="passport_number"
                placeholder="Passport document number"
                value={formData.passport_number}
                onChange={(e) => setFormData((p) => ({ ...p, passport_number: e.target.value }))}
                required
                inputClassName={MODAL_INPUT}
                labelClassName={MODAL_LABEL}
              />
              <Input
                label="Passport Issue Date *"
                name="passport_issue_date"
                type="date"
                value={formData.passport_issue_date}
                onChange={(e) => setFormData((p) => ({ ...p, passport_issue_date: e.target.value }))}
                required
                inputClassName={MODAL_INPUT}
                labelClassName={MODAL_LABEL}
              />
              <Input
                label="Passport Expiry Date *"
                name="passport_expiry_date"
                type="date"
                value={formData.passport_expiry_date}
                onChange={(e) => setFormData((p) => ({ ...p, passport_expiry_date: e.target.value }))}
                required
                inputClassName={MODAL_INPUT}
                labelClassName={MODAL_LABEL}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Country of Issue *"
                  name="country_of_issue"
                  placeholder="Country that issued the passport"
                  value={formData.country_of_issue}
                  onChange={(e) => setFormData((p) => ({ ...p, country_of_issue: e.target.value }))}
                  required
                  inputClassName={MODAL_INPUT}
                  labelClassName={MODAL_LABEL}
                />
              </div>
            </div>
          ) : null}

          {formTab === 2 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Visa Type *"
                name="visa_type_id"
                type="select"
                placeholder="Choose visa type"
                value={formData.visa_type_id}
                onChange={(e) => setFormData((p) => ({ ...p, visa_type_id: e.target.value }))}
                required
                options={filterOptions.visaTypes.map((vt) => ({ label: vt.name, value: String(vt.id) }))}
                inputClassName={MODAL_INPUT}
                labelClassName={MODAL_LABEL}
              />
              <Input
                label="Visa Number *"
                name="visa_number"
                placeholder="Visa / permit reference number"
                value={formData.visa_number}
                onChange={(e) => setFormData((p) => ({ ...p, visa_number: e.target.value }))}
                required
                inputClassName={MODAL_INPUT}
                labelClassName={MODAL_LABEL}
              />
              <Input
                label="Visa Issue Date *"
                name="visa_issue_date"
                type="date"
                value={formData.visa_issue_date}
                onChange={(e) => setFormData((p) => ({ ...p, visa_issue_date: e.target.value }))}
                required
                inputClassName={MODAL_INPUT}
                labelClassName={MODAL_LABEL}
              />
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#1f2a44]">Visa Expiry Date *</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      liveVisaBadge.key === 'valid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : liveVisaBadge.key === 'soon'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {liveVisaBadge.label}
                  </span>
                </div>
                <input
                  type="date"
                  value={formData.visa_expiry_date}
                  onChange={(e) => setFormData((p) => ({ ...p, visa_expiry_date: e.target.value }))}
                  required
                  title="Select visa expiry date"
                  className={MODAL_INPUT}
                />
              </div>
              <Input
                label="Issued By"
                name="issued_by"
                placeholder="Authority or office (optional)"
                value={formData.issued_by}
                onChange={(e) => setFormData((p) => ({ ...p, issued_by: e.target.value }))}
                inputClassName={MODAL_INPUT}
                labelClassName={MODAL_LABEL}
              />
              <Input
                label="Sponsoring Entity"
                name="sponsoring_entity"
                placeholder="Company or sponsor name (optional)"
                value={formData.sponsoring_entity}
                onChange={(e) => setFormData((p) => ({ ...p, sponsoring_entity: e.target.value }))}
                inputClassName={MODAL_INPUT}
                labelClassName={MODAL_LABEL}
              />
            </div>
          ) : null}

          {formTab === 3 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Emirates ID Number"
                name="emirates_id_number"
                placeholder="EID number (optional)"
                value={formData.emirates_id_number}
                onChange={(e) => setFormData((p) => ({ ...p, emirates_id_number: e.target.value }))}
                inputClassName={MODAL_INPUT}
                labelClassName={MODAL_LABEL}
              />
              <Input
                label="Emirates ID Expiry"
                name="emirates_id_expiry"
                type="date"
                value={formData.emirates_id_expiry}
                onChange={(e) => setFormData((p) => ({ ...p, emirates_id_expiry: e.target.value }))}
                inputClassName={MODAL_INPUT}
                labelClassName={MODAL_LABEL}
              />
            </div>
          ) : null}

          {formTab === 4 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <VisaDocUploadZone
                label="Passport Scan"
                required={!editMode}
                file={uploadedFiles.passport_scan}
                onChange={(f) => setUploadedFiles((p) => ({ ...p, passport_scan: f }))}
              />
              <VisaDocUploadZone
                label="Visa Copy"
                required={!editMode}
                file={uploadedFiles.visa_copy}
                onChange={(f) => setUploadedFiles((p) => ({ ...p, visa_copy: f }))}
              />
              <VisaDocUploadZone
                label="Emirates ID Front"
                file={uploadedFiles.emirates_id_front}
                onChange={(f) => setUploadedFiles((p) => ({ ...p, emirates_id_front: f }))}
              />
              <VisaDocUploadZone
                label="Emirates ID Back"
                file={uploadedFiles.emirates_id_back}
                onChange={(f) => setUploadedFiles((p) => ({ ...p, emirates_id_back: f }))}
              />
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
            >
              Cancel
            </button>
            {formTab > 1 ? (
              <button
                type="button"
                onClick={goPrev}
                className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
              >
                Previous
              </button>
            ) : null}
            {formTab < 4 ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex h-9 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#0c6b64]"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-9 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#0c6b64] disabled:opacity-60"
              >
                {submitting ? 'Saving…' : 'Save Record'}
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* View modal */}
      {selectedRecord ? (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false)
            setSelectedRecord(null)
          }}
          size="xl"
          showClose
          header={
            <div className="flex items-start gap-4">
              <Avatar name={selectedRecord.full_name} size="lg" />
              <div>
                <h2 className="text-base font-semibold text-slate-900">{selectedRecord.full_name}</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {selectedRecord.emp_id || '—'} · {selectedRecord.nationality || '—'}
                </p>
                {viewStatus ? (
                  <span
                    className={`mt-2 inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-xs font-semibold ${
                      viewStatus.key === 'valid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : viewStatus.key === 'soon'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {viewStatus.label}
                  </span>
                ) : null}
              </div>
            </div>
          }
        >
          <div className="divide-y divide-slate-100">
            {[
              {
                id: 'passport',
                label: 'Passport Info',
                iconBg: 'bg-blue-50',
                iconColor: 'text-blue-600',
                icon: <HiIdentification className="h-4 w-4" />,
                content: (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {[
                      ['Nationality', selectedRecord.nationality],
                      ['Passport Number', selectedRecord.passport_number],
                      ['Issue Date', formatDateDMY(selectedRecord.passport_issue_date)],
                      ['Expiry Date', formatDateDMY(selectedRecord.passport_expiry_date)],
                      ['Country of Issue', selectedRecord.country_of_issue],
                    ].map(([a, b]) => (
                      <div key={a}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{a}</p>
                        <p className="mt-0.5 text-sm font-medium text-slate-900">{b || '—'}</p>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                id: 'visa',
                label: 'Visa Details',
                iconBg: 'bg-teal-50',
                iconColor: 'text-teal-700',
                icon: <HiBriefcase className="h-4 w-4" />,
                content: (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {[
                      ['Visa Type', selectedRecord.visa_type_display || selectedRecord.visa_type_name],
                      ['Visa Number', selectedRecord.visa_number],
                      ['Issue Date', formatDateDMY(selectedRecord.visa_issue_date)],
                      ['Expiry Date', formatDateDMY(selectedRecord.visa_expiry_date)],
                      ['Issued By', selectedRecord.issued_by],
                      ['Sponsoring Entity', selectedRecord.sponsoring_entity],
                    ].map(([a, b]) => (
                      <div key={a}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{a}</p>
                        <p className="mt-0.5 text-sm font-medium text-slate-900">{b || '—'}</p>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                id: 'eid',
                label: 'Emirates ID',
                iconBg: 'bg-amber-50',
                iconColor: 'text-amber-700',
                icon: <HiCreditCard className="h-4 w-4" />,
                content: (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {[
                      ['Emirates ID Number', selectedRecord.emirates_id_number],
                      ['Expiry', formatDateDMY(selectedRecord.emirates_id_expiry)],
                    ].map(([a, b]) => (
                      <div key={a}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{a}</p>
                        <p className="mt-0.5 text-sm font-medium text-slate-900">{b || '—'}</p>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                id: 'docs',
                label: 'Documents',
                iconBg: 'bg-green-50',
                iconColor: 'text-green-700',
                icon: <HiDocumentText className="h-4 w-4" />,
                content: (
                  <div className="grid gap-2">
                    {docCard('Passport Scan', selectedRecord.passport_scan_url)}
                    {docCard('Visa Copy', selectedRecord.visa_copy_url)}
                    {docCard('Emirates ID Front', selectedRecord.emirates_id_front_url)}
                    {docCard('Emirates ID Back', selectedRecord.emirates_id_back_url)}
                  </div>
                ),
              },
            ].map((sec) => {
              const open = viewSection === sec.id
              return (
                <div key={sec.id} className="border-b border-slate-100 last:border-0">
                  <button
                    type="button"
                    onClick={() => setViewSection(open ? '' : sec.id)}
                    className="flex w-full items-center justify-between px-0 py-3.5 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-md ${sec.iconBg} ${sec.iconColor}`}>
                        {sec.icon}
                      </div>
                      <span className="text-sm font-medium text-slate-800">{sec.label}</span>
                    </div>
                    <HiChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open ? <div className="pb-5 pt-1">{sec.content}</div> : null}
                </div>
              )
            })}
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
