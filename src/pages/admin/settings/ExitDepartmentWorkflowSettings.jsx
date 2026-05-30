import { useEffect, useState } from 'react'

import toast from 'react-hot-toast'

import { HiCog6Tooth, HiBuildingOffice2, HiXMark, HiPlus, HiPencilSquare, HiCheck } from 'react-icons/hi2'

import { Button } from '../../../components/ui/Button.jsx'

import {

  listExitDepartmentsWithHeads,

  getExitWorkflowConfig,

  saveExitWorkflowConfig,

} from '../../../services/exitManagementService.js'

import { DEFAULT_PIPELINE_STAGES } from '../../../utils/exitPipelineStages.js'



const STAGE_ORDER = [

  'submitted',

  'approved',

  'clearance',

  'interview',

  'settlement',

  'exited',

]



function normalizeDepartments(row) {

  if (Array.isArray(row.departments) && row.departments.length) {

    return row.departments.map((d) => ({

      department_id: String(d.department_id),

      department_name: d.department_name || '',

      department_head_name: d.department_head_name || '',

    }))

  }

  if (row.department_id) {

    return [

      {

        department_id: String(row.department_id),

        department_name: row.department_name || '',

        department_head_name: row.department_head_name || '',

      },

    ]

  }

  return []

}



function mergeStagesFromApi(apiStages) {

  const byKey = Object.fromEntries((apiStages || []).map((s) => [s.stage_key, s]))

  return STAGE_ORDER.map((key, index) => {

    const def = DEFAULT_PIPELINE_STAGES.find((s) => s.stage_key === key) || {

      stage_key: key,

      label: key,

      step_order: index + 1,

    }

    const row = byKey[key] || def

    const departments = normalizeDepartments(row)

    return {

      stage_key: key,

      label: row.label || def.label,

      step_order: row.step_order ?? index + 1,

      departments,

    }

  })

}



