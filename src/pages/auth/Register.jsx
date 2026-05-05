import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  HiBuildingOffice2, 
  HiCheckCircle, 
  HiArrowRight, 
  HiArrowLeft, 
  HiUser, 
  HiEnvelope, 
  HiLockClosed,
  HiBriefcase,
  HiGlobeAlt,
  HiExclamationCircle
} from 'react-icons/hi2'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'

const STEPS = [
  { id: 'company', label: 'Company Info', icon: HiBuildingOffice2 },
  { id: 'admin', label: 'Admin Details', icon: HiUser },
  { id: 'plan', label: 'Choose Plan', icon: HiCheckCircle },
]

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$49',
    period: '/mo',
    features: ['Up to 50 Employees', 'Core HR Features', 'Standard Support', '5GB Storage'],
    color: 'border-slate-200 hover:border-emerald-500'
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$99',
    period: '/mo',
    features: ['Up to 200 Employees', 'Advanced Analytics', 'Priority Support', '20GB Storage'],
    color: 'border-emerald-500 ring-1 ring-emerald-500',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Unlimited Employees', 'Full Suite Access', '24/7 Dedicated Support', 'Unlimited Storage'],
    color: 'border-slate-200 hover:border-emerald-500'
  }
]

const labelUpper = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500'

export default function Register() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    companyName: '',
    industry: 'tech',
    website: '',
    adminName: '',
    adminEmail: '',
    password: '',
    planId: 'growth'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateForm = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setLoading(true)
      setError('')
      try {
        const response = await fetch('http://localhost:5000/api/v1/public/onboarding/self', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        const result = await response.json()
        if (!result.success) {
          throw new Error(result.message || 'Registration failed')
        }
        navigate('/login', { state: { message: 'Registration successful! Please sign in.' } })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar - Steps Progress */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col bg-emerald-900 p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <HiBuildingOffice2 className="h-8 w-8 text-emerald-400" />
            <span className="text-xl font-bold font-display">HRIS Cloud</span>
          </div>

          <div className="space-y-8">
            {STEPS.map((step, idx) => {
              const Icon = step.icon
              const isCurrent = idx === currentStep
              const isPast = idx < currentStep
              return (
                <div key={step.id} className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                    isCurrent ? 'bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-400/20' : 
                    isPast ? 'bg-emerald-800 text-emerald-400' : 'bg-emerald-800/50 text-emerald-600'
                  }`}>
                    {isPast ? <HiCheckCircle className="h-6 w-6" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="pt-1">
                    <p className={`text-xs font-bold uppercase tracking-widest ${isCurrent ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      Step {idx + 1}
                    </p>
                    <p className={`text-sm font-semibold mt-0.5 ${isCurrent ? 'text-white' : 'text-emerald-100/50'}`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-20 pt-10 border-t border-white/10">
            <p className="text-sm text-emerald-200/70 italic leading-relaxed">
              "Join 500+ companies that have transformed their HR operations with our modern cloud platform."
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold font-display text-gray-900">
              {currentStep === 0 && "Let's start with your company"}
              {currentStep === 1 && "Who will be the administrator?"}
              {currentStep === 2 && "Choose your growth path"}
            </h1>
            <p className="mt-2 text-gray-500">
              {currentStep === 0 && "Tell us a bit about your organization to get started."}
              {currentStep === 1 && "Create the master account to manage your workspace."}
              {currentStep === 2 && "Select the plan that best fits your company size and needs."}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
            {currentStep === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Input 
                  label="Company Name" 
                  labelClassName={labelUpper}
                  name="companyName"
                  placeholder="e.g. Acme Corp"
                  value={formData.companyName}
                  onChange={updateForm}
                  className="sm:col-span-2"
                  suffix={<HiBuildingOffice2 className="h-4 w-4" />}
                />
                <Input 
                  label="Industry" 
                  type="select"
                  labelClassName={labelUpper}
                  name="industry"
                  placeholder="Select Industry"
                  options={[
                    { value: 'tech', label: 'Technology' },
                    { value: 'finance', label: 'Finance' },
                    { value: 'healthcare', label: 'Healthcare' },
                    { value: 'education', label: 'Education' },
                    { value: 'retail', label: 'Retail' },
                  ]}
                  value={formData.industry}
                  onChange={updateForm}
                />
                <Input 
                  label="Company Website" 
                  labelClassName={labelUpper}
                  name="website"
                  placeholder="www.example.com"
                  value={formData.website}
                  onChange={updateForm}
                  suffix={<HiGlobeAlt className="h-4 w-4" />}
                />
              </div>
            )}

            {currentStep === 1 && (
              <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Input 
                  label="Full Name" 
                  labelClassName={labelUpper}
                  name="adminName"
                  placeholder="John Doe"
                  value={formData.adminName}
                  onChange={updateForm}
                  suffix={<HiUser className="h-4 w-4" />}
                />
                <Input 
                  label="Work Email" 
                  labelClassName={labelUpper}
                  name="adminEmail"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.adminEmail}
                  onChange={updateForm}
                  suffix={<HiEnvelope className="h-4 w-4" />}
                />
                <Input 
                  label="Password" 
                  labelClassName={labelUpper}
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={updateForm}
                  suffix={<HiLockClosed className="h-4 w-4" />}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, planId: plan.id }))}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
                      formData.planId === plan.id ? plan.color : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
                        Most Popular
                      </span>
                    )}
                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-2 mb-4">
                      <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-xs text-gray-500">{plan.period}</span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[10px] text-gray-600">
                          <HiCheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600 animate-in fade-in zoom-in duration-300">
                <HiExclamationCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-10 flex items-center justify-between gap-4 border-t border-gray-50 pt-8">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className={`flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors ${
                  currentStep === 0 ? 'invisible' : 'visible'
                } disabled:opacity-50`}
              >
                <HiArrowLeft className="h-4 w-4" />
                Back
              </button>
              <Button 
                label={loading ? "Creating Account..." : currentStep === STEPS.length - 1 ? "Complete Registration" : "Continue"}
                variant="primary"
                disabled={loading}
                className="px-8 py-3 rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-70"
                onClick={handleNext}
                suffix={!loading && <HiArrowRight className="h-4 w-4" />}
              />
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
