import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import api from '../../../services/api'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Toggle } from '../../../components/ui/Toggle.jsx'
import PlanPaymentStep from './PlanPaymentStep.jsx'
import settingsService from '../../../services/settingsService.js'
import { createStripeCheckoutSession } from '../../../services/billingService.js'
import {
  HiCheck,
  HiClock,
  HiDocumentText,
  HiXMark,
  HiArrowDownTray,
  HiUserCircle,
  HiKey,
  HiPlus,
  HiPencil,
  HiTrash,
  HiArrowTopRightOnSquare,
  HiCalendarDays,
  HiCreditCard,
  HiUsers,
  HiShieldCheck,
  HiQuestionMarkCircle,
  HiGlobeAlt,
  HiInformationCircle,
  HiSquares2X2,
  HiMagnifyingGlass,
  HiEye,
  HiEyeSlash
} from 'react-icons/hi2'

const slugify = (text) => text.toString().toLowerCase().trim()
  .replace(/\s+/g, '-')
  .replace(/[^\w-]+/g, '')
  .replace(/--+/g, '-')

const resolveBaseDomain = () => {
  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') return 'localhost'
  const parts = host.split('.')
  return parts.length >= 2 ? parts.slice(-2).join('.') : host
}

export default function TenantManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Data State
  const [organizations, setOrganisations] = useState([])
  const [plans, setPlans] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0) // 0-indexed for UI, 1-indexed for API
  const pageSize = 5

  useEffect(() => {
    fetchTenants(currentPage)
    fetchPlans()
  }, [currentPage, searchQuery, planFilter, statusFilter])

  const fetchPlans = async () => {
    try {
      const response = await api.get('/superadmin/plans/active')
      const list = response.data.data || []
      setPlans(list)
      if (list.length > 0) {
        setNewForm((prev) => ({ ...prev, plan: String(list[0].id) }))
        setEditForm((prev) => ({ ...prev, plan: list[0].plan_name }))
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    }
  }

  const fetchEnabledGateways = async () => {
    try {
      const res = await settingsService.getEnabledPaymentGateways()
      const list = Array.isArray(res?.data) ? res.data : []
      setPaymentGateways(list)
      if (list.length > 0) {
        setNewForm((prev) => ({
          ...prev,
          paymentGateway: prev.paymentGateway === 'manual' ? list[0].slug : prev.paymentGateway,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch payment gateways:', error)
      setPaymentGateways([])
    }
  }

  const fetchPlatformBillingContext = async () => {
    try {
      const currencyRes = await settingsService.getCurrency()
      setPlatformCurrency(currencyRes?.data?.defaultCurrency || 'AED')
    } catch {
      setPlatformCurrency('AED')
    }
  }


  const openNewOrgModal = () => {
    setAddOrgTab('details')
    setShowNewModal(true)
    fetchEnabledGateways()
    fetchPlatformBillingContext()
  }

  const resetNewOrgForm = () => {
    const defaultPlan = plans[0]?.id ? String(plans[0].id) : ''
    setNewForm({
      name: '',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
      plan: defaultPlan,
      billingCycle: 'monthly',
      paymentGateway: paymentGateways[0]?.slug || 'manual',
      paymentCollection: 'trial',
      paymentReference: '',
    })
    setShowNewPassword(false)
    setAddOrgTab('details')
  }

  const fetchTenants = async (page = 0) => {
    try {
      setIsLoading(true)
      const response = await api.get('/tenants', {
        params: {
          page: page + 1,
          limit: pageSize,
          search: searchQuery,
          plan: planFilter,
          status: statusFilter
        }
      })
      const { tenants, total } = response.data.data

      // Transform data to match UI expectations
      const transformed = tenants.map(t => {
        const slug = slugify(t.name)
        const baseDomain = resolveBaseDomain()
        return {
          id: t.id,
          name: t.name,
          dbName: t.db_name,
          domain: `${slug}.${baseDomain}`,
          adminEmail: t.admin_email,
          plan: t.plan || 'Free', // Use plan from API or default to Free
          users: 0,
          maxUsers: 100,
          storage: 0,
          maxStorage: 10,
          status: t.status.charAt(0).toUpperCase() + t.status.slice(1),
          created: new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          initials: t.name.substring(0, 2).toUpperCase(),
          color: 'indigo',
          domainType: 'Subdomain',
          billingCycle: 'Monthly'
        }
      })
      setOrganisations(transformed)
      setTotalCount(total)
    } catch (error) {
      console.error('Failed to fetch tenants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Modal States
  const [showNewModal, setShowNewModal] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showFeaturesModal, setShowFeaturesModal] = useState(false)

  const [selectedOrg, setSelectedOrg] = useState(null)
  const [confirmAction, setConfirmAction] = useState('')
  const [confirmInput, setConfirmInput] = useState('')
  const [tenantFeatures, setTenantFeatures] = useState([])
  const [isFeaturesLoading, setIsFeaturesLoading] = useState(false)

  // Form States
  const [resetForm, setResetForm] = useState({ password: '', confirmPassword: '' })
  const [editForm, setEditForm] = useState({ name: '', adminEmail: '', plan: '', billingCycle: 'Monthly', maxUsers: 50, status: 'Active' })
  const [addOrgTab, setAddOrgTab] = useState('details')
  const [paymentGateways, setPaymentGateways] = useState([])
  const [platformCurrency, setPlatformCurrency] = useState('AED')
  const [stripeCheckoutLoading, setStripeCheckoutLoading] = useState(false)
  const [newForm, setNewForm] = useState({
    name: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    plan: '',
    billingCycle: 'monthly',
    paymentGateway: 'manual',
    paymentCollection: 'trial',
    paymentReference: '',
  })

  const filteredOrganisations = organizations; // Now filtered on the server

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Domain', 'Admin Email', 'Plan', 'Status', 'Onboarded']
    const csvData = organizations.map(org => [
      org.id,
      org.name,
      org.domain,
      org.adminEmail,
      org.plan,
      org.status,
      org.created
    ])

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `organizations_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    Swal.fire({
      icon: 'success',
      title: 'Export Successful',
      text: 'Organisation data has been downloaded as CSV.',
      timer: 2000,
      showConfirmButton: false,
    })
  }

  const handleLoginAs = async (org) => {
    try {
      const response = await api.post(`/tenants/${org.id}/login-as`)
      const loginUrl = response?.data?.data?.loginUrl
      if (!loginUrl) {
        throw new Error('Login URL not returned')
      }
      const popup = window.open(loginUrl, '_blank')
      if (!popup) {
        Swal.fire({
          icon: 'warning',
          title: 'Popup Blocked',
          text: 'Please allow popups for this site and try again.',
          confirmButtonColor: '#0F766E',
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.response?.data?.message || 'Unable to login as tenant admin.',
        confirmButtonColor: '#0F766E',
      })
    }
  }

  const handleView = (org) => {
    setSelectedOrg(org)
    setShowDetailModal(true)
  }

  const fetchTenantFeatures = async (tenantId) => {
    try {
      setIsFeaturesLoading(true)
      const response = await api.get(`/tenants/${tenantId}/features`)
      setTenantFeatures(response?.data?.data?.features || [])
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Features Load Failed',
        text: error.response?.data?.message || 'Failed to load tenant features',
        confirmButtonColor: '#4f46e5'
      })
    } finally {
      setIsFeaturesLoading(false)
    }
  }

  const handleOpenFeatures = async (org) => {
    setSelectedOrg(org)
    setShowFeaturesModal(true)
    await fetchTenantFeatures(org.id)
  }

  const handleToggleFeature = async (feature) => {
    if (!selectedOrg) return
    try {
      await api.patch(`/tenants/${selectedOrg.id}/features/${feature.id}`, {
        isEnabled: !feature.isEnabled
      })
      setTenantFeatures(prev => prev.map(item => (
        item.id === feature.id
          ? { ...item, isEnabled: !item.isEnabled, isAssigned: true }
          : item
      )))
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Failed to update feature access',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  const handleEdit = (org) => {
    setSelectedOrg(org)
    setEditForm({
      name: org.name,
      adminEmail: org.adminEmail,
      plan: org.plan,
      billingCycle: org.billingCycle || 'Monthly',
      maxUsers: org.maxUsers,
      status: org.status
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editForm.name || !editForm.adminEmail) {
      Swal.fire({
        icon: 'warning',
        title: 'Required fields',
        text: 'Organisation name and admin email are required.',
        confirmButtonColor: '#4f46e5',
      })
      return
    }
    try {
      await api.patch(`/tenants/${selectedOrg.id}`, {
        name: editForm.name,
        adminEmail: editForm.adminEmail,
        status: editForm.status.toLowerCase()
      })
      setShowEditModal(false)
      fetchTenants()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Failed to update organization',
        confirmButtonColor: '#4f46e5'
      })
    }
  }

  const validateNewOrgForm = () => {
    if (!newForm.name || !newForm.adminEmail || !newForm.adminName || !newForm.adminPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill all required fields on the Organisation tab.',
        confirmButtonColor: '#4f46e5',
      })
      setAddOrgTab('details')
      return false
    }
    if (!newForm.plan) {
      Swal.fire({
        icon: 'warning',
        title: 'Select a plan',
        text: 'Choose a subscription plan on the Plan & payment tab.',
        confirmButtonColor: '#4f46e5',
      })
      setAddOrgTab('subscription')
      return false
    }
    return true
  }

  const buildCreateOrgPayload = () => ({
    name: newForm.name,
    adminEmail: newForm.adminEmail,
    adminName: newForm.adminName,
    adminPassword: newForm.adminPassword,
    plan_id: String(newForm.plan),
    billing_cycle: newForm.billingCycle,
    payment_gateway: newForm.paymentGateway,
    payment_collection: newForm.paymentCollection,
    payment_reference: newForm.paymentReference || undefined,
  })

  const openStripeCheckoutUrl = async (tenant, checkoutTab) => {
    const plan = plans.find((p) => String(p.id) === String(newForm.plan))
    const amount =
      newForm.billingCycle === 'annual'
        ? Number(plan?.annual_price)
        : Number(plan?.monthly_price)
    if (!Number.isFinite(amount) || amount <= 0) {
      checkoutTab?.close?.()
      Swal.fire({
        icon: 'info',
        title: 'No payment required',
        text: 'This plan has no charge — Stripe Checkout is not needed.',
        confirmButtonColor: '#4f46e5',
      })
      return false
    }

    const session = await createStripeCheckoutSession({
      tenantId: tenant.id,
      paymentId: tenant.paymentId,
      planId: tenant.planId || Number(newForm.plan),
      billingCycle: newForm.billingCycle,
      customerEmail: newForm.adminEmail,
    })

    if (!session?.url) {
      checkoutTab?.close?.()
      throw new Error('Stripe did not return a checkout URL')
    }

    if (checkoutTab && !checkoutTab.closed) {
      checkoutTab.location.href = session.url
      checkoutTab.focus()
    } else {
      const tab = window.open(session.url, '_blank', 'noopener,noreferrer')
      if (!tab) {
        Swal.fire({
          icon: 'info',
          title: 'Open Stripe Checkout',
          html: `<a href="${session.url}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 font-bold underline">Click here to pay in Stripe</a>`,
          confirmButtonColor: '#4f46e5',
        })
      } else {
        tab.focus()
      }
    }
    return true
  }

  const provisionOrganisation = async ({ openStripe = false, checkoutTab = null } = {}) => {
    if (!validateNewOrgForm()) {
      checkoutTab?.close?.()
      return null
    }

    try {
      if (openStripe) setStripeCheckoutLoading(true)
      else setIsLoading(true)

      const res = await api.post('/tenants/create', buildCreateOrgPayload())
      const tenant = res.data?.data?.tenant
      if (!tenant?.id) throw new Error('Tenant was created but the response was invalid')

      if (openStripe && newForm.paymentGateway === 'stripe') {
        await openStripeCheckoutUrl(tenant, checkoutTab)
      } else {
        checkoutTab?.close?.()
      }

      setShowNewModal(false)
      resetNewOrgForm()
      fetchTenants()

      if (openStripe && newForm.paymentGateway === 'stripe') {
        Swal.fire({
          icon: 'success',
          title: 'Organisation created',
          text: 'Complete payment in the Stripe tab. The organization is provisioned.',
          timer: 2800,
          showConfirmButton: false,
        })
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Organisation created',
          text: 'Tenant provisioned with subscription and payment record.',
          timer: 2200,
          showConfirmButton: false,
        })
      }

      return tenant
    } catch (error) {
      checkoutTab?.close?.()
      Swal.fire({
        icon: 'error',
        title: openStripe ? 'Stripe checkout failed' : 'Provisioning Failed',
        text: error.response?.data?.message || error.message || 'Failed to create organization',
        confirmButtonColor: '#ef4444',
      })
      return null
    } finally {
      setIsLoading(false)
      setStripeCheckoutLoading(false)
    }
  }

  const handlePaymentGatewayChange = (slug) => {
    setNewForm((prev) => ({ ...prev, paymentGateway: slug }))
  }

  const handleCreateOrganisation = async () => {
    // Superadmin provisions the org as a free trial and never collects payment here.
    // The org admin pays later from Settings → Billing (or superadmin can use
    // "Mark as Paid" to activate an org offline).
    await provisionOrganisation({ openStripe: false })
  }

  // Manual "mark as paid": superadmin activates an org on a chosen plan without
  // collecting money through a gateway (offline / bank transfer / comp).
  const handleMarkPaid = async (org) => {
    if (!org) return
    const planOptions = {}
    plans.forEach((p) => { planOptions[String(p.id)] = p.plan_name })
    if (Object.keys(planOptions).length === 0) {
      Swal.fire({ icon: 'warning', title: 'No plans', text: 'No subscription plans are available.' })
      return
    }
    const preselect = String(plans.find((p) => p.plan_name === org.plan)?.id || plans[0]?.id || '')
    const { value: planId, isConfirmed } = await Swal.fire({
      title: `Mark "${org.name}" as paid`,
      text: 'Select the plan to activate. This marks the organization as paid (offline) and unlocks the plan immediately.',
      input: 'select',
      inputOptions: planOptions,
      inputValue: preselect,
      showCancelButton: true,
      confirmButtonText: 'Mark as Paid',
      confirmButtonColor: '#0F766E',
      inputValidator: (v) => (!v ? 'Please select a plan' : undefined),
    })
    if (!isConfirmed || !planId) return
    try {
      await api.post(`/tenant-billing/${org.id}/activate`, { planId })
      await Swal.fire({ icon: 'success', title: 'Marked as paid', text: `${org.name} is now active on the selected plan.`, confirmButtonColor: '#0F766E' })
      setShowDetailModal(false)
      fetchTenants(currentPage)
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Failed', text: e?.response?.data?.message || e.message })
    }
  }

  const handleAction = (type, org) => {
    setSelectedOrg(org)
    if (type === 'reset_pw') {
      setResetForm({ password: '', confirmPassword: '' })
      setShowResetModal(true)
      return
    }
    setConfirmAction(type)
    setConfirmInput('')
    setShowConfirmModal(true)
  }

  const handleResetPassword = async () => {
    if (!resetForm.password || resetForm.password !== resetForm.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Passwords do not match or are empty.',
        confirmButtonColor: '#f59e0b'
      })
      return
    }
    try {
      setIsLoading(true)
      await api.post(`/tenants/${selectedOrg.id}/reset-password`, {
        password: resetForm.password
      })
      Swal.fire({
        icon: 'success',
        title: 'Credentials Updated',
        text: `Administrator password has been updated and emailed to ${selectedOrg.adminEmail}`,
        confirmButtonColor: '#4f46e5'
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Reset Failed',
        text: error.response?.data?.message || 'Failed to reset password',
        confirmButtonColor: '#ef4444'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const executeAction = async () => {
    if (confirmAction === 'delete' && confirmInput !== selectedOrg.name) {
      Swal.fire({
        icon: 'warning',
        title: 'Confirmation mismatch',
        text: 'Type the organization name exactly to confirm deletion.',
        confirmButtonColor: '#ef4444',
      })
      return
    }

    try {
      if (confirmAction === 'suspend') {
        await api.patch(`/tenants/${selectedOrg.id}`, { status: 'suspended' })
      } else if (confirmAction === 'delete') {
        await api.delete(`/tenants/${selectedOrg.id}`)
      } else if (confirmAction === 'reset_pw') {
        await api.post(`/tenants/${selectedOrg.id}/reset-password`)
        Swal.fire({
          icon: 'success',
          title: 'Reset Successful',
          text: `Administrator password has been reset and emailed to ${selectedOrg.adminEmail}`,
          confirmButtonColor: '#4f46e5'
        })
      }
      setShowConfirmModal(false)
      setShowDetailModal(false)
      fetchTenants()

      Swal.fire({
        icon: 'success',
        title: 'Action Executed',
        text: 'The requested administrative operation completed successfully.',
        timer: 2000,
        showConfirmButton: false
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text: error.response?.data?.message || 'Action failed',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Top Title Bar with Moved Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Organisation Management</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Tenants</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Organisation Management</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={handleExport} className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm">
            <HiArrowDownTray className="h-4 w-4" /> Export CSV
          </button>
          <button type="button" onClick={openNewOrgModal} className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm">
            <HiPlus className="h-4 w-4" /> Add Organisation
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          { label: 'TOTAL ORGANIZATIONS', count: totalCount, bgColor: 'bg-[#0F172A]', icon: HiGlobeAlt, filter: 'all', filterType: 'status' },
          { label: 'ACTIVE', count: organizations.filter(o => o.status === 'Active').length, bgColor: 'bg-[#10B981]', icon: HiCheck, filter: 'Active', filterType: 'status' },
          { label: 'TRIAL', count: organizations.filter(o => o.status === 'Trial').length, bgColor: 'bg-[#3B82F6]', icon: HiClock, filter: 'Trial', filterType: 'status' },
          { label: 'SUSPENDED', count: organizations.filter(o => o.status === 'Suspended').length, bgColor: 'bg-[#EF4444]', icon: HiXMark, filter: 'Suspended', filterType: 'status' }
        ].map((card, idx) => {
          const isActiveFilter = card.filterType === 'status' && statusFilter === card.filter;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => { if (card.filterType === 'status') setStatusFilter(card.filter) }}
              className={`group flex items-center gap-3.5 rounded-none border p-4 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] min-w-0 shadow-sm ${isActiveFilter ? 'border-[#0F766E] bg-slate-50/40 ring-1 ring-[#0F766E]' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}><card.icon className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className={`text-[11px] font-bold uppercase tracking-wider truncate leading-none ${isActiveFilter ? 'text-[#0F766E]' : 'text-slate-400'}`}>{card.label}</div>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Main Table Registry Area */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Organisation Listing</h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative min-w-[250px] flex-1 max-w-md">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search organizations..." className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium" />
            </div>
            <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="h-10 min-w-[180px] cursor-pointer rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]">
              <option value="all">All Ecosystem Tiers</option>
              {plans.map(p => <option key={p.id} value={p.plan_name}>{p.plan_name}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 min-w-[180px] cursor-pointer rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]">
              <option value="all">All Operational States</option>
              <option>Active</option><option>Trial</option><option>Suspended</option><option>SSL Issue</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-slate-500">{totalCount} records shown</p>
            {searchQuery || planFilter !== 'all' || statusFilter !== 'all' ? (
              <button type="button" onClick={() => { setSearchQuery(''); setPlanFilter('all'); setStatusFilter('all'); }} className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50">Reset Filters</button>
            ) : null}
          </div>
        </div>

        <Table
          pageSize={pageSize}
          square
          totalCount={totalCount}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          columns={[
            { key: 'org', label: 'Organisation' },
            { key: 'plan', label: 'Tier', className: 'hidden md:table-cell' },
            // { key: 'users', label: 'Nodes', className: 'hidden lg:table-cell' },
            { key: 'status', label: 'Status', className: 'hidden sm:table-cell' },
            { key: 'created', label: 'Onboarded', className: 'hidden xl:table-cell' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={filteredOrganisations.map((org) => ({
            org: (
              <div className="flex items-center gap-4 py-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${org.color}-50 text-[11px] font-black text-${org.color}-600 border border-${org.color}-100 shadow-sm`}>
                  {org.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 tracking-tight">{org.name}</div>
                  <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{org.domain}</div>
                </div>
              </div>
            ),
            plan: <Badge label={org.plan} color={org.plan === 'Enterprise' ? 'amber' : org.plan === 'Growth' ? 'cyan' : org.plan === 'Pro' ? 'indigo' : 'gray'} variant="glass" />,
            users: (
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">{org.users}</span>
                <span className="text-[10px] font-bold text-slate-400">/ {org.maxUsers}</span>
              </div>
            ),
            status: <Badge label={org.status} color={org.status === 'Active' ? 'green' : org.status === 'Trial' ? 'amber' : org.status === 'Suspended' ? 'gray' : 'red'} />,
            created: <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{org.created}</span>,
            actions: (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => handleView(org)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-slate-500 text-white transition-colors hover:bg-slate-600" title="View details"><HiDocumentText className="h-4 w-4" /></button>
                <button type="button" onClick={() => handleEdit(org)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-sky-500 text-white transition-colors hover:bg-sky-600" title="Edit organization"><HiPencil className="h-4 w-4" /></button>
                <button type="button" onClick={() => handleOpenFeatures(org)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-violet-500 text-white transition-colors hover:bg-violet-600" title="Manage features"><HiSquares2X2 className="h-4 w-4" /></button>
                <button type="button" onClick={() => handleLoginAs(org)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-emerald-500 text-white transition-colors hover:bg-emerald-600" title="Login as Admin"><HiArrowTopRightOnSquare className="h-4 w-4" /></button>
              </div>
            ),
          }))}
        />
      </div>

      {/* New Organisation Modal */}
      <Modal
        isOpen={showNewModal}
        onClose={() => { setShowNewModal(false); resetNewOrgForm() }}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Add Organisation</h2>
            <p className="text-sm text-slate-500">Organisation details, subscription plan, and payment collection.</p>
          </div>
        }
        size="xl"
      >
        <div className="space-y-6">
          <div className="flex gap-1 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setAddOrgTab('details')}
              className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${addOrgTab === 'details'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              Organisation
            </button>
            <button
              type="button"
              onClick={() => setAddOrgTab('subscription')}
              className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${addOrgTab === 'subscription'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              Plan & payment
            </button>
          </div>

          {addOrgTab === 'details' ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input label="Organisation Name" required placeholder="e.g. HRIS Global" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} />
              <Input label="Root Admin Name" required placeholder="e.g. John Doe" value={newForm.adminName} onChange={(e) => setNewForm({ ...newForm, adminName: e.target.value })} />
              <Input label="Root Admin Email" required type="email" placeholder="admin@org.com" value={newForm.adminEmail} onChange={(e) => setNewForm({ ...newForm, adminEmail: e.target.value })} />
              <Input
                label="Root Admin Password"
                required
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={newForm.adminPassword}
                onChange={(e) => setNewForm({ ...newForm, adminPassword: e.target.value })}
                suffix={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowNewPassword((s) => !s)}
                    className="text-slate-400 transition-colors hover:text-[#0F766E]"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                  </button>
                }
              />
            </div>
          ) : (
            <PlanPaymentStep
              plans={plans}
              selectedPlanId={newForm.plan}
              onSelectPlan={(id) => setNewForm((prev) => ({ ...prev, plan: id }))}
              billingCycle={newForm.billingCycle}
              onBillingCycleChange={(v) => setNewForm((prev) => ({ ...prev, billingCycle: v }))}
              paymentGateways={paymentGateways}
              paymentGateway={newForm.paymentGateway}
              onPaymentGatewayChange={handlePaymentGatewayChange}
              stripeCheckoutLoading={stripeCheckoutLoading}
              currencyCode={platformCurrency}
              paymentCollection={newForm.paymentCollection}
              onPaymentCollectionChange={(v) => setNewForm((prev) => ({ ...prev, paymentCollection: v }))}
              paymentReference={newForm.paymentReference}
              onPaymentReferenceChange={(v) => setNewForm((prev) => ({ ...prev, paymentReference: v }))}
            />
          )}

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button type="button" onClick={() => { setShowNewModal(false); resetNewOrgForm() }} className="rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            {addOrgTab === 'subscription' ? (
              <button type="button" onClick={() => setAddOrgTab('details')} className="rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Back</button>
            ) : (
              <button type="button" onClick={() => setAddOrgTab('subscription')} className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64] transition-colors">Next: Plan & payment</button>
            )}
            {addOrgTab === 'subscription' && (
              <button type="button" onClick={handleCreateOrganisation} disabled={isLoading || stripeCheckoutLoading} className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64] transition-colors disabled:opacity-50">
                {isLoading || stripeCheckoutLoading ? 'Creating…' : 'Create organization (trial)'}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">{selectedOrg?.name}</h2>
            <p className="text-sm text-slate-500">Organisation ID: {selectedOrg?.id} · Domain: {selectedOrg?.domain}</p>
          </div>
        }
        size="lg"
      >
        {selectedOrg && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/80 min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Admin Email</span>
                <p className="mt-0.5 text-xs font-bold text-slate-700 break-words">{selectedOrg.adminEmail}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/80 min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Database Name</span>
                <p className="mt-0.5 text-[11px] font-mono font-bold text-indigo-500 break-words">{selectedOrg.dbName}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/80 min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Billing Plan</span>
                <p className="mt-0.5 text-xs font-bold text-slate-700 break-words">{selectedOrg.plan} ({selectedOrg.billingCycle})</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/80 min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Join Date</span>
                <p className="mt-0.5 text-xs font-bold text-slate-700 break-words">{selectedOrg.created}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/50">
              <div className="space-y-0.5">
                <h4 className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">Management Actions</h4>
                <p className="text-[10px] text-indigo-600/70">Securely orchestrate organization nodes.</p>
              </div>
              <div className="flex gap-2">
                <div className="group relative">
                  <Button variant="ghost" size="sm" icon={HiArrowTopRightOnSquare} className="bg-white shadow-sm text-indigo-600 hover:bg-indigo-600 hover:text-white" onClick={() => handleLoginAs(selectedOrg)} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[9px] font-bold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">Login as Admin</div>
                </div>
                <div className="group relative">
                  <Button variant="ghost" size="sm" icon={HiKey} className="bg-white shadow-sm text-amber-600 hover:bg-amber-600 hover:text-white" onClick={() => handleAction('reset_pw', selectedOrg)} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[9px] font-bold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">Reset Password</div>
                </div>
                <div className="group relative">
                  <Button variant="ghost" size="sm" icon={HiPencil} className="bg-white shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white" onClick={() => handleEdit(selectedOrg)} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[9px] font-bold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">Edit Details</div>
                </div>
                <div className="group relative">
                  <Button variant="ghost" size="sm" icon={HiSquares2X2} className="bg-white shadow-sm text-violet-600 hover:bg-violet-600 hover:text-white" onClick={() => handleOpenFeatures(selectedOrg)} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[9px] font-bold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">Manage Features</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Billing</span>
              <button type="button" onClick={() => handleMarkPaid(selectedOrg)} className="rounded-none border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors inline-flex items-center gap-1.5"><HiCreditCard className="h-4 w-4" /> Mark as Paid (select plan)</button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Danger Zone</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleAction('suspend', selectedOrg)} className="rounded-none border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors inline-flex items-center gap-1.5"><HiClock className="h-4 w-4" /> Suspend</button>
                <button type="button" onClick={() => handleAction('delete', selectedOrg)} className="rounded-none border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors inline-flex items-center gap-1.5"><HiTrash className="h-4 w-4" /> Delete</button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Features Modal */}
      <Modal
        isOpen={showFeaturesModal}
        onClose={() => setShowFeaturesModal(false)}
        title={`Feature Access · ${selectedOrg?.name || ''}`}
        description={`Tenant ID: ${selectedOrg?.id || '-'} · Configure feature overrides`}
        icon={HiSquares2X2}
        size="lg"
      >
        <div className="space-y-5 p-2">
          {isFeaturesLoading ? (
            <div className="py-10 text-center text-sm font-semibold text-slate-500">Loading features...</div>
          ) : tenantFeatures.length === 0 ? (
            <div className="py-10 text-center text-sm font-semibold text-slate-500">No features found.</div>
          ) : (
            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {tenantFeatures.map((feature) => (
                <div key={feature.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="pr-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">{feature.name}</p>
                      {!feature.isActive && <Badge label="Inactive" color="gray" />}
                      {feature.isAssigned && <Badge label="Override" color="indigo" variant="glass" />}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{feature.code}</p>
                    {feature.description && (
                      <p className="mt-1 text-xs text-slate-600">{feature.description}</p>
                    )}
                  </div>
                  <Toggle
                    checked={Boolean(feature.isEnabled)}
                    disabled={!feature.isActive}
                    onChange={() => handleToggleFeature(feature)}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end border-t border-slate-100 pt-4">
            <Button label="Close" variant="ghost" className="font-bold text-slate-500" onClick={() => setShowFeaturesModal(false)} />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Edit Organisation</h2>
            <p className="text-sm text-slate-500">Update organization details and resource limits.</p>
          </div>
        }
      >
        <div className="space-y-6">
          <Input label="Organisation Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <Input label="Root Admin Email" value={editForm.adminEmail} onChange={(e) => setEditForm({ ...editForm, adminEmail: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <label className="mb-2 block text-[11px] font-black text-slate-400 uppercase tracking-widest">Ecosystem Plan</label>
              <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all" value={editForm.plan} onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.plan_name}>{plan.plan_name}</option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className="mb-2 block text-[11px] font-black text-slate-400 uppercase tracking-widest">Operational Status</label>
              <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                <option>Active</option><option>Trial</option><option>Suspended</option><option>SSL Issue</option>
              </select>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button type="button" onClick={() => setShowEditModal(false)} className="rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="button" onClick={handleSaveEdit} className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64] transition-colors">Save</button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Update Credentials"
        description={`Set a new administrator password for ${selectedOrg?.name}.`}
        icon={HiKey}
      >
        <div className="space-y-5 p-2">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 mb-2">
            <div className="flex gap-3">
              <HiInformationCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
                The new password will be updated instantly in the tenant's database and sent to <span className="font-bold underline">{selectedOrg?.adminEmail}</span>.
              </p>
            </div>
          </div>

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={resetForm.password}
            onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={resetForm.confirmPassword}
            onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
          />

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button
              label="Cancel"
              variant="ghost"
              className="flex-1 font-bold text-slate-400"
              onClick={() => setShowResetModal(false)}
            />
            <Button
              label="Update & Email"
              variant="primary"
              className="flex-1"
              onClick={handleResetPassword}
              loading={isLoading}
              disabled={!resetForm.password || resetForm.password !== resetForm.confirmPassword || isLoading}
            />
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Security Handshake"
        description={confirmAction === 'delete' ? 'This will permanently purge all organizational data and nodes. This action is irreversible.' :
          confirmAction === 'suspend' ? 'This will immediately revoke access to all ecosystem users.' :
            'A secure password reset sequence will be triggered for the root administrator.'}
        icon={HiShieldCheck}
      >
        <div className="space-y-6 p-2">
          {confirmAction === 'delete' && (
            <Input label={`Type "${selectedOrg?.name}" to authorize purge`} value={confirmInput} onChange={(e) => setConfirmInput(e.target.value)} />
          )}
          <div className="flex gap-3 pt-2">
            <Button label="Cancel" variant="ghost" className="flex-1 font-bold text-slate-400" onClick={() => setShowConfirmModal(false)} />
            <Button
              label={confirmAction === 'delete' ? 'Delete' : 'Save'}
              variant={confirmAction === 'delete' ? 'danger' : 'primary'}
              className="flex-1"
              onClick={executeAction}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
