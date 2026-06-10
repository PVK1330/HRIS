import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import {
  HiBuildingOffice,
  HiChevronDown,
  HiPencilSquare,
  HiTrash,
  HiXMark,
  HiPlus,
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiBriefcase,
  HiDocumentArrowDown,
  HiUserGroup,
  HiCheckBadge,
  HiUserCircle,
  HiUser,
} from 'react-icons/hi2'
import {
  listDepartments,
  listDepartmentManagers,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../../../services/departmentService'
import { triggerExport } from '../../../utils/exportHelper'
import Swal from 'sweetalert2'

const initialFormData = {
  departmentName: '',
  description: '',
  managerId: '',
  status: '',
}

export default function DepartmentManagement() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState(initialFormData)
  const [search, setSearch] = useState('')
  const [departmentList, setDepartmentList] = useState([])
  const [deptPage, setDeptPage] = useState(1)
  const [deptTotal, setDeptTotal] = useState(0)
  const [deptStats, setDeptStats] = useState(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [managerOptions, setManagerOptions] = useState([])
  const [managerSearch, setManagerSearch] = useState('')
  const [debouncedManagerSearch, setDebouncedManagerSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const exportRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setDeptPage(1)
  }, [debouncedSearch, statusFilter])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const statusParam = statusFilter === 'all' ? 'all' : statusFilter
      const data = await listDepartments({
        page: deptPage,
        limit: 10,
        search: debouncedSearch,
        status: statusParam,
      })
      setDepartmentList(data?.departments ?? data?.records ?? [])
      setDeptTotal(data?.total ?? data?.pagination?.total ?? 0)
      setDeptStats(data?.stats ?? null)
    } catch (err) {
      console.error('Failed to fetch departments:', err)
      toast.error('Failed to load departments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [debouncedSearch, statusFilter, deptPage])

  const fetchManagers = async (searchTerm = '') => {
    try {
      const { records } = await listDepartmentManagers({ search: searchTerm, limit: 50 })
      setManagerOptions(Array.isArray(records) ? records : [])
    } catch (err) {
      console.error('Failed to fetch department managers:', err)
      setManagerOptions([])
    }
  }

  // Debounce the Head-of-Department search so any employee is reachable via the
  // server (the old picker returned a flat 500 with no search — anyone past that
  // was unselectable). Refetch the page whenever the debounced term changes.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedManagerSearch(managerSearch.trim()), 300)
    return () => clearTimeout(t)
  }, [managerSearch])

  React.useEffect(() => {
    fetchManagers(debouncedManagerSearch)
  }, [debouncedManagerSearch])

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

    if (exportOpen) {
      document.addEventListener('mousedown', onOutsideClick)
    }

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
    setManagerSearch('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const payload = {
        name: formData.departmentName,
        ...(formData.description ? { description: formData.description } : {}),
        ...(formData.managerId ? { manager_id: Number(formData.managerId) } : {}),
        isActive: formData.status === 'Active'
      }

      if (editMode) {
        await updateDepartment(editingId, payload)
        toast.success('Department updated.')
      } else {
        await createDepartment(payload)
        toast.success('Department created.')
      }
      handleCloseModal()
      fetchDepartments()
    } catch (err) {
      console.error('Submission failed:', err)
      toast.error(err?.response?.data?.message || 'Could not save department.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'The department will be marked inactive (soft delete).',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    })
    if (!result.isConfirmed) return

    try {
      await deleteDepartment(id)
      toast.success('Department archived.')
      fetchDepartments()
    } catch (err) {
      // 409 = employees still assigned. Surface the count and let the admin
      // explicitly confirm archiving anyway (force).
      if (err?.response?.status === 409) {
        const msg = err?.response?.data?.message || 'Employees are still assigned to this department.'
        const confirm = await Swal.fire({
          title: 'Employees still assigned',
          text: `${msg} Archive it anyway?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#0F766E',
          confirmButtonText: 'Archive anyway',
        })
        if (!confirm.isConfirmed) return
        try {
          await deleteDepartment(id, { force: true })
          toast.success('Department archived.')
          fetchDepartments()
        } catch (e2) {
          console.error(e2)
          toast.error('Could not archive department.')
        }
        return
      }
      console.error(err)
      toast.error('Could not archive department.')
    }
  }

  const handleEdit = (dept) => {
    setFormData({
      departmentName: dept.name,
      description: dept.description ?? '',
      managerId: dept.manager_id ? String(dept.manager_id) : '',
      status: dept.status ?? (dept.isActive ? 'Active' : 'Inactive'),
    })
    // The assigned head may not be on the current (searched/paginated) managers
    // page — make sure it's selectable so the picker shows the right name.
    if (dept.manager_id && dept.head) {
      setManagerOptions((prev) =>
        prev.some((m) => String(m.id) === String(dept.manager_id))
          ? prev
          : [{ id: dept.manager_id, name: dept.head }, ...prev],
      )
    }
    setEditMode(true)
    setEditingId(dept.id)
    setModalOpen(true)
  }

  const columns = [
    {
      key: 'name',
      label: 'Department',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] shadow-sm">
            <HiBuildingOffice className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{v}</div>
            <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">{row.code}</div>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (_, row) => (
        <span className="text-sm font-medium text-slate-600">{row.description || '-'}</span>
      )
    },
    {
      key: 'head',
      label: 'Head of Department',
      render: (v) => (
        <span className="text-sm font-medium text-slate-600">{v || 'Not assigned'}</span>
      )
    },
    {
      key: 'employeeCount',
      label: 'No of Employees',
      render: (v) => (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${Math.min(v * 4, 100)}%` }} />
          </div>
          <span className="text-xs font-bold text-slate-700">{v}</span>
        </div>
      )
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
              <span
                className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
              />
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        )
      }
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
            aria-label="Edit department"
          >
            <HiPencilSquare className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600"
            aria-label="Delete department"
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
    const filename = `departments_${today}.${ext}`
    const statusParam = statusFilter === 'all' ? 'all' : statusFilter
    setExportLoading(true)
    const tid = toast.loading('Preparing export…')
    try {
      await triggerExport(
        'departments',
        { search: debouncedSearch, status: statusParam },
        type,
        filename,
      )
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
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Department Management</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Departments</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Department Listing</span>
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
            <HiPlus className="h-4 w-4" /> Add Department
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          {
            // Backend totals (whole filtered set), not the current 10-row page.
            label: 'TOTAL DEPARTMENTS',
            count: deptStats?.total ?? deptTotal ?? 0,
            bgColor: 'bg-[#0F172A]',
            icon: HiBuildingOffice,
            onClickFilter: () => setStatusFilter('all'),
            filterId: 'all'
          },
          {
            label: 'ACTIVE',
            count: deptStats?.active ?? 0,
            bgColor: 'bg-[#10B981]',
            icon: HiCheckBadge,
            onClickFilter: () => setStatusFilter('active'),
            filterId: 'active'
          },
          {
            label: 'INACTIVE',
            count: deptStats?.inactive ?? 0,
            bgColor: 'bg-[#EF4444]',
            icon: HiUserCircle,
            onClickFilter: () => setStatusFilter('inactive'),
            filterId: 'inactive'
          },
          {
            label: 'ASSIGNED HEADS',
            count: deptStats?.assignedHeads ?? 0,
            bgColor: 'bg-[#3B82F6]',
            icon: HiUser,
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
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Department Listing</h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="relative min-w-[250px] flex-1 max-w-md">
            <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search department, code or description..."
              className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
            />
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-slate-500">{deptTotal} records shown</p>
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
          data={departmentList}
          pageSize={10}
          loading={loading}
          square
          totalCount={deptTotal}
          currentPage={deptPage - 1}
          onPageChange={(idx) => setDeptPage(idx + 1)}
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
              {editMode ? 'Edit Department' : 'Add New Department'}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Configure department profile settings and assignments below.
            </p>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="pt-2">
          <div className="space-y-4">
            <Input
              label="Department Name"
              name="departmentName"
              placeholder="Enter department name"
              value={formData.departmentName}
              onChange={handleFormChange}
              required
              inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
              labelClassName="mb-1 block text-sm font-medium text-slate-800"
            />

            <Input
              label="Description"
              name="description"
              placeholder="Enter department description"
              value={formData.description}
              onChange={handleFormChange}
              inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
              labelClassName="mb-1 block text-sm font-medium text-slate-800"
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Head of Department</label>
              <input
                type="text"
                value={managerSearch}
                onChange={(e) => setManagerSearch(e.target.value)}
                placeholder="Search employees by name, code or email…"
                className="mb-2 h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/20"
              />
              <Input
                name="managerId"
                type="select"
                value={formData.managerId}
                onChange={handleFormChange}
                placeholder="Select employee"
                options={managerOptions.map((m) => ({
                  label: m.emp_id ? `${m.name} (${m.emp_id})` : m.name,
                  value: String(m.id),
                }))}
                inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
              />
            </div>

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
              {submitting ? 'Saving…' : editMode ? 'Save Changes' : 'Add Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}