import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  HiArrowDown,
  HiArrowUp,
  HiArrowsUpDown,
  HiFolderPlus,
  HiPlus,
  HiTrash,
  HiCheckBadge,
} from 'react-icons/hi2'
import { useAuth } from '../../../context/AuthContext.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import {
  listExitWorkflows,
  createExitWorkflow,
  getExitWorkflow,
  updateExitWorkflow,
  publishExitWorkflow,
  cloneExitWorkflow,
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
    id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    step_name: '',
    step_type: 'Approval',
    department: '', // Used in UI for quick assignee mapping
    order,
    is_parallel: false,
    sla_days: 0,
    assignees: []
  }
}

export default function ExitWorkflowSettings({ embedded = false }) {
  const { user } = useAuth()
  
  const [workflows, setWorkflows] = useState([])
  const [activeWorkflowId, setActiveWorkflowId] = useState('')
  const [activeWorkflow, setActiveWorkflow] = useState(null)
  
  const [newWorkflowName, setNewWorkflowName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const loadWorkflows = async () => {
    try {
      const res = await listExitWorkflows()
      setWorkflows(res || [])
      if (res?.length > 0 && !activeWorkflowId) {
        setActiveWorkflowId(String(res[0].id))
      }
    } catch {
      toast.error('Failed to load workflows.')
    }
  }

  const loadActiveWorkflow = async () => {
    if (!activeWorkflowId) return
    setLoading(true)
    try {
      const data = await getExitWorkflow(activeWorkflowId)
      // Map legacy UI properties to new API schema
      const formattedSteps = (data.steps || []).map(step => ({
        ...step,
        order: step.step_order,
        department: step.assignees?.[0]?.value || '' // Simple mapping for MVP UI
      }))
      setActiveWorkflow({ ...data, steps: formattedSteps })
      setDirty(false)
    } catch {
      toast.error('Failed to load workflow details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkflows()
  }, [])

  useEffect(() => {
    if (activeWorkflowId) {
      loadActiveWorkflow()
    }
  }, [activeWorkflowId])

  const reorder = (list) =>
    list.map((step, idx) => ({
      ...step,
      order: idx + 1,
    }))

  const handleAdd = () => {
    if (!activeWorkflow || activeWorkflow.is_published) return
    setActiveWorkflow((prev) => ({
      ...prev,
      steps: reorder([...(prev.steps || []), createStep((prev.steps?.length || 0) + 1)])
    }))
    setDirty(true)
  }

  const handleRemove = (id) => {
    if (!activeWorkflow) return
    setActiveWorkflow((prev) => ({
      ...prev,
      steps: reorder(prev.steps.filter((s) => s.id !== id))
    }))
    setDirty(true)
  }

  const handleChange = (id, key, value) => {
    if (!activeWorkflow) return
    setActiveWorkflow((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => (step.id === id ? { ...step, [key]: value } : step)),
    }))
    setDirty(true)
  }

  const moveStep = (index, direction) => {
    if (!activeWorkflow) return
    setActiveWorkflow((prev) => {
      const target = index + direction
      if (target < 0 || target >= prev.steps.length) return prev
      const next = [...prev.steps]
      ;[next[index], next[target]] = [next[target], next[index]]
      return { ...prev, steps: reorder(next) }
    })
    setDirty(true)
  }

  const validate = () => {
    if (!activeWorkflow) return 'No workflow selected.'
    for (const step of activeWorkflow.steps) {
      if (!String(step.step_name || '').trim()) return 'Step name is required for all rows.'
      if (!String(step.department || '').trim()) return 'Department assignment is required for all rows.'
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
      // Map UI properties back to API schema
      const payload = {
        name: activeWorkflow.name,
        description: activeWorkflow.description,
        is_default: activeWorkflow.is_default,
        steps: activeWorkflow.steps.map(s => ({
          step_name: s.step_name,
          step_type: 'Approval',
          is_parallel: s.is_parallel,
          is_mandatory: true,
          sla_days: s.sla_days || 0,
          assignees: [
            { type: 'Department', value: s.department }
          ]
        }))
      }
      await updateExitWorkflow(activeWorkflow.id, payload)
      toast.success('Workflow saved successfully.')
      setDirty(false)
      loadActiveWorkflow()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update workflow.')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!activeWorkflow) return
    const steps = activeWorkflow.steps ?? []
    if (!steps.length) {
      toast.error('Add at least one step before publishing.')
      return
    }
    if (dirty) {
      toast.error('Save your draft first, then publish.')
      return
    }
    if (!confirm('Publishing will freeze this version. You will not be able to edit steps afterward. Continue?')) return

    setSaving(true)
    try {
      await publishExitWorkflow(activeWorkflow.id)
      toast.success('Workflow published successfully!')
      loadActiveWorkflow()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to publish workflow.')
    } finally {
      setSaving(false)
    }
  }

  const handleCloneWorkflow = async () => {
    if (!activeWorkflow) return
    setSaving(true)
    try {
      const cloned = await cloneExitWorkflow(activeWorkflow.id)
      toast.success('Created a new editable draft from this workflow.')
      await loadWorkflows()
      setActiveWorkflowId(String(cloned.id))
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to duplicate workflow.')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateWorkflow = async () => {
    const name = String(newWorkflowName || '').trim()
    if (!name) {
      toast.error('Please enter a workflow name.')
      return
    }
    setSaving(true)
    try {
      const res = await createExitWorkflow({ name, description: 'New Workflow' })
      toast.success(`Created workflow: ${name}`)
      setNewWorkflowName('')
      await loadWorkflows()
      setActiveWorkflowId(String(res.id))
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create workflow.')
    } finally {
      setSaving(false)
    }
  }

  const workflowOptions = workflows.map(w => ({ value: String(w.id), label: `${w.name} (v${w.version})` }))
  const steps = activeWorkflow?.steps ?? []

  return (
    <div className="space-y-5 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          {!embedded ? (
            <>
              <h1 className="text-xl font-semibold text-slate-900">Exit Workflow Engine</h1>
              <p className="mt-1 text-sm text-slate-500">Configure multi-stage offboarding templates.</p>
            </>
          ) : (
            <p className="text-sm text-slate-500">Configure dynamic offboarding templates.</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeWorkflow && !activeWorkflow.is_published && (
            <>
              {dirty && (
                <span className="text-xs font-medium text-amber-700">Unsaved changes</span>
              )}
              <Button
                label="Add Step"
                variant="outline"
                size="sm"
                icon={HiPlus}
                onClick={handleAdd}
              />
              <Button
                label="Save Draft"
                variant="outline"
                size="sm"
                loading={saving}
                onClick={handleSave}
              />
              <Button
                label="Publish Workflow"
                variant="primary"
                size="sm"
                icon={HiCheckBadge}
                loading={saving}
                onClick={handlePublish}
              />
            </>
          )}
          {activeWorkflow?.is_published && (
            <Button
              label="Duplicate as new draft"
              variant="outline"
              size="sm"
              icon={HiFolderPlus}
              loading={saving}
              onClick={handleCloneWorkflow}
            />
          )}
        </div>
      </div>

      <div className="rounded-none border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Workflow Templates</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            label="Active Workflow"
            type="select"
            value={activeWorkflowId}
            onChange={(event) => setActiveWorkflowId(event.target.value)}
            options={workflowOptions.length ? workflowOptions : [{ value: '', label: 'No workflows available' }]}
          />
          <Input
            label="Create New Workflow"
            value={newWorkflowName}
            onChange={(event) => setNewWorkflowName(event.target.value)}
            placeholder="e.g. Standard Executive Exit"
          />
          <div className="flex items-end">
            <Button
              label="Create Workflow"
              variant="secondary"
              size="sm"
              icon={HiFolderPlus}
              onClick={handleCreateWorkflow}
              className="h-10 w-full"
              loading={saving}
            />
          </div>
        </div>
      </div>

      {activeWorkflow && (
        <div className="rounded-none border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Steps for "{activeWorkflow.name}"
            </h2>
            <div className="flex items-center gap-2">
              {activeWorkflow.is_published ? (
                <Badge label="Published" color="green" />
              ) : (
                <Badge label="Draft" color="gray" />
              )}
              {activeWorkflow.is_default && <Badge label="Default Workflow" color="blue" />}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-14 animate-pulse rounded-none bg-slate-100" />
              ))}
            </div>
          ) : !steps.length ? (
            <div className="p-8 text-center">
              {activeWorkflow.is_published ? (
                <>
                  <p className="text-sm font-medium text-slate-700">No steps were saved before this workflow was published.</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Published workflows cannot be edited. Duplicate it as a new draft, add steps, save, then publish again.
                  </p>
                  <div className="mt-4">
                    <Button
                      label="Duplicate as new draft"
                      variant="primary"
                      size="sm"
                      icon={HiFolderPlus}
                      loading={saving}
                      onClick={handleCloneWorkflow}
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-500">No steps configured yet.</p>
                  <p className="mt-1 text-xs text-slate-400">Add steps, click Save Draft, then Publish Workflow.</p>
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="mt-3 inline-flex h-8 items-center rounded-none bg-[#0F766E] px-3 text-xs font-semibold text-white hover:bg-[#0c6b64]"
                  >
                    Add your first step
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {steps.map((step, index) => (
                <div key={step.id} className={`rounded-none border p-3 ${activeWorkflow.is_published ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge label={`Step ${step.order}`} color="teal" />
                      <Badge
                        label={step.is_parallel ? 'Parallel' : 'Sequential'}
                        color={step.is_parallel ? 'blue' : 'gray'}
                      />
                    </div>
                    {!activeWorkflow.is_published && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveStep(index, -1)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                        >
                          <HiArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStep(index, 1)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                        >
                          <HiArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(step.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-100 text-red-600 hover:bg-red-200"
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <Input
                      label="Step Name"
                      value={step.step_name}
                      onChange={(event) => handleChange(step.id, 'step_name', event.target.value)}
                      placeholder="e.g. IT Clearance"
                      disabled={activeWorkflow.is_published}
                    />
                    <Input
                      label="Assigned Department"
                      type="select"
                      value={step.department}
                      onChange={(event) => handleChange(step.id, 'department', event.target.value)}
                      placeholder="Select department"
                      options={DEPARTMENT_OPTIONS}
                      disabled={activeWorkflow.is_published}
                    />
                    <div className="flex items-end">
                      <label className={`inline-flex h-10 w-full items-center justify-between rounded-lg border border-slate-300 px-3 ${activeWorkflow.is_published ? 'bg-slate-100' : 'bg-white'}`}>
                        <span className="inline-flex items-center gap-1 text-sm text-slate-700">
                          <HiArrowsUpDown className="h-4 w-4 text-slate-500" />
                          Run in parallel
                        </span>
                        <input
                          type="checkbox"
                          checked={step.is_parallel}
                          onChange={(event) => handleChange(step.id, 'is_parallel', event.target.checked)}
                          className="h-4 w-4 accent-[#0F766E]"
                          disabled={activeWorkflow.is_published}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
