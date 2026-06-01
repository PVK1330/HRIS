import { useState, useEffect, useRef, useMemo } from 'react'
import toast from 'react-hot-toast'
import { adminSettingsService } from '../../services/adminSettingsService.js'
import { useAuth } from '../../context/AuthContext.jsx'

function roleScope(role) {
  const s = role?.data_scope || role?.dataScope || 'SELF'
  return String(s).toUpperCase()
}

function isOrgAdminRole(role) {
  return Boolean(role?.is_system && String(role?.name || '').trim() === 'Organization Admin')
}

export default function useRbac() {
  const { user, refreshAccessProfile } = useAuth()
  const [roles, setRoles] = useState([])
  const [availablePermissions, setAvailablePermissions] = useState([])
  const [selectedRoleId, setSelectedRoleId] = useState(null)
  const selectedRoleIdRef = useRef(selectedRoleId)
  const [currentPermissionIds, setCurrentPermissionIds] = useState([])
  const originalPermissionIds = useRef([])
  const [currentScope, setCurrentScope] = useState('SELF')
  const originalScope = useRef('SELF')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPermissionId, setSavingPermissionId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [creating, setCreating] = useState(false)

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || null
  const scopeLocked = isOrgAdminRole(selectedRole)

  useEffect(() => {
    selectedRoleIdRef.current = selectedRoleId
  }, [selectedRoleId])

  const permissionsDirty =
    JSON.stringify([...currentPermissionIds].sort()) !==
    JSON.stringify([...originalPermissionIds.current].sort())

  const scopeDirty = currentScope !== originalScope.current
  const isDirty = permissionsDirty || scopeDirty

  const applyRoleSelection = (role) => {
    if (!role) {
      setSelectedRoleId(null)
      selectedRoleIdRef.current = null
      setCurrentPermissionIds([])
      originalPermissionIds.current = []
      setCurrentScope('SELF')
      originalScope.current = 'SELF'
      return
    }
    const ids = (role.permissions || []).map((p) => p.id)
    const scope = roleScope(role)
    setSelectedRoleId(role.id)
    selectedRoleIdRef.current = role.id
    setCurrentPermissionIds(ids)
    originalPermissionIds.current = ids
    setCurrentScope(scope)
    originalScope.current = scope
  }

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [rolesRes, permsRes] = await Promise.all([
        adminSettingsService.getAllRoles(),
        adminSettingsService.getAvailablePermissions(),
      ])
      const fetchedRoles = rolesRes.data.data || []
      setRoles(fetchedRoles)
      setAvailablePermissions(permsRes.data.data || [])

      const sid = selectedRoleIdRef.current
      const stillExists = sid != null && fetchedRoles.some((r) => r.id === sid)
      let nextRole = stillExists ? fetchedRoles.find((r) => r.id === sid) : null
      if (!nextRole && fetchedRoles.length > 0) {
        nextRole = fetchedRoles[0]
      }
      applyRoleSelection(nextRole)
    } catch {
      toast.error('Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial mount
  }, [])

  const selectRole = (role) => {
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Discard and switch role?',
      )
      if (!confirmed) return
    }
    applyRoleSelection(role)
  }

  const setScope = (scope) => {
    if (scopeLocked) return
    setCurrentScope(String(scope).toUpperCase())
  }

  const computeNextPermissionIds = (prev, permissionId, role = selectedRole) => {
    const removing = prev.includes(permissionId)
    if (removing) {
      const perm =
        availablePermissions.find((p) => p.id === permissionId) ||
        (role?.permissions || []).find((p) => p.id === permissionId)
      if (role?.is_system && perm?.key === 'dashboard') {
        return prev
      }
      return prev.filter((id) => id !== permissionId)
    }
    return [...prev, permissionId]
  }

  const syncRolesAfterPermissionSave = (roleId, permissionIds) => {
    const idSet = new Set(permissionIds)
    const permById = new Map()
    for (const p of availablePermissions) {
      if (p?.id != null) permById.set(p.id, p)
    }
    for (const p of selectedRole?.permissions || []) {
      if (p?.id != null && !permById.has(p.id)) permById.set(p.id, p)
    }
    const nextPerms = [...permById.values()].filter((p) => idSet.has(p.id))
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, permissions: nextPerms } : r)),
    )
  }

  const afterPermissionsPersisted = async (role) => {
    if (user?.role === 'admin' && isOrgAdminRole(role)) {
      await refreshAccessProfile()
    }
  }

  const togglePermission = async (permissionId) => {
    if (selectedRoleId == null || savingPermissionId != null) return false

    const role = roles.find((r) => r.id === selectedRoleId) || selectedRole
    const prev = currentPermissionIds
    const next = computeNextPermissionIds(prev, permissionId, role)
    if (
      next.length === prev.length &&
      next.every((id) => prev.includes(id))
    ) {
      return false
    }

    setCurrentPermissionIds(next)
    setSavingPermissionId(permissionId)
    try {
      await adminSettingsService.updateRolePermissions(selectedRoleId, next)
      originalPermissionIds.current = [...next]
      syncRolesAfterPermissionSave(selectedRoleId, next)
      await afterPermissionsPersisted(role)
      return true
    } catch (err) {
      setCurrentPermissionIds(prev)
      const msg =
        err?.response?.data?.message || err?.data?.message || err?.message
      toast.error(msg || 'Failed to update permission')
      return false
    } finally {
      setSavingPermissionId(null)
    }
  }

  const isPermissionEnabled = (permissionId) =>
    currentPermissionIds.includes(permissionId)

  const isPermissionAvailable = (permission) =>
    availablePermissions.some((p) => p.id === permission.id)

  const saveRolePermissions = async () => {
    if (selectedRoleId == null) return
    try {
      setSaving(true)
      const payloadScope = scopeDirty ? currentScope : undefined
      await adminSettingsService.updateRolePermissions(
        selectedRoleId,
        currentPermissionIds,
        payloadScope,
      )
      originalPermissionIds.current = [...currentPermissionIds]
      if (scopeDirty) {
        originalScope.current = currentScope
      }
      syncRolesAfterPermissionSave(selectedRoleId, currentPermissionIds)
      await fetchAll()
      const savedRole = roles.find((r) => r.id === selectedRoleId) || selectedRole
      if (scopeDirty) {
        if (user?.role === 'admin' && isOrgAdminRole(savedRole)) {
          await refreshAccessProfile()
        }
        toast.success('Data scope saved')
      } else {
        toast.success('Role configuration saved')
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.data?.message || err?.message
      toast.error(msg || 'Failed to save role')
    } finally {
      setSaving(false)
    }
  }

  const discardChanges = () => {
    setCurrentPermissionIds([...originalPermissionIds.current])
    setCurrentScope(originalScope.current)
  }

  const createRole = async ({ name, description, scope = 'SELF' }) => {
    try {
      setCreating(true)
      const res = await adminSettingsService.createRole({
        name,
        description,
        scope,
      })
      await fetchAll()
      const newRole = res.data.data
      if (newRole) {
        applyRoleSelection({
          ...newRole,
          permissions: [],
          data_scope: scope,
        })
      }
      toast.success('Role created')
      return true
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.data?.message || err?.message
      toast.error(msg || 'Failed to create role')
      return false
    } finally {
      setCreating(false)
    }
  }

  const updateRole = async (id, { name, description, scope }) => {
    try {
      setSaving(true)
      await adminSettingsService.updateRole(id, { name, description, scope })
      await fetchAll()
      toast.success('Role updated')
      return true
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.data?.message || err?.message
      toast.error(msg || 'Failed to update role')
      return false
    } finally {
      setSaving(false)
    }
  }

  const deleteRoleById = async (id) => {
    const confirmed = window.confirm('Delete this role? This cannot be undone.')
    if (!confirmed) return
    try {
      setDeleting(true)
      await adminSettingsService.deleteRole(id)
      await fetchAll()
      toast.success('Role deleted')
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.data?.message || err?.message
      toast.error(msg || 'Failed to delete role')
    } finally {
      setDeleting(false)
    }
  }

  const enabledCount = currentPermissionIds.length

  return {
    roles,
    availablePermissions,
    selectedRoleId,
    selectedRole,
    currentPermissionIds,
    currentScope,
    scopeLocked,
    loading,
    saving,
    savingPermissionId,
    deleting,
    creating,
    isDirty,
    permissionsDirty,
    scopeDirty,
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
    deleteRole: deleteRoleById,
  }
}

