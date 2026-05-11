import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  HiPlus,
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiEye,
  HiPencilSquare,
  HiTrash,
  HiEnvelope,
  HiDocumentText,
  HiClock,
  HiCheckBadge,
  HiCodeBracket,
  HiUsers,
  HiXMark,
  HiLockClosed,
  HiArrowDownTray,
} from 'react-icons/hi2'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import api from '../../../services/api.js'
import { listEmployees } from '../../../services/employeeService.js'

const CATEGORIES  = ['Recruitment', 'Compliance', 'Performance', 'Exit', 'HR', 'Finance', 'Leave', 'Disciplinary']
const TYPES       = ['Letter', 'Form', 'Certificate', 'Report']
const EMPTY_FORM  = { name: '', type: 'Letter', category: 'Recruitment', description: '', body: '', status: 'Active' }
const EMPTY_TAG   = { tag: '', description: '' }

// ── Replace {{tags}} with real employee data for live preview ─────────────────
function renderBody(body, employee) {
  if (!body || !employee) return body || ''
  return body
    .replace(/\{\{employee_name\}\}/g,  employee.full_name    || employee.name        || '')
    .replace(/\{\{employee_id\}\}/g,    employee.emp_id       || employee.empId       || '')
    .replace(/\{\{job_title\}\}/g,      employee.job_title    || employee.jobTitle    || '')
    .replace(/\{\{department\}\}/g,     employee.department   || '')
    .replace(/\{\{joining_date\}\}/g,   employee.join_date    || employee.joinDate    || '')
    .replace(/\{\{salary\}\}/g,         employee.salary       || '[salary]')
    .replace(/\{\{work_email\}\}/g,     employee.work_email   || employee.email       || '')
    .replace(/\{\{work_location\}\}/g,  employee.work_location|| employee.location    || '')
    .replace(/\{\{today_date\}\}/g,     new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }))
    .replace(/\{\{company_name\}\}/g,   employee.company      || '[Company Name]')
    .replace(/\{\{[^}]+\}\}/g,          match => `[${match.slice(2, -2)}]`) // unknown tags shown as [tag]
}

const TYPE_COLOR = { Letter: 'blue', Form: 'green', Certificate: 'purple', Report: 'orange' }

