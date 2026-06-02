import { useEffect, useMemo, useState } from 'react'
import { HiArrowRightOnRectangle, HiPencilSquare, HiTrash } from 'react-icons/hi2'
import { useAssetSettings } from '../../../../hooks/useAssetSettings'
import {
  SectionCard,
  SettingsBanner,
  SettingsLoading,
  SettingsSection,
  SettingsTable,
} from '../components/ui'

export default function AssetSettingsSection({ registerToolbar }) {
  const {
    categories,
    loading,
    categoryBusy,
    error,
    createCategory,
    patchCategory,
    removeCategory,
  } = useAssetSettings()

  const [banner, setBanner] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const canCreate = useMemo(() => newName.trim().length > 0, [newName])
  const canEdit = useMemo(() => editName.trim().length > 0, [editName])

  useEffect(() => {
    if (!registerToolbar) return undefined
    registerToolbar({
      dirty: false,
      saving: false,
      onSave: () => {},
      onDiscard: () => {},
      disableSave: true,
    })
    return () => registerToolbar(null)
  }, [registerToolbar])

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setEditName(cat.name || '')
    setShowCreate(false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const submitCreate = async (e) => {
    e.preventDefault()
    if (!canCreate) return
    try {
      await createCategory({
        name: newName.trim(),
        icon: 'box',
        color: '#6366f1',
        sortOrder: 0,
      })
      setNewName('')
      setShowCreate(false)
      setBanner({ type: 'ok', text: 'Asset added successfully.' })
    } catch {
      /* surfaced via error */
    }
  }

  const submitEdit = async (cat) => {
    if (!canEdit) return
    try {
      await patchCategory(cat.id, { name: editName.trim() })
      cancelEdit()
      setBanner({ type: 'ok', text: 'Asset updated successfully.' })
    } catch {
      /* surfaced via error */
    }
  }

  const onDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return
    try {
      await removeCategory(cat.id)
      if (editingId === cat.id) cancelEdit()
      setBanner({ type: 'ok', text: 'Asset deleted successfully.' })
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

  if (loading && categories.length === 0) {
    return <SettingsLoading message="Loading asset settings…" />
  }

  return (
    <SettingsSection>
      {(error || banner) && (
        <SettingsBanner type={banner?.type === 'ok' ? 'ok' : 'error'}>
          {banner?.type === 'ok' ? banner.text : error}
        </SettingsBanner>
      )}

      <SectionCard title="Asset categories" noTable>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-600">Manage assets with name and status.</p>
          <button
            type="button"
            onClick={() => {
              setShowCreate((v) => !v)
              cancelEdit()
              setBanner(null)
            }}
            disabled={categoryBusy}
            className="rounded-none bg-[#0F766E] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] disabled:opacity-50"
          >
            {showCreate ? 'Close' : 'Add Asset'}
          </button>
        </div>

        {showCreate ? (
          <form onSubmit={submitCreate} className="mb-4 border border-slate-200 bg-slate-50/50 p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter asset name"
                className="h-9 w-full rounded-none border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              />
              <button
                type="submit"
                disabled={categoryBusy || !canCreate}
                className="rounded-none bg-[#0F766E] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreate(false)
                  setNewName('')
                }}
                className="rounded-none border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <SettingsTable columns={['Name', 'Status', 'Actions']}>
          {categories.map((cat) => {
            const isEditing = editingId === cat.id
            return (
              <tr key={cat.id} className="hover:bg-slate-50/40">
                <td className="px-4 py-3 sm:px-6">
                  {isEditing ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-9 w-full rounded-none border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] shadow-sm">
                        <HiArrowRightOnRectangle className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{cat.name}</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-center sm:px-6">
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={() => toggleActive(cat, cat.isActive === false)}
                      disabled={categoryBusy}
                      className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold ${
                        cat.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      } disabled:opacity-50`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${cat.isActive !== false ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {cat.isActive !== false ? 'Active' : 'Inactive'}
                    </button>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold ${
                          cat.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${cat.isActive !== false ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {cat.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-center sm:px-6">
                  {isEditing ? (
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => submitEdit(cat)}
                        disabled={categoryBusy || !canEdit}
                        className="rounded-none border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-none border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        disabled={categoryBusy}
                        onClick={() => startEdit(cat)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-sky-500 text-white transition-colors hover:bg-sky-600 disabled:opacity-50"
                        aria-label="Edit asset"
                      >
                        <HiPencilSquare className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={categoryBusy}
                        onClick={() => onDelete(cat)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                        aria-label="Delete asset"
                      >
                        <HiTrash className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </SettingsTable>
      </SectionCard>
    </SettingsSection>
  )
}
