import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  HiArrowsUpDown,
  HiPlus,
  HiTrash,
  HiXMark,
  HiBuildingOffice2,
} from 'react-icons/hi2'
import { Modal } from '../ui/Modal.jsx'
import { Button } from '../ui/Button.jsx'
import { Badge } from '../ui/Badge.jsx'
import {
  listExitDepartmentsWithHeads,
  getExitDepartmentWorkflow,
  assignExitDepartmentWorkflow,
  getExitWorkflowConfig,
} from '../../services/exitManagementService.js'

function emptyStep(dept) {
  return {
    tempId: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    department_id: dept?.id || '',
    department_name: dept?.name || '',
    department_head_id: dept?.manager_id || null,
    department_head_name: dept?.head_name || '',
    is_mandatory: true,
    remarks: '',
  }
}

export default function DepartmentWorkflowModal({ exitId, exitRecord, isOpen, onClose, onSaved }) {
  const [departments, setDepartments] = useState([])
  const [selectedSteps, setSelectedSteps] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [search, setSearch] = useState('')

  const availableDepartments = useMemo(() => {
    const used = new Set(selectedSteps.map((s) => Number(s.department_id)))
    return departments.filter((d) => !used.has(Number(d.id)))
  }, [departments, selectedSteps])

  const filteredAvailable = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return availableDepartments
    return availableDepartments.filter(
      (d) => d.name.toLowerCase().includes(q) || (d.head_name || '').toLowerCase().includes(q),
    )
  }, [availableDepartments, search])

  useEffect(() => {
    if (!isOpen || !exitId) return
    setLoading(true)
    Promise.all([
      listExitDepartmentsWithHeads(),
      getExitDepartmentWorkflow(exitId).catch(() => null),
      getExitWorkflowConfig().catch(() => ({ pipeline_stages: [], department_steps: [] })),
    ])
      .then(([depts, wf, cfg]) => {
        const orgTpl = { steps: cfg?.department_steps || [] }
        setDepartments(depts || [])
        const mapStep = (s, prefix) => ({
          tempId: `${prefix}-${s.id || s.department_id}`,
          id: s.id,
          department_id: s.department_id,
          department_name: s.department_name,
          department_head_id: s.department_head_id,
          department_head_name: s.department_head_name,
          is_mandatory: s.is_mandatory !== false,
          remarks: s.remarks || '',
        })
        const fromPipeline = (cfg?.pipeline_stages || [])
          .filter((s) => s.department_id)
          .map((s) => mapStep({
            department_id: s.department_id,
            department_name: s.department_name,
            department_head_id: s.department_head_id,
            department_head_name: s.department_head_name,
            is_mandatory: true,
            remarks: '',
          }, 'tpl'))
        const steps = wf?.steps?.length
          ? wf.steps.map((s) => mapStep(s, 's'))
          : fromPipeline.length
            ? fromPipeline
            : (orgTpl?.steps || []).map((s) => mapStep(s, 'org'))
        setSelectedSteps(steps)
      })
      .catch(() => toast.error('Failed to load departments'))
      .finally(() => setLoading(false))
  }, [isOpen, exitId])

  const addDepartment = (dept) => {
    setSelectedSteps((prev) => [...prev, emptyStep(dept)])
    setPickerOpen(false)
    setSearch('')
  }

  const removeStep = (tempId) => {
    setSelectedSteps((prev) => prev.filter((s) => s.tempId !== tempId))
  }

  const moveStep = (index, dir) => {
    setSelectedSteps((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const updateStep = (tempId, patch) => {
    setSelectedSteps((prev) => prev.map((s) => (s.tempId === tempId ? { ...s, ...patch } : s)))
  }

  const handleSave = async () => {
    if (!selectedSteps.length) {
      toast.error('Select at least one department')
      return
    }
    setSaving(true)
    try {
      const payload = selectedSteps.map((s, i) => ({
        department_id: Number(s.department_id),
        department_head_id: s.department_head_id ? Number(s.department_head_id) : null,
        step_order: i + 1,
        is_mandatory: Boolean(s.is_mandatory),
        remarks: s.remarks || null,
      }))
      await assignExitDepartmentWorkflow(exitId, payload)
      toast.success('Department workflow assigned')
      onSaved?.()
      onClose?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save workflow')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Department Workflow Assignment"
      size="xl"
    >
      <div className="space-y-4 py-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-600">
          Configure the approval sequence for{' '}
          <span className="font-semibold text-slate-900">{exitRecord?.employee_name || 'employee'}</span>.
          Drag order using arrows. Mandatory steps must be approved before proceeding.
        </div>

        {loading ? (
          <div className="h-40 animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Approval sequence</h3>
              <Button
                size="sm"
                variant="outline"
                icon={HiPlus}
                label="Add department"
                onClick={() => setPickerOpen(true)}
              />
            </div>

            {selectedSteps.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                No departments selected. Add HR, IT, Finance, etc.
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {selectedSteps.map((step, index) => (
                  <div
                    key={step.tempId}
                    className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-[#0F766E]/40"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F766E]/10 text-xs font-black text-[#0F766E]">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <HiBuildingOffice2 className="h-4 w-4 text-slate-400" />
                          <span className="font-semibold text-slate-900">{step.department_name}</span>
                          <Badge
                            label={step.is_mandatory ? 'Mandatory' : 'Optional'}
                            color={step.is_mandatory ? 'orange' : 'gray'}
                          />
                        </div>
                        <p className="text-xs text-slate-500">
                          Head: {step.department_head_name || 'Not assigned'}
                        </p>
                        <textarea
                          rows={2}
                          value={step.remarks}
                          onChange={(e) => updateStep(step.tempId, { remarks: e.target.value })}
                          placeholder="Instructions for this department..."
                          className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-[#0F766E]"
                        />
                        <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                          <input
                            type="checkbox"
                            checked={step.is_mandatory}
                            onChange={(e) => updateStep(step.tempId, { is_mandatory: e.target.checked })}
                            className="accent-[#0F766E]"
                          />
                          Mandatory approval
                        </label>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <button type="button" onClick={() => moveStep(index, -1)} className="rounded border border-slate-200 p-1 hover:bg-slate-50">
                          <HiArrowsUpDown className="h-4 w-4 rotate-180 text-slate-500" />
                        </button>
                        <button type="button" onClick={() => moveStep(index, 1)} className="rounded border border-slate-200 p-1 hover:bg-slate-50">
                          <HiArrowsUpDown className="h-4 w-4 text-slate-500" />
                        </button>
                        <button type="button" onClick={() => removeStep(step.tempId)} className="rounded border border-red-100 p-1 hover:bg-red-50">
                          <HiTrash className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {pickerOpen && (
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">Select department</span>
              <button type="button" onClick={() => setPickerOpen(false)}>
                <HiXMark className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search department or head..."
              className="mb-2 h-9 w-full rounded border border-slate-200 px-3 text-sm outline-none focus:border-[#0F766E]"
            />
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {filteredAvailable.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => addDepartment(d)}
                  className="flex w-full items-center justify-between rounded border border-slate-100 px-3 py-2 text-left text-sm hover:border-[#0F766E] hover:bg-[#0F766E]/5"
                >
                  <span className="font-medium text-slate-800">{d.name}</span>
                  <span className="text-xs text-slate-500">{d.head_name || 'No head'}</span>
                </button>
              ))}
              {!filteredAvailable.length && (
                <p className="py-4 text-center text-xs text-slate-400">No departments available</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="outline" label="Cancel" onClick={onClose} />
          <Button label="Save workflow" loading={saving} onClick={handleSave} />
        </div>
      </div>
    </Modal>
  )
}
