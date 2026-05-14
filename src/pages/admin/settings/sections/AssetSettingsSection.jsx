import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAssetSettings } from '../../../../hooks/useAssetSettings'
import {
  APPROVAL_WORKFLOW_OPTIONS,
  ASSIGNING_RULE_OPTIONS,
  ICON_PREVIEW,
  LOST_DAMAGED_OPTIONS,
  RETURN_RULE_OPTIONS,
} from '../assetConstants'
import { FieldRow, SectionCard, SelectInput, TextInput, Toggle } from '../components/ui'

function buildRulesDraft(r) {
  if (!r) return null
  return {
    assigningRule: r.assigningRule ?? 'Manager assigns',
    returnRule: r.returnRule ?? 'On last day',
    lostDamagedPolicy: r.lostDamagedPolicy ?? 'Employee pays',
    approvalWorkflow: r.approvalWorkflow ?? 'Manager → HR',
  }
}

function iconEmoji(iconKey) {
  if (!iconKey) return ICON_PREVIEW.box
  return ICON_PREVIEW[iconKey] || ICON_PREVIEW.box
}

const emptyForm = {
  name: '',
  icon: 'box',
  color: '#6366f1',
  sortOrder: 0,
}
export default function AssetSettingsSection({ registerToolbar }) {
  const {
    categories,
    rules,
    loading,
    categoryBusy,
    rulesSaving,
    error,
    createCategory,
    patchCategory,
    removeCategory,
    saveRules,
  } = useAssetSettings()

  const [rulesDraft, setRulesDraft] = useState(null)
  const [rulesBaseline, setRulesBaseline] = useState(null)
  const [rulesBanner, setRulesBanner] = useState(null)
  const rulesDidInit = useRef(false)

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    if (!rules || rulesDidInit.current) return
    rulesDidInit.current = true
    const d = buildRulesDraft(rules)
    setRulesDraft(d)
    setRulesBaseline(JSON.stringify(d))
  }, [rules])

  const rulesDirty = useMemo(() => {
    if (!rulesDraft || rulesBaseline === null) return false
    return JSON.stringify(rulesDraft) !== rulesBaseline
  }, [rulesDraft, rulesBaseline])

  const resetRulesDraft = useCallback(() => {
    if (!rules) return
    const d = buildRulesDraft(rules)
    setRulesDraft(d)
    setRulesBaseline(JSON.stringify(d))
    setRulesBanner(null)
  }, [rules])

  const handleSaveRules = useCallback(async () => {
    if (!rulesDraft) return
    setRulesBanner(null)
    try {
      const res = await saveRules({
        assigningRule: rulesDraft.assigningRule,
        returnRule: rulesDraft.returnRule,
        lostDamagedPolicy: rulesDraft.lostDamagedPolicy,
        approvalWorkflow: rulesDraft.approvalWorkflow,
      })
      if (res?.data) {
        const d = buildRulesDraft(res.data)
        setRulesDraft(d)
        setRulesBaseline(JSON.stringify(d))
      }
      setRulesBanner({ type: 'ok', text: 'Asset rules saved.' })
    } catch {
      /* hook error */
    }
  }, [rulesDraft, saveRules])

  useEffect(() => {
    if (!registerToolbar) return undefined
    registerToolbar({
      dirty: rulesDirty,
      saving: rulesSaving,
      onSave: handleSaveRules,
      onDiscard: resetRulesDraft,
      disableSave: loading || !rulesDraft || rulesSaving || !rulesDirty,
    })
    return () => registerToolbar(null)
  }, [
    registerToolbar,
    rulesDirty,
    rulesSaving,
    handleSaveRules,
    resetRulesDraft,
    loading,
    rulesDraft,
  ])

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setForm({
      name: cat.name,
      icon: cat.icon || 'box',
      color: cat.color || '#6366f1',
      sortOrder: cat.sortOrder ?? 0,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const submitCategory = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    try {
      if (editingId) {
        await patchCategory(editingId, {
          name: form.name.trim(),
          icon: form.icon.trim() || 'box',
          color: form.color,
          sortOrder: Number(form.sortOrder) || 0,
        })
      } else {
        await createCategory({
          name: form.name.trim(),
          icon: form.icon.trim() || 'box',
          color: form.color,
          sortOrder: Number(form.sortOrder) || 0,
        })
      }
      cancelEdit()
    } catch {
      /* surfaced via error */
    }
  }

  const onDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return
    try {
      await removeCategory(cat.id)
      if (editingId === cat.id) cancelEdit()
    } catch {
      /* hook error */
    }
  }

  const toggleActive = async (cat, next) => {
    try {
      await patchCategory(cat.id, { isActive: next })
    } catch {
      /* hook error */
    }
  }

  if (loading && categories.length === 0 && !rules) {
    return (
      <div className="rounded-none border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm font-bold uppercase tracking-widest">
        Syncing Inventory Classification Protocols…
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {(error || rulesBanner) && (
        <div
          className={`rounded-none px-4 py-3 text-[11px] font-bold uppercase tracking-widest ${
            rulesBanner?.type === 'ok'
              ? 'border border-emerald-100 bg-emerald-50 text-emerald-800'
              : 'border border-red-100 bg-red-50 text-red-700'
          }`}
        >
          {rulesBanner?.type === 'ok' ? rulesBanner.text : error}
        </div>
      )}

      <SectionCard title="Asset Classification Matrix">
        <div className="mb-8 rounded-none border border-dashed border-slate-200 bg-slate-50/30 p-5">
          <p className="mb-4 text-[11px] font-black uppercase tracking-widest text-slate-900">
            {editingId ? 'Modify Inventory Identifier' : 'Register New Asset Classification'}
          </p>
          <form onSubmit={submitCategory} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
               <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Classification Name
                  </label>
                  <TextInput
                    className="max-w-none h-10 rounded-none border-slate-200"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Workstation"
                  />
               </div>
               <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    System Icon Key
                  </label>
                  <TextInput
                    className="max-w-none h-10 rounded-none border-slate-200"
                    value={form.icon}
                    onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                    placeholder="laptop, tool, phone…"
                  />
               </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 items-end">
               <div className="flex gap-4">
                  <div className="flex-1">
                     <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                       Identity Color
                     </label>
                     <div className="flex gap-2">
                        <input
                          type="color"
                          value={/^#[0-9A-Fa-f]{6}$/.test(form.color) ? form.color : '#6366f1'}
                          onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                          className="h-10 w-12 cursor-pointer rounded-none border border-slate-200 bg-white"
                        />
                        <TextInput
                          value={form.color}
                          onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                          placeholder="#6366f1"
                          className="h-10 rounded-none border-slate-200"
                        />
                     </div>
                  </div>
               </div>
               <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Sorting Weight
                  </label>
                  <TextInput
                    type="number"
                    min={0}
                    className="max-w-none h-10 rounded-none border-slate-200"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))
                    }
                  />
               </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={categoryBusy || !form.name.trim()}
                className="flex-1 sm:flex-none rounded-none bg-[#0F766E] px-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] disabled:opacity-50 transition-all shadow-md"
              >
                {editingId ? 'Update Identifier' : 'Initialize Classification'}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 sm:flex-none rounded-none border border-slate-200 bg-white px-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`flex flex-col rounded-none border p-4 transition-all ${
                 cat.isActive === false ? 'border-slate-100 bg-slate-50/50 grayscale opacity-60' : 'border-slate-200 bg-white shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none text-xl border border-slate-100"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  {iconEmoji(cat.icon)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-slate-900 uppercase tracking-tight">{cat.name}</p>
                  <p className="truncate text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{cat.icon} • Order: {cat.sortOrder}</p>
                </div>
              </div>
              
              <div className="mt-auto space-y-3 pt-3 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
                  <div className="flex items-center gap-2">
                     <span className={`text-[9px] font-bold uppercase ${cat.isActive !== false ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {cat.isActive !== false ? 'Active' : 'Archived'}
                     </span>
                     <Toggle
                       checked={cat.isActive !== false}
                       onChange={(v) => toggleActive(cat, v)}
                       disabled={categoryBusy}
                     />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={categoryBusy}
                    onClick={() => startEdit(cat)}
                    className="flex-1 rounded-none border border-slate-200 bg-white py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Modify
                  </button>
                  <button
                    type="button"
                    disabled={categoryBusy}
                    onClick={() => onDelete(cat)}
                    className="rounded-none border border-red-100 bg-red-50/50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Purge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {rulesDraft ? (
        <SectionCard title="Global Stewardship Protocols">
          <div className="divide-y divide-slate-50">
            <FieldRow label="Allocation Logic">
              <SelectInput
                options={ASSIGNING_RULE_OPTIONS}
                value={rulesDraft.assigningRule}
                onChange={(e) =>
                  setRulesDraft((r) => (r ? { ...r, assigningRule: e.target.value } : r))
                }
              />
            </FieldRow>
            <FieldRow label="De-provisioning Trigger">
              <SelectInput
                options={RETURN_RULE_OPTIONS}
                value={rulesDraft.returnRule}
                onChange={(e) =>
                  setRulesDraft((r) => (r ? { ...r, returnRule: e.target.value } : r))
                }
              />
            </FieldRow>
            <FieldRow label="Liability Architecture">
              <SelectInput
                options={LOST_DAMAGED_OPTIONS}
                value={rulesDraft.lostDamagedPolicy}
                onChange={(e) =>
                  setRulesDraft((r) => (r ? { ...r, lostDamagedPolicy: e.target.value } : r))
                }
              />
            </FieldRow>
            <FieldRow label="Authorization Pipeline">
              <SelectInput
                options={APPROVAL_WORKFLOW_OPTIONS}
                value={rulesDraft.approvalWorkflow}
                onChange={(e) =>
                  setRulesDraft((r) => (r ? { ...r, approvalWorkflow: e.target.value } : r))
                }
              />
            </FieldRow>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-none border border-emerald-50 bg-emerald-50/20 p-3">
             <div className="h-4 w-1 bg-[#0F766E]" />
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
               Modifications require a commit via the global stewardship toolbar.
             </p>
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="Global Stewardship Protocols">
          <div className="flex items-center justify-center py-10">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing protocols…</p>
          </div>
        </SectionCard>
      )}
    </div>
  )
}
