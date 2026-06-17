import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const EMPTY_FORM = {
  smtp_host: '',
  smtp_port: '',
  smtp_username: '',
  smtp_password: '',
  sender_email: '',
  sender_name: '',
  email_notifications_enabled: true,
  smtp_secure: true,
};

export default function EmailSettings() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saved, setSaved] = useState(EMPTY_FORM); // last-saved snapshot for dirty check
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: bool, message: string }

  // ── fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/admin/settings/email-config');
        const d = res.data?.data ?? {};
        const populated = {
          smtp_host: d.smtp_host ?? '',
          smtp_port: d.smtp_port ?? '',
          smtp_username: d.smtp_username ?? '',
          smtp_password: '', // never pre-fill password
          sender_email: d.sender_email ?? '',
          sender_name: d.sender_name ?? '',
          email_notifications_enabled: d.email_notifications_enabled ?? true,
          smtp_secure: d.smtp_secure ?? true,
        };
        if (!cancelled) {
          setForm(populated);
          setSaved(populated);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err?.response?.data?.message ?? 'Failed to load email settings.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── dirty check ─────────────────────────────────────────────────────────────
  const isDirty = useCallback(() => {
    return (
      form.smtp_host !== saved.smtp_host ||
      form.smtp_port !== saved.smtp_port ||
      form.smtp_username !== saved.smtp_username ||
      form.smtp_password !== '' || // any typed password counts as a change
      form.sender_email !== saved.sender_email ||
      form.sender_name !== saved.sender_name ||
      form.email_notifications_enabled !== saved.email_notifications_enabled ||
      form.smtp_secure !== saved.smtp_secure
    );
  }, [form, saved]);

  // ── field change handler ────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setTestResult(null); // reset test result on any change
  };

  // ── save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        smtp_host: form.smtp_host,
        smtp_port: form.smtp_port === '' ? null : Number(form.smtp_port),
        smtp_username: form.smtp_username,
        sender_email: form.sender_email,
        sender_name: form.sender_name,
        email_notifications_enabled: form.email_notifications_enabled,
        smtp_secure: form.smtp_secure,
      };
      if (form.smtp_password !== '') {
        body.smtp_password = form.smtp_password;
      }
      await api.put('/admin/settings/email-config', body);
      // update saved snapshot; clear password field
      const next = { ...form, smtp_password: '' };
      setForm(next);
      setSaved(next);
      toast.success('Email settings saved.');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to save email settings.');
    } finally {
      setSaving(false);
    }
  };

  // ── test connection ─────────────────────────────────────────────────────────
  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.post('/admin/settings/email-config/test');
      const d = res.data?.data ?? {};
      setTestResult({ success: d.success ?? true, message: d.message ?? 'Connection successful.' });
    } catch (err) {
      const msg = err?.response?.data?.data?.message
        ?? err?.response?.data?.message
        ?? 'Connection test failed.';
      setTestResult({ success: false, message: msg });
    } finally {
      setTesting(false);
    }
  };

  // ── shared input class ───────────────────────────────────────────────────────
  const inputCls =
    'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm disabled:bg-slate-50 disabled:text-slate-400';

  // ── loading skeleton ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i}>
            <div className="h-3 w-24 bg-slate-200 rounded mb-2" />
            <div className="h-9 bg-slate-100 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  const dirty = isDirty();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Email Configuration</h3>
        <p className="text-sm text-slate-500 mb-5">
          Configure outbound SMTP settings for system-generated emails.
        </p>

        <div className="space-y-4">
          {/* SMTP Host */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              SMTP Host
            </label>
            <input
              type="text"
              name="smtp_host"
              value={form.smtp_host}
              onChange={handleChange}
              placeholder="mail.example.com"
              className={inputCls}
            />
          </div>

          {/* SMTP Port */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              SMTP Port
            </label>
            <input
              type="number"
              name="smtp_port"
              value={form.smtp_port}
              onChange={handleChange}
              placeholder="587"
              min={1}
              max={65535}
              className={inputCls}
            />
          </div>

          {/* SMTP Username */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              SMTP Username
            </label>
            <input
              type="text"
              name="smtp_username"
              value={form.smtp_username}
              onChange={handleChange}
              placeholder="username@example.com"
              autoComplete="off"
              className={inputCls}
            />
          </div>

          {/* SMTP Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              SMTP Password
            </label>
            <input
              type="password"
              name="smtp_password"
              value={form.smtp_password}
              onChange={handleChange}
              placeholder="(unchanged)"
              autoComplete="new-password"
              className={inputCls}
            />
            <p className="mt-1 text-xs text-slate-400">
              Leave blank to keep the existing password.
            </p>
          </div>

          {/* Sender Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sender Email Address
            </label>
            <input
              type="email"
              name="sender_email"
              value={form.sender_email}
              onChange={handleChange}
              placeholder="noreply@example.com"
              className={inputCls}
            />
          </div>

          {/* Sender Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sender Name
            </label>
            <input
              type="text"
              name="sender_name"
              value={form.sender_name}
              onChange={handleChange}
              placeholder="HR System"
              className={inputCls}
            />
          </div>

          {/* Toggle: SSL/TLS */}
          <div className="flex items-center justify-between py-3 border-t border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-700">Enable SSL/TLS</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Use secure connection (recommended for port 465 / 587 STARTTLS)
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.smtp_secure}
              onClick={() =>
                setForm((prev) => ({ ...prev, smtp_secure: !prev.smtp_secure }))
              }
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                form.smtp_secure ? 'bg-teal-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  form.smtp_secure ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle: Email Notifications */}
          <div className="flex items-center justify-between py-3 border-t border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-700">Enable Email Notifications</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Send automated email alerts to employees and admins
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.email_notifications_enabled}
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  email_notifications_enabled: !prev.email_notifications_enabled,
                }))
              }
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                form.email_notifications_enabled ? 'bg-teal-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  form.email_notifications_enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Test Connection */}
      <div className="border-t border-slate-100 pt-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || saving}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {testing ? 'Testing…' : 'Test Connection'}
          </button>
          {testResult && (
            <span
              className={`text-sm font-medium ${
                testResult.success ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {testResult.success ? '✓' : '✗'} {testResult.message}
            </span>
          )}
        </div>

        {testResult && (
          <div
            className={`mt-3 rounded-lg px-4 py-3 text-sm ${
              testResult.success
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {testResult.success
              ? 'SMTP connection verified. Emails will be delivered using these settings.'
              : testResult.message}
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="px-5 py-2 text-sm font-medium rounded-lg bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
