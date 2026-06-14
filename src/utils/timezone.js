const LABEL_TO_IANA = {
  'UTC': 'UTC',
  'UTC+05:30 - India (IST)': 'Asia/Kolkata',
  'UTC+04:00 - UAE (GST)': 'Asia/Dubai',
  'UTC-05:00 - Eastern (EST)': 'America/New_York',
  'UTC-06:00 - Central (CST)': 'America/Chicago',
  'UTC-07:00 - Mountain (MST)': 'America/Denver',
  'UTC-08:00 - Pacific (PST)': 'America/Los_Angeles',
  'UTC+00:00 - London (GMT)': 'Europe/London',
  'UTC+01:00 - Paris (CET)': 'Europe/Paris',
  'UTC+08:00 - Singapore (SGT)': 'Asia/Singapore',
  'UTC+09:00 - Tokyo (JST)': 'Asia/Tokyo',
  'UTC+03:00 - Riyadh (AST)': 'Asia/Riyadh',
  'UTC+03:00 - Kuwait': 'Asia/Kuwait',
  'UTC+05:00 - Pakistan (PKT)': 'Asia/Karachi',
  'UTC+06:00 - Bangladesh (BST)': 'Asia/Dhaka',
}

export function toIANA(label) {
  return LABEL_TO_IANA[label] || 'UTC'
}

function fmt(date, iana, opts) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d)) return ''
  try {
    return new Intl.DateTimeFormat('en-GB', { timeZone: iana || 'UTC', ...opts }).format(d)
  } catch {
    return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...opts }).format(d)
  }
}

export function formatDate(date, iana) {
  return fmt(date, iana, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatTime(date, iana) {
  return fmt(date, iana, { hour: '2-digit', minute: '2-digit', hour12: true })
}

export function formatDateTime(date, iana) {
  return fmt(date, iana, {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

export function formatTimeOnly(date, iana) {
  return fmt(date, iana, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
}
