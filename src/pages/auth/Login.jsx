import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { HiBuildingOffice2, HiCheckCircle, HiEye, HiEyeSlash, HiLockClosed, HiUser, HiArrowLeft } from 'react-icons/hi2'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ROLE_TABS = [
  { id: 'admin', label: 'Organization Admin', defaultEmail: 'admin@acme.com', defaultPassword: 'admin@acme.com', icon: HiBuildingOffice2 },
  { id: 'superadmin', label: 'Super Admin', defaultEmail: 'superadmin@hris.com', defaultPassword: 'SuperAdmin123', icon: HiLockClosed },
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
  const [email, setEmail] = useState('admin@acme.com')
  const [password, setPassword] = useState('admin@acme.com')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [stage, setStage] = useState('login') // 'login' | 'twoFactor'
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState(null)

  // Effect to navigate after user is set
  useEffect(() => {
    if (user) {
      const target = POST_LOGIN[user.role]
      if (target) navigate(target, { replace: true })
    }
  }, [user, navigate])

  // If already logged in, don't show the form to avoid flicker
  if (user) return null

  const handleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      const isSuperAdmin = activeTab === 'superadmin'
      const endpoint = isSuperAdmin ? '/superadmin/login' : '/auth/login'

      const response = await axios.post(`${API_URL}/api/v1${endpoint}`, {
        email,
        password
      })
      const result = response.data

      if (!result.success) {
        throw new Error(result.message || 'Login failed')
      }

      if (result.data.mfaRequired) {
        setUserId(result.data.userId)
        setStage('twoFactor')
        return
      }

      // Standard login success
      const userData = isSuperAdmin ? result.data.superadmin : result.data.user
      login(userData, result.data.token)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    setError('')
    setLoading(true)
    try {
      const fullOtp = otp.join('')
      const response = await axios.post(`${API_URL}/api/v1/superadmin/verify-2fa`, {
        userId,
        code: fullOtp
      })
      const result = response.data

      if (!result.success) {
        throw new Error(result.message || 'Verification failed')
      }

      login(result.data.superadmin, result.data.token)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Verification failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  // Effect to navigate after user is set
  useEffect(() => {
    if (user) {
      const target = POST_LOGIN[user.role]
      if (target) {
        setIsAutoLoggingIn(false)
        navigate(target, { replace: true })
      }
    }
  }, [user, navigate])

  return (
    <div className="flex min-h-screen min-h-[100dvh]">
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
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <HiBuildingOffice2 className="h-8 w-8 text-[#0F766E]" />
            <div className="font-display text-2xl font-bold text-[#0F766E]">HRIS</div>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-xl sm:p-10">
            {stage === 'login' ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-8">
                  <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">
                    Welcome back
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Sign in to your account to continue
                  </p>
                </div>

                <div className="space-y-5">
                  <Input
                    label="Email Address"
                    labelClassName={labelUpper}
                    name="email"
                    type="email"
                    placeholder="admin@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    icon={<HiUser className="h-5 w-5" />}
                  />

                  <div>
                    <div className="relative">
                      <Input
                        label="Password"
                        labelClassName={labelUpper}
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        icon={<HiLockClosed className="h-5 w-5" />}
                        suffix={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={loading}
                          >
                            {showPassword ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                          </button>
                        }
                      />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-[#0F766E] hover:text-[#0D5F57] hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Quick Login Roles</p>
                    <div className="grid grid-cols-3 gap-2">
                      {ROLE_TABS.map((tab) => {
                        const Icon = tab.icon
                        const active = activeTab === tab.id
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            disabled={loading}
                            onClick={() => {
                              setActiveTab(tab.id)
                              setEmail(tab.defaultEmail)
                              setPassword(tab.defaultPassword)
                            }}
                            className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 transition-all ${active
                                ? 'border-[#0F766E] bg-[#0F766E]/5 text-[#0F766E]'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-[10px] font-bold truncate w-full text-center">{tab.label}</span>
                          </button>
                        )
                      })}
                    </div>

                    <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Demo Credentials</span>
                        <span className="text-[10px] font-bold text-[#0F766E] uppercase">{activeTab.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400">Email</p>
                          <p className="text-xs font-mono font-medium text-gray-700 truncate">{email}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-gray-400">Password</p>
                          <p className="text-xs font-mono font-medium text-gray-700">{password}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    label={loading ? "Signing in..." : "Sign In to Workspace"}
                    variant="primary"
                    disabled={loading}
                    className="w-full justify-center py-4 rounded-xl shadow-xl shadow-emerald-600/20 text-lg font-bold"
                    onClick={handleSignIn}
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
                </div>
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

                <div className="space-y-6">
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        disabled={loading}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                      />
                    ))}
                  </div>

                  <Button
                    label={loading ? "Verifying..." : "Verify & Continue"}
                    variant="primary"
                    disabled={loading}
                    className="w-full justify-center py-4 rounded-xl shadow-xl shadow-emerald-600/20 text-lg font-bold"
                    onClick={handleVerify2FA}
                  />

                  <button
                    onClick={() => setStage('login')}
                    disabled={loading}
                    className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <HiArrowLeft className="h-4 w-4" />
                    Back to Login
                  </button>
                </div>
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
