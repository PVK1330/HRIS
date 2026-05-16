import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import {
  HiArrowPath,
  HiBuildingOffice2,
  HiCheck,
  HiGlobeAlt,
  HiMagnifyingGlass,
  HiShieldCheck,
  HiTrash,
  HiUser,
  HiUserGroup,
} from 'react-icons/hi2'
import { TextInput } from './components/ui'
import useRbac, { useGroupedPermissions } from '../../../hooks/settings/useRbac'
import { DATA_SCOPES, scopeShortLabel } from '../../../constants/dataScopes'

const SCOPE_ICONS = {
  user: HiUser,
  team: HiUserGroup,
  building: HiBuildingOffice2,
  globe: HiGlobeAlt,
}

export default function RolesPermissions() {
  const {
    roles,
    availablePermissions,
    selectedRole,
    selectedRoleId,
    loading,
    saving,
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
    deleteRole,
  } = useRbac()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDescription, setNewRoleDescription] = useState('')
  const [newRoleScope, setNewRoleScope] = useState('SELF')
  const [permSearch, setPermSearch] = useState('')

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
    const q = permSearch.trim().toLowerCase()
    if (!q) return gridPermissions
    return gridPermissions.filter((p) => {
      const label = (p.name || p.label || p.key || '').toLowerCase()
      return label.includes(q) || String(p.key || '').toLowerCase().includes(q)
    })
  }, [gridPermissions, permSearch])

  const groupedPermissions = useGroupedPermissions(filteredPermissions)

  const hasLockedPermissions = gridPermissions.some(
    (p) => !isPermissionAvailable(p),
  )

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

  if (loading && roles.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <HiArrowPath className="h-8 w-8 animate-spin text-[#0F766E]" />
        <span className="ml-3 text-sm font-medium text-slate-500">Loading roles…</span>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in font-sans text-slate-900 duration-300">
      <header className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0F766E]/10 text-[#0F766E]">
            <HiShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Roles & permissions
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Control who can open each module and which employee records they can see.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!isDirty || saving}
            onClick={() => {
              if (window.confirm('Discard unsaved changes?')) discardChanges()
            }}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="button"
            disabled={!isDirty || saving || selectedRoleId == null}
            onClick={() => saveRolePermissions()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F766E] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0c6b64] disabled:opacity-40"
          >
            {saving ? (
              <>
                <HiArrowPath className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-72">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Roles
              </p>
            </div>
            <div className="max-h-[420px] overflow-y-auto p-2 custom-scrollbar">
              {roles.map((role) => {
                const selected = selectedRoleId === role.id
                const count = (role.permissions || []).length
                const scope = role.data_scope || role.dataScope || 'SELF'
                return (
                  <div
                    key={role.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectRole(role)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        selectRole(role)
                      }
                    }}
                    className={`mb-1 flex w-full cursor-pointer flex-col rounded-lg border px-3 py-2.5 text-left transition-all ${
                      selected
                        ? 'border-[#0F766E] bg-emerald-50/60 ring-1 ring-[#0F766E]/30'
                        : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-sm font-semibold ${selected ? 'text-[#0F766E]' : 'text-slate-800'}`}
                      >
                        {role.name}
                      </span>
                      {!role.is_system && (
                        <button
                          type="button"
                          title="Delete role"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteRole(role.id)
                          }}
                          className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          disabled={deleting}
                        >
                          <HiTrash className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                        {scopeShortLabel(scope)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {count} module{count === 1 ? '' : 's'}
                      </span>
                      {role.is_system && (
                        <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                          System
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-slate-100 p-3">
              {showCreateForm ? (
                <form
                  onSubmit={handleSubmitNewRole}
                  className="space-y-3 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3"
                >
                  <p className="text-xs font-semibold text-[#0F766E]">New role</p>
                  <TextInput
                    placeholder="Role name"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    disabled={creating}
                    className="max-w-none text-sm"
                  />
                  <TextInput
                    type="textarea"
                    placeholder="Description (optional)"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    disabled={creating}
                    className="max-w-none text-sm"
                    rows={2}
                  />
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Default data access
                    </label>
                    <select
                      value={newRoleScope}
                      onChange={(e) => setNewRoleScope(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      disabled={creating}
                    >
                      {DATA_SCOPES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600"
                      disabled={creating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating || newRoleName.trim().length < 2}
                      className="flex-1 rounded-lg bg-[#0F766E] py-2 text-xs font-semibold text-white disabled:opacity-40"
                    >
                      {creating ? 'Creating…' : 'Create'}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="w-full rounded-lg border-2 border-dashed border-slate-200 py-2.5 text-sm font-semibold text-slate-500 hover:border-[#0F766E] hover:text-[#0F766E]"
                >
                  + Add role
                </button>
              )}
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Assign roles to employees under{' '}
            <Link to="/admin/employee-directory" className="font-semibold text-[#0F766E] hover:underline">
              Employee directory
            </Link>
            . Data access follows the role — not set per employee.
          </p>
        </aside>

        <main className="min-w-0 flex-1">
          {!selectedRole ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400">
              <HiShieldCheck className="mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm font-medium">Select a role to configure</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedRole.name}</h2>
                    {selectedRole.description && (
                      <p className="mt-1 text-sm text-slate-500">{selectedRole.description}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {scopeDirty && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-800">
                        Scope changed
                      </span>
                    )}
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                      {enabledCount} modules enabled
                    </span>
                  </div>
                </div>
              </div>

              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
                  <h3 className="text-sm font-bold text-slate-900">Data access scope</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Limits which employee records this role can view in directory, profiles, visa, documents, and related lists.
                  </p>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  {DATA_SCOPES.map((opt) => {
                    const Icon = SCOPE_ICONS[opt.icon] || HiUser
                    const active = currentScope === opt.value
                    const disabled = scopeLocked && opt.value !== 'ALL'
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={scopeLocked ? opt.value !== 'ALL' : false}
                        onClick={() => setScope(opt.value)}
                        className={`relative flex flex-col rounded-xl border-2 p-4 text-left transition-all ${
                          active || (scopeLocked && opt.value === 'ALL')
                            ? 'border-[#0F766E] bg-emerald-50/50 ring-2 ring-[#0F766E]/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        {(active || (scopeLocked && opt.value === 'ALL')) && (
                          <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#0F766E] text-white">
                            <HiCheck className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <Icon
                          className={`mb-2 h-6 w-6 ${active ? 'text-[#0F766E]' : 'text-slate-400'}`}
                        />
                        <span className="text-sm font-bold text-slate-900">{opt.label}</span>
                        <span className="mt-1 text-xs leading-relaxed text-slate-500">
                          {opt.description}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {scopeLocked && (
                  <p className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-600">
                    Organization Admin is locked to <strong>All employees</strong> for full tenant access.
                  </p>
                )}
              </section>

              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Module permissions</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Toggle which menus and API actions this role can use.
                    </p>
                  </div>
                  <div className="relative w-full sm:max-w-xs">
                    <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      placeholder="Search permissions…"
                      value={permSearch}
                      onChange={(e) => setPermSearch(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
                    />
                  </div>
                </div>

                {hasLockedPermissions && (
                  <div className="mx-4 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                    Some modules are disabled on your subscription plan. Upgrade features in superadmin to enable them.
                  </div>
                )}

                <div className="divide-y divide-slate-100">
                  {groupedPermissions.length === 0 ? (
                    <p className="p-8 text-center text-sm text-slate-400">
                      No permissions match your search.
                    </p>
                  ) : (
                    groupedPermissions.map(([groupName, perms]) => (
                      <div key={groupName} className="p-4">
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                          {groupName}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {perms.map((permission) => {
                            const available = isPermissionAvailable(permission)
                            const locked = !available
                            const dashGuard =
                              selectedRole?.is_system && permission.key === 'dashboard'
                            const enabled = isPermissionEnabled(permission.id)
                            const label =
                              permission.name ||
                              permission.label ||
                              permission.key ||
                              'Permission'

                            return (
                              <label
                                key={permission.id}
                                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                                  enabled
                                    ? 'border-emerald-200 bg-emerald-50/40'
                                    : 'border-slate-100 bg-white hover:bg-slate-50'
                                } ${locked ? 'cursor-not-allowed opacity-60' : ''}`}
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-800">
                                    {label}
                                  </p>
                                  {permission.key && (
                                    <p className="truncate font-mono text-[10px] text-slate-400">
                                      {permission.key}
                                    </p>
                                  )}
                                </div>
                                <input
                                  type="checkbox"
                                  checked={enabled}
                                  disabled={locked || (dashGuard && enabled)}
                                  onChange={() => {
                                    if (!locked) togglePermission(permission.id)
                                  }}
                                  className="h-4 w-4 shrink-0 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                                />
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {!selectedRole.is_system && (
                <section className="rounded-xl border border-red-100 bg-red-50/50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-red-800">Delete role</h4>
                      <p className="mt-1 text-xs text-red-700/90">
                        Removes this role and its permission assignments. Employees using this role must be reassigned first.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteRole(selectedRole.id)}
                      disabled={deleting}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40"
                    >
                      {deleting ? (
                        <HiArrowPath className="h-4 w-4 animate-spin" />
                      ) : (
                        <HiTrash className="h-4 w-4" />
                      )}
                      Delete role
                    </button>
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