// ── Download template body as .txt ────────────────────────────────────────────
function downloadTemplate(row) {
  const blob = new Blob([row.body || ''], { type: 'text/plain' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${row.name.replace(/\s+/g, '_')}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Insert tag at cursor position ─────────────────────────────────────────────
function insertAtCursor(ref, tag, currentValue, setter) {
  const el = ref.current
  if (!el) { setter(f => ({ ...f, body: currentValue + tag })); return }
  const start = el.selectionStart ?? currentValue.length
  const end   = el.selectionEnd   ?? currentValue.length
  const next  = currentValue.slice(0, start) + tag + currentValue.slice(end)
  setter(f => ({ ...f, body: next }))
  requestAnimationFrame(() => {
    el.focus()
    el.setSelectionRange(start + tag.length, start + tag.length)
  })
}

// ── Reusable tag picker dropdown ──────────────────────────────────────────────
function TagPicker({ open, onClose, tags, bodyRef, bodyValue, setter }) {
  if (!open) return null
  return (
    <div className="absolute bottom-full right-0 mb-2 w-72 rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-[#0F766E] px-4 py-2.5 flex items-center justify-between">
        <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
          <HiCodeBracket className="h-3.5 w-3.5" /> Dynamic Tags
        </span>
        <button type="button" onClick={onClose} className="text-white/60 hover:text-white transition-colors">
          <HiXMark className="h-4 w-4" />
        </button>
      </div>
      <div className="p-2 max-h-72 overflow-y-auto custom-scrollbar">
        {tags.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-4">No tags available</p>
        )}
        {tags.map(p => (
          <button
            key={p.tag}
            type="button"
            onClick={() => { insertAtCursor(bodyRef, p.tag, bodyValue, setter); onClose() }}
            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors group flex items-start gap-2"
          >
            <div className="flex-1 min-w-0">
              <code className="text-[11px] font-bold text-emerald-700 group-hover:text-emerald-800 break-all">{p.tag}</code>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">{p.description || p.desc}</p>
            </div>
            {p.isSystem && <HiLockClosed className="h-3 w-3 text-slate-300 shrink-0 mt-0.5" />}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function LettersTemplates() {
  // ── UI state ──────────────────────────────────────────────────────────────
  const [q, setQ]                         = useState('')
  const [activeTab, setActiveTab]         = useState('Templates')
  const [modalOpen, setModalOpen]         = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  // ── Tag picker state ──────────────────────────────────────────────────────
  const [tagPickerOpen, setTagPickerOpen]         = useState(false)
  const [editTagPickerOpen, setEditTagPickerOpen] = useState(false)
  const createBodyRef = useRef(null)
  const editBodyRef   = useRef(null)

  // ── Tag manager state ─────────────────────────────────────────────────────
  const [tags, setTags]                     = useState([])
  const [tagManagerOpen, setTagManagerOpen] = useState(false)
  const [tagForm, setTagForm]               = useState(EMPTY_TAG)
  const [editingTag, setEditingTag]         = useState(null)
  const [tagSubmitting, setTagSubmitting]   = useState(false)
  const [tagError, setTagError]             = useState('')

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [editForm, setEditForm]         = useState(EMPTY_FORM)
  const [dispatchEmployeeId, setDispatchEmployeeId] = useState('')
  const [empSearch, setEmpSearch]       = useState('')

  // ── Employee list for dispatch modal ─────────────────────────────────────
  const [empList, setEmpList]           = useState([])
  const [empListLoading, setEmpListLoading] = useState(false)
  const [empListError, setEmpListError] = useState('')
  const empListFetched = useRef(false)

  // ── Data state ────────────────────────────────────────────────────────────
  const [templates, setTemplates]   = useState([])
  const [history, setHistory]       = useState([])
  const [kpis, setKpis]             = useState({ templates: 0, generatedThisMonth: 0, pendingSignatures: 0 })
  const [loading, setLoading]       = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState(null)

  const hasFetched = useRef(false)

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  const fetchKpis = useCallback(async () => {
    try {
      const { data } = await api.get('/letters/kpis')
      setKpis(data.data)
    } catch {
      // non-critical
    }
  }, [])

  const fetchTags = useCallback(async () => {
    try {
      const { data } = await api.get('/letters/tags')
      setTags(data.data.tags || [])
    } catch {
      // non-critical — keep previous
    }
  }, [])

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/letters/templates', { params: { limit: 100 } })
      setTemplates(data.data.templates || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/letters/history', { params: { limit: 100 } })
      setHistory(data.data.history || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchEmpList = useCallback(async () => {
    if (empListFetched.current) return
    empListFetched.current = true
    setEmpListLoading(true)
    setEmpListError('')
    try {
      const data = await listEmployees({ limit: 100 })
      setEmpList(data?.employees || [])
    } catch (err) {
      empListFetched.current = false  // allow retry
      const status = err?.response?.status
      if (status === 401 || status === 403) {
        setEmpListError('Session expired. Please log in again.')
      } else {
        setEmpListError(err?.response?.data?.message || 'Failed to load employees')
      }
    } finally {
      setEmpListLoading(false)
    }
  }, [])

  // Fetch employee list whenever the send modal opens
  useEffect(() => {
    if (sendModalOpen) fetchEmpList()
  }, [sendModalOpen, fetchEmpList])

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchKpis()
    fetchTags()
    fetchTemplates()
    fetchHistory()
  }, [fetchKpis, fetchTags, fetchTemplates, fetchHistory])

  // ── Filtered templates (client-side search) ───────────────────────────────
  const filteredTemplates = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return templates
    return templates.filter((t) =>
      `${t.name} ${t.category}`.toLowerCase().includes(query)
    )
  }, [q, templates])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/letters/templates', form)
      setModalOpen(false)
      setForm(EMPTY_FORM)
      await Promise.all([fetchTemplates(), fetchKpis()])
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create template')
    } finally {
      setSubmitting(false)
    }
  }

  const openEdit = (row) => {
    setSelectedTemplate(row)
    setEditForm({
      name: row.name,
      type: row.type || 'Letter',
      category: row.category,
      description: row.description || '',
      body: row.body || '',
      status: row.status,
    })
    setEditModalOpen(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.patch(`/letters/templates/${selectedTemplate.id}`, editForm)
      setEditModalOpen(false)
      await Promise.all([fetchTemplates(), fetchKpis()])
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update template')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete template "${row.name}"?`)) return
    try {
      await api.delete(`/letters/templates/${row.id}`)
      await Promise.all([fetchTemplates(), fetchKpis()])
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete template')
    }
  }

  const handleDispatch = async () => {
    if (!dispatchEmployeeId) { alert('Please select a recipient'); return }
    setSubmitting(true)
    try {
      await api.post('/letters/dispatch', {
        templateId: selectedTemplate.id,
        employeeId: parseInt(dispatchEmployeeId, 10),
      })
      setSendModalOpen(false)
      setDispatchEmployeeId('')
      await Promise.all([fetchHistory(), fetchKpis()])
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to dispatch letter')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Tag CRUD handlers ─────────────────────────────────────────────────────
  const openCreateTag = () => {
    setEditingTag(null)
    setTagForm(EMPTY_TAG)
    setTagError('')
    setTagManagerOpen(true)
  }

  const openEditTag = (t) => {
    setEditingTag(t)
    setTagForm({ tag: t.tag.replace(/^\{\{|\}\}$/g, ''), description: t.description })
    setTagError('')
    setTagManagerOpen(true)
  }

  const handleSaveTag = async (e) => {
    e.preventDefault()
    setTagSubmitting(true)
    setTagError('')
    try {
      if (editingTag) {
        await api.patch(`/letters/tags/${editingTag.id}`, tagForm)
      } else {
        await api.post('/letters/tags', tagForm)
      }
      setTagManagerOpen(false)
      setTagForm(EMPTY_TAG)
      setEditingTag(null)
      await fetchTags()
    } catch (err) {
      setTagError(err?.response?.data?.message || 'Failed to save tag')
    } finally {
      setTagSubmitting(false)
    }
  }

  const handleDeleteTag = async (t) => {
    if (!window.confirm(`Delete tag "${t.tag}"?`)) return
    try {
      await api.delete(`/letters/tags/${t.id}`)
      await fetchTags()
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete tag')
    }
  }

  // ── Table columns ─────────────────────────────────────────────────────────
  const templateColumns = [
    {
      key: 'name',
      label: 'Template Name',
      render: (v, row) => (
        <div>
          <span className="font-bold text-slate-800">{v}</span>
          {row.description && (
            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (v) => v ? <Badge label={v} color={TYPE_COLOR[v] || 'gray'} variant="outline" /> : '—',
    },
    { key: 'category', label: 'Category' },
    { key: 'updatedAt', label: 'Last Updated' },
    {
      key: 'usageCount',
      label: 'Usage',
      render: (v) => (
        <span className="text-xs font-bold text-slate-500">{v ?? 0}×</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={v === 'Active' ? 'green' : 'orange'} variant="outline" />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <Button
            label="Use"
            variant="primary"
            size="sm"
            icon={HiEnvelope}
            className="bg-[#0F766E] border-none"
            onClick={() => {
              setSelectedTemplate(row)
              setDispatchEmployeeId('')
              setEmpSearch('')
              setSendModalOpen(true)
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={HiArrowDownTray}
            className="text-slate-400 hover:text-blue-600"
            title="Download"
            onClick={() => downloadTemplate(row)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={HiPencilSquare}
            className="text-slate-400 hover:text-emerald-600"
            onClick={() => openEdit(row)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={HiTrash}
            className="text-slate-400 hover:text-red-600"
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
    },
  ]

  const historyColumns = [
    { key: 'employee', label: 'Recipient' },
    { key: 'template', label: 'Letter Type' },
    { key: 'sentBy',   label: 'Sent By' },
    { key: 'sentAt',   label: 'Date Sent' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color="green" />,
    },
    {
      key: 'view',
      label: 'Preview',
      render: () => <Button variant="ghost" size="sm" icon={HiEye} />,
    },
  ]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl shadow-emerald-900/20">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight uppercase">LETTERS & TEMPLATES</h1>
            <p className="mt-2 text-emerald-100/80 text-sm max-w-md leading-relaxed">
              Standardize HR communications with dynamic templates. Create, automate, and track every letter sent to your workforce.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-xl bg-white/10 px-6 py-2.5 text-sm font-bold text-white border border-white/20 transition-all hover:bg-white/20 hover:scale-105 active:scale-95">
              <HiUsers className="h-4 w-4" /> Bulk Dispatch
            </button>
            <button
              onClick={() => { setForm(EMPTY_FORM); setModalOpen(true) }}
              className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#0F766E] shadow-lg transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
            >
              <HiPlus className="h-4 w-4" /> New Template
            </button>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Navigation Sidebar */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Library Navigation</p>
          {[
            { id: 'Templates', label: 'Template Library',   count: kpis.templates,           icon: HiDocumentText, color: 'emerald' },
            { id: 'History',   label: 'Dispatch History',   count: kpis.generatedThisMonth,  icon: HiClock,        color: 'blue'    },
            { id: 'Pending',   label: 'Pending Signature',  count: kpis.pendingSignatures,   icon: HiCheckBadge,   color: 'orange'  },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex w-full items-center justify-between rounded-2xl border p-4 transition-all hover:scale-[1.02] active:scale-95 ${
                activeTab === item.id
                  ? 'border-[#0F766E] bg-emerald-50/50 shadow-md ring-1 ring-[#0F766E]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${item.color}-50 text-${item.color}-600`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-700">{item.label}</div>
                  <div className="text-[10px] text-slate-400 font-medium tracking-tight">Active Vault</div>
                </div>
              </div>
              <div className={`text-lg font-black ${activeTab === item.id ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                {item.count}
              </div>
            </button>
          ))}

          <div className="mt-8 rounded-2xl bg-slate-50 p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <HiCodeBracket className="h-4 w-4" /> Dynamic Tags
              </h3>
              <button
                onClick={openCreateTag}
                className="flex items-center gap-1 text-[10px] font-black text-[#0F766E] hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors"
              >
                <HiPlus className="h-3 w-3" /> Add
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {tags.length === 0 && (
                <p className="text-[10px] text-slate-400 italic text-center py-2">No tags yet</p>
              )}
              {tags.map(t => (
                <div key={t.id} className="group flex items-start gap-2 rounded-xl p-2 hover:bg-white transition-colors border border-transparent hover:border-slate-200">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <code className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded truncate max-w-[140px]">{t.tag}</code>
                      {t.isSystem && <HiLockClosed className="h-3 w-3 text-slate-300 shrink-0" title="System tag" />}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium italic truncate block mt-0.5">{t.description}</span>
                  </div>
                  {!t.isSystem && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => openEditTag(t)} className="p-1 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors">
                        <HiPencilSquare className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDeleteTag(t)} className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <HiTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-slate-400 italic text-center border-t border-slate-200 pt-3">
              {tags.filter(t => !t.isSystem).length} custom · {tags.filter(t => t.isSystem).length} system
            </p>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="lg:col-span-3 space-y-6">
          <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Vault</label>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search templates or categories..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none transition-all"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </div>
              <Button label="FILTERS" icon={HiAdjustmentsHorizontal} variant="ghost" className="h-[46px] border border-slate-200" />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
            <div className="bg-[#0F766E] px-6 py-3 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider">
                {activeTab === 'History' ? 'Dispatch Registry' : 'Template Library'}
              </h2>
              <HiDocumentText className="h-4 w-4 opacity-50" />
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400 text-sm">Loading…</div>
            ) : activeTab === 'History' ? (
              <Table columns={historyColumns} data={history} pageSize={10} />
            ) : (
              <Table columns={templateColumns} data={filteredTemplates} pageSize={10} />
            )}
          </div>
        </div>
      </div>

      {/* ── Create Template Modal ─────────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Document Template" size="xl">
        <form onSubmit={handleCreate} className="animate-in fade-in duration-500 space-y-5">
          {/* Row 1: Name */}
          <Input
            label="Template Name"
            placeholder="e.g. Standard Offer Letter 2026"
            required
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          />

          {/* Row 2: Type / Category / Status */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none"
                value={form.type}
                onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
              >
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none"
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none"
                value={form.status}
                onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
              >
                <option>Active</option>
                <option>Draft</option>
              </select>
            </div>
          </div>

          {/* Row 3: Description */}
          <div>
            <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <input
              type="text"
              placeholder="Brief description of this template..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none transition-colors"
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Row 4: Body */}
          <div>
            <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Letter Body (HTML/Markdown Supported)</label>
            <div className="relative">
              <textarea
                ref={createBodyRef}
                className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none min-h-[280px] font-serif leading-relaxed"
                placeholder="Start drafting your template here. Use {{tags}} for dynamic fields..."
                value={form.body}
                onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))}
              />
              <div className="absolute right-4 bottom-4">
                <div className="relative">
                  <Button
                    label="Insert Tag"
                    variant="ghost"
                    size="sm"
                    icon={HiCodeBracket}
                    className="bg-slate-50 border border-slate-100"
                    type="button"
                    onClick={() => setTagPickerOpen(o => !o)}
                  />
                  <TagPicker
                    open={tagPickerOpen}
                    onClose={() => setTagPickerOpen(false)}
                    tags={tags}
                    bodyRef={createBodyRef}
                    bodyValue={form.body}
                    setter={setForm}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" label="Cancel" variant="ghost" onClick={() => setModalOpen(false)} />
            <Button
              type="submit"
              label={submitting ? 'Saving…' : 'Save Template'}
              variant="primary"
              className="bg-[#0F766E] px-8 shadow-lg shadow-emerald-900/20"
              icon={HiPlus}
              disabled={submitting}
            />
          </div>
        </form>
      </Modal>

      {/* ── Edit Template Modal ───────────────────────────────────────────── */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Document Template" size="xl">
        <form onSubmit={handleUpdate} className="animate-in fade-in duration-500 space-y-5">
          <Input
            label="Template Name"
            placeholder="e.g. Standard Offer Letter 2026"
            required
            value={editForm.name}
            onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none"
                value={editForm.type}
                onChange={(e) => setEditForm(f => ({ ...f, type: e.target.value }))}
              >
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none"
                value={editForm.category}
                onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none"
                value={editForm.status}
                onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
              >
                <option>Active</option>
                <option>Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <input
              type="text"
              placeholder="Brief description of this template..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none transition-colors"
              value={editForm.description}
              onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Letter Body</label>
            <div className="relative">
              <textarea
                ref={editBodyRef}
                className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none min-h-[280px] font-serif leading-relaxed"
                placeholder="Template body..."
                value={editForm.body}
                onChange={(e) => setEditForm(f => ({ ...f, body: e.target.value }))}
              />
              <div className="absolute right-4 bottom-4">
                <div className="relative">
                  <Button
                    label="Insert Tag"
                    variant="ghost"
                    size="sm"
                    icon={HiCodeBracket}
                    className="bg-slate-50 border border-slate-100"
                    type="button"
                    onClick={() => setEditTagPickerOpen(o => !o)}
                  />
                  <TagPicker
                    open={editTagPickerOpen}
                    onClose={() => setEditTagPickerOpen(false)}
                    tags={tags}
                    bodyRef={editBodyRef}
                    bodyValue={editForm.body}
                    setter={setEditForm}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" label="Cancel" variant="ghost" onClick={() => setEditModalOpen(false)} />
            <Button
              type="submit"
              label={submitting ? 'Saving…' : 'Save Changes'}
              variant="primary"
              className="bg-[#0F766E] px-8 shadow-lg shadow-emerald-900/20"
              icon={HiPencilSquare}
              disabled={submitting}
            />
          </div>
        </form>
      </Modal>

      {/* ── Dispatch / Use Template Modal ────────────────────────────────── */}
      <Modal isOpen={sendModalOpen} onClose={() => { setSendModalOpen(false); setDispatchEmployeeId(''); setEmpSearch('') }} title="Use Template" size="xl">
        <div className="animate-in fade-in duration-500">
          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── Left: Config panel ── */}
            <div className="lg:w-72 shrink-0 space-y-5">
              {/* Template info */}
              <div className="rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-4 text-white">
                <p className="text-[10px] font-black text-emerald-200/70 uppercase tracking-widest mb-1">Template</p>
                <p className="font-bold text-base leading-tight">{selectedTemplate?.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  {selectedTemplate?.type && (
                    <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">{selectedTemplate.type}</span>
                  )}
                  {selectedTemplate?.category && (
                    <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-full">{selectedTemplate.category}</span>
                  )}
                </div>
              </div>

              {/* Employee search + select */}
              <div>
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Select Recipient <span className="text-red-400">*</span>
                </label>
                <div className="relative mb-2">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search employee..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-3 text-sm font-medium focus:border-[#0F766E] focus:outline-none transition-colors"
                    value={empSearch}
                    onChange={e => setEmpSearch(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {empListLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="h-4 w-4 rounded-full border-2 border-[#0F766E] border-t-transparent animate-spin" />
                    </div>
                  ) : empListError ? (
                    <div className="text-center py-4 space-y-2">
                      <p className="text-xs text-red-500 font-medium">{empListError}</p>
                      <button
                        type="button"
                        onClick={() => { empListFetched.current = false; fetchEmpList() }}
                        className="text-[10px] font-black text-[#0F766E] hover:underline"
                      >
                        Retry
                      </button>
                    </div>
                  ) : empList.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-4">No employees found</p>
                  ) : (
                    empList
                      .filter(e => {
                        const s = empSearch.toLowerCase()
                        return !s
                          || (e.full_name || '').toLowerCase().includes(s)
                          || (e.emp_id   || '').toLowerCase().includes(s)
                          || (e.department || '').toLowerCase().includes(s)
                      })
                      .map(e => (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => setDispatchEmployeeId(String(e.id))}
                          className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                            String(dispatchEmployeeId) === String(e.id)
                              ? 'border-[#0F766E] bg-emerald-50 ring-1 ring-[#0F766E]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-[10px] font-black text-[#0F766E] shrink-0">
                              {(e.full_name || '?').charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{e.full_name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{e.emp_id} · {e.department}</p>
                            </div>
                          </div>
                        </button>
                      ))
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {dispatchEmployeeId && (
                  <button
                    type="button"
                    onClick={() => {
                      const emp = empList.find(e => String(e.id) === String(dispatchEmployeeId))
                      if (!emp || !selectedTemplate?.body) return
                      const rendered = renderBody(selectedTemplate.body, emp)
                      const blob = new Blob([rendered], { type: 'text/plain' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${selectedTemplate.name.replace(/\s+/g, '_')}_${emp.full_name.replace(/\s+/g, '_')}.txt`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  >
                    <HiArrowDownTray className="h-4 w-4" /> Download Preview
                  </button>
                )}
                <Button
                  label={submitting ? 'Dispatching…' : 'Dispatch via Email'}
                  variant="primary"
                  className="w-full bg-[#0F766E] shadow-lg shadow-emerald-900/20 justify-center"
                  icon={HiEnvelope}
                  onClick={handleDispatch}
                  disabled={submitting || !dispatchEmployeeId}
                />
                <Button
                  label="Cancel"
                  variant="ghost"
                  className="w-full justify-center"
                  onClick={() => { setSendModalOpen(false); setDispatchEmployeeId(''); setEmpSearch('') }}
                />
              </div>
            </div>

            {/* ── Right: Live letter preview ── */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {dispatchEmployeeId ? 'Live Preview — tags filled in' : 'Letter Preview'}
                </p>
                <button
                  type="button"
                  onClick={() => { setSendModalOpen(false); openEdit(selectedTemplate) }}
                  className="flex items-center gap-1.5 text-[10px] font-black text-[#0F766E] hover:text-emerald-800 transition-colors"
                >
                  <HiPencilSquare className="h-3.5 w-3.5" /> Edit Template
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white min-h-[420px] overflow-hidden shadow-sm">
                {/* Letter paper header */}
                <div className="border-b border-slate-100 px-8 py-4 flex items-center justify-between bg-slate-50/50">
                  <div className="h-6 w-20 bg-slate-200 rounded animate-none" />
                  <p className="text-[10px] text-slate-400 font-medium">
                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                {selectedTemplate?.body ? (
                  <div className="px-8 py-6">
                    <pre className="text-sm text-slate-700 font-serif leading-relaxed whitespace-pre-wrap break-words">
                      {dispatchEmployeeId
                        ? renderBody(selectedTemplate.body, empList.find(e => String(e.id) === String(dispatchEmployeeId)))
                        : selectedTemplate.body
                      }
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <HiDocumentText className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">No body content in this template</p>
                    <button
                      type="button"
                      onClick={() => { setSendModalOpen(false); openEdit(selectedTemplate) }}
                      className="mt-3 text-xs font-bold text-[#0F766E] hover:underline"
                    >
                      Add content →
                    </button>
                  </div>
                )}
              </div>

              {/* Tag legend */}
              {!dispatchEmployeeId && selectedTemplate?.body && (
                <p className="mt-2 text-[10px] text-slate-400 italic text-center">
                  Select a recipient above to see tags replaced with real data
                </p>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Tag Create / Edit Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={tagManagerOpen}
        onClose={() => setTagManagerOpen(false)}
        title={editingTag ? 'Edit Tag' : 'Create Dynamic Tag'}
        size="sm"
      >
        <form onSubmit={handleSaveTag} className="animate-in fade-in duration-300 space-y-5 pt-2">
          <div>
            <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Tag Key <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden focus-within:border-[#0F766E] transition-colors">
              <span className="px-3 text-sm font-bold text-slate-400 select-none border-r border-slate-200 bg-slate-100 py-2.5">{'{{'}</span>
              <input
                type="text"
                required
                placeholder="my_custom_field"
                className="flex-1 bg-transparent px-3 py-2.5 text-sm font-mono text-slate-900 focus:outline-none"
                value={tagForm.tag}
                onChange={e => setTagForm(f => ({ ...f, tag: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
              />
              <span className="px-3 text-sm font-bold text-slate-400 select-none border-l border-slate-200 bg-slate-100 py-2.5">{'}}'}</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400 ml-1">Lowercase letters, digits and underscores only</p>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <input
              type="text"
              placeholder="e.g. Employee's full legal name"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none transition-colors"
              value={tagForm.description}
              onChange={e => setTagForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {tagError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{tagError}</div>
          )}

          {/* Preview */}
          {tagForm.tag && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-center gap-3">
              <HiCodeBracket className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <code className="text-sm font-bold text-emerald-700">{`{{${tagForm.tag}}}`}</code>
                {tagForm.description && <p className="text-[11px] text-emerald-600/70 mt-0.5">{tagForm.description}</p>}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" label="Cancel" variant="ghost" onClick={() => setTagManagerOpen(false)} />
            <Button
              type="submit"
              label={tagSubmitting ? 'Saving…' : editingTag ? 'Update Tag' : 'Create Tag'}
              variant="primary"
              className="bg-[#0F766E] shadow-lg shadow-emerald-900/20"
              icon={editingTag ? HiPencilSquare : HiPlus}
              disabled={tagSubmitting || !tagForm.tag.trim()}
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