export function groupPermissions(permissions) {
  const groups = new Map()
  const order = [
    'Core',
    'Employee',
    'Attendance',
    'Leave',
    'Documents',
    'Visa',
    'Performance',
    'Payroll',
    'Organization',
    'Communication',
    'Other',
  ]

  const labelForKey = (key) => {
    const k = String(key || '').toLowerCase()
    if (k === 'dashboard' || k === 'system-settings') return 'Core'
    if (k.startsWith('employee') || k.includes('employee')) return 'Employee'
    if (k.startsWith('attendance') || k.includes('time-tracking')) return 'Attendance'
    if (k.startsWith('leave')) return 'Leave'
    if (k.startsWith('document')) return 'Documents'
    if (k.startsWith('visa')) return 'Visa'
    if (k.startsWith('performance') || k.includes('training')) return 'Performance'
    if (k.startsWith('payroll') || k.includes('billing')) return 'Payroll'
    if (
      k.includes('department') ||
      k.includes('designation') ||
      k === 'policies'
    ) {
      return 'Organization'
    }
    if (k.includes('message') || k.includes('announcement')) return 'Communication'
    if (k.includes('.')) return k.split('.')[0].charAt(0).toUpperCase() + k.split('.')[0].slice(1)
    return 'Other'
  }

  for (const p of permissions) {
    const group = labelForKey(p.key)
    if (!groups.has(group)) groups.set(group, [])
    groups.get(group).push(p)
  }

  const sorted = [...groups.entries()].sort((a, b) => {
    const ia = order.indexOf(a[0])
    const ib = order.indexOf(b[0])
    if (ia === -1 && ib === -1) return a[0].localeCompare(b[0])
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })

  return sorted
}

export function useGroupedPermissions(gridPermissions) {
  return useMemo(() => groupPermissions(gridPermissions), [gridPermissions])
}
