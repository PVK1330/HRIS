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
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Loading roles…
      </div>
    )
  }

  return (
    <div className="font-sans text-gray-900">
      <header className="flex shrink-0 flex-col gap-3 border-b border-gray-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:rounded-t-xl md:border md:border-gray-100 md:bg-white lg:max-w-none">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Roles & Permissions
          </h1>
          <p className="mt-0.5 text-xs text-gray-400">
            Tenant roles and module access
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!isDirty || saving}
            onClick={() => {
              if (
                window.confirm('Discard unsaved permission changes for this role?')
              )
                discardChanges()
            }}
            className="h-8 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="button"
            disabled={!isDirty || saving || selectedRoleId == null}
            onClick={() => saveRolePermissions()}
            className="flex h-8 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? (
              <>
                <HiArrowPath className="h-4 w-4 shrink-0 animate-spin" />
                Saving…
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </header>

      <div className="mt-px flex flex-wrap items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-400 md:border-x md:border-t-0 md:border-gray-100">
        <Link
          className="text-gray-600 transition-colors hover:text-indigo-600"
          to="/admin/settings"
        >
          Settings
        </Link>
        <span>/</span>
        <span className="font-medium text-indigo-600">Roles & Permissions</span>
      </div>

      <div className="flex gap-5 md:border md:border-gray-100 md:border-t-0 md:bg-transparent">
        <div className="w-56 shrink-0 space-y-1 border-r border-gray-100 bg-white px-2 py-4 md:bg-gray-50/50">
          {roles.map((role) => {
            const selected = selectedRoleId === role.id
            const count =
              typeof role.permissions?.length === 'number'
                ? role.permissions.length
                : (role.permissions || []).length
            return (
              <div
                key={role.id}
                className={`flex items-start gap-2 rounded-lg px-2 py-1`}
              >
                <button
                  type="button"
                  onClick={() => selectRole(role)}
                  className={`min-w-0 flex-1 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    selected
                      ? 'bg-[#0f766e] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="block truncate">{role.name}</span>
                  <span
                    className={`mt-0.5 block text-[10px] font-normal opacity-90 ${
                      selected ? 'text-white/90' : 'text-gray-400'
                    }`}
                  >
                    {count} modules
                  </span>
                  {role.is_system ? (
                    <span className="mt-1 inline-block">
                      <Badge label="System" color="gray" />
                    </span>
                  ) : null}
                </button>
                {!role.is_system ? (
                  <button
                    type="button"
                    title="Delete role"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteRole(role.id)
                    }}
                    className="shrink-0 self-center rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                    disabled={deleting}
                  >
                    <HiTrash className="h-4 w-4" aria-hidden />
                  </button>
                ) : null}
              </div>
            )
          })}

          {showCreateForm ? (
            <form
              onSubmit={handleSubmitNewRole}
              className="mt-3 rounded-lg border border-gray-100 bg-white p-3 shadow-sm"
            >
              <p className="mb-2 text-[11px] font-semibold text-gray-500">
                New role
              </p>
              <TextInput
                placeholder="Role name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                disabled={creating}
                className="mb-2 max-w-none"
              />
              <TextInput
                type="textarea"
                placeholder="Description (optional)"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                disabled={creating}
                className="mb-3 max-w-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewRoleName('')
                    setNewRoleDescription('')
                  }}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || newRoleName.trim().length < 2}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
                >
                  {creating ? (
                    <>
                      <HiArrowPath className="h-3.5 w-3.5 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="mt-2 w-full rounded-lg border-2 border-dashed border-gray-200 px-3 py-2 text-left text-sm text-gray-400 transition-colors hover:border-indigo-300"
            >
              + New Role
            </button>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-4 py-4 pr-2 md:py-6">
          {!selectedRole ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              Select a role or create one to configure module permissions.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-sm font-semibold text-gray-800">
                  Modules for{' '}
                  <span className="text-indigo-600">{selectedRole.name}</span>
                </h2>
                {selectedRole.is_system ? (
                  <Badge label="System role" />
                ) : null}
              </div>

              {hasLockedPermissions ? (
                <div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
                  <span className="font-medium">
                    Some modules are not available in your current plan. Upgrade to
                    unlock more.
                  </span>
                </div>
              ) : null}

              <SectionCard title="Tenant modules">
                {gridPermissions.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No permissions loaded for this plan or role yet.
                  </p>
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
                      'Permission'

                    const hint = locked
                      ? 'Not available on your subscription plan.'
                      : undefined

                    return (
                      <FieldRow key={permission.id} label={label} hint={hint}>
                        <span
                          title={
                            locked
                              ? 'Not available in your current plan'
                              : dashGuard &&
                                  isPermissionEnabled(permission.id)
                                ? 'This module must stay enabled for system roles.'
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
                      </FieldRow>
                    )
                  })
                )}
              </SectionCard>

              {selectedRole && !selectedRole.is_system ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => deleteRole(selectedRole.id)}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40"
                  >
                    {deleting ? (
                      <HiArrowPath className="h-4 w-4 animate-spin" />
                    ) : (
                      <HiTrash className="h-4 w-4" />
                    )}
                    Delete role
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
