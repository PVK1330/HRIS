import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
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
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [managerOptions, setManagerOptions] = useState([])
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

  const fetchManagers = async () => {
    try {
      const data = await listDepartmentManagers()
      setManagerOptions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch department managers:', err)
      setManagerOptions([])
    }
  }

  React.useEffect(() => {
    fetchManagers()
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

    if (result.isConfirmed) {
      try {
        await deleteDepartment(id)
        toast.success('Department archived.')
        fetchDepartments()
      } catch (err) {
        console.error(err)
        toast.error('Could not archive department.')
      }
    }
  }

  const handleEdit = (dept) => {
    setFormData({
      departmentName: dept.name,
      description: dept.description ?? '',
      managerId: dept.manager_id ? String(dept.manager_id) : '',
      status: dept.status ?? (dept.isActive ? 'Active' : 'Inactive'),
    })
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
              className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold ${
                isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
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
    <>
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-800">Department Listing</h2>
              <div className="flex items-center gap-2">
                <div className="relative" ref={exportRef}>
                  <button
                    type="button"
                    disabled={exportLoading}
                    onClick={() => setExportOpen((prev) => !prev)}
                    className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
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
                  className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64]"
                >
                  <HiPlus className="h-4 w-4" /> Add Department
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
              <div className="relative min-w-[250px] flex-1">
                <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search department, code or description..."
                  className="h-10 w-full rounded-none border border-slate-200 bg-slate-50 px-3 pl-9 text-sm text-slate-700 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-2 focus:ring-[#0F766E]/10"
                />
              </div>
              <div className="flex items-center gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'active', label: 'Active' },
                  { id: 'inactive', label: 'Inactive' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStatusFilter(item.id)}
                    className={`rounded-none border px-3 py-1.5 text-xs font-medium transition ${
                      statusFilter === item.id
                        ? 'border-[#6366F1] bg-indigo-50 text-[#4F46E5]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-xs font-medium text-slate-400">{deptTotal} total · page {deptPage}</p>
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

      {modalOpen ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            onClick={handleCloseModal}
            aria-label="Close modal"
          />

          <div className="relative w-full max-w-[760px] overflow-hidden rounded-none bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-3xl leading-none text-[#1f2a44]">{editMode ? 'Edit Department' : 'Add Department'}</h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="inline-flex h-7 w-7 items-center justify-center rounded-none text-slate-500 transition-colors hover:bg-slate-100"
                aria-label="Close"
              >
                <HiXMark className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-5">
                <Input
                  label="Department Name"
                  name="departmentName"
                  placeholder="Enter department name"
                  value={formData.departmentName}
                  onChange={handleFormChange}
                  required
                  inputClassName="h-10 rounded-none border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                  labelClassName="mb-2 block text-sm font-medium text-[#1f2a44]"
                />

                <Input
                  label="Description"
                  name="description"
                  placeholder="Enter department description"
                  value={formData.description}
                  onChange={handleFormChange}
                  inputClassName="h-10 rounded-none border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                  labelClassName="mb-2 block text-sm font-medium text-[#1f2a44]"
                />

                <Input
                  label="Head of Department"
                  name="managerId"
                  type="select"
                  value={formData.managerId}
                  onChange={handleFormChange}
                  placeholder="Select employee"
                  options={managerOptions.map((m) => ({
                    label: m.name,
                    value: String(m.id),
                  }))}
                  inputClassName="h-10 rounded-none border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                  labelClassName="mb-2 block text-sm font-medium text-[#1f2a44]"
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
                  inputClassName="h-10 rounded-none border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                  labelClassName="mb-2 block text-sm font-medium text-[#1f2a44]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="inline-flex h-9 items-center justify-center rounded-none border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-9 items-center justify-center rounded-none bg-[#0F766E] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Saving…' : editMode ? 'Save Changes' : 'Add Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}