import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiBuildingOffice2, HiCheckCircle, HiEye, HiEyeSlash, HiLockClosed, HiUser } from 'react-icons/hi2'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const ROLE_TABS = [
  { id: 'admin', label: 'HR Admin', defaultEmail: 'hr_admin@hris.com', defaultPassword: 'hradmin123', icon: HiBuildingOffice2 },
  { id: 'hr_exec', label: 'HR Exec', defaultEmail: 'hr_exec@hris.com', defaultPassword: 'hrexec123', icon: HiUser },
  { id: 'manager', label: 'Manager', defaultEmail: 'manager@hris.com', defaultPassword: 'manager123', icon: HiUser },
  { id: 'employee', label: 'Employee', defaultEmail: 'employee@hris.com', defaultPassword: 'employee123', icon: HiUser },
  { id: 'superadmin', label: 'Super Admin', defaultEmail: 'super@hris.com', defaultPassword: 'super123', icon: HiLockClosed },
]

const POST_LOGIN = {
  admin: '/admin/dashboard',
  hr_admin: '/admin/dashboard',
  hr_executive: '/admin/dashboard',
  manager: '/admin/dashboard',
  employee: '/admin/dashboard',
  super_admin: '/superadmin/dashboard',
  support_admin: '/superadmin/dashboard',
  billing_admin: '/superadmin/dashboard',
}

const labelUpper = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('admin')
  const [email, setEmail] = useState('hr_admin@hris.com')
  const [password, setPassword] = useState('hradmin123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = () => {
    setError('')
    const err = login(email, password)
    if (err) {
      setError(err)
      return
    }
    // Note: The user state might not be updated immediately after login call
    // but the login call itself should return the account or we can look it up
  }

  // Effect to navigate after user is set
  useEffect(() => {
    if (user) {
      const target = POST_LOGIN[user.role]
      if (target) navigate(target, { replace: true })
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
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                suffix={<HiCheckCircle className="h-5 w-5 text-gray-400" aria-hidden />}
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="mt-2 flex justify-end">
                  <a
                    href="#forgot"
                    className="text-sm font-medium text-[#0F766E] hover:text-[#0D5F57] hover:underline"
                    onClick={(e) => e.preventDefault()}
                  >
                    Forgot password?
                  </a>
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
                        onClick={() => {
                          setActiveTab(tab.id)
                          setEmail(tab.defaultEmail)
                          setPassword(tab.defaultPassword)
                        }}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 transition-all ${
                          active
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
                
                {/* Credential Hint */}
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
                label="Sign In"
                variant="primary"
                className="w-full justify-center py-3 text-base font-semibold"
                onClick={handleSignIn}
              />

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <a
                    href="#contact"
                    className="font-semibold text-[#0F766E] hover:text-[#0D5F57] hover:underline"
                    onClick={(e) => e.preventDefault()}
                  >
                    Contact IT Support
                  </a>
                </p>
              </div>
            </div>
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
