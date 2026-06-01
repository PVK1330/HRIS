import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import {
  HiPlus, HiPencilSquare, HiTrash, HiIdentification, HiCheckBadge, HiXCircle,
} from 'react-icons/hi2'
import svc from '../../../services/exitWorkflowService'

const ITEM_TYPES = [
  { v: 'TASK', label: 'Task' },
  { v: 'ASSET_RETURN', label: 'Asset return' },
  { v: 'INTERVIEW', label: 'Interview' },
  { v: 'SETTLEMENT', label: 'Settlement' },
  { v: 'DOCUMENT', label: 'Document' },
]
const TYPE_LABEL = Object.fromEntries(ITEM_TYPES.map((t) => [t.v, t.label]))
const blank = { name: '', description: '', item_type: 'TASK', default_mandatory: true, is_active: true }

export default function ClearanceItemsCatalog() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setItems(await svc.listClearanceItems() || []) }
    catch (e) { toast.error(e?.response?.data?.message || 'Failed to load clearance items') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const openNew = () => { setForm(blank); setEditingId(null); setModalOpen(true) }
  const openEdit = (it) => {
    setForm({
      name: it.name || '', description: it.description || '', item_type: it.item_type || 'TASK',
      default_mandatory: it.default_mandatory !== false, is_active: it.is_active !== false,
    })
    setEditingId(it.id); setModalOpen(true)
  }
  const close = () => { setModalOpen(false); setEditingId(null); setForm(blank) }

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      if (editingId) { await svc.updateClearanceItem(editingId, form); toast.success('Clearance item updated') }
      else { await svc.createClearanceItem(form); toast.success('Clearance item added') }
      close(); load()
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const remove = async (id) => {
    const r = await Swal.fire({ title: 'Delete clearance item?', text: 'It will no longer be available to add to workflow stages. Existing workflows are unaffected.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626' })
    if (!r.isConfirmed) return
    try { await svc.deleteClearanceItem(id); toast.success('Deleted'); load() } catch (e) { toast.error(e?.response?.data?.message || 'Failed') }
  }

  const activeCount = items.filter((i) => i.is_active !== false).length

  return (
    <div className="space-y-5 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Reusable clearance tasks (collect ID card, deactivate access card, revoke credentials…). Add them to any workflow stage from the builder's checklist.</p>
        <button onClick={openNew} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-bold text-white hover:bg-teal-800"><HiPlus className="h-4 w-4" /> Add item</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white"><HiIdentification className="h-5 w-5" /></div><div><div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Total</div><div className="text-2xl font-black text-slate-800">{items.length}</div></div></div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white"><HiCheckBadge className="h-5 w-5" /></div><div><div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Active</div><div className="text-2xl font-black text-slate-800">{activeCount}</div></div></div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-400 text-white"><HiXCircle className="h-5 w-5" /></div><div><div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Inactive</div><div className="text-2xl font-black text-slate-800">{items.length - activeCount}</div></div></div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="py-14 text-center text-slate-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-14 text-center text-slate-400">No clearance items yet. Add one to reuse it across workflows.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
              <tr><th className="px-4 py-2">Name</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Default</th><th className="px-4 py-2">Status</th><th className="px-4 py-2 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-slate-800">{it.name}</div>
                    {it.description && <div className="text-xs text-slate-400">{it.description}</div>}
                  </td>
                  <td className="px-4 py-2.5"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{TYPE_LABEL[it.item_type] || it.item_type}</span></td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{it.default_mandatory !== false ? 'Mandatory' : 'Optional'}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${it.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${it.is_active !== false ? 'bg-emerald-500' : 'bg-slate-400'}`} />{it.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(it)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white hover:bg-sky-600"><HiPencilSquare className="h-4 w-4" /></button>
                      <button onClick={() => remove(it.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600"><HiTrash className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={close}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-bold text-slate-800">{editingId ? 'Edit clearance item' : 'Add clearance item'}</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Collect ID card" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Type</label>
                <select value={form.item_type} onChange={(e) => setForm({ ...form, item_type: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  {ITEM_TYPES.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
                </select>
              </div>
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600"><input type="checkbox" checked={form.default_mandatory} onChange={(e) => setForm({ ...form, default_mandatory: e.target.checked })} className="h-4 w-4 rounded text-[#0F766E]" /> Mandatory by default</label>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded text-[#0F766E]" /> Active</label>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={close} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancel</button>
              <button onClick={save} disabled={saving} className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-50">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add item'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
