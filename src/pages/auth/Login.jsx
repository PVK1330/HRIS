import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiCheckCircle, HiGlobeAlt } from 'react-icons/hi2'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const ROLE_TABS = [
  { id: 'admin', label: 'Admin', defaultEmail: 'admin@hris.com' },
  { id: 'hr', label: 'HR Manager', defaultEmail: 'hr@hris.com' },
  { id: 'employee', label: 'Employee', defaultEmail: 'employee@hris.com' },
  { id: 'superadmin', label: 'Super Admin', defaultEmail: 'super@hris.com' },
]

const POST_LOGIN = {
  admin: '/admin/dashboard',
  hr: '/hr/dashboard',
  employee: '/employee/dashboard',
  superadmin: '/superadmin/dashboard',
}

const labelUpper = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('admin')
  const [email, setEmail] = useState('admin@hris.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignIn = () => {
    setError('')
    const err = login(email, password, role)
    if (err) {
      setError(err)
      return
    }
    const target = POST_LOGIN[role]
    if (target) navigate(target, { replace: true })
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col overflow-y-auto bg-gray-100 py-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 sm:px-6">
        <div className="w-full rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <HiGlobeAlt className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" aria-hidden />
              <div className="font-display text-xl font-bold leading-none sm:text-2xl">
                <span className="text-primary">HRIS</span>
              </div>
            </div>
            <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary sm:text-xs">
              Human Resource Information System
            </p>
          </div>

          <h1 className="mt-6 text-center font-display text-xl font-bold text-primary sm:mt-8 sm:text-2xl">
            Sign in
          </h1>

          <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
            <Input
              label="Email"
              labelClassName={labelUpper}
              name="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              suffix={<HiCheckCircle className="h-5 w-5" aria-hidden />}
            />
            <div>
              <Input
                label="Password"
                labelClassName={labelUpper}
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="mt-2 text-right">
                <a
                  href="#forgot"
                  className="text-sm font-medium text-[#004CA5] hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-[#004CA5]">Login as</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ROLE_TABS.map((tab) => {
                  const active = role === tab.id
                  return (
                    <Button
                      key={tab.id}
                      label={tab.label}
                      variant={active ? 'primary' : 'outline'}
                      className={`w-full justify-center py-2.5 text-sm font-semibold ${
                        active ? '' : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setRole(tab.id)
                        setEmail(tab.defaultEmail)
                      }}
                    />
                  )
                })}
              </div>
            </div>

            {error && <p className="text-center text-sm text-red-600">{error}</p>}

            <Button
              label="Sign In"
              variant="primary"
              className="w-full justify-center py-3 text-base font-bold"
              onClick={handleSignIn}
            />

            <p className="text-center text-sm text-gray-600">
              Need access?{' '}
              <a
                href="#contact"
                className="font-semibold text-[#004CA5] hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                Contact IT
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
