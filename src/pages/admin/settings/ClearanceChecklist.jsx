import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  HiClipboardDocumentCheck,
  HiMagnifyingGlass,
  HiPencilSquare,
  HiPlus,
  HiTrash,
} from 'react-icons/hi2'
import Swal from 'sweetalert2'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import {
  listClearanceTemplates,
  createClearanceTemplate,
  updateClearanceTemplate,
  deleteClearanceTemplate,
} from '../../../services/exitManagementService'

const DEPARTMENT_OPTIONS = [
  { value: 'IT', label: 'IT' },
  { value: 'HR', label: 'HR' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Security', label: 'Security' },
]

const initialFormData = { department: '', task_name: '', sort_order: '', status: 'Active' }

export default function ClearanceChecklistSettings({ embedded = false }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [templateList, setTemplateList] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch, statusFilter])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const data = await listClearanceTemplates({
        page, limit: 20, search: debouncedSearch,
        status: statusFilter === 'all' ? 'all' : statusFilter,
      })
      const records = data?.records ?? []
      setTemplateList(Array.isArray(records) ? records : [])
      setTotal(data?.pagination?.total ?? records.length)
    } catch {
      toast.error('Failed to load clearance templates.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTemplates() }, [debouncedSearch, statusFilter, page])

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
      department: formData.department,
      task_name: formData.task_name.trim(),
      sort_order: Number(formData.sort_order) || 0,
      isActive: formData.status === 'Active',
    }

    try {
      if (editMode) {
        await updateClearanceTemplate(editingId, payload)
        toast.success('Clearance task updated.')
      } else {
        await createClearanceTemplate(payload)
        toast.success('Clearance task created.')
      }
      handleCloseModal()
      fetchTemplates()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save clearance task.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (item) => {
    setFormData({
      department: item.department ?? '',
      task_name: item.task_name ?? '',
      sort_order: String(item.sort_order ?? 0),
      status: item.is_active ? 'Active' : 'Inactive',
    })
    setEditingId(item.id)
    setEditMode(true)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete this task?',
      text: 'This clearance task template will be permanently removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    })
    if (!result.isConfirmed) return

    try {
      await deleteClearanceTemplate(id)
      toast.success('Clearance task deleted.')
      fetchTemplates()
    } catch {
      toast.error('Failed to delete clearance task.')
    }
  }

  const columns = [
    {
      key: 'department',
      label: 'Department',
      render: (v) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-teal-50 text-[#0F766E] shadow-sm">
            <HiClipboardDocumentCheck className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold text-slate-900">{v}</span>
        </div>
      ),
    },
    {
      key: 'task_name',
      label: 'Task Name',
      render: (v) => <span className="text-sm text-slate-700">{v}</span>,
    },
    {
      key: 'sort_order',
      label: 'Order',
      render: (v) => <span className="text-sm font-medium text-slate-600">{v}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        const isActive = v === 'Active'
        return (
          <div className="flex items-center justify-center">
            <span className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {v}
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
          <button type="button" onClick={() => handleEdit(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-sky-500 text-white transition-colors hover:bg-sky-600" aria-label="Edit">
            <HiPencilSquare className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => handleDelete(row.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600" aria-label="Delete">
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
      <HiPlus className="h-3.5 w-3.5" /> Add Task
    </button>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {embedded ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">Default tasks assigned automatically during employee exit.</p>
          {addButton}
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 truncate">Clearance Checklist</h1>
            <p className="mt-1 text-sm text-gray-500">Exit settings · clearance task templates</p>
          </div>
          {addButton}
        </div>
      )}

      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 bg-slate-50/60 px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Clearance tasks</h2>
          <span className="text-xs font-medium text-gray-500">{total} tasks</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative min-w-[200px] flex-1 max-w-md">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 min-w-[140px] rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer">
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <Table columns={columns} data={templateList} pageSize={20} loading={loading} square totalCount={total} currentPage={page - 1} onPageChange={(idx) => setPage(idx + 1)} />
      </div>

      <div className="rounded-none border border-blue-200 bg-blue-50 p-4">
        <p className="text-xs font-medium text-blue-800">
          These templates define the default clearance tasks that are automatically assigned when an exit is approved or a termination is initiated. You can add, edit, or remove tasks as needed. Only active tasks will be used.
        </p>
      </div>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} size="md" showClose header={
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-slate-900">{editMode ? 'Edit Clearance Task' : 'Add Clearance Task'}</h2>
          <p className="text-xs font-medium text-slate-500">Configure the default clearance task template.</p>
        </div>
      }>
        <form onSubmit={handleSubmit} className="pt-2">
          <div className="space-y-4">
            <Input label="Department" name="department" type="select" value={formData.department} onChange={handleFormChange} placeholder="Select department" required options={DEPARTMENT_OPTIONS} inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20" labelClassName="mb-1 block text-sm font-medium text-slate-800" />
            <Input label="Task Name" name="task_name" value={formData.task_name} onChange={handleFormChange} placeholder="e.g. Collect laptop & peripherals" required inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20" labelClassName="mb-1 block text-sm font-medium text-slate-800" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Sort Order" name="sort_order" type="number" value={formData.sort_order} onChange={handleFormChange} placeholder="0" inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20" labelClassName="mb-1 block text-sm font-medium text-slate-800" />
              <Input label="Status" name="status" type="select" value={formData.status} onChange={handleFormChange} required options={[{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }]} inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20" labelClassName="mb-1 block text-sm font-medium text-slate-800" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
            <button type="button" onClick={handleCloseModal} className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? 'Saving…' : editMode ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
