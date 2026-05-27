import { useCallback, useEffect, useState } from 'react'
import { Badge, FieldRow, SectionCard, SelectInput, SettingsSection, TextInput, Toggle } from './components/ui'
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
      <div className="rounded-none border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Synchronizing document catalog…
      </div>
    )
  }

  return (
    <SettingsSection>
      {error && list.length === 0 ? (
        <div className="rounded-none border border-red-100 bg-red-50 p-4 text-sm text-red-700 font-medium">
          {error}
        </div>
      ) : null}

      <SectionCard title="Document types" noTable>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((doc) => {
            const selected = doc.id === selectedDocId
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => selectDoc(doc.id)}
                className={`flex flex-col gap-2 rounded-none border p-3 text-left transition-all ${
                  selected
                    ? 'border-[#0F766E] bg-emerald-50/50 ring-1 ring-[#0F766E]'
                    : 'border-slate-100 bg-slate-50/30 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className={`text-sm font-bold ${selected ? 'text-[#0F766E]' : 'text-slate-800'}`}>{doc.name}</span>
                <div className="flex items-center gap-2">
                   <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                      doc.isRequired ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'
                   }`}>
                      {doc.isRequired ? 'Mandatory' : 'Optional'}
                   </span>
                </div>
              </button>
            )
          })}

          {showAdd ? (
            <div className="col-span-full rounded-none border border-dashed border-[#0F766E] bg-emerald-50/20 p-4 animate-in slide-in-from-top-2 duration-300">
              <form onSubmit={handleAddSubmit} className="flex flex-col sm:flex-row items-end gap-3">
                <div className="flex-1 w-full">
                  <label htmlFor="new-doc-name" className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    New Classification Name
                  </label>
                  <TextInput
                    id="new-doc-name"
                    placeholder="e.g. Health Certificate"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={saving}
                    className="h-10 rounded-none border-slate-200 bg-white"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                   <button
                     type="submit"
                     disabled={saving || newName.trim().length < 2}
                     className="flex-1 sm:flex-none h-10 rounded-none bg-[#0F766E] px-6 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] disabled:opacity-40 transition-colors"
                   >
                     Initialize
                   </button>
                   <button
                     type="button"
                     disabled={saving}
                     onClick={() => {
                       setShowAdd(false)
                       setNewName('')
                     }}
                     className="flex-1 sm:flex-none h-10 rounded-none border border-slate-200 bg-white px-6 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
                   >
                     Cancel
                   </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="col-span-full rounded-none border-2 border-dashed border-slate-200 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 transition-all hover:border-[#0F766E] hover:text-[#0F766E] hover:bg-slate-50"
            >
              + Register New Document Type
            </button>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Overview" noTable>
        {list.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No document types configured.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-5">Document</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-5">Mandatory</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-5">Uploaded by</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-5">Expiry</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-5">HR approval</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-5">Visibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                {list.map((doc) => (
                  <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <td className="py-3 px-4 font-black text-slate-900">{doc.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 border ${
                         (doc.mandatoryOrOptional === 'Mandatory' || doc.isRequired) ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'
                      }`}>
                         {doc.mandatoryOrOptional || (doc.isRequired ? 'Mandatory' : 'Optional')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{doc.whoMustUpload || '—'}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {doc.expiryTracking
                        ? `ON (${doc.reminderBeforeExpiryDays ?? 30}D)`
                        : 'OFF'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{doc.hrApprovalRequired ? 'REQUIRED' : 'NONE'}</td>
                    <td className="py-3 px-4 text-slate-500">{doc.visibility || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {selectedDoc && form ? (
        <SectionCard title={`Audit Configuration: ${selectedDoc.name}`}>
          <div className="divide-y divide-slate-50">
            <FieldRow label="Compliance Mode">
              <SelectInput
                options={MANDATORY_OPTS}
                value={form.mandatoryOrOptional}
                onChange={(e) => patchField({ mandatoryOrOptional: e.target.value })}
                disabled={saving}
              />
            </FieldRow>
            <FieldRow label="Filing Responsibility">
              <SelectInput
                options={WHO_OPTS}
                value={form.whoMustUpload}
                onChange={(e) => patchField({ whoMustUpload: e.target.value })}
                disabled={saving}
              />
            </FieldRow>
            <FieldRow label="Track Expiration">
              <div className="flex h-10 items-center">
                <Toggle
                  checked={form.expiryTracking}
                  onChange={(v) => patchField({ expiryTracking: v })}
                  disabled={saving}
                />
              </div>
            </FieldRow>
            {form.expiryTracking ? (
              <FieldRow label="Advanced Notice (Days)">
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
            <FieldRow label="Mandatory Verification">
              <div className="flex h-10 items-center">
                <Toggle
                  checked={form.hrApprovalRequired}
                  onChange={(v) => patchField({ hrApprovalRequired: v })}
                  disabled={saving}
                />
              </div>
            </FieldRow>
            <FieldRow label="Identity Visibility">
              <SelectInput
                options={VIS_OPTS}
                value={form.visibility}
                onChange={(e) => patchField({ visibility: e.target.value })}
                disabled={saving}
              />
            </FieldRow>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleDelete()}
              className="w-full sm:w-auto h-10 rounded-none border border-red-200 bg-white px-6 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors shadow-xs"
            >
              Purge Document Type
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave()}
              className="w-full sm:w-auto h-10 rounded-none bg-[#0F766E] px-8 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] disabled:opacity-40 transition-all shadow-md"
            >
              {saving ? 'Syncing...' : 'Commit Changes'}
            </button>
          </div>
        </SectionCard>
      ) : (
        !loading && list.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 border border-dashed border-slate-200">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
               Select a Document classification to edit parameters
             </p>
          </div>
        ) : null
      )}
    </SettingsSection>
  )
}

