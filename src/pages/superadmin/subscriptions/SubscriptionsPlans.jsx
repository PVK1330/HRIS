import { useEffect, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { superadminService } from '../../../services/superadminService.js'
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
  HiXCircle
} from 'react-icons/hi2'

export default function SubscriptionsPlans() {
  const [showAddPlanModal, setShowAddPlanModal] = useState(false)
  const [showEditPlanModal, setShowEditPlanModal] = useState(false)
  const [showDeletePlanModal, setShowDeletePlanModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const [plans, setPlans] = useState([])
  const [allFeatures, setAllFeatures] = useState([])
  const [selectedFeatures, setSelectedFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)

  const initialForm = {
    plan_name: '',
    plan_code: '',
    plan_description: '',
    monthly_price: 0,
    annual_price: 0,
    user_quota: 0,
    storage_quota_gb: 0,
    company_quota: 1,
    trial_days: 0,
    support_level: '',
    isActive: true
  }

  const [newPlan, setNewPlan] = useState(initialForm)
  const [editForm, setEditForm] = useState(initialForm)

  const planColor = (plan) => {
    const colors = {
      'Starter': 'gray',
      'Growth': 'cyan',
      'Pro': 'indigo',
      'Enterprise': 'amber',
    }
    return colors[plan] || 'gray'
  }

  const fetchPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superadminService.getPlans()
      if (response.data?.success) {
        setPlans(response.data.data || [])
      } else {
        setPlans([])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch plans')
    } finally {
      setLoading(false)
    }
  }

  const fetchFeatures = async () => {
    try {
      const response = await superadminService.getActiveFeatures()
      if (response.data?.success) {
        setAllFeatures(response.data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch features:', err)
    }
  }

  useEffect(() => {
    fetchPlans()
    fetchFeatures()
  }, [])

  const handleEditClick = async (plan) => {
    try {
      setLoading(true)
      const response = await superadminService.getPlanById(plan.id)
      const planData = response.data.data
      
      setSelectedPlan(planData)
      setEditForm({
        plan_name: planData.plan_name || '',
        plan_code: planData.plan_code || '',
        plan_description: planData.plan_description || '',
        monthly_price: Number(planData.monthly_price || 0),
        annual_price: Number(planData.annual_price || 0),
        user_quota: Number(planData.user_quota || 0),
        storage_quota_gb: Number(planData.storage_quota_gb || 0),
        company_quota: Number(planData.company_quota || 1),
        trial_days: Number(planData.trial_days || 0),
        support_level: planData.support_level || '',
        isActive: Boolean(planData.is_active)
      })
      
      // Set selected features from plan details
      setSelectedFeatures(planData.features ? planData.features.map(f => f.id) : [])
      
      setFormError(null)
      setShowEditPlanModal(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch plan details')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePlan = async () => {
    try {
      setFormError(null)
      await superadminService.updatePlan(selectedPlan.id, editForm)
      
      // Update features
      await superadminService.updatePlanFeatures(selectedPlan.id, selectedFeatures)
      
      await fetchPlans()
      setShowEditPlanModal(false)
      setSelectedPlan(null)
      setSelectedFeatures([])
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update plan')
    }
  }

  const handleDeleteClick = () => {
    setShowEditPlanModal(false)
    setShowDeletePlanModal(true)
  }

  const executeDelete = async () => {
    try {
      await superadminService.deletePlan(selectedPlan.id)
      await fetchPlans()
      setShowDeletePlanModal(false)
      setSelectedPlan(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete plan')
      setShowDeletePlanModal(false)
    }
  }

  const handleCreatePlan = async () => {
    try {
      setFormError(null)
      const response = await superadminService.createPlan(newPlan)
      
      // If plan created, sync features
      if (response.data?.success && response.data.data?.id) {
        await superadminService.updatePlanFeatures(response.data.data.id, selectedFeatures)
      }
      
      await fetchPlans()
      setShowAddPlanModal(false)
      setNewPlan(initialForm)
      setSelectedFeatures([])
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create plan')
    }
  }

  const toggleFeature = (featureId) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    )
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
        <StatCard title="ACTIVE PLANS" value={plans.filter((p) => p.is_active).length.toString()} icon={HiCheckCircle} trendColor="blue" />
        <StatCard title="TOTAL PLAN SLOTS" value={plans.reduce((sum, p) => sum + Number(p.company_quota || 0), 0).toString()} icon={HiUsers} trendColor="indigo" />
        <StatCard title="MONTHLY POTENTIAL" value={`$${plans.reduce((sum, p) => sum + Number(p.monthly_price || 0), 0)}`} valueColor="green" icon={HiCurrencyDollar} trendColor="green" />
        <StatCard title="ANNUAL POTENTIAL" value={`$${plans.reduce((sum, p) => sum + Number(p.annual_price || 0), 0)}`} valueColor="indigo" icon={HiChartBar} trendColor="indigo" />
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 flex items-center gap-3 border border-red-100">
          <HiXCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {/* Plans Matrix */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md group flex flex-col">
            <div className="mb-4 flex justify-between items-start">
               <Badge label={plan.plan_name} color={planColor(plan.plan_name)} variant="glass" />
               <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <HiCreditCard className="h-5 w-5" />
               </div>
            </div>
            
            <div className="mb-1 flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">${Number(plan.monthly_price || 0)}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">/ Month</span>
            </div>
            <div className="mb-8 text-[11px] font-black text-emerald-500 uppercase tracking-widest">
              ${Number(plan.annual_price || 0)} / Year (Billed Annually)
            </div>

            <div className="space-y-4 mb-8 flex-1">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-50 transition-colors group-hover:bg-white group-hover:border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Users</span>
                <span className="text-sm font-black text-slate-900">{Number(plan.user_quota || 0)} Max</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-50 transition-colors group-hover:bg-white group-hover:border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage</span>
                <span className="text-sm font-black text-slate-900">{Number(plan.storage_quota_gb || 0)} GB</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-50 transition-colors group-hover:bg-white group-hover:border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Companies</span>
                <span className="text-sm font-black text-slate-900">{Number(plan.company_quota || 1)} Max</span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Plan Meta</h4>
              <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-600">
                <div className="h-4 w-4 rounded-full bg-emerald-50 flex items-center justify-center">
                  <HiCheck className="h-2.5 w-2.5 text-emerald-600" />
                </div>
                Code: {plan.plan_code}
              </div>
              <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-600">
                <div className="h-4 w-4 rounded-full bg-emerald-50 flex items-center justify-center">
                  <HiCheck className="h-2.5 w-2.5 text-emerald-600" />
                </div>
                Trial: {Number(plan.trial_days || 0)} Days
              </div>
              <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-600">
                <div className="h-4 w-4 rounded-full bg-emerald-50 flex items-center justify-center">
                  <HiCheck className="h-2.5 w-2.5 text-emerald-600" />
                </div>
                Support: {plan.support_level || 'Standard'}
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-50">
              <Button label="Edit" variant="ghost" className="flex-1 font-black uppercase text-[10px] tracking-widest text-slate-400" onClick={() => handleEditClick(plan)} />
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Edit Tier Modal */}
      <Modal
        isOpen={showEditPlanModal}
        onClose={() => setShowEditPlanModal(false)}
        title={selectedPlan ? `Edit Plan: ${selectedPlan.plan_name}` : 'Edit Plan'}
        description="Modify pricing, user limits, and features."
        icon={HiCreditCard}
        size="lg"
      >
        <div className="space-y-8 p-2">
          {formError && <p className="text-xs font-medium text-red-600">{formError}</p>}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input label="Plan Name *" value={editForm.plan_name} onChange={(e) => setEditForm({ ...editForm, plan_name: e.target.value })} />
            <Input label="Plan Code *" value={editForm.plan_code} onChange={(e) => setEditForm({ ...editForm, plan_code: e.target.value.toLowerCase().replace(/\s/g, '_') })} />
            <div className="space-y-1">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Monthly Price ($) *</label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                type="number"
                value={editForm.monthly_price}
                onChange={(e) => {
                   const monthly = parseInt(e.target.value) || 0
                   setEditForm({ ...editForm, monthly_price: monthly, annual_price: Math.round(monthly * 10.8) })
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Annual Price ($)</label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                type="number"
                value={editForm.annual_price}
                onChange={(e) => setEditForm({ ...editForm, annual_price: parseInt(e.target.value) || 0 })}
              />
              <p className="mt-1 px-1 text-[9px] text-emerald-500 font-black uppercase tracking-widest">Recommended: ${Math.round(editForm.monthly_price * 10.8)} (10% Optimization)</p>
            </div>
            <Input label="User Limit" type="number" value={editForm.user_quota} onChange={(e) => setEditForm({ ...editForm, user_quota: parseInt(e.target.value) || 0 })} />
            <Input label="Storage Limit (GB)" type="number" value={editForm.storage_quota_gb} onChange={(e) => setEditForm({ ...editForm, storage_quota_gb: parseInt(e.target.value) || 0 })} />
            <Input label="Company Limit" type="number" value={editForm.company_quota} onChange={(e) => setEditForm({ ...editForm, company_quota: parseInt(e.target.value) || 1 })} />
            <Input label="Trial Days" type="number" value={editForm.trial_days} onChange={(e) => setEditForm({ ...editForm, trial_days: parseInt(e.target.value) || 0 })} />
            <Input label="Support Level" value={editForm.support_level} onChange={(e) => setEditForm({ ...editForm, support_level: e.target.value })} />
          </div>
          <Input label="Description" value={editForm.plan_description} onChange={(e) => setEditForm({ ...editForm, plan_description: e.target.value })} />

          {/* Feature Selection */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Included Features</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              {allFeatures.map(feature => (
                <div 
                  key={feature.id} 
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedFeatures.includes(feature.id) 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'bg-slate-50/50 border-slate-100 text-slate-500 hover:border-slate-200'
                  }`}
                  onClick={() => toggleFeature(feature.id)}
                >
                  <div className={`h-5 w-5 rounded-lg flex items-center justify-center transition-colors ${
                    selectedFeatures.includes(feature.id) ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200'
                  }`}>
                    {selectedFeatures.includes(feature.id) && <HiCheck className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{feature.feature_name}</p>
                    <p className="text-[9px] font-medium opacity-70 truncate">{feature.feature_code}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-50 pt-8 gap-4">
            <Button label="Purge Tier" variant="ghost" className="text-red-500 font-black uppercase tracking-widest text-[10px] border-none" onClick={handleDeleteClick} />
            <div className="flex gap-4">
              <Button label="Cancel" variant="ghost" className="font-black uppercase tracking-widest text-[10px] text-slate-400" onClick={() => setShowEditPlanModal(false)} />
              <Button label="Save" variant="primary" className="bg-indigo-600 border-none shadow-lg shadow-indigo-100" onClick={handleSavePlan} disabled={!editForm.plan_name || !editForm.plan_code} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Plan Confirmation Modal */}
      <Modal
        isOpen={showDeletePlanModal}
        onClose={() => setShowDeletePlanModal(false)}
        title={`Delete Plan: ${selectedPlan?.plan_name}`}
        description="This action will deactivate the plan."
        icon={HiExclamationTriangle}
      >
        <div className="space-y-6 p-2">
          {Number(selectedPlan?.company_quota || 0) > 0 && (
            <div className="rounded-2xl bg-amber-50 p-5 flex items-start gap-4 border border-amber-100">
               <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <HiServerStack className="h-6 w-6" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Active Organizations</p>
                  <p className="text-xs font-medium text-amber-800 leading-relaxed">
                    This plan allows up to {selectedPlan?.company_quota} organizations. Deleting sets the plan to inactive.
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
          {formError && <p className="text-xs font-medium text-red-600">{formError}</p>}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input label="Tier Identity *" placeholder="e.g. Scaling Enterprise" value={newPlan.plan_name} onChange={(e) => setNewPlan({ ...newPlan, plan_name: e.target.value })} />
            <Input label="Plan Code *" placeholder="e.g. growth" value={newPlan.plan_code} onChange={(e) => setNewPlan({ ...newPlan, plan_code: e.target.value.toLowerCase().replace(/\s/g, '_') })} />
            <Input label="Monthly Billing ($) *" placeholder="999" type="number" value={newPlan.monthly_price} onChange={(e) => setNewPlan({ ...newPlan, monthly_price: parseInt(e.target.value) || 0 })} />
            <Input label="Annual Billing ($)" placeholder="9990" type="number" value={newPlan.annual_price} onChange={(e) => setNewPlan({ ...newPlan, annual_price: parseInt(e.target.value) || 0 })} />
            <Input label="User Node Quota" placeholder="500" type="number" value={newPlan.user_quota} onChange={(e) => setNewPlan({ ...newPlan, user_quota: parseInt(e.target.value) || 0 })} />
            <Input label="Storage Quota (GB)" placeholder="100" type="number" value={newPlan.storage_quota_gb} onChange={(e) => setNewPlan({ ...newPlan, storage_quota_gb: parseInt(e.target.value) || 0 })} />
            <Input label="Company Quota" placeholder="1" type="number" value={newPlan.company_quota} onChange={(e) => setNewPlan({ ...newPlan, company_quota: parseInt(e.target.value) || 1 })} />
            <Input label="Trial Days" placeholder="0" type="number" value={newPlan.trial_days} onChange={(e) => setNewPlan({ ...newPlan, trial_days: parseInt(e.target.value) || 0 })} />
            <Input label="Support Level" placeholder="e.g. priority" value={newPlan.support_level} onChange={(e) => setNewPlan({ ...newPlan, support_level: e.target.value })} />
          </div>
          <Input label="Description" placeholder="Plan details" value={newPlan.plan_description} onChange={(e) => setNewPlan({ ...newPlan, plan_description: e.target.value })} />

          {/* Feature Selection */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Included Features</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              {allFeatures.map(feature => (
                <div 
                  key={feature.id} 
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedFeatures.includes(feature.id) 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'bg-slate-50/50 border-slate-100 text-slate-500 hover:border-slate-200'
                  }`}
                  onClick={() => toggleFeature(feature.id)}
                >
                  <div className={`h-5 w-5 rounded-lg flex items-center justify-center transition-colors ${
                    selectedFeatures.includes(feature.id) ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200'
                  }`}>
                    {selectedFeatures.includes(feature.id) && <HiCheck className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{feature.feature_name}</p>
                    <p className="text-[9px] font-medium opacity-70 truncate">{feature.feature_code}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-50">
            <Button label="Cancel" variant="ghost" className="flex-1 font-black uppercase text-[10px] tracking-widest text-slate-400" onClick={() => setShowAddPlanModal(false)} />
            <Button label="Save" variant="primary" className="flex-1 bg-indigo-600 border-none shadow-lg shadow-indigo-100" onClick={handleCreatePlan} disabled={!newPlan.plan_name || !newPlan.plan_code} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
