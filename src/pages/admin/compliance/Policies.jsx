import { useMemo, useState } from 'react'
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
  category: 'HR Policies',
  version: '1.0',
  description: '',
  effectiveDate: '',
  reviewDate: '',
  ackRequired: true,
  audience: 'All Employees',
  status: 'Draft',
  attachments: []
}

import Swal from 'sweetalert2'

export default function Policies() {
  const { user } = useAuth()
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

  const isHR = user?.role === 'hr_admin' || user?.role === 'admin' || user?.role === 'superadmin'

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
      setRoles(rolesRes?.data?.data || [])
      setDepartments((deptsRes?.departments ?? deptsRes) || [])
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
    const query = q.trim().toLowerCase()
    if (!query) return policies
    return policies.filter((p) => `${p.title} ${p.category}`.toLowerCase().includes(query))
  }, [q, policies])

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

  const handleSave = async (overrideStatus = null) => {
    try {
      const payload = { 
        ...formData, 
        status: overrideStatus || formData.status || 'Draft',
        effectiveDate: formData.effectiveDate || null,
        reviewDate: formData.reviewDate || null
      }

      if (payload.id) {
        await policyService.update(payload.id, payload)
        toast.success('Policy updated successfully')
      } else {
        await policyService.create(payload)
        toast.success('Policy created successfully')
      }
      await fetchData()
      setActiveView('dashboard')
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Failed to save policy directive')
    }
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
      label: 'Policy Name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F766E]/10 text-[#0F766E]">
            <HiDocumentText className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.title}</div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{row.category}</div>
          </div>
        </div>
      ),
    },
    { 
      key: 'ackCount', 
      label: 'Acks',
      render: (v) => <span className="font-medium text-slate-600">{v || 0}</span>
    },
    { 
      key: 'updated_at', 
      label: 'Updated',
      render: (v) => <span className="text-xs text-slate-500">{new Date(v).toLocaleDateString()}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={v === 'Published' ? 'green' : 'orange'} variant="outline" />,
    },
    {
      key: 'ack_required',
      label: 'Ack Required',
      render: (v) => (
        <div className="flex items-center gap-1.5">
          {v ? <HiCheckCircle className="h-4 w-4 text-emerald-500" /> : <HiXCircle className="h-4 w-4 text-slate-300" />}
          <span className="text-xs font-medium text-slate-600">{v ? 'Yes' : 'No'}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1">
          <Button
            label="Edit"
            variant="ghost"
            size="sm"
            icon={HiPencilSquare}
            onClick={() => {
              setFormData(row)
              setActiveView('editor')
            }}
          />
          {isHR && (
            <Button
              label="Track"
              variant="ghost"
              size="sm"
              icon={HiUserGroup}
              onClick={() => handleOpenTracking(row)}
            />
          )}
          {isHR && (
            <Button
              variant="ghost"
              size="sm"
              icon={HiTrash}
              className="text-red-500 hover:bg-red-50"
              onClick={() => handleDelete(row.id)}
            />
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Top Title Bar — Standardized */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Governance & Compliance</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Compliance</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Policy Registry</span>
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
              onClick={() => {
                setFormData(initialFormData)
                setActiveView('editor')
              }}
              className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
            >
              <HiPlus className="h-4 w-4" /> New Policy
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
              {[
                { label: 'TOTAL POLICIES', count: policies.length, bgColor: 'bg-[#0F172A]', icon: HiDocumentText },
                { label: 'ACKNOWLEDGEMENTS', count: policies.reduce((acc, p) => acc + (p.ackCount || 0), 0), bgColor: 'bg-[#10B981]', icon: HiShieldCheck },
                { label: 'DRAFT DIRECTIVES', count: policies.filter(p => p.status === 'Draft').length, bgColor: 'bg-[#F59E0B]', icon: HiBellAlert }
              ].map((card, idx) => (
                <div key={idx} className="flex items-center gap-3.5 rounded-none border border-slate-200 bg-white p-4 shadow-sm min-w-0">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate leading-none">
                      {card.label}
                    </div>
                    <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              {/* Search & Filters */}
              <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-6 md:flex-row md:items-end">
                  <div className="flex-1">
                    <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Registry</label>
                    <div className="relative">
                      <HiMagnifyingGlass className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="ENTER POLICY IDENTIFIER..."
                        className="w-full rounded-none border border-slate-200 bg-slate-50/50 h-12 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] focus:bg-white outline-none transition-all"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-64">
                    <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label>
                    <select className="w-full rounded-none border border-slate-200 bg-slate-50/50 h-12 px-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] focus:bg-white outline-none transition-all cursor-pointer">
                      <option>ALL CATEGORIES</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <button className="h-12 px-8 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
                     REFINE
                  </button>
                </div>
              </div>

              {filtered.length > 0 ? (
                <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
                    <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Policy Registry</h2>
                    <div className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Master Repository</div>
                  </div>
                  <Table columns={columns} data={filtered} pageSize={10} className="rounded-none" />
                </div>
              ) : !loading && (
                <EmptyState
                  title="No Policies Available"
                  description="Your policy registry is currently empty. Start by creating a new directive to maintain organizational compliance."
                  image="/global_no_data.png"
                  actionLabel={isHR ? "Create Your First Policy" : null}
                  icon={HiPlus}
                  onAction={() => {
                    setFormData(initialFormData)
                    setActiveView('editor')
                  }}
                />
              )}
            </div>
          </div>
        )}

        {activeView === 'categories' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="rounded-none border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest border-l-4 border-[#0F766E] pl-3">Category Taxonomy</h3>
                  <p className="text-xs text-slate-500 mt-2 font-medium">ORGANIZE POLICIES INTO FUNCTIONAL DOMAINS FOR SYSTEMIC ACCESSIBILITY.</p>
                </div>
                <div className="flex items-center gap-6">
                   <div className="text-right">
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Domains</div>
                     <div className="text-2xl font-black text-slate-900">{categories.length}</div>
                   </div>
                </div>
              </div>
            </div>

            {categories.length > 0 ? (
              <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
                <Table 
                  columns={[
                    { 
                      key: 'name', 
                      label: 'Functional Domain',
                      render: (v) => (
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-none bg-slate-100 text-slate-600 border border-slate-200">
                            <HiDocumentText className="h-4 w-4" />
                          </div>
                          <span className="font-black text-slate-900 uppercase text-[11px] tracking-tight">{v}</span>
                        </div>
                      )
                    },
                    { 
                      key: 'id', 
                      label: 'System Identifier',
                      render: (v) => <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DOM-{v}</span>
                    },
                    {
                      key: 'actions',
                      label: 'Governance',
                      render: (_, row) => (
                        <div className="flex gap-4">
                          <button 
                            onClick={() => {
                              setEditingCategory(row)
                              setNewCategoryName(row.name)
                              setModalOpen(true)
                            }}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0F766E]"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(row.id)}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500"
                          >
                            Delete
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

        {activeView === 'editor' && (
          <div className="animate-in slide-in-from-right-10 duration-500 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveView('dashboard')}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200"
                >
                  <HiChevronRight className="h-5 w-5 rotate-180" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{formData.title || 'New Policy Directive'}</h2>
                  <p className="text-sm text-slate-500">{formData.category || 'Creating new document'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button label="Save Draft" variant="ghost" icon={HiPencilSquare} onClick={() => handleSave('Draft')} />
                <Button label="Publish" variant="primary" icon={HiShieldCheck} onClick={() => handleSave('Published')} />
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-4">
              <div className="lg:col-span-3 space-y-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-[#0F766E]/30">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#0F766E]" /> Policy Content & Directives
                  </h3>
                  <textarea 
                    className="w-full min-h-[500px] rounded-2xl bg-slate-50/50 p-6 text-slate-700 text-base focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all resize-none border border-slate-100"
                    placeholder="Draft your policy here... Use clear, concise language to define organizational standards."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Document Meta</h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Policy Title</label>
                      <input 
                        type="text"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-sm focus:border-[#0F766E] focus:outline-none transition-all"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g. Work From Home Policy"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                      <select 
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-sm focus:border-[#0F766E] focus:outline-none transition-all"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Effective Date</label>
                        <input 
                          type="date"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-sm focus:border-[#0F766E] focus:outline-none transition-all"
                          value={formData.effectiveDate || ''}
                          onChange={(e) => setFormData({...formData, effectiveDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Review Date</label>
                        <input 
                          type="date"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-sm focus:border-[#0F766E] focus:outline-none transition-all"
                          value={formData.reviewDate || ''}
                          onChange={(e) => setFormData({...formData, reviewDate: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                  <HiArrowDownTray className="h-8 w-8 text-emerald-400/50" />
                  <h3 className="mt-4 font-bold">Assets & Forms</h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {formData.attachments?.length || 0} supplementary documents attached.
                  </p>
                  <button 
                    onClick={() => setAttachmentModalOpen(true)}
                    className="mt-6 w-full rounded-xl bg-white/10 py-3 text-xs font-bold text-white transition-all hover:bg-white/20 border border-white/10 flex items-center justify-center gap-2"
                  >
                    <HiPlus className="h-3.5 w-3.5" /> Manage Assets
                  </button>

                  {formData.attachments?.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
                      {formData.attachments.map((asset, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-lg bg-white/5 p-2 text-[10px] hover:bg-white/10 transition-all">
                          <span className="truncate max-w-[120px] font-medium">{asset.name}</span>
                          <button 
                            onClick={() => {
                              const next = formData.attachments.filter((_, i) => i !== idx)
                              setFormData({ ...formData, attachments: next })
                            }}
                            className="text-white/40 hover:text-red-400 transition-colors"
                          >
                            <HiXMark className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Acknowledgement Audit</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedPolicy?.title}</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
              <Table 
                columns={[
                  {
                    key: 'full_name',
                    label: 'Asset Holder',
                    render: (_, row) => (
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-none bg-slate-100 text-slate-600 font-black text-[10px] border border-slate-200">
                          {row.full_name?.charAt(0) || '?'}
                        </div>
                        <div className="font-black text-slate-900 uppercase text-[11px] tracking-tight">{row.full_name}</div>
                      </div>
                    )
                  },
                  { key: 'emp_id', label: 'Employee Identifier', render: (v) => <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{v}</span> },
                  { key: 'department', label: 'Business Unit', render: (v) => <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{v}</span> },
                  {
                    key: 'status',
                    label: 'Audit Status',
                    render: (v) => <Badge label={v.toUpperCase()} color={v === 'Acknowledged' ? 'green' : 'orange'} className="rounded-none text-[9px] font-black tracking-widest" />
                  },
                  { 
                    key: 'acknowledged_at', 
                    label: 'Timestamp',
                    render: (v) => v ? <span className="text-[10px] font-bold text-slate-500">{new Date(v).toLocaleString()}</span> : <span className="text-[10px] font-bold text-slate-300 italic">PENDING</span>
                  }
                ]} 
                data={trackingData} 
                pageSize={10} 
                className="rounded-none"
              />
            </div>
          </div>
        )}
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => {
          setModalOpen(false)
          setEditingCategory(null)
          setNewCategoryName('')
        }} 
        title={editingCategory ? "Update Category" : "Create Policy Category"} 
        size="md"
      >
        <div className="space-y-4">
          <Input 
            label="Category Name" 
            placeholder="e.g., Remote Operations" 
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <div className="w-full">
            <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Icon Representation</label>
            <div className="grid grid-cols-4 gap-2">
              {[HiDocumentText, HiShieldCheck, HiUserGroup, HiClock].map((Icon, i) => (
                <button key={i} className="flex h-12 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 transition-all hover:border-[#0F766E] hover:text-[#0F766E]">
                  <Icon className="h-6 w-6" />
                </button>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button label="Cancel" variant="ghost" onClick={() => setModalOpen(false)} />
            <Button label={editingCategory ? "Save Changes" : "Add Category"} variant="primary" onClick={handleAddCategory} />
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
