import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Toggle } from '../../../components/ui/Toggle.jsx'
import settingsService from '../../../services/settingsService.js'

const DEFAULT_STRIPE = { enabled: false, publicKey: '', secretKey: '', webhookSecret: '' }
const DEFAULT_PAYPAL = { enabled: false, clientId: '', clientSecret: '', mode: 'sandbox' }

export default function PaymentGatewaySettings() {
  const [stripe, setStripe] = useState({ ...DEFAULT_STRIPE })
  const [paypal, setPaypal] = useState({ ...DEFAULT_PAYPAL })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(null)

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

  const handleTestConnection = async (gateway) => {
    setTesting(gateway)
    try {
      await settingsService.testPaymentGateway(gateway)
      toast.success(`${gateway} connection successful!`)
    } catch (err) {
      toast.error(`${gateway} test failed: ${err.message}`)
    } finally {
      setTesting(null)
    }
  }

  const baseInput = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="h-64 rounded-xl bg-gray-100"></div>
          <div className="h-64 rounded-xl bg-gray-100"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-10 divide-y divide-gray-900/10">
        
        {/* Stripe Settings */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Stripe Integration</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Process credit cards and manage subscriptions via Stripe.
            </p>
          </div>

          <form 
            onSubmit={handleSave}
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          >
            <div className="px-4 py-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-gray-900/5">
                <div>
                  <h3 className="text-sm font-medium leading-6 text-gray-900">Enable Stripe</h3>
                  <p className="mt-1 text-sm text-gray-500">Allow payments via Stripe at checkout.</p>
                </div>
                <Toggle checked={stripe.enabled} onChange={(v) => setStripe({ ...stripe, enabled: v })} />
              </div>

              {stripe.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">Publishable Key</label>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={stripe.publicKey}
                        onChange={(e) => setStripe({ ...stripe, publicKey: e.target.value })}
                        placeholder="pk_test_..."
                        className={baseInput}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">Secret Key</label>
                    <div className="mt-2">
                      <input
                        type="password"
                        value={stripe.secretKey}
                        onChange={(e) => setStripe({ ...stripe, secretKey: e.target.value })}
                        placeholder="sk_test_..."
                        className={baseInput}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">Webhook Secret</label>
                    <div className="mt-2">
                      <input
                        type="password"
                        value={stripe.webhookSecret}
                        onChange={(e) => setStripe({ ...stripe, webhookSecret: e.target.value })}
                        placeholder="whsec_..."
                        className={baseInput}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleTestConnection('Stripe')}
                      disabled={testing === 'Stripe'}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      {testing === 'Stripe' ? 'Testing connection...' : 'Test Connection'}
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/5 px-4 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => {
                  setStripe(JSON.parse(JSON.stringify(originalStripe.current)))
                  setPaypal(JSON.parse(JSON.stringify(originalPaypal.current)))
                }}
                disabled={!isDirty || saving}
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 disabled:opacity-50"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={!isDirty || saving}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* PayPal Settings */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">PayPal Integration</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Accept standard PayPal checkout flows.
            </p>
          </div>

          <form 
            onSubmit={handleSave}
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          >
            <div className="px-4 py-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-gray-900/5">
                <div>
                  <h3 className="text-sm font-medium leading-6 text-gray-900">Enable PayPal</h3>
                  <p className="mt-1 text-sm text-gray-500">Allow payments via PayPal.</p>
                </div>
                <Toggle checked={paypal.enabled} onChange={(v) => setPaypal({ ...paypal, enabled: v })} />
              </div>

              {paypal.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">Client ID</label>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={paypal.clientId}
                        onChange={(e) => setPaypal({ ...paypal, clientId: e.target.value })}
                        className={baseInput}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">Client Secret</label>
                    <div className="mt-2">
                      <input
                        type="password"
                        value={paypal.clientSecret}
                        onChange={(e) => setPaypal({ ...paypal, clientSecret: e.target.value })}
                        className={baseInput}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">Environment</label>
                    <div className="mt-2">
                      <select
                        value={paypal.mode}
                        onChange={(e) => setPaypal({ ...paypal, mode: e.target.value })}
                        className={baseInput}
                      >
                        <option value="sandbox">Sandbox (Testing)</option>
                        <option value="production">Production (Live)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleTestConnection('PayPal')}
                      disabled={testing === 'PayPal'}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      {testing === 'PayPal' ? 'Testing connection...' : 'Test Connection'}
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/5 px-4 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => {
                  setStripe(JSON.parse(JSON.stringify(originalStripe.current)))
                  setPaypal(JSON.parse(JSON.stringify(originalPaypal.current)))
                }}
                disabled={!isDirty || saving}
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 disabled:opacity-50"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={!isDirty || saving}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
