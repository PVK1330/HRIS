/* eslint-disable react-refresh/only-export-components -- context module exports provider + hook */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext.jsx'
import {
  DEFAULT_CURRENCY_SETTINGS,
  setCurrencySettings,
  formatMoney as fmt,
  convertAmount as conv,
  taxFor as tax,
  billingBreakdown as breakdown,
} from '../utils/currency'

const CurrencyContext = createContext(null)

/**
 * Loads the platform-wide currency settings (display format, manual exchange
 * rates and billing tax) once and exposes helpers so the whole app formats and
 * converts money consistently in the superadmin's global currency.
 */
export function CurrencyProvider({ children }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState(DEFAULT_CURRENCY_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  const reload = useCallback(async () => {
    try {
      const { data } = await api.get('/currency/display')
      const next = data?.data || data
      if (next && typeof next === 'object') {
        setSettings(setCurrencySettings(next))
      }
    } catch {
      // Not authenticated yet / endpoint unavailable → keep safe defaults.
      setCurrencySettings(DEFAULT_CURRENCY_SETTINGS)
    } finally {
      setLoaded(true)
    }
  }, [])

  // Reload whenever the signed-in identity changes so money formatting is
  // correct right after login. Skip when user is null — the endpoint requires
  // auth and calling it unauthenticated would trigger an interceptor loop.
  useEffect(() => {
    if (!user) return
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.email, user?.role])

  const value = useMemo(
    () => ({
      settings,
      loaded,
      reload,
      // Bind helpers to the live settings so callers don't pass them.
      format: (amount, opts) => fmt(amount, opts, settings),
      convert: (amount, from, to) => conv(amount, from, to, settings),
      taxFor: (amount) => tax(amount, settings),
      breakdown: (subtotal) => breakdown(subtotal, settings),
    }),
    [settings, loaded, reload],
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return ctx
}
