import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineDocumentText,
} from 'react-icons/hi2'
import { Modal } from '../../../components/ui/Modal.jsx'
import { useDocumentSettings } from '../../../hooks/settings/useDocumentSettings'
import { adminSettingsService } from '../../../services/adminSettingsService'

const REQUIRED_OPTS = ['Mandatory', 'Optional']
const WHO_OPTS = ['Employee', 'HR', 'Both']
const VIS_OPTS = ['HR only', 'Manager + HR', 'All', 'Employee (own only)']

const EMPTY_FORM = {
  name: '',
  mandatoryOrOptional: 'Mandatory',
  whoMustUpload: 'Employee',
  appliesToRoles: [],
  expiryTracking: false,
  reminderBeforeExpiryDays: 30,
  hrApprovalRequired: false,
  visibility: 'HR only',
}

const inputCls =
  'block w-full rounded-lg border-0 py-2 px-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#0F766E] transition'
const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5'

function isMandatory(doc) {
  return doc.mandatoryOrOptional === 'Mandatory' || (doc.mandatoryOrOptional == null && doc.isRequired)
}

export default function DocumentSettings() {
  const { list, loading, saving, error, addDoc, updateDoc, removeDoc } = useDocumentSettings()

  const [roles, setRoles] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    let cancelled = false
    adminSettingsService
      .getAllRoles()
      .then((res) => {
        if (cancelled) return
        const r = res?.data?.data || res?.data || []
        setRoles(Array.isArray(r) ? r : [])
      })
      .catch(() => setRoles([]))
    return () => { cancelled = true }
  }, [])

  const roleNameById = useMemo(() => {
    const m = new Map()
    roles.forEach((r) => m.set(String(r.id), r.name))
    return m
  }, [roles])

  const patch = useCallback((partial) => setForm((f) => ({ ...f, ...partial })), [])

  const toggleRole = useCallback((id) => {
    const key = String(id)
    setForm((f) => {
      const cur = f.appliesToRoles || []
      return { ...f, appliesToRoles: cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key] }
    })
  }, [])

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (doc) => {
    setEditingId(doc.id)
    setForm({
      name: doc.name ?? '',
      mandatoryOrOptional: isMandatory(doc) ? 'Mandatory' : 'Optional',
      whoMustUpload: doc.whoMustUpload ?? 'Employee',
      appliesToRoles: Array.isArray(doc.appliesToRoles) ? doc.appliesToRoles.map(String) : [],
      expiryTracking: Boolean(doc.expiryTracking),
      reminderBeforeExpiryDays: doc.reminderBeforeExpiryDays ?? 30,
      hrApprovalRequired: Boolean(doc.hrApprovalRequired),
      visibility: doc.visibility ?? 'HR only',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    const payload = {
      name: form.name.trim(),
      mandatoryOrOptional: form.mandatoryOrOptional,
      isRequired: form.mandatoryOrOptional === 'Mandatory',
      whoMustUpload: form.whoMustUpload,
      appliesToRoles: form.appliesToRoles || [],
      expiryTracking: form.expiryTracking,
      reminderBeforeExpiryDays: Number(form.reminderBeforeExpiryDays) || 30,
      hrApprovalRequired: form.hrApprovalRequired,
      visibility: form.visibility,
    }
    if (payload.name.length < 2) return
    try {
      if (editingId) await updateDoc(editingId, payload)
      else await addDoc(payload)
      setModalOpen(false)
    } catch {
      /* toast handled in hook */
    }
  }

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete document type "${doc.name}"? This cannot be undone.`)) return
    try {
      await removeDoc(doc.id)
    } catch {
      /* toast handled in hook */
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Onboarding Documents</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            The documents new hires are asked to upload during onboarding. Target each one to specific roles if needed.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c6b64]"
        >
          <HiOutlinePlus className="h-4 w-4" /> Add document
        </button>
      </div>

      {error && list.length === 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Document</th>
              <th className="px-5 py-3">Required</th>
              <th className="px-5 py-3">Uploaded by</th>
              <th className="px-5 py-3">Applies to</th>
              <th className="px-5 py-3">Expiry</th>
              <th className="px-5 py-3">HR approval</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading && list.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">Loading documents…</td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <HiOutlineDocumentText className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  <p className="text-sm font-medium text-slate-500">No documents yet</p>
                  <p className="text-xs text-slate-400">Click “Add document” to create your first one.</p>
                </td>
              </tr>
            ) : (
              list.map((doc) => {
                const roleIds = Array.isArray(doc.appliesToRoles) ? doc.appliesToRoles.map(String) : []
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-semibold text-slate-900">{doc.name}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isMandatory(doc) ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isMandatory(doc) ? 'Mandatory' : 'Optional'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{doc.whoMustUpload || '—'}</td>
                    <td className="px-5 py-3">
                      {roleIds.length === 0 ? (
                        <span className="text-slate-500">All roles</span>
                      ) : (
                        <span className="text-slate-600">
                          {roleIds.map((id) => roleNameById.get(id) || id).join(', ')}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {doc.expiryTracking ? `${doc.reminderBeforeExpiryDays ?? 30}d reminder` : '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{doc.hrApprovalRequired ? 'Required' : '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(doc)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#0F766E]"
                          title="Edit"
                        >
                          <HiOutlinePencilSquare className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(doc)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <HiOutlineTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit document' : 'Add document'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelCls}>Document name <span className="text-rose-500">*</span></label>
            <input
              autoFocus
              type="text"
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="e.g. Passport Copy"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Requirement</label>
              <select value={form.mandatoryOrOptional} onChange={(e) => patch({ mandatoryOrOptional: e.target.value })} className={inputCls}>
                {REQUIRED_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Uploaded by</label>
              <select value={form.whoMustUpload} onChange={(e) => patch({ whoMustUpload: e.target.value })} className={inputCls}>
                {WHO_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Applies to roles</label>
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
              <p className="mb-2 text-xs text-slate-500">
                Pick the roles that must provide this document. Leave empty to require it from <strong>everyone</strong>.
              </p>
              <div className="flex flex-wrap gap-2">
                {roles.length === 0 && <span className="text-xs text-slate-400">No roles found.</span>}
                {roles.map((r) => {
                  const id = String(r.id)
                  const checked = (form.appliesToRoles || []).includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleRole(id)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                        checked ? 'border-[#0F766E] bg-emerald-50 text-[#0F766E]' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {r.name}
                    </button>
                  )
                })}
              </div>
              {(form.appliesToRoles || []).length === 0 && roles.length > 0 && (
                <p className="mt-2 text-xs font-medium text-slate-400">All roles</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Visibility</label>
              <select value={form.visibility} onChange={(e) => patch({ visibility: e.target.value })} className={inputCls}>
                {VIS_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label className="inline-flex cursor-pointer items-center gap-2.5 pb-2">
                <input
                  type="checkbox"
                  checked={form.hrApprovalRequired}
                  onChange={(e) => patch({ hrApprovalRequired: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                />
                <span className="text-sm font-medium text-slate-700">Require HR approval</span>
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-3">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={form.expiryTracking}
                onChange={(e) => patch({ expiryTracking: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
              />
              <span className="text-sm font-medium text-slate-700">Track expiry date</span>
            </label>
            {form.expiryTracking && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-slate-500">Remind</span>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={form.reminderBeforeExpiryDays}
                  onChange={(e) => patch({ reminderBeforeExpiryDays: parseInt(e.target.value, 10) || 1 })}
                  className={`${inputCls} max-w-[6rem]`}
                />
                <span className="text-sm text-slate-500">days before expiry</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || form.name.trim().length < 2}
              className="rounded-lg bg-[#0F766E] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c6b64] disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add document'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
