import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  createLeaveType,
  deleteLeaveType,
  getLeaveTypes,
  updateLeaveType,
} from '../../services/adminSettingsService'

function cloneLeave(lt) {
  if (!lt) return {}
  return JSON.parse(JSON.stringify(lt))
}

export function useLeaveSettings(registerToolbar) {
  const [leaveTypes, setLeaveTypes] = useState([])
  const [approverOptions, setApproverOptions] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [formState, setFormState] = useState({})
  const [originalForm, setOriginalForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    const res = await getLeaveTypes()
    const payload = res?.data ?? {}
    const list = payload.leaveTypes ?? []
    const opts = payload.approverOptions ?? []
    setLeaveTypes(list)
    setApproverOptions(opts)
    return list
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getLeaveTypes()
        if (cancelled) return
        const payload = res?.data ?? {}
        const list = payload.leaveTypes ?? []
        const opts = payload.approverOptions ?? []
        setLeaveTypes(list)
        setApproverOptions(opts)
        if (list.length > 0) {
          const first = list[0]
          setSelectedId(first.id)
          const c = cloneLeave(first)
          setFormState(c)
          setOriginalForm(cloneLeave(first))
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Failed to load leave types')
          toast.error(e.message || 'Failed to load leave types')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const selectedType = useMemo(
    () => leaveTypes.find((t) => t.id === selectedId) ?? null,
    [leaveTypes, selectedId],
  )

  const isDirty = useMemo(
    () => JSON.stringify(formState) !== JSON.stringify(originalForm),
    [formState, originalForm],
  )

  const applySelection = useCallback((lt) => {
    if (!lt) return
    setSelectedId(lt.id)
    const c = cloneLeave(lt)
    setFormState(c)
    setOriginalForm(cloneLeave(lt))
  }, [])

  const selectLeaveType = useCallback(
    (lt) => {
      if (!lt) return
      if (isDirty) {
        const ok = window.confirm('Discard unsaved changes?')
        if (!ok) return
      }
      applySelection(lt)
    },
    [applySelection, isDirty],
  )

  const updateField = useCallback((key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }, [])

  const discardChanges = useCallback(() => {
    setFormState(cloneLeave(originalForm))
  }, [originalForm])

  const buildSavePayload = useCallback(() => {
    return {
      name: formState.name,
      paidOrUnpaid: formState.paidOrUnpaid,
      annualEntitlementDays: Number(formState.annualEntitlementDays ?? 0),
      entitlementLabel: formState.entitlementLabel || null,
      accrual: formState.accrual,
      maxCarryForwardDays: Number(formState.maxCarryForwardDays ?? 0),
      lossOfPayRule: formState.lossOfPayRule,
      documentRequired: Boolean(formState.documentRequired),
      autoApproval: Boolean(formState.autoApproval),
      approver: formState.approver,
      isActive: formState.isActive !== false,
    }
  }, [formState])

  const saveLeaveType = useCallback(async () => {
    if (!selectedId) return
    setSaving(true)
    try {
      await updateLeaveType(selectedId, buildSavePayload())
      toast.success('Leave type saved')
      const list = await refresh()
      const updated = list.find((x) => x.id === selectedId)
      if (updated) {
        const c = cloneLeave(updated)
        setFormState(c)
        setOriginalForm(cloneLeave(updated))
      }
    } catch (e) {
      toast.error(e.message || 'Could not save leave type')
    } finally {
      setSaving(false)
    }
  }, [selectedId, buildSavePayload, refresh])

  const addCustomLeaveType = useCallback(
    async (name) => {
      const trimmed = String(name || '').trim()
      if (trimmed.length < 2) {
        toast.error('Name must be at least 2 characters')
        return
      }
      setSaving(true)
      try {
        const res = await createLeaveType({ name: trimmed, paidOrUnpaid: 'Paid' })
        toast.success('Leave type created')
        const created = res?.data?.leaveType ?? res?.data
        const list = await refresh()
        if (created?.id) {
          const match = list.find((x) => x.id === created.id)
          if (match) applySelection(match)
        }
      } catch (e) {
        toast.error(e.message || 'Could not create leave type')
      } finally {
        setSaving(false)
      }
    },
    [applySelection, refresh],
  )

  const deleteSelectedLeaveType = useCallback(async () => {
    const sel = leaveTypes.find((t) => t.id === selectedId)
    if (!sel?.isCustom) {
      toast.error('Default leave types cannot be deleted')
      return
    }
    const ok = window.confirm('Delete this leave type?')
    if (!ok) return
    setSaving(true)
    try {
      await deleteLeaveType(selectedId)
      toast.success('Leave type deleted')
      const list = await refresh()
      if (list.length > 0) {
        applySelection(list[0])
      } else {
        setSelectedId(null)
        setFormState({})
        setOriginalForm({})
      }
    } catch (e) {
      toast.error(e.message || 'Could not delete leave type')
    } finally {
      setSaving(false)
    }
  }, [applySelection, leaveTypes, selectedId, refresh])

  useEffect(() => {
    if (!registerToolbar) return undefined
    registerToolbar({
      dirty: isDirty,
      saving,
      onSave: saveLeaveType,
      onDiscard: discardChanges,
      disableSave: loading || saving || !isDirty || !selectedId,
    })
    return () => registerToolbar(null)
  }, [
    registerToolbar,
    isDirty,
    saving,
    loading,
    selectedId,
    saveLeaveType,
    discardChanges,
  ])

  return {
    leaveTypes,
    approverOptions,
    selectedId,
    formState,
    loading,
    saving,
    error,
    isDirty,
    selectedType,
    selectLeaveType,
    updateField,
    saveLeaveType,
    addCustomLeaveType,
    deleteSelectedLeaveType,
    refresh,
  }
}
