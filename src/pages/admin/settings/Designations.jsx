import React, { useMemo, useRef, useState } from 'react'
import {
  HiBriefcase,
  HiChevronDown,
  HiDocumentArrowDown,
  HiMagnifyingGlass,
  HiPencilSquare,
  HiPlus,
  HiTrash,
  HiXMark,
} from 'react-icons/hi2'
import Swal from 'sweetalert2'
import { Input } from '../../../components/ui/Input.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { listDepartments } from '../../../services/departmentService'
import {
  createDesignation,
  deleteDesignation,
  listDesignations,
  updateDesignation,
} from '../../../services/designationService'

const initialFormData = {
  designationName: '',
  departmentId: '',
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
  const [loading, setLoading] = useState(true)
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef(null)

  const fetchDesignations = async () => {
    try {
      setLoading(true)
      const data = await listDesignations()
      setDesignationList(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch designations:', err)
      Swal.fire('Error', 'Failed to load designations.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const data = await listDepartments()
      setDepartmentOptions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch departments:', err)
      setDepartmentOptions([])
    }
  }

  React.useEffect(() => {
    fetchDesignations()
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

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return designationList.filter((d) => {
      const currentStatus = (d.status ?? (d.is_active ? 'Active' : 'Inactive')).toLowerCase()
      const statusMatch = statusFilter === 'all' || currentStatus === statusFilter
      if (!statusMatch) return false
      if (!query) return true
      return `${d.name ?? ''} ${d.department_name ?? ''}`.toLowerCase().includes(query)
    })
  }, [designationList, search, statusFilter])

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
    const payload = {
      name: formData.designationName,
      department_id: Number(formData.departmentId),
      isActive: formData.status === 'Active',
    }

    try {
      if (editMode) {
        await updateDesignation(editingId, payload)
        Swal.fire('Updated!', 'Designation updated successfully.', 'success')
      } else {
        await createDesignation(payload)
        Swal.fire('Created!', 'Designation created successfully.', 'success')
      }
      handleCloseModal()
      fetchDesignations()
    } catch (err) {
      console.error('Failed to submit designation:', err)
      Swal.fire('Error', 'Failed to save designation.', 'error')
    }
  }

  const handleEdit = (item) => {
    setFormData({
      designationName: item.name ?? '',
      departmentId: item.department_id ? String(item.department_id) : '',
      status: item.status ?? (item.is_active ? 'Active' : 'Inactive'),
    })
    setEditingId(item.id)
    setEditMode(true)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    })
    if (!result.isConfirmed) return

    try {
      await deleteDesignation(id)
      Swal.fire('Deleted!', 'Designation removed successfully.', 'success')
      fetchDesignations()
    } catch (err) {
      console.error('Failed to delete designation:', err)
      Swal.fire('Error', 'Failed to delete designation.', 'error')
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

  const exportRows = useMemo(
    () =>
      filtered.map((row) => ({
        designation: row.name ?? '-',
        department: row.department_name ?? '-',
        status: row.status ?? (row.is_active ? 'Active' : 'Inactive'),
      })),
    [filtered]
  )

  const exportAsExcel = () => {
    if (!exportRows.length) {
      Swal.fire('No data', 'There is no designation data to export.', 'info')
      return
    }

    const headers = ['Designation', 'Department Name', 'Status']
    const lines = [
      headers.join(','),
      ...exportRows.map((row) =>
        [row.designation, row.department, row.status]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ]

    const csv = `\uFEFF${lines.join('\n')}`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    link.href = url
    link.setAttribute('download', `designations-${date}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    setExportOpen(false)
  }

  return (
    <>
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-800">Designation Listing</h2>
          <div className="flex items-center gap-2">
            <div className="relative" ref={exportRef}>
              <button
                type="button"
                onClick={() => setExportOpen((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <HiDocumentArrowDown className="h-4 w-4" />
                Export
                <HiChevronDown className={`h-4 w-4 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
              </button>
              {exportOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-none border border-slate-200 bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={exportAsExcel}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
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
              <HiPlus className="h-4 w-4" /> Add Designation
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
              placeholder="Search designation or department..."
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
          <p className="text-xs font-medium text-slate-400">
            {filtered.length} of {designationList.length} designations
          </p>
        </div>

        <Table columns={columns} data={filtered} pageSize={10} loading={loading} square />
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
              <h2 className="text-3xl leading-none text-[#1f2a44]">{editMode ? 'Edit Designation' : 'Add Designation'}</h2>
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
                  label="Designation Name"
                  name="designationName"
                  value={formData.designationName}
                  onChange={handleFormChange}
                  placeholder="Enter designation name"
                  required
                  inputClassName="h-10 rounded-none border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                  labelClassName="mb-2 block text-sm font-medium text-[#1f2a44]"
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
                  className="inline-flex h-9 items-center justify-center rounded-none bg-[#0F766E] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64]"
                >
                  {editMode ? 'Save Changes' : 'Add Designation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}