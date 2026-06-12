import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { HiBuildingOffice2, HiEye, HiEyeSlash, HiLockClosed, HiArrowLeft } from 'react-icons/hi2'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import axios from 'axios'
import { parseTenantSlugFromHostname } from '../../utils/tenantSlug.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const LAST_TENANT_ID_KEY = 'hris_last_tenant_id'

// Account-type tabs. These control which login endpoint is used
// (`/auth/login` for an organization, `/superadmin/login` for the platform).
// NOTE: demo credentials / quick-login prefill have been removed for production.
const ACCOUNT_TABS = [
  { id: 'admin', label: 'Organisation', icon: HiBuildingOffice2 },
  { id: 'superadmin', label: 'Super Admin', icon: HiLockClosed },
]

const POST_LOGIN = {
  admin: '/admin/dashboard',
  hr_admin: '/admin/dashboard',
  hr_executive: '/admin/dashboard',
  manager: '/admin/dashboard',
  employee: '/admin/dashboard',
  superadmin: '/superadmin/dashboard',
  support_admin: '/superadmin/dashboard',
  billing_admin: '/superadmin/dashboard',
}

const labelUpper = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [stage, setStage] = useState('login') // 'login' | 'twoFactor'
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [mfaToken, setMfaToken] = useState(null)
  const [impersonationLoading, setImpersonationLoading] = useState(false)
  const [impersonationError, setImpersonationError] = useState('')
  const tenantSlugFromHost =
    typeof window !== 'undefined' ? parseTenantSlugFromHostname(window.location.hostname) : null

  const [organizationId, setOrganisationId] = useState(() => {
    if (tenantSlugFromHost) return ''
    try {
      return typeof window !== 'undefined' ? (window.localStorage.getItem(LAST_TENANT_ID_KEY) || '') : ''
    } catch {
      return ''
    }
  })

  // Effect to navigate after user is set
  useEffect(() => {
    if (user) {
      const target = POST_LOGIN[user.role]
      // Only navigate if we have a target and we're not already there (or trying to go there)
      if (target && window.location.pathname !== target) {
        navigate(target, { replace: true })
      }
    }
  }, [user, navigate])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('impersonation_code')
    if (!code) return
    window.history.replaceState({}, '', window.location.pathname)
    setImpersonationLoading(true)
    axios
      .post(`${API_URL}/api/v1/auth/exchange-impersonation-code`, { code })
      .then((response) => {
        const result = response.data
        if (!result.success) throw new Error(result.message || 'Exchange failed')
        const d = result.data
        login(d.user, d.token, d.plan_details || [], d.plan_features || [], d.tenant_features || [], d.allowedModules)
      })
      .catch((err) => {
        setImpersonationError(err.response?.data?.message || err.message || 'Impersonation session failed')
      })
      .finally(() => setImpersonationLoading(false))
  }, [])

  // If already logged in, don't show the form to avoid flicker
  if (user) return null

  if (impersonationLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#0F766E] border-t-transparent" />
          <p className="text-sm font-medium text-gray-600">Establishing session…</p>
        </div>
      </div>
    )
  }

  if (impersonationError) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl text-center">
          <p className="text-sm font-semibold text-red-600 mb-4">{impersonationError}</p>
          <button
            type="button"
            onClick={() => setImpersonationError('')}
            className="text-sm font-semibold text-[#0F766E] hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    )
  }

  const selectTab = (id) => {
    if (id === activeTab) return
    setActiveTab(id)
    setEmail('')
    setPassword('')
    setError('')
  }

  // Applies a successful login response (shared by password login and MFA verification)
  const applyLoginResult = (result, isSuperAdmin) => {
    const baseUser = isSuperAdmin ? result.data.superadmin : result.data.user
    // Carry the org's billing/trial state so the paywall gate can react immediately.
    const userData =
      !isSuperAdmin && baseUser
        ? { ...baseUser, billing: result.data.billing ?? null }
        : baseUser
    if (!isSuperAdmin && userData) {
      const tid = userData.tenantId ?? userData.tenant_id
      if (tid != null && tid !== '') {
        try {
          localStorage.setItem(LAST_TENANT_ID_KEY, String(tid))
        } catch {
          /* ignore */
        }
      }
    }
    login(
      userData,
      result.data.token,
      result.data.plan_details || [],
      result.data.plan_features || [],
      result.data.tenant_features || [],
      result.data.allowedModules ?? result.data.allowed_modules,
    )
  }

  const handleSignIn = async (e) => {
    if (e) e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const isSuperAdmin = activeTab === 'superadmin'
      const endpoint = isSuperAdmin ? '/superadmin/login' : '/auth/login'

      const body = { email, password }
      if (!isSuperAdmin) {
        const slug =
          tenantSlugFromHost || parseTenantSlugFromHostname(window.location.hostname)
        if (slug) {
          body.tenantSlug = slug
        } else {
          let tid = parseInt(String(organizationId || '').trim(), 10)
          if (!Number.isInteger(tid) || tid <= 0) {
            try {
              const stored = localStorage.getItem(LAST_TENANT_ID_KEY)
              tid = parseInt(String(stored || ''), 10)
            } catch {
              /* ignore */
            }
          }
          if (Number.isInteger(tid) && tid > 0) body.tenantId = tid
        }
      }

      const response = await axios.post(`${API_URL}/api/v1${endpoint}`, body)
      const result = response.data

      if (!result.success) {
        throw new Error(result.message || 'Login failed')
      }

      if (result.data.mfaRequired) {
        // Both superadmin and org login now return a short-lived signed mfaToken
        // that must be presented to verify-2fa (no bare user id is trusted).
        setMfaToken(result.data.mfaToken ?? null)
        setOtp(['', '', '', '', '', ''])
        setStage('twoFactor')
        return
      }

      // Standard login success
      applyLoginResult(result, isSuperAdmin)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async (e) => {
    if (e) e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fullOtp = otp.join('')
      if (fullOtp.length < 6) {
        throw new Error('Please enter the full 6-digit code.')
      }
      const isSuperAdmin = activeTab === 'superadmin'
      const endpoint = isSuperAdmin ? '/superadmin/verify-2fa' : '/auth/verify-2fa'
      const payload = { mfaToken, code: fullOtp }

      const response = await axios.post(`${API_URL}/api/v1${endpoint}`, payload)
      const result = response.data

      if (!result.success) {
        throw new Error(result.message || 'Verification failed')
      }

      applyLoginResult(result, isSuperAdmin)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Verification failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    if (value && !/^\d$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  return (
    <div className="flex min-h-[100dvh]">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:relative">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F766E]/90 via-[#0F766E]/80 to-[#0D5F57]/90" />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-lg px-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
              <HiBuildingOffice2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">HRIS</h1>
              <p className="text-xs font-medium text-white/90">Human Resource Information System</p>
            </div>
          </div>

          <div className="space-y-5">
            <h2 className="font-display text-3xl font-bold text-white leading-tight">
              Empower Your Workforce with Modern HR Solutions
            </h2>
            <p className="text-base text-white/90 leading-relaxed">
              Streamline your HR operations, manage employee data, and drive organizational success.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="rounded-xl bg-white/15 p-4 backdrop-blur-sm border border-white/20 shadow-xl">
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-xs font-medium text-white/90 mt-1">Companies</div>
              </div>
              <div className="rounded-xl bg-white/15 p-4 backdrop-blur-sm border border-white/20 shadow-xl">
                <div className="text-3xl font-bold text-white">50K+</div>
                <div className="text-xs font-medium text-white/90 mt-1">Employees</div>
              </div>
              <div className="rounded-xl bg-white/15 p-4 backdrop-blur-sm border border-white/20 shadow-xl">
                <div className="text-3xl font-bold text-white">99.9%</div>
                <div className="text-xs font-medium text-white/90 mt-1">Uptime</div>
              </div>
              <div className="rounded-xl bg-white/15 p-4 backdrop-blur-sm border border-white/20 shadow-xl">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-xs font-medium text-white/90 mt-1">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full flex-1 flex-col items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
            <HiBuildingOffice2 className="h-8 w-8 text-[#0F766E]" />
            <div className="font-display text-2xl font-bold text-[#0F766E]">HRIS</div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8 lg:p-10">
            {stage === 'login' ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-6">
                  <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">
                    Welcome back
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Sign in to your account to continue
                  </p>
                </div>

                {/* Account type selector (replaces the old "Quick Login Roles" demo block) */}
                <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
                  {ACCOUNT_TABS.map((tab) => {
                    const Icon = tab.icon
                    const active = activeTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        disabled={loading}
                        onClick={() => selectTab(tab.id)}
                        className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
                          active
                            ? 'bg-white text-[#0F766E] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>

                <form className="space-y-5" onSubmit={handleSignIn} noValidate>
                  <Input
                    label={tenantSlugFromHost && activeTab === 'admin' ? 'Work email or username' : 'Email Address'}
                    labelClassName={labelUpper}
                    name="email"
                    type={tenantSlugFromHost && activeTab === 'admin' ? 'text' : 'email'}
                    placeholder={
                      tenantSlugFromHost && activeTab === 'admin'
                        ? 'admin@company.com or portal username'
                        : 'admin@company.com'
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <div>
                    <Input
                      label="Password"
                      labelClassName={labelUpper}
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-600"
                          disabled={loading}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                        </button>
                      }
                    />
                    <div className="mt-2 flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-[#0F766E] hover:text-[#0D5F57] hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  {activeTab === 'admin' && !tenantSlugFromHost ? (
                    <Input
                      label="Organisation ID"
                      labelClassName={labelUpper}
                      name="organizationId"
                      type="text"
                      placeholder="e.g. 4"
                      helpText="Required on localhost when not using your company subdomain (e.g. your-org.localhost:5173). Org admins can also sign in on the main URL with their organization email only."
                      value={organizationId}
                      onChange={(e) => setOrganisationId(e.target.value)}
                    />
                  ) : null}
                  {activeTab === 'admin' && tenantSlugFromHost ? (
                    <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                      Signing in to organization workspace:{' '}
                      <span className="font-semibold">{tenantSlugFromHost}</span>
                    </p>
                  ) : null}

                  {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    label="Sign In to Workspace"
                    variant="teal"
                    loading={loading}
                    disabled={loading}
                    className="w-full justify-center py-3.5 rounded-xl shadow-lg shadow-teal-700/20 text-base font-bold"
                  />

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <Link
                        to="/register"
                        className="font-semibold text-[#0F766E] hover:text-[#0D5F57] hover:underline"
                      >
                        Create an account
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-8">
                  <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">
                    Verification
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleVerify2FA} noValidate>
                  <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        disabled={loading}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="h-12 w-full text-center text-xl font-bold rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:outline-none transition-all sm:h-14"
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    label="Verify & Continue"
                    variant="teal"
                    loading={loading}
                    disabled={loading}
                    className="w-full justify-center py-3.5 rounded-xl shadow-lg shadow-teal-700/20 text-base font-bold"
                  />

                  <button
                    type="button"
                    onClick={() => setStage('login')}
                    disabled={loading}
                    className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <HiArrowLeft className="h-4 w-4" />
                    Back to Login
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>© 2026 HRIS. All rights reserved.</p>
            <div className="mt-2 flex justify-center gap-4">
              <a href="#privacy" className="hover:text-gray-700" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
              <a href="#terms" className="hover:text-gray-700" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
