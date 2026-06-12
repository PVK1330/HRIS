import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HiLockClosed, HiArrowRightOnRectangle, HiCheckCircle, HiExclamationTriangle, HiStar, HiArrowRight } from 'react-icons/hi2'
import { useAuth } from '../../../context/AuthContext.jsx'
import { useCurrency } from '../../../context/CurrencyContext.jsx'
import { getBillingStatus, getPlans, startCheckout, confirmCheckout } from '../../../services/tenantBillingService'

const errMsg = (e, fb) => e?.response?.data?.message || e?.message || fb

export default function PaymentPage() {
  const { user, logout, refreshAccessProfile } = useAuth()
  const { format: fmt, breakdown } = useCurrency()
  const [params, setParams] = useSearchParams()
  const [billing, setBilling] = useState(user?.billing ?? null)
  const [plans, setPlans] = useState([])
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [cycle, setCycle] = useState('monthly')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null) // { type, text }

  const load = async () => {
    try {
      const [b, p] = await Promise.all([getBillingStatus(), getPlans().catch(() => [])])
      setBilling(b)
      setPlans(p)
      // Preselect the org's current plan, else the popular/first one.
      const current = p.find((x) => String(x.id) === String(b?.plan_id))
      const popular = p.find((x) => x.is_popular)
      setSelectedPlanId(String((current || popular || p[0])?.id ?? ''))
    } catch (e) {
      setMsg({ type: 'err', text: errMsg(e, 'Could not load billing status.') })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const stripe = params.get('stripe')
    const sessionId = params.get('session_id')
    if (stripe === 'success' && sessionId) {
      setLoading(true)
      confirmCheckout(sessionId)
        .then(async (res) => {
          if (res.paid) {
            setMsg({ type: 'ok', text: 'Payment successful! Your subscription is now active.' })
            await refreshAccessProfile()
            setBilling(res.billing)
            await load()
          } else {
            setMsg({ type: 'err', text: 'Payment was not completed. Please try again.' })
            await load()
          }
        })
        .catch((e) => setMsg({ type: 'err', text: errMsg(e, 'Could not confirm payment.') }))
        .finally(() => {
          setLoading(false)
          setParams({}, { replace: true })
        })
      return
    }
    if (stripe === 'cancelled') {
      setMsg({ type: 'err', text: 'Payment was cancelled.' })
      setParams({}, { replace: true })
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isAdmin = user?.role === 'admin'
  const hasAccess = billing && !billing.payment_required
  const isTrial = String(billing?.subscription_status || '') === 'trial'
  const currentPlanId = billing?.plan_id != null ? String(billing.plan_id) : null
  const selectedPlan = plans.find((p) => String(p.id) === String(selectedPlanId))
  const isCurrentPlan = Boolean(selectedPlan && currentPlanId && String(selectedPlan.id) === currentPlanId)
  const selectedPrice = selectedPlan
    ? cycle === 'annual'
      ? selectedPlan.annual_price
      : selectedPlan.monthly_price
    : 0

  // Subscription status pill shown on the summary card.
  const statusMeta = billing?.payment_required
    ? { label: isTrial ? 'Trial ended' : 'Payment required', cls: 'border-red-200 bg-red-50 text-red-700' }
    : isTrial
      ? {
          label: billing?.days_left != null ? `Trial · ${billing.days_left} day${billing.days_left === 1 ? '' : 's'} left` : 'Free trial',
          cls: 'border-amber-200 bg-amber-50 text-amber-700',
        }
      : { label: 'Active', cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' }

  // The pay/upgrade button adapts to the org's situation and the selected plan.
  const ctaLabel = busy
    ? 'Redirecting…'
    : billing?.payment_required
      ? 'Pay now'
      : isTrial
        ? (isCurrentPlan ? 'Upgrade to paid plan' : 'Choose this plan')
        : (isCurrentPlan ? 'Renew plan' : 'Switch to this plan')

  const pay = async () => {
    if (!selectedPlanId) {
      setMsg({ type: 'err', text: 'Please select a plan first.' })
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      const res = await startCheckout(selectedPlanId, cycle, '/admin/payment')
      if (res?.url) {
        window.location.href = res.url
        return
      }
      if (res?.free) {
        // Free plan — activated server-side, no Stripe checkout needed.
        setMsg({ type: 'ok', text: 'Plan activated! Your subscription is now active.' })
        if (res.billing) setBilling(res.billing)
        await refreshAccessProfile()
        await load()
        return
      }
      setMsg({ type: 'err', text: 'Could not start checkout.' })
    } catch (e) {
      setMsg({ type: 'err', text: errMsg(e, 'Could not start checkout.') })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-start justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F766E]/10 text-[#0F766E]">
              {billing?.payment_required ? <HiLockClosed className="h-6 w-6" /> : <HiStar className="h-6 w-6" />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {billing?.payment_required ? 'Choose a plan to continue' : 'Manage your subscription'}
              </h1>
              <p className="text-sm text-gray-500">{user?.tenantName || 'Your organization'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-600"
          >
            <HiArrowRightOnRectangle className="h-4 w-4" />
            Sign out
          </button>
        </div>

        {msg && (
          <div
            className={`mb-5 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
              msg.type === 'ok'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {msg.type === 'ok' ? <HiCheckCircle className="h-5 w-5 shrink-0" /> : <HiExclamationTriangle className="h-5 w-5 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
            Loading…
          </div>
        ) : (
          <>
            {/* ── Current subscription summary ─────────────────────────────── */}
            <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Current subscription</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {billing?.plan_name || (isTrial ? 'Free trial' : 'No plan selected')}
                  </p>
                  {billing?.plan_name && billing?.monthly_price != null && (
                    <p className="text-xs text-gray-500">
                      {fmt(billing.monthly_price)} / mo
                      {billing?.annual_price != null ? ` · ${fmt(billing.annual_price)} / yr` : ''}
                    </p>
                  )}
                  {isTrial && billing?.trial_ends_at && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      Trial {billing?.payment_required ? 'ended' : 'ends'} {new Date(billing.trial_ends_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-bold ${statusMeta.cls}`}>
                  {statusMeta.label}
                </span>
              </div>
              {hasAccess && (
                <a
                  href="/admin/dashboard"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#0F766E] hover:text-[#0D5F57]"
                >
                  Go to dashboard <HiArrowRight className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Gated notice */}
            {billing?.payment_required && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {isTrial ? 'Your free trial has ended.' : 'A payment is required to continue.'}{' '}
                {isAdmin
                  ? 'Select a plan below and complete payment to restore access.'
                  : 'Please ask your organization admin to choose a plan and pay.'}
              </div>
            )}

            {/* ── Plan selection ───────────────────────────────────────────── */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-gray-700">
                {hasAccess && !isTrial ? 'Renew or change your plan' : 'Choose your plan'}
              </h2>

              {/* Billing cycle toggle */}
              {plans.length > 0 && (
                <div className="inline-flex rounded-lg bg-gray-100 p-1 text-sm">
                  <button
                    type="button"
                    onClick={() => setCycle('monthly')}
                    className={`rounded-md px-4 py-1.5 font-semibold ${cycle === 'monthly' ? 'bg-white text-[#0F766E] shadow-sm' : 'text-gray-500'}`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setCycle('annual')}
                    className={`rounded-md px-4 py-1.5 font-semibold ${cycle === 'annual' ? 'bg-white text-[#0F766E] shadow-sm' : 'text-gray-500'}`}
                  >
                    Annual
                  </button>
                </div>
              )}
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => {
                const active = String(plan.id) === String(selectedPlanId)
                const isCurrent = currentPlanId && String(plan.id) === currentPlanId
                const amount = cycle === 'annual' ? plan.annual_price : plan.monthly_price
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(String(plan.id))}
                    className={`relative rounded-2xl border-2 bg-white p-5 text-left transition-all ${
                      active ? 'border-[#0F766E] shadow-lg shadow-teal-700/10' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="absolute -top-2.5 right-4 flex items-center gap-1">
                      {isCurrent && (
                        <span className="inline-flex items-center rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                          Current
                        </span>
                      )}
                      {plan.is_popular && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#0F766E] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                          <HiStar className="h-3 w-3" /> Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-900">{plan.plan_name}</p>
                    {plan.plan_description && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">{plan.plan_description}</p>
                    )}
                    <p className="mt-3 text-2xl font-extrabold text-gray-900">
                      {fmt(amount)}
                      <span className="text-sm font-medium text-gray-400"> / {cycle === 'annual' ? 'yr' : 'mo'}</span>
                    </p>
                    <span
                      className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        active ? 'bg-[#0F766E]/10 text-[#0F766E]' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {active ? 'Selected' : 'Select'}
                    </span>
                  </button>
                )
              })}
            </div>

            {plans.length === 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
                No plans are available right now. Please contact support.
              </div>
            )}

            {/* Pay / upgrade bar */}
            {isAdmin && plans.length > 0 && (
              <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row">
                <div className="text-sm text-gray-600">
                  {selectedPlan ? (
                    (() => {
                      const bd = breakdown(selectedPrice)
                      return (
                        <div className="space-y-1">
                          <div>
                            Selected: <span className="font-bold text-gray-900">{selectedPlan.plan_name}</span> —{' '}
                            <span className="font-bold text-[#0F766E]">
                              {fmt(selectedPrice)} / {cycle === 'annual' ? 'year' : 'month'}
                            </span>
                            {isCurrentPlan && <span className="ml-1 text-xs font-semibold text-emerald-600">(current plan)</span>}
                          </div>
                          {bd.taxEnabled && bd.taxRate > 0 && (
                            <div className="text-xs text-gray-500">
                              Subtotal {fmt(bd.subtotal)} + {bd.taxLabel} ({bd.taxRate}%) {fmt(bd.tax)} ={' '}
                              <span className="font-semibold text-gray-700">{fmt(bd.total)}</span>
                            </div>
                          )}
                        </div>
                      )
                    })()
                  ) : (
                    'Select a plan to continue'
                  )}
                </div>
                <button
                  type="button"
                  onClick={pay}
                  disabled={busy || !selectedPlan}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#0F766E] px-6 py-3 text-base font-bold text-white shadow-lg shadow-teal-700/20 hover:bg-[#0D5F57] disabled:opacity-50 sm:w-auto"
                >
                  {ctaLabel}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
