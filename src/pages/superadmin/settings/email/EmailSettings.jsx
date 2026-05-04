import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HiEye, HiEyeSlash } from 'react-icons/hi2'
import toast from 'react-hot-toast'

import SettingsCard from '../../../../components/settings/SettingsCard.jsx'
import FormField from '../../../../components/settings/FormField.jsx'
import SaveButton from '../../../../components/settings/SaveButton.jsx'
import SettingsInput from '../../../../components/settings/SettingsInput.jsx'
import SettingsSelect from '../../../../components/settings/SettingsSelect.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { Modal } from '../../../../components/ui/Modal.jsx'

import useSettings from '../../../../hooks/useSettings.js'
import settingsService from '../../../../services/settingsService.js'

const DELIVERY_OPTIONS = [{ value: 'smtp', label: 'SMTP' }]
const ENCRYPTION_OPTIONS = [
  { value: 'tls', label: 'TLS' },
  { value: 'ssl', label: 'SSL' },
  { value: 'none', label: 'None' },
]

const DEFAULT_STATE = {
  systemEmail: '',
  systemFromName: '',
  emailDelivery: 'smtp',
  smtpHost: '',
  smtpPort: '587',
  smtpUsername: '',
  smtpPassword: '',
  smtpEncryption: 'tls',
}

