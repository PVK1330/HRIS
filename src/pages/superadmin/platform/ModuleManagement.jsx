import { useState } from 'react'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Toggle } from '../../../components/ui/Toggle.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import {
  HiSquares2X2,
  HiUsers,
  HiClock,
  HiCalendarDays,
  HiBanknotes,
  HiChartBar,
  HiUserPlus,
  HiCommandLine,
  HiGlobeAlt,
  HiQuestionMarkCircle,
  HiCheckBadge,
  HiShieldCheck,
  HiWrenchScrewdriver
} from 'react-icons/hi2'

export default function ModuleManagement() {
  const [globalModules, setGlobalModules] = useState({
    employeeDirectory: true,
    attendance: true,
    leave: true,
    payroll: true,
    performance: true,
    onboardingExit: true,
    api: true,
  })

  const [orgModules, setOrgModules] = useState({
    visa: true,
    expenses: true,
    assetManagement: false,
    apiOverride: false,
  })

  const handleGlobalToggle = (module) => {
    setGlobalModules((prev) => ({ ...prev, [module]: !prev[module] }))
  }

  const handleOrgToggle = (module) => {
    setOrgModules((prev) => ({ ...prev, [module]: !prev[module] }))
  }

  const globalModuleList = [
    { key: 'employeeDirectory', name: 'Employee Directory', description: 'Core human resource directory and profile management.', icon: HiUsers, tier: 'Essential' },
    { key: 'attendance', name: 'Attendance & Timesheet', description: 'Real-time clock-in/out and automated timesheet generation.', icon: HiClock, tier: 'Essential' },
    { key: 'leave', name: 'Leave Management', description: 'Policy-based leave requests and approval workflows.', icon: HiCalendarDays, tier: 'Essential' },
    { key: 'payroll', name: 'Payroll & Salary', description: 'Automated salary calculation and pay slip generation.', icon: HiBanknotes, tier: 'Advanced' },
    { key: 'performance', name: 'Performance Management', description: 'KPI tracking, appraisal cycles, and feedback loops.', icon: HiChartBar, tier: 'Strategic' },
    { key: 'onboardingExit', name: 'Onboarding & Exit', description: 'Structured workflows for employee lifecycle transitions.', icon: HiUserPlus, tier: 'Strategic' },
    { key: 'api', name: 'Advanced API access', description: 'Secure GraphQL/REST endpoints for third-party integration.', icon: HiCommandLine, tier: 'Enterprise' },
  ]

  const orgModuleList = [
    { key: 'visa', name: 'Visa & Nationality', icon: HiGlobeAlt },
    { key: 'expenses', name: 'Expense Management', icon: HiBanknotes },
    { key: 'assetManagement', name: 'Asset Inventory', icon: HiSquares2X2 },
    { key: 'apiOverride', name: 'Infrastructure API Override', icon: HiWrenchScrewdriver },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <HiSquares2X2 className="h-6 w-6" />
             </div>
             <h1 className="text-xl font-bold text-slate-900 tracking-tight">Modules</h1>
             <div className="group relative">
                <HiQuestionMarkCircle className="h-5 w-5 text-slate-300 cursor-help hover:text-blue-500 transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-4 bg-slate-900 text-white text-[11px] leading-relaxed rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-2xl border border-white/10">
                   <p className="font-bold text-blue-400 mb-1 uppercase tracking-widest">Features</p>
                   Enable or disable specific features globally for all organizations.
                   <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
             </div>
          </div>
          <p className="mt-2 text-sm font-medium text-slate-500">Manage global platform features and company-specific overrides.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
           <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
           <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Global Sync Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Global Module Availability */}
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                  <HiCheckBadge className="h-6 w-6" />
               </div>
               <h2 className="text-lg font-bold text-slate-900 tracking-tight">Global Availability</h2>
            </div>
            <Badge label="Platform Wide" color="indigo" variant="glass" />
          </div>
          
          <div className="space-y-4">
            {globalModuleList.map((module) => {
              const Icon = module.icon
              return (
                <div key={module.key} className="flex items-center justify-between rounded-3xl border border-slate-50 bg-slate-50/50 p-5 group hover:bg-white hover:shadow-xl transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${globalModules[module.key] ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 tracking-tight">{module.name}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md ${
                          module.tier === 'Essential' ? 'bg-emerald-50 text-emerald-600' : 
                          module.tier === 'Strategic' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {module.tier}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-400 mt-0.5 leading-relaxed">{module.description}</div>
                    </div>
                  </div>
                  <Toggle checked={globalModules[module.key]} onChange={() => handleGlobalToggle(module.key)} />
                </div>
              )
            })}
          </div>
          <Button label="Save" variant="primary" className="w-full mt-8 py-4 shadow-lg shadow-blue-200" />
        </div>

        {/* Override Section */}
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                  <HiShieldCheck className="h-6 w-6" />
               </div>
               <h2 className="text-lg font-bold text-slate-900 tracking-tight">Org Overrides</h2>
            </div>
            <div className="group relative">
               <HiQuestionMarkCircle className="h-5 w-5 text-slate-300" />
               <div className="absolute right-0 bottom-full mb-3 w-56 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  Apply instance-specific feature sets that override global availability.
               </div>
            </div>
          </div>

          <div className="mb-8 space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Target Organization</label>
            <select className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all appearance-none shadow-sm cursor-pointer">
              <option>AlphaCorp HR (Enterprise)</option>
              <option>TalentCo FZCO (Pro)</option>
              <option>HR Nexus (Growth)</option>
            </select>
          </div>

          <div className="space-y-4">
            {orgModuleList.map((module) => {
              const Icon = module.icon
              return (
                <div key={module.key} className="flex items-center justify-between rounded-3xl border border-slate-50 bg-slate-50/50 p-5 group hover:bg-white hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shadow-sm ${orgModules[module.key] ? 'bg-white text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 tracking-tight">{module.name}</span>
                  </div>
                  <Toggle checked={orgModules[module.key]} onChange={() => handleOrgToggle(module.key)} />
                </div>
              )
            })}
          </div>
          <Button label="Save Changes" variant="primary" size="sm" className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 border-none" />
        </div>
      </div>
    </div>
  )
}
