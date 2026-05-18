import api from './api'

/**
 * Create a Stripe Checkout session for tenant onboarding payment.
 * @returns {{ url: string, sessionId: string }}
 */
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
