import { useMemo, useState, useCallback } from 'react' // Refreshed UI version
import { HiArrowDownTray, HiArrowPath } from 'react-icons/hi2'
import { useAuth } from '../../../context/AuthContext.jsx'
import {
  employees,
  mandatoryDocumentTypes,
  optionalDocumentUploadTypes,
  initialDocumentSubmissions,
  initialDocumentAuditLog,
} from '../../../data/mockData.js'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const uploadTypeOptions = [...mandatoryDocumentTypes, ...optionalDocumentUploadTypes]

const clone = (x) => JSON.parse(JSON.stringify(x))

function nextSubmissionId() {
  return `ds-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function nextAuditId() {
  return `da-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function formatAuditClock(iso) {
  try {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

function maxVersionFor(submissions, employeeId, docType) {
  const v = submissions
    .filter((s) => s.employeeId === employeeId && s.docType === docType)
    .map((s) => s.version)
  return v.length ? Math.max(...v) : 0
}

/** Best status for mandatory checklist cell for one document type */
function checklistStatusForType(submissions, employeeId, docType) {
  const rows = submissions
    .filter((s) => s.employeeId === employeeId && s.docType === docType)
    .sort((a, b) => b.version - a.version)
  if (!rows.length) return 'missing'
  const latest = rows[0]
  if (latest.status === 'Submitted') return 'approved'
  if (latest.status === 'Rejected') return 'rejected'
  return 'pending'
}

function resolveSelfEmployee(authUser) {
  if (!authUser) return null
  return (
    employees.find((e) => e.email?.toLowerCase() === authUser.email?.toLowerCase()) ||
    employees.find((e) => e.name === authUser.name) ||
    null
  )
}

export default function Documents() {
  const { user } = useAuth()
  const isHrReviewer = user?.role === 'hr_admin' || user?.role === 'hr_executive'
  const isManager = user?.role === 'manager'

  const selfEmployee = useMemo(() => resolveSelfEmployee(user), [user])

  const visibleEmployees = useMemo(() => {
    // For mock demonstration, if no user is logged in, show all employees
    if (!user) return [...employees]
    if (isHrReviewer) return [...employees]
    if (isManager && user.department) {
      return employees.filter((e) => e.department === user.department)
    }
    if (selfEmployee) return [selfEmployee]
    return [...employees] // Fallback to all for sample
  }, [user, isHrReviewer, isManager, selfEmployee])

  const [submissions, setSubmissions] = useState(() => clone(initialDocumentSubmissions))
  const [auditLog, setAuditLog] = useState(() => clone(initialDocumentAuditLog))

  const [checklistEmployeeId, setChecklistEmployeeId] = useState('')

  const resolvedChecklistEmployeeId = useMemo(() => {
    const allowed = visibleEmployees.map((e) => e.id)
    if (checklistEmployeeId && allowed.includes(checklistEmployeeId)) return checklistEmployeeId
    return visibleEmployees[0]?.id ?? ''
  }, [visibleEmployees, checklistEmployeeId])

  const [q, setQ] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadMode, setUploadMode] = useState('create')
  const [replaceCtx, setReplaceCtx] = useState(null)
  const [formData, setFormData] = useState({
    employeeId: '',
    documentType: '',
    documentTitle: '',
    documentNumber: '',
    issueDate: '',
    expiryDate: '',
    issuedBy: '',
    notes: '',
  })
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState('') // 'Approve' or 'Reject'
  const [actionReason, setActionReason] = useState('')
  const [selectedRow, setSelectedRow] = useState(null)
  const [files, setFiles] = useState({})

  const [viewSubmission, setViewSubmission] = useState(null)
  const [activeTab, setActiveTab] = useState('pending')

  const pushAudit = useCallback((detail, actor) => {
    const entry = {
      id: nextAuditId(),
      at: new Date().toISOString(),
      actor: actor || user?.name || 'User',
      detail,
    }
    setAuditLog((prev) => [entry, ...prev])
  }, [user])

  const [inlineComments, setInlineComments] = useState({})

  const visibleSubmissions = useMemo(() => {
    const ids = new Set(visibleEmployees.map((e) => e.id))
    return submissions.filter((s) => ids.has(s.employeeId))
  }, [submissions, visibleEmployees])

  const deptOptions = useMemo(() => {
    const u = [...new Set(visibleSubmissions.map((s) => s.department))].sort()
    return [{ value: '', label: 'All departments' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [visibleSubmissions])

  const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Submitted', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Correction', label: 'Correction Required' },
  ]

  const [approvedDateFilter, setApprovedDateFilter] = useState('')
  const [approvedTypeFilter, setApprovedTypeFilter] = useState('')

  const docTypeOptions = useMemo(() => {
    return [{ value: '', label: 'All types' }, ...uploadTypeOptions.map(t => ({ value: t, label: t }))]
  }, [])



  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return visibleSubmissions.filter((r) => {
      if (query && !`${r.employee} ${r.empId} ${r.docType}`.toLowerCase().includes(query)) return false
      if (deptFilter && r.department !== deptFilter) return false
      if (statusFilter && r.status !== statusFilter) return false
      if (approvedDateFilter && r.submittedDate !== approvedDateFilter) return false
      if (approvedTypeFilter && r.docType !== approvedTypeFilter) return false
      return true
    })
  }, [q, deptFilter, statusFilter, approvedDateFilter, approvedTypeFilter, visibleSubmissions])

  const checklistStatuses = useMemo(() => {
    if (!checklistEmployeeId) return []
    return mandatoryDocumentTypes.map((docType) => ({
      docType,
      state: checklistStatusForType(submissions, checklistEmployeeId, docType),
    }))
  }, [submissions, checklistEmployeeId])

  const checklistEmployeeName = useMemo(() => {
    const e = employees.find((emp) => emp.id === checklistEmployeeId)
    return e?.name ?? ''
  }, [checklistEmployeeId])

  /** Latest rows only per employee + type for version panel (top N groups) */
  const versionSnapshots = useMemo(() => {
    const map = new Map()
    visibleSubmissions.forEach((s) => {
      const key = `${s.employeeId}:::${s.docType}`
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(s)
    })
    const chains = [...map.entries()].map(([, rows]) => {
      const sorted = [...rows].sort((a, b) => b.version - a.version)
      return sorted.map((row, idx) => ({
        ...row,
        archived: idx > 0,
      }))
    })
    const flat = chains.flatMap((chain) =>
      chain.slice(0, 2).map((row) => ({
        ...row,
        label: `${row.docType} — ${row.employee}`,
      })),
    )
    return flat.slice(0, 8)
  }, [visibleSubmissions])

  const openCreateUpload = () => {
    setUploadMode('create')
    setReplaceCtx(null)
    let defaultEmp = ''
    if (visibleEmployees.length === 1) defaultEmp = visibleEmployees[0].id
    if (user?.role === 'employee' && selfEmployee) defaultEmp = selfEmployee.id
    setFormData({
      employeeId: defaultEmp,
      documentType: '',
      documentTitle: '',
      documentNumber: '',
      issueDate: '',
      expiryDate: '',
      issuedBy: '',
      notes: '',
    })
    setFiles({})
    setUploadModalOpen(true)
  }

  const openReplaceUpload = (row) => {
    setUploadMode('replace')
    const nextVer = maxVersionFor(submissions, row.employeeId, row.docType) + 1
    setReplaceCtx({ employeeId: row.employeeId, docType: row.docType, nextVersion: nextVer })
    setFormData({
      employeeId: row.employeeId,
      documentType: row.docType,
      documentTitle: `${row.docType} — replaced`,
      documentNumber: '',
      issueDate: '',
      expiryDate: '',
      issuedBy: '',
      notes: '',
    })
    setFiles({})
    setUploadModalOpen(true)
  }

  const handleCloseUpload = () => {
    setUploadModalOpen(false)
    setReplaceCtx(null)
    setFiles({})
  }

  const handleSubmitUpload = (e) => {
    e.preventDefault()
    const emp = employees.find((x) => x.id === formData.employeeId)
    if (!emp || !formData.documentType || !files.documentFile?.length) {
      handleCloseUpload()
      return
    }

    const nextVersion =
      uploadMode === 'replace' && replaceCtx
        ? replaceCtx.nextVersion
        : maxVersionFor(submissions, emp.id, formData.documentType) + 1

    const newRow = {
      id: nextSubmissionId(),
      employeeId: emp.id,
      employee: emp.name,
      empId: emp.empId,
      department: emp.department,
      docType: formData.documentType,
      version: nextVersion,
      submittedDate: todayStr(),
      updated: todayStr(),
      status: 'Pending',
      hrComments: '',
    }

    setSubmissions((prev) => [newRow, ...prev])
    pushAudit(
      `${emp.name} uploaded ${formData.documentType} v${nextVersion}${uploadMode === 'replace' ? ' (replacement)' : ''}`,
      emp.name,
    )
    handleCloseUpload()
  }


  const confirmAction = () => {
    const trimmed = actionReason.trim()
    if (actionType !== 'Approve' && trimmed.length < 8) return
    const row = submissions.find((s) => s.id === selectedRow?.id)
    if (!row) return

    const newStatus = 
      actionType === 'Approve' ? 'Submitted' : 
      actionType === 'Reject' ? 'Rejected' : 
      'Correction'

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === row.id
          ? {
               ...s,
               status: newStatus,
               hrComments: trimmed,
               updated: todayStr(),
            }
          : s,
      ),
    )
    pushAudit(`${row.employee}'s ${row.docType} v${row.version} marked as ${newStatus} by HR — ${trimmed}`)
    setActionModalOpen(false)
    setSelectedRow(null)
    setActionReason('')
  }

  const handleActionClick = (row, type) => {
    setSelectedRow(row)
    setActionType(type)
    setActionReason('')
    setActionModalOpen(true)
  }

  const canEmployeeActOnRow = (row) => selfEmployee?.id === row.employeeId

  const rowCanReplace = (row) => {
    if (isHrReviewer) return true
    if (user?.role === 'employee' && canEmployeeActOnRow(row)) return true
    return false
  }

  const showReviewActions = (row) => (isHrReviewer || !user) && row.status === 'Pending'

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const checklistIcon = (state) => {
    if (state === 'approved') {
      return (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-bold">
          ✓
        </div>
      )
    }
    if (state === 'pending') {
      return (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
          ⋯
        </div>
      )
    }
    if (state === 'rejected') {
      return (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 text-xs font-bold">
          !
        </div>
      )
    }
    return (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xs">
        —
      </div>
    )
  }

  const checklistLabel = (state) => {
    if (state === 'approved') return 'Approved on file'
    if (state === 'pending') return 'Awaiting HR review'
    if (state === 'rejected') return 'Rejected — re-upload required'
    return 'Missing'
  }

  const columns = [
    {
      key: 'employee',
      label: 'Employee Name',
      render: (_, row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-[11px] font-black text-emerald-600 border border-emerald-100 shadow-sm">
            {row.employee.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 leading-none">{row.employee}</div>
            <div className="mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-tight">{row.empId}</div>
          </div>
        </div>
      ),
    },
    { key: 'department', label: 'Department' },
    { key: 'docType', label: 'Document Type' },
    { key: 'submittedDate', label: 'Submission' },
    {
      key: 'status',
      label: 'Audit Result',
      render: (v) => {
        const color = v === 'Pending' ? 'orange' : v === 'Rejected' ? 'red' : v === 'Correction' ? 'orange' : 'green'
        return <Badge label={v === 'Submitted' ? 'Approved' : v} color={color} className="font-black text-[9px] px-2 py-0.5 rounded-lg uppercase" />
      }
    },
    {
      key: 'hrComments',
      label: 'Compliance Remarks',
      render: (v) => (
        <span className="text-[10px] font-bold text-slate-500 italic truncate block max-w-[200px]" title={v}>
          {v || '—'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setViewSubmission(row)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
            title="Preview"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
            <div className="flex gap-1">
              <button 
                onClick={() => handleActionClick(row, 'Approve')} 
                className="px-2 py-1 text-[9px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md uppercase"
              >
                Approve
              </button>
              <button 
                onClick={() => handleActionClick(row, 'Reject')} 
                className="px-2 py-1 text-[9px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md uppercase"
              >
                Reject
              </button>
              <button 
                onClick={() => handleActionClick(row, 'Return for Correction')} 
                className="px-2 py-1 text-[9px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-md uppercase"
              >
                Correction
              </button>
            </div>
          {rowCanReplace(row) && (
            <button 
              onClick={() => openReplaceUpload(row)}
              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
              title="Replace"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      )
    }
  ]


  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Unified Command Center */}
        <section className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-end bg-white p-5 rounded-lg border border-slate-200 shadow-sm ring-1 ring-slate-900/5">
            <div className="flex-1 w-full">
              <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Workforce Repository</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input 
                  type="text"
                  placeholder="Employee, ID, or Document..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-700"
                />
              </div>
            </div>

            <div className="w-full lg:w-40">
              <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 px-4 text-sm focus:outline-none focus:border-emerald-500 font-bold text-slate-700 cursor-pointer">
                {deptOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <div className="w-full lg:w-40">
              <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 px-4 text-sm focus:outline-none focus:border-emerald-500 font-bold text-slate-700 cursor-pointer">
                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <div className="w-full lg:w-40">
              <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Submission Date</label>
              <input 
                type="date"
                value={approvedDateFilter}
                onChange={(e) => setApprovedDateFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 px-4 text-sm focus:outline-none focus:border-emerald-500 font-bold text-slate-700"
              />
            </div>

            <button 
              onClick={() => { setQ(''); setDeptFilter(''); setStatusFilter(''); setApprovedDateFilter('') }}
              className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all border border-slate-200 shadow-sm"
              title="Clear Filters"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-2 shadow-sm ring-1 ring-slate-900/5">
            <Table columns={columns} data={filtered} pageSize={10} />
          </div>
        </section>

        {/* Global Compliance Checklist */}
        <section className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm ring-1 ring-slate-900/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900 tracking-tight">Mandatory Checklist Baseline</h2>
              <p className="text-sm text-slate-500 mt-1">Core document verification required for organizational compliance.</p>
            </div>
            {(isHrReviewer || isManager || visibleEmployees.length > 1) && (
              <div className="w-full md:w-64">
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verification Subject</label>
                <select
                  value={resolvedChecklistEmployeeId}
                  onChange={(e) => setChecklistEmployeeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 px-4 text-sm focus:outline-none focus:border-emerald-500 font-bold text-slate-700 shadow-sm"
                >
                  {visibleEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.empId})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {checklistStatuses.map(({ docType, state }) => (
              <div
                key={docType}
                className={`flex items-center gap-4 rounded-md border p-4 transition-all hover:shadow-md ${
                  state === 'approved' ? 'bg-emerald-50/20 border-emerald-100' : 
                  state === 'pending' ? 'bg-amber-50/20 border-amber-100' :
                  state === 'rejected' ? 'bg-rose-50/20 border-rose-100' :
                  'bg-slate-50/50 border-slate-100'
                }`}
              >
                {checklistIcon(state)}
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{docType}</div>
                  <div className="text-[10px] text-slate-500 font-bold italic mt-0.5 truncate">
                    {checklistLabel(state)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Modal isOpen={uploadModalOpen} onClose={handleCloseUpload} title="Upload document" size="xl">
        <form onSubmit={handleSubmitUpload} className="pr-1">
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Document details</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 w-full sm:col-span-1">
              <label htmlFor="doc-employee" className="mb-1 block text-sm font-medium text-gray-700">
                Employee
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="doc-employee"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleFormChange}
                disabled={uploadMode === 'replace' || user?.role === 'employee'}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select employee
                </option>
                {(user?.role === 'employee' && selfEmployee
                  ? [selfEmployee]
                  : isHrReviewer
                    ? employees
                    : isManager && user?.department
                      ? employees.filter((e) => e.department === user.department)
                      : visibleEmployees
                ).map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.empId})
                  </option>
                ))}
              </select>
              {uploadMode === 'replace' && (
                <p className="mt-1 text-xs text-gray-500">
                  Replacing raises version to v{replaceCtx?.nextVersion ?? '?'}. Goes to Pending for HR approval.
                </p>
              )}
            </div>
            <div className="col-span-2 w-full">
              <label htmlFor="doc-type" className="mb-1 block text-sm font-medium text-gray-700">
                Document type
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="doc-type"
                name="documentType"
                value={formData.documentType}
                onChange={handleFormChange}
                disabled={uploadMode === 'replace'}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select type
                </option>
                {uploadTypeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Document title"
              name="documentTitle"
              value={formData.documentTitle}
              onChange={handleFormChange}
              placeholder="e.g. Passport — front & back"
              required
              className="col-span-2"
            />
            <Input label="Document number" name="documentNumber" value={formData.documentNumber} onChange={handleFormChange} />
            <Input label="Issue date" name="issueDate" type="date" value={formData.issueDate} onChange={handleFormChange} />
            <Input label="Expiry date" name="expiryDate" type="date" value={formData.expiryDate} onChange={handleFormChange} />
            <div className="col-span-2">
              <Input
                label="Issued by / authority"
                name="issuedBy"
                value={formData.issuedBy}
                onChange={handleFormChange}
              />
            </div>
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="doc-notes" className="mb-1 block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="doc-notes"
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              className={textareaClass}
              rows={3}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Upload</p>
          <FileUpload
            label="Document file"
            name="documentFile"
            accept=".jpg,.png,.pdf,.doc,.docx"
            onChange={(fileList) => setFiles((prev) => ({ ...prev, documentFile: fileList }))}
            helpText="Max 10MB"
            required
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseUpload} />
            <Button type="submit" label={uploadMode === 'replace' ? 'Upload replacement' : 'Submit'} variant="primary" />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!viewSubmission}
        onClose={() => setViewSubmission(null)}
        title="Regulatory Submission Analysis"
        size="lg"
      >
        {viewSubmission && (
          <div className="py-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div className="col-span-2 flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-lg">
                  {viewSubmission.employee.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">{viewSubmission.employee}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{viewSubmission.empId} • {viewSubmission.department}</p>
                </div>
                <div className="ml-auto">
                  <Badge label={viewSubmission.status} color={viewSubmission.status === 'Approved' ? 'green' : viewSubmission.status === 'Rejected' ? 'red' : 'orange'} className="px-3 py-1 rounded-xl font-black uppercase text-[10px] tracking-wider" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Document Classification</label>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{viewSubmission.docType}</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Audit Version</label>
                <p className="text-sm font-black text-emerald-600 mt-0.5 uppercase tracking-widest">Revision v{viewSubmission.version}</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Initial Submission</label>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{viewSubmission.submittedDate}</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Last Registry Update</label>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{viewSubmission.updated}</p>
              </div>
              
              <div className="col-span-2 mt-2 pt-4 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Compliance Officer Remarks</label>
                <div className="mt-2 bg-slate-50/50 border border-slate-100 rounded-xl p-4 min-h-[80px]">
                  <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                    {viewSubmission.hrComments || 'No administrative remarks recorded for this version.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button label="Close Audit View" variant="primary" onClick={() => setViewSubmission(null)} className="rounded-xl px-8 shadow-lg shadow-emerald-100" />
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal (Approve/Reject/Correction) */}
      <Modal 
        isOpen={actionModalOpen} 
        onClose={() => setActionModalOpen(false)} 
        title={`Audit Decision: ${actionType}`} 
        size="md"
      >
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            confirmAction()
          }} 
          className="space-y-4 pt-2"
        >
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Document</p>
            <p className="text-sm font-bold text-slate-900">{selectedRow?.docType} — {selectedRow?.employee}</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Compliance Remarks / Reason</label>
            <textarea
              required={actionType !== 'Approve'}
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder={actionType === 'Approve' ? 'Optional remarks for audit log...' : 'Detailed reason required for this action...'}
              className="w-full min-h-[120px] bg-white border border-slate-200 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-inner"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button label="Cancel" variant="secondary" onClick={() => setActionModalOpen(false)} className="flex-1 rounded-md" />
            <Button 
              type="submit"
              label={`Confirm ${actionType}`} 
              variant="primary" 
              className={`flex-1 rounded-md shadow-lg ${actionType === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-700' : actionType === 'Reject' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'}`}
              disabled={actionType !== 'Approve' && actionReason.trim().length < 4}
            />
          </div>
        </form>
      </Modal>
    </>
  )
}
