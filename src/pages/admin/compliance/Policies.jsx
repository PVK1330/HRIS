import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  HiDocumentText, 
  HiShieldCheck, 
  HiUserGroup, 
  HiClock, 
  HiPlus, 
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiChevronRight,
  HiArrowDownTray,
  HiPencilSquare,
  HiEye,
  HiBellAlert,
  HiFolderPlus,
  HiArrowPath,
  HiCheckCircle,
  HiXCircle,
  HiTrash,
  HiXMark
} from 'react-icons/hi2'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { EmptyState } from '../../../components/ui/EmptyState.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import { policyService } from '../../../services/policyService.js'
import { adminSettingsService } from '../../../services/adminSettingsService.js'
import { listDepartments } from '../../../services/departmentService.js'
import PolicyPublishSettingsModal from '../../../components/policies/PolicyPublishSettingsModal.jsx'
import PolicyFormModal from '../../../components/policies/PolicyFormModal.jsx'
import PolicyViewModal from '../../../components/policies/PolicyViewModal.jsx'
import {
  POLICY_SECTION_FIELDS,
  EMPTY_POLICY_SECTIONS,
  DEFAULT_AUDIENCE_CONFIG,
  audienceLabelFromConfig,
  normalizePolicyForm,
} from '../../../constants/policySections.js'
import { toast } from 'react-hot-toast'
import { useEffect } from 'react'

const POLICY_CATEGORIES = [
  'HR Policies',
  'Payroll Policies',
  'Attendance Policies',
  'IT & Security',
  'Code of Conduct',
  'Travel & Expense Policy',
  'Remote Work Policy',
  'Leave Policies',
  'Custom Categories'
]

const initialFormData = {
  title: '',
  category: '',
  version: '1.0',
  description: '',
  effectiveDate: '',
  reviewDate: '',
  ackRequired: true,
  status: 'Draft',
  attachments: [],
  sections: { ...EMPTY_POLICY_SECTIONS },
  audienceConfig: { ...DEFAULT_AUDIENCE_CONFIG },
}

import Swal from 'sweetalert2'

