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
  HiPlus,
  HiCheckCircle,
  HiXCircle
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
      Swal.fire({
        icon: 'warning',
        title: 'Required fields',
        text: 'Name and email are required.',
        confirmButtonColor: '#0F766E',
      })
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
      Swal.fire({
        icon: 'warning',
        title: 'Required field',
        text: 'Name is required.',
        confirmButtonColor: '#0F766E',
      })
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
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Top Title Bar with Moved Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Admin Users</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Team</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Admin Listing</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => setShowInviteModal(true)} className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm">
            <HiPlus className="h-4 w-4" /> Add User
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          { label: 'TOTAL ADMINS', count: users.length, bgColor: 'bg-[#0F172A]', icon: HiUserGroup },
          { label: 'ACTIVE', count: users.filter(u => u.status === 'Active').length, bgColor: 'bg-[#10B981]', icon: HiCheckCircle },
          { label: 'PENDING', count: users.filter(u => u.status === 'Pending').length, bgColor: 'bg-[#3B82F6]', icon: HiQuestionMarkCircle },
          { label: 'INACTIVE', count: users.filter(u => u.status === 'Inactive').length, bgColor: 'bg-[#EF4444]', icon: HiXCircle }
        ].map((card, idx) => (
            <div
              key={idx}
              className="group flex items-center gap-3.5 rounded-none border border-slate-200 p-4 text-left transition-all hover:bg-slate-50/50 min-w-0 shadow-sm bg-white"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}><card.icon className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold uppercase tracking-wider truncate leading-none text-slate-400">{card.label}</div>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
              </div>
            </div>
        ))}
      </div>

      {/* Main Table Registry Area */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Team Members</h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative min-w-[250px] flex-1 max-w-md">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search team members..." className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-slate-500">{filtered.length} records shown</p>
            {q ? (
              <button type="button" onClick={() => setQ('')} className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50">Reset Filters</button>
            ) : null}
          </div>
        </div>

        <Table
          square
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
              <div className="flex items-center justify-start gap-2">
                <button type="button" onClick={() => handleEditClick(u)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-sky-500 text-white transition-colors hover:bg-sky-600"><HiPencilSquare className="h-4 w-4" /></button>
              </div>
            )
          }))}
        />
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Provision Team Member</h2>
            <p className="text-sm text-slate-500">Initialize a new administrative credentials for an HRIS staff member.</p>
          </div>
        }
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Staff Identity *" placeholder="e.g. Sarah Wilson" value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} />
            <Input label="Enterprise Email *" type="email" placeholder="sarah.w@hriscloud.io" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} />
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-900">Orchestration Privilege Level *</label>
              <select className="w-full rounded-none border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all cursor-pointer" value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}>
                <option>Super Admin</option><option>Support Admin</option><option>Billing Admin</option><option>Read Only</option>
              </select>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button type="button" onClick={() => setShowInviteModal(false)} className="rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="button" onClick={handleInvite} className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64] transition-colors">Save</button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Manage Staff Credentials</h2>
            <p className="text-sm text-slate-500">Modify internal administrative metadata and orchestration rights.</p>
          </div>
        }
      >
        <div className="space-y-6">
          <Input label="Staff Identity" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <Input label="Registered Email" value={editForm.email} disabled />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">Platform Role</label>
              <select className="w-full rounded-none border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all cursor-pointer" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                <option>Super Admin</option><option>Support Admin</option><option>Billing Admin</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">Account Status</label>
              <select className="w-full rounded-none border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all cursor-pointer" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button type="button" onClick={handleRevoke} className="rounded-none border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors mr-auto">Delete</button>
            <button type="button" onClick={() => setShowEditModal(false)} className="rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="button" onClick={handleSaveEdit} className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64] transition-colors">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
