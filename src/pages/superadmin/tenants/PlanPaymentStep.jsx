import { HiCheck, HiSparkles } from 'react-icons/hi2'
import { useCurrency } from '../../../context/CurrencyContext.jsx'

export default function PlanPaymentStep({
  plans = [],
  selectedPlanId,
  onSelectPlan,
  billingCycle,
  onBillingCycleChange,
  paymentCollection,
  onPaymentCollectionChange,
  trialSettings = { trialEnabled: false, trialDays: 0 },
}) {
  const { format: fmt, breakdown } = useCurrency()

  const selectedPlan = plans.find((p) => String(p.id) === String(selectedPlanId))

  const displayPrice =
    billingCycle === 'annual'
      ? selectedPlan?.annual_price
      : selectedPlan?.monthly_price

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
              ? 'bg-white text-[#0F766E] shadow-sm'
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
              ? 'bg-white text-[#0F766E] shadow-sm'
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
                  ? 'border-[#0F766E] bg-teal-50/40 ring-2 ring-[#0F766E]/20'
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
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#0F766E] text-white">
                  <HiCheck className="h-3.5 w-3.5" />
                </span>
              )}
              <p className="pr-6 text-sm font-bold text-slate-900">{plan.plan_name}</p>
              <p className="mt-1 text-lg font-black text-[#0F766E]">
                {fmt(price)}
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
                  <li className="text-[10px] font-semibold text-[#0F766E]">
                    +{features.length - 6} more modules
                  </li>
                )}
              </ul>
              {trialSettings.trialEnabled && trialSettings.trialDays > 0 && (
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                  {trialSettings.trialDays}-day trial included
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
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Collection at onboarding
        </label>
        <select
          value={paymentCollection}
          onChange={(e) => onPaymentCollectionChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-[#0F766E]"
        >
          <option value="trial">Start trial — invoice pending (recommended)</option>
          <option value="pending">Record pending payment (awaiting collection)</option>
          <option value="completed">Mark as paid now (select gateway next)</option>
        </select>

        {selectedPlan && Number(displayPrice) > 0 && (() => {
          const bill = breakdown(displayPrice)
          const showTax = bill.taxEnabled && bill.taxRate > 0
          return (
            <div className="mt-2 text-xs text-slate-500">
              {showTax ? (
                <div className="space-y-0.5">
                  <p className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="text-slate-700">{fmt(bill.subtotal)}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>{bill.taxLabel} ({bill.taxRate}%)</span>
                    <span className="text-slate-700">{fmt(bill.tax)}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>
                      Amount due
                      {paymentCollection === 'trial' && trialSettings.trialEnabled && trialSettings.trialDays > 0
                        ? ` after ${trialSettings.trialDays}-day trial`
                        : ''}
                    </span>
                    <strong className="text-slate-800">{fmt(bill.total)}</strong>
                  </p>
                </div>
              ) : (
                <p>
                  Amount due: <strong className="text-slate-800">{fmt(displayPrice)}</strong>
                  {paymentCollection === 'trial' && trialSettings.trialEnabled && trialSettings.trialDays > 0
                    ? ` after ${trialSettings.trialDays}-day trial`
                    : ''}
                </p>
              )}
            </div>
          )
        })()}

        {paymentCollection === 'completed' && (
          <p className="mt-3 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-xs text-amber-800">
            After creating the organisation you will be prompted to select a payment gateway to record the payment.
          </p>
        )}
      </div>
    </div>
  )
}
