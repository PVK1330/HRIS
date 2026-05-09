import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { NOTIFICATION_EVENTS } from '../../pages/admin/settings/notificationConstants'
import {
  getNotifications,
  updateNotifications,
} from '../../services/adminSettingsService'

function defaultEventMatrix() {
  const ev = {}
  for (const { key } of NOTIFICATION_EVENTS) {
    ev[key] = { email: true, sms: false, in_app: true }
  }
  return ev
}

export function normalizeNotificationSettings(inner) {
  if (!inner) return null

  const evIn = inner.eventNotifications && typeof inner.eventNotifications === 'object'
    ? inner.eventNotifications
    : {}

  const eventNotifications = { ...defaultEventMatrix(), ...evIn }

  for (const { key } of NOTIFICATION_EVENTS) {
    const cell = eventNotifications[key] || {}
    eventNotifications[key] = {
      email: Boolean(cell.email),
      sms: Boolean(cell.sms),
      in_app: Boolean(cell.in_app),
    }
  }

  return {
    channels: {
      emailNotifications: Boolean(inner.channels?.emailNotifications),
      smsNotifications: Boolean(inner.channels?.smsNotifications),
      inAppAlerts: Boolean(inner.channels?.inAppAlerts),
    },
    eventNotifications,
  }
}

export function useNotificationSettings() {
  const [settings, setSettings] = useState(null)
  const originalRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getNotifications()
      const inner = res.data ?? null
      const next = normalizeNotificationSettings(inner)
      setSettings(next)
      originalRef.current = next ? structuredClone(next) : null
    } catch (e) {
      setError(e.message || 'Failed to load notification settings')
      setSettings(null)
      originalRef.current = null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const isDirty = useMemo(() => {
    if (!settings || !originalRef.current) return false
    return JSON.stringify(settings) !== JSON.stringify(originalRef.current)
  }, [settings])

  const updateChannel = useCallback((key, value) => {
    setSettings((p) =>
      p ? { ...p, channels: { ...p.channels, [key]: value } } : p,
    )
  }, [])

  const updateEvent = useCallback((eventKey, channel, value) => {
    setSettings((p) => {
      if (!p) return p
      const prevCell =
        p.eventNotifications[eventKey] || { email: false, sms: false, in_app: false }
      return {
        ...p,
        eventNotifications: {
          ...p.eventNotifications,
          [eventKey]: {
            ...prevCell,
            [channel]: value,
          },
        },
      }
    })
  }, [])

  const save = useCallback(async () => {
    if (!settings) return
    setSaving(true)
    setError(null)
    try {
      const res = await updateNotifications({
        channels: settings.channels,
        eventNotifications: settings.eventNotifications,
      })
      const inner = res.data ?? null
      const next = normalizeNotificationSettings(inner)
      setSettings(next)
      originalRef.current = next ? structuredClone(next) : null
      toast.success(res.message || 'Notification settings saved')
      return res
    } catch (e) {
      setError(e.message || 'Failed to save notification settings')
      toast.error(e.message || 'Save failed')
      throw e
    } finally {
      setSaving(false)
    }
  }, [settings])

  const discard = useCallback(() => {
    if (originalRef.current) {
      setSettings(structuredClone(originalRef.current))
    }
    setError(null)
  }, [])

  return {
    settings,
    setSettings,
    loading,
    saving,
    isDirty,
    error,
    updateChannel,
    updateEvent,
    save,
    discard,
    reload: load,
  }
}
