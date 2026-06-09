import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../context/AuthContext.jsx';
import { useCurrency } from '../../../../context/CurrencyContext.jsx';
import { getBillingStatus, getPlans, startCheckout, confirmCheckout } from '../../../../services/tenantBillingService';

const errMsg = (e, fb) => e?.response?.data?.message || e?.message || fb;

const STATUS_BADGE = {
  active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700' },
  trial: { label: 'Trial', cls: 'bg-amber-50 text-amber-700' },
  past_due: { label: 'Payment due', cls: 'bg-red-50 text-red-700' },
  expired: { label: 'Expired', cls: 'bg-red-50 text-red-700' },
};

export default function BillingSettings() {
  const { user, refreshAccessProfile } = useAuth();
  const { format: fmt, breakdown } = useCurrency();
  const isAdmin = user?.role === 'admin';
  const [params, setParams] = useSearchParams();
  const [billing, setBilling] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [cycle, setCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const [b, p] = await Promise.all([getBillingStatus(), getPlans().catch(() => [])]);
      setBilling(b);
      setPlans(p);
      const current = p.find((x) => String(x.id) === String(b?.plan_id));
      setSelectedPlanId(String((current || p.find((x) => x.is_popular) || p[0])?.id ?? ''));
    } catch (e) {
      toast.error(errMsg(e, 'Failed to load billing information'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Returning from Stripe Checkout on this same tab — confirm and flip to paid.
    const stripe = params.get('stripe');
    const sessionId = params.get('session_id');
    if (stripe === 'success' && sessionId) {
      setLoading(true);
      confirmCheckout(sessionId)
        .then(async (res) => {
          if (res.paid) {
            toast.success('Payment successful! Your subscription is now active.');
            await refreshAccessProfile();
            setBilling(res.billing);
            await load();
          } else {
            toast.error('Payment was not completed. Please try again.');
            await load();
          }
        })
        .catch((e) => toast.error(errMsg(e, 'Could not confirm payment.')))
        .finally(() => {
          setLoading(false);
          // Strip stripe params, keep the billing tab selected.
          setParams({ tab: 'billing' }, { replace: true });
        });
      return;
    }
    if (stripe === 'cancelled') {
      toast.error('Payment was cancelled.');
      setParams({ tab: 'billing' }, { replace: true });
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const status = String(billing?.subscription_status || 'trial').toLowerCase();
  const badge = STATUS_BADGE[status] || STATUS_BADGE.trial;
  const isPaid = status === 'active';
  const selectedPlan = plans.find((p) => String(p.id) === String(selectedPlanId));
  const selectedPrice = selectedPlan ? (cycle === 'annual' ? selectedPlan.annual_price : selectedPlan.monthly_price) : 0;

  const pay = async () => {
    if (!selectedPlanId) {
      toast.error('Please select a plan first.');
      return;
    }
    setBusy(true);
    try {
      const res = await startCheckout(selectedPlanId, cycle, '/admin/settings?tab=billing');
      if (res?.url) {
        window.location.href = res.url;
        return;
      }
      if (res?.free) {
        // Free plan — activated server-side, no Stripe checkout needed.
        toast.success('Plan activated! Your subscription is now active.');
        if (res.billing) setBilling(res.billing);
        await refreshAccessProfile();
        await load();
        return;
      }
      toast.error('Could not start checkout.');
    } catch (e) {
      toast.error(errMsg(e, 'Could not start checkout.'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="py-10 text-center text-sm text-slate-400">Loading billing…</div>;
  }

  return (
    <div className="space-y-8">
      {/* Current subscription */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Subscription</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-600">Current Plan</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{billing?.plan_name || '—'}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-600">Status</p>
            <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-sm font-bold ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-600">
              {isPaid ? 'Billing' : 'Trial ends'}
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {isPaid
                ? 'Paid'
                : billing?.trial_ends_at
                  ? `${new Date(billing.trial_ends_at).toLocaleDateString()}${
                      billing?.days_left != null && billing.days_left >= 0 ? ` (${billing.days_left}d left)` : ' (expired)'
                    }`
                  : '—'}
            </p>
          </div>
        </div>
        {billing?.payment_required && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your access is limited until payment is completed. Choose a plan below and pay to restore full access.
          </div>
        )}
      </div>

      {/* Choose & pay */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{isPaid ? 'Change plan' : 'Choose a plan'}</h3>
          {plans.some((p) => p.annual_price > 0) && (
            <div className="inline-flex rounded-lg bg-slate-100 p-1 text-sm">
              <button
                type="button"
                onClick={() => setCycle('monthly')}
                className={`rounded-md px-3 py-1 font-semibold ${cycle === 'monthly' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setCycle('annual')}
                className={`rounded-md px-3 py-1 font-semibold ${cycle === 'annual' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}
              >
                Annual
              </button>
            </div>
          )}
        </div>

        {plans.length === 0 ? (
          <p className="rounded-lg border border-slate-200 p-4 text-sm text-slate-500">
            No plans available. Please contact support.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const active = String(plan.id) === String(selectedPlanId);
              const amount = cycle === 'annual' ? plan.annual_price : plan.monthly_price;
              const isCurrent = String(plan.id) === String(billing?.plan_id);
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(String(plan.id))}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                    active ? 'border-teal-700 shadow-md' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {plan.is_popular && (
                    <span className="absolute -top-2 right-3 rounded-full bg-teal-700 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      Popular
                    </span>
                  )}
                  <p className="text-sm font-bold text-slate-900">{plan.plan_name}</p>
                  <p className="mt-2 text-xl font-extrabold text-slate-900">
                    {fmt(amount)}
                    <span className="text-xs font-medium text-slate-400"> / {cycle === 'annual' ? 'yr' : 'mo'}</span>
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      active ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCurrent ? 'Current' : active ? 'Selected' : 'Select'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {isAdmin ? (
          plans.length > 0 && (
            <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row">
              <div className="text-sm text-slate-600">
                {selectedPlan ? (
                  (() => {
                    const bd = breakdown(selectedPrice);
                    return (
                      <div className="space-y-1">
                        <div>
                          {selectedPlan.plan_name} —{' '}
                          <span className="font-bold text-teal-700">
                            {fmt(selectedPrice)} / {cycle === 'annual' ? 'year' : 'month'}
                          </span>
                        </div>
                        {bd.taxEnabled && bd.taxRate > 0 && (
                          <div className="text-xs text-slate-500">
                            Subtotal {fmt(bd.subtotal)} + {bd.taxLabel} ({bd.taxRate}%) {fmt(bd.tax)} ={' '}
                            <span className="font-semibold text-slate-700">{fmt(bd.total)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  'Select a plan'
                )}
              </div>
              <button
                type="button"
                onClick={pay}
                disabled={busy || !selectedPlan}
                className="rounded-lg bg-teal-700 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-teal-800 disabled:opacity-50"
              >
                {busy ? 'Redirecting…' : isPaid ? 'Switch plan & pay' : 'Pay now'}
              </button>
            </div>
          )
        ) : (
          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            Only your organization admin can make payments.
          </p>
        )}
      </div>
    </div>
  );
}
