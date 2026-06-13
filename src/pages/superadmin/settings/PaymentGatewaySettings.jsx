import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { HiOutlineCog6Tooth, HiCheck } from 'react-icons/hi2'
import { Toggle } from '../../../components/ui/Toggle.jsx'
import settingsService from '../../../services/settingsService.js'
import paypalLogo from '../../../assets/payment-gateway-01.svg'
import stripeLogo from '../../../assets/payment-gateway-02.svg'

const DEFAULT_STRIPE = { enabled: false, publicKey: '', secretKey: '', webhookSecret: '' }
const DEFAULT_PAYPAL = { enabled: false, clientId: '', clientSecret: '', mode: 'sandbox', paypalCurrency: 'USD' }

// All currencies supported by PayPal Orders v2
// Source: https://developer.paypal.com/reference/currency-codes/
const PAYPAL_CURRENCIES = [
  { value: 'USD', label: 'USD – US Dollar' },
  { value: 'EUR', label: 'EUR – Euro' },
  { value: 'GBP', label: 'GBP – British Pound' },
  { value: 'AUD', label: 'AUD – Australian Dollar' },
  { value: 'BRL', label: 'BRL – Brazilian Real' },
  { value: 'CAD', label: 'CAD – Canadian Dollar' },
  { value: 'CNY', label: 'CNY – Chinese Yuan' },
  { value: 'CZK', label: 'CZK – Czech Koruna' },
  { value: 'DKK', label: 'DKK – Danish Krone' },
  { value: 'HKD', label: 'HKD – Hong Kong Dollar' },
  { value: 'HUF', label: 'HUF – Hungarian Forint' },
  { value: 'ILS', label: 'ILS – Israeli New Shekel' },
  { value: 'JPY', label: 'JPY – Japanese Yen' },
  { value: 'MYR', label: 'MYR – Malaysian Ringgit' },
  { value: 'MXN', label: 'MXN – Mexican Peso' },
  { value: 'TWD', label: 'TWD – Taiwan New Dollar' },
  { value: 'NZD', label: 'NZD – New Zealand Dollar' },
  { value: 'NOK', label: 'NOK – Norwegian Krone' },
  { value: 'PHP', label: 'PHP – Philippine Peso' },
  { value: 'PLN', label: 'PLN – Polish Zloty' },
  { value: 'SGD', label: 'SGD – Singapore Dollar' },
  { value: 'SEK', label: 'SEK – Swedish Krona' },
  { value: 'CHF', label: 'CHF – Swiss Franc' },
  { value: 'THB', label: 'THB – Thai Baht' },
]

const baseInput = "block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#0F766E] sm:text-sm sm:leading-6"

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium leading-6 text-gray-900">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

/** A single payment provider card: logo, enable toggle, description, status and a
 *  gear that reveals the credential fields inline. */
