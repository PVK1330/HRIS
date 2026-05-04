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
  HiCreditCard,
  HiUsers,
  HiShieldCheck,
  HiQuestionMarkCircle,
  HiGlobeAlt
} from 'react-icons/hi2'

export default function TenantManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Data State
  const [organizations, setOrganizations] = useState([
    { id: 1, name: 'AlphaCorp HR', domain: 'alphacorp.hriscloud.io', adminEmail: 'admin@alphacorp.com', plan: 'Enterprise', users: 342, maxUsers: 500, storage: 29, maxStorage: 50, status: 'Active', created: '01 Jan 2026', initials: 'AL', color: 'indigo', domainType: 'Subdomain', billingCycle: 'Annual' },
    { id: 2, name: 'HR Nexus Pvt Ltd', domain: 'hrnexus.hriscloud.io', adminEmail: 'it@hrnexus.io', plan: 'Growth', users: 87, maxUsers: 200, storage: 6, maxStorage: 20, status: 'Trial', created: '01 Apr 2026', initials: 'HR', color: 'cyan', domainType: 'Subdomain', billingCycle: 'Monthly' },
    { id: 3, name: 'TalentCo FZCO', domain: 'talentco.com', adminEmail: 'ops@talentco.com', plan: 'Pro', users: 156, maxUsers: 300, storage: 16.5, maxStorage: 30, status: 'SSL Issue', created: '15 Nov 2025', initials: 'TC', color: 'green', domainType: 'Custom Domain', billingCycle: 'Annual' },
    { id: 4, name: 'Zenith People Co', domain: 'zenith.hriscloud.io', adminEmail: 'hr@zenithpeople.ae', plan: 'Starter', users: 24, maxUsers: 50, storage: 1, maxStorage: 5, status: 'Suspended', created: '10 Aug 2025', initials: 'ZE', color: 'amber', domainType: 'Subdomain', billingCycle: 'Monthly' },
  ])

  // Modal States
  const [showNewModal, setShowNewModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const [selectedOrg, setSelectedOrg] = useState(null)
  const [confirmAction, setConfirmAction] = useState('')
  const [confirmInput, setConfirmInput] = useState('')

  // Form States
  const [editForm, setEditForm] = useState({ name: '', adminEmail: '', plan: 'Starter', billingCycle: 'Monthly', maxUsers: 50, status: 'Active' })
  const [newForm, setNewForm] = useState({ name: '', adminName: '', adminEmail: '', plan: 'Starter', billingCycle: 'Monthly', subdomain: '' })
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
    alert('Exporting ' + organizations.length + ' organizations to CSV...')
  }

  const handleLoginAs = (org) => {
    alert(`Redirecting to ${org.domain} as Platform Admin...`)
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

  const handleSaveEdit = () => {
    if (!editForm.name || !editForm.adminEmail) {
      setErrors({ name: !editForm.name, adminEmail: !editForm.adminEmail })
      return
    }
    setOrganizations(organizations.map(o => o.id === selectedOrg.id ? { ...o, ...editForm } : o))
    setShowEditModal(false)
  }

  const handleCreateOrganization = () => {
    if (!newForm.name || !newForm.adminEmail || !newForm.subdomain) {
      alert('Please fill all required fields.')
      return
    }
    const newOrg = {
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
    setOrganizations([newOrg, ...organizations])
    setShowNewModal(false)
    setNewForm({ name: '', adminName: '', adminEmail: '', plan: 'Starter', billingCycle: 'Monthly', subdomain: '' })
  }

  const handleAction = (type, org) => {
    setSelectedOrg(org)
    setConfirmAction(type)
    setConfirmInput('')
    setShowConfirmModal(true)
  }

  const executeAction = () => {
    if (confirmAction === 'delete' && confirmInput !== selectedOrg.name) {
      setErrors({ confirm: true })
      return
    }
    if (confirmAction === 'suspend') {
      setOrganizations(organizations.map(o => o.id === selectedOrg.id ? { ...o, status: 'Suspended' } : o))
    } else if (confirmAction === 'delete') {
      setOrganizations(organizations.filter(o => o.id !== selectedOrg.id))
    } else if (confirmAction === 'reset_pw') {
      alert(`Password reset link sent to ${selectedOrg.adminEmail}`)
    }
    setShowConfirmModal(false)
    setShowDetailModal(false)
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
          columns={[
            { key: 'org', label: 'Organization' },
            { key: 'plan', label: 'Tier' },
            { key: 'users', label: 'Nodes' },
            { key: 'status', label: 'Status' },
            { key: 'created', label: 'Onboarded' },
            { key: 'actions', label: 'Orchestration' },
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
            <Input label="Subdomain Prefix *" placeholder="hris-global" value={newForm.subdomain} onChange={(e) => setNewForm({ ...newForm, subdomain: e.target.value })} />
            <Input label="Root Admin Email *" type="email" placeholder="admin@org.com" value={newForm.adminEmail} onChange={(e) => setNewForm({ ...newForm, adminEmail: e.target.value })} />
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
          <div className="space-y-8 p-2">
            <div className="grid grid-cols-3 gap-6">
              <div className="p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Root Admin</span>
                <p className="mt-1 text-sm font-black text-slate-900 tracking-tight">{selectedOrg.adminEmail}</p>
              </div>
              <div className="p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Cycle</span>
                <p className="mt-1 text-sm font-black text-slate-900 tracking-tight">{selectedOrg.billingCycle}</p>
              </div>
              <div className="p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Node</span>
                <p className="mt-1 text-sm font-black text-slate-900 tracking-tight">{selectedOrg.storage}GB / {selectedOrg.maxStorage}GB</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Management Controls</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button label="Login As Administrator" variant="ghost" icon={HiArrowTopRightOnSquare} className="justify-start font-bold text-slate-600 py-3" onClick={() => handleLoginAs(selectedOrg)} />
                <Button label="Reset Access Credentials" variant="ghost" icon={HiKey} className="justify-start font-bold text-slate-600 py-3" onClick={() => handleAction('reset_pw', selectedOrg)} />
                <Button label="Scale Infrastructure" variant="ghost" icon={HiCreditCard} className="justify-start font-bold text-slate-600 py-3" onClick={() => handleEdit(selectedOrg)} />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-between items-center gap-4">
              <Button label="Suspend Ecosystem" variant="ghost" className="text-amber-600 hover:bg-amber-50 font-bold border-transparent" icon={HiClock} onClick={() => handleAction('suspend', selectedOrg)} />
              <Button label="Terminate Organization" variant="ghost" className="text-red-600 hover:bg-red-50 font-bold border-transparent" icon={HiTrash} onClick={() => handleAction('delete', selectedOrg)} />
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
