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
  HiXCircle,
  HiPencil,
  HiEye,
  HiTrash
} from 'react-icons/hi2'

export default function SubscriptionsPlans() {
  // Modal states
  const [showAddPlanModal, setShowAddPlanModal] = useState(false)
  const [showEditPlanModal, setShowEditPlanModal] = useState(false)
  const [showDeletePlanModal, setShowDeletePlanModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  // UI states
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)

  // Data states
  const [plans, setPlans] = useState([])
  const [allFeatures, setAllFeatures] = useState([])
  const [selectedFeatures, setSelectedFeatures] = useState([])

  // Form initial state
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

  // Helper functions
  const formatPrice = (price) => {
    return Number(price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const formatQuota = (value, unit = '') => {
    if (value === -1) return 'Unlimited'
    if (value === 0) return 'Not included'
    return `${value}${unit ? ' ' + unit : ''}`
  }

  const getPlanColor = (planName) => {
    const colors = {
      'Mini': 'gray',
      'Pro': 'cyan',
      'Max': 'indigo',
      'Enterprise': 'amber',
      'Top': 'purple',
      'Starter': 'gray',
      'Growth': 'cyan'
    }
    return colors[planName] || 'gray'
  }

  // API calls
  const fetchPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superadminService.getPlans({ search: searchQuery })
      if (response.data?.success) {
        setPlans(response.data.data || [])
      } else {
        setPlans([])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch plans')
      setPlans([])
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
  }, [searchQuery])

  // Plan CRUD operations
  const handleViewPlan = async (plan) => {
    try {
      setLoading(true)
      const response = await superadminService.getPlanById(plan.id)
      setSelectedPlan(response.data.data)
      setShowDetailModal(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch plan details')
    } finally {
      setLoading(false)
    }
  }

  const handleEditPlan = async (plan) => {
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
      await superadminService.updatePlanFeatures(selectedPlan.id, selectedFeatures)
      await fetchPlans()
      setShowEditPlanModal(false)
      setSelectedPlan(null)
      setSelectedFeatures([])
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update plan')
    }
  }

  const handleDeletePlan = async () => {
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

  // Export functionality
  const handleExport = () => {
    const headers = ['ID', 'Name', 'Code', 'Monthly Price', 'Annual Price', 'Users', 'Storage', 'Companies', 'Trial Days', 'Support Level', 'Status']
    const csvData = plans.map(p => [
      p.id,
      p.plan_name,
      p.plan_code,
      p.monthly_price,
      p.annual_price,
      p.user_quota === -1 ? 'Unlimited' : p.user_quota,
      p.storage_quota_gb === -1 ? 'Unlimited' : p.storage_quota_gb,
      p.company_quota === -1 ? 'Unlimited' : p.company_quota,
      p.trial_days,
      p.support_level || 'Standard',
      p.is_active ? 'Active' : 'Inactive'
    ])

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `plans_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculations for stats
  const activePlansCount = plans.filter(p => p.is_active).length
  const totalCompanyQuota = plans.reduce((sum, p) => sum + (p.company_quota === -1 ? 0 : Number(p.company_quota || 0)), 0)
  const totalMonthlyRevenue = plans.reduce((sum, p) => sum + Number(p.monthly_price || 0), 0)
  const totalAnnualRevenue = plans.reduce((sum, p) => sum + Number(p.annual_price || 0), 0)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <HiBriefcase className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Subscription Plans</h1>
              <p className="text-sm text-slate-500 mt-0.5">Manage pricing tiers, limits, and feature access</p>
            </div>
            <div className="group relative ml-2">
              <HiQuestionMarkCircle className="h-5 w-5 text-slate-400 cursor-help hover:text-indigo-500 transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-4 bg-slate-900 text-white text-xs leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl border border-white/10">
                <p className="font-bold text-indigo-400 mb-2 uppercase tracking-wider text-[10px]">Plan Management</p>
                <p className="mb-2">Create and manage subscription plans with custom pricing, quotas, and feature sets.</p>
                <p className="text-slate-400 text-[10px]">Use -1 for unlimited quotas</p>
                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            label="Export CSV"
            variant="outline"
            size="md"
            icon={HiChartBar}
            onClick={handleExport}
            className="border-slate-200 text-slate-600 hover:bg-slate-50"
          />
          <Button
            label="Add New Plan"
            variant="primary"
            size="md"
            icon={HiPlus}
            onClick={() => setShowAddPlanModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="ACTIVE PLANS"
          value={activePlansCount.toString()}
          subtitle={`out of ${plans.length} total`}
          icon={HiCheckCircle}
          trendColor="blue"
        />
        <StatCard
          title="TOTAL PLAN SLOTS"
          value={totalCompanyQuota.toString()}
          subtitle="total company capacity"
          icon={HiUsers}
          trendColor="indigo"
        />
        <StatCard
          title="MONTHLY POTENTIAL"
          value={`$${formatPrice(totalMonthlyRevenue)}`}
          subtitle="from all plans"
          icon={HiCurrencyDollar}
          trendColor="green"
        />
        <StatCard
          title="ANNUAL POTENTIAL"
          value={`$${formatPrice(totalAnnualRevenue)}`}
          subtitle="from all plans"
          icon={HiChartBar}
          trendColor="amber"
        />
      </div>

      {/* Search and Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <Input
              label="Search Plans"
              placeholder="Search by name, code, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-3">
            <Button
              label="Clear Filters"
              variant="ghost"
              className="text-slate-500"
              onClick={() => setSearchQuery('')}
            />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl bg-red-50 p-4 flex items-center gap-3 border border-red-200">
          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <HiXCircle className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-sm font-medium text-red-800 flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 font-bold text-xl leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Plans Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-slate-500 text-sm">Loading plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center">
          <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <HiCreditCard className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Plans Found</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            {searchQuery ? `No plans match "${searchQuery}"` : "Get started by creating your first pricing plan"}
          </p>
          {!searchQuery && (
            <Button label="Create First Plan" variant="primary" icon={HiPlus} onClick={() => setShowAddPlanModal(true)} />
          )}
          {searchQuery && (
            <Button label="Clear Search" variant="outline" onClick={() => setSearchQuery('')} />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:border-indigo-200"
            >
              {/* Popular Badge (if applicable) */}
              {plan.is_popular && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge label="Popular" color="amber" variant="solid" className="text-[9px]" />
                </div>
              )}

              {/* Plan Header */}
              <div className="p-6 pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between mb-4">
                  <Badge label={plan.plan_name} color={getPlanColor(plan.plan_name)} variant="glass" className="text-xs px-3 py-1" />
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-slate-400 group-hover:from-indigo-50 group-hover:to-indigo-100 group-hover:text-indigo-600 transition-all duration-300">
                    <HiCreditCard className="h-6 w-6" />
                  </div>
                </div>

                <div className="mb-2">
                  <span className="text-4xl font-black text-slate-900">${formatPrice(plan.monthly_price)}</span>
                  <span className="text-sm font-medium text-slate-500 ml-1">/month</span>
                </div>
                <div className="text-sm font-semibold text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full">
                  ${formatPrice(plan.annual_price)}/year
                  {plan.monthly_price > 0 && ` (save ${Math.round((1 - plan.annual_price / (plan.monthly_price * 12)) * 100)}%)`}
                </div>
              </div>

              {/* Plan Details */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">
                  {plan.plan_description || "No description provided"}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Users</span>
                    <span className="text-sm font-bold text-slate-900">{formatQuota(plan.user_quota)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Storage</span>
                    <span className="text-sm font-bold text-slate-900">{formatQuota(plan.storage_quota_gb, 'GB')}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Companies</span>
                    <span className="text-sm font-bold text-slate-900">{formatQuota(plan.company_quota)}</span>
                  </div>
                </div>

                {/* Features List */}
                {plan.features && plan.features.length > 0 && (
                  <div className="pt-4 border-t border-slate-50 mt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Key Features</p>
                    <ul className="space-y-2">
                      {plan.features.slice(0, 6).map((feature) => (
                        <li key={feature.id} className="flex items-start gap-2 text-xs text-slate-600">
                          <HiCheck className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{feature.feature_name}</span>
                        </li>
                      ))}
                      {plan.features.length > 6 && (
                        <li className="text-[10px] font-medium text-indigo-500 pl-5 pt-1">
                          + {plan.features.length - 6} more features
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6 pt-0 flex gap-3">
                <Button
                  label="View"
                  variant="ghost"
                  size="sm"
                  icon={HiEye}
                  className="flex-1 text-slate-600 hover:text-indigo-600"
                  onClick={() => handleViewPlan(plan)}
                />
                <Button
                  label="Edit"
                  variant="ghost"
                  size="sm"
                  icon={HiPencil}
                  className="flex-1 text-slate-600 hover:text-indigo-600"
                  onClick={() => handleEditPlan(plan)}
                />
              </div>

              {/* Status Indicator */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${plan.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </div>
          ))}
        </div>
      )}

      {/* Create Plan Modal */}
      <Modal
        isOpen={showAddPlanModal}
        onClose={() => {
          setShowAddPlanModal(false)
          setSelectedFeatures([])
          setFormError(null)
          setNewPlan(initialForm)
        }}
        title="Create New Pricing Plan"
        description="Configure plan details, pricing, and included features"
        icon={HiPlus}
        size="lg"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
          {formError && (
            <div className="rounded-xl bg-red-50 p-3 border border-red-200">
              <p className="text-xs font-medium text-red-600">{formError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Plan Name *"
              placeholder="e.g., Professional"
              value={newPlan.plan_name}
              onChange={(e) => setNewPlan({ ...newPlan, plan_name: e.target.value })}
              required
            />
            <Input
              label="Plan Code *"
              placeholder="e.g., professional"
              value={newPlan.plan_code}
              onChange={(e) => setNewPlan({ ...newPlan, plan_code: e.target.value.toLowerCase().replace(/\s/g, '_') })}
              required
            />
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Monthly Price ($) *</label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                type="number"
                step="0.01"
                min="0"
                value={newPlan.monthly_price}
                onChange={(e) => {
                  const monthly = parseFloat(e.target.value) || 0
                  setNewPlan({
                    ...newPlan,
                    monthly_price: monthly,
                    annual_price: Math.round(monthly * 10.8 * 100) / 100
                  })
                }}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Annual Price ($)</label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                type="number"
                step="0.01"
                min="0"
                value={newPlan.annual_price}
                onChange={(e) => setNewPlan({ ...newPlan, annual_price: parseFloat(e.target.value) || 0 })}
              />
              <p className="mt-1 text-[10px] text-emerald-600 font-semibold">
                Recommended: ${Math.round(newPlan.monthly_price * 10.8 * 100) / 100} (10% discount)
              </p>
            </div>
            <Input
              label="User Quota (use -1 for unlimited)"
              type="number"
              value={newPlan.user_quota}
              onChange={(e) => setNewPlan({ ...newPlan, user_quota: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Storage Quota (GB) (use -1 for unlimited)"
              type="number"
              value={newPlan.storage_quota_gb}
              onChange={(e) => setNewPlan({ ...newPlan, storage_quota_gb: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Company Quota (use -1 for unlimited)"
              type="number"
              value={newPlan.company_quota}
              onChange={(e) => setNewPlan({ ...newPlan, company_quota: parseInt(e.target.value) || 1 })}
            />
            <Input
              label="Trial Days (0 for no trial)"
              type="number"
              value={newPlan.trial_days}
              onChange={(e) => setNewPlan({ ...newPlan, trial_days: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Support Level"
              placeholder="e.g., Standard, Priority, 24/7"
              value={newPlan.support_level}
              onChange={(e) => setNewPlan({ ...newPlan, support_level: e.target.value })}
            />
          </div>

          <Input
            label="Description"
            placeholder="Describe what this plan includes..."
            value={newPlan.plan_description}
            onChange={(e) => setNewPlan({ ...newPlan, plan_description: e.target.value })}
          />

          {/* Feature Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Included Features</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50/30">
              {allFeatures.length === 0 ? (
                <p className="text-sm text-slate-400 col-span-2 text-center py-4">Loading features...</p>
              ) : (
                allFeatures.map(feature => (
                  <div
                    key={feature.id}
                    className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${selectedFeatures.includes(feature.id)
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'
                      }`}
                    onClick={() => toggleFeature(feature.id)}
                  >
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ${selectedFeatures.includes(feature.id) ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-300'
                      }`}>
                      {selectedFeatures.includes(feature.id) && <HiCheck className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{feature.feature_name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{feature.feature_code}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <p className="text-[10px] text-slate-500">Selected: {selectedFeatures.length} features</p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              label="Cancel"
              variant="ghost"
              className="flex-1"
              onClick={() => setShowAddPlanModal(false)}
            />
            <Button
              label="Create Plan"
              variant="primary"
              className="flex-1 bg-indigo-600"
              onClick={handleCreatePlan}
              disabled={!newPlan.plan_name || !newPlan.plan_code}
            />
          </div>
        </div>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal
        isOpen={showEditPlanModal}
        onClose={() => {
          setShowEditPlanModal(false)
          setSelectedFeatures([])
          setFormError(null)
        }}
        title={`Edit Plan: ${selectedPlan?.plan_name}`}
        description="Modify plan details, pricing, and feature access"
        icon={HiPencil}
        size="lg"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
          {formError && (
            <div className="rounded-xl bg-red-50 p-3 border border-red-200">
              <p className="text-xs font-medium text-red-600">{formError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Plan Name *"
              value={editForm.plan_name}
              onChange={(e) => setEditForm({ ...editForm, plan_name: e.target.value })}
            />
            <Input
              label="Plan Code *"
              value={editForm.plan_code}
              onChange={(e) => setEditForm({ ...editForm, plan_code: e.target.value.toLowerCase().replace(/\s/g, '_') })}
            />
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Monthly Price ($) *</label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                type="number"
                step="0.01"
                value={editForm.monthly_price}
                onChange={(e) => {
                  const monthly = parseFloat(e.target.value) || 0
                  setEditForm({ ...editForm, monthly_price: monthly, annual_price: Math.round(monthly * 10.8 * 100) / 100 })
                }}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Annual Price ($)</label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                type="number"
                step="0.01"
                value={editForm.annual_price}
                onChange={(e) => setEditForm({ ...editForm, annual_price: parseFloat(e.target.value) || 0 })}
              />
              <p className="mt-1 text-[10px] text-emerald-600 font-semibold">
                Recommended: ${Math.round(editForm.monthly_price * 10.8 * 100) / 100} (10% discount)
              </p>
            </div>
            <Input
              label="User Quota (use -1 for unlimited)"
              type="number"
              value={editForm.user_quota}
              onChange={(e) => setEditForm({ ...editForm, user_quota: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Storage Quota (GB) (use -1 for unlimited)"
              type="number"
              value={editForm.storage_quota_gb}
              onChange={(e) => setEditForm({ ...editForm, storage_quota_gb: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Company Quota (use -1 for unlimited)"
              type="number"
              value={editForm.company_quota}
              onChange={(e) => setEditForm({ ...editForm, company_quota: parseInt(e.target.value) || 1 })}
            />
            <Input
              label="Trial Days"
              type="number"
              value={editForm.trial_days}
              onChange={(e) => setEditForm({ ...editForm, trial_days: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Support Level"
              value={editForm.support_level}
              onChange={(e) => setEditForm({ ...editForm, support_level: e.target.value })}
            />
          </div>

          <Input
            label="Description"
            value={editForm.plan_description}
            onChange={(e) => setEditForm({ ...editForm, plan_description: e.target.value })}
          />

          {/* Feature Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Included Features</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50/30">
              {allFeatures.map(feature => (
                <div
                  key={feature.id}
                  className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${selectedFeatures.includes(feature.id)
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'
                    }`}
                  onClick={() => toggleFeature(feature.id)}
                >
                  <div className={`h-5 w-5 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ${selectedFeatures.includes(feature.id) ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-300'
                    }`}>
                    {selectedFeatures.includes(feature.id) && <HiCheck className="h-3 w-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{feature.feature_name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{feature.feature_code}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500">Selected: {selectedFeatures.length} features</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button
              label="Delete Plan"
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              icon={HiTrash}
              onClick={() => {
                setShowEditPlanModal(false)
                setShowDeletePlanModal(true)
              }}
            />
            <div className="flex gap-3">
              <Button
                label="Cancel"
                variant="ghost"
                onClick={() => setShowEditPlanModal(false)}
              />
              <Button
                label="Save Changes"
                variant="primary"
                className="bg-indigo-600"
                onClick={handleSavePlan}
                disabled={!editForm.plan_name || !editForm.plan_code}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Plan Modal */}
      <Modal
        isOpen={showDeletePlanModal}
        onClose={() => setShowDeletePlanModal(false)}
        title="Delete Plan"
        description="Are you sure you want to delete this plan? This action cannot be undone."
        icon={HiExclamationTriangle}
        variant="danger"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-sm text-red-800">
              Deleting <strong>{selectedPlan?.plan_name}</strong> will remove it from the system. 
              New subscriptions will not be able to select this plan.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              label="Cancel"
              variant="ghost"
              className="flex-1"
              onClick={() => setShowDeletePlanModal(false)}
            />
            <Button
              label="Delete Plan"
              variant="danger"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeletePlan}
            />
          </div>
        </div>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Plan Details: ${selectedPlan?.plan_name}`}
        description="Full overview of plan configuration and features"
        icon={HiEye}
        size="lg"
      >
        {selectedPlan && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pricing</p>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Monthly</span>
                    <span className="text-sm font-bold text-slate-900">${formatPrice(selectedPlan.monthly_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Annual</span>
                    <span className="text-sm font-bold text-slate-900">${formatPrice(selectedPlan.annual_price)}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quotas</p>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Users</span>
                    <span className="text-sm font-bold text-slate-900">{formatQuota(selectedPlan.user_quota)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Storage</span>
                    <span className="text-sm font-bold text-slate-900">{formatQuota(selectedPlan.storage_quota_gb, 'GB')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Companies</span>
                    <span className="text-sm font-bold text-slate-900">{formatQuota(selectedPlan.company_quota)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Included Features</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedPlan.features?.map((feature) => (
                  <div key={feature.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <HiCheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{feature.feature_name}</p>
                      <p className="text-[10px] text-slate-500">{feature.feature_description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                label="Close"
                variant="ghost"
                className="flex-1"
                onClick={() => setShowDetailModal(false)}
              />
              <Button
                label="Edit Plan"
                variant="primary"
                className="flex-1 bg-indigo-600"
                onClick={() => {
                  setShowDetailModal(false)
                  handleEditPlan(selectedPlan)
                }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
