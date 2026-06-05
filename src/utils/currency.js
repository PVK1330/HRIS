// Central money helpers. A module-level cache lets non-React code (utils,
// services) format consistently; the CurrencyProvider keeps it in sync with
// the superadmin's global currency settings.

export const DEFAULT_CURRENCY_SETTINGS = {
  defaultCurrency: 'USD',
  currencySymbol: '$',
  symbolPosition: 'before', // before | after | before-space | after-space
  decimalSeparator: '.',
  thousandSeparator: ',',
  decimalPlaces: 2,
  taxEnabled: false,
  taxLabel: 'VAT',
  taxRate: 0,
  exchangeRates: {}, // { CODE: units of CODE per 1 unit of defaultCurrency }
}

let cache = { ...DEFAULT_CURRENCY_SETTINGS }

export function setCurrencySettings(next) {
  cache = { ...DEFAULT_CURRENCY_SETTINGS, ...(next || {}) }
  return cache
}

export function getCurrencySettings() {
  return cache
}

/**
 * Converts an amount between currencies using the manual exchange rates.
 * Rates are "units of <code> per 1 unit of the default currency"; the default
 * currency is implicitly 1. A missing rate falls back to 1:1 (never corrupts).
 */
export function convertAmount(amount, from, to, settings = cache) {
  const value = Number(amount) || 0
  const base = String(settings.defaultCurrency || '').toUpperCase()
  const src = String(from || base).toUpperCase()
  const dst = String(to || base).toUpperCase()
  if (src === dst) return value

  const rates = settings.exchangeRates || {}
  const rateOf = (code) => (code === base ? 1 : Number(rates[code]))
  const rFrom = rateOf(src)
  const rTo = rateOf(dst)
  if (!Number.isFinite(rFrom) || rFrom <= 0 || !Number.isFinite(rTo) || rTo <= 0) {
    return value
  }
  return (value / rFrom) * rTo
}

/** Applies thousand/decimal separators + fixed decimal places to a number. */
function groupNumber(value, settings) {
  const places = Math.max(0, Math.min(4, Number(settings.decimalPlaces ?? 2)))
  const fixed = (Number(value) || 0).toFixed(places)
  const negative = fixed.startsWith('-')
  const [intPart, decPart] = (negative ? fixed.slice(1) : fixed).split('.')
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousandSeparator ?? '')
  const body = decPart ? `${grouped}${settings.decimalSeparator ?? '.'}${decPart}` : grouped
  return (negative ? '-' : '') + body
}

/** Places the currency symbol around a formatted number per symbolPosition. */
function placeSymbol(numberStr, settings) {
  const sym = settings.currencySymbol ?? ''
  switch (settings.symbolPosition) {
    case 'after':
      return `${numberStr}${sym}`
    case 'before-space':
      return `${sym} ${numberStr}`
    case 'after-space':
      return `${numberStr} ${sym}`
    case 'before':
    default:
      return `${sym}${numberStr}`
  }
}

/**
 * Formats an amount in the global display currency.
 * @param {number} amount
 * @param {{ from?: string, withCode?: boolean }} [opts]
 *   from     — currency the stored amount is in (default: the global currency, no conversion)
 *   withCode — append the ISO code (e.g. "AED 105.00")
 */
export function formatMoney(amount, opts = {}, settings = cache) {
  const { from, withCode = false } = opts
  const converted = convertAmount(amount, from || settings.defaultCurrency, settings.defaultCurrency, settings)
  const body = placeSymbol(groupNumber(converted, settings), settings)
  return withCode ? `${body} ${settings.defaultCurrency}` : body
}

/** Tax portion for a subtotal (already in display currency); 0 when disabled. */
export function taxFor(amount, settings = cache) {
  if (!settings.taxEnabled) return 0
  return (Number(amount) || 0) * ((Number(settings.taxRate) || 0) / 100)
}

/**
 * Returns a billing breakdown for a subtotal in the display currency.
 * @returns {{ subtotal, tax, total, taxLabel, taxRate, taxEnabled }}
 */
export function billingBreakdown(subtotal, settings = cache) {
  const sub = Number(subtotal) || 0
  const tax = taxFor(sub, settings)
  return {
    subtotal: sub,
    tax,
    total: sub + tax,
    taxLabel: settings.taxLabel || 'VAT',
    taxRate: Number(settings.taxRate) || 0,
    taxEnabled: !!settings.taxEnabled,
  }
}
