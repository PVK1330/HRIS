import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Button } from '../../../components/ui/Button.jsx'
import { Toggle } from '../../../components/ui/Toggle.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import { superadminService } from '../../../services/superadminService'
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
  HiWrenchScrewdriver,
  HiBuildingOffice2,
  HiSparkles,
  HiInformationCircle
} from 'react-icons/hi2'

export default function ModuleManagement() {
  const [globalModules, setGlobalModules] = useState({})
  const [orgModules, setOrgModules] = useState({})
  const [globalModuleList, setGlobalModuleList] = useState([])
  const [orgModuleList, setOrgModuleList] = useState([])
  const [tenants, setTenants] = useState([])
  const [selectedTenantId, setSelectedTenantId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTenantLoading, setIsTenantLoading] = useState(false)

  const iconByModuleKey = {
    employee_directory: HiUsers,
    attendance: HiClock,
    leave: HiCalendarDays,
    payroll: HiBanknotes,
    performance: HiChartBar,
    onboarding_exit: HiUserPlus,
    api: HiCommandLine,
    visa: HiGlobeAlt,
    expenses: HiBanknotes,
    asset_management: HiSquares2X2,
    api_override: HiWrenchScrewdriver,
  }

  const fetchGlobalModules = async () => {
    try {
      setIsLoading(true)
      const response = await superadminService.getModules()
      const modules = response?.data?.data?.modules || []
      const globals = modules.filter((m) => m.scope === 'global')
      
      setGlobalModuleList(globals.map((m) => ({
        key: m.module_key,
        name: m.module_name,
        description: m.description,
        icon: iconByModuleKey[m.module_key] || HiSquares2X2,
        tier: m.tier || 'Standard',
      })))
      setGlobalModules(Object.fromEntries(globals.map((m) => [m.module_key, Boolean(m.is_enabled)])))
    } catch (error) {
      console.error('Failed to load global modules:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTenants = async () => {
    try {
      const response = await superadminService.getTenants()
      const list = response?.data?.data?.tenants || []
      setTenants(list)
      if (list.length > 0) {
        setSelectedTenantId(list[0].id)
      }
    } catch (error) {
      console.error('Failed to load tenants:', error)
    }
  }

  const fetchTenantModules = async (tenantId) => {
    if (!tenantId) return
    try {
      setIsTenantLoading(true)
      const response = await superadminService.getTenantModules(tenantId)
      const modules = response?.data?.data?.modules || []
      
      setOrgModuleList(modules.map((m) => ({
        key: m.module_key,
        name: m.module_name,
        icon: iconByModuleKey[m.module_key] || HiSquares2X2,
        isOverridden: m.is_overridden
      })))
      setOrgModules(Object.fromEntries(modules.map((m) => [m.module_key, Boolean(m.is_enabled)])))
    } catch (error) {
      console.error('Failed to load tenant modules:', error)
    } finally {
      setIsTenantLoading(false)
    }
  }

  useEffect(() => {
    fetchGlobalModules()
    fetchTenants()
  }, [])

  useEffect(() => {
    if (selectedTenantId) {
      fetchTenantModules(selectedTenantId)
    }
  }, [selectedTenantId])

  const handleGlobalToggle = async (moduleKey) => {
    const next = !globalModules[moduleKey]
    try {
      await superadminService.updateModule(moduleKey, { isEnabled: next })
      setGlobalModules((prev) => ({ ...prev, [moduleKey]: next }))
      Swal.fire({
        icon: 'success',
        title: 'Global Update',
        text: `Module ${next ? 'enabled' : 'disabled'} for all organizations.`,
        timer: 1200,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Failed to update global module:', error)
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Failed to update module.',
        confirmButtonColor: '#0F766E',
      })
    }
  }

  const handleTenantToggle = async (moduleKey) => {
    if (!selectedTenantId) return
    const next = !orgModules[moduleKey]
    try {
      await superadminService.updateTenantModule(selectedTenantId, moduleKey, { isEnabled: next })
      setOrgModules((prev) => ({ ...prev, [moduleKey]: next }))
      
      // Update the overridden status locally
      setOrgModuleList(prev => prev.map(m => m.key === moduleKey ? { ...m, isOverridden: true } : m))

      Swal.fire({
        icon: 'success',
        title: 'Organization Override',
        text: `Feature ${next ? 'enabled' : 'disabled'} for selected organization.`,
        timer: 1200,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Failed to update tenant module:', error)
      Swal.fire({
        icon: 'error',
        title: 'Override Failed',
        text: error.response?.data?.message || 'Failed to apply override.',
        confirmButtonColor: '#0F766E',
      })
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                <HiSquares2X2 className="h-6 w-6" />
             </div>
             <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Modules</h1>
             <div className="group relative">
                <HiQuestionMarkCircle className="h-5 w-5 text-slate-300 cursor-help hover:text-slate-900 transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-4 bg-slate-900 text-white text-[11px] leading-relaxed rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-2xl border border-white/10">
                   <p className="font-bold text-emerald-400 mb-1 uppercase tracking-widest">Module Governance</p>
                   Control feature availability across the entire platform or for specific organizations.
                   <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
             </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Manage global feature sets and tenant-specific overrides.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Real-time Sync Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Global Module Governance */}
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100 shadow-sm">
                  <HiCheckBadge className="h-7 w-7" />
               </div>
               <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Global Availability</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Platform-wide Default settings</p>
               </div>
            </div>
            <Badge label="Master Control" color="gray" variant="glass" className="text-[9px] px-3" />
          </div>
          
          <div className="space-y-4">
            {globalModuleList.map((module) => {
              const Icon = module.icon
              const isEnabled = globalModules[module.key]
              return (
                <div key={module.key} className="flex items-center justify-between rounded-3xl border border-slate-50 bg-slate-50/50 p-6 group hover:bg-white hover:shadow-xl transition-all">
                  <div className="flex items-center gap-5">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${isEnabled ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-slate-900 tracking-tight">{module.name}</span>
                        <span className={`text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-lg ${
                          module.tier === 'Essential' ? 'bg-emerald-100 text-emerald-700' : 
                          module.tier === 'Strategic' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {module.tier}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-400 mt-1 leading-relaxed max-w-[200px]">{module.description}</div>
                    </div>
                  </div>
                  <Toggle checked={Boolean(isEnabled)} onChange={() => handleGlobalToggle(module.key)} />
                </div>
              )
            })}
          </div>
          <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
             <HiInformationCircle className="h-5 w-5 text-slate-400" />
             <p className="text-[10px] font-medium text-slate-500 italic">Disabling a global module will hide it from all organizations unless explicitly overridden.</p>
          </div>
        </div>

        {/* Organization Specific Overrides */}
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                  <HiBuildingOffice2 className="h-7 w-7" />
               </div>
               <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Organization Features</h2>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Instance-specific overrides</p>
               </div>
            </div>
            <div className="group relative">
               <HiSparkles className="h-6 w-6 text-emerald-400 animate-pulse cursor-help" />
               <div className="absolute right-0 bottom-full mb-3 w-64 p-4 bg-slate-900 text-white text-[10px] leading-relaxed rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-2xl border border-white/10">
                  <p className="font-bold text-emerald-400 mb-1 uppercase tracking-widest">Custom Tiers</p>
                  Grant premium features to specific organizations regardless of their subscription tier.
               </div>
            </div>
          </div>

          <div className="mb-10 space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Select Target Organization</label>
            <div className="relative">
              <select 
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-6 py-4 text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all appearance-none shadow-sm cursor-pointer"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.subscription_status || 'Trial'})</option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                 <HiClock className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {isTenantLoading ? (
              <div className="py-20 text-center space-y-4">
                <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading configuration...</p>
              </div>
            ) : orgModuleList.length === 0 ? (
              <div className="py-20 text-center rounded-3xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No custom features available for this tier.</p>
              </div>
            ) : (
              orgModuleList.map((module) => {
                const Icon = module.icon
                const isEnabled = orgModules[module.key]
                return (
                  <div key={module.key} className="flex items-center justify-between rounded-3xl border border-slate-50 bg-slate-50/50 p-6 group hover:bg-white hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm transition-colors ${isEnabled ? 'bg-white text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 tracking-tight">{module.name}</span>
                        {module.isOverridden && (
                          <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Active Override</span>
                        )}
                      </div>
                    </div>
                    <Toggle checked={Boolean(isEnabled)} onChange={() => handleTenantToggle(module.key)} />
                  </div>
                )
              })
            )}
          </div>
          
          {!isTenantLoading && orgModuleList.length > 0 && (
            <div className="mt-8 flex justify-center">
               <button 
                onClick={() => fetchTenantModules(selectedTenantId)}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors flex items-center gap-2"
               >
                  <HiWrenchScrewdriver className="h-3 w-3" />
                  Refresh Configuration
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
