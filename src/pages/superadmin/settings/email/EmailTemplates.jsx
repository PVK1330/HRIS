import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Toggle } from '../../../../components/ui/Toggle.jsx'
import settingsService from '../../../../services/settingsService.js'

function EmptyState() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-900/10 bg-gray-50 px-6 py-12">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">No template selected</h3>
      <p className="mt-1 text-sm text-gray-500">Select a template from the list to preview and edit its content.</p>
    </div>
  )
}

function EditorSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-full rounded-md bg-gray-200"></div>
      <div className="h-64 w-full rounded-md bg-gray-200"></div>
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

  const onSave = async (e) => {
    if (e) e.preventDefault()
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
      toast.success('Template saved')
    } catch (err) {
      toast.error(err?.message || 'Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const baseInput = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#0F766E] sm:text-sm sm:leading-6"

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="space-y-4">
        
        <div className="grid grid-cols-1 gap-x-8 gap-y-4">
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
            <div className="border-b border-gray-900/10 px-4 py-5 sm:px-8">
              <h2 className="text-base font-semibold leading-7 text-gray-900">Email Templates</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Customize dynamic system email messages and styling.
              </p>
            </div>
            <div className="px-4 py-6 sm:p-8">
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Select Template</label>
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  disabled={listLoading}
                  className={baseInput}
                >
                  <option value="">{listLoading ? 'Loading...' : 'Choose a template...'}</option>
                  {templates.map((t) => (
                    <option key={t.slug} value={t.slug}>{t.name}</option>
                  ))}
                </select>
              </div>

              {template && (
                <div className="mt-8 border-t border-gray-900/10 pt-6">
                  <h3 className="text-sm font-medium leading-6 text-gray-900">Variables for {template.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">Click a variable to insert it at the cursor position.</p>
                  {Array.isArray(template.variables) && template.variables.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {template.variables.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => insertVariable(v)}
                          className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          <span className="text-gray-400 mr-1">{"{{"}</span>
                          {v}
                          <span className="text-gray-400 ml-1">{"}}"}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No variables available</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={onSave}
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
          >
            <div className="px-4 py-6 sm:p-8 space-y-6">
              {!selectedSlug ? (
                <EmptyState />
              ) : tplLoading ? (
                <EditorSkeleton />
              ) : !template ? (
                <EmptyState />
              ) : (
                <>
                  <div className="flex items-center justify-between pb-6 border-b border-gray-900/5">
                    <div>
                      <h3 className="text-base font-semibold leading-6 text-gray-900">{template.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">ID: {template.slug}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">Active</span>
                      <Toggle checked={isActive} onChange={setIsActive} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">Email Subject</label>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Subject line..."
                        className={baseInput}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">Message Body (HTML)</label>
                    <div className="mt-2 rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#0F766E]">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 rounded-t-md">
                        <span className="text-xs font-medium text-gray-500">HTML Source</span>
                      </div>
                      <textarea
                        ref={textareaRef}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="block min-h-[400px] w-full resize-y border-0 bg-gray-900 rounded-b-md p-4 font-mono text-sm text-blue-300 focus:ring-0"
                        spellCheck="false"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/5 px-4 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => setSelectedSlug('')}
                disabled={saving}
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedSlug || saving}
                className="rounded-md bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#115E59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
