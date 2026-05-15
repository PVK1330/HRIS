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
    <div className="absolute bottom-full right-0 mb-2 w-80 rounded-none border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
          <HiCodeBracket className="h-4 w-4" /> DYNAMIC_ASSET_TAGS
        </span>
        <button type="button" onClick={onClose} className="text-white/40 hover:text-white transition-colors">
          <HiXMark className="h-4 w-4" />
        </button>
      </div>
      <div className="p-1 max-h-80 overflow-y-auto custom-scrollbar bg-slate-50">
        {tags.length === 0 && (
          <p className="text-center text-[10px] font-black text-slate-400 uppercase py-6">EMPTY_REGISTRY</p>
        )}
        {tags.map(p => (
          <button
            key={p.tag}
            type="button"
            onClick={() => { insertAtCursor(bodyRef, p.tag, bodyValue, setter); onClose() }}
            className="w-full text-left px-4 py-3 border border-transparent hover:border-emerald-500/30 hover:bg-white transition-all group flex items-start gap-3 mb-1 last:mb-0"
          >
            <div className="flex-1 min-w-0">
              <code className="text-[11px] font-black text-emerald-700 group-hover:text-emerald-900 break-all tracking-tight">{p.tag}</code>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{p.description || p.desc}</p>
            </div>
            {p.isSystem && <HiLockClosed className="h-3 w-3 text-slate-300 shrink-0 mt-1" />}
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
          <button
            onClick={() => {
              setSelectedTemplate(row)
              setDispatchEmployeeId('')
              setEmpSearch('')
              setSendModalOpen(true)
            }}
            className="h-8 px-4 rounded-none bg-[#0F766E] text-[9px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <HiEnvelope className="h-3.5 w-3.5" /> USE
          </button>
          <button
            title="Download"
            onClick={() => downloadTemplate(row)}
            className="h-8 w-8 rounded-none border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center"
          >
            <HiArrowDownTray className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => openEdit(row)}
            className="h-8 w-8 rounded-none border border-slate-200 bg-white text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all flex items-center justify-center"
          >
            <HiPencilSquare className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="h-8 w-8 rounded-none border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center"
          >
            <HiTrash className="h-3.5 w-3.5" />
          </button>
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
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Top Title Bar — Standardized */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Letters & Templates</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Documentation</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600 uppercase font-black tracking-widest text-[10px]">Template Governance</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-colors hover:bg-slate-50 shadow-sm">
            <HiUsers className="h-4 w-4 shrink-0" /> Bulk Dispatch
          </button>
          <button
            onClick={() => { setForm(EMPTY_FORM); setModalOpen(true) }}
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#0c6b64] shadow-lg shadow-emerald-900/10"
          >
            <HiPlus className="h-4 w-4 shrink-0" /> New Template
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-3 min-w-0">
        {[
          { id: 'Templates', label: 'GOVERNANCE TEMPLATES', count: kpis.templates, icon: HiDocumentText, bgColor: 'bg-slate-900' },
          { id: 'History', label: 'TRANSMISSION LOGS', count: kpis.generatedThisMonth, icon: HiClock, bgColor: 'bg-[#3B82F6]' },
          { id: 'Pending', label: 'PENDING VERIFICATION', count: kpis.pendingSignatures, icon: HiCheckBadge, bgColor: 'bg-[#F59E0B]' },
        ].map((card, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(card.id)}
            className={`flex items-center gap-3.5 rounded-none border p-4 shadow-sm min-w-0 transition-all ${
              activeTab === card.id ? 'border-[#0F766E] bg-emerald-50/30' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate leading-none">
                {card.label}
              </div>
              <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Workspace Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Column: Dynamic Tags — Standardized */}
        <div className="space-y-4 min-w-0">
          <div className="rounded-none bg-white p-5 border border-slate-200 shadow-sm min-w-0">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <HiCodeBracket className="h-4 w-4 shrink-0" /> ASSET_TAGS
              </h3>
              <button
                onClick={openCreateTag}
                className="flex items-center gap-1.5 text-[9px] font-black text-[#0F766E] hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-none border border-emerald-100 transition-all uppercase tracking-widest shrink-0"
              >
                <HiPlus className="h-3 w-3" /> ADD_TAG
              </button>
            </div>
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
              {tags.length === 0 && (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-8">EMPTY_REGISTRY</p>
              )}
              {tags.map(t => (
                <div key={t.id} className="group flex flex-col gap-1 rounded-none p-3 hover:bg-slate-50 transition-all border border-slate-50 hover:border-slate-200 min-w-0">
                  <div className="flex items-center justify-between min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <code className="text-[10px] font-black text-emerald-700 uppercase tracking-tight truncate max-w-[140px]">{t.tag}</code>
                      {t.isSystem && <HiLockClosed className="h-3 w-3 text-slate-300 shrink-0" title="System tag" />}
                    </div>
                    {!t.isSystem && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => openEditTag(t)} className="p-1 rounded-none hover:bg-white border border-transparent hover:border-slate-200 text-slate-400 hover:text-[#0F766E] transition-all">
                          <HiPencilSquare className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDeleteTag(t)} className="p-1 rounded-none hover:bg-white border border-transparent hover:border-slate-200 text-slate-400 hover:text-red-500 transition-all">
                          <HiTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate block">{t.description}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] text-center border-t border-slate-100 pt-4 truncate">
              {tags.filter(t => !t.isSystem).length} CUSTOM_EXT · {tags.filter(t => t.isSystem).length} SYS_CORE
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="lg:col-span-3 space-y-6 min-w-0">
          <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm min-w-0">
            <div className="flex flex-col gap-6 md:flex-row md:items-end">
              <div className="flex-1 min-w-0">
                <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Filter</label>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="SEARCH TEMPLATES, CATEGORIES OR PROTOCOLS..."
                    className="w-full rounded-none border border-slate-200 bg-slate-50/50 h-12 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] focus:bg-white focus:outline-none transition-all"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </div>
              <button className="h-12 px-8 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
                ADVANCED_FILTERS
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-none border border-red-100 bg-red-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-700">{error}</div>
          )}

          <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm min-w-0">
            <div className="flex items-center justify-between bg-[#0F766E] px-5 py-3.5 text-white min-w-0 border-b border-[#0F766E]">
              <h2 className="text-sm font-semibold uppercase tracking-wider truncate">
                {activeTab === 'History' ? 'Transmission Registry' : 'Template Vault'}
              </h2>
              <div className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] shrink-0">Level: Document Admin</div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-20 text-slate-400 text-[10px] font-black uppercase tracking-widest">SYNCHRONIZING_DATA...</div>
            ) : activeTab === 'History' ? (
              <Table columns={historyColumns} data={history} pageSize={10} className="rounded-none" />
            ) : (
              <Table columns={templateColumns} data={filteredTemplates} pageSize={10} className="rounded-none" />
            )}
          </div>
        </div>
      </div>

      {/* ── Create Template Modal ─────────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="GOVERNANCE_TEMPLATE_PROVISION" size="xl">
        <form onSubmit={handleCreate} className="animate-in fade-in duration-500 space-y-6 p-2">
          {/* Row 1: Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Identifier</label>
            <input
              type="text"
              placeholder="e.g. STANDARD_OFFER_PROTOCOL_2026"
              className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] outline-none transition-all"
              required
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          {/* Row 2: Type / Category / Status */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Class</label>
              <select
                className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] outline-none transition-all cursor-pointer"
                value={form.type}
                onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
              >
                {TYPES.map(t => <option key={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Dept</label>
              <select
                className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] outline-none transition-all cursor-pointer"
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map(c => <option key={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Governance Status</label>
              <select
                className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] outline-none transition-all cursor-pointer"
                value={form.status}
                onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
              >
                <option>ACTIVE</option>
                <option>DRAFT</option>
              </select>
            </div>
          </div>

          {/* Row 3: Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrative Brief</label>
            <input
              type="text"
              placeholder="ENTER PROTOCOL DESCRIPTION..."
              className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] outline-none transition-all"
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Row 4: Body */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Payload (HTML/MD)</label>
            <div className="relative">
              <textarea
                ref={createBodyRef}
                className="w-full rounded-none border border-slate-200 bg-slate-50/30 p-6 text-[13px] font-mono leading-relaxed text-slate-800 focus:border-[#0F766E] focus:bg-white outline-none min-h-[350px] transition-all"
                placeholder="START PROTOCOL DRAFTING. USE {{TAGS}} FOR DYNAMIC INJECTION..."
                value={form.body}
                onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))}
              />
              <div className="absolute right-6 bottom-6 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTagPickerOpen(o => !o)}
                  className="h-10 px-4 rounded-none bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all flex items-center gap-2"
                >
                  <HiCodeBracket className="h-4 w-4" /> INJECT_TAG
                </button>
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

          <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
            <button type="button" onClick={() => setModalOpen(false)} className="h-12 px-8 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">
               CANCEL
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-12 px-12 rounded-none bg-[#0F766E] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] transition-all shadow-xl shadow-emerald-900/10 disabled:opacity-40"
            >
              {submitting ? 'PROCESSING...' : 'COMMIT TEMPLATE'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Template Modal ───────────────────────────────────────────── */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="GOVERNANCE_TEMPLATE_MODIFICATION" size="xl">
        <form onSubmit={handleUpdate} className="animate-in fade-in duration-500 space-y-6 p-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Identifier</label>
            <input
              type="text"
              placeholder="PROTOCOL NAME"
              className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] outline-none transition-all"
              required
              value={editForm.name}
              onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Class</label>
              <select
                className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] outline-none transition-all cursor-pointer"
                value={editForm.type}
                onChange={(e) => setEditForm(f => ({ ...f, type: e.target.value }))}
              >
                {TYPES.map(t => <option key={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Dept</label>
              <select
                className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] outline-none transition-all cursor-pointer"
                value={editForm.category}
                onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map(c => <option key={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Governance Status</label>
              <select
                className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] outline-none transition-all cursor-pointer"
                value={editForm.status}
                onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
              >
                <option>ACTIVE</option>
                <option>DRAFT</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrative Brief</label>
            <input
              type="text"
              placeholder="DESCRIPTION"
              className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] outline-none transition-all"
              value={editForm.description}
              onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Payload</label>
            <div className="relative">
              <textarea
                ref={editBodyRef}
                className="w-full rounded-none border border-slate-200 bg-slate-50/30 p-6 text-[13px] font-mono leading-relaxed text-slate-800 focus:border-[#0F766E] focus:bg-white outline-none min-h-[350px] transition-all"
                placeholder="TEMPLATE BODY..."
                value={editForm.body}
                onChange={(e) => setEditForm(f => ({ ...f, body: e.target.value }))}
              />
              <div className="absolute right-6 bottom-6 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditTagPickerOpen(o => !o)}
                  className="h-10 px-4 rounded-none bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all flex items-center gap-2"
                >
                  <HiCodeBracket className="h-4 w-4" /> INJECT_TAG
                </button>
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

          <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
            <button type="button" onClick={() => setEditModalOpen(false)} className="h-12 px-8 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">
               CANCEL
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-12 px-12 rounded-none bg-[#0F766E] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] transition-all shadow-xl shadow-emerald-900/10 disabled:opacity-40"
            >
              {submitting ? 'SYNCHRONIZING...' : 'UPDATE PROTOCOL'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Dispatch / Use Template Modal ────────────────────────────────── */}
      <Modal isOpen={sendModalOpen} onClose={() => { setSendModalOpen(false); setDispatchEmployeeId(''); setEmpSearch('') }} title="PROTOCOL_TRANSMISSION_INTERFACE" size="xl">
        <div className="animate-in fade-in duration-500 p-2">
          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Left: Config panel ── */}
            <div className="lg:w-80 shrink-0 space-y-6">
              {/* Template info */}
              <div className="rounded-none bg-slate-900 p-5 text-white border-l-4 border-[#0F766E]">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">ACTIVE_PROTOCOL</p>
                <p className="font-black text-sm uppercase tracking-tight leading-tight">{selectedTemplate?.name}</p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {selectedTemplate?.type && (
                    <span className="text-[8px] font-black bg-[#0F766E] px-2 py-0.5 rounded-none uppercase tracking-widest">{selectedTemplate.type.toUpperCase()}</span>
                  )}
                  {selectedTemplate?.category && (
                    <span className="text-[8px] font-black bg-slate-800 px-2 py-0.5 rounded-none uppercase tracking-widest border border-slate-700">{selectedTemplate.category.toUpperCase()}</span>
                  )}
                </div>
              </div>

              {/* Employee search + select */}
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  TARGET_RECIPIENT <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="SEARCH_DIRECTORY..."
                    className="w-full rounded-none border border-slate-200 bg-white h-12 pl-12 pr-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] outline-none transition-all"
                    value={empSearch}
                    onChange={e => setEmpSearch(e.target.value)}
                  />
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-1 bg-slate-50 border border-slate-100 p-1">
                  {empListLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="h-5 w-5 rounded-none border-2 border-[#0F766E] border-t-transparent animate-spin" />
                    </div>
                  ) : empListError ? (
                    <div className="text-center py-6 space-y-3">
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{empListError}</p>
                      <button
                        type="button"
                        onClick={() => { empListFetched.current = false; fetchEmpList() }}
                        className="text-[9px] font-black text-[#0F766E] hover:underline uppercase tracking-widest"
                      >
                        RETRY_SYNC
                      </button>
                    </div>
                  ) : empList.length === 0 ? (
                    <p className="text-center text-[10px] font-black text-slate-400 uppercase py-10 tracking-widest">EMPTY_DIRECTORY</p>
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
                          className={`w-full text-left px-3 py-3 border transition-all rounded-none ${
                            String(dispatchEmployeeId) === String(e.id)
                              ? 'border-[#0F766E] bg-emerald-50'
                              : 'border-transparent bg-transparent hover:bg-white hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-none bg-slate-900 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                              {(e.full_name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight truncate">{e.full_name}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{e.emp_id} · {e.department}</p>
                            </div>
                          </div>
                        </button>
                      ))
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-6 border-t border-slate-100">
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
                    className="w-full flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white h-11 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <HiArrowDownTray className="h-4 w-4" /> EXPORT_PREVIEW
                  </button>
                )}
                <button
                   type="button"
                  onClick={handleDispatch}
                  disabled={submitting || !dispatchEmployeeId}
                  className="w-full h-11 rounded-none bg-[#0F766E] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <HiEnvelope className="h-4 w-4" /> {submitting ? 'TRANSMITTING...' : 'EXECUTE_DISPATCH'}
                </button>
                <button
                   type="button"
                  onClick={() => { setSendModalOpen(false); setDispatchEmployeeId(''); setEmpSearch('') }}
                  className="w-full h-11 rounded-none border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ABORT_INTERFACE
                </button>
              </div>
            </div>

            {/* ── Right: Live letter preview ── */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {dispatchEmployeeId ? 'LIVE_PROTOCOL_PREVIEW' : 'STATIC_TEMPLATE_VIEW'}
                </p>
                <button
                  type="button"
                  onClick={() => { setSendModalOpen(false); openEdit(selectedTemplate) }}
                  className="flex items-center gap-1.5 text-[10px] font-black text-[#0F766E] hover:text-emerald-800 transition-colors uppercase tracking-widest"
                >
                  <HiPencilSquare className="h-3.5 w-3.5" /> EDIT_SOURCE
                </button>
              </div>

              <div className="rounded-none border border-slate-200 bg-white min-h-[550px] overflow-hidden shadow-sm flex flex-col">
                {/* Letter paper header */}
                <div className="border-b border-slate-100 px-10 py-6 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-[#0F766E] rounded-none flex items-center justify-center text-white font-black text-xs">H</div>
                    <div className="h-4 w-24 bg-slate-200 rounded-none" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
                  </p>
                </div>

                {selectedTemplate?.body ? (
                  <div className="px-12 py-10 flex-1 bg-white">
                    <pre className="text-[13px] text-slate-800 font-mono leading-relaxed whitespace-pre-wrap break-words">
                      {dispatchEmployeeId
                        ? renderBody(selectedTemplate.body, empList.find(e => String(e.id) === String(dispatchEmployeeId)))
                        : selectedTemplate.body
                      }
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 text-slate-300 py-20">
                    <HiDocumentText className="h-16 w-16 mb-4 opacity-10" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">NULL_PAYLOAD</p>
                    <button
                      type="button"
                      onClick={() => { setSendModalOpen(false); openEdit(selectedTemplate) }}
                      className="mt-6 text-[10px] font-black text-[#0F766E] hover:underline uppercase tracking-widest"
                    >
                      INITIALIZE_CONTENT →
                    </button>
                  </div>
                )}
                
                {/* Letter paper footer */}
                <div className="border-t border-slate-50 px-10 py-6 bg-slate-50/30">
                   <div className="h-px w-32 bg-slate-200 mb-2" />
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AUTHORIZED_SIGNATORY</p>
                </div>
              </div>

              {/* Tag legend */}
              {!dispatchEmployeeId && selectedTemplate?.body && (
                <p className="mt-4 text-[10px] font-black text-[#0F766E] uppercase tracking-widest text-center animate-pulse">
                  &gt;&gt; SELECT RECIPIENT TO INJECT LIVE ASSET DATA
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
        title={editingTag ? 'TAG_MODIFICATION' : 'NEW_ASSET_TAG'}
        size="sm"
      >
        <form onSubmit={handleSaveTag} className="animate-in fade-in duration-300 space-y-6 pt-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              PROTOCOL_KEY <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center rounded-none border border-slate-200 bg-white overflow-hidden focus-within:border-[#0F766E] transition-all h-12">
              <span className="px-4 text-[11px] font-black text-slate-400 select-none border-r border-slate-100 bg-slate-50 h-full flex items-center">{'{{'}</span>
              <input
                type="text"
                required
                placeholder="custom_key"
                className="flex-1 bg-transparent px-4 text-[11px] font-black text-slate-900 focus:outline-none uppercase tracking-widest"
                value={tagForm.tag}
                onChange={e => setTagForm(f => ({ ...f, tag: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
              />
              <span className="px-4 text-[11px] font-black text-slate-400 select-none border-l border-slate-100 bg-slate-50 h-full flex items-center">{'}}'}</span>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight ml-1">LOWERCASE_ALPHANUMERIC_ONLY</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DESCRIPTION</label>
            <input
              type="text"
              placeholder="E.G. EMPLOYEE_LEGAL_IDENTITY"
              className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] outline-none transition-all"
              value={tagForm.description}
              onChange={e => setTagForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {tagError && (
            <div className="rounded-none border border-red-100 bg-red-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-700">{tagError}</div>
          )}

          {/* Preview */}
          {tagForm.tag && (
            <div className="rounded-none bg-slate-900 border-l-4 border-emerald-500 p-4 flex items-center gap-4">
              <HiCodeBracket className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <code className="text-[11px] font-black text-emerald-400 tracking-widest">{`{{${tagForm.tag}}}`}</code>
                {tagForm.description && <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{tagForm.description}</p>}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
            <button type="button" onClick={() => setTagManagerOpen(false)} className="h-11 px-6 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
               ABORT
            </button>
            <button
              type="submit"
              disabled={tagSubmitting || !tagForm.tag.trim()}
              className="h-11 px-10 rounded-none bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all flex items-center gap-2 disabled:opacity-40"
            >
              {editingTag ? <HiPencilSquare className="h-4 w-4" /> : <HiPlus className="h-4 w-4" />}
              {tagSubmitting ? 'SAVING...' : editingTag ? 'UPDATE_TAG' : 'PROVISION_TAG'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
