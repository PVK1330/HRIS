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
      <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">
        Loading asset settings…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {(error || rulesBanner) && (
        <div
          className={`rounded-lg px-4 py-2 text-sm ${
            rulesBanner?.type === 'ok'
              ? 'border border-emerald-100 bg-emerald-50 text-emerald-800'
              : 'border border-red-100 bg-red-50 text-red-700'
          }`}
        >
          {rulesBanner?.type === 'ok' ? rulesBanner.text : error}
        </div>
      )}

      <SectionCard title="A. Asset categories">
        <p className="mb-4 text-xs text-gray-500">
          Add, edit, or remove categories. Toggle active to hide a category without deleting it.
        </p>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                    style={{ backgroundColor: `${cat.color}22` }}
                  >
                    {iconEmoji(cat.icon)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800">{cat.name}</p>
                    <p className="truncate text-[11px] text-gray-400">{cat.icon}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2">
                <span className="text-xs text-gray-500">Active</span>
                <Toggle
                  checked={cat.isActive !== false}
                  onChange={(v) => toggleActive(cat, v)}
                  disabled={categoryBusy}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={categoryBusy}
                  onClick={() => startEdit(cat)}
                  className="flex-1 rounded-lg border border-gray-200 bg-white py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={categoryBusy}
                  onClick={() => onDelete(cat)}
                  className="rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-gray-800">
            {editingId ? 'Edit category' : 'Add category'}
          </p>
          <form onSubmit={submitCategory} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-medium text-gray-600">
                Name *
                <TextInput
                  className="mt-1 max-w-none"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Laptop"
                />
              </label>
              <label className="block text-xs font-medium text-gray-600">
                Icon key
                <TextInput
                  className="mt-1 max-w-none"
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  placeholder="laptop, box, tool…"
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
                Color
                <input
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/.test(form.color) ? form.color : '#6366f1'}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="h-8 w-14 cursor-pointer rounded border border-gray-200"
                />
                <TextInput
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  placeholder="#6366f1"
                  className="max-w-[120px]"
                />
              </label>
              <label className="block text-xs font-medium text-gray-600">
                Sort order
                <TextInput
                  type="number"
                  min={0}
                  className="mt-1 max-w-xs"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))
                  }
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={categoryBusy || !form.name.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {editingId ? 'Save changes' : 'Add category'}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </SectionCard>

      {rulesDraft ? (
        <SectionCard title="B. Asset rules">
          <FieldRow label="Assigning rule">
            <SelectInput
              options={ASSIGNING_RULE_OPTIONS}
              value={rulesDraft.assigningRule}
              onChange={(e) =>
                setRulesDraft((r) => (r ? { ...r, assigningRule: e.target.value } : r))
              }
            />
          </FieldRow>
          <FieldRow label="Return rule">
            <SelectInput
              options={RETURN_RULE_OPTIONS}
              value={rulesDraft.returnRule}
              onChange={(e) =>
                setRulesDraft((r) => (r ? { ...r, returnRule: e.target.value } : r))
              }
            />
          </FieldRow>
          <FieldRow label="Lost / damaged policy">
            <SelectInput
              options={LOST_DAMAGED_OPTIONS}
              value={rulesDraft.lostDamagedPolicy}
              onChange={(e) =>
                setRulesDraft((r) => (r ? { ...r, lostDamagedPolicy: e.target.value } : r))
              }
            />
          </FieldRow>
          <FieldRow label="Approval workflow">
            <SelectInput
              options={APPROVAL_WORKFLOW_OPTIONS}
              value={rulesDraft.approvalWorkflow}
              onChange={(e) =>
                setRulesDraft((r) => (r ? { ...r, approvalWorkflow: e.target.value } : r))
              }
            />
          </FieldRow>
          <p className="mt-2 text-xs text-gray-400">
            Use Save Changes in the header to persist asset rules.
          </p>
        </SectionCard>
      ) : (
        <SectionCard title="B. Asset rules">
          <p className="text-sm text-gray-500">Loading rules…</p>
        </SectionCard>
      )}
    </div>
  )
}
