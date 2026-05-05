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
  HiQuestionMarkCircle,
  HiGlobeAlt,
  HiPhoto,
  HiDevicePhoneMobile,
  HiQrCode
} from 'react-icons/hi2'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Toggle } from '../../components/ui/Toggle.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Modal } from '../../components/ui/Modal.jsx'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')

  // Core Platform State
  const [platformName, setPlatformName] = useState('HRIS Cloud')
  const [supportEmail, setSupportEmail] = useState('support@hriscloud.io')
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  const [smtpHost, setSmtpHost] = useState('smtp.sendgrid.net')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpUsername, setSmtpUsername] = useState('apikey')
  const [smtpSecure, setSmtpSecure] = useState(true)

  const [stripeEnabled, setStripeEnabled] = useState(true)
  const [paypalEnabled, setPaypalEnabled] = useState(false)
  const [enforceMfa, setEnforceMfa] = useState(true)
  const [auditRetention, setAuditRetention] = useState('90')
  const [sessionTimeout, setSessionTimeout] = useState('60')
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [faStep, setFaStep] = useState(1) // 1: QR, 2: Verify

  const tabs = [
    {
      id: 'general',
      label: 'Platform Profile',
      icon: HiCog6Tooth,
    },
    {
      id: 'smtp',
      label: 'Mail Infrastructure',
      icon: HiServer,
    },
    {
      id: 'email',
      label: 'Event Notifications',
      icon: HiEnvelope,
    },
    {
      id: 'payment',
      label: 'Revenue & Billing',
      icon: HiCreditCard,
    },
    {
      id: 'security',
      label: 'Access Governance',
      icon: HiShieldCheck,
    },
  ]

  return (
    <div className="max-w-[1280px] mx-auto pb-24">
      {/* Refined Pro Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-100">
            <HiGlobeAlt className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Configuration</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Manage core infrastructure settings and global administrative policies.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Core Engine v2.5 Stable</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Navigation Sidebar - Clean & Sharp */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="space-y-6 sticky top-6">
            <nav className="space-y-1.5">
              {tabs.map((tab) => (
                <div key={tab.id} className="relative group">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900'
                      }`}
                  >
                    <tab.icon className={`h-4.5 w-4.5 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                </div>
              ))}
            </nav>

            <div className="p-6 rounded-[1.75rem] bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <HiInformationCircle className="h-4 w-4 text-blue-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Health</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">Security Index</span>
                  <span className="text-[11px] font-bold text-slate-900">98%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[98%] bg-emerald-500 rounded-full" />
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                  "Your platform configuration exceeds standard security benchmarks."
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Pane - Enterprise Grade */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-8 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">Module Management</p>
              </div>
              <Badge label="Operational" color="green" />
            </div>

            <div className="p-8 sm:p-12 min-h-[500px]">
              {/* General Section */}
              {activeTab === 'general' && (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label="Platform Display Name" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
                    <Input label="Core Support Email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 px-1 uppercase tracking-widest">Infrastructure Timezone</label>
                      <select className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all cursor-pointer appearance-none shadow-sm">
                        <option>UTC (Coordinated Universal Time)</option>
                        <option>GMT+5:30 (Mumbai, Kolkata)</option>
                        <option>EST (Eastern Standard Time)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-slate-100">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Logo Upload */}
                        <div className="space-y-4">
                           <div>
                              <h3 className="text-sm font-bold text-slate-900">Platform Identity Logo</h3>
                              <p className="text-xs text-slate-400 mt-1 font-medium italic">Global logo for all portals.</p>
                           </div>
                           <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/30 p-8 flex flex-col items-center justify-center transition-all hover:border-blue-500 hover:bg-white shadow-sm">
                              <img src="/HRIS_Logo.png" alt="Current Logo" className="h-14 w-auto object-contain mb-6 group-hover:scale-105 transition-transform" />
                              <div className="text-center">
                                 <p className="text-[10px] font-bold text-slate-900 mb-1">Update Brand Asset</p>
                                 <p className="text-[9px] text-slate-400">SVG, PNG (Max 2MB)</p>
                              </div>
                              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                           </div>
                        </div>

                        {/* Favicon Upload */}
                        <div className="space-y-4">
                           <div>
                              <h3 className="text-sm font-bold text-slate-900">System Favicon</h3>
                              <p className="text-xs text-slate-400 mt-1 font-medium italic">Icon for browser navigation tabs.</p>
                           </div>
                           <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/30 p-8 flex flex-col items-center justify-center transition-all hover:border-blue-500 hover:bg-white h-full shadow-sm">
                              <div className="h-12 w-12 rounded-lg bg-white shadow-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                 <img src="/HRIS_Logo.png" alt="Current Favicon" className="h-6 w-6 object-contain" />
                              </div>
                              <div className="text-center">
                                 <p className="text-[10px] font-bold text-slate-900 mb-1">Update Favicon</p>
                                 <p className="text-[9px] text-slate-400">ICO (32x32px)</p>
                              </div>
                              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="pt-10 border-t border-slate-100">
                    <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between shadow-sm">
                      <div className="flex gap-5">
                        <div className="h-12 w-12 rounded-xl bg-white border border-amber-100 flex items-center justify-center shrink-0">
                          <HiExclamationTriangle className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-amber-900">Platform Maintenance Mode</h4>
                          <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                            Globally restrict organization access during critical infrastructure updates.
                          </p>
                        </div>
                      </div>
                      <Toggle checked={maintenanceMode} onChange={setMaintenanceMode} />
                    </div>
                  </div>
                </div>
              )}

              {/* SMTP Section */}
              {activeTab === 'smtp' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Relay Host" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
                    <Input label="Secure Port" type="number" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
                    <Input label="Relay Username" value={smtpUsername} onChange={(e) => setSmtpUsername(e.target.value)} />
                    <Input label="Relay Password" type="password" value="********" />
                  </div>
                  <div className="flex items-center justify-between p-5 rounded-xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                      <HiSignal className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-bold text-slate-700">Enforce TLS Encryption Handshake</span>
                    </div>
                    <Toggle checked={smtpSecure} onChange={setSmtpSecure} />
                  </div>
                  <Button label="Execute Connection Test" variant="ghost" icon={HiArrowRightOnRectangle} className="w-fit px-8 rounded-xl font-bold" />
                </div>
              )}

              {/* Security Section */}
              {activeTab === 'security' && (
                <div className="space-y-12">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Access Governance</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between p-6 rounded-2xl bg-white border border-slate-100 shadow-sm group hover:border-blue-600 hover:ring-4 hover:ring-blue-600/5 transition-all">
                        <div className="flex gap-5">
                          <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <HiLockClosed className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Mandatory Multi-Factor Auth</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Require 2FA for all internal platform staff members.</p>
                          </div>
                        </div>
                        <Toggle checked={enforceMfa} onChange={setEnforceMfa} />
                      </div>

                      {/* Individual 2FA Setup */}
                      <div className="flex items-center justify-between p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 shadow-sm">
                        <div className="flex gap-5">
                          <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                            <HiDevicePhoneMobile className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Personal 2FA Configuration</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Secure your own account with a mobile authenticator app.</p>
                          </div>
                        </div>
                        <Button 
                          label="Configure Setup" 
                          variant="primary" 
                          size="sm" 
                          className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                          onClick={() => { setFaStep(1); setShow2FAModal(true); }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-100">
                    <Input label="Audit Trail Retention (Days)" type="number" value={auditRetention} onChange={(e) => setAuditRetention(e.target.value)} />
                    <Input label="Global Session Timeout (Min)" type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} />
                  </div>
                </div>
              )}

              {/* Payment Section */}
              {activeTab === 'payment' && (
                <div className="space-y-10">
                  <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">S</div>
                        <div>
                          <h3 className="font-bold text-slate-900 tracking-tight">Stripe Integration</h3>
                          <p className="text-xs text-slate-500 mt-1 font-medium">Primary credit card processing gateway.</p>
                        </div>
                      </div>
                      <Toggle checked={stripeEnabled} onChange={setStripeEnabled} />
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <Input label="Live Publishable Key" value="pk_live_************************" />
                      <Input label="Live Secret Key" type="password" value="sk_live_************************" />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeTab === 'email' && (
                <div className="space-y-6">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Automated Notifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: 'New Organization Signup', desc: 'Alert when a new organization joins.' },
                      { title: 'Billing Success', desc: 'Invoices sent after renewal.' },
                      { title: 'Security Alerts', desc: 'Login notifications for staff.' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-5 rounded-xl border border-slate-100 bg-white shadow-sm">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                        <Toggle checked={true} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Professional Footer */}
            <div className="px-8 py-5 bg-white/90 backdrop-blur-md border-t border-slate-100 flex justify-between items-center sticky bottom-0 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-3">
                <HiCheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">System Secure & Synchronized</span>
              </div>
              <div className="flex gap-3">
                <Button label="Cancel" variant="ghost" size="sm" className="font-bold text-slate-500" />
                <Button label="Save" variant="primary" size="sm" className="px-10 bg-slate-900 hover:bg-black rounded-xl" />
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* 2FA Configuration Modal */}
      <Modal 
        isOpen={show2FAModal} 
        onClose={() => setShow2FAModal(false)} 
        title="Secure Your Account"
        size="md"
      >
        <div className="p-2">
          {faStep === 1 ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <HiQrCode className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Scan QR Code</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                  Use <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, or <strong>Authy</strong> to scan this code.
                </p>
              </div>
              
              {/* Live Scannable QR Code */}
              <div className="mx-auto w-52 h-52 bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-2xl flex items-center justify-center relative group overflow-hidden">
                <img 
                   src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=otpauth://totp/HRIS:SuperAdmin?secret=B477H7S8L99S&issuer=HRIS" 
                   alt="Authenticator QR Code" 
                   className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-3">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Manual Setup Code</p>
                 <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 border-dashed max-w-[280px] mx-auto">
                    <code className="text-sm font-black text-slate-700 tracking-wider">B477 H7S8 L99S</code>
                    <button className="text-indigo-600 hover:text-indigo-700 text-xs font-bold px-2 py-1">Copy</button>
                 </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 text-[10px] text-slate-400 font-medium">
                <p>Don't have an app? Download one from your mobile app store to get started with secure logins.</p>
              </div>

              <div className="pt-4">
                <Button 
                  label="I've Scanned the Code" 
                  variant="primary" 
                  className="w-full py-4 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200" 
                  onClick={() => setFaStep(2)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <HiShieldCheck className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Verify Connection</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Enter the 6-digit code generated by your authenticator app to complete the setup.
                </p>
              </div>

              <div className="flex justify-center gap-2">
                {Array.from({length: 6}).map((_, i) => (
                  <input 
                    key={i}
                    type="text" 
                    maxLength={1}
                    className="w-12 h-14 bg-slate-50 border-2 border-transparent rounded-xl text-center text-xl font-bold text-slate-900 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                    placeholder="0"
                  />
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  label="Back" 
                  variant="ghost" 
                  className="flex-1 py-4 font-bold text-slate-400" 
                  onClick={() => setFaStep(1)}
                />
                <Button 
                  label="Finalize Setup" 
                  variant="primary" 
                  className="flex-[2] py-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100" 
                  onClick={() => {
                    alert('2FA successfully enabled for your account!');
                    setShow2FAModal(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
