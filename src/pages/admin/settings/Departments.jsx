import React, { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { 
  HiBuildingOffice, 
  HiPencilSquare, 
  HiTrash, 
  HiUsers, 
  HiPlus, 
  HiCheckCircle, 
  HiMagnifyingGlass, 
  HiAdjustmentsHorizontal,
  HiBriefcase,
  HiMapPin,
  HiIdentification,
  HiGlobeAlt,
  HiUserCircle,
  HiChevronRight
} from 'react-icons/hi2'
import { 
  listDepartments, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment 
} from '../../../services/departmentService'
import Swal from 'sweetalert2'
import { useTenantAdminSettings } from '../../../hooks/useTenantAdminSettings'

const initialFormData = {
  departmentName: '',
  departmentCode: '',
  description: '',
  status: 'Active',
}

export default function DepartmentManagement() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [search, setSearch] = useState('')
  const [departmentList, setDepartmentList] = useState([])
  const [loading, setLoading] = useState(true)
  const { settings } = useTenantAdminSettings()

  const dynamicLocations = useMemo(() => {
    if (settings?.locations && Array.isArray(settings.locations) && settings.locations.length > 0) {
      return settings.locations
    }
    return ['Dubai HQ', 'Abu Dhabi', 'London', 'Remote']
  }, [settings])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const data = await listDepartments()
      setDepartmentList(data || [])
    } catch (err) {
      console.error('Failed to fetch departments:', err)
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to load organizational units',
      })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchDepartments()
  }, [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return departmentList.filter((d) => {
      if (!query) return true
      return `${d.name} ${d.code}`.toLowerCase().includes(query)
    })
  }, [search, departmentList])

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
    try {
      const payload = {
        name: formData.departmentName,
        code: formData.departmentCode,
        description: formData.description,
        isActive: formData.status === 'Active'
      }

      if (editMode) {
        await updateDepartment(editingId, payload)
        Swal.fire('Updated!', 'Department has been modified.', 'success')
      } else {
        await createDepartment(payload)
        Swal.fire('Created!', 'New department initialized.', 'success')
      }
      handleCloseModal()
      fetchDepartments()
    } catch (err) {
      console.error('Submission failed:', err)
      Swal.fire('Error', 'Transaction failed. Please try again.', 'error')
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      try {
        await deleteDepartment(id)
        Swal.fire('Deleted!', 'Unit has been removed.', 'success')
        fetchDepartments()
      } catch (err) {
        Swal.fire('Error', 'Deletion failed.', 'error')
      }
    }
  }

  const handleEdit = (dept) => {
    setFormData({
      departmentName: dept.name,
      departmentCode: dept.code,
      description: dept.description,
      status: dept.status,
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
        <div className="flex items-center gap-4">
           <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#0F766E] shadow-sm">
              <HiBuildingOffice className="h-5 w-5" />
           </div>
           <div>
              <div className="font-bold text-slate-900 leading-none mb-1">{v}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.code}</div>
           </div>
        </div>
      )
    },
    {
      key: 'employeeCount',
      label: 'Headcount',
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
      render: (v) => (
        <Badge 
          label={v || 'Inactive'} 
          variant="outline" 
          color={v === 'Active' ? 'green' : 'gray'} 
          className="font-black text-[9px] uppercase tracking-wider"
        />
      )
    },
    {
      key: 'actions',
      label: 'Control',
      render: (_, row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" icon={HiPencilSquare} onClick={() => handleEdit(row)} className="text-slate-400 hover:text-[#0F766E]" />
          <Button variant="ghost" size="sm" icon={HiTrash} onClick={() => handleDelete(row.id)} className="text-slate-400 hover:text-red-500" />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl shadow-emerald-900/20">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight uppercase">Departments</h1>
            <p className="mt-2 text-emerald-100/80 text-sm max-w-md leading-relaxed">
               Manage company units and leadership assignments.
            </p>
          </div>
          <button 
             onClick={() => setModalOpen(true)}
             className="flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-bold text-[#0F766E] shadow-lg transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
          >
             <HiPlus className="h-4 w-4" /> CREATE DEPARTMENT
          </button>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-black/5" />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {[
            { label: 'Total Units', value: departmentList.length, icon: HiBuildingOffice, color: 'emerald' },
            { label: 'Global Headcount', value: departmentList.reduce((acc, d) => acc + d.employeeCount, 0), icon: HiUsers, color: 'blue' },
         ].map(card => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
               <div className="flex items-center gap-4 mb-4">
                  <div className={`h-10 w-10 rounded-xl bg-${card.color}-50 text-${card.color}-600 flex items-center justify-center`}>
                     <card.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</span>
               </div>
               <p className="text-3xl font-black text-slate-900">{card.value}</p>
            </div>
         ))}
      </div>

      {/* Registry Workspace */}
      <div className="space-y-6">
         <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
           <div className="flex flex-col gap-4 md:flex-row md:items-end">
             <div className="flex-1">
               <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Directory</label>
               <div className="relative">
                 <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                 <input
                   type="text"
                   placeholder="Filter by name, code, or leadership..."
                   className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none transition-all"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
               </div>
             </div>
             <Button label="FILTERS" icon={HiAdjustmentsHorizontal} variant="ghost" className="h-[46px] border border-slate-200" />
           </div>
         </div>

         <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
            <div className="bg-[#0F766E] px-6 py-3 text-white flex items-center justify-between">
               <h2 className="text-sm font-bold uppercase tracking-wider">Departmental Registry</h2>
               <HiBriefcase className="h-4 w-4 opacity-50" />
            </div>
            <Table columns={columns} data={filtered} pageSize={10} loading={loading} />
         </div>
      </div>

      {/* Creation Modal */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editMode ? 'Edit Department' : 'Add Department'} size="xl">
        <form onSubmit={handleSubmit} className="animate-in fade-in duration-500 space-y-8">
           {/* Section: Core Identity */}
           <div className="space-y-6">
              <div className="grid gap-6">
                 <Input
                   label="Department Name"
                   name="departmentName"
                   value={formData.departmentName}
                   onChange={handleFormChange}
                   required
                   placeholder="e.g. Information Technology"
                   className="text-slate-900 font-medium"
                 />
                 <Input
                   label="Department Code"
                   name="departmentCode"
                   value={formData.departmentCode}
                   onChange={handleFormChange}
                   placeholder="e.g. IT-01"
                   required
                   className="text-slate-900 font-medium"
                 />
                 <div className="w-full">
                    <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      className="w-full min-h-[80px] rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm text-slate-900 font-medium focus:border-[#0F766E] outline-none transition-all resize-none"
                      placeholder="Enter department description..."
                    />
                 </div>
              </div>
           </div>

           {/* Section: Controls */}
           <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">
                 <HiAdjustmentsHorizontal className="h-4 w-4 text-[#0F766E]" /> Settings
              </h3>
              <div className="w-full">
                 <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                 <select
                   name="status"
                   value={formData.status}
                   onChange={handleFormChange}
                   className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 font-medium focus:border-[#0F766E] outline-none transition-all"
                   required
                 >
                   <option value="Active">Active</option>
                   <option value="Inactive">Inactive</option>
                 </select>
              </div>
           </div>

           <div className="pt-6 border-t border-slate-100 flex justify-center gap-4">
              <Button type="submit" label={editMode ? "SAVE CHANGES" : "ADD DEPARTMENT"} variant="primary" className="px-10 shadow-lg shadow-emerald-900/20" />
              <Button type="button" label="CANCEL" variant="ghost" onClick={handleCloseModal} />
           </div>
        </form>
      </Modal>
    </div>
  )
}

export default DepartmentManagement
