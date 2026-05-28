import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  HiArrowDown,
  HiArrowUp,
  HiArrowsUpDown,
  HiBuildingOffice2,
  HiFolderPlus,
  HiPlus,
  HiTrash,
} from 'react-icons/hi2'
import { useAuth } from '../../../context/AuthContext.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import {
  getExitWorkflowSettings,
  listExitWorkflowOrganizations,
  updateExitWorkflowSettings,
} from '../../../services/exitService.js'

const DEPARTMENT_OPTIONS = [
  { value: 'Manager', label: 'Manager' },
  { value: 'IT', label: 'IT' },
  { value: 'Finance', label: 'Finance' },
  { value: 'HR', label: 'HR' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Legal', label: 'Legal' },
]

function createStep(order) {
  return {
    id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    stepName: '',
    department: '',
    order,
    isParallel: false,
  }
}

export default function ExitWorkflowSettings({ embedded = false }) {
  const { user } = useAuth()
  const userOrganizationId = useMemo(
    () =>
      String(
        user?.tenant_id ||
          user?.tenantId ||
          user?.organizationId ||
          user?.email ||
          'default-org',
      ),
    [user],
  )

  const [organizationId, setOrganizationId] = useState(userOrganizationId)
  const [organizationOptions, setOrganizationOptions] = useState([])
  const [newOrganizationId, setNewOrganizationId] = useState('')
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadOrganizations = async () => {
    try {
      const res = await listExitWorkflowOrganizations({ organizationId: userOrganizationId })
      const options = (res?.organizations || []).map((org) => ({ value: org, label: org }))
      setOrganizationOptions(options)
    } catch {
      setOrganizationOptions([{ value: userOrganizationId, label: userOrganizationId }])
    }
  }

  const loadSettings = async () => {
    setLoading(true)
    try {
      const data = await getExitWorkflowSettings({ organizationId })
      setSteps(Array.isArray(data?.steps) ? data.steps : [])
    } catch {
      toast.error('Failed to load exit workflow settings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrganizations()
  }, [userOrganizationId])

  useEffect(() => {
    loadSettings()
  }, [organizationId])

  const reorder = (list) =>
    list.map((step, idx) => ({
      ...step,
      order: idx + 1,
    }))

  const handleAdd = () => {
    setSteps((prev) => reorder([...prev, createStep(prev.length + 1)]))
  }

  const handleRemove = (id) => {
    setSteps((prev) => reorder(prev.filter((s) => s.id !== id)))
  }

  const handleChange = (id, key, value) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, [key]: value } : step)),
    )
  }

  const moveStep = (index, direction) => {
    setSteps((prev) => {
      const target = index + direction
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return reorder(next)
    })
  }

  const validate = () => {
    for (const step of steps) {
      if (!String(step.stepName || '').trim()) return 'Step name is required for all rows.'
      if (!String(step.department || '').trim()) return 'Department is required for all rows.'
    }
    return null
  }

  const handleSave = async () => {
    const error = validate()
    if (error) {
      toast.error(error)
      return
    }

    setSaving(true)
    try {
      const res = await updateExitWorkflowSettings({ organizationId, steps })
      setSteps(Array.isArray(res?.steps) ? res.steps : steps)
      toast.success('Exit workflow updated.')
    } catch {
      toast.error('Failed to update exit workflow.')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateOrganizationScope = () => {
    const next = String(newOrganizationId || '').trim()
    if (!next) {
      toast.error('Please enter an organization key.')
      return
    }
    setOrganizationOptions((prev) => {
      const exists = prev.some((opt) => opt.value === next)
      return exists ? prev : [...prev, { value: next, label: next }]
    })
    setOrganizationId(next)
    setNewOrganizationId('')
    toast.success(`Switched to organization: ${next}`)
  }

  return (
    <div className="space-y-5 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          {!embedded ? (
            <>
              <h1 className="text-xl font-semibold text-slate-900">Exit Workflow Settings</h1>
              <p className="mt-1 text-sm text-slate-500">Configure department-wise clearance flow per organization.</p>
            </>
          ) : (
            <p className="text-sm text-slate-500">Configure dynamic offboarding flow per organization (tenant).</p>
          )}
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
            <HiBuildingOffice2 className="h-3.5 w-3.5" />
            Org key: <span className="font-semibold text-slate-700">{organizationId}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            label="Add Step"
            variant="outline"
            size="sm"
            icon={HiPlus}
            onClick={handleAdd}
          />
          <Button
            label="Save Workflow"
            variant="primary"
            size="sm"
            loading={saving}
            onClick={handleSave}
          />
        </div>
      </div>

      <div className="rounded-none border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Organization Workflow Scope</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            label="Active Organization"
            type="select"
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
            options={organizationOptions.length ? organizationOptions : [{ value: organizationId, label: organizationId }]}
          />
          <Input
            label="Create / switch organization scope"
            value={newOrganizationId}
            onChange={(event) => setNewOrganizationId(event.target.value)}
            placeholder="e.g. hris_acme_ltd"
            helpText="Each organization has its own separate exit workflow."
          />
          <div className="flex items-end">
            <Button
              label="Use Organization"
              variant="secondary"
              size="sm"
              icon={HiFolderPlus}
              onClick={handleCreateOrganizationScope}
              className="h-10 w-full"
            />
          </div>
        </div>
      </div>

      <div className="rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Clearance Steps</h2>
        </div>

        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-14 animate-pulse rounded-none bg-slate-100" />
            ))}
          </div>
        ) : steps.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">No steps configured yet.</p>
            <button
              type="button"
              onClick={handleAdd}
              className="mt-3 inline-flex h-8 items-center rounded-none bg-[#0F766E] px-3 text-xs font-semibold text-white hover:bg-[#0c6b64]"
            >
              Add your first step
            </button>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {steps.map((step, index) => (
              <div key={step.id} className="rounded-none border border-slate-200 bg-slate-50/50 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge label={`Step ${step.order}`} color="teal" />
                    <Badge
                      label={step.isParallel ? 'Parallel' : 'Sequential'}
                      color={step.isParallel ? 'blue' : 'gray'}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveStep(index, -1)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                      aria-label="Move step up"
                    >
                      <HiArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(index, 1)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                      aria-label="Move step down"
                    >
                      <HiArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(step.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-100 text-red-600 hover:bg-red-200"
                      aria-label="Delete step"
                    >
                      <HiTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <Input
                    label="Step Name"
                    value={step.stepName}
                    onChange={(event) =>
                      handleChange(step.id, 'stepName', event.target.value)
                    }
                    placeholder="e.g. IT Clearance"
                  />
                  <Input
                    label="Assigned Department"
                    type="select"
                    value={step.department}
                    onChange={(event) =>
                      handleChange(step.id, 'department', event.target.value)
                    }
                    placeholder="Select department"
                    options={DEPARTMENT_OPTIONS}
                  />
                  <div className="flex items-end">
                    <label className="inline-flex h-10 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3">
                      <span className="inline-flex items-center gap-1 text-sm text-slate-700">
                        <HiArrowsUpDown className="h-4 w-4 text-slate-500" />
                        Run in parallel
                      </span>
                      <input
                        type="checkbox"
                        checked={step.isParallel}
                        onChange={(event) =>
                          handleChange(step.id, 'isParallel', event.target.checked)
                        }
                        className="h-4 w-4 accent-[#0F766E]"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
