import { useMemo, useState, useCallback } from 'react'
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
  if (latest.status === 'Approved') return 'approved'
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
    if (!user) return []
    if (isHrReviewer) return [...employees]
    if (isManager && user.department) {
      return employees.filter((e) => e.department === user.department)
    }
    if (selfEmployee) return [selfEmployee]
    return []
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
  const [files, setFiles] = useState({})

  const [viewSubmission, setViewSubmission] = useState(null)

  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectTargetId, setRejectTargetId] = useState(null)
  const [rejectComment, setRejectComment] = useState('')

  const pushAudit = useCallback((detail, actor) => {
    const entry = {
      id: nextAuditId(),
      at: new Date().toISOString(),
      actor: actor || user?.name || 'User',
      detail,
    }
    setAuditLog((prev) => [entry, ...prev])
  }, [user])

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
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
  ]

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return visibleSubmissions.filter((r) => {
      if (query && !`${r.employee} ${r.empId} ${r.docType}`.toLowerCase().includes(query)) return false
      if (deptFilter && r.department !== deptFilter) return false
      if (statusFilter && r.status !== statusFilter) return false
      return true
    })
  }, [q, deptFilter, statusFilter, visibleSubmissions])

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

  const approveRow = (row) => {
    if (!(row.status === 'Pending')) return
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === row.id
          ? {
              ...s,
              status: 'Approved',
              hrComments: '',
              updated: todayStr(),
            }
          : s,
      ),
    )
    pushAudit(`${row.employee}'s ${row.docType} v${row.version} approved by HR`)
  }

  const openReject = (row) => {
    if (!(row.status === 'Pending')) return
    setRejectTargetId(row.id)
    setRejectComment('')
    setRejectModalOpen(true)
  }

  const confirmReject = () => {
    const trimmed = rejectComment.trim()
    if (trimmed.length < 8) return
    const row = submissions.find((s) => s.id === rejectTargetId)
    if (!row) {
      setRejectModalOpen(false)
      return
    }
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === rejectTargetId
          ? {
              ...s,
              status: 'Rejected',
              hrComments: trimmed,
              updated: todayStr(),
            }
          : s,
      ),
    )
    pushAudit(`${row.employee}'s ${row.docType} v${row.version} rejected — ${trimmed}`)
    setRejectModalOpen(false)
    setRejectTargetId(null)
    setRejectComment('')
  }

  const canEmployeeActOnRow = (row) => selfEmployee?.id === row.employeeId

  const rowCanReplace = (row) => {
    if (isHrReviewer) return true
    if (user?.role === 'employee' && canEmployeeActOnRow(row)) return true
    return false
  }

  const showReviewActions = (row) => isHrReviewer && row.status === 'Pending'

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
      label: 'Employee',
      render: (_, row) => (
        <div>
          <div className="font-medium text-gray-900">{row.employee}</div>
          <div className="text-xs text-gray-500">{row.empId}</div>
        </div>
      ),
    },
    { key: 'department', label: 'Department' },
    { key: 'docType', label: 'Document Type' },
    {
      key: 'version',
      label: 'Version',
      render: (v) => <span className="tabular-nums">v{v}</span>,
    },
    { key: 'submittedDate', label: 'Submitted' },
    { key: 'updated', label: 'Updated' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        const color = v === 'Pending' ? 'orange' : v === 'Rejected' ? 'red' : 'green'
        return <Badge label={v} color={color} />
      },
    },
    {
      key: 'hrComments',
      label: 'HR Comments',
      render: (v) => <span className="text-xs text-gray-600">{v || '—'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex flex-wrap items-center gap-1">
          <Button label="View"variant='primary' size="sm" onClick={() => setViewSubmission(row)} />
          <Button
            label="Download"
            variant="secondary"
            size="sm"
            icon={HiArrowDownTray}
            onClick={() =>
              alert('Demo only: file download would be served from HRIS API / document storage.')
            }
          />
          {rowCanReplace(row) && (
            <Button
              label="Replace"
              variant="outline"
              size="sm"
              icon={HiArrowPath}
              title="Upload a newer version"
              onClick={() => openReplaceUpload(row)}
            />
          )}
          {showReviewActions(row) && (
            <>
              <Button label="Approve" variant="Approve" size="sm" onClick={() => approveRow(row)} />
              <Button label="Reject" variant="danger" size="sm" onClick={() => openReject(row)} />
            </>
          )}
        </div>
      ),
    },
  ]

  const rejectTargetRow = submissions.find((s) => s.id === rejectTargetId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Documents &amp; Approval</h1>
          <p className="mt-1 text-sm text-gray-500">
            Mandatory uploads, HR review, and compliance tracking —{' '}
            {user?.role === 'employee'
              ? 'your uploads only.'
              : isManager
                ? `${user?.department ?? 'your'} team.`
                : 'full organization view.'}
          </p>
        </div>
        <Button label="Upload document" variant="primary" onClick={openCreateUpload} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Search"
            name="q"
            placeholder="Employee name, ID, or document type"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Input
            label="Department"
            name="dept"
            type="select"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            options={deptOptions}
          />
          <Input
            label="Document status"
            name="status"
            type="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-gray-900">Mandatory document checklist</h2>
            <p className="mt-1 text-sm text-gray-500">
              Per HRIS doc: Passport, IDs, certificates, contract, offer, experience letters — tracked per employee.
            </p>
          </div>
          {(isHrReviewer || isManager || visibleEmployees.length > 1) && (
            <div className="w-full max-w-xs">
              <label htmlFor="checklist-employee" className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                Employee
              </label>
              <select
                id="checklist-employee"
                value={resolvedChecklistEmployeeId}
                onChange={(e) => setChecklistEmployeeId(e.target.value)}
                className={selectClass}
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

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {checklistStatuses.map(({ docType, state }) => (
            <div
              key={docType}
              className="flex items-start gap-3 rounded-lg border border-gray-200 px-4 py-3"
            >
              {checklistIcon(state)}
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-800">{docType}</div>
                <div className="mt-0.5 text-xs text-gray-500">
                  {checklistEmployeeName ? `${checklistLabel(state)} (${checklistEmployeeName})` : checklistLabel(state)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Table columns={columns} data={filtered} pageSize={8} />

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Document version tracking</h2>
        <p className="mt-1 text-sm text-gray-500">Recent versions visible in your scope (current vs archived).</p>
        <div className="mt-4 space-y-3">
          {versionSnapshots.length === 0 && (
            <p className="text-sm text-gray-500">No submissions in this view.</p>
          )}
          {versionSnapshots.map((row) => (
            <div key={`${row.id}-ver`} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">
                  {row.docType} — {row.employee}
                </div>
                <div className="text-xs text-gray-500">
                  v{row.version} • Updated {row.updated}{row.archived ? ' (superseded)' : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  label={row.archived ? 'Archived' : 'Current'}
                  color={row.archived ? 'orange' : 'green'}
                  size="sm"
                />
                <Button label="View" variant="danger" size="sm" onClick={() => setViewSubmission(row)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Audit &amp; compliance tracking</h2>
        <p className="mt-1 text-sm text-gray-500">Latest activity (stored in-session for demo).</p>
        <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
          {[...auditLog]
            .sort((a, b) => String(b.at).localeCompare(String(a.at)))
            .map((entry) => (
              <div key={entry.id} className="flex items-start gap-2 text-sm">
                <span className="whitespace-nowrap text-gray-400">{formatAuditClock(entry.at)}</span>
                <span>
                  <span className="font-medium text-gray-700">{entry.actor}:</span> {entry.detail}
                </span>
              </div>
            ))}
        </div>
      </div>

      <Modal isOpen={uploadModalOpen} onClose={handleCloseUpload} title="Upload document" size="xl">
        <form onSubmit={handleSubmitUpload} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
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
        title="Submission details"
        size="lg"
      >
        {viewSubmission && (
          <div className="space-y-2 py-4 text-sm text-gray-700">
            <p>
              <span className="font-semibold text-gray-900">{viewSubmission.employee}</span> ({viewSubmission.empId})
            </p>
            <p>Department: {viewSubmission.department}</p>
            <p>Type: {viewSubmission.docType}</p>
            <p>Version: v{viewSubmission.version}</p>
            <p>Status: {viewSubmission.status}</p>
            <p>Submitted: {viewSubmission.submittedDate}</p>
            <p>Updated: {viewSubmission.updated}</p>
            <p className="pt-2 text-xs text-gray-600">
              HR comment:{' '}
              <span className="font-medium text-gray-900">{viewSubmission.hrComments || '—'}</span>
            </p>
          </div>
        )}
      </Modal>

      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject document" size="lg">
        {rejectTargetRow && (
          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-600">
              {rejectTargetRow.employee} — {rejectTargetRow.docType} v{rejectTargetRow.version}
            </p>
            <div>
              <label htmlFor="reject-comment" className="mb-1 block text-sm font-medium text-gray-700">
                Reason for rejection (shown to employee)
              </label>
              <textarea
                id="reject-comment"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                className={textareaClass}
                rows={4}
                placeholder="Minimum 8 characters"
              />
              {rejectComment.trim().length > 0 && rejectComment.trim().length < 8 && (
                <p className="mt-1 text-xs text-red-600">Provide a clear HR comment (at least 8 characters).</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" label="Cancel" variant="ghost" onClick={() => setRejectModalOpen(false)} />
              <Button
                type="button"
                label="Confirm rejection"
                variant="primary"
                onClick={confirmReject}
                disabled={rejectComment.trim().length < 8}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
