import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { HiArrowPath, HiTrash } from 'react-icons/hi2'
import {
  FieldRow,
  SectionCard,
  Toggle,
  Badge,
  TextInput,
} from './components/ui'
import useRbac from '../../../hooks/settings/useRbac'

export default function RolesPermissions() {
  const {
    roles,
    availablePermissions,
    selectedRoleId,
    selectedRole,
    loading,
    saving,
    deleting,
    creating,
    isDirty,
    selectRole,
    togglePermission,
    isPermissionEnabled,
    isPermissionAvailable,
    saveRolePermissions,
    discardChanges,
    createRole,
    deleteRole,
  } = useRbac()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDescription, setNewRoleDescription] = useState('')

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

  const hasLockedPermissions = gridPermissions.some(
    (p) => !isPermissionAvailable(p),
  )

  async function handleSubmitNewRole(e) {
    e.preventDefault()
    const ok = await createRole({
      name: newRoleName.trim(),
      description: newRoleDescription.trim(),
    })
    if (ok) {
      setNewRoleName('')
      setNewRoleDescription('')
      setShowCreateForm(false)
    }
  }

  if (loading && roles.length === 0) {
    return (
      <div className="rounded-none border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm font-bold uppercase tracking-widest">
        Initializing Authorization Subsystem…
      </div>
    )
  }

  return (
    <div className="font-sans text-slate-900 animate-in fade-in duration-500">
      <header className="flex shrink-0 flex-col gap-4 border-b border-slate-200 bg-white px-6 py-6 sm:flex-row sm:items-center sm:justify-between rounded-none">
        <div className="flex items-center gap-4">
           <div className="h-10 w-1 bg-[#0F766E]" />
           <div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Roles & Governance
              </h1>
              <p className="mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Access control and module authorization
              </p>
           </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!isDirty || saving}
            onClick={() => {
              if (
                window.confirm('Discard unsaved permission changes for this role?')
              )
                discardChanges()
            }}
            className="h-10 rounded-none border border-slate-200 bg-white px-6 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="button"
            disabled={!isDirty || saving || selectedRoleId == null}
            onClick={() => saveRolePermissions()}
            className="flex h-10 items-center gap-2 rounded-none bg-[#0F766E] px-6 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#0c6b64] disabled:cursor-not-allowed disabled:opacity-40 shadow-md"
          >
            {saving ? (
              <>
                <HiArrowPath className="h-4 w-4 shrink-0 animate-spin" />
                Syncing…
              </>
            ) : (
              'Save Configuration'
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Left Sidebar: Roles Selection */}
        <div className="w-full lg:w-64 shrink-0 space-y-1 rounded-none border border-slate-200 bg-white px-2 py-4 shadow-sm h-fit">
          <div className="px-3 mb-4">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authority Roles</span>
          </div>
          
          <div className="space-y-1">
            {roles.map((role) => {
              const selected = selectedRoleId === role.id
              const count =
                typeof role.permissions?.length === 'number'
                  ? role.permissions.length
                  : (role.permissions || []).length
              return (
                <div
                  key={role.id}
                  className="px-1"
                >
                  <button
                    type="button"
                    onClick={() => selectRole(role)}
                    className={`group relative flex w-full flex-col rounded-none px-3 py-2.5 text-left transition-all border ${
                      selected
                        ? 'border-[#0F766E] bg-emerald-50/50 ring-1 ring-[#0F766E]'
                        : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                       <span className={`truncate text-sm font-bold ${selected ? 'text-[#0F766E]' : 'text-slate-800'}`}>{role.name}</span>
                       {!role.is_system && (
                          <button
                            type="button"
                            title="Delete role"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteRole(role.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-all"
                            disabled={deleting}
                          >
                            <HiTrash className="h-3.5 w-3.5" />
                          </button>
                       )}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                       <span className={`text-[9px] font-bold uppercase tracking-tight ${selected ? 'text-emerald-600/80' : 'text-slate-400'}`}>
                          {count} Active Modules
                       </span>
                       {role.is_system && (
                          <span className="text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-1.5 py-0.5 border border-slate-200">System</span>
                       )}
                    </div>
                  </button>
                </div>
              )
            })}
          </div>

          <div className="px-1 mt-6 pt-4 border-t border-slate-100">
            {showCreateForm ? (
              <form
                onSubmit={handleSubmitNewRole}
                className="rounded-none border border-emerald-100 bg-emerald-50/20 p-3 animate-in slide-in-from-top-2 duration-300"
              >
                <p className="mb-2 text-[10px] font-black text-[#0F766E] uppercase tracking-widest">
                  Initialize New Role
                </p>
                <TextInput
                  placeholder="e.g. Finance Auditor"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  disabled={creating}
                  className="mb-2 max-w-none h-9 text-xs font-bold"
                />
                <TextInput
                  type="textarea"
                  placeholder="Objective (optional)"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  disabled={creating}
                  className="mb-3 max-w-none text-xs font-medium"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewRoleName('')
                      setNewRoleDescription('')
                    }}
                    className="flex-1 rounded-none border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || newRoleName.trim().length < 2}
                    className="flex-1 items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] disabled:opacity-40"
                  >
                    {creating ? '...' : 'Create'}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="w-full rounded-none border-2 border-dashed border-slate-200 px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:border-[#0F766E] hover:text-[#0F766E] hover:bg-slate-50"
              >
                + Register New Role
              </button>
            )}
          </div>
        </div>

        {/* Right Content: Permissions Grid */}
        <div className="min-w-0 flex-1">
          {!selectedRole ? (
            <div className="rounded-none border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center h-[500px] text-slate-400">
               <div className="h-12 w-12 rounded-none border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                  <span className="text-2xl font-black">!</span>
               </div>
               <p className="text-[11px] font-black uppercase tracking-[0.2em]">Select an authority role to configure permissions</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                   <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                     AUTHORIZED MODULES: <span className="text-[#0F766E]">{selectedRole.name}</span>
                   </h2>
                </div>
                {selectedRole.is_system && (
                   <span className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1">Immutable System Role</span>
                )}
              </div>

              {hasLockedPermissions && (
                <div className="flex items-center gap-3 rounded-none border border-amber-200 bg-amber-50 p-4">
                  <div className="h-8 w-1 bg-amber-400 shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-wide text-amber-900">
                    Infrastructure Limitation: Some modules require a plan upgrade for activation.
                  </span>
                </div>
              )}

              <div className="rounded-none border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Matrix</span>
                </div>
                
                <div className="divide-y divide-slate-50">
                  {gridPermissions.length === 0 ? (
                    <div className="p-10 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                      No authorization parameters available for this role.
                    </div>
                  ) : (
                    gridPermissions.map((permission) => {
                      const available = isPermissionAvailable(permission)
                      const locked = !available
                      const dashGuard =
                        selectedRole?.is_system && permission.key === 'dashboard'
                      const label =
                        permission.name ||
                        permission.label ||
                        permission.key ||
                        'System Capability'

                      const hint = locked
                        ? 'Inactive in current infrastructure plan'
                        : undefined

                      return (
                        <div key={permission.id} className="px-5 transition-colors hover:bg-slate-50/30">
                          <FieldRow label={label} hint={hint}>
                            <div className="flex h-12 items-center">
                              <span
                                title={
                                  locked
                                    ? 'Subscription requirement'
                                    : dashGuard &&
                                        isPermissionEnabled(permission.id)
                                      ? 'Essential system module'
                                      : undefined
                                }
                              >
                                <Toggle
                                  checked={isPermissionEnabled(permission.id)}
                                  disabled={
                                    locked ||
                                    (dashGuard && isPermissionEnabled(permission.id))
                                  }
                                  onChange={() => {
                                    if (locked) return
                                    togglePermission(permission.id)
                                  }}
                                />
                              </span>
                            </div>
                          </FieldRow>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {selectedRole && !selectedRole.is_system && (
                <div className="mt-8 border-t border-slate-100 pt-8 pb-4">
                  <div className="rounded-none border border-red-100 bg-red-50/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-center sm:text-left">
                       <h4 className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1">Authorization Purge</h4>
                       <p className="text-xs text-red-600/80 font-medium">Permanently remove this role and all associated access tokens from the tenant ecosystem.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteRole(selectedRole.id)}
                      disabled={deleting}
                      className="shrink-0 inline-flex items-center gap-3 rounded-none border border-red-300 bg-white px-6 py-3 text-[10px] font-black uppercase tracking-widest text-red-600 transition-all hover:bg-red-50 disabled:opacity-40 shadow-xs"
                    >
                      {deleting ? (
                        <HiArrowPath className="h-4 w-4 animate-spin" />
                      ) : (
                        <HiTrash className="h-4 w-4" />
                      )}
                      Purge Role Instance
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