function GatewayCard({ logo, name, description, enabled, onToggle, connected, expanded, onToggleExpand, children }) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <img src={logo} alt={`${name} logo`} className="h-5 w-auto object-contain" />
        <Toggle checked={enabled} onChange={onToggle} />
      </div>

      <p className="mt-4 text-sm leading-6 text-gray-500">{description}</p>

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        {connected ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700">
            <HiCheck className="h-3.5 w-3.5 text-[#0F766E]" />
            Connected
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
            Not connected
          </span>
        )}
        <button
          type="button"
          onClick={onToggleExpand}
          aria-label={`Configure ${name}`}
          aria-expanded={expanded}
          className={`rounded-md p-1.5 transition ${
            expanded ? 'bg-[#0F766E]/10 text-[#0F766E]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
        >
          <HiOutlineCog6Tooth className="h-5 w-5" />
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
          {children}
        </div>
      )}
    </div>
  )
}

export default function PaymentGatewaySettings() {
  const [stripe, setStripe] = useState({ ...DEFAULT_STRIPE })
  const [paypal, setPaypal] = useState({ ...DEFAULT_PAYPAL })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(null)
  const [expanded, setExpanded] = useState(null) // 'stripe' | 'paypal' | null

  const originalStripe = useRef(null)
  const originalPaypal = useRef(null)

  const load = useCallback(async () => {
    try {
      const res = await settingsService.getPaymentGateways()
      const data = res?.data || {}

      const st = data.stripe ? {
        enabled: !!data.stripe.enabled,
        publicKey: data.stripe.publicKey || '',
        secretKey: data.stripe.secretKey || '',
        webhookSecret: data.stripe.webhookSecret || '',
      } : { ...DEFAULT_STRIPE }

      const pp = data.paypal ? {
        enabled: !!data.paypal.enabled,
        clientId: data.paypal.clientId || '',
        clientSecret: data.paypal.clientSecret || '',
        mode: data.paypal.mode || 'sandbox',
        paypalCurrency: data.paypal.paypalCurrency || 'USD',
      } : { ...DEFAULT_PAYPAL }

      setStripe(st)
      setPaypal(pp)
      originalStripe.current = JSON.parse(JSON.stringify(st))
      originalPaypal.current = JSON.parse(JSON.stringify(pp))
    } catch (err) {
      toast.error(err?.message || 'Failed to load payment settings')
      setStripe({ ...DEFAULT_STRIPE })
      setPaypal({ ...DEFAULT_PAYPAL })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const isDirty = useMemo(() => {
    if (loading || !originalStripe.current || !originalPaypal.current) return false
    return (
      JSON.stringify(stripe) !== JSON.stringify(originalStripe.current) ||
      JSON.stringify(paypal) !== JSON.stringify(originalPaypal.current)
    )
  }, [stripe, paypal, loading])

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setSaving(true)
    try {
      await settingsService.updatePaymentGateways({ stripe, paypal })
      originalStripe.current = JSON.parse(JSON.stringify(stripe))
      originalPaypal.current = JSON.parse(JSON.stringify(paypal))
      toast.success('Payment settings saved')
    } catch (err) {
      toast.error(err?.message || 'Failed to save payment settings')
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    setStripe(JSON.parse(JSON.stringify(originalStripe.current)))
    setPaypal(JSON.parse(JSON.stringify(originalPaypal.current)))
  }

  const handleTestConnection = async (slug, label) => {
    setTesting(label)
    try {
      const res = await settingsService.testPaymentGateway(slug)
      const result = res?.data ?? res
      if (result?.verified) {
        toast.success(`${label} connection successful!`)
      } else {
        toast.error(`${label} test failed: ${result?.message || 'Verification failed'}`)
      }
    } catch (err) {
      toast.error(`${label} test failed: ${err?.response?.data?.message || err.message}`)
    } finally {
      setTesting(null)
    }
  }

  const toggleExpand = (key) => setExpanded((cur) => (cur === key ? null : key))

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="animate-pulse rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-900/5">
          <div className="h-5 w-48 rounded bg-gray-200" />
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="h-56 rounded-xl bg-gray-100" />
            <div className="h-56 rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <form onSubmit={handleSave} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          <div className="border-b border-gray-900/10 px-4 py-5 sm:px-8">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Payment Gateways</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Enable and configure the payment providers available at checkout.
            </p>
          </div>

          <div className="px-4 py-6 sm:p-8">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* PayPal */}
              <GatewayCard
                logo={paypalLogo}
                name="PayPal"
                description="PayPal is the faster, safer way to send, receive money and online payment."
                enabled={paypal.enabled}
                onToggle={(v) => setPaypal({ ...paypal, enabled: v })}
                connected={!!paypal.clientSecret}
                expanded={expanded === 'paypal'}
                onToggleExpand={() => toggleExpand('paypal')}
              >
                <Field label="Client ID">
                  <input
                    type="text"
                    value={paypal.clientId}
                    onChange={(e) => setPaypal({ ...paypal, clientId: e.target.value })}
                    className={baseInput}
                  />
                </Field>
                <Field label="Client Secret">
                  <input
                    type="password"
                    value={paypal.clientSecret}
                    onChange={(e) => setPaypal({ ...paypal, clientSecret: e.target.value })}
                    className={baseInput}
                  />
                </Field>
                <Field label="Environment">
                  <select
                    value={paypal.mode}
                    onChange={(e) => setPaypal({ ...paypal, mode: e.target.value })}
                    className={baseInput}
                  >
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="live">Production (Live)</option>
                  </select>
                </Field>
                <Field label="Checkout Currency">
                  <select
                    value={paypal.paypalCurrency || 'USD'}
                    onChange={(e) => setPaypal({ ...paypal, paypalCurrency: e.target.value })}
                    className={baseInput}
                  >
                    {PAYPAL_CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Currency used for PayPal payments. PayPal does not support AED or INR — choose USD or another supported currency.
                  </p>
                </Field>
                <button
                  type="button"
                  onClick={() => handleTestConnection('paypal', 'PayPal')}
                  disabled={testing === 'PayPal'}
                  className="text-sm font-medium text-[#0F766E] hover:text-[#115E59] disabled:opacity-50"
                >
                  {testing === 'PayPal' ? 'Testing connection...' : 'Test Connection'}
                </button>
              </GatewayCard>

              {/* Stripe */}
              <GatewayCard
                logo={stripeLogo}
                name="Stripe"
                description="APIs to accept credit cards, manage subscriptions, send money."
                enabled={stripe.enabled}
                onToggle={(v) => setStripe({ ...stripe, enabled: v })}
                connected={!!stripe.secretKey}
                expanded={expanded === 'stripe'}
                onToggleExpand={() => toggleExpand('stripe')}
              >
                <Field label="Publishable Key">
                  <input
                    type="text"
                    value={stripe.publicKey}
                    onChange={(e) => setStripe({ ...stripe, publicKey: e.target.value })}
                    placeholder="pk_test_..."
                    className={baseInput}
                  />
                </Field>
                <Field label="Secret Key">
                  <input
                    type="password"
                    value={stripe.secretKey}
                    onChange={(e) => setStripe({ ...stripe, secretKey: e.target.value })}
                    placeholder="sk_test_..."
                    className={baseInput}
                  />
                </Field>
                <Field label="Webhook Secret">
                  <input
                    type="password"
                    value={stripe.webhookSecret}
                    onChange={(e) => setStripe({ ...stripe, webhookSecret: e.target.value })}
                    placeholder="whsec_..."
                    className={baseInput}
                  />
                </Field>
                <button
                  type="button"
                  onClick={() => handleTestConnection('stripe', 'Stripe')}
                  disabled={testing === 'Stripe'}
                  className="text-sm font-medium text-[#0F766E] hover:text-[#115E59] disabled:opacity-50"
                >
                  {testing === 'Stripe' ? 'Testing connection...' : 'Test Connection'}
                </button>
              </GatewayCard>
            </div>
          </div>

          <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/5 px-4 py-4 sm:px-8">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={!isDirty || saving}
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={!isDirty || saving}
              className="rounded-md bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#115E59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
