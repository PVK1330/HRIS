import { useMemo, useState } from 'react'
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
  HiCreditCard
} from 'react-icons/hi2'

export default function TenantManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Data State
  const [tenants, setTenants] = useState([
    { id: 1, name: 'AlphaCorp HR', domain: 'alphacorp.hriscloud.io', adminEmail: 'admin@alphacorp.com', plan: 'Enterprise', users: 342, maxUsers: 500, storage: 29, maxStorage: 50, status: 'Active', created: '01 Jan 2026', initials: 'AL', color: 'indigo', domainType: 'Subdomain', billingCycle: 'Annual' },
    { id: 2, name: 'HR Nexus Pvt Ltd', domain: 'hrnexus.hriscloud.io', adminEmail: 'it@hrnexus.io', plan: 'Growth', users: 87, maxUsers: 200, storage: 6, maxStorage: 20, status: 'Trial', created: '01 Apr 2026', initials: 'HR', color: 'cyan', domainType: 'Subdomain', billingCycle: 'Monthly' },
    { id: 3, name: 'TalentCo FZCO', domain: 'talentco.com', adminEmail: 'ops@talentco.com', plan: 'Pro', users: 156, maxUsers: 300, storage: 16.5, maxStorage: 30, status: 'SSL Issue', created: '15 Nov 2025', initials: 'TC', color: 'green', domainType: 'Custom Domain', billingCycle: 'Annual' },
    { id: 4, name: 'Zenith People Co', domain: 'zenith.hriscloud.io', adminEmail: 'hr@zenithpeople.ae', plan: 'Starter', users: 24, maxUsers: 50, storage: 1, maxStorage: 5, status: 'Suspended', created: '10 Aug 2025', initials: 'ZE', color: 'amber', domainType: 'Subdomain', billingCycle: 'Monthly' },
  ])

  // Modal States
  const [showNewTenantModal, setShowNewTenantModal] = useState(false)
  const [showTenantDetailModal, setShowTenantDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [confirmAction, setConfirmAction] = useState('') 
  const [confirmInput, setConfirmInput] = useState('')

  // Form States
  const [editForm, setEditForm] = useState({ name: '', adminEmail: '', plan: 'Starter', billingCycle: 'Monthly', maxUsers: 50, status: 'Active' })
  const [newForm, setNewForm] = useState({ name: '', adminName: '', adminEmail: '', plan: 'Starter', billingCycle: 'Monthly', subdomain: '' })
  const [errors, setErrors] = useState({})

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.adminEmail.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPlan = planFilter === 'all' || tenant.plan === planFilter
      const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter
      return matchesSearch && matchesPlan && matchesStatus
    })
  }, [tenants, searchQuery, planFilter, statusFilter])

  const handleExport = () => {
    alert('Exporting ' + tenants.length + ' tenants to CSV...')
  }

  const handleLoginAs = (tenant) => {
    alert(`Redirecting to ${tenant.domain} as Platform Admin...`)
  }

  const handleView = (tenant) => {
    setSelectedTenant(tenant)
    setShowTenantDetailModal(true)
  }

  const handleEdit = (tenant) => {
    setSelectedTenant(tenant)
    setEditForm({
      name: tenant.name,
      adminEmail: tenant.adminEmail,
      plan: tenant.plan,
      billingCycle: tenant.billingCycle || 'Monthly',
      maxUsers: tenant.maxUsers,
      status: tenant.status
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    if (!editForm.name || !editForm.adminEmail) {
      setErrors({ name: !editForm.name, adminEmail: !editForm.adminEmail })
      return
    }
    setTenants(tenants.map(t => t.id === selectedTenant.id ? { ...t, ...editForm } : t))
    setShowEditModal(false)
  }

  const handleCreateTenant = () => {
    if (!newForm.name || !newForm.adminEmail || !newForm.subdomain) {
      alert('Please fill all required fields.')
      return
    }
    const newTenant = {
      id: Date.now(),
      name: newForm.name,
      domain: `${newForm.subdomain}.hriscloud.io`,
      adminEmail: newForm.adminEmail,
      plan: newForm.plan,
      users: 0,
      maxUsers: 100,
      storage: 0,
      maxStorage: 10,
      status: 'Active',
      created: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      initials: newForm.name.substring(0, 2).toUpperCase(),
      color: 'indigo',
      domainType: 'Subdomain',
      billingCycle: newForm.billingCycle
    }
    setTenants([newTenant, ...tenants])
    setShowNewTenantModal(false)
    setNewForm({ name: '', adminName: '', adminEmail: '', plan: 'Starter', billingCycle: 'Monthly', subdomain: '' })
  }

  const handleAction = (type, tenant) => {
    setSelectedTenant(tenant)
    setConfirmAction(type)
    setConfirmInput('')
    setShowConfirmModal(true)
  }

  const executeAction = () => {
    if (confirmAction === 'delete' && confirmInput !== selectedTenant.name) {
      setErrors({ confirm: true })
      return
    }
    if (confirmAction === 'suspend') {
      setTenants(tenants.map(t => t.id === selectedTenant.id ? { ...t, status: 'Suspended' } : t))
    } else if (confirmAction === 'delete') {
      setTenants(tenants.filter(t => t.id !== selectedTenant.id))
    } else if (confirmAction === 'reset_pw') {
      alert(`Password reset link sent to ${selectedTenant.adminEmail}`)
    }
    setShowConfirmModal(false)
    setShowTenantDetailModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all registered organizations and their access levels.</p>
        </div>
        <div className="flex gap-2">
          <Button label="Export CSV" variant="ghost" icon={HiArrowDownTray} onClick={handleExport} />
          <Button label="New Tenant" variant="primary" icon={HiPlus} onClick={() => setShowNewTenantModal(true)} />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Search Tenants" placeholder="Name, domain, or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Subscription Plan</label>
            <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none" value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
              <option value="all">All Plans</option>
              <option>Starter</option>
              <option>Growth</option>
              <option>Pro</option>
              <option>Enterprise</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Current Status</label>
            <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option>Active</option>
              <option>Trial</option>
              <option>Suspended</option>
              <option>SSL Issue</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button label="Reset Filters" variant="ghost" className="w-full" onClick={() => { setSearchQuery(''); setPlanFilter('all'); setStatusFilter('all'); }} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table
          columns={[
            { key: 'tenant', label: 'Organization' },
            { key: 'plan', label: 'Plan' },
            { key: 'users', label: 'Users' },
            { key: 'status', label: 'Status' },
            { key: 'created', label: 'Created' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={filteredTenants.map((tenant) => ({
            tenant: (
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-${tenant.color}-50 text-xs font-bold text-${tenant.color}-600 border border-${tenant.color}-100`}>
                  {tenant.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{tenant.name}</div>
                  <div className="text-[11px] font-mono text-blue-500">{tenant.domain}</div>
                </div>
              </div>
            ),
            plan: <Badge label={tenant.plan} color={tenant.plan === 'Enterprise' ? 'amber' : tenant.plan === 'Growth' ? 'cyan' : tenant.plan === 'Pro' ? 'indigo' : 'gray'} />,
            users: (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{tenant.users}</span>
                <span className="text-[10px] text-gray-400">/ {tenant.maxUsers}</span>
              </div>
            ),
            status: <Badge label={tenant.status} color={tenant.status === 'Active' ? 'green' : tenant.status === 'Trial' ? 'amber' : tenant.status === 'Suspended' ? 'gray' : 'red'} />,
            created: <span className="text-xs text-gray-500">{tenant.created}</span>,
            actions: (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" icon={HiDocumentText} title="View Details" onClick={() => handleView(tenant)} />
                <Button variant="ghost" size="sm" icon={HiPencil} title="Edit Tenant" onClick={() => handleEdit(tenant)} />
                <Button variant="ghost" size="sm" icon={HiArrowTopRightOnSquare} title="Login As" onClick={() => handleLoginAs(tenant)} />
              </div>
            ),
          }))}
        />
      </div>

      {/* New Tenant Modal */}
      <Modal isOpen={showNewTenantModal} onClose={() => setShowNewTenantModal(false)} title="Register New Organization" size="lg">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Organization Name *" placeholder="e.g. Acme Corp" value={newForm.name} onChange={(e) => setNewForm({...newForm, name: e.target.value})} />
            <Input label="Subdomain Prefix *" placeholder="acme-hr" value={newForm.subdomain} onChange={(e) => setNewForm({...newForm, subdomain: e.target.value})} />
            <Input label="Admin Email *" type="email" placeholder="admin@acme.com" value={newForm.adminEmail} onChange={(e) => setNewForm({...newForm, adminEmail: e.target.value})} />
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Subscription Plan</label>
              <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none" value={newForm.plan} onChange={(e) => setNewForm({...newForm, plan: e.target.value})}>
                <option>Starter</option><option>Growth</option><option>Pro</option><option>Enterprise</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <Button label="Cancel" variant="ghost" onClick={() => setShowNewTenantModal(false)} />
            <Button label="Create Organization" variant="primary" onClick={handleCreateTenant} />
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showTenantDetailModal} onClose={() => setShowTenantDetailModal(false)} title={selectedTenant?.name} size="lg">
        {selectedTenant && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Email</span>
                <p className="mt-1 text-sm font-semibold text-gray-900">{selectedTenant.adminEmail}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Billing Cycle</span>
                <p className="mt-1 text-sm font-semibold text-gray-900">{selectedTenant.billingCycle}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Storage</span>
                <p className="mt-1 text-sm font-semibold text-gray-900">{selectedTenant.storage}GB / {selectedTenant.maxStorage}GB</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-900 px-1">QUICK ACTIONS</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button label="Login As Admin" variant="ghost" icon={HiArrowTopRightOnSquare} className="justify-start" onClick={() => handleLoginAs(selectedTenant)} />
                <Button label="Reset Admin Password" variant="ghost" icon={HiKey} className="justify-start" onClick={() => handleAction('reset_pw', selectedTenant)} />
                <Button label="Update Plan" variant="ghost" icon={HiCreditCard} className="justify-start" onClick={() => handleEdit(selectedTenant)} />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <Button label="Suspend Access" variant="ghost" className="text-amber-600 hover:bg-amber-50" icon={HiClock} onClick={() => handleAction('suspend', selectedTenant)} />
              <Button label="Terminate Tenant" variant="ghost" className="text-red-600 hover:bg-red-50" icon={HiTrash} onClick={() => handleAction('delete', selectedTenant)} />
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Modify Organization">
        <div className="space-y-4">
          <Input label="Company Name" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
          <Input label="Admin Email" value={editForm.adminEmail} onChange={(e) => setEditForm({...editForm, adminEmail: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Plan</label>
                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none" value={editForm.plan} onChange={(e) => setEditForm({...editForm, plan: e.target.value})}>
                  <option>Starter</option><option>Growth</option><option>Pro</option><option>Enterprise</option>
                </select>
             </div>
             <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Status</label>
                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none" value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})}>
                  <option>Active</option><option>Trial</option><option>Suspended</option><option>SSL Issue</option>
                </select>
             </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button label="Cancel" variant="ghost" className="flex-1" onClick={() => setShowEditModal(false)} />
            <Button label="Update Tenant" variant="primary" className="flex-1" onClick={handleSaveEdit} />
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Security Confirmation">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            {confirmAction === 'delete' ? 'This will permanently remove all data for this organization. This cannot be undone.' : 
             confirmAction === 'suspend' ? 'This will block all users from this organization immediately.' : 
             'A temporary password reset link will be sent to the admin email address.'}
          </p>
          {confirmAction === 'delete' && (
            <Input label={`Type "${selectedTenant?.name}" to confirm`} value={confirmInput} onChange={(e) => setConfirmInput(e.target.value)} />
          )}
          <div className="flex gap-2 pt-2">
            <Button label="Cancel" variant="ghost" className="flex-1" onClick={() => setShowConfirmModal(false)} />
            <Button 
              label={confirmAction === 'delete' ? 'Terminate Data' : confirmAction === 'suspend' ? 'Confirm Suspension' : 'Send Link'} 
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
