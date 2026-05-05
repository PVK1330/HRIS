import { useMemo, useState } from 'react'
import { 
  HiPencilSquare, 
  HiUserPlus, 
  HiTrash, 
  HiEnvelope, 
  HiShieldCheck,
  HiMagnifyingGlass,
  HiXMark,
  HiQuestionMarkCircle,
  HiFingerPrint,
  HiUserGroup,
  HiUserCircle,
  HiPlus
} from 'react-icons/hi2'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { adminUsers as initialUsers } from '../../data/mockData.js'

export default function AdminUsers() {
  const [users, setUsers] = useState(initialUsers)
  const [q, setQ] = useState('')

  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Form states
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Super Admin', sendEmail: true })
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'Super Admin', status: 'Active' })
  const [errors, setErrors] = useState({})

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return users
    return users.filter((u) => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(query))
  }, [q, users])

  const handleInvite = () => {
    if (!inviteForm.name || !inviteForm.email) {
      setErrors({ name: !inviteForm.name, email: !inviteForm.email })
      return
    }

    const newUser = {
      id: `au${Date.now()}`,
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role,
      lastLogin: 'Never',
      status: 'Pending',
    }

    setUsers([newUser, ...users])
    setShowInviteModal(false)
    setInviteForm({ name: '', email: '', role: 'Super Admin', sendEmail: true })
    setErrors({})
  }

  const handleEditClick = (user) => {
    setSelectedUser(user)
    setEditForm({ name: user.name, email: user.email, role: user.role, status: user.status })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    if (!editForm.name) {
      setErrors({ name: true })
      return
    }
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...editForm } : u))
    setShowEditModal(false)
    setErrors({})
  }

  const handleRevoke = () => {
    if (window.confirm(`Are you sure you want to revoke access for ${selectedUser.name}?`)) {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: 'Inactive' } : u))
      setShowEditModal(false)
    }
  }

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
             <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <HiUserCircle className="h-4.5 w-4.5" />
             </div>
             <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admin Users</h1>
             <div className="group relative">
                <HiQuestionMarkCircle className="h-4 w-4 text-slate-300 cursor-help hover:text-blue-500 transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-slate-900 text-white text-[10px] leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl border border-white/10">
                   <p className="font-bold text-blue-400 mb-1 uppercase tracking-widest">Internal Team</p>
                   Manage your internal staff who have access to this superadmin panel.
                   <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
             </div>
          </div>
          <p className="text-[11px] font-medium text-slate-500">Manage internal staff members.</p>
        </div>
        <Button label="Add User" variant="primary" size="sm" icon={HiUserPlus} onClick={() => setShowInviteModal(true)} />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 group w-full">
          <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-transparent rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500/20 transition-all outline-none"
            placeholder="Search team members..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 w-full sm:w-auto">
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Pool</span>
           <span className="text-xs font-bold text-slate-900">{filtered.length} Staff</span>
        </div>
      </div>

      {/* Team Member Table */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <Table 
          columns={[
            { key: 'user', label: 'Admin User' },
            { key: 'role', label: 'Role' },
            { key: 'lastLogin', label: 'Last Login' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: 'Actions' },
          ]} 
          data={filtered.map(u => ({
            user: (
              <div className="flex items-center gap-4 py-2">
                <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[11px] font-black text-blue-600 shadow-sm transition-transform hover:scale-105">
                  {getInitials(u.name)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 tracking-tight">{u.name}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.email}</div>
                </div>
              </div>
            ),
            role: <Badge label={u.role} color={u.role === 'Super Admin' ? 'indigo' : 'blue'} variant="glass" />,
            lastLogin: <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{u.lastLogin}</span>,
            status: <Badge label={u.status} color={u.status === 'Active' ? 'green' : u.status === 'Pending' ? 'amber' : 'gray'} />,
            actions: (
              <Button variant="ghost" size="sm" icon={HiPencilSquare} className="text-slate-400 hover:text-blue-600" onClick={() => handleEditClick(u)} />
            )
          }))} 
        />
      </div>

      {/* Invite Modal */}
      <Modal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)} 
        title="Provision Team Member" 
        description="Initialize a new administrative credentials for an HRIS staff member."
        icon={HiPlus}
        size="lg"
      >
        <div className="space-y-8 p-2">
          <div className="p-6 bg-blue-50/50 rounded-[1.5rem] border border-blue-100 flex gap-4 items-start">
             <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                <HiFingerPrint className="h-6 w-6" />
             </div>
             <p className="text-xs text-blue-700 font-medium leading-relaxed">
               Secure credentials will be dispatched via encrypted email. The staff member will be required to configure multi-factor authentication (MFA) upon first access.
             </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Staff Identity *" placeholder="e.g. Sarah Wilson" value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} />
            <Input label="Enterprise Email *" type="email" placeholder="sarah.w@hriscloud.io" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} />
            <div className="md:col-span-2">
              <label className="mb-2 block text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Orchestration Privilege Level *</label>
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none shadow-sm cursor-pointer" value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}>
                <option>Super Admin</option><option>Support Admin</option><option>Billing Admin</option><option>Read Only</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 pt-6 border-t border-slate-100">
            <Button label="Cancel" variant="ghost" className="flex-1 font-bold text-slate-400" onClick={() => setShowInviteModal(false)} />
            <Button label="Save" variant="primary" className="flex-1" onClick={handleInvite} />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title="Manage Staff Credentials"
        description="Modify internal administrative metadata and orchestration rights."
        icon={HiPencilSquare}
      >
        <div className="space-y-6 p-2">
          <Input label="Staff Identity" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <Input label="Registered Email" value={editForm.email} disabled />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Platform Role</label>
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                <option>Super Admin</option><option>Support Admin</option><option>Billing Admin</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Account Status</label>
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
            <Button label="Save" variant="primary" onClick={handleSaveEdit} />
            <div className="flex gap-3">
              <Button label="Delete" variant="ghost" className="flex-1 text-red-600 hover:bg-red-50 font-bold border-transparent" icon={HiTrash} onClick={handleRevoke} />
              <Button label="Cancel" variant="ghost" className="flex-1 font-bold text-slate-400 border-transparent" onClick={() => setShowEditModal(false)} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
