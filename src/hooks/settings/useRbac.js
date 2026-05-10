import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { adminSettingsService } from '../../services/adminSettingsService.js'

export default function useRbac() {
  const [roles, setRoles] = useState([])
  const [availablePermissions, setAvailablePermissions] = useState([])
  const [selectedRoleId, setSelectedRoleId] = useState(null)
  const selectedRoleIdRef = useRef(selectedRoleId)
  const [currentPermissionIds, setCurrentPermissionIds] = useState([])
  const originalPermissionIds = useRef([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [creating, setCreating] = useState(false)

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || null

  useEffect(() => {
    selectedRoleIdRef.current = selectedRoleId
  }, [selectedRoleId])

  const isDirty =
    JSON.stringify([...currentPermissionIds].sort()) !==
    JSON.stringify([...originalPermissionIds.current].sort())

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

      const nextIds = nextRole ? (nextRole.permissions || []).map((p) => p.id) : []
      const nextSelId = nextRole ? nextRole.id : null
      selectedRoleIdRef.current = nextSelId
      setSelectedRoleId(nextSelId)
      setCurrentPermissionIds(nextIds)
      originalPermissionIds.current = nextIds
    } catch {
      toast.error('Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial mount load only per spec
  }, [])

  const selectRole = (role) => {
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Discard and switch role?',
      )
      if (!confirmed) return
    }
    setSelectedRoleId(role.id)
    selectedRoleIdRef.current = role.id
    const ids = (role.permissions || []).map((p) => p.id)
    setCurrentPermissionIds(ids)
    originalPermissionIds.current = ids
  }

  const togglePermission = (permissionId) => {
    setCurrentPermissionIds((prev) => {
      const removing = prev.includes(permissionId)
      if (removing) {
        const perm =
          availablePermissions.find((p) => p.id === permissionId) ||
          (selectedRole?.permissions || []).find((p) => p.id === permissionId)
        if (selectedRole?.is_system && perm?.key === 'dashboard') {
          return prev
        }
        return prev.filter((id) => id !== permissionId)
      }
      return [...prev, permissionId]
    })
  }

  const isPermissionEnabled = (permissionId) =>
    currentPermissionIds.includes(permissionId)

  const isPermissionAvailable = (permission) =>
    availablePermissions.some((p) => p.id === permission.id)

  const saveRolePermissions = async () => {
    try {
      setSaving(true)
      await adminSettingsService.updateRolePermissions(
        selectedRoleId,
        currentPermissionIds,
      )
      originalPermissionIds.current = currentPermissionIds
      await fetchAll()
      toast.success('Permissions saved successfully')
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.data?.message || err?.message
      toast.error(msg || 'Failed to save permissions')
    } finally {
      setSaving(false)
    }
  }

  const discardChanges = () => {
    setCurrentPermissionIds([...originalPermissionIds.current])
  }

  const createRole = async ({ name, description }) => {
    try {
      setCreating(true)
      const res = await adminSettingsService.createRole({ name, description })
      await fetchAll()
      const newRole = res.data.data
      if (newRole) {
        setSelectedRoleId(newRole.id)
        selectedRoleIdRef.current = newRole.id
        setCurrentPermissionIds([])
        originalPermissionIds.current = []
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

  return {
    roles,
    availablePermissions,
    selectedRoleId,
    selectedRole,
    currentPermissionIds,
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
    deleteRole: deleteRoleById,
  }
}
