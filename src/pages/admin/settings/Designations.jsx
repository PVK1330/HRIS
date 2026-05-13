import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  HiBriefcase,
  HiChevronDown,
  HiDocumentArrowDown,
  HiMagnifyingGlass,
  HiPencilSquare,
  HiPlus,
  HiTrash,
  HiXMark,
  HiCheckBadge,
  HiUserCircle,
  HiTag,
} from 'react-icons/hi2'
import Swal from 'sweetalert2'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { listDepartments } from '../../../services/departmentService'
import {
  createDesignation,
  deleteDesignation,
  listDesignations,
  updateDesignation,
} from '../../../services/designationService'
import { triggerExport } from '../../../utils/exportHelper'

const initialFormData = {
  designationName: '',
  departmentId: '',
  description: '',
  status: '',
}

export default function DesignationsManagement() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [designationList, setDesignationList] = useState([])
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [desPage, setDesPage] = useState(1)
  const [desTotal, setDesTotal] = useState(0)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [departmentFilterId, setDepartmentFilterId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const exportRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setDesPage(1)
  }, [debouncedSearch, statusFilter, departmentFilterId])

  const fetchDesignations = async () => {
    try {
      setLoading(true)
      const statusParam = statusFilter === 'all' ? 'all' : statusFilter
      const params = {
        page: desPage,
        limit: 10,
        search: debouncedSearch,
        status: statusParam,
      }
      if (departmentFilterId) params.departmentId = Number(departmentFilterId)
      const data = await listDesignations(params)
      setDesignationList(data?.designations ?? data?.records ?? [])
      setDesTotal(data?.total ?? data?.pagination?.total ?? 0)
    } catch (err) {
      console.error('Failed to fetch designations:', err)
      toast.error('Failed to load designations.')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const data = await listDepartments({ limit: 500, status: 'active' })
      setDepartmentOptions(data?.departments ?? data?.records ?? [])
    } catch (err) {
      console.error('Failed to fetch departments:', err)
      setDepartmentOptions([])
    }
  }

  React.useEffect(() => {
    fetchDesignations()
  }, [debouncedSearch, statusFilter, departmentFilterId, desPage])

  React.useEffect(() => {
    fetchDepartments()
  }, [])

  React.useEffect(() => {
    if (!modalOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') handleCloseModal()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [modalOpen])

  React.useEffect(() => {
    const onOutsideClick = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setExportOpen(false)
      }
    }
    if (exportOpen) document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [exportOpen])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setFormData(initialFormData)
    setEditMode(false)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    const payload = {
      name: formData.designationName,
      department_id: Number(formData.departmentId),
      isActive: formData.status === 'Active',
    }
    if (editMode) {
      payload.description = formData.description?.trim() ? formData.description.trim() : null
    } else if (formData.description?.trim()) {
      payload.description = formData.description.trim()
    }

    try {
      if (editMode) {
        await updateDesignation(editingId, payload)
        toast.success('Designation updated.')
      } else {
        await createDesignation(payload)
        toast.success('Designation created.')
      }
      handleCloseModal()
      fetchDesignations()
    } catch (err) {
      console.error('Failed to submit designation:', err)
      toast.error(err?.response?.data?.message || 'Failed to save designation.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (item) => {
    setFormData({
      designationName: item.name ?? '',
      departmentId: item.department_id ? String(item.department_id) : '',
      description: item.description ?? '',
      status: item.status ?? (item.is_active ? 'Active' : 'Inactive'),
    })
    setEditingId(item.id)
    setEditMode(true)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'The designation will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    })
    if (!result.isConfirmed) return

    try {
      await deleteDesignation(id)
      toast.success('Designation deleted.')
      fetchDesignations()
    } catch (err) {
      console.error('Failed to delete designation:', err)
      toast.error('Failed to delete designation.')
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Designation',
      render: (v) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] shadow-sm">
            <HiBriefcase className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold text-slate-900">{v}</span>
        </div>
      ),
    },
    {
      key: 'department_name',
      label: 'Department Name',
      render: (v) => <span className="text-sm font-medium text-slate-600">{v || '-'}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      render: (v) => (
        <span className="max-w-[220px] truncate text-sm text-slate-600" title={v || ''}>
          {v || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        const isActive = v === 'Active'
        return (
          <div className="flex items-center justify-center">
            <span
              className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {isActive ? 'Active' : 'Inactive'}
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
            onClick={() => handleEdit(row)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-sky-500 text-white transition-colors hover:bg-sky-600"
            aria-label="Edit designation"
          >
            <HiPencilSquare className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600"
            aria-label="Delete designation"
          >
            <HiTrash className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  const runServerExport = async (type) => {
    const ext = type === 'pdf' ? 'pdf' : 'xlsx'
    const today = new Date().toISOString().slice(0, 10)
    const filename = `designations_${today}.${ext}`
    const statusParam = statusFilter === 'all' ? 'all' : statusFilter
    const filters = {
      search: debouncedSearch,
      status: statusParam,
    }
    if (departmentFilterId) filters.department_id = Number(departmentFilterId)
    setExportLoading(true)
    const tid = toast.loading('Preparing export…')
    try {
      await triggerExport('designations', filters, type, filename)
      toast.success('Export ready.', { id: tid })
    } catch (err) {
      console.error(err)
      toast.error('Export failed.', { id: tid })
    } finally {
      setExportLoading(false)
      setExportOpen(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Top Title Bar with Moved Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Designations Management</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Designations</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Designation Listing</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={exportRef}>
            <button
              type="button"
              disabled={exportLoading}
              onClick={() => setExportOpen((prev) => !prev)}
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
                  onClick={() => runServerExport('pdf')}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  <HiDocumentArrowDown className="h-4 w-4 text-slate-500" />
                  Export as PDF
                </button>
                <button
                  type="button"
                  disabled={exportLoading}
                  onClick={() => runServerExport('excel')}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  <HiDocumentArrowDown className="h-4 w-4 text-slate-500" />
                  Export as Excel
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
          >
            <HiPlus className="h-4 w-4" /> Add Designation
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          {
            label: 'TOTAL DESIGNATIONS',
            count: desTotal || designationList.length || 0,
            bgColor: 'bg-[#0F172A]',
            icon: HiBriefcase,
            onClickFilter: () => setStatusFilter('all'),
            filterId: 'all'
          },
          {
            label: 'ACTIVE',
            count: designationList.filter(d => d.status === 'Active' || d.is_active).length || 0,
            bgColor: 'bg-[#10B981]',
            icon: HiCheckBadge,
            onClickFilter: () => setStatusFilter('active'),
            filterId: 'active'
          },
          {
            label: 'INACTIVE',
            count: designationList.filter(d => d.status === 'Inactive' || d.status === 'Archived' || (!d.is_active && d.status !== 'Active')).length || 0,
            bgColor: 'bg-[#EF4444]',
            icon: HiUserCircle,
            onClickFilter: () => setStatusFilter('inactive'),
            filterId: 'inactive'
          },
          {
            label: 'DEPARTMENTS MAPPED',
            count: new Set(designationList.map(d => d.department_name).filter(Boolean)).size || 0,
            bgColor: 'bg-[#3B82F6]',
            icon: HiTag,
            onClickFilter: () => setStatusFilter('all'),
            filterId: null
          }
        ].map((card, idx) => {
          const isActiveFilter = card.filterId !== null && statusFilter === card.filterId;
          return (
            <button
              key={idx}
              type="button"
              onClick={card.onClickFilter}
              title={`Filter by ${card.label}`}
              className={`group flex items-center gap-3.5 rounded-none border p-4 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] min-w-0 shadow-sm ${isActiveFilter
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

      {/* Main Table Registry Area */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-800">Designation Listing</h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative min-w-[200px] flex-1 max-w-md">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search designation or department..."
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
              />
            </div>
            <select
              value={departmentFilterId}
              onChange={(e) => setDepartmentFilterId(e.target.value)}
              className="h-10 min-w-[180px] rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer"
            >
              <option value="">All departments</option>
              {departmentOptions.map((d) => (
                <option key={d.id} value={String(d.id)}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-slate-500">{desTotal} records shown</p>
            {search || departmentFilterId || statusFilter !== 'all' ? (
              <button
                type="button"
                onClick={() => { setSearch(''); setDepartmentFilterId(''); setStatusFilter('all') }}
                className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
              >
                Reset Filters
              </button>
            ) : null}
          </div>
        </div>

        <Table
          columns={columns}
          data={designationList}
          pageSize={10}
          loading={loading}
          square
          totalCount={desTotal}
          currentPage={desPage - 1}
          onPageChange={(idx) => setDesPage(idx + 1)}
        />
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        size="md"
        showClose
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">
              {editMode ? 'Edit Designation' : 'Add New Designation'}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Configure organizational roles and department mappings below.
            </p>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="pt-2">
          <div className="space-y-4">
            <Input
              label="Designation Name"
              name="designationName"
              value={formData.designationName}
              onChange={handleFormChange}
              placeholder="Enter designation name"
              required
              inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
              labelClassName="mb-1 block text-sm font-medium text-slate-800"
            />
            <Input
              label="Department Name"
              name="departmentId"
              type="select"
              value={formData.departmentId}
              onChange={handleFormChange}
              placeholder="Select department"
              required
              options={departmentOptions.map((d) => ({ label: d.name, value: String(d.id) }))}
              inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
              labelClassName="mb-1 block text-sm font-medium text-slate-800"
            />
            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Optional description"
              inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
              labelClassName="mb-1 block text-sm font-medium text-slate-800"
            />
            <Input
              label="Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleFormChange}
              placeholder="Select"
              required
              options={[
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' },
              ]}
              inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
              labelClassName="mb-1 block text-sm font-medium text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseModal}
              className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving…' : editMode ? 'Save Changes' : 'Add Designation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}