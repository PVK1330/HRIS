import { useState } from 'react'
import {
  HiCog6Tooth,
  HiServer,
  HiEnvelope,
  HiCreditCard,
  HiShieldCheck,
  HiExclamationTriangle,
  HiArrowRightOnRectangle,
  HiCheckCircle,
  HiInformationCircle,
  HiLockClosed,
  HiSignal,
  HiGlobeAlt,
  HiPhoto,
  HiDevicePhoneMobile,
  HiQrCode,
  HiChevronRight,
  HiCurrencyDollar,
  HiWrenchScrewdriver,
} from 'react-icons/hi2'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Toggle } from '../../components/ui/Toggle.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Modal } from '../../components/ui/Modal.jsx'

// ── Navigation Data ────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'GENERAL',
    items: [
      { id: 'general', label: 'General Settings', icon: HiCog6Tooth },
      { id: 'company', label: 'Company Details', icon: HiInformationCircle },
      { id: 'domain', label: 'Domain Settings', icon: HiGlobeAlt },
      { id: 'logo', label: 'Logo', icon: HiPhoto },
    ],
  },
  {
    label: 'SECURITY',
    items: [
      { id: 'security', label: 'Account Settings', icon: HiShieldCheck },
      { id: 'recaptcha', label: 'reCAPTCHA', icon: HiExclamationTriangle },
    ],
  },
  {
    label: 'BILLING',
    items: [
      { id: 'currency', label: 'Currency', icon: HiCurrencyDollar },
      { id: 'trial', label: 'Free Trial', icon: HiCheckCircle },
      { id: 'gateways', label: 'Payment Gateways', icon: HiCreditCard },
    ],
  },
  {
    label: 'INTEGRATIONS',
    items: [
      { id: 'email-templates', label: 'Email Templates', icon: HiEnvelope },
      { id: 'email-settings', label: 'Email Settings', icon: HiServer },
      { id: 'whatsapp', label: 'WhatsApp Settings', icon: HiDevicePhoneMobile },
      { id: 'google-login', label: 'Google Login', icon: HiGlobeAlt },
    ],
  },
]

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items)

// ── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, onSelect }) {
  return (
    <aside className="w-full lg:w-80 shrink-0">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label}>
            {gi > 0 && <div className="h-px bg-slate-200 mx-4" />}
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 pt-4 pb-1">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={[
                    'flex items-center justify-between w-full h-14 px-4',
                    'transition-all duration-200 cursor-pointer',
                    'hover:bg-slate-50 hover:translate-x-[2px]',
                    active
                      ? 'bg-teal-50 border-l-[3px] border-teal-500 text-teal-700'
                      : 'bg-white text-slate-600 border-l-[3px] border-transparent',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-5 w-5 shrink-0 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span className={`text-sm ${active ? 'font-semibold text-teal-700' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </div>
                  <HiChevronRight
                    className={`h-4 w-4 shrink-0 transition-transform ${active ? 'text-teal-500 translate-x-0.5' : 'text-slate-300'}`}
                  />
                </button>
              )
            })}
          </div>
        ))}
        <div className="h-3" />
      </div>
    </aside>
  )
}

// ── Content Panels ─────────────────────────────────────────────────────────────
function GeneralPanel({ platformName, setPlatformName, supportEmail, setSupportEmail, maintenanceMode, setMaintenanceMode }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input label="Platform Display Name" value={platformName} onChange={(e) => setPlatformName(e.target.value)}/>
        <Input label="Core Support Email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Timezone</label>
          <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all cursor-pointer appearance-none shadow-sm">
            <option>UTC (Coordinated Universal Time)</option>
            <option>GMT+5:30 (Mumbai, Kolkata)</option>
            <option>EST (Eastern Standard Time)</option>
          </select>
        </div>
      </div>
      <div className="pt-6 border-t border-slate-100">
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white border border-amber-100 flex items-center justify-center shrink-0">
              <HiExclamationTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Maintenance Mode</p>
              <p className="text-xs text-amber-600 mt-0.5">Restrict all org access during platform updates.</p>
            </div>
          </div>
          <Toggle checked={maintenanceMode} onChange={setMaintenanceMode} />
        </div>
      </div>
    </div>
  )
}

function CompanyPanel() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <Input label="Company Name" defaultValue="Elitepic Technologies" />
      <Input label="Registration Number" defaultValue="REG-2024-001" />
      <Input label="Contact Phone" defaultValue="+91 98765 43210" />
      <Input label="Company Address" defaultValue="Mumbai, Maharashtra, India" />
    </div>
  )
}

function DomainPanel() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input label="Primary Domain" defaultValue="hriscloud.io" />
        <Input label="Custom Domain" defaultValue="app.elitepic.com" />
      </div>
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-700">
        <p className="font-semibold mb-1">DNS Verification Required</p>
        <p className="text-xs text-blue-600">Add a CNAME record pointing to <code className="bg-blue-100 px-1 rounded">verify.hriscloud.io</code> to activate your custom domain.</p>
      </div>
    </div>
  )
}

function LogoPanel() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Platform Logo</h3>
          <p className="text-xs text-slate-400 mt-0.5">PNG or JPG — max 2 MB</p>
        </div>
        <div className="relative group rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 flex flex-col items-center justify-center transition-all hover:border-teal-400 hover:bg-white cursor-pointer">
          <img src="/HRIS_Logo.png" alt="Logo" className="h-12 w-auto object-contain mb-4 group-hover:scale-105 transition-transform" />
          <p className="text-[11px] font-bold text-slate-500">Click to upload</p>
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Favicon</h3>
          <p className="text-xs text-slate-400 mt-0.5">ICO — 32×32 px</p>
        </div>
        <div className="relative group rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 flex flex-col items-center justify-center transition-all hover:border-teal-400 hover:bg-white cursor-pointer">
          <div className="h-10 w-10 rounded-lg bg-white shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <img src="/HRIS_Logo.png" alt="Favicon" className="h-6 w-6 object-contain" />
          </div>
          <p className="text-[11px] font-bold text-slate-500">Click to upload</p>
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
      </div>
    </div>
  )
}

function SecurityPanel({ enforceMfa, setEnforceMfa, auditRetention, setAuditRetention, sessionTimeout, setSessionTimeout, onOpen2FA }) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Controls</h3>
        <div className="flex items-center justify-between p-5 rounded-xl border border-slate-100 bg-white shadow-sm group hover:border-teal-200 hover:ring-4 hover:ring-teal-500/5 transition-all">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-all">
              <HiLockClosed className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Mandatory 2FA for All Staff</p>
              <p className="text-xs text-slate-500 mt-0.5">Require multi-factor auth for all admin users.</p>
            </div>
          </div>
          <Toggle checked={enforceMfa} onChange={setEnforceMfa} />
        </div>
        <div className="flex items-center justify-between p-5 rounded-xl border border-indigo-100 bg-indigo-50/50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm">
              <HiDevicePhoneMobile className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Personal 2FA Setup</p>
              <p className="text-xs text-slate-500 mt-0.5">Set up an authenticator app for your own account.</p>
            </div>
          </div>
          <Button label="Configure" variant="primary" size="sm" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shrink-0" onClick={onOpen2FA} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
        <Input label="Audit Retention (Days)" type="number" value={auditRetention} onChange={(e) => setAuditRetention(e.target.value)} />
        <Input label="Session Timeout (Minutes)" type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} />
      </div>
    </div>
  )
}

function RecaptchaPanel() {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
        Protect your login and registration forms with Google reCAPTCHA v3.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input label="Site Key" defaultValue="6Lc_XXXXXXXXXXXXXXXXXXXX" />
        <Input label="Secret Key" type="password" defaultValue="6Lc_SECRET_XXXXXXXXXXXX" />
      </div>
      <div className="flex items-center justify-between p-5 rounded-xl border border-slate-100 bg-white shadow-sm">
        <div>
          <p className="text-sm font-bold text-slate-900">Enable reCAPTCHA</p>
          <p className="text-xs text-slate-500 mt-0.5">Adds bot protection on public-facing forms.</p>
        </div>
        <Toggle checked={true} />
      </div>
    </div>
  )
}

function CurrencyPanel() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Default Currency</label>
        <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all appearance-none shadow-sm">
          <option>USD – US Dollar</option>
          <option>INR – Indian Rupee</option>
          <option>EUR – Euro</option>
          <option>GBP – British Pound</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Symbol Position</label>
        <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all appearance-none shadow-sm">
          <option>Before amount (e.g. $100)</option>
          <option>After amount (e.g. 100$)</option>
        </select>
      </div>
    </div>
  )
}

function TrialPanel() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input label="Trial Duration (Days)" type="number" defaultValue="14" />
        <Input label="Max Trial Organizations" type="number" defaultValue="500" />
      </div>
      <div className="flex items-center justify-between p-5 rounded-xl border border-slate-100 bg-white shadow-sm">
        <div>
          <p className="text-sm font-bold text-slate-900">Enable Free Trial</p>
          <p className="text-xs text-slate-500 mt-0.5">Allow new orgs to start without a payment method.</p>
        </div>
        <Toggle checked={true} />
      </div>
    </div>
  )
}

function GatewaysPanel({ stripeEnabled, setStripeEnabled }) {
  return (
    <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg">S</div>
          <div>
            <h3 className="font-bold text-slate-900">Stripe</h3>
            <p className="text-xs text-slate-500">Primary card processing gateway</p>
          </div>
        </div>
        <Toggle checked={stripeEnabled} onChange={setStripeEnabled} />
      </div>
      <div className="grid grid-cols-1 gap-5">
        <Input label="Live Publishable Key" defaultValue="pk_live_************************" />
        <Input label="Live Secret Key" type="password" defaultValue="sk_live_************************" />
      </div>
    </div>
  )
}

function EmailTemplatesPanel() {
  const templates = [
    { title: 'Welcome Email', desc: 'Sent when a new user is invited.' },
    { title: 'Password Reset', desc: 'Triggered on forgot-password requests.' },
    { title: 'Invoice Receipt', desc: 'Sent after successful billing.' },
    { title: 'Security Alert', desc: 'Sent on suspicious login activity.' },
  ]
  return (
    <div className="space-y-3">
      {templates.map((t, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-teal-200 transition-all cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-teal-50 flex items-center justify-center">
              <HiEnvelope className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{t.title}</p>
              <p className="text-xs text-slate-400">{t.desc}</p>
            </div>
          </div>
          <HiChevronRight className="h-4 w-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
        </div>
      ))}
    </div>
  )
}

function EmailSettingsPanel({ smtpHost, setSmtpHost, smtpPort, setSmtpPort, smtpUsername, setSmtpUsername, smtpSecure, setSmtpSecure }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input label="SMTP Host" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
        <Input label="SMTP Port" type="number" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
        <Input label="Username" value={smtpUsername} onChange={(e) => setSmtpUsername(e.target.value)} />
        <Input label="Password" type="password" defaultValue="••••••••••••" />
      </div>
      <div className="flex items-center justify-between p-5 rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <HiSignal className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-bold text-slate-700">Enforce TLS Encryption</span>
        </div>
        <Toggle checked={smtpSecure} onChange={setSmtpSecure} />
      </div>
      <Button label="Test Connection" variant="ghost" icon={HiArrowRightOnRectangle} className="w-fit px-8 rounded-xl font-bold" />
    </div>
  )
}

function WhatsAppPanel() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input label="Business Account ID" defaultValue="123456789012345" />
        <Input label="Phone Number ID" defaultValue="987654321098765" />
        <Input label="Access Token" type="password" defaultValue="EAABwzLixnjYBO..." />
        <Input label="Webhook Verify Token" defaultValue="my_verify_token" />
      </div>
      <div className="flex items-center justify-between p-5 rounded-xl border border-slate-100 bg-white shadow-sm">
        <div>
          <p className="text-sm font-bold text-slate-900">Enable WhatsApp Notifications</p>
          <p className="text-xs text-slate-500 mt-0.5">Send alerts via WhatsApp Business API.</p>
        </div>
        <Toggle checked={false} />
      </div>
    </div>
  )
}

function GoogleLoginPanel() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input label="Google Client ID" defaultValue="XXXXXXXX.apps.googleusercontent.com" />
        <Input label="Google Client Secret" type="password" defaultValue="GOCSPX-XXXXXXXXXX" />
      </div>
      <div className="flex items-center justify-between p-5 rounded-xl border border-slate-100 bg-white shadow-sm">
        <div>
          <p className="text-sm font-bold text-slate-900">Enable Google OAuth Login</p>
          <p className="text-xs text-slate-500 mt-0.5">Allow users to sign in with their Google account.</p>
        </div>
        <Toggle checked={true} />
      </div>
    </div>
  )
}

function PlaceholderPanel({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <HiWrenchScrewdriver className="h-7 w-7 text-slate-400" />
      </div>
      <p className="text-sm font-bold text-slate-600">{label}</p>
      <p className="text-xs text-slate-400 mt-1">Configuration options coming soon.</p>
    </div>
  )
}

// ── 2FA Modal ──────────────────────────────────────────────────────────────────
function TwoFAModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1)

  const handleClose = () => {
    setStep(1)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Secure Your Account" size="md">
      <div className="p-2">
        {step === 1 ? (
          <div className="space-y-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <HiQrCode className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Scan QR Code</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed max-w-xs mx-auto">
                Use <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, or <strong>Authy</strong>.
              </p>
            </div>
            <div className="mx-auto w-48 h-48 bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-xl flex items-center justify-center">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/HRIS:SuperAdmin?secret=B477H7S8L99S&issuer=HRIS"
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Manual Code</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <code className="text-sm font-black text-slate-700 tracking-wider">B477 H7S8 L99S</code>
                <button
                  className="text-indigo-600 hover:text-indigo-700 text-xs font-bold"
                  onClick={() => navigator.clipboard?.writeText('B477H7S8L99S')}
                >Copy</button>
              </div>
            </div>
            <Button
              label="I've Scanned the Code →"
              variant="primary"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-2xl"
              onClick={() => setStep(2)}
            />
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <HiShieldCheck className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Verify the Code</h3>
              <p className="text-sm text-slate-500 mt-1">Enter the 6-digit code from your authenticator app.</p>
            </div>
            <div className="flex justify-center gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  placeholder="0"
                  className="w-11 h-14 bg-slate-50 border-2 border-transparent rounded-xl text-center text-xl font-bold text-slate-900 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                />
              ))}
            </div>
            <div className="flex gap-3">
              <Button label="Back" variant="ghost" className="flex-1 font-bold text-slate-400" onClick={() => setStep(1)} />
              <Button
                label="Verify & Enable"
                variant="primary"
                className="flex-[2] bg-indigo-600 hover:bg-indigo-700 rounded-2xl"
                onClick={() => { alert('2FA enabled successfully!'); handleClose() }}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const [show2FA, setShow2FA] = useState(false)

  // State
  const [platformName, setPlatformName] = useState('HRIS Cloud')
  const [supportEmail, setSupportEmail] = useState('support@hriscloud.io')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [smtpHost, setSmtpHost] = useState('smtp.sendgrid.net')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpUsername, setSmtpUsername] = useState('apikey')
  const [smtpSecure, setSmtpSecure] = useState(true)
  const [stripeEnabled, setStripeEnabled] = useState(true)
  const [enforceMfa, setEnforceMfa] = useState(true)
  const [auditRetention, setAuditRetention] = useState('90')
  const [sessionTimeout, setSessionTimeout] = useState('60')

  const currentItem = ALL_ITEMS.find((i) => i.id === activeTab)

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return <GeneralPanel {...{ platformName, setPlatformName, supportEmail, setSupportEmail, maintenanceMode, setMaintenanceMode }} />
      case 'company': return <CompanyPanel />
      case 'domain': return <DomainPanel />
      case 'logo': return <LogoPanel />
      case 'security': return <SecurityPanel {...{ enforceMfa, setEnforceMfa, auditRetention, setAuditRetention, sessionTimeout, setSessionTimeout, onOpen2FA: () => setShow2FA(true) }} />
      case 'recaptcha': return <RecaptchaPanel />
      case 'currency': return <CurrencyPanel />
      case 'trial': return <TrialPanel />
      case 'gateways': return <GatewaysPanel {...{ stripeEnabled, setStripeEnabled }} />
      case 'email-templates': return <EmailTemplatesPanel />
      case 'email-settings': return <EmailSettingsPanel {...{ smtpHost, setSmtpHost, smtpPort, setSmtpPort, smtpUsername, setSmtpUsername, smtpSecure, setSmtpSecure }} />
      case 'whatsapp': return <WhatsAppPanel />
      case 'google-login': return <GoogleLoginPanel />
      default: return <PlaceholderPanel label={currentItem?.label ?? 'Settings'} />
    }
  }

  return (
    <div className="max-w-[1280px] mx-auto pb-24">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-100 shrink-0">
            <HiCog6Tooth className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage platform configuration and preferences.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm self-start sm:self-auto">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">All Systems Normal</span>
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        <Sidebar activeTab={activeTab} onSelect={setActiveTab} />

        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Panel Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                {currentItem && (
                  <div className="h-9 w-9 rounded-xl bg-teal-50 flex items-center justify-center">
                    <currentItem.icon className="h-5 w-5 text-teal-600" />
                  </div>
                )}
                <div>
                  <h2 className="text-base font-bold text-slate-900">{currentItem?.label}</h2>
                  <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider">Configuration</p>
                </div>
              </div>
              <Badge label="Active" color="green" />
            </div>

            {/* Panel Body */}
            <div className="p-6 sm:p-8 min-h-[420px]">
              {renderContent()}
            </div>

            {/* Sticky Footer */}
            <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between sticky bottom-0 z-10 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2">
                <HiCheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Saved & Synchronized</span>
              </div>
              <div className="flex gap-3">
                <Button label="Cancel" variant="ghost" size="sm" className="font-semibold text-slate-400" />
                <Button label="Save Changes" variant="primary" size="sm" className="px-6 bg-teal-600 hover:bg-teal-700 rounded-xl" />
              </div>
            </div>
          </div>
        </main>
      </div>

      <TwoFAModal isOpen={show2FA} onClose={() => setShow2FA(false)} />
    </div>
  )
}
