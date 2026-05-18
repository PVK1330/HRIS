import {
  HiCheck,
  HiCreditCard,
  HiBuildingLibrary,
  HiSparkles,
} from 'react-icons/hi2'

const GATEWAY_ICONS = {
  stripe: HiCreditCard,
  paypal: HiCreditCard,
  razorpay: HiCreditCard,
  offline: HiBuildingLibrary,
  manual: HiBuildingLibrary,
}

function formatMoney(amount) {
  const n = Number(amount)
  if (!Number.isFinite(n)) return '0.00'
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function PlanPaymentStep({
  plans = [],
  selectedPlanId,
  onSelectPlan,
  billingCycle,
  onBillingCycleChange,
  paymentGateways = [],
  paymentGateway,
  onPaymentGatewayChange,
  paymentCollection,
  onPaymentCollectionChange,
  paymentReference,
  onPaymentReferenceChange,
  stripeCheckoutLoading = false,
  currencyCode = 'AED',
}) {
  const selectedPlan = plans.find((p) => String(p.id) === String(selectedPlanId))

  const displayPrice =
    billingCycle === 'annual'
      ? selectedPlan?.annual_price
      : selectedPlan?.monthly_price

  const isOnlineGateway = ['stripe', 'paypal', 'razorpay'].includes(paymentGateway)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Choose a subscription plan</h3>
        <p className="mt-1 text-xs text-slate-500">
          Compare plans and included platform modules for this organization.
        </p>
      </div>

      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => onBillingCycleChange('monthly')}
          className={`rounded-md px-4 py-2 text-xs font-bold transition-all ${
            billingCycle === 'monthly'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Monthly billing
        </button>
        <button
          type="button"
          onClick={() => onBillingCycleChange('annual')}
          className={`rounded-md px-4 py-2 text-xs font-bold transition-all ${
            billingCycle === 'annual'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Annual billing
        </button>
      </div>

      <div className="grid max-h-[280px] gap-4 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3 custom-scrollbar">
        {plans.map((plan) => {
          const selected = String(plan.id) === String(selectedPlanId)
          const price =
            billingCycle === 'annual' ? plan.annual_price : plan.monthly_price
          const features = plan.features || []
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelectPlan(String(plan.id))}
              className={`relative flex flex-col rounded-xl border-2 p-4 text-left transition-all ${
                selected
                  ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              {plan.is_popular && (
                <span className="absolute -top-2 right-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                  <HiSparkles className="h-3 w-3" />
                  Popular
                </span>
              )}
              {selected && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <HiCheck className="h-3.5 w-3.5" />
                </span>
              )}
              <p className="pr-6 text-sm font-bold text-slate-900">{plan.plan_name}</p>
              <p className="mt-1 text-lg font-black text-indigo-600">
                {currencyCode} {formatMoney(price)}
                <span className="text-xs font-semibold text-slate-400">
                  /{billingCycle === 'annual' ? 'yr' : 'mo'}
                </span>
              </p>
              {plan.plan_description && (
                <p className="mt-2 line-clamp-2 text-xs text-slate-500">{plan.plan_description}</p>
              )}
              <ul className="mt-3 flex-1 space-y-1 border-t border-slate-100 pt-3">
                {features.length === 0 ? (
                  <li className="text-xs text-slate-400">No features listed</li>
                ) : (
                  features.slice(0, 6).map((f) => (
                    <li key={f.id} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <HiCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span className="line-clamp-1">{f.feature_name || f.name}</span>
                    </li>
                  ))
                )}
                {features.length > 6 && (
                  <li className="text-[10px] font-semibold text-indigo-500">
                    +{features.length - 6} more modules
                  </li>
                )}
              </ul>
              {plan.trial_days > 0 && (
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                  {plan.trial_days}-day trial included
                </p>
              )}
            </button>
          )
        })}
      </div>

      {selectedPlan && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            All features in {selectedPlan.plan_name}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(selectedPlan.features || []).map((f) => (
              <span
                key={f.id}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700"
              >
                <HiCheck className="h-3 w-3 text-emerald-500" />
                {f.feature_name || f.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-sm font-bold text-slate-900">Payment gateway</h3>
        <p className="mt-1 text-xs text-slate-500">
          Select how subscription fees will be collected from this organization.
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {paymentGateways.map((gw) => {
            const Icon = GATEWAY_ICONS[gw.slug] || HiCreditCard
            const active = paymentGateway === gw.slug
            return (
              <button
                key={gw.slug}
                type="button"
                onClick={() => onPaymentGatewayChange(gw.slug, gw)}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                  active
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">{gw.name}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    {gw.testMode ? 'Test mode' : 'Live'} · {gw.slug}
                  </p>
                </div>
                {active && <HiCheck className="h-5 w-5 shrink-0 text-indigo-600" />}
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => onPaymentGatewayChange('manual')}
            className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
              paymentGateway === 'manual'
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                paymentGateway === 'manual'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <HiBuildingLibrary className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">Manual</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Record in billing later
              </p>
            </div>
            {paymentGateway === 'manual' && (
              <HiCheck className="h-5 w-5 shrink-0 text-indigo-600" />
            )}
          </button>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Collection at onboarding
          </label>
          <select
            value={paymentCollection}
            onChange={(e) => onPaymentCollectionChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="trial">Start trial — invoice pending (recommended)</option>
            <option value="pending">Record pending payment (awaiting collection)</option>
            <option value="completed">Mark as paid now (manual / offline receipt)</option>
          </select>
          {selectedPlan && Number(displayPrice) > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              Amount due: <strong className="text-slate-800">{currencyCode} {formatMoney(displayPrice)}</strong>
              {paymentCollection === 'trial' && selectedPlan.trial_days > 0
                ? ` after ${selectedPlan.trial_days}-day trial`
                : ''}
            </p>
          )}
          {paymentGateway === 'stripe' && (
            <p className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/80 px-3 py-2 text-xs text-indigo-800">
              {stripeCheckoutLoading
                ? 'Creating organization and opening Stripe Checkout in a new tab…'
                : 'Use “Create & pay with Stripe” to provision the organization and open checkout in a new tab (uses your platform currency and timezone from General / Currency settings).'}
            </p>
          )}
          {isOnlineGateway && paymentGateway !== 'stripe' && paymentCollection === 'completed' && (
            <p className="mt-2 text-xs text-amber-700">
              Online checkout for this gateway is not wired yet — use Stripe or record payment manually.
            </p>
          )}
        </div>

        {(paymentCollection === 'completed' || paymentGateway === 'offline') && (
          <div className="mt-4">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Payment reference (optional)
            </label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => onPaymentReferenceChange(e.target.value)}
              placeholder="Transaction ID, cheque no., bank ref…"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        )}
      </div>
    </div>
  )
}
