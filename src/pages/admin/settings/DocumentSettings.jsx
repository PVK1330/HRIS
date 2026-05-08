import { useCallback, useEffect, useState } from 'react'
import { Badge, FieldRow, SectionCard, SelectInput, TextInput, Toggle } from './components/ui'
import { useDocumentSettings } from '../../../hooks/settings/useDocumentSettings'

const MANDATORY_OPTS = ['Mandatory', 'Optional']
const WHO_OPTS = ['Employee', 'HR', 'Both']
const VIS_OPTS = ['HR only', 'Manager + HR', 'All', 'Employee (own only)']

export default function DocumentSettings() {
  const {
    list,
    loading,
    saving,
    error,
    selectedDocId,
    selectedDoc,
    selectDoc,
    addDoc,
    updateDoc,
    removeDoc,
  } = useDocumentSettings()

  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (!selectedDoc) {
      setForm(null)
      return
    }
    setForm({
      mandatoryOrOptional: selectedDoc.mandatoryOrOptional ?? 'Mandatory',
      whoMustUpload: selectedDoc.whoMustUpload ?? 'Employee',
      expiryTracking: Boolean(selectedDoc.expiryTracking),
      reminderBeforeExpiryDays: selectedDoc.reminderBeforeExpiryDays ?? 30,
      hrApprovalRequired: Boolean(selectedDoc.hrApprovalRequired),
      visibility: selectedDoc.visibility ?? 'HR only',
    })
  }, [selectedDoc])

  const patchField = useCallback((partial) => {
    setForm((f) => (f ? { ...f, ...partial } : f))
  }, [])

  const handleSave = async () => {
    if (!selectedDocId || !form) return
    try {
      await updateDoc(selectedDocId, {
        mandatoryOrOptional: form.mandatoryOrOptional,
        whoMustUpload: form.whoMustUpload,
        expiryTracking: form.expiryTracking,
        reminderBeforeExpiryDays: form.reminderBeforeExpiryDays,
        hrApprovalRequired: form.hrApprovalRequired,
        visibility: form.visibility,
      })
    } catch {
      /* toast in updateDoc */
    }
  }

  const handleDelete = async () => {
    if (!selectedDocId || !selectedDoc) return
    const ok = window.confirm(
      `Delete document type "${selectedDoc.name}"? This cannot be undone.`,
    )
    if (!ok) return
    try {
      await removeDoc(selectedDocId)
    } catch {
      /* toast in removeDoc */
    }
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    const name = newName.trim()
    if (name.length < 2) return
    try {
      await addDoc(name)
      setNewName('')
      setShowAdd(false)
    } catch {
      /* errors surfaced via toast in addDoc */
    }
  }

  if (loading && list.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Loading document settings…
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {error && list.length === 0 ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <SectionCard title="Required Documents List">
        <div className="grid grid-cols-2 gap-3">
          {list.map((doc) => {
            const selected = doc.id === selectedDocId
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => selectDoc(doc.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                  selected
                    ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <span className="flex-1 text-sm text-gray-800">{doc.name}</span>
                <Badge label={doc.isRequired ? 'Required' : 'Optional'} color="indigo" />
              </button>
            )
          })}

          {showAdd ? (
            <div className="col-span-2 rounded-lg border border-dashed border-gray-300 bg-white p-3">
              <form onSubmit={handleAddSubmit} className="flex flex-wrap items-end gap-3">
                <div className="min-w-[200px] flex-1">
                  <label htmlFor="new-doc-name" className="mb-1 block text-xs font-medium text-gray-500">
                    Name
                  </label>
                  <TextInput
                    id="new-doc-name"
                    placeholder="Document type name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving || newName.trim().length < 2}
                  className="h-8 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
                >
                  Add
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setShowAdd(false)
                    setNewName('')
                  }}
                  className="h-8 rounded-lg border border-gray-200 px-4 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Cancel
                </button>
              </form>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="col-span-2 rounded-lg border-2 border-dashed border-gray-200 py-2.5 text-sm text-gray-500 transition-colors hover:border-indigo-300 hover:text-indigo-600"
            >
              + Add Document Type
            </button>
          )}
        </div>
      </SectionCard>

      {selectedDoc && form ? (
        <SectionCard title={`Per-Document Settings (${selectedDoc.name})`}>
          <FieldRow label="Mandatory or Optional">
            <SelectInput
              options={MANDATORY_OPTS}
              value={form.mandatoryOrOptional}
              onChange={(e) => patchField({ mandatoryOrOptional: e.target.value })}
              disabled={saving}
            />
          </FieldRow>
          <FieldRow label="Who Must Upload">
            <SelectInput
              options={WHO_OPTS}
              value={form.whoMustUpload}
              onChange={(e) => patchField({ whoMustUpload: e.target.value })}
              disabled={saving}
            />
          </FieldRow>
          <FieldRow label="Expiry Tracking">
            <Toggle
              checked={form.expiryTracking}
              onChange={(v) => patchField({ expiryTracking: v })}
              disabled={saving}
            />
          </FieldRow>
          {form.expiryTracking ? (
            <FieldRow label="Reminder Before Expiry (days)">
              <TextInput
                type="number"
                min={1}
                max={365}
                value={form.reminderBeforeExpiryDays}
                onChange={(e) =>
                  patchField({
                    reminderBeforeExpiryDays: parseInt(e.target.value, 10) || 1,
                  })
                }
                disabled={saving}
              />
            </FieldRow>
          ) : null}
          <FieldRow label="HR Approval Required">
            <Toggle
              checked={form.hrApprovalRequired}
              onChange={(v) => patchField({ hrApprovalRequired: v })}
              disabled={saving}
            />
          </FieldRow>
          <FieldRow label="Visibility">
            <SelectInput
              options={VIS_OPTS}
              value={form.visibility}
              onChange={(e) => patchField({ visibility: e.target.value })}
              disabled={saving}
            />
          </FieldRow>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 pt-5">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleDelete()}
              className="h-9 rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
            >
              Delete Document Type
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave()}
              className="h-9 rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </SectionCard>
      ) : (
        !loading && list.length > 0 ? (
          <p className="text-center text-sm text-gray-400">
            Select a document type above to edit its settings.
          </p>
        ) : null
      )}
    </div>
  )
}
