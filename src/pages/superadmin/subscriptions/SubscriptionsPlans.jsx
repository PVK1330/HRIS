import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { 
  HiCheck, 
  HiCurrencyDollar, 
  HiUsers, 
  HiExclamationTriangle,
  HiQuestionMarkCircle,
  HiBriefcase,
  HiCreditCard,
  HiChartBar,
  HiServerStack,
  HiCheckCircle,
  HiPlus,
  HiTrash
} from 'react-icons/hi2'

export default function SubscriptionsPlans() {
  const [showAddPlanModal, setShowAddPlanModal] = useState(false)
  const [showEditPlanModal, setShowEditPlanModal] = useState(false)
  const [showDeletePlanModal, setShowDeletePlanModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const [plans, setPlans] = useState([
    {
      id: 1,
      name: 'Starter',
      monthlyPrice: 299,
      annualPrice: 2691,
      maxUsers: 50,
      storage: 5,
      modules: ['Employee Directory', 'Attendance', 'Leave', 'Documents'],
      orgs: 12,
      color: 'gray',
    },
    {
      id: 2,
      name: 'Growth',
      monthlyPrice: 699,
      annualPrice: 6291,
      maxUsers: 200,
      storage: 20,
      modules: ['Employee Directory', 'Attendance', 'Leave', 'Documents', 'Performance', 'Onboarding', 'Exit'],
      orgs: 18,
      color: 'cyan',
    },
    {
      id: 3,
      name: 'Pro',
      monthlyPrice: 1299,
      annualPrice: 11691,
      maxUsers: 300,
      storage: 30,
      modules: ['Employee Directory', 'Attendance', 'Leave', 'Documents', 'Performance', 'Onboarding', 'Exit', 'Payroll', 'Visa', 'Expenses'],
      orgs: 11,
      color: 'indigo',
    },
    {
      id: 4,
      name: 'Enterprise',
      monthlyPrice: 2999,
      annualPrice: 26991,
      maxUsers: 500,
      storage: 50,
      modules: ['All Modules', 'API Access', 'Priority Support'],
      orgs: 7,
      color: 'amber',
    },
  ])

  const [editForm, setEditForm] = useState({
    name: '',
    monthlyPrice: 0,
    annualPrice: 0,
    maxUsers: 0,
    storage: 0,
    modules: []
  })

  const modulesList = [
    'Employee Directory', 'Attendance', 'Leave', 'Documents', 'Payroll', 'Performance',
    'Onboarding', 'Exit', 'Expenses', 'Visa', 'API Access', 'Priority Support'
  ]

  const planColor = (plan) => {
    const colors = {
      'Starter': 'gray',
      'Growth': 'cyan',
      'Pro': 'indigo',
      'Enterprise': 'amber',
    }
    return colors[plan] || 'gray'
  }

  const handleEditClick = (plan) => {
    setSelectedPlan(plan)
    setEditForm({
      name: plan.name,
      monthlyPrice: plan.monthlyPrice,
      annualPrice: plan.annualPrice,
      maxUsers: plan.maxUsers,
      storage: plan.storage,
      modules: plan.modules
    })
    setShowEditPlanModal(true)
  }

  const handleSavePlan = () => {
    setPlans(plans.map(p => p.id === selectedPlan.id ? { ...p, ...editForm } : p))
    setShowEditPlanModal(false)
  }

  const handleDeleteClick = () => {
    setShowEditPlanModal(false)
    setShowDeletePlanModal(true)
  }

  const executeDelete = () => {
    setPlans(plans.filter(p => p.id !== selectedPlan.id))
    setShowDeletePlanModal(false)
  }

  const toggleModule = (module) => {
    setEditForm(prev => ({
      ...prev,
      modules: prev.modules.includes(module) 
        ? prev.modules.filter(m => m !== module)
        : [...prev.modules, module]
    }))
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
             <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <HiBriefcase className="h-4.5 w-4.5" />
             </div>
             <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pricing Plans</h1>
             <div className="group relative">
                <HiQuestionMarkCircle className="h-4 w-4 text-slate-300 cursor-help hover:text-indigo-500 transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-slate-900 text-white text-[10px] leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl border border-white/10">
                   <p className="font-bold text-indigo-400 mb-1 uppercase tracking-widest">Pricing Overview</p>
                   Create and manage different pricing plans and limits for organizations.
                   <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
             </div>
          </div>
          <p className="text-[11px] font-medium text-slate-500">Manage your subscription plans and system limits.</p>
        </div>
        <Button label="Add Plan" variant="primary" size="sm" icon={HiPlus} onClick={() => setShowAddPlanModal(true)} />
      </div>

      {/* Premium Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="ACTIVE PLANS" value={plans.length.toString()} icon={HiCheckCircle} trendColor="blue" />
        <StatCard title="TOTAL CLIENTS" value="48" icon={HiUsers} trendColor="indigo" />
        <StatCard title="MONTHLY REVENUE" value="$47.2k" valueColor="green" icon={HiCurrencyDollar} trendColor="green" />
        <StatCard title="ANNUAL REVENUE" value="$566.4k" valueColor="indigo" icon={HiChartBar} trendColor="indigo" />
      </div>

      {/* Plans Matrix */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md group flex flex-col">
            <div className="mb-4 flex justify-between items-start">
               <Badge label={plan.name} color={planColor(plan.name)} variant="glass" />
               <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <HiCreditCard className="h-5 w-5" />
               </div>
            </div>
            
            <div className="mb-1 flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">${plan.monthlyPrice}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">/ Month</span>
            </div>
            <div className="mb-8 text-[11px] font-black text-emerald-500 uppercase tracking-widest">
              ${plan.annualPrice} / Year (Billed Annually)
            </div>

            <div className="space-y-4 mb-8 flex-1">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-50 transition-colors group-hover:bg-white group-hover:border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Users</span>
                <span className="text-sm font-black text-slate-900">{plan.maxUsers} Max</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-50 transition-colors group-hover:bg-white group-hover:border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage</span>
                <span className="text-sm font-black text-slate-900">{plan.storage} GB</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-50 transition-colors group-hover:bg-white group-hover:border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clients</span>
                <span className="text-sm font-black text-slate-900">{plan.orgs} Active</span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
               <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Features</h4>
               {plan.modules.slice(0, 4).map((module, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-[11px] font-bold text-slate-600">
                    <div className="h-4 w-4 rounded-full bg-emerald-50 flex items-center justify-center">
                       <HiCheck className="h-2.5 w-2.5 text-emerald-600" />
                    </div>
                    {module}
                  </div>
                ))}
                {plan.modules.length > 4 && (
                  <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest pt-1">
                    + {plan.modules.length - 4} Strategic Modules
                  </div>
                )}
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-50">
              <Button label="Edit" variant="ghost" className="flex-1 font-black uppercase text-[10px] tracking-widest text-slate-400" onClick={() => handleEditClick(plan)} />
            </div>
          </div>
        ))}
      </div>

      {/* Edit Tier Modal */}
      <Modal
        isOpen={showEditPlanModal}
        onClose={() => setShowEditPlanModal(false)}
        title={selectedPlan ? `Edit Plan: ${selectedPlan.name}` : 'Edit Plan'}
        description="Modify pricing, user limits, and features."
        icon={HiCreditCard}
        size="lg"
      >
        <div className="space-y-8 p-2">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input label="Plan Name *" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <div className="space-y-1">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Monthly Price ($) *</label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                type="number"
                value={editForm.monthlyPrice}
                onChange={(e) => {
                   const monthly = parseInt(e.target.value) || 0
                   setEditForm({ ...editForm, monthlyPrice: monthly, annualPrice: Math.round(monthly * 10.8) })
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Annual Price ($)</label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                type="number"
                value={editForm.annualPrice}
                onChange={(e) => setEditForm({ ...editForm, annualPrice: parseInt(e.target.value) || 0 })}
              />
              <p className="mt-1 px-1 text-[9px] text-emerald-500 font-black uppercase tracking-widest">Recommended: ${Math.round(editForm.monthlyPrice * 10.8)} (10% Optimization)</p>
            </div>
            <Input label="User Limit" type="number" value={editForm.maxUsers} onChange={(e) => setEditForm({ ...editForm, maxUsers: parseInt(e.target.value) || 0 })} />
            <Input label="Storage Limit (GB)" type="number" value={editForm.storage} onChange={(e) => setEditForm({ ...editForm, storage: parseInt(e.target.value) || 0 })} />
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 mb-4 block">Feature Access</label>
            <div className="grid grid-cols-2 gap-4">
              {modulesList.map((module) => (
                <label key={module} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-xl transition-all cursor-pointer">
                  <span className="text-xs font-bold text-slate-700">{module}</span>
                  <input 
                    type="checkbox" 
                    className="h-5 w-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500/20 transition-all cursor-pointer" 
                    checked={editForm.modules.includes(module)}
                    onChange={() => toggleModule(module)}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-50 pt-8 gap-4">
            <Button label="Purge Tier" variant="ghost" className="text-red-500 font-black uppercase tracking-widest text-[10px] border-none" onClick={handleDeleteClick} />
            <div className="flex gap-4">
              <Button label="Cancel" variant="ghost" className="font-black uppercase tracking-widest text-[10px] text-slate-400" onClick={() => setShowEditPlanModal(false)} />
              <Button label="Save" variant="primary" className="bg-indigo-600 border-none shadow-lg shadow-indigo-100" onClick={handleSavePlan} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Plan Confirmation Modal */}
      <Modal
        isOpen={showDeletePlanModal}
        onClose={() => setShowDeletePlanModal(false)}
        title={`Delete Plan: ${selectedPlan?.name}`}
        description={`Warning: This plan is used by ${selectedPlan?.orgs} active organizations.`}
        icon={HiExclamationTriangle}
      >
        <div className="space-y-6 p-2">
          {selectedPlan?.orgs > 0 && (
            <div className="rounded-2xl bg-amber-50 p-5 flex items-start gap-4 border border-amber-100">
               <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <HiServerStack className="h-6 w-6" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Active Organizations</p>
                  <p className="text-xs font-medium text-amber-800 leading-relaxed">
                    You must move all {selectedPlan.orgs} organizations to another plan before you can delete this one.
                  </p>
               </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-50">
            <Button label="Cancel" variant="ghost" className="font-black uppercase text-[10px] tracking-widest text-slate-400" onClick={() => setShowDeletePlanModal(false)} />
            <Button 
              label="Delete" 
              variant="danger" 
              className="bg-red-600 border-none text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100"
              disabled={selectedPlan?.orgs > 0} 
              onClick={executeDelete}
            />
          </div>
        </div>
      </Modal>

      {/* Create Tier Modal (Unified) */}
      <Modal
        isOpen={showAddPlanModal}
        onClose={() => setShowAddPlanModal(false)}
        title="Add Pricing Plan"
        description="Create a new pricing plan with custom limits and features."
        icon={HiPlus}
        size="lg"
      >
        <div className="space-y-8 p-2">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input label="Tier Identity *" placeholder="e.g. Scaling Enterprise" />
            <Input label="Monthly Billing ($) *" placeholder="999" type="number" />
            <Input label="Annual Billing ($)" placeholder="9990" type="number" />
            <Input label="User Node Quota" placeholder="500" type="number" />
            <Input label="Storage Quota (GB)" placeholder="100" type="number" />
          </div>

          <div>
             <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 mb-4 block">Default Capability Set</label>
             <div className="grid grid-cols-2 gap-4">
                {['Employee Directory', 'Attendance', 'Leave', 'Payroll', 'Documents', 'API Access', 'Priority Support'].map((module) => (
                  <label key={module} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-xl transition-all cursor-pointer">
                    <span className="text-xs font-bold text-slate-700">{module}</span>
                    <input type="checkbox" className="h-5 w-5 rounded-lg border-slate-300 text-indigo-600 transition-all" defaultChecked={['Employee Directory', 'Attendance', 'Leave', 'Documents'].includes(module)} />
                  </label>
                ))}
             </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-50">
            <Button label="Cancel" variant="ghost" className="flex-1 font-black uppercase text-[10px] tracking-widest text-slate-400" onClick={() => setShowAddPlanModal(false)} />
            <Button label="Save" variant="primary" className="flex-1 bg-indigo-600 border-none shadow-lg shadow-indigo-100" onClick={() => setShowAddPlanModal(false)} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
