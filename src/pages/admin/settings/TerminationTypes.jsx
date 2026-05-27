import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  HiArrowRightOnRectangle,
  HiCheckBadge,
  HiMagnifyingGlass,
  HiPencilSquare,
  HiPlus,
  HiTrash,
  HiXCircle,
} from 'react-icons/hi2'
import Swal from 'sweetalert2'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import {
  listTerminationTypes,
  createTerminationType,
  updateTerminationType,
  deleteTerminationType,
} from '../../../services/exitManagementService'

const initialFormData = {
  name: '',
  description: '',
  status: '',
}

export default function TerminationTypes({ embedded = false }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typesList, setTypesList] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  const fetchTypes = async () => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 10,
        search: debouncedSearch,
        status: statusFilter === 'all' ? 'all' : statusFilter,
      }
      const data = await listTerminationTypes(params)
      const records = data?.records ?? data?.terminationTypes ?? []
      setTypesList(Array.isArray(records) ? records : Array.isArray(data) ? data : [])
      setTotal(data?.pagination?.total ?? data?.total ?? (Array.isArray(records) ? records.length : 0))
    } catch (err) {
      console.error('Failed to fetch termination types:', err)
      toast.error('Failed to load termination types.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTypes()
  }, [debouncedSearch, statusFilter, page])

  useEffect(() => {
    if (!modalOpen) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') handleCloseModal()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [modalOpen])

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
      name: formData.name.trim(),
      isActive: formData.status === 'Active',
    }
    if (editMode) {
      payload.description = formData.description?.trim() ? formData.description.trim() : null
    } else if (formData.description?.trim()) {
      payload.description = formData.description.trim()
    }

    try {
      if (editMode) {
        await updateTerminationType(editingId, payload)
        toast.success('Termination type updated.')
      } else {
        await createTerminationType(payload)
        toast.success('Termination type created.')
      }
      handleCloseModal()
      fetchTypes()
    } catch (err) {
      console.error('Failed to submit termination type:', err)
      toast.error(err?.response?.data?.message || 'Failed to save termination type.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (item) => {
    setFormData({
      name: item.name ?? '',
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
      text: 'This termination type will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    })
    if (!result.isConfirmed) return

    try {
      await deleteTerminationType(id)
      toast.success('Termination type deleted.')
      fetchTypes()
    } catch (err) {
      console.error('Failed to delete termination type:', err)
      toast.error('Failed to delete termination type.')
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (v) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] shadow-sm">
            <HiArrowRightOnRectangle className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold text-slate-900">{v}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (v) => (
        <span className="max-w-[280px] truncate text-sm text-slate-600" title={v || ''}>
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
              className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold ${
                isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
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
            aria-label="Edit termination type"
          >
            <HiPencilSquare className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600"
            aria-label="Delete termination type"
          >
            <HiTrash className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  const addButton = (
    <button
      type="button"
      onClick={() => setModalOpen(true)}
      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-none bg-[#0F766E] px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0c6b64]"
    >
      <HiPlus className="h-3.5 w-3.5" /> Add Type
    </button>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {embedded ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">Define reasons used when processing employee exits.</p>
          {addButton}
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 truncate">Termination Types</h1>
            <p className="mt-1 text-sm text-gray-500">Exit settings · termination reasons</p>
          </div>
          {addButton}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3 min-w-0">
        {[
          {
            label: 'TOTAL TYPES',
            count: total || typesList.length || 0,
            bgColor: 'bg-[#0F172A]',
            icon: HiArrowRightOnRectangle,
            filterId: 'all',
          },
          {
            label: 'ACTIVE',
            count: typesList.filter((t) => t.status === 'Active' || t.is_active).length || 0,
            bgColor: 'bg-[#10B981]',
            icon: HiCheckBadge,
            filterId: 'active',
          },
          {
            label: 'INACTIVE',
            count: typesList.filter((t) => t.status === 'Inactive' || (!t.is_active && t.status !== 'Active')).length || 0,
            bgColor: 'bg-[#EF4444]',
            icon: HiXCircle,
            filterId: 'inactive',
          },
        ].map((card, idx) => {
          const isActiveFilter = statusFilter === card.filterId
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setStatusFilter(card.filterId)}
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
          )
        })}
      </div>

      {/* Table Area */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-slate-50/60 px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Termination types</h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative min-w-[200px] flex-1 max-w-md">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search termination types..."
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 min-w-[140px] rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-slate-500">{total} records shown</p>
            {search || statusFilter !== 'all' ? (
              <button
                type="button"
                onClick={() => { setSearch(''); setStatusFilter('all') }}
                className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
              >
                Reset Filters
              </button>
            ) : null}
          </div>
        </div>

        <Table
          columns={columns}
          data={typesList}
          pageSize={10}
          loading={loading}
          square
          totalCount={total}
          currentPage={page - 1}
          onPageChange={(idx) => setPage(idx + 1)}
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        size="md"
        showClose
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">
              {editMode ? 'Edit Termination Type' : 'Add Termination Type'}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Configure exit termination type details below.
            </p>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="pt-2">
          <div className="space-y-4">
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="Enter termination type name"
              required
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
              {submitting ? 'Saving…' : editMode ? 'Save Changes' : 'Add Type'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