function fromApi(api) {
  if (!api) return DEFAULT_STATE
  return {
    systemEmail:    api.systemEmail ?? '',
    systemFromName: api.systemFromName ?? '',
    emailDelivery:  api.emailDelivery || 'smtp',
    smtpHost:       api.smtpHost ?? '',
    smtpPort:       String(api.smtpPort ?? '587'),
    smtpUsername:   api.smtpUsername ?? '',
    smtpPassword:   api.smtpPassword ?? '',
    smtpEncryption: api.smtpEncryption || 'tls',
  }
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

const PASSWORD_MASK = '••••••••'

function TestEmailModal({ open, onClose }) {
  const [sendTo, setSendTo] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      setSendTo('')
      setSuccess(null)
      setError(null)
    }
  }, [open])

  const submit = async () => {
    if (!sendTo.trim()) {
      setError('Please enter an email address')
      return
    }
    setSending(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await settingsService.sendTestEmail({ sendTo: sendTo.trim() })
      setSuccess(res?.message || 'Test email sent successfully')
      toast.success('Test email sent successfully')
    } catch (err) {
      const msg = err?.message || 'Failed to send test email'
      setError(msg)
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Send Test Email" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Sends a test email using the currently saved SMTP configuration.
        </p>

        <FormField label="Send To" required>
          <SettingsInput
            type="email"
            value={sendTo}
            onChange={(e) => setSendTo(e.target.value)}
            placeholder="recipient@example.com"
          />
        </FormField>

        {success && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-4">
          <Button label="Cancel" variant="outline" onClick={onClose} disabled={sending} />
          <Button
            label="Send"
            variant="primary"
            loading={sending}
            onClick={submit}
            className="!rounded-md !bg-red-600 hover:!bg-red-700"
          />
        </div>
      </div>
    </Modal>
  )
}

export default function EmailSettings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'smtp' ? 'smtp' : 'email'
  const [tab, setTab] = useState(initialTab)
  const [showPwd, setShowPwd] = useState(false)
  const [testOpen, setTestOpen] = useState(false)
  const [originalPasswordWasMasked, setOriginalPasswordWasMasked] = useState(false)

  // Keep tab in sync with URL when sidebar links to ?tab=smtp
  useEffect(() => {
    const t = searchParams.get('tab') === 'smtp' ? 'smtp' : 'email'
    setTab(t)
  }, [searchParams])

  const fetchFn = useCallback(async () => {
    const res = await settingsService.getEmail()
    const mapped = fromApi(res.data)
    return mapped
  }, [])

  const saveFn = useCallback(
    async (state) => {
      const payload = {
        systemEmail: state.systemEmail,
        systemFromName: state.systemFromName,
        emailDelivery: state.emailDelivery,
        smtpHost: state.smtpHost,
        smtpPort: Number(state.smtpPort) || 587,
        smtpUsername: state.smtpUsername,
        smtpEncryption: state.smtpEncryption,
      }
      // Only send password if the user actually typed a new one (i.e. it's
      // not the masked placeholder we received from the server).
      if (state.smtpPassword && state.smtpPassword !== PASSWORD_MASK) {
        payload.smtpPassword = state.smtpPassword
      }
      const res = await settingsService.updateEmail(payload)
      return fromApi(res.data)
    },
    []
  )

  const { data, setData, loading, save, saving } = useSettings(fetchFn, saveFn)
  const state = data || DEFAULT_STATE

  // Track whether the loaded password is just the server-side mask
  useEffect(() => {
    if (data?.smtpPassword === PASSWORD_MASK) {
      setOriginalPasswordWasMasked(true)
    }
  }, [data?.smtpPassword])

  const set = (patch) => setData((prev) => ({ ...(prev || DEFAULT_STATE), ...patch }))

  const switchTab = (next) => {
    setTab(next)
    if (next === 'smtp') {
      const sp = new URLSearchParams(searchParams)
      sp.set('tab', 'smtp')
      setSearchParams(sp, { replace: true })
    } else {
      const sp = new URLSearchParams(searchParams)
      sp.delete('tab')
      setSearchParams(sp, { replace: true })
    }
  }

  const tabBtn = useMemo(
    () =>
      'border-b-2 px-4 py-2 text-sm font-medium transition-colors -mb-px',
    []
  )

  return (
    <SettingsCard title="Email Settings">
      <div className="-mx-6 mb-5 border-b border-gray-200 px-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => switchTab('email')}
            className={`${tabBtn} ${
              tab === 'email'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Email Settings
          </button>
          <button
            type="button"
            onClick={() => switchTab('smtp')}
            className={`${tabBtn} ${
              tab === 'smtp'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            SMTP Settings
          </button>
        </div>
      </div>

      {loading ? (
        <FormSkeleton />
      ) : (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          {tab === 'email' && (
            <>
              <FormField label="System Email Address" required>
                <SettingsInput
                  type="email"
                  value={state.systemEmail}
                  onChange={(e) => set({ systemEmail: e.target.value })}
                  placeholder="no-reply@example.com"
                />
              </FormField>

              <FormField label="System From Name" required>
                <SettingsInput
                  type="text"
                  value={state.systemFromName}
                  onChange={(e) => set({ systemFromName: e.target.value })}
                  placeholder="Acme HR"
                />
              </FormField>

              <FormField label="Email Delivery" required>
                <SettingsSelect
                  value={state.emailDelivery}
                  onChange={(v) => set({ emailDelivery: v })}
                  options={DELIVERY_OPTIONS}
                />
              </FormField>
            </>
          )}

          {tab === 'smtp' && (
            <>
              <FormField label="SMTP Host">
                <SettingsInput
                  type="text"
                  value={state.smtpHost}
                  onChange={(e) => set({ smtpHost: e.target.value })}
                  placeholder="smtp.gmail.com"
                />
              </FormField>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField label="SMTP Port">
                  <SettingsInput
                    type="number"
                    value={state.smtpPort}
                    onChange={(e) => set({ smtpPort: e.target.value })}
                    placeholder="587"
                  />
                </FormField>
                <FormField label="Encryption">
                  <SettingsSelect
                    value={state.smtpEncryption}
                    onChange={(v) => set({ smtpEncryption: v })}
                    options={ENCRYPTION_OPTIONS}
                  />
                </FormField>
              </div>

              <FormField label="SMTP Username">
                <SettingsInput
                  type="text"
                  value={state.smtpUsername}
                  onChange={(e) => set({ smtpUsername: e.target.value })}
                  placeholder="username@example.com"
                />
              </FormField>

              <FormField
                label="SMTP Password"
                hint={
                  originalPasswordWasMasked
                    ? 'Leave unchanged to keep the existing password.'
                    : undefined
                }
              >
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={state.smtpPassword}
                    onChange={(e) => set({ smtpPassword: e.target.value })}
                    onFocus={() => {
                      if (state.smtpPassword === PASSWORD_MASK) {
                        set({ smtpPassword: '' })
                      }
                    }}
                    placeholder="••••••••"
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-800 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <HiEyeSlash className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>

              <div className="pt-1">
                <Button
                  label="Send Test Email"
                  variant="outline"
                  onClick={() => setTestOpen(true)}
                  className="!rounded-md !border-red-300 !text-red-600 hover:!bg-red-50"
                />
              </div>
            </>
          )}

          <div className="flex justify-end border-t border-gray-100 pt-4">
            <SaveButton type="submit" loading={saving} onClick={() => save()} />
          </div>
        </form>
      )}

      <TestEmailModal open={testOpen} onClose={() => setTestOpen(false)} />
    </SettingsCard>
  )
}
