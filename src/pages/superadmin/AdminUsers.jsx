import { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
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
import { superadminService } from '../../services/superadminService'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [q, setQ] = useState('')

  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Form states
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Super Admin', sendEmail: true })
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'Super Admin', status: 'Active' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchUsers()
  }, [])

  const generateTempPassword = () => {
    const random = Math.random().toString(36).slice(-6)
    return `Tmp@${random}A1`
  }

  const mapRoleLabel = (roleKey) => String(roleKey || 'superadmin')
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')

  const mapApiUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: mapRoleLabel(user.role),
    status: user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active',
    lastLogin: user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never',
  })

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await superadminService.getAdminUsers()
      const list = response?.data?.data?.users || []
      setUsers(list.map(mapApiUser))
    } catch (error) {
      console.error('Failed to fetch admin users:', error)
      Swal.fire({
        icon: 'error',
        title: 'Load Failed',
        text: error.response?.data?.message || 'Failed to load admin users.',
        confirmButtonColor: '#0F766E',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return users
    return users.filter((u) => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(query))
  }, [q, users])

  const handleInvite = async () => {
    if (!inviteForm.name || !inviteForm.email) {
      setErrors({ name: !inviteForm.name, email: !inviteForm.email })
      return
    }

    try {
      const tempPassword = generateTempPassword()
      await superadminService.createAdminUser({
        name: inviteForm.name,
        email: inviteForm.email,
        password: tempPassword,
        role: inviteForm.role.toLowerCase().replace(/\s+/g, '_'),
        status: 'pending',
      })
      await fetchUsers()
      setShowInviteModal(false)
      setInviteForm({ name: '', email: '', role: 'Super Admin', sendEmail: true })
      setErrors({})
      Swal.fire({
        icon: 'success',
        title: 'User Invited',
        text: 'Admin user created successfully. Credentials have been dispatched to their email address.',
        confirmButtonColor: '#0F766E',
      })
    } catch (error) {
      console.error('Failed to create admin user:', error)
      Swal.fire({
        icon: 'error',
        title: 'Invite Failed',
        text: error.response?.data?.message || 'Failed to create admin user.',
        confirmButtonColor: '#0F766E',
      })
    }
  }

  const handleEditClick = (user) => {
    setSelectedUser(user)
    setEditForm({ name: user.name, email: user.email, role: user.role, status: user.status })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editForm.name) {
      setErrors({ name: true })
      return
    }
    try {
      await superadminService.updateAdminUser(selectedUser.id, {
        name: editForm.name,
        role: editForm.role.toLowerCase().replace(/\s+/g, '_'),
        status: editForm.status.toLowerCase(),
      })
      await fetchUsers()
      setShowEditModal(false)
      setErrors({})
      Swal.fire({
        icon: 'success',
        title: 'User Updated',
        text: 'Admin user details have been updated.',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Failed to update admin user:', error)
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Failed to update admin user.',
        confirmButtonColor: '#0F766E',
      })
    }
  }

  const handleRevoke = async () => {
    if (window.confirm(`Are you sure you want to revoke access for ${selectedUser.name}?`)) {
      try {
        await superadminService.updateAdminUser(selectedUser.id, { status: 'inactive' })
        await fetchUsers()
        setShowEditModal(false)
        Swal.fire({
          icon: 'success',
          title: 'Access Revoked',
          text: `${selectedUser.name} is now inactive.`,
          timer: 1500,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error('Failed to revoke admin user:', error)
        Swal.fire({
          icon: 'error',
          title: 'Revoke Failed',
          text: error.response?.data?.message || 'Failed to revoke admin user.',
          confirmButtonColor: '#0F766E',
        })
      }
    }
  }

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)

  return (
    <div className="sa-page">
      {/* Hero */}
      <div className="sa-hero px-6 py-4">
        <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white shadow-inner">
                <HiUserCircle className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-widest">Admin Users</h1>
                <p className="mt-0.5 text-xs text-emerald-100/80 leading-relaxed max-w-xl">
                  Manage internal team access, roles, and account status for the superadmin workspace.
                </p>
              </div>
              <div className="group relative">
                <HiQuestionMarkCircle className="h-4 w-4 text-emerald-100/70 cursor-help hover:text-white transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-slate-900 text-white text-[10px] leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl border border-white/10">
                  <p className="font-bold text-emerald-300 mb-1 uppercase tracking-widest">Internal Team</p>
                  Manage your internal staff who have access to this superadmin panel.
                  <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
              </div>
            </div>
          </div>
          <Button
            label="Add User"
            icon={HiUserPlus}
            onClick={() => setShowInviteModal(true)}
            variant="ghost"
            className="mt-1 !bg-white !text-[#0F766E] hover:!bg-emerald-50 border-none shadow-lg text-[11px] font-black uppercase tracking-widest py-2"
          />
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
      </div>

      <div className="sa-card p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 group w-full">
          <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-transparent rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F766E]/30 transition-all outline-none"
            placeholder="Search team members..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 w-full sm:w-auto">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Pool</span>
          <span className="text-xs font-bold text-slate-900">{isLoading ? 'Loading...' : `${filtered.length} Staff`}</span>
        </div>
        </div>
      </div>

      {/* Team Member Table */}
      <div className="sa-card overflow-hidden">
        <div className="bg-[#0F766E] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <HiUserGroup className="h-4 w-4 opacity-90" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Team Members</h2>
          </div>
          <p className="text-xs font-bold text-white/80">
            {isLoading ? 'Loading...' : `${filtered.length} Active`}
          </p>
        </div>
        <div className="p-4">
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
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[11px] font-black text-[#0F766E] shadow-sm transition-transform hover:scale-105">
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
              <Button variant="ghost" size="sm" icon={HiPencilSquare} className="text-slate-400 hover:text-[#0F766E]" onClick={() => handleEditClick(u)} />
            )
          }))}
        />
        </div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Staff Identity *" placeholder="e.g. Sarah Wilson" value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} />
            <Input label="Enterprise Email *" type="email" placeholder="sarah.w@hriscloud.io" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} />
            <div className="md:col-span-2">
              <label className="mb-2 block text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Orchestration Privilege Level *</label>
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none shadow-sm cursor-pointer" value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}>
                <option>Super Admin</option><option>Support Admin</option><option>Billing Admin</option><option>Read Only</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 pt-6 border-t border-slate-100">
            <Button label="Cancel" variant="ghost" className="flex-1 font-bold text-slate-400" onClick={() => setShowInviteModal(false)} />
            <Button label="Save" variant="primary" className="flex-1 bg-[#0F766E] hover:bg-[#0D5F57] border-none" onClick={handleInvite} />
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
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-[#0F766E] transition-all appearance-none cursor-pointer" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                <option>Super Admin</option><option>Support Admin</option><option>Billing Admin</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Account Status</label>
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-[#0F766E] transition-all appearance-none cursor-pointer" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
            <Button label="Save" variant="primary" className="bg-[#0F766E] hover:bg-[#0D5F57] border-none" onClick={handleSaveEdit} />
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
