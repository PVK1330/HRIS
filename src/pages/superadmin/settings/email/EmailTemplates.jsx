import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import SettingsCard from '../../../../components/settings/SettingsCard.jsx'
import FormField from '../../../../components/settings/FormField.jsx'
import SaveButton from '../../../../components/settings/SaveButton.jsx'
import SettingsInput from '../../../../components/settings/SettingsInput.jsx'
import SettingsSelect from '../../../../components/settings/SettingsSelect.jsx'
import SettingsToggle from '../../../../components/settings/SettingsToggle.jsx'
import { Badge } from '../../../../components/ui/Badge.jsx'

import settingsService from '../../../../services/settingsService.js'

function EmptyState() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/40 px-6 py-12">
      <svg
        width="72"
        height="56"
        viewBox="0 0 72 56"
        fill="none"
        aria-hidden
        className="text-blue-400"
      >
        <rect
          x="2"
          y="2"
          width="68"
          height="52"
          rx="6"
          stroke="currentColor"
          strokeWidth="2"
          fill="#EFF6FF"
        />
        <path
          d="M4 6 L36 32 L68 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M4 50 L28 28"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M68 50 L44 28"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <p className="text-sm text-gray-500">
        Select an email template from the dropdown menu
      </p>
    </div>
  )
}

function EditorSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
      <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
      <div className="h-64 w-full animate-pulse rounded bg-gray-200" />
    </div>
  )
}

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState('')

  const [template, setTemplate] = useState(null)
  const [tplLoading, setTplLoading] = useState(false)

  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef(null)

  /* ---------- load template list once ---------- */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await settingsService.getTemplates()
        if (!cancelled) setTemplates(res?.data || [])
      } catch (err) {
        toast.error(err?.message || 'Failed to load templates')
      } finally {
        if (!cancelled) setListLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  /* ---------- load full template when selection changes ---------- */
  const loadTemplate = useCallback(async (slug) => {
    if (!slug) return
    setTplLoading(true)
    try {
      const res = await settingsService.getTemplate(slug)
      const tpl = res?.data
      setTemplate(tpl)
      setSubject(tpl?.subject || '')
      setBody(tpl?.body || '')
      setIsActive(!!tpl?.is_active)
    } catch (err) {
      toast.error(err?.message || 'Failed to load template')
    } finally {
      setTplLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedSlug) loadTemplate(selectedSlug)
  }, [selectedSlug, loadTemplate])

  const options = useMemo(
    () => templates.map((t) => ({ value: t.slug, label: t.name })),
    [templates]
  )

  /* ---------- insert variable at caret ---------- */
  const insertVariable = (variable) => {
    const token = `{{${variable}}}`
    const ta = textareaRef.current
    if (!ta) {
      setBody((b) => b + token)
      return
    }
    const start = ta.selectionStart ?? body.length
    const end = ta.selectionEnd ?? body.length
    const next = body.slice(0, start) + token + body.slice(end)
    setBody(next)
    requestAnimationFrame(() => {
      ta.focus()
      const cursor = start + token.length
      ta.setSelectionRange(cursor, cursor)
    })
  }

  /* ---------- save ---------- */
  const onSave = async () => {
    if (!selectedSlug) return
    setSaving(true)
    try {
      const res = await settingsService.updateTemplate(selectedSlug, {
        subject,
        body,
        isActive,
      })
      const tpl = res?.data
      if (tpl) {
        setTemplate(tpl)
        setSubject(tpl.subject || '')
        setBody(tpl.body || '')
        setIsActive(!!tpl.is_active)
      }
      toast.success('Template saved successfully')
    } catch (err) {
      toast.error(err?.message || 'Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0">
      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notification Blueprints</h1>
          <p className="mt-1 text-slate-500 text-xs font-medium">Design automated email communications.</p>
        </div>
        <div className="w-full md:w-64">
           <div className="relative group">
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                disabled={listLoading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-black text-slate-900 uppercase tracking-widest outline-none transition-all focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 appearance-none cursor-pointer"
              >
                <option value="">{listLoading ? 'SYNCING...' : 'SELECT BLUEPRINT'}</option>
                {templates.map((t) => (
                  <option key={t.slug} value={t.slug}>{t.name.toUpperCase()}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                 </svg>
              </div>
           </div>
        </div>
      </div>

      {!selectedSlug ? (
        <EmptyState />
      ) : tplLoading ? (
        <EditorSkeleton />
      ) : !template ? (
        <EmptyState />
      ) : (
        <div className="space-y-6 pb-24">
          {/* Main Editor Card */}
          <div className="group relative rounded-[1.5rem] border border-slate-200 bg-white p-5 md:p-6 shadow-sm transition-all hover:shadow-md">
             <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">{template.name}</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">ID: {template.slug}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                   <span className="hidden md:inline text-[9px] font-black text-slate-400 uppercase tracking-widest">Operational:</span>
                   <button
                     type="button"
                     onClick={() => setIsActive(!isActive)}
                     className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}
                   >
                     <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                   </button>
                </div>
             </div>

             <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Email Subject Header</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject line..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Message Body (HTML)</label>
                  <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-900 shadow-inner">
                    <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/50 px-4 py-2">
                       <div className="flex gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-slate-700" />
                          <div className="h-2 w-2 rounded-full bg-slate-700" />
                          <div className="h-2 w-2 rounded-full bg-slate-700" />
                       </div>
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-2">HTML Source</span>
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="block min-h-[18rem] w-full bg-transparent p-4 font-mono text-xs leading-relaxed text-blue-400 outline-none selection:bg-blue-500/30"
                      spellCheck="false"
                    />
                  </div>
                </div>

                {/* Variables Panel */}
                {Array.isArray(template.variables) && template.variables.length > 0 && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Injection Tokens</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {template.variables.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => insertVariable(v)}
                          className="group flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black text-slate-600 transition-all hover:border-slate-900 hover:text-slate-900 active:scale-95"
                        >
                          <span className="text-slate-300 transition-colors group-hover:text-slate-400">{"{{"}</span>
                          {v}
                          <span className="text-slate-300 transition-colors group-hover:text-slate-400">{"}}"}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
             </div>
          </div>

          {/* Action Footer */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex w-[90%] md:w-full max-w-[400px] items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in duration-500">
             <div className="flex items-center gap-2 pl-3">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Blueprint Drafting</span>
             </div>
             <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setSelectedSlug('')}
                  className="rounded-xl px-4 py-2 text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-[10px] font-black text-white shadow-lg transition-all hover:bg-black active:scale-95 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  ) : (
                    <span>Update Blueprint</span>
                  )}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
