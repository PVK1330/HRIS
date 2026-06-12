import api from './api'

/**
 * Create a Stripe Checkout session for tenant onboarding payment.
 * @returns {{ url: string, sessionId: string }}
 */
export async function createPaypalCheckoutSession({ tenantId, paymentId, planId, billingCycle }) {
  const res = await api.post('/billing/paypal/checkout-session', {
    tenantId, paymentId, planId, billingCycle,
  })
  return res.data?.data // { orderId, url }
}

export async function confirmPaypalCheckoutSession(orderId) {
  const res = await api.post('/billing/paypal/confirm', { orderId })
  return res.data?.data // { paid, tenantId, planId, ... }
}

export async function createStripeCheckoutSession({
  tenantId,
  paymentId,
  planId,
  billingCycle,
  customerEmail,
}) {
  const res = await api.post('/billing/stripe/checkout-session', {
    tenantId,
    paymentId,
    planId,
    billingCycle,
    customerEmail,
  })
  return res.data?.data
}
