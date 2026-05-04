import { useMemo, useState } from 'react'
import { 
  HiPencilSquare, 
  HiUserPlus, 
  HiTrash, 
  HiEnvelope, 
  HiShieldCheck,
  HiMagnifyingGlass,
  HiXMark
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
    alert(`Invite sent to ${inviteForm.email}`)
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
    if (confirm(`Are you sure you want to revoke access for ${selectedUser.name}?`)) {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: 'Inactive' } : u))
      setShowEditModal(false)
    }
  }

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Administrators</h1>
          <p className="mt-1 text-sm text-gray-500">Manage internal team members with access to the SuperAdmin panel.</p>
        </div>
        <Button label="Invite New Admin" variant="primary" icon={HiUserPlus} onClick={() => setShowInviteModal(true)} />
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            placeholder="Search by name, email or role..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Badge label={`${filtered.length} Users Total`} color="gray" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table 
          columns={[
            { key: 'user', label: 'Administrator' },
            { key: 'role', label: 'Platform Role' },
            { key: 'lastLogin', label: 'Last Activity' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: 'Actions' },
          ]} 
          data={filtered.map(u => ({
            user: (
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-600">
                  {getInitials(u.name)}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
              </div>
            ),
            role: <Badge label={u.role} color={u.role === 'Super Admin' ? 'indigo' : 'blue'} />,
            lastLogin: <span className="text-xs text-gray-500">{u.lastLogin}</span>,
            status: <Badge label={u.status} color={u.status === 'Active' ? 'green' : u.status === 'Pending' ? 'amber' : 'gray'} />,
            actions: (
              <Button variant="ghost" size="sm" icon={HiPencilSquare} onClick={() => handleEditClick(u)} />
            )
          }))} 
        />
      </div>

      {/* Invite Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite New Administrator" size="md">
        <div className="space-y-5">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
             <HiEnvelope className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
             <p className="text-xs text-blue-700 leading-relaxed">
               Invited users will receive a secure link to set up their platform password and multi-factor authentication.
             </p>
          </div>
          <Input label="Full Name *" placeholder="e.g. Sarah Wilson" value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} />
          <Input label="Email Address *" type="email" placeholder="sarah.w@hriscloud.io" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} />
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Platform Access Level *</label>
            <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none" value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}>
              <option>Super Admin</option><option>Support Admin</option><option>Billing Admin</option><option>Read Only</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button label="Cancel" variant="ghost" className="flex-1" onClick={() => setShowInviteModal(false)} />
            <Button label="Send Invitation" variant="primary" className="flex-1" onClick={handleInvite} />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Manage Access">
        <div className="space-y-4">
          <Input label="Full Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <Input label="Email Address" value={editForm.email} disabled />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Platform Role</label>
              <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                <option>Super Admin</option><option>Support Admin</option><option>Billing Admin</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Account Status</label>
              <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-6">
            <Button label="Update Account" variant="primary" onClick={handleSaveEdit} />
            <div className="flex gap-2">
              <Button label="Revoke Access" variant="ghost" className="flex-1 text-red-600 hover:bg-red-50" icon={HiTrash} onClick={handleRevoke} />
              <Button label="Cancel" variant="ghost" className="flex-1" onClick={() => setShowEditModal(false)} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