export default function ExitDepartmentWorkflowSettings({ embedded = false }) {

  const [departments, setDepartments] = useState([])

  const [pipelineStages, setPipelineStages] = useState(() => mergeStagesFromApi([]))

  const [pickerDept, setPickerDept] = useState({})

  const [loading, setLoading] = useState(true)

  const [saving, setSaving] = useState(false)

  const [dirty, setDirty] = useState(false)

  const [editingStage, setEditingStage] = useState(null)
  
  const [editStageLabel, setEditStageLabel] = useState('')

  const handleSaveStageLabel = (stageKey) => {
    if (!editStageLabel.trim()) {
      setEditingStage(null)
      return
    }
    setPipelineStages((prev) =>
      prev.map((s) => (s.stage_key === stageKey ? { ...s, label: editStageLabel.trim() } : s)),
    )
    setDirty(true)
    setEditingStage(null)
  }


  const load = async () => {

    setLoading(true)

    try {

      const [depts, cfg] = await Promise.all([

        listExitDepartmentsWithHeads(),

        getExitWorkflowConfig(),

      ])

      setDepartments(depts || [])

      setPipelineStages(mergeStagesFromApi(cfg?.pipeline_stages))

      setPickerDept({})

      setDirty(false)

    } catch {

      toast.error('Failed to load exit workflow configuration')

    } finally {

      setLoading(false)

    }

  }



  useEffect(() => {

    load()

  }, [])



  const addStageDepartment = (stageKey) => {

    const departmentId = pickerDept[stageKey]

    if (!departmentId) return

    const dept = departments.find((d) => String(d.id) === String(departmentId))

    if (!dept) return



    setPipelineStages((prev) =>

      prev.map((s) => {

        if (s.stage_key !== stageKey) return s

        if (s.departments.some((d) => String(d.department_id) === String(departmentId))) {

          return s

        }

        return {

          ...s,

          departments: [

            ...s.departments,

            {

              department_id: String(departmentId),

              department_name: dept.name || '',

              department_head_name: dept.head_name || '',

            },

          ],

        }

      }),

    )

    setPickerDept((p) => ({ ...p, [stageKey]: '' }))

    setDirty(true)

  }



  const removeStageDepartment = (stageKey, departmentId) => {

    setPipelineStages((prev) =>

      prev.map((s) =>

        s.stage_key === stageKey

          ? {

              ...s,

              departments: s.departments.filter(

                (d) => String(d.department_id) !== String(departmentId),

              ),

            }

          : s,

      ),

    )

    setDirty(true)

  }



  const handleSave = async () => {

    setSaving(true)

    try {

      const payload = pipelineStages.map((s, i) => ({

        stage_key: s.stage_key,

        label: s.label,

        step_order: i + 1,

        is_active: true,

        department_ids: s.departments.map((d) => Number(d.department_id)),

      }))

      await saveExitWorkflowConfig({ pipeline_stages: payload })

      toast.success('Exit workflow saved for your organization')

      setDirty(false)

      load()

    } catch (err) {

      toast.error(err?.response?.data?.message || 'Failed to save configuration')

    } finally {

      setSaving(false)

    }

  }



  return (

    <div className={`space-y-6 ${embedded ? '' : 'p-6'}`}>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F766E]/10">

            <HiCog6Tooth className="h-5 w-5 text-[#0F766E]" />

          </div>

          <div>

            <h2 className="text-lg font-bold text-slate-900">Department Workflow Assignment</h2>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">

              For each exit stage, select one or more departments that are responsible. This is

              saved in your organization database and applied to new exit requests.

            </p>

          </div>

        </div>

      </div>



      {loading ? (

        <div className="h-64 animate-pulse rounded-lg bg-slate-100" />

      ) : (

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">

          

          <div className="divide-y divide-slate-100">

            {pipelineStages.map((stage, index) => {

              const assignedIds = new Set(stage.departments.map((d) => String(d.department_id)))

              const available = departments.filter((d) => !assignedIds.has(String(d.id)))



              return (

                <div

                  key={stage.stage_key}

                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:gap-6 hover:bg-slate-50/50 transition-colors"

                >

                  <div className="flex min-w-[140px] items-center gap-3 sm:pt-2 group">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F766E]/10 text-xs font-black text-[#0F766E]">
                      {index + 1}
                    </span>
                    {editingStage === stage.stage_key ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={editStageLabel}
                          onChange={(e) => setEditStageLabel(e.target.value)}
                          className="h-8 w-32 rounded border border-[#0F766E] px-2 text-sm text-slate-900 outline-none ring-1 ring-[#0F766E]/50"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveStageLabel(stage.stage_key)
                            if (e.key === 'Escape') setEditingStage(null)
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveStageLabel(stage.stage_key)}
                          className="text-[#0F766E] hover:text-[#0a524c]"
                        >
                          <HiCheck className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingStage(null)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <HiXMark className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-bold text-slate-900">{stage.label}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStage(stage.stage_key)
                            setEditStageLabel(stage.label)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-[#0F766E] rounded-full p-1"
                          aria-label="Edit stage name"
                        >
                          <HiPencilSquare className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3">
                    {stage.departments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {stage.departments.map((d) => (
                          <span
                            key={d.department_id}

                            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#0F766E]/20 bg-[#0F766E]/5 px-3 py-1 text-xs font-semibold text-[#0F766E]"

                          >

                            <HiBuildingOffice2 className="h-3.5 w-3.5 shrink-0" />

                            <span className="truncate">

                              {d.department_name}

                              {d.department_head_name ? ` · ${d.department_head_name}` : ''}

                            </span>

                            <button

                              type="button"

                              onClick={() =>

                                removeStageDepartment(stage.stage_key, d.department_id)

                              }

                              className="ml-0.5 rounded-full p-0.5 text-[#0F766E]/70 hover:bg-[#0F766E]/10 hover:text-[#0F766E]"

                              aria-label={`Remove ${d.department_name}`}

                            >

                              <HiXMark className="h-3.5 w-3.5" />

                            </button>

                          </span>

                        ))}

                      </div>

                    )}



                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-2 sm:max-w-lg">

                      <div className="flex flex-1 flex-col gap-1">

                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">

                          Add department

                        </label>

                        <select

                          value={pickerDept[stage.stage_key] || ''}

                          onChange={(e) =>

                            setPickerDept((p) => ({

                              ...p,

                              [stage.stage_key]: e.target.value,

                            }))

                          }

                          className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"

                        >

                          <option value="">— Select department —</option>

                          {available.map((d) => (

                            <option key={d.id} value={String(d.id)}>

                              {d.name}

                              {d.head_name ? ` (${d.head_name})` : ''}

                            </option>

                          ))}

                        </select>

                      </div>

                      <button

                        type="button"

                        onClick={() => addStageDepartment(stage.stage_key)}

                        disabled={!pickerDept[stage.stage_key] || available.length === 0}

                        className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded border border-[#0F766E]/30 bg-[#0F766E]/5 px-4 text-xs font-bold uppercase tracking-wide text-[#0F766E] transition hover:bg-[#0F766E]/10 disabled:cursor-not-allowed disabled:opacity-40"

                      >

                        <HiPlus className="h-4 w-4" />

                        Add

                      </button>

                    </div>



                    {stage.departments.length === 0 && (

                      <p className="text-xs text-slate-400">No departments assigned yet.</p>

                    )}

                  </div>

                </div>

              )

            })}

          </div>

          <div className="flex justify-end border-t border-slate-200 bg-slate-50/50 px-4 py-4">

            <Button

              size="sm"

              label="Save"

              loading={saving}

              onClick={handleSave}

              disabled={loading || !dirty}

            />

          </div>

        </div>

      )}

    </div>

  )

}

