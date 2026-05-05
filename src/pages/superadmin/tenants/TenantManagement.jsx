import { useMemo, useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import api from '../../../services/api'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import {
  HiCheck,
  HiClock,
  HiDocumentText,
  HiXMark,
  HiArrowDownTray,
  HiUserCircle,
  HiKey,
  HiPlus,
  HiPencil,
  HiTrash,
  HiArrowTopRightOnSquare,
  HiCalendarDays,
  HiCreditCard,
  HiUsers,
  HiShieldCheck,
  HiQuestionMarkCircle,
  HiGlobeAlt,
  HiInformationCircle
} from 'react-icons/hi2'

const slugify = (text) => text.toString().toLowerCase().trim()
  .replace(/\s+/g, '-')
  .replace(/[^\w-]+/g, '')
  .replace(/--+/g, '-')

export default function TenantManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Data State
  const [organizations, setOrganizations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0) // 0-indexed for UI, 1-indexed for API
  const pageSize = 5

  useEffect(() => {
    fetchTenants(currentPage)
  }, [currentPage])

  const fetchTenants = async (page = 0) => {
    try {
      setIsLoading(true)
      const response = await api.get('/tenants', {
        params: {
          page: page + 1,
          limit: pageSize
        }
      })
      const { tenants, total } = response.data.data

      // Transform data to match UI expectations
      const transformed = tenants.map(t => {
        const slug = slugify(t.name)
        const baseDomain = window.location.hostname === 'localhost' ? 'localhost' : 'hris.cloud'
        return {
          id: t.id,
          name: t.name,
          dbName: t.db_name,
          domain: `${slug}.${baseDomain}`,
          adminEmail: t.admin_email,
          plan: 'Starter', // Default for now
          users: 0,
          maxUsers: 100,
          storage: 0,
          maxStorage: 10,
          status: t.status.charAt(0).toUpperCase() + t.status.slice(1),
          created: new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          initials: t.name.substring(0, 2).toUpperCase(),
          color: 'indigo',
          domainType: 'Subdomain',
          billingCycle: 'Monthly'
        }
      })
      // console.log('Tenants fetched:', transformed)
      setOrganizations(transformed)
      setTotalCount(total)
    } catch (error) {
      console.error('Failed to fetch tenants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Modal States
  const [showNewModal, setShowNewModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const [selectedOrg, setSelectedOrg] = useState(null)
  const [confirmAction, setConfirmAction] = useState('')
  const [confirmInput, setConfirmInput] = useState('')

  // Form States
  const [resetForm, setResetForm] = useState({ password: '', confirmPassword: '' })
  const [editForm, setEditForm] = useState({ name: '', adminEmail: '', plan: 'Starter', billingCycle: 'Monthly', maxUsers: 50, status: 'Active' })
  const [newForm, setNewForm] = useState({ name: '', adminName: '', adminEmail: '', adminPassword: '', plan: 'Starter', billingCycle: 'Monthly' })
  const [errors, setErrors] = useState({})

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.adminEmail.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPlan = planFilter === 'all' || org.plan === planFilter
      const matchesStatus = statusFilter === 'all' || org.status === statusFilter
      return matchesSearch && matchesPlan && matchesStatus
    })
  }, [organizations, searchQuery, planFilter, statusFilter])

  const handleExport = () => {
    Swal.fire({
      icon: 'info',
      title: 'Exporting Data',
      text: `Preparing ${organizations.length} organizations for CSV export...`,
      timer: 2000,
      showConfirmButton: false,
      background: '#fff',
      color: '#1e293b'
    })
  }

  const handleLoginAs = (org) => {
    const url = `http://${org.domain}:5173/login`
    window.open(url, '_blank')
  }

  const handleView = (org) => {
    setSelectedOrg(org)
    setShowDetailModal(true)
  }

  const handleEdit = (org) => {
    setSelectedOrg(org)
    setEditForm({
      name: org.name,
      adminEmail: org.adminEmail,
      plan: org.plan,
      billingCycle: org.billingCycle || 'Monthly',
      maxUsers: org.maxUsers,
      status: org.status
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editForm.name || !editForm.adminEmail) {
      setErrors({ name: !editForm.name, adminEmail: !editForm.adminEmail })
      return
    }
    try {
      await api.patch(`/tenants/${selectedOrg.id}`, {
        name: editForm.name,
        adminEmail: editForm.adminEmail,
        status: editForm.status.toLowerCase()
      })
      setShowEditModal(false)
      fetchTenants()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Failed to update organization',
        confirmButtonColor: '#4f46e5'
      })
    }
  }

  const handleCreateOrganization = async () => {
    if (!newForm.name || !newForm.adminEmail || !newForm.adminName || !newForm.adminPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill all required fields to provision the organization.',
        confirmButtonColor: '#4f46e5'
      })
      return
    }

    try {
      setIsLoading(true)
      await api.post('/tenants/create', {
        name: newForm.name,
        adminEmail: newForm.adminEmail,
        adminName: newForm.adminName,
        adminPassword: newForm.adminPassword
      })

      setShowNewModal(false)
      setNewForm({ name: '', adminName: '', adminEmail: '', adminPassword: '', plan: 'Starter', billingCycle: 'Monthly' })
      fetchTenants() // Refresh list
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Provisioning Failed',
        text: error.response?.data?.message || 'Failed to create organization',
        confirmButtonColor: '#ef4444'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = (type, org) => {
    setSelectedOrg(org)
    if (type === 'reset_pw') {
      setResetForm({ password: '', confirmPassword: '' })
      setShowResetModal(true)
      return
    }
    setConfirmAction(type)
    setConfirmInput('')
    setShowConfirmModal(true)
  }

  const handleResetPassword = async () => {
    if (!resetForm.password || resetForm.password !== resetForm.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Passwords do not match or are empty.',
        confirmButtonColor: '#f59e0b'
      })
      return
    }
    try {
      setIsLoading(true)
      await api.post(`/tenants/${selectedOrg.id}/reset-password`, {
        password: resetForm.password
      })
      Swal.fire({
        icon: 'success',
        title: 'Credentials Updated',
        text: `Administrator password has been updated and emailed to ${selectedOrg.adminEmail}`,
        confirmButtonColor: '#4f46e5'
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Reset Failed',
        text: error.response?.data?.message || 'Failed to reset password',
        confirmButtonColor: '#ef4444'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const executeAction = async () => {
    if (confirmAction === 'delete' && confirmInput !== selectedOrg.name) {
      setErrors({ confirm: true })
      return
    }

    try {
      if (confirmAction === 'suspend') {
        await api.patch(`/tenants/${selectedOrg.id}`, { status: 'suspended' })
      } else if (confirmAction === 'delete') {
        await api.delete(`/tenants/${selectedOrg.id}`)
      } else if (confirmAction === 'reset_pw') {
        await api.post(`/tenants/${selectedOrg.id}/reset-password`)
        Swal.fire({
          icon: 'success',
          title: 'Reset Successful',
          text: `Administrator password has been reset and emailed to ${selectedOrg.adminEmail}`,
          confirmButtonColor: '#4f46e5'
        })
      }
      setShowConfirmModal(false)
      setShowDetailModal(false)
      fetchTenants()
      
      Swal.fire({
        icon: 'success',
        title: 'Action Executed',
        text: 'The requested administrative operation completed successfully.',
        timer: 2000,
        showConfirmButton: false
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text: error.response?.data?.message || 'Action failed',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <HiGlobeAlt className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Organizations</h1>
            <div className="group relative">
              <HiQuestionMarkCircle className="h-4 w-4 text-slate-300 cursor-help hover:text-indigo-500 transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-slate-900 text-white text-[10px] leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl border border-white/10">
                <p className="font-bold text-indigo-400 mb-1 uppercase tracking-widest">Company Management</p>
                Manage all companies, their domains, and user limits.
                <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
              </div>
            </div>
          </div>
          <p className="text-[11px] font-medium text-slate-500">View and manage all organization accounts.</p>
        </div>
        <div className="flex gap-2">
          <Button label="Export CSV" variant="ghost" size="sm" icon={HiArrowDownTray} onClick={handleExport} className="text-slate-500 font-bold" />
          <Button label="Add Organization" variant="primary" size="sm" icon={HiPlus} onClick={() => setShowNewModal(true)} />
        </div>
      </div>

      {/* Filter Section */}
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Search Organizations" placeholder="Name, domain, or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <div>
            <label className="mb-2 block text-[11px] font-black text-slate-400 uppercase tracking-widest">Subscription Plan</label>
            <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none cursor-pointer" value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
              <option value="all">All Ecosystem Tiers</option>
              <option>Starter</option>
              <option>Growth</option>
              <option>Pro</option>
              <option>Enterprise</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-black text-slate-400 uppercase tracking-widest">Current Status</label>
            <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Operational States</option>
              <option>Active</option>
              <option>Trial</option>
              <option>Suspended</option>
              <option>SSL Issue</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button label="Reset Filters" variant="ghost" className="w-full font-bold text-slate-400" onClick={() => { setSearchQuery(''); setPlanFilter('all'); setStatusFilter('all'); }} />
          </div>
        </div>
      </div>

      {/* Organization Table */}
      <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
        <Table
          pageSize={pageSize}
          totalCount={totalCount}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          columns={[
            { key: 'org', label: 'Organization' },
            { key: 'plan', label: 'Tier', className: 'hidden md:table-cell' },
            { key: 'users', label: 'Nodes', className: 'hidden lg:table-cell' },
            { key: 'status', label: 'Status', className: 'hidden sm:table-cell' },
            { key: 'created', label: 'Onboarded', className: 'hidden xl:table-cell' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={filteredOrganizations.map((org) => ({
            org: (
              <div className="flex items-center gap-4 py-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${org.color}-50 text-[11px] font-black text-${org.color}-600 border border-${org.color}-100 shadow-sm`}>
                  {org.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 tracking-tight">{org.name}</div>
                  <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{org.domain}</div>
                </div>
              </div>
            ),
            plan: <Badge label={org.plan} color={org.plan === 'Enterprise' ? 'amber' : org.plan === 'Growth' ? 'cyan' : org.plan === 'Pro' ? 'indigo' : 'gray'} variant="glass" />,
            users: (
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">{org.users}</span>
                <span className="text-[10px] font-bold text-slate-400">/ {org.maxUsers}</span>
              </div>
            ),
            status: <Badge label={org.status} color={org.status === 'Active' ? 'green' : org.status === 'Trial' ? 'amber' : org.status === 'Suspended' ? 'gray' : 'red'} />,
            created: <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{org.created}</span>,
            actions: (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" icon={HiDocumentText} className="text-slate-400 hover:text-indigo-600" onClick={() => handleView(org)} />
                <Button variant="ghost" size="sm" icon={HiPencil} className="text-slate-400 hover:text-blue-600" onClick={() => handleEdit(org)} />
                <Button variant="ghost" size="sm" icon={HiArrowTopRightOnSquare} className="text-slate-400 hover:text-emerald-600" onClick={() => handleLoginAs(org)} />
              </div>
            ),
          }))}
        />
      </div>

      {/* New Organization Modal */}
      <Modal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Add Organization"
        description="Fill in the details below to create a new organization account."
        icon={HiPlus}
        size="lg"
      >
        <div className="space-y-8 p-2">
          <div className="grid grid-cols-2 gap-6">
            <Input label="Organization Name *" placeholder="e.g. HRIS Global" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} />
            <Input label="Root Admin Name *" placeholder="e.g. John Doe" value={newForm.adminName} onChange={(e) => setNewForm({ ...newForm, adminName: e.target.value })} />
            <Input label="Root Admin Email *" type="email" placeholder="admin@org.com" value={newForm.adminEmail} onChange={(e) => setNewForm({ ...newForm, adminEmail: e.target.value })} />
            <Input label="Root Admin Password *" type="password" placeholder="••••••••" value={newForm.adminPassword} onChange={(e) => setNewForm({ ...newForm, adminPassword: e.target.value })} />
            <div>
              <label className="mb-2 block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Subscription Tier</label>
              <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer" value={newForm.plan} onChange={(e) => setNewForm({ ...newForm, plan: e.target.value })}>
                <option>Starter</option><option>Growth</option><option>Pro</option><option>Enterprise</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 justify-end pt-6 border-t border-slate-100">
            <Button label="Cancel" variant="ghost" className="font-bold text-slate-400" onClick={() => setShowNewModal(false)} />
            <Button label="Save" variant="primary" onClick={handleCreateOrganization} />
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedOrg?.name}
        description={`Organization ID: ${selectedOrg?.id} · Domain: ${selectedOrg?.domain}`}
        icon={HiUsers}
        size="lg"
      >
        {selectedOrg && (
          <div className="space-y-5 p-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/80">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Admin Email</span>
                <p className="mt-0.5 text-xs font-bold text-slate-700 truncate">{selectedOrg.adminEmail}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/80">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Database Name</span>
                <p className="mt-0.5 text-[11px] font-mono font-bold text-indigo-500">{selectedOrg.dbName}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/80">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Billing Plan</span>
                <p className="mt-0.5 text-xs font-bold text-slate-700">{selectedOrg.plan} ({selectedOrg.billingCycle})</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/80">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Join Date</span>
                <p className="mt-0.5 text-xs font-bold text-slate-700">{selectedOrg.created}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/50">
              <div className="space-y-0.5">
                <h4 className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">Management Actions</h4>
                <p className="text-[10px] text-indigo-600/70">Securely orchestrate organization nodes.</p>
              </div>
              <div className="flex gap-2">
                <div className="group relative">
                  <Button variant="ghost" size="sm" icon={HiArrowTopRightOnSquare} className="bg-white shadow-sm text-indigo-600 hover:bg-indigo-600 hover:text-white" onClick={() => handleLoginAs(selectedOrg)} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[9px] font-bold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">Login as Admin</div>
                </div>
                <div className="group relative">
                  <Button variant="ghost" size="sm" icon={HiKey} className="bg-white shadow-sm text-amber-600 hover:bg-amber-600 hover:text-white" onClick={() => handleAction('reset_pw', selectedOrg)} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[9px] font-bold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">Reset Password</div>
                </div>
                <div className="group relative">
                  <Button variant="ghost" size="sm" icon={HiPencil} className="bg-white shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white" onClick={() => handleEdit(selectedOrg)} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[9px] font-bold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">Edit Details</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Danger Zone</span>
              <div className="flex gap-2">
                <Button label="Suspend" variant="ghost" size="sm" className="text-amber-600 hover:bg-amber-50 font-bold" icon={HiClock} onClick={() => handleAction('suspend', selectedOrg)} />
                <Button label="Delete" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 font-bold" icon={HiTrash} onClick={() => handleAction('delete', selectedOrg)} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Organization"
        description="Update organization details and resource limits."
        icon={HiPencil}
      >
        <div className="space-y-6 p-2">
          <Input label="Organization Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <Input label="Root Admin Email" value={editForm.adminEmail} onChange={(e) => setEditForm({ ...editForm, adminEmail: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-[11px] font-black text-slate-400 uppercase tracking-widest">Ecosystem Plan</label>
              <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all" value={editForm.plan} onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}>
                <option>Starter</option><option>Growth</option><option>Pro</option><option>Enterprise</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-black text-slate-400 uppercase tracking-widest">Operational Status</label>
              <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                <option>Active</option><option>Trial</option><option>Suspended</option><option>SSL Issue</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-6 border-t border-slate-100">
            <Button label="Cancel" variant="ghost" className="flex-1 font-bold text-slate-400" onClick={() => setShowEditModal(false)} />
            <Button label="Save" variant="primary" className="flex-1" onClick={handleSaveEdit} />
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Update Credentials"
        description={`Set a new administrator password for ${selectedOrg?.name}.`}
        icon={HiKey}
      >
        <div className="space-y-5 p-2">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 mb-2">
            <div className="flex gap-3">
              <HiInformationCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
                The new password will be updated instantly in the tenant's database and sent to <span className="font-bold underline">{selectedOrg?.adminEmail}</span>.
              </p>
            </div>
          </div>
          
          <Input 
            label="New Password" 
            type="password"
            placeholder="••••••••"
            value={resetForm.password} 
            onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })} 
          />
          <Input 
            label="Confirm New Password" 
            type="password"
            placeholder="••••••••"
            value={resetForm.confirmPassword} 
            onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })} 
          />

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button 
              label="Cancel" 
              variant="ghost" 
              className="flex-1 font-bold text-slate-400" 
              onClick={() => setShowResetModal(false)} 
            />
            <Button 
              label="Update & Email" 
              variant="primary" 
              className="flex-1" 
              onClick={handleResetPassword} 
              loading={isLoading}
              disabled={!resetForm.password || resetForm.password !== resetForm.confirmPassword || isLoading}
            />
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Security Handshake"
        description={confirmAction === 'delete' ? 'This will permanently purge all organizational data and nodes. This action is irreversible.' :
          confirmAction === 'suspend' ? 'This will immediately revoke access to all ecosystem users.' :
            'A secure password reset sequence will be triggered for the root administrator.'}
        icon={HiShieldCheck}
      >
        <div className="space-y-6 p-2">
          {confirmAction === 'delete' && (
            <Input label={`Type "${selectedOrg?.name}" to authorize purge`} value={confirmInput} onChange={(e) => setConfirmInput(e.target.value)} />
          )}
          <div className="flex gap-3 pt-2">
            <Button label="Cancel" variant="ghost" className="flex-1 font-bold text-slate-400" onClick={() => setShowConfirmModal(false)} />
            <Button
              label={confirmAction === 'delete' ? 'Delete' : 'Save'}
              variant={confirmAction === 'delete' ? 'danger' : 'primary'}
              className="flex-1"
              onClick={executeAction}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
