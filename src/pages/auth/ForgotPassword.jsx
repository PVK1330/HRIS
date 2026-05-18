import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  HiEnvelope, 
  HiShieldCheck, 
  HiLockClosed, 
  HiArrowLeft, 
  HiCheckCircle,
  HiExclamationCircle
} from 'react-icons/hi2'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'

const labelUpper = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('email') // 'email' | 'otp' | 'reset' | 'success'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOTP = async () => {
    if (!email) {
      setError('Please enter your registered email address.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const result = await response.json()
      if (!result.success) throw new Error(result.message)
      setStage('otp')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    const fullOtp = otp.join('')
    if (fullOtp.length < 6) {
      setError('Please enter the full 6-digit code.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: fullOtp })
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

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join(''), newPassword: password })
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
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20 mb-4">
            <HiLockClosed className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-display text-gray-900 tracking-tight">
            Account Recovery
          </h2>
          <p className="mt-2 text-sm text-gray-500 text-center px-4">
            {stage === 'email' && "Enter your email and we'll send you an OTP to reset your password."}
            {stage === 'otp' && `We've sent a 6-digit code to ${email}`}
            {stage === 'reset' && "Almost there! Create a strong new password for your account."}
            {stage === 'success' && "Your password has been reset successfully."}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl border border-gray-100">
          {stage === 'email' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Input
                label="Registered Email"
                labelClassName={labelUpper}
                name="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                suffix={<HiEnvelope className="h-4 w-4" />}
                disabled={loading}
              />
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-500 font-medium">
                  <HiExclamationCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <Button
                label={loading ? "Sending..." : "Send Verification Code"}
                variant="primary"
                disabled={loading}
                className="w-full justify-center py-3 rounded-xl shadow-lg shadow-emerald-600/20"
                onClick={handleSendOTP}
              />
            </div>
          )}

          {stage === 'otp' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    disabled={loading}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                  />
                ))}
              </div>
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-500 font-medium">
                  <HiExclamationCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <Button
                label={loading ? "Verifying..." : "Verify Code"}
                variant="primary"
                disabled={loading}
                className="w-full justify-center py-3 rounded-xl shadow-lg shadow-emerald-600/20"
                onClick={handleVerifyOTP}
              />
              <div className="text-center">
                <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                  Resend code (45s)
                </button>
              </div>
            </div>
          )}

          {stage === 'reset' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Input
                label="New Password"
                labelClassName={labelUpper}
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <Input
                label="Confirm New Password"
                labelClassName={labelUpper}
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-500 font-medium">
                  <HiExclamationCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <Button
                label={loading ? "Resetting..." : "Reset Password"}
                variant="primary"
                disabled={loading}
                className="w-full justify-center py-3 rounded-xl shadow-lg shadow-emerald-600/20"
                onClick={handleResetPassword}
              />
            </div>
          )}

          {stage === 'success' && (
            <div className="text-center space-y-6 animate-in zoom-in duration-300">
              <div className="flex justify-center">
                <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center">
                  <HiCheckCircle className="h-10 w-10 text-emerald-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Success!</h3>
                <p className="text-sm text-gray-500 mt-1">
                  You can now log in with your new password.
                </p>
              </div>
              <Button
                label="Back to Login"
                variant="primary"
                className="w-full justify-center py-3 rounded-xl shadow-lg shadow-emerald-600/20"
                onClick={() => navigate('/login')}
              />
            </div>
          )}
        </div>

        {stage !== 'success' && (
          <div className="mt-8 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
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
