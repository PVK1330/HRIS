import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { HiCheck, HiCurrencyDollar, HiUsers } from 'react-icons/hi2'

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
      tenants: 12,
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
      tenants: 18,
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
      tenants: 11,
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
      tenants: 7,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions & Plans</h1>
          <p className="mt-1 text-sm text-gray-600">Manage subscription plans and pricing tiers</p>
        </div>
        <Button label="+ Create Plan" variant="primary" size="sm" onClick={() => setShowAddPlanModal(true)} />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="ACTIVE PLANS" value={plans.length.toString()} icon={HiCheck} />
        <StatCard title="TOTAL SUBSCRIBERS" value="48" icon={HiUsers} />
        <StatCard title="MONTHLY RECURRING" value="$47.2k" valueColor="green" icon={HiCurrencyDollar} />
        <StatCard title="ANNUALIZED" value="$566.4k" valueColor="indigo" icon={HiCurrencyDollar} />
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4">
              <Badge variant={planColor(plan.name)}>{plan.name}</Badge>
            </div>
            <div className="mb-2">
              <span className="text-3xl font-bold text-gray-900">${plan.monthlyPrice}</span>
              <span className="text-sm text-gray-500">/mo</span>
            </div>
            <div className="mb-6 text-sm text-gray-500">
              ${plan.annualPrice}/year (10% off)
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Max Users</span>
                <span className="font-semibold text-gray-900">{plan.maxUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Storage</span>
                <span className="font-semibold text-gray-900">{plan.storage}GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Active Tenants</span>
                <span className="font-semibold text-gray-900">{plan.tenants}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="mb-2 text-xs font-semibold text-gray-500">INCLUDED MODULES</div>
              <div className="space-y-1">
                {plan.modules.slice(0, 4).map((module, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                    <HiCheck className="h-3 w-3 text-green-500" />
                    {module}
                  </div>
                ))}
                {plan.modules.length > 4 && (
                  <div className="text-xs text-gray-500">+{plan.modules.length - 4} more</div>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button label="Edit Plan" variant="ghost" size="sm" className="flex-1" onClick={() => handleEditClick(plan)} />
              <Button label="View Tenants" variant="primary" size="sm" className="flex-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Edit Plan Modal */}
      <Modal
        isOpen={showEditPlanModal}
        onClose={() => setShowEditPlanModal(false)}
        title={selectedPlan ? `Edit Plan — ${selectedPlan.name}` : 'Edit Plan'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Plan Name *</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Monthly Price ($) *</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20"
                type="number"
                value={editForm.monthlyPrice}
                onChange={(e) => {
                   const monthly = parseInt(e.target.value) || 0
                   setEditForm({ ...editForm, monthlyPrice: monthly, annualPrice: Math.round(monthly * 10.8) })
                }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Annual Price ($)</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20"
                type="number"
                value={editForm.annualPrice}
                onChange={(e) => setEditForm({ ...editForm, annualPrice: parseInt(e.target.value) || 0 })}
              />
              <p className="mt-1 text-[10px] text-indigo-600 font-medium">Suggestion: ${Math.round(editForm.monthlyPrice * 10.8)} (10% off)</p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Max Users</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20"
                type="number"
                value={editForm.maxUsers}
                onChange={(e) => setEditForm({ ...editForm, maxUsers: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Storage (GB)</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20"
                type="number"
                value={editForm.storage}
                onChange={(e) => setEditForm({ ...editForm, storage: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Included Modules</label>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
              {modulesList.map((module) => (
                <label key={module} className="flex items-center gap-2 text-sm text-gray-700">
                  <input 
                    type="checkbox" 
                    className="accent-[#004CA5]" 
                    checked={editForm.modules.includes(module)}
                    onChange={() => toggleModule(module)}
                  />
                  {module}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <Button label="Delete Plan" variant="danger" size="sm" onClick={handleDeleteClick} />
            <div className="flex gap-2">
              <Button label="Save Changes" variant="primary" onClick={handleSavePlan} />
              <Button label="Cancel" variant="ghost" onClick={() => setShowEditPlanModal(false)} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Plan Confirmation Modal */}
      <Modal
        isOpen={showDeletePlanModal}
        onClose={() => setShowDeletePlanModal(false)}
        title={selectedPlan ? `Delete Plan — ${selectedPlan.name}` : 'Delete Plan'}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This plan has <strong className="text-gray-900">{selectedPlan?.tenants}</strong> active tenants. 
            Deleting it will not affect existing subscribers but will remove it from new signups. This cannot be undone.
          </p>
          
          {selectedPlan?.tenants > 0 && (
            <div className="rounded-lg bg-amber-50 p-3 flex items-start gap-2 border border-amber-200">
               <Badge label="Warning" color="amber" />
               <p className="text-xs text-amber-800">Migrate or reassign tenants first to completely remove this plan from the system.</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button 
              label="Delete Plan" 
              variant="danger" 
              disabled={selectedPlan?.tenants > 0} 
              onClick={executeDelete}
            />
            <Button label="Cancel" variant="ghost" onClick={() => setShowDeletePlanModal(false)} />
          </div>
        </div>
      </Modal>

      {/* Add Plan Modal (Keep existing) */}
      <Modal
        isOpen={showAddPlanModal}
        onClose={() => setShowAddPlanModal(false)}
        title="Create New Plan"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Plan Name *</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20"
                placeholder="e.g. Growth Plus"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Monthly Price ($) *</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20"
                type="number"
                placeholder="999"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Annual Price ($)</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20"
                type="number"
                placeholder="9990 (10% off)"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Max Users</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20"
                type="number"
                placeholder="200"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Storage (GB)</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20"
                type="number"
                placeholder="25"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Included Modules</label>
            <div className="mt-2 flex flex-wrap gap-3">
              {['Employee Directory', 'Attendance', 'Leave', 'Payroll', 'Documents', 'API Access', 'Priority Support'].map((module) => (
                <label key={module} className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" className="accent-[#004CA5]" defaultChecked={['Employee Directory', 'Attendance', 'Leave', 'Documents'].includes(module)} />
                  {module}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button label="Create Plan" variant="primary" onClick={() => setShowAddPlanModal(false)} />
            <Button label="Cancel" variant="ghost" onClick={() => setShowAddPlanModal(false)} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
