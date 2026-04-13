import { useState } from 'react'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Toggle } from '../../../components/ui/Toggle.jsx'

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

  const [tenantModules, setTenantModules] = useState({
    visa: true,
    expenses: true,
    assetManagement: false,
    apiOverride: false,
  })

  const handleGlobalToggle = (module) => {
    setGlobalModules((prev) => ({ ...prev, [module]: !prev[module] }))
  }

  const handleTenantToggle = (module) => {
    setTenantModules((prev) => ({ ...prev, [module]: !prev[module] }))
  }

  const globalModuleList = [
    { key: 'employeeDirectory', name: 'Employee Directory', description: 'Core module — required' },
    { key: 'attendance', name: 'Attendance & Timesheet', description: 'All plans' },
    { key: 'leave', name: 'Leave Management', description: 'All plans' },
    { key: 'payroll', name: 'Payroll & Salary', description: 'Pro + Enterprise only' },
    { key: 'performance', name: 'Performance Management', description: 'Growth + above' },
    { key: 'onboardingExit', name: 'Onboarding & Exit', description: 'Growth + above' },
    { key: 'api', name: 'API Access', description: 'Enterprise only' },
  ]

  const tenantModuleList = [
    { key: 'visa', name: 'Visa & Nationality' },
    { key: 'expenses', name: 'Expenses' },
    { key: 'assetManagement', name: 'Asset Management' },
    { key: 'apiOverride', name: 'API Access (Override)' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Module Management</h1>
        <p className="mt-1 text-sm text-gray-600">Control which modules are available per plan and per tenant</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Global Module Availability */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Global Module Availability</h2>
          <div className="space-y-3">
            {globalModuleList.map((module) => (
              <div key={module.key} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{module.name}</div>
                  <div className="text-xs text-gray-500">{module.description}</div>
                </div>
                <Toggle checked={globalModules[module.key]} onChange={() => handleGlobalToggle(module.key)} />
              </div>
            ))}
          </div>
          <Button label="Save Module Config" variant="primary" className="mt-4" />
        </div>

        {/* Override for Specific Tenant */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold text-gray-900">Override for Specific Tenant</h2>
          <p className="mb-4 text-xs text-gray-500">Grant or restrict modules individually</p>
          <div className="mb-4">
            <label className="mb-1 block text-xs font-semibold text-gray-500">Select Tenant</label>
            <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20">
              <option>AlphaCorp HR</option>
              <option>TalentCo FZCO</option>
              <option>HR Nexus</option>
            </select>
          </div>
          <div className="space-y-2">
            {tenantModuleList.map((module) => (
              <div key={module.key} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-2.5">
                <span className="text-sm font-semibold text-gray-900">{module.name}</span>
                <Toggle checked={tenantModules[module.key]} onChange={() => handleTenantToggle(module.key)} />
              </div>
            ))}
          </div>
          <Button label="Apply Override" variant="primary" className="mt-4" />
        </div>
      </div>
    </div>
  )
}
