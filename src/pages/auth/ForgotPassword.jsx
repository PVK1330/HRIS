import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  HiEnvelope,
  HiLockClosed,
  HiArrowLeft,
  HiCheckCircle,
  HiExclamationCircle,
  HiEye,
  HiEyeSlash,
} from 'react-icons/hi2'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { parseTenantSlugFromHostname } from '../../utils/tenantSlug.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const labelUpper = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500'
const RESEND_SECONDS = 45

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('email') // 'email' | 'otp' | 'reset' | 'success'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendIn, setResendIn] = useState(0)

  const tenantSlugFromHost =
    typeof window !== 'undefined' ? parseTenantSlugFromHostname(window.location.hostname) : null

  // Resend countdown timer (only runs on the OTP stage)
  useEffect(() => {
    if (resendIn <= 0) return undefined
    const t = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [resendIn])

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault()
    if (!email) {
      setError('Please enter your registered email address.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tenantSlug: tenantSlugFromHost })
      })
      const result = await response.json()
      if (!result.success) throw new Error(result.message)
      setStage('otp')
      setResendIn(RESEND_SECONDS)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendIn > 0 || loading) return
    setOtp(['', '', '', '', '', ''])
    await handleSendOTP()
  }

  const handleVerifyOTP = async (e) => {
    if (e) e.preventDefault()
    const fullOtp = otp.join('')
    if (fullOtp.length < 6) {
      setError('Please enter the full 6-digit code.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: fullOtp, tenantSlug: tenantSlugFromHost })
      })
      const result = await response.json()
      if (!result.success) throw new Error(result.message)
      setStage('reset')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join(''), newPassword: password, tenantSlug: tenantSlugFromHost })
      })
      const result = await response.json()
      if (!result.success) throw new Error(result.message)
      setStage('success')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return // only 1 char per box
    if (value && !/^\d$/.test(value)) return // digits only
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`fp-otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`fp-otp-${index - 1}`)?.focus()
    }
  }

  const eyeToggle = (visible, setVisible) => (
    <button
      type="button"
      onClick={() => setVisible(!visible)}
      className="text-gray-400 hover:text-gray-600"
      disabled={loading}
      aria-label={visible ? 'Hide password' : 'Show password'}
    >
      {visible ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
    </button>
  )

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F766E] shadow-lg shadow-teal-700/20">
            <HiLockClosed className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900">
            Account Recovery
          </h2>
          <p className="mt-2 px-4 text-center text-sm text-gray-500">
            {stage === 'email' && "Enter your email and we'll send you an OTP to reset your password."}
            {stage === 'otp' && (<>We&apos;ve sent a 6-digit code to <span className="font-semibold text-gray-700">{email}</span></>)}
            {stage === 'reset' && 'Almost there! Create a strong new password for your account.'}
            {stage === 'success' && 'Your password has been reset successfully.'}
          </p>
        </div>

        {/* Step indicator */}
        {stage !== 'success' && (
          <div className="mb-6 flex items-center justify-center gap-2">
            {['email', 'otp', 'reset'].map((s, i) => {
              const order = { email: 0, otp: 1, reset: 2 }
              const done = order[stage] > i
              const current = order[stage] === i
              return (
                <span
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    current ? 'w-8 bg-[#0F766E]' : done ? 'w-8 bg-[#0F766E]/40' : 'w-4 bg-gray-200'
                  }`}
                />
              )
            })}
          </div>
        )}

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
          {stage === 'email' && (
            <form className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300" onSubmit={handleSendOTP} noValidate>
              <Input
                label="Registered Email"
                labelClassName={labelUpper}
                name="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                suffix={<HiEnvelope className="h-5 w-5 text-gray-400" />}
                required
              />
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  <HiExclamationCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <Button
                type="submit"
                label="Send Verification Code"
                variant="teal"
                loading={loading}
                disabled={loading}
                className="w-full justify-center rounded-xl py-3.5 text-base font-bold shadow-lg shadow-teal-700/20"
              />
            </form>
          )}

          {stage === 'otp' && (
            <form className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300" onSubmit={handleVerifyOTP} noValidate>
              <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`fp-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-gray-200 text-center text-xl font-bold transition-all focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:h-14"
                  />
                ))}
              </div>
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  <HiExclamationCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <Button
                type="submit"
                label="Verify Code"
                variant="teal"
                loading={loading}
                disabled={loading}
                className="w-full justify-center rounded-xl py-3.5 text-base font-bold shadow-lg shadow-teal-700/20"
              />
              <div className="text-center text-sm">
                {resendIn > 0 ? (
                  <span className="text-gray-400">
                    Resend code in <span className="font-semibold text-gray-600">{resendIn}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="font-semibold text-[#0F766E] hover:text-[#0D5F57] hover:underline disabled:opacity-50"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </form>
          )}

          {stage === 'reset' && (
            <form className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300" onSubmit={handleResetPassword} noValidate>
              <div>
                <Input
                  label="New Password"
                  labelClassName={labelUpper}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  suffix={eyeToggle(showPassword, setShowPassword)}
                />
                <p className="mt-1 text-xs text-gray-400">Must be at least 8 characters.</p>
              </div>
              <div>
                <Input
                  label="Confirm New Password"
                  labelClassName={labelUpper}
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  suffix={eyeToggle(showConfirm, setShowConfirm)}
                />
                {passwordsMismatch && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <HiExclamationCircle className="h-3.5 w-3.5" /> Passwords do not match.
                  </p>
                )}
                {passwordsMatch && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                    <HiCheckCircle className="h-3.5 w-3.5" /> Passwords match.
                  </p>
                )}
              </div>
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  <HiExclamationCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <Button
                type="submit"
                label="Reset Password"
                variant="teal"
                loading={loading}
                disabled={loading}
                className="w-full justify-center rounded-xl py-3.5 text-base font-bold shadow-lg shadow-teal-700/20"
              />
            </form>
          )}

          {stage === 'success' && (
            <div className="space-y-6 text-center animate-in zoom-in duration-300">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                  <HiCheckCircle className="h-10 w-10 text-emerald-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Success!</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You can now log in with your new password.
                </p>
              </div>
              <Button
                label="Back to Login"
                variant="teal"
                className="w-full justify-center rounded-xl py-3.5 text-base font-bold shadow-lg shadow-teal-700/20"
                onClick={() => navigate('/login')}
              />
            </div>
          )}
        </div>

        {stage !== 'success' && (
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 transition-colors hover:text-gray-600"
            >
              <HiArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
