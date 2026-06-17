import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { superadminService } from '../../../services/superadminService.js'
import ChangePasswordCard from '../../admin/settings/ChangePasswordCard.jsx'

const mfaErr = (e, fb) => e?.response?.data?.message || e?.message || fb

function MfaSection() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [setup, setSetup] = useState(null)
  const [code, setCode] = useState('')
  const [disarming, setDisarming] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    superadminService
      .getMfaStatus()
      .then((s) => active && setStatus(s))
      .catch(() => active && setStatus({ enabled: false }))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const enabled = Boolean(status?.enabled)
  const onCode = (v) => setCode(v.replace(/\D/g, '').slice(0, 6))

  const startSetup = async () => {
    setBusy(true)
    try {
      setSetup(await superadminService.setupMfa())
      setCode('')
    } catch (e) {
      toast.error(mfaErr(e, 'Could not start setup'))
    } finally {
      setBusy(false)
    }
  }

  const confirmEnable = async () => {
    if (code.length < 6) return
    setBusy(true)
    try {
      await superadminService.enableMfa(code)
      setSetup(null)
      setCode('')
      setStatus({ enabled: true })
      toast.success('Two-factor authentication enabled')
    } catch (e) {
      toast.error(mfaErr(e, 'Invalid code'))
    } finally {
      setBusy(false)
    }
  }

  const confirmDisable = async () => {
    if (code.length < 6) return
    setBusy(true)
    try {
      await superadminService.disableMfa(code)
      setStatus({ enabled: false })
      setDisarming(false)
      setCode('')
      toast.success('Two-factor authentication disabled')
    } catch (e) {
      toast.error(mfaErr(e, 'Invalid code'))
    } finally {
      setBusy(false)
    }
  }

  const codeInput = (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      value={code}
      disabled={busy}
      onChange={(e) => onCode(e.target.value)}
      placeholder="123456"
      className="w-36 rounded-none border border-slate-200 px-3 py-2 text-center font-mono text-lg font-bold tracking-[0.3em] focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
    />
  )

  if (loading) {
    return <p className="font-mono text-xs text-slate-400">Loading…</p>
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        {enabled ? (
          <span className="rounded-none bg-teal-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-teal-700 border border-teal-200">
            ENABLED
          </span>
        ) : (
          <span className="rounded-none bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-500 border border-slate-200">
            NOT ENABLED
          </span>
        )}
        <p className="text-xs text-slate-500">
          Use Google Authenticator, Authy, or any TOTP app.
        </p>
      </div>

      {!enabled && !setup && (
        <button
          type="button"
          onClick={startSetup}
          disabled={busy}
          className="inline-flex h-9 items-center bg-[#0F766E] px-4 text-xs font-bold text-white shadow-2xs hover:bg-[#0c6b64] disabled:opacity-50"
        >
          {busy ? 'Please wait…' : 'Set up 2FA'}
        </button>
      )}

      {!enabled && setup && (
        <div className="border border-slate-200 bg-slate-50 p-4">
          <ol className="mb-4 list-decimal space-y-1 pl-5 text-xs text-slate-600">
            <li>Scan this QR code with your authenticator app.</li>
            <li>Enter the 6-digit code to confirm.</li>
          </ol>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              src={setup.qrDataUrl}
              alt="2FA QR code"
              className="h-40 w-40 border border-slate-200 bg-white p-2"
            />
            <div className="space-y-3">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Manual key
                </p>
                <code className="mt-1 block break-all bg-white px-2 py-1 font-mono text-xs text-slate-700 ring-1 ring-slate-200">
                  {setup.secret}
                </code>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {codeInput}
                <button
                  type="button"
                  onClick={confirmEnable}
                  disabled={busy || code.length < 6}
                  className="inline-flex h-9 items-center bg-[#0F766E] px-4 text-xs font-bold text-white shadow-2xs hover:bg-[#0c6b64] disabled:opacity-50"
                >
                  Verify &amp; enable
                </button>
                <button
                  type="button"
                  onClick={() => { setSetup(null); setCode('') }}
                  disabled={busy}
                  className="inline-flex h-9 items-center px-3 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {enabled && (
        disarming ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-600">Enter a current code to turn it off:</span>
            {codeInput}
            <button
              type="button"
              onClick={confirmDisable}
              disabled={busy || code.length < 6}
              className="inline-flex h-9 items-center bg-red-600 px-4 text-xs font-bold text-white shadow-2xs hover:bg-red-500 disabled:opacity-50"
            >
              Disable
            </button>
            <button
              type="button"
              onClick={() => { setDisarming(false); setCode('') }}
              disabled={busy}
              className="inline-flex h-9 items-center px-3 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setDisarming(true)}
            className="inline-flex h-9 items-center border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            Disable two-factor authentication
          </button>
        )
      )}
    </div>
  )
}

export default function AccountSettings() {
  return (
    <div className="space-y-6">
      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Two-Factor Authentication
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Protect your superadmin account with a TOTP authenticator app.
          </p>
        </div>
        <div className="p-5">
          <MfaSection />
        </div>
      </div>

      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Change Password
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Update the login password for this superadmin account.
          </p>
        </div>
        <div className="p-5">
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  )
}