export default function Policies() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState('dashboard')
  const [policies, setPolicies] = useState([])
  const [roles, setRoles] = useState([])
  const [departments, setDepartments] = useState([])
  const [categories, setCategories] = useState([]) // Store objects: { id, name, icon_name }
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [trackingData, setTrackingData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [q, setQ] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false)
  const [newAttachment, setNewAttachment] = useState({ name: '', url: '' })
  const [formData, setFormData] = useState(initialFormData)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [policyModalOpen, setPolicyModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewPolicy, setViewPolicy] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [savingPolicy, setSavingPolicy] = useState(false)
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [publishSettings, setPublishSettings] = useState({ ...DEFAULT_AUDIENCE_CONFIG })
  const [savingPublish, setSavingPublish] = useState(false)

  const LABEL_CLS = 'mb-1 block text-sm font-medium text-slate-800'
  const INPUT_CLS = 'h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20'

  const isHR = user?.role === 'hr_admin' || user?.role === 'admin' || user?.role === 'superadmin'

  useEffect(() => {
    if (user?.role === 'employee') {
      navigate('/admin/my-policies', { replace: true })
    }
  }, [user?.role, navigate])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [policiesRes, rolesRes, deptsRes, catsRes] = await Promise.all([
        policyService.list(),
        adminSettingsService.getAllRoles(),
        listDepartments(),
        policyService.listCategories()
      ])
      setPolicies(policiesRes)
      const roleList = rolesRes?.data?.data ?? rolesRes?.data ?? []
      setRoles(Array.isArray(roleList) ? roleList : [])
      const deptList = deptsRes?.departments ?? deptsRes?.records ?? (Array.isArray(deptsRes) ? deptsRes : [])
      setDepartments(deptList)
      setCategories(catsRes)
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    
    // Check for duplicate names (excluding current editing category)
    if (categories.find(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase() && (!editingCategory || c.id !== editingCategory.id))) {
      toast.error('Category already exists')
      return
    }

    try {
      if (editingCategory) {
        const updated = await policyService.updateCategory(editingCategory.id, { 
          name: newCategoryName.trim(), 
          description: editingCategory.description || '',
          iconName: editingCategory.icon_name || 'HiDocumentText' 
        })
        setCategories(prev => prev.map(c => c.id === updated.id ? updated : c))
        toast.success('Category updated')
      } else {
        const created = await policyService.createCategory({ name: newCategoryName.trim() })
        setCategories(prev => [...prev, created])
        toast.success('Category created')
      }
      setNewCategoryName('')
      setEditingCategory(null)
      setModalOpen(false)
    } catch (err) {
      toast.error('Failed to save category')
    }
  }

  const handleDeleteCategory = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Deleting this category may affect linked policies. This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!',
      background: '#ffffff',
      borderRadius: '1rem',
      customClass: {
        popup: 'rounded-2xl border border-slate-200 shadow-xl',
        title: 'text-slate-900 font-bold',
        confirmButton: 'rounded-xl px-6 py-2.5 text-sm font-bold',
        cancelButton: 'rounded-xl px-6 py-2.5 text-sm font-bold'
      }
    })

    if (result.isConfirmed) {
      try {
        await policyService.deleteCategory(id)
        setCategories(prev => prev.filter(c => c.id !== id))
        toast.success('Category deleted')
      } catch (err) {
        toast.error('Failed to delete category')
      }
    }
  }

  const filtered = useMemo(() => {
    let list = policies
    if (categoryFilter) {
      list = list.filter((p) => p.category === categoryFilter)
    }
    if (statusFilter === 'published') {
      list = list.filter((p) => p.status === 'Published')
    } else if (statusFilter === 'draft') {
      list = list.filter((p) => p.status === 'Draft')
    }
    const query = q.trim().toLowerCase()
    if (query) {
      list = list.filter((p) => `${p.title} ${p.category}`.toLowerCase().includes(query))
    }
    return list
  }, [q, policies, categoryFilter, statusFilter])

  const openPolicyModal = (row = null) => {
    setFormData(row ? normalizePolicyForm(row) : { ...initialFormData, sections: { ...EMPTY_POLICY_SECTIONS } })
    setPolicyModalOpen(true)
  }

  const closePolicyModal = () => {
    setPolicyModalOpen(false)
    setFormData({ ...initialFormData, sections: { ...EMPTY_POLICY_SECTIONS } })
  }

  const openPolicyView = async (row) => {
    setViewModalOpen(true)
    setViewPolicy(null)
    setViewLoading(true)
    try {
      const full = await policyService.getOne(row.id)
      setViewPolicy(normalizePolicyForm(full))
    } catch {
      toast.error('Failed to load policy')
      setViewModalOpen(false)
    } finally {
      setViewLoading(false)
    }
  }

  const closePolicyView = () => {
    setViewModalOpen(false)
    setViewPolicy(null)
  }

  const handleEditFromView = () => {
    if (!viewPolicy) return
    const policy = viewPolicy
    closePolicyView()
    openPolicyModal(policy)
  }

  const handleViewCategory = (cat) => {
    setCategoryFilter(cat.name)
    setQ('')
    setActiveView('dashboard')
  }

  const handleOpenTracking = async (policy) => {
    try {
      setSelectedPolicy(policy)
      const data = await policyService.getTracking(policy.id)
      setTrackingData(data)
      setActiveView('tracking')
    } catch (err) {
      toast.error('Failed to load tracking data')
    }
  }

  const handleSave = async (overrideStatus = null, publishConfig = null) => {
    setSavingPolicy(true)
    try {
      const audienceConfig = publishConfig || formData.audienceConfig || { ...DEFAULT_AUDIENCE_CONFIG }
      const payload = {
        title: formData.title,
        category: formData.category,
        version: formData.version || '1.0',
        description: formData.description || '',
        effectiveDate: formData.effectiveDate || null,
        reviewDate: formData.reviewDate || null,
        ackRequired: formData.ackRequired ?? true,
        status: overrideStatus || formData.status || 'Draft',
        sections: formData.sections || { ...EMPTY_POLICY_SECTIONS },
        audienceConfig,
        audience: audienceLabelFromConfig(audienceConfig),
        attachments: formData.attachments || [],
      }

      if (formData.id) {
        await policyService.update(formData.id, payload)
        toast.success('Policy updated successfully')
      } else {
        await policyService.create(payload)
        toast.success('Policy created successfully')
      }
      await fetchData()
      closePolicyModal()
      setActiveView('dashboard')
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Failed to save policy')
    } finally {
      setSavingPolicy(false)
    }
  }

  const confirmPublish = async () => {
    setSavingPublish(true)
    try {
      await handleSave('Published', publishSettings)
      setPublishModalOpen(false)
    } finally {
      setSavingPublish(false)
    }
  }

  const handlePublishFromModal = () => {
    setPublishSettings(formData.audienceConfig || { ...DEFAULT_AUDIENCE_CONFIG })
    setPublishModalOpen(true)
  }

  const updateSection = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      sections: { ...prev.sections, [key]: value },
    }))
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Policy?',
      text: "This will remove the document and all associated tracking data.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      try {
        await policyService.remove(id)
        toast.success('Policy removed')
        fetchData()
      } catch (err) {
        toast.error('Failed to delete policy')
      }
    }
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const columns = [
    {
      key: 'name',
      label: 'Policy',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] shadow-sm">
            <HiDocumentText className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{row.title}</div>
            <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">{row.category || 'Uncategorized'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'audience',
      label: 'Audience',
      render: (v) => <span className="text-sm font-medium text-slate-600">{v || 'All employees'}</span>,
    },
    {
      key: 'ackCount',
      label: 'Acknowledgements',
      render: (v, row) =>
        isHR ? (
          <button
            type="button"
            onClick={() => handleOpenTracking(row)}
            className="text-sm font-bold text-[#0F766E] hover:underline"
          >
            {v || 0}
          </button>
        ) : (
          <span className="text-sm font-bold text-slate-700">{v || 0}</span>
        ),
    },
    {
      key: 'updated_at',
      label: 'Last updated',
      render: (v) => (
        <span className="text-sm font-medium text-slate-600">
          {v ? new Date(v).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        const published = v === 'Published'
        return (
          <div className="flex items-center justify-center">
            <span
              className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold ${
                published ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${published ? 'bg-emerald-500' : 'bg-orange-500'}`} />
              {v || 'Draft'}
            </span>
          </div>
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
            onClick={() => openPolicyView(row)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-[#0F766E] text-white transition-colors hover:bg-[#0d5c56]"
            aria-label="View policy"
          >
            <HiEye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => openPolicyModal(row)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-sky-500 text-white transition-colors hover:bg-sky-600"
            aria-label="Edit policy"
          >
            <HiPencilSquare className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600"
            aria-label="Delete policy"
          >
            <HiTrash className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Top Title Bar — Standardized */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Policy Management</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Compliance</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Policy Listing</span>
          </div>
        </div>
        {isHR && (
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => {
                setEditingCategory(null)
                setNewCategoryName('')
                setModalOpen(true)
              }}
              className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm"
            >
              <HiFolderPlus className="h-4 w-4" /> Add Category
            </button>
            <button
              type="button"
              onClick={() => openPolicyModal()}
              className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
            >
              <HiPlus className="h-4 w-4" /> Add Policy
            </button>
          </div>
        )}
      </div>

      {/* Internal Tabs Navigation */}
      <div className="flex items-center border-b border-slate-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'dashboard', label: 'DASHBOARD', icon: HiDocumentText },
          { id: 'categories', label: 'CATEGORIES', icon: HiFolderPlus }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex shrink-0 items-center gap-3 px-8 pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${
              activeView === tab.id ? 'text-[#0F766E]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {activeView === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0F766E] animate-in fade-in duration-300" />
            )}
          </button>
        ))}
      </div>
      
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0F766E] border-t-transparent" />
          </div>
        )}
        
        {activeView === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Metrics Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
              {[
                { label: 'TOTAL POLICIES', count: policies.length, bgColor: 'bg-[#0F172A]', icon: HiDocumentText, filterId: 'all', onClick: () => { setStatusFilter('all'); setCategoryFilter('') } },
                { label: 'PUBLISHED', count: policies.filter((p) => p.status === 'Published').length, bgColor: 'bg-[#10B981]', icon: HiCheckCircle, filterId: 'published', onClick: () => setStatusFilter('published') },
                { label: 'DRAFTS', count: policies.filter((p) => p.status === 'Draft').length, bgColor: 'bg-[#F59E0B]', icon: HiBellAlert, filterId: 'draft', onClick: () => setStatusFilter('draft') },
                { label: 'ACKNOWLEDGEMENTS', count: policies.reduce((acc, p) => acc + (p.ackCount || 0), 0), bgColor: 'bg-[#3B82F6]', icon: HiShieldCheck, filterId: null, onClick: () => setStatusFilter('all') },
              ].map((card, idx) => {
                const isActive = card.filterId !== null && statusFilter === card.filterId
                return (
                <button
                  key={idx}
                  type="button"
                  onClick={card.onClick}
                  className={`flex items-center gap-3.5 rounded-none border p-4 text-left transition-all hover:bg-slate-50/50 min-w-0 shadow-sm ${
                    isActive ? 'border-[#0F766E] bg-slate-50/40 ring-1 ring-[#0F766E]' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[11px] font-bold uppercase tracking-wider truncate leading-none ${isActive ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                      {card.label}
                    </div>
                    <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
                  </div>
                </button>
                )
              })}
            </div>

            <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
                <h2 className="text-sm font-semibold text-white">Policy Listing</h2>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
                <div className="relative min-w-[250px] flex-1 max-w-md">
                  <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search policy title or category..."
                    className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                  >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <p className="text-xs font-medium text-slate-500">{filtered.length} records shown</p>
                  {(q || categoryFilter || statusFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => { setQ(''); setCategoryFilter(''); setStatusFilter('all') }}
                      className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              </div>

              
            </div>
          </div>
        )}

        {activeView === 'categories' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            

            {categories.length > 0 ? (
              <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
                  <h2 className="text-sm font-semibold text-white">Category listing</h2>
                </div>
                <Table 
                  columns={[
                    { 
                      key: 'name', 
                      label: 'Category',
                      render: (v, row) => (
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-none bg-slate-100 text-slate-600 border border-slate-200">
                            <HiDocumentText className="h-4 w-4" />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleViewCategory(row)}
                            className="text-sm font-semibold text-slate-900 hover:text-[#0F766E] hover:underline text-left"
                          >
                            {v}
                          </button>
                        </div>
                      )
                    },
                    { 
                      key: 'policyCount', 
                      label: 'No. of Policies',
                      render: (v) => <span className="text-sm font-bold text-slate-700">{v ?? 0}</span>
                    },
                    { 
                      key: 'lastUpdated', 
                      label: 'Last Update',
                      render: (v) => (
                        <span className="text-xs text-slate-500">
                          {v ? new Date(v).toLocaleDateString() : '—'}
                        </span>
                      )
                    },
                    {
                      key: 'actions',
                      label: 'Actions',
                      render: (_, row) => (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory(row)
                              setNewCategoryName(row.name)
                              setModalOpen(true)
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-sky-500 text-white transition-colors hover:bg-sky-600"
                            aria-label="Edit category"
                          >
                            <HiPencilSquare className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(row.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600"
                            aria-label="Delete category"
                          >
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    }
                  ]} 
                  data={categories} 
                  pageSize={10} 
                  className="rounded-none"
                />
              </div>
            ) : !loading && (
              <EmptyState 
                title="No Categories Defined"
                description="Build your document taxonomy by creating your first policy category."
                actionLabel="Create Category"
                onAction={() => setModalOpen(true)}
                icon={HiPlus}
              />
            )}
          </div>
        )}

        {activeView === 'tracking' && (
          <div className="animate-in fade-in duration-500 space-y-6">
             <div className="flex items-center justify-between border-b border-slate-200 pb-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveView('dashboard')}
                  className="flex h-10 w-10 items-center justify-center rounded-none bg-slate-100 text-slate-600 transition-all hover:bg-slate-200"
                >
                  <HiChevronRight className="h-5 w-5 rotate-180" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Acknowledgement tracking</h2>
                  <p className="text-sm font-medium text-slate-500">{selectedPolicy?.title}</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
                <h2 className="text-sm font-semibold text-white">Acknowledgement listing</h2>
              </div>
              <Table 
                columns={[
                  {
                    key: 'full_name',
                    label: 'Employee Name',
                    render: (_, row) => (
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-none bg-slate-100 text-slate-600 font-black text-[10px] border border-slate-200">
                          {row.full_name?.charAt(0) || '?'}
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">{row.full_name}</span>
                      </div>
                    )
                  },
                  { key: 'emp_id', label: 'Employee ID', render: (v) => <span className="text-sm text-slate-600">{v || '—'}</span> },
                  { key: 'department', label: 'Department', render: (v) => <span className="text-sm text-slate-600">{v || '—'}</span> },
                  { key: 'job_title', label: 'Job Title', render: (v) => <span className="text-sm text-slate-600">{v || '—'}</span> },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (v) => (
                      <Badge
                        label={v}
                        color={v === 'Acknowledged' ? 'green' : v === 'Pending' ? 'orange' : 'gray'}
                      />
                    )
                  },
                  { 
                    key: 'acknowledged_at', 
                    label: 'Acknowledged On',
                    render: (v) => (
                      <span className="text-sm text-slate-600">
                        {v ? new Date(v).toLocaleDateString() : '—'}
                      </span>
                    )
                  }
                ]} 
                data={trackingData}
                pageSize={10}
                square
              />
            </div>
          </div>
        )}
      </div>

      <PolicyViewModal
        isOpen={viewModalOpen}
        onClose={closePolicyView}
        policy={viewPolicy}
        loading={viewLoading}
        onEdit={isHR ? handleEditFromView : undefined}
      />

      <PolicyFormModal
        isOpen={policyModalOpen}
        onClose={closePolicyModal}
        editMode={!!formData.id}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        updateSection={updateSection}
        onSaveDraft={() => handleSave('Draft')}
        onPublish={handlePublishFromModal}
        onManageAttachments={() => setAttachmentModalOpen(true)}
        saving={savingPolicy || savingPublish}
      />

      <PolicyPublishSettingsModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        settings={publishSettings}
        onChange={setPublishSettings}
        departments={departments}
        roles={roles}
        onConfirm={confirmPublish}
        saving={savingPublish}
      />

      <Modal 
        isOpen={modalOpen} 
        onClose={() => {
          setModalOpen(false)
          setEditingCategory(null)
          setNewCategoryName('')
        }} 
        size="md"
        showClose
        header={
          <div className="flex flex-col gap-1 pr-8">
            <h2 className="text-lg font-bold text-slate-900">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Organize policies into categories for easier browsing and reporting.
            </p>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Category Name"
            placeholder="e.g. Remote Operations"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            inputClassName={INPUT_CLS}
            labelClassName={LABEL_CLS}
          />
          <div className="w-full hidden">
            <label className="mb-1 block text-sm font-medium text-slate-800">Icon</label>
            <div className="grid grid-cols-4 gap-2">
              {[HiDocumentText, HiShieldCheck, HiUserGroup, HiClock].map((Icon, i) => (
                <button key={i} className="flex h-12 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 transition-all hover:border-[#0F766E] hover:text-[#0F766E]">
                  <Icon className="h-6 w-6" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-6 mt-2 border-t border-slate-100">
            <button type="button" onClick={() => setModalOpen(false)} className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={handleAddCategory} className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56]">{editingCategory ? 'Save Changes' : 'Add Category'}</button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={attachmentModalOpen}
        onClose={() => setAttachmentModalOpen(false)}
        title="Manage Supplementary Assets"
        size="md"
      >
        <div className="space-y-6">
          <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
            <p className="text-xs text-emerald-800 leading-relaxed">
              Add links to mandatory PDF forms, Word templates, or external resources that employees should access alongside this policy.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input 
                  label="Asset Name" 
                  placeholder="e.g., Expense Form" 
                  value={newAttachment.name}
                  onChange={(e) => setNewAttachment({ ...newAttachment, name: e.target.value })}
                />
              </div>
              <div className="flex-1">
                 <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload File</label>
                 <input 
                  type="file" 
                  className="hidden" 
                  id="asset-upload"
                  onChange={async (e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    try {
                      toast.loading('Uploading file...')
                      const result = await policyService.upload(file)
                      setFormData({
                        ...formData,
                        attachments: [...(formData.attachments || []), { 
                          name: newAttachment.name || file.name, 
                          url: result.url 
                        }]
                      })
                      setNewAttachment({ name: '', url: '' })
                      toast.dismiss()
                      toast.success('File uploaded')
                    } catch (err) {
                      toast.dismiss()
                      toast.error('Upload failed')
                    }
                  }}
                 />
                 <label 
                  htmlFor="asset-upload"
                  className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-500 hover:border-[#0F766E] hover:text-[#0F766E] cursor-pointer transition-all"
                >
                  <HiArrowDownTray className="h-4 w-4" /> Choose PDF/Doc
                </label>
              </div>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-300 bg-white px-2">Or add external link</div>
            </div>

            <Input 
              label="Resource URL" 
              placeholder="https://..." 
              value={newAttachment.url}
              onChange={(e) => setNewAttachment({ ...newAttachment, url: e.target.value })}
            />
            <Button 
              label="Add External Link" 
              variant="ghost" 
              className="w-full border-slate-200"
              onClick={() => {
                if (!newAttachment.name || !newAttachment.url) return
                setFormData({
                  ...formData,
                  attachments: [...(formData.attachments || []), newAttachment]
                })
                setNewAttachment({ name: '', url: '' })
              }}
            />
          </div>

          {formData.attachments?.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Attachments</h4>
              <div className="space-y-2">
                {formData.attachments.map((asset, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#0F766E]">
                        <HiDocumentText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700">{asset.name}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{asset.url}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const next = formData.attachments.filter((_, i) => i !== idx)
                        setFormData({ ...formData, attachments: next })
                      }}
                      className="h-8 w-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center"
                    >
                      <HiXMark className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button label="Done" variant="secondary" onClick={() => setAttachmentModalOpen(false)} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
