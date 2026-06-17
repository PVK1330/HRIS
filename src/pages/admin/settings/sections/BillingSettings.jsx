import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../context/AuthContext.jsx';
import { useCurrency } from '../../../../context/CurrencyContext.jsx';
import {
  getBillingStatus,
  getPlans,
  getEnabledGateways,
  startCheckout,
  confirmCheckout,
  startPaypalCheckout,
  confirmPaypalCheckout,
} from '../../../../services/tenantBillingService';

const errMsg = (e, fb) => e?.response?.data?.message || e?.message || fb;

const STATUS_BADGE = {
  active:   { label: 'Active',       cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  trial:    { label: 'Trial',        cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  past_due: { label: 'Payment Due',  cls: 'bg-red-50 text-red-700 border border-red-200' },
  expired:  { label: 'Expired',      cls: 'bg-red-50 text-red-700 border border-red-200' },
};

/* ── Primitives ───────────────────────────────────────────────────────── */
function Card({ title, description, children }) {
  return (
    <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {description && <p className="mt-0.5 text-xs font-medium text-white/70">{description}</p>}
      </div>
      {children}
    </div>
  )
}

/* ── Main component ───────────────────────────────────────────────────── */
export default function BillingSettings() {
  const { user, refreshAccessProfile } = useAuth();
  const { format: fmt, breakdown }     = useCurrency();
  const isAdmin = user?.role === 'admin';

  const [params, setParams]             = useSearchParams();
  const [billing, setBilling]           = useState(null);
  const [plans, setPlans]               = useState([]);
  const [enabledGateways, setEnabledGateways] = useState([]);
  const [selectedPlanId, setSelectedPlanId]   = useState(null);
  const [cycle, setCycle]               = useState('monthly');
  const [loading, setLoading]           = useState(true);
  const [busy, setBusy]                 = useState(false);

  const load = async () => {
    try {
      const [b, p, gw] = await Promise.all([
        getBillingStatus(),
        getPlans().catch(() => []),
        getEnabledGateways().catch(() => []),
      ]);
      setBilling(b);
      setPlans(p);
      setEnabledGateways(Array.isArray(gw) ? gw : []);
      const current = p.find((x) => String(x.id) === String(b?.plan_id));
      setSelectedPlanId(String((current || p.find((x) => x.is_popular) || p[0])?.id ?? ''));
    } catch (e) {
      toast.error(errMsg(e, 'Failed to load billing information'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stripe    = params.get('stripe');
    const paypal    = params.get('paypal');
    const sessionId = params.get('session_id');
    const token     = params.get('token');

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
        .finally(() => { setLoading(false); setParams({ tab: 'billing' }, { replace: true }); });
      return;
    }

    if (stripe === 'cancelled') {
      toast.error('Payment was cancelled.');
      setParams({ tab: 'billing' }, { replace: true });
    }

    if (paypal === 'success' && token) {
      setLoading(true);
      confirmPaypalCheckout(token)
        .then(async (res) => {
          if (res.paid) {
            toast.success('PayPal payment successful! Your subscription is now active.');
            await refreshAccessProfile();
            if (res.billing) setBilling(res.billing);
            await load();
          } else {
            toast.error('PayPal payment was not completed. Please try again.');
            await load();
          }
        })
        .catch((e) => toast.error(errMsg(e, 'Could not confirm PayPal payment.')))
        .finally(() => { setLoading(false); setParams({ tab: 'billing' }, { replace: true }); });
      return;
    }

    if (paypal === 'cancelled') {
      toast.error('PayPal payment was cancelled.');
      setParams({ tab: 'billing' }, { replace: true });
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-none border border-slate-200 bg-white p-10 text-center text-sm font-medium text-slate-500 shadow-sm">
        Loading billing…
      </div>
    )
  }

  const status       = String(billing?.subscription_status || 'trial').toLowerCase();
  const badge        = STATUS_BADGE[status] || STATUS_BADGE.trial;
  const isPaid       = status === 'active';
  const selectedPlan = plans.find((p) => String(p.id) === String(selectedPlanId));
  const selectedPrice = selectedPlan
    ? (cycle === 'annual' ? selectedPlan.annual_price : selectedPlan.monthly_price)
    : 0;
  const hasStripe    = enabledGateways.some((g) => g.slug === 'stripe');
  const hasPaypal    = enabledGateways.some((g) => g.slug === 'paypal');
  const hasAnyGateway = hasStripe || hasPaypal;

  const payWithStripe = async () => {
    if (!selectedPlanId) { toast.error('Please select a plan first.'); return; }
    setBusy(true);
    try {
      const res = await startCheckout(selectedPlanId, cycle, '/admin/settings?tab=billing');
      if (res?.url) { window.location.href = res.url; return; }
      if (res?.free) {
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

  const payWithPaypal = async () => {
    if (!selectedPlanId) { toast.error('Please select a plan first.'); return; }
    setBusy(true);
    try {
      const res = await startPaypalCheckout(selectedPlanId, cycle, '/admin/settings?tab=billing');
      if (res?.free) {
        toast.success('Plan activated! Your subscription is now active.');
        if (res.billing) setBilling(res.billing);
        await refreshAccessProfile();
        await load();
        return;
      }
      if (res?.url) { window.location.href = res.url; return; }
      toast.error('Could not start PayPal checkout.');
    } catch (e) {
      toast.error(errMsg(e, 'Could not start PayPal checkout.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0 py-6">

      {/* ── Current Subscription ──────────────────────────────────────── */}
      <Card title="Current Subscription" description="Your active plan and billing status">
        <div className="grid grid-cols-1 gap-0 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-slate-500">Current Plan</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{billing?.plan_name || '—'}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-slate-500">Status</p>
            <span className={`mt-2 inline-block rounded-none px-2.5 py-0.5 text-xs font-bold ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-slate-500">{isPaid ? 'Billing' : 'Trial Ends'}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {isPaid
                ? 'Paid'
                : billing?.trial_ends_at
                  ? `${new Date(billing.trial_ends_at).toLocaleDateString()}${
                      billing?.days_left != null && billing.days_left >= 0
                        ? ` (${billing.days_left}d left)`
                        : ' (expired)'
                    }`
                  : '—'}
            </p>
          </div>
        </div>
        {billing?.payment_required && (
          <div className="mx-5 mb-4 rounded-none border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            Your access is limited until payment is completed. Choose a plan below and pay to restore full access.
          </div>
        )}
      </Card>

      {/* ── Choose a Plan ─────────────────────────────────────────────── */}
      <Card
        title={isPaid ? 'Change Plan' : 'Choose a Plan'}
        description="Select a billing cycle and plan, then pay to activate"
      >
        {/* Cycle toggle */}
        {plans.some((p) => p.annual_price > 0) && (
          <div className="flex items-center gap-1 border-b border-slate-100 px-5 py-3">
            {['monthly', 'annual'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                className={`h-8 rounded-none px-4 text-xs font-semibold transition-colors ${
                  cycle === c
                    ? 'bg-[#0F766E] text-white'
                    : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                {c === 'monthly' ? 'Monthly' : 'Annual'}
              </button>
            ))}
          </div>
        )}

        {/* Plan grid */}
        {plans.length === 0 ? (
          <p className="px-5 py-4 text-sm font-medium text-slate-500">
            No plans available. Please contact support.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const active   = String(plan.id) === String(selectedPlanId);
              const amount   = cycle === 'annual' ? plan.annual_price : plan.monthly_price;
              const isCurrent = String(plan.id) === String(billing?.plan_id);
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(String(plan.id))}
                  className={`relative rounded-none border-2 p-4 text-left transition-all ${
                    active ? 'border-[#0F766E] shadow-md' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {plan.is_popular && (
                    <span className="absolute -top-2 right-3 rounded-none bg-[#0F766E] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      Popular
                    </span>
                  )}
                  <p className="text-sm font-bold text-slate-900">{plan.plan_name}</p>
                  <p className="mt-2 text-xl font-extrabold text-slate-900">
                    {fmt(amount)}
                    <span className="text-xs font-medium text-slate-400"> / {cycle === 'annual' ? 'yr' : 'mo'}</span>
                  </p>
                  <span className={`mt-2 inline-block rounded-none px-2 py-0.5 text-xs font-semibold ${
                    active ? 'bg-[#0F766E]/10 text-[#0F766E]' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isCurrent ? 'Current' : active ? 'Selected' : 'Select'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Payment row */}
        {isAdmin && plans.length > 0 && (
          <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center">
            <div className="text-sm text-slate-600">
              {selectedPlan ? (() => {
                const bd = breakdown(selectedPrice);
                return (
                  <div className="space-y-0.5">
                    <div>
                      {selectedPlan.plan_name} —{' '}
                      <span className="font-bold text-[#0F766E]">
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
              })() : <span className="font-medium text-slate-400">Select a plan</span>}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {hasStripe && (
                <button
                  type="button"
                  onClick={payWithStripe}
                  disabled={busy || !selectedPlan}
                  className="inline-flex h-10 items-center rounded-none bg-[#0F766E] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? 'Redirecting…' : isPaid ? 'Switch plan & pay' : 'Pay with Stripe'}
                </button>
              )}
              {hasPaypal && (
                <button
                  type="button"
                  onClick={payWithPaypal}
                  disabled={busy || !selectedPlan}
                  className="inline-flex h-10 items-center rounded-none bg-[#003087] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#001f5b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? 'Redirecting…' : 'Pay with PayPal'}
                </button>
              )}
              {!hasAnyGateway && (
                <span className="text-sm font-medium text-slate-400">
                  Contact your platform admin to enable a payment gateway.
                </span>
              )}
            </div>
          </div>
        )}

        {!isAdmin && (
          <p className="border-t border-slate-100 px-5 py-4 text-sm font-medium text-slate-500">
            Only your organisation admin can make payments.
          </p>
        )}
      </Card>

    </div>
  );
}
