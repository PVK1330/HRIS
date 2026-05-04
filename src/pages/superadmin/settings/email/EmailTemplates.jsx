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
    <SettingsCard
      title="Email Templates"
      actions={
        <div className="w-72">
          <SettingsSelect
            value={selectedSlug}
            onChange={setSelectedSlug}
            options={options}
            placeholder={listLoading ? 'Loading templates…' : 'Select a template'}
            disabled={listLoading}
          />
        </div>
      }
    >
      {!selectedSlug ? (
        <EmptyState />
      ) : tplLoading ? (
        <EditorSkeleton />
      ) : !template ? (
        <EmptyState />
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Template:</span>
            <Badge label={template.name} color="gray" />
            <span className="text-xs text-gray-400">slug: {template.slug}</span>
          </div>

          <FormField label="Subject" required>
            <SettingsInput
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </FormField>

          <FormField label="Body (HTML)" required>
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="block min-h-[16rem] w-full rounded-md border border-gray-300 bg-white p-3 font-mono text-sm text-gray-800 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </FormField>

          {Array.isArray(template.variables) && template.variables.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Available Variables
              </label>
              <div className="flex flex-wrap gap-2">
                {template.variables.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="rounded-full focus:outline-none focus:ring-2 focus:ring-red-300"
                    title={`Insert {{${v}}}`}
                  >
                    <Badge label={`{{${v}}}`} color="blue" />
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Click a variable to insert it at the cursor position.
              </p>
            </div>
          )}

          <FormField label="Active">
            <SettingsToggle
              checked={isActive}
              onChange={setIsActive}
              label={isActive ? 'Template is active' : 'Template is disabled'}
            />
          </FormField>

          <div className="flex justify-end border-t border-gray-100 pt-4">
            <SaveButton loading={saving} onClick={onSave} />
          </div>
        </div>
      )}
    </SettingsCard>
  )
}
