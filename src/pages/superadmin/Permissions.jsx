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
  HiTrash,
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

  const toggleNewRolePerm = (key) => {
    setNewRole({
      ...newRole,
      permissions: {
        ...newRole.permissions,
        [key]: !newRole.permissions[key]
      }
    })
  }

  const toggleEditRolePerm = (key) => {
    setEditRole({
      ...editRole,
      permissions: {
        ...editRole.permissions,
        [key]: !editRole.permissions[key]
      }
    })
  }

  const toggleAll = (type) => {
    const roleToUpdate = type === 'new' ? newRole : editRole
    const setter = type === 'new' ? setNewRole : setEditRole
    const allOn = Object.values(roleToUpdate.permissions).every(v => v === true)

    const nextPerms = {}
    Object.keys(initialPermissions).forEach(key => {
      nextPerms[key] = !allOn
    })

    setter({ ...roleToUpdate, permissions: nextPerms })
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

  const handleDeleteRole = async (roleId) => {
    const result = await Swal.fire({
      title: 'Delete Role?',
      text: "This will revoke access for all users assigned to this role. This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it'
    })

    if (result.isConfirmed) {
      try {
        await superadminService.deleteRole(roleId)
        await fetchRoles()
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Role has been removed.',
          timer: 1500,
          showConfirmButton: false
        })
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: error.response?.data?.message || 'Failed to delete role.'
        })
      }
    }
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

  const handleToggleActive = async (roleId, currentStatus) => {
    if (roleId === 'superadmin') return
    try {
      await superadminService.updateRole(roleId, { isActive: !currentStatus })
      await fetchRoles()
      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        timer: 900,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Failed to update role status.'
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
    <div className="sa-page">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#0F766E] flex items-center justify-center text-white shadow-sm">
              <HiLockClosed className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Permissions</h1>
            <div className="group relative">
              <HiQuestionMarkCircle className="h-4 w-4 text-slate-300 cursor-help hover:text-[#0F766E] transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-slate-900 text-white text-[10px] leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl border border-white/10">
                <p className="font-bold text-emerald-300 mb-1 uppercase tracking-widest">Access Control</p>
                Set what each admin role can access on the platform.
                <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
              </div>
            </div>
          </div>
          <p className="text-[11px] font-medium text-slate-500">Manage user roles and permissions.</p>
        </div>
        <Button label="Add Role" variant="primary" size="sm" icon={HiPlus} onClick={() => setShowCreateModal(true)} className="bg-[#0F766E] hover:bg-[#0D5F57] border-none" />
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
        title="Add Role"
        description="Create a new role with specific access permissions."
        icon={HiPlus}
        size="lg"
      >
        <div className="space-y-8 p-2">


          <div className="space-y-6">
            <Input
              label="Role Name *"
              placeholder="e.g. Finance Auditor"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
            />
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
              <div className="space-y-0.5">
                <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest px-1">Active Status</label>
                <p className="text-[10px] text-slate-500 px-1 italic">Determine if this role can be currently assigned to users</p>
              </div>
              <GreenCheckbox
                checked={newRole.isActive}
                onChange={() => setNewRole({ ...newRole, isActive: !newRole.isActive })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
              <textarea
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium focus:bg-white focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none shadow-sm"
                placeholder="Briefly describe the responsibilities of this role..."
                rows={3}
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-100">
            <Button label="Cancel" variant="ghost" className="flex-1 font-bold text-slate-400" onClick={() => setShowCreateModal(false)} />
            <Button label="Create Role" variant="primary" className="flex-1 bg-[#0F766E] hover:bg-[#0D5F57] border-none" onClick={handleCreateRole} disabled={!newRole.name} />
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Role"
        description="Update administrative credentials and orchestration rights."
        icon={HiPencil}
        size="lg"
      >
        <div className="space-y-8 p-2">


          <div className="space-y-6">
            <Input
              label="Role Name *"
              value={editRole.name}
              onChange={(e) => setEditRole({ ...editRole, name: e.target.value })}
            />
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
              <div className="space-y-0.5">
                <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest px-1">Active Status</label>
                <p className="text-[10px] text-slate-500 px-1 italic">Toggle availability for this role</p>
              </div>
              <GreenCheckbox
                checked={editRole.isActive}
                onChange={() => setEditRole({ ...editRole, isActive: !editRole.isActive })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
              <textarea
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium focus:bg-white focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none shadow-sm"
                rows={3}
                value={editRole.description}
                onChange={(e) => setEditRole({ ...editRole, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-100">
            <Button label="Cancel" variant="ghost" className="flex-1 font-bold text-slate-400" onClick={() => setShowEditModal(false)} />
            <Button label="Update Role" variant="primary" className="flex-1 bg-[#0F766E] hover:bg-[#0D5F57] border-none" onClick={handleUpdateRole} disabled={!editRole.name} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
