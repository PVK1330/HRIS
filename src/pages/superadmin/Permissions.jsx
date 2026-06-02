import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Badge } from '../../components/ui/Badge.jsx'
import { Toggle } from '../../components/ui/Toggle.jsx'
import { Button } from '../../components/ui/Button.jsx'
import {
  HiShieldCheck,
  HiCreditCard,
  HiChatBubbleLeftRight,
  HiInformationCircle,
  HiPlus,
  HiUserGroup,
  HiLockClosed,
  HiQuestionMarkCircle,
  HiGlobeAlt,
  HiDocumentText,
  HiCommandLine,
  HiSquares2X2,
  HiFingerPrint,
  HiCheck,
  HiPencil,
  HiXMark
} from 'react-icons/hi2'
import { Modal } from '../../components/ui/Modal.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { superadminService } from '../../services/superadminService'

export default function Permissions() {
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)

  const initialPermissions = {
    dashboard: false,
    organizations: false,
    subscription_plans: false,
    subscription_features: false,
    billing: false,
    admin_users: false,
    permissions: false,
    modules: false,
    announcements: false,
    audit_logs: false,
    support: false,
    settings: false
  }

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    isActive: true,
    permissions: initialPermissions
  })

  const [editRole, setEditRole] = useState({
    name: '',
    description: '',
    isActive: true,
    permissions: initialPermissions
  })

  const GreenCheckbox = ({ checked, onChange, disabled }) => (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${checked
        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200'
        : 'bg-white border-slate-200 text-transparent hover:border-emerald-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <HiCheck className="h-4 w-4" />
    </button>
  )

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setIsLoading(true)
      const response = await superadminService.getPermissions()
      const list = response?.data?.data?.roles || []
      setRoles(list.map((role) => {
        const isSuperAdmin = role.role_key === 'superadmin';
        // Force all permissions to true for superadmin
        const perms = isSuperAdmin
          ? Object.keys(initialPermissions).reduce((acc, key) => ({ ...acc, [key]: true }), {})
          : (role.permissions || {});

        return {
          id: role.role_key,
          name: role.role_name,
          description: role.description,
          icon: isSuperAdmin ? HiFingerPrint : role.role_key === 'billing_admin' ? HiCreditCard : HiUserGroup,
          color: isSuperAdmin ? 'rose' : role.role_key === 'billing_admin' ? 'emerald' : 'blue',
          isActive: role.is_active,
          permissions: perms
        };
      }))
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
      Swal.fire({
        icon: 'error',
        title: 'Load Failed',
        text: error.response?.data?.message || 'Failed to load permissions.',
        confirmButtonColor: '#0F766E',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRole = async () => {
    if (!newRole.name) return

    try {
      await superadminService.createRole({
        name: newRole.name,
        description: newRole.description,
        isActive: newRole.isActive,
        permissions: newRole.permissions
      })
      await fetchRoles()
      setShowCreateModal(false)
      setNewRole({
        name: '',
        description: '',
        isActive: true,
        permissions: initialPermissions
      })
      Swal.fire({
        icon: 'success',
        title: 'Role Created',
        text: 'New role has been added successfully.',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Failed to create role:', error)
      Swal.fire({
        icon: 'error',
        title: 'Create Failed',
        text: error.response?.data?.message || 'Failed to create role.',
        confirmButtonColor: '#0F766E',
      })
    }
  }

  const handleToggle = async (roleId, permKey) => {
    // Prevent modifying Super Admin for safety in this mock
    if (roleId === 'superadmin') return

    const role = roles.find((r) => r.id === roleId)
    if (!role) return
    const nextPermissions = {
      ...role.permissions,
      [permKey]: !role.permissions[permKey]
    }
    try {
      await superadminService.updateRole(roleId, {
        permissions: nextPermissions
      })
      await fetchRoles()
      Swal.fire({
        icon: 'success',
        title: 'Permission Updated',
        timer: 900,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Failed to update permissions:', error)
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Failed to update role permissions.',
        confirmButtonColor: '#0F766E',
      })
    }
  }

  const handleEditRoleClick = (role) => {
    setSelectedRole(role)
    setEditRole({
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      permissions: { ...initialPermissions, ...role.permissions }
    })
    setShowEditModal(true)
  }

  const handleUpdateRole = async () => {
    try {
      await superadminService.updateRole(selectedRole.id, {
        name: editRole.name,
        description: editRole.description,
        isActive: editRole.isActive,
        permissions: editRole.permissions
      })
      await fetchRoles()
      setShowEditModal(false)
      Swal.fire({
        icon: 'success',
        title: 'Updated',
        text: 'Role has been updated.',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Failed to update role.'
      })
    }
  }

  const permissionLabels = {
    dashboard: { label: 'Dashboard', icon: HiSquares2X2 },
    organizations: { label: 'Organizations', icon: HiGlobeAlt },
    subscription_plans: { label: 'Subscription Plans', icon: HiCreditCard },
    subscription_features: { label: 'Subscription Features', icon: HiDocumentText },
    billing: { label: 'Billing', icon: HiCreditCard },
    admin_users: { label: 'Admin Users', icon: HiUserGroup },
    permissions: { label: 'Permissions', icon: HiLockClosed },
    modules: { label: 'Modules', icon: HiCommandLine },
    announcements: { label: 'Announcements', icon: HiInformationCircle },
    audit_logs: { label: 'Audit Logs', icon: HiShieldCheck },
    support: { label: 'Support', icon: HiChatBubbleLeftRight },
    settings: { label: 'Settings', icon: HiSquares2X2 }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Top Title Bar with Moved Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Permissions</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Team</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Permissions</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => setShowCreateModal(true)} className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm">
            <HiPlus className="h-4 w-4" /> Add Role
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {isLoading ? <div className="text-sm text-slate-500 px-2">Loading roles...</div> : roles.map((role) => (
          <div key={role.id} className="flex flex-col rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md group">
            {/* Role Header */}
            <div className={`p-5 border-b border-slate-50 relative`}>
              <div className="absolute top-8 right-8 flex items-center gap-3">
                <div className="flex flex-col items-end gap-1">
                  {role.id !== 'superadmin' && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/50 border border-slate-100 backdrop-blur-sm">
                      <div className={`h-1.5 w-1.5 rounded-full ${role.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{role.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{role.name}</h2>
                {role.id !== 'superadmin' && (
                  <button
                    onClick={() => handleEditRoleClick(role)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#0F766E] hover:bg-emerald-50 transition-all"
                    title="Edit Role Metadata"
                  >
                    <HiPencil className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs font-medium text-slate-400 leading-relaxed">{role.description}</p>
            </div>

            {/* Permissions List */}
            <div className="flex-1 p-6 space-y-6 bg-slate-50/20">
              {[
                { title: 'Core Modules', keys: ['dashboard', 'organizations', 'subscription_plans', 'subscription_features', 'billing'] },
                { title: 'Team & Security', keys: ['admin_users', 'permissions', 'modules', 'announcements'] },
                { title: 'System', keys: ['audit_logs', 'support', 'settings'] }
              ].map(group => (
                <div key={group.title} className="space-y-3">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{group.title}</h4>
                  {group.keys.map((key) => (
                    <div key={key} className="flex items-center justify-between group/item">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${role.permissions[key] ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-300'}`}>
                          {permissionLabels[key] && (() => {
                            const Icon = permissionLabels[key].icon;
                            return <Icon className="h-4 w-4" />;
                          })()}
                        </div>
                        <span className="text-xs font-bold text-slate-700 group-hover/item:text-slate-900 transition-colors">
                          {permissionLabels[key] ? permissionLabels[key].label : key}
                        </span>
                      </div>
                      <GreenCheckbox
                        checked={role.permissions[key]}
                        onChange={() => handleToggle(role.id, key)}
                        disabled={role.id === 'superadmin'}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>


          </div>
        ))}
      </div>

      {/* Strategic Info Section */}
      {/* <div className="rounded-[2rem] border border-indigo-100 bg-indigo-50/30 p-8 flex gap-5 items-start">
        <div className="h-10 w-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm">
          <HiInformationCircle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-black text-indigo-900 uppercase tracking-widest">RBAC Management Policy</p>
          <p className="mt-1 text-sm font-medium text-indigo-600/80 leading-relaxed max-w-4xl">
            These governance policies apply exclusively to the HRIS platform's internal administrative kernel.
            Individual organization roles (e.g., HR Manager, Department Head) are isolated and managed within their respective organization instances.
          </p>
        </div>
      </div> */}

      {/* Create Custom Role Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Add Role</h2>
            <p className="text-sm text-slate-500">Create a new role with specific access permissions.</p>
          </div>
        }
        size="lg"
      >
        <div className="space-y-6">
          <Input
            label="Role Name *"
            placeholder="e.g. Finance Auditor"
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
          />
          <div className="flex items-center justify-between p-4 rounded-none border border-slate-200 bg-white shadow-sm">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-slate-900">Active Status</label>
              <p className="text-xs text-slate-500">Determine if this role can be currently assigned to users</p>
            </div>
            <GreenCheckbox
              checked={newRole.isActive}
              onChange={() => setNewRole({ ...newRole, isActive: !newRole.isActive })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">Description</label>
            <textarea
              className="w-full rounded-none border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none transition-all resize-none"
              placeholder="Briefly describe the responsibilities of this role..."
              rows={3}
              value={newRole.description}
              onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
            />
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button type="button" onClick={() => setShowCreateModal(false)} className="rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="button" onClick={handleCreateRole} disabled={!newRole.name} className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64] disabled:opacity-50 transition-colors">Create Role</button>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Edit Role</h2>
            <p className="text-sm text-slate-500">Update administrative credentials and orchestration rights.</p>
          </div>
        }
        size="lg"
      >
        <div className="space-y-6">
          <Input
            label="Role Name *"
            value={editRole.name}
            onChange={(e) => setEditRole({ ...editRole, name: e.target.value })}
          />
          <div className="flex items-center justify-between p-4 rounded-none border border-slate-200 bg-white shadow-sm">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-slate-900">Active Status</label>
              <p className="text-xs text-slate-500">Toggle availability for this role</p>
            </div>
            <GreenCheckbox
              checked={editRole.isActive}
              onChange={() => setEditRole({ ...editRole, isActive: !editRole.isActive })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">Description</label>
            <textarea
              className="w-full rounded-none border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none transition-all resize-none"
              rows={3}
              value={editRole.description}
              onChange={(e) => setEditRole({ ...editRole, description: e.target.value })}
            />
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button type="button" onClick={() => setShowEditModal(false)} className="rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="button" onClick={handleUpdateRole} disabled={!editRole.name} className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64] disabled:opacity-50 transition-colors">Update Role</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
