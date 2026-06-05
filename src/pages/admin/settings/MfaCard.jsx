import { useEffect, useState } from 'react'
import { HiShieldCheck, HiShieldExclamation } from 'react-icons/hi2'
import { SectionCard } from './components/ui'
import { Button } from '../../../components/ui/Button.jsx'
import { getMfaStatus, setupMfa, enableMfa, disableMfa } from '../../../services/mfaService'

const errMsg = (e, fallback) =>
  e?.response?.data?.message || e?.message || fallback

function CodeInput({ value, onChange, disabled }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      placeholder="123456"
      className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-center text-lg font-bold tracking-[0.3em] focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
    />
  )
}

export default function MfaCard() {
  const [status, setStatus] = useState(null) // { enabled, pending }
  const [loading, setLoading] = useState(true)
  const [setup, setSetup] = useState(null) // { qrDataUrl, secret, otpauthUrl }
  const [code, setCode] = useState('')
  const [disarming, setDisarming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null) // { type: 'ok'|'err', text }

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const s = await getMfaStatus()
        if (active) setStatus(s)
      } catch (e) {
        if (active) setMsg({ type: 'err', text: errMsg(e, 'Could not load MFA status.') })
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const enabled = Boolean(status?.enabled)

  const startSetup = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const data = await setupMfa()
      setSetup(data)
      setCode('')
    } catch (e) {
      setMsg({ type: 'err', text: errMsg(e, 'Could not start MFA setup.') })
    } finally {
      setBusy(false)
    }
  }

  const confirmEnable = async () => {
    if (code.length < 6) return
    setBusy(true)
    setMsg(null)
    try {
      await enableMfa(code)
      setSetup(null)
      setCode('')
      setStatus({ enabled: true })
      setMsg({ type: 'ok', text: 'Two-factor authentication is now enabled.' })
    } catch (e) {
      setMsg({ type: 'err', text: errMsg(e, 'Invalid code. Please try again.') })
    } finally {
      setBusy(false)
    }
  }

  const confirmDisable = async () => {
    if (code.length < 6) return
    setBusy(true)
    setMsg(null)
    try {
      await disableMfa(code)
      setStatus({ enabled: false })
      setDisarming(false)
      setCode('')
      setMsg({ type: 'ok', text: 'Two-factor authentication has been disabled.' })
    } catch (e) {
      setMsg({ type: 'err', text: errMsg(e, 'Invalid code. Please try again.') })
    } finally {
      setBusy(false)
    }
  }

  return (
    <SectionCard
      title="Your two-factor authentication"
      description="Add an extra layer of security to your own account using an authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)."
      noTable
    >
      <div className="space-y-4 p-1">
        {/* Status row */}
        <div className="flex items-center gap-3">
          {enabled ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <HiShieldCheck className="h-4 w-4" /> Enabled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
              <HiShieldExclamation className="h-4 w-4" /> Not enabled
            </span>
          )}
          {loading && <span className="text-xs text-gray-400">Loading…</span>}
        </div>

        {msg && (
          <div
            className={`rounded-lg border px-3 py-2 text-sm ${
              msg.type === 'ok'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Not enabled, not mid-setup → offer setup */}
        {!loading && !enabled && !setup && (
          <Button
            label="Set up two-factor authentication"
            variant="teal"
            loading={busy}
            disabled={busy}
            onClick={startSetup}
          />
        )}

        {/* Mid-setup → show QR + verify */}
        {!enabled && setup && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-gray-600">
              <li>Open your authenticator app and scan this QR code.</li>
              <li>Enter the 6-digit code it generates to confirm.</li>
            </ol>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <img
                src={setup.qrDataUrl}
                alt="Two-factor QR code"
                className="h-40 w-40 shrink-0 rounded-lg border border-gray-200 bg-white p-2"
              />
              <div className="min-w-0 space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Can&apos;t scan? Enter this key
                  </p>
                  <code className="mt-1 block break-all rounded-md bg-white px-2 py-1 font-mono text-xs text-gray-700 ring-1 ring-gray-200">
                    {setup.secret}
                  </code>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <CodeInput value={code} onChange={setCode} disabled={busy} />
                  <Button
                    label="Verify & enable"
                    variant="teal"
                    loading={busy}
                    disabled={busy || code.length < 6}
                    onClick={confirmEnable}
                  />
                  <Button
                    label="Cancel"
                    variant="outline"
                    disabled={busy}
                    onClick={() => {
                      setSetup(null)
                      setCode('')
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enabled → offer disable (requires a current code) */}
        {!loading && enabled && (
          disarming ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Enter a current code to turn it off:</span>
              <CodeInput value={code} onChange={setCode} disabled={busy} />
              <Button
                label="Disable"
                variant="danger"
                loading={busy}
                disabled={busy || code.length < 6}
                onClick={confirmDisable}
              />
              <Button
                label="Cancel"
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setDisarming(false)
                  setCode('')
                }}
              />
            </div>
          ) : (
            <Button
              label="Disable two-factor authentication"
              variant="outline"
              onClick={() => {
                setMsg(null)
                setDisarming(true)
              }}
            />
          )
        )}
      </div>
    </SectionCard>
  )
}
