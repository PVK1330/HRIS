import api from './api'

// Tenant self-service billing / trial / payment.

export async function getBillingStatus() {
  const { data } = await api.get('/tenant-billing/status')
  return data.data // { subscription_status, trial_ends_at, payment_required, plan_name, monthly_price, ... }
}

export async function getPlans() {
  const { data } = await api.get('/tenant-billing/plans')
  return data.data // [{ id, plan_name, monthly_price, annual_price, trial_days, is_popular }]
}

export async function startCheckout(planId, billingCycle = 'monthly', returnPath) {
  // returnPath: the org page to come back to after Stripe (e.g. '/admin/settings?tab=billing').
  const { data } = await api.post('/tenant-billing/checkout', { planId, billingCycle, returnPath })
  return data.data // { url, sessionId }
}

export async function confirmCheckout(sessionId) {
  const { data } = await api.post('/tenant-billing/confirm', { sessionId })
  return data.data // { paid, billing }
}
