import { useEffect, useMemo, useState } from 'react'
import {
  HiArrowPath,
  HiBuildingOffice2,
  HiCheckBadge,
  HiChevronDown,
  HiChevronRight,
  HiGlobeAlt,
  HiMagnifyingGlass,
  HiPencilSquare,
  HiPlus,
  HiShieldCheck,
  HiTrash,
  HiUser,
  HiUserGroup,
} from 'react-icons/hi2'
import { Modal } from '../../../components/ui/Modal.jsx'
import useRbac, { useGroupedPermissions } from '../../../hooks/settings/useRbac'
import { DATA_SCOPES, scopeShortLabel } from '../../../constants/dataScopes'

const SCOPE_ICONS = {
  user: HiUser,
  team: HiUserGroup,
  building: HiBuildingOffice2,
  globe: HiGlobeAlt,
}

export default function RolesPermissions({ registerToolbar }) {
  const {
    roles,
    availablePermissions,
    selectedRole,
    selectedRoleId,
    loading,
    saving,
    savingPermissionId,
    deleting,
    creating,
    isDirty,
    scopeDirty,
    scopeLocked,
    currentScope,
    enabledCount,
    selectRole,
    setScope,
    togglePermission,
    isPermissionEnabled,
    isPermissionAvailable,
    saveRolePermissions,
    discardChanges,
    createRole,
    updateRole,
    deleteRole,
  } = useRbac()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDescription, setNewRoleDescription] = useState('')
  const [newRoleScope, setNewRoleScope] = useState('SELF')
  
  const [showEditForm, setShowEditForm] = useState(false)
  const [editRoleId, setEditRoleId] = useState(null)
  const [editRoleName, setEditRoleName] = useState('')
  const [editRoleDescription, setEditRoleDescription] = useState('')
  const [editRoleScope, setEditRoleScope] = useState('SELF')
  const [editRoleIsSystem, setEditRoleIsSystem] = useState(false)

  const [permSearch, setPermSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [expandedRoleId, setExpandedRoleId] = useState(null)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(permSearch.trim()), 350)
    return () => clearTimeout(t)
  }, [permSearch])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  const gridPermissions = useMemo(() => {
    if (!selectedRole) return []
    const map = new Map()
    for (const p of availablePermissions) {
      if (p?.id != null) map.set(p.id, p)
    }
    for (const p of selectedRole.permissions || []) {
      if (p?.id != null && !map.has(p.id)) map.set(p.id, p)
    }
    return [...map.values()].sort((a, b) => {
      const na = (a.name || a.key || '').toString()
      const nb = (b.name || b.key || '').toString()
      return na.localeCompare(nb)
    })
  }, [availablePermissions, selectedRole])

  const filteredPermissions = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    if (!q && statusFilter === 'all') return gridPermissions
    
    return gridPermissions.filter((p) => {
      let matchesSearch = true
      if (q) {
        const label = (p.name || p.label || p.key || '').toLowerCase()
        matchesSearch = label.includes(q) || String(p.key || '').toLowerCase().includes(q)
      }
      
      let matchesStatus = true
      if (statusFilter === 'enabled') {
        matchesStatus = isPermissionEnabled(p.id)
      } else if (statusFilter === 'disabled') {
        matchesStatus = !isPermissionEnabled(p.id)
      }
      
      return matchesSearch && matchesStatus
    })
  }, [gridPermissions, debouncedSearch, statusFilter, isPermissionEnabled])

  const groupedPermissions = useGroupedPermissions(filteredPermissions)

  const hasLockedPermissions = gridPermissions.some(
    (p) => !isPermissionAvailable(p),
  )

  useEffect(() => {
    if (!registerToolbar) return undefined
    registerToolbar({
      dirty: isDirty || scopeDirty,
      saving: saving || savingPermissionId != null,
      onSave: () => saveRolePermissions(),
      onDiscard: () => {
        if (window.confirm('Discard unsaved changes?')) discardChanges()
      },
      disableSave:
        saving ||
        savingPermissionId != null ||
        selectedRoleId == null ||
        (!isDirty && !scopeDirty),
    })
    return () => registerToolbar(null)
  }, [
    registerToolbar,
    isDirty,
    scopeDirty,
    saving,
    savingPermissionId,
    selectedRoleId,
    saveRolePermissions,
    discardChanges,
  ])

  async function handleSubmitNewRole(e) {
    e.preventDefault()
    const ok = await createRole({
      name: newRoleName.trim(),
      description: newRoleDescription.trim(),
      scope: newRoleScope,
    })
    if (ok) {
      setNewRoleName('')
      setNewRoleDescription('')
      setNewRoleScope('SELF')
      setShowCreateForm(false)
    }
  }

  const handleRoleClick = (role) => {
    if (expandedRoleId === role.id) {
      setExpandedRoleId(null)
      selectRole(null)
    } else {
      setExpandedRoleId(role.id)
      selectRole(role)
      // Reset permission filters when opening a new role
      setPermSearch('')
      setStatusFilter('all')
    }
  }

  const handleScopeChange = async (role, newScope) => {
    if (selectedRoleId !== role.id) {
      selectRole(role)
    }
    await setScope(newScope)
  }

  const openEditRole = (role) => {
    setEditRoleId(role.id)
    setEditRoleName(role.name)
    setEditRoleDescription(role.description || '')
    setEditRoleScope(role.data_scope || role.dataScope || 'SELF')
    setEditRoleIsSystem(role.is_system || false)
    setShowEditForm(true)
  }

  async function handleSubmitEditRole(e) {
    if (e) e.preventDefault()
    if (!editRoleId) return
    const ok = await updateRole(editRoleId, {
      name: editRoleName.trim(),
      description: editRoleDescription.trim(),
      scope: editRoleScope,
    })
    if (ok) {
      setShowEditForm(false)
      setEditRoleId(null)
    }
  }

  // Permission toggle button component
  const PermissionToggle = ({ permission, enabled, permSaving }) => {
    const available = permission.available
    const locked = !available
    const dashGuard = selectedRole?.is_system && permission.key === 'dashboard'
    
    return (
      <button
        type="button"
        onClick={() => {
          if (!locked && !permSaving && !(dashGuard && enabled)) {
            togglePermission(permission.id)
          }
        }}
        disabled={locked || (dashGuard && enabled) || permSaving || saving}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 ${
          enabled ? 'bg-[#0F766E]' : 'bg-slate-300'
        } ${(locked || (dashGuard && enabled)) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    )
  }

  if (loading && roles.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <HiArrowPath className="h-8 w-8 animate-spin text-[#0F766E]" />
        <span className="ml-3 text-sm font-medium text-slate-500">Loading roles…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      

      {/* Roles Table with Accordion */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-slate-50/60 px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Available Roles</h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="relative min-w-[200px] flex-1 max-w-md">
            <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search roles..."
              className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-none bg-[#0F766E] px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0c6b64]"
            >
              <HiPlus className="h-3.5 w-3.5" /> Add Role
            </button>
          </div>
        </div>

        {/* Roles Table Header */}
        <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          <div className="col-span-1"> </div>
          <div className="col-span-4">Role Name</div>
          <div className="col-span-3">Description</div>
          <div className="col-span-2">Scope</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Roles List */}
        <div className="divide-y divide-slate-100">
          {roles.map((role) => {
            const isExpanded = expandedRoleId === role.id
            const currentRoleScope = role.data_scope || role.dataScope || 'SELF'
            
            return (
              <div key={role.id}>
                {/* Role Row */}
                <div className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50 transition-colors">
                  <div className="col-span-1">
                    <button
                      onClick={() => handleRoleClick(role)}
                      className="text-slate-400 hover:text-[#0F766E] transition-colors"
                    >
                      {isExpanded ? (
                        <HiChevronDown className="h-5 w-5" />
                      ) : (
                        <HiChevronRight className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <div className="col-span-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] shadow-sm">
                        <HiUserGroup className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{role.name}</span>
                      {role.is_system && (
                        <span className="rounded-none bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">
                          System
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <span className="text-sm text-slate-500 truncate block">
                      {role.description || '—'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="inline-flex items-center rounded-none border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {scopeShortLabel(currentRoleScope)}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditRole(role)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#0F766E] hover:text-[#0F766E]"
                      aria-label={`Edit ${role.name}`}
                      title="Edit role"
                    >
                      <HiPencilSquare className="h-4 w-4" />
                    </button>
                    {!role.is_system && (
                      <button
                        type="button"
                        onClick={() => deleteRole(role.id)}
                        disabled={deleting}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600 disabled:opacity-40"
                        aria-label="Delete role"
                      >
                        <HiTrash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Accordion Content - Module Permissions Only */}
                {isExpanded && selectedRole && selectedRole.id === role.id && (
                  <div className="border-t border-slate-100 bg-slate-50/30 px-5 py-4">
                    {/* Module Permissions Section */}
                    <div>
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-sm font-bold text-slate-900">Module Permissions</h3>
                        <div className="flex gap-2">
                          <div className="relative">
                            <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={permSearch}
                              onChange={(e) => setPermSearch(e.target.value)}
                              placeholder="Search permissions..."
                              className="h-8 w-48 rounded-none border border-slate-200 bg-white px-3 pl-9 text-sm outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                            />
                          </div>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-8 rounded-none border border-slate-200 bg-white px-2 text-sm outline-none focus:border-[#0F766E]"
                          >
                            <option value="all">All</option>
                            <option value="enabled">Enabled</option>
                            <option value="disabled">Disabled</option>
                          </select>
                          {(permSearch || statusFilter !== 'all') && (
                            <button
                              onClick={() => { setPermSearch(''); setStatusFilter('all') }}
                              className="text-xs text-slate-500 hover:text-slate-700"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {hasLockedPermissions && (
                        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
                          Some modules are disabled on your subscription plan.
                        </div>
                      )}

                      {/* Permissions Grid */}
                      <div className="space-y-4">
                        {groupedPermissions.length === 0 ? (
                          <p className="py-8 text-center text-sm text-slate-400">
                            No permissions match your search.
                          </p>
                        ) : (
                          groupedPermissions.map(([groupName, perms]) => (
                            <div key={groupName}>
                              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                {groupName}
                              </p>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {perms.map((permission) => {
                                  const enabled = isPermissionEnabled(permission.id)
                                  const permSaving = savingPermissionId === permission.id
                                  const label = (permission.name || permission.label || permission.key || '')
                                    .replace(/_/g, ' ')
                                    .replace(/\b\w/g, char => char.toUpperCase())

                                  return (
                                    <div
                                      key={permission.id}
                                      className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                                        enabled
                                          ? 'border-emerald-200 bg-emerald-50/40'
                                          : 'border-slate-100 bg-white'
                                      }`}
                                    >
                                      <div>
                                        <p className="text-sm font-medium text-slate-800">{label}</p>
                                        {permission.key && (
                                          <p className="font-mono text-[10px] text-slate-400">
                                            {permission.key}
                                          </p>
                                        )}
                                      </div>
                                      <PermissionToggle
                                        permission={permission}
                                        enabled={enabled}
                                        permSaving={permSaving}
                                      />
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Save/Discard Buttons for permissions */}
                      {(isDirty || scopeDirty) && (
                        <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-4">
                          <button
                            onClick={() => {
                              if (window.confirm('Discard unsaved changes?')) discardChanges()
                            }}
                            className="rounded-none border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Discard
                          </button>
                          <button
                            onClick={() => saveRolePermissions()}
                            disabled={saving || savingPermissionId != null}
                            className="rounded-none bg-[#0F766E] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#0c6b64] disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Role Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        size="md"
        showClose
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Add New Role</h2>
            <p className="text-xs font-medium text-slate-500">
              Create a custom role with specific permissions.
            </p>
          </div>
        }
      >
        <form onSubmit={handleSubmitNewRole} className="pt-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Enter role name"
                required
                disabled={creating}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                Description
              </label>
              <textarea
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                placeholder="Enter description (optional)"
                disabled={creating}
                rows="3"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800">
                Data Scope
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                {DATA_SCOPES.map((opt) => {
                  const Icon = SCOPE_ICONS[opt.icon] || HiUser
                  const isActive = newRoleScope === opt.value

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={creating}
                      onClick={() => setNewRoleScope(opt.value)}
                      className={`relative flex flex-col rounded-lg border-2 p-3 text-left transition-all ${
                        isActive
                          ? 'border-[#0F766E] bg-emerald-50/50 ring-2 ring-[#0F766E]/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isActive && (
                        <HiCheckBadge className="absolute right-2 top-2 h-4 w-4 text-[#0F766E]" />
                      )}
                      <Icon className={`mb-1.5 h-5 w-5 ${isActive ? 'text-[#0F766E]' : 'text-slate-400'}`} />
                      <span className="text-sm font-bold text-slate-900">{opt.label}</span>
                      <span className="mt-0.5 text-[10px] leading-relaxed text-slate-500">{opt.description}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || newRoleName.trim().length < 2}
              className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        size="md"
        showClose
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Edit Role</h2>
            <p className="text-xs font-medium text-slate-500">
              Modify role details and data scope.
            </p>
          </div>
        }
      >
        <form onSubmit={handleSubmitEditRole} className="pt-2">
          {editRoleIsSystem && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              System roles have restricted edit capabilities. Data scope is locked to <strong>All employees</strong>.
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editRoleName}
                onChange={(e) => setEditRoleName(e.target.value)}
                placeholder="Enter role name"
                required
                disabled={saving || editRoleIsSystem}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                Description
              </label>
              <textarea
                value={editRoleDescription}
                onChange={(e) => setEditRoleDescription(e.target.value)}
                placeholder="Enter description (optional)"
                disabled={saving || editRoleIsSystem}
                rows="3"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800">
                Data Scope
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                {DATA_SCOPES.map((opt) => {
                  const Icon = SCOPE_ICONS[opt.icon] || HiUser
                  const isActive = editRoleScope === opt.value
                  const disabled = (editRoleIsSystem && opt.value !== 'ALL') || saving

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => setEditRoleScope(opt.value)}
                      className={`relative flex flex-col rounded-lg border-2 p-3 text-left transition-all ${
                        isActive
                          ? 'border-[#0F766E] bg-emerald-50/50 ring-2 ring-[#0F766E]/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      {isActive && (
                        <HiCheckBadge className="absolute right-2 top-2 h-4 w-4 text-[#0F766E]" />
                      )}
                      <Icon className={`mb-1.5 h-5 w-5 ${isActive ? 'text-[#0F766E]' : 'text-slate-400'}`} />
                      <span className="text-sm font-bold text-slate-900">{opt.label}</span>
                      <span className="mt-0.5 text-[10px] leading-relaxed text-slate-500">{opt.description}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowEditForm(false)}
              className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || editRoleName.trim().length < 2 || editRoleIsSystem}
              className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}