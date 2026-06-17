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

/* ── Style tokens ─────────────────────────────────────────────────────── */
const inputCls =
  'h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] disabled:opacity-50'

/* ── Primitives ───────────────────────────────────────────────────────── */
function Card({ title, description, children }) {
  return (
    <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {description && <p className="mt-0.5 text-xs font-medium text-white/70">{description}</p>}
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="px-5 py-3.5">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {hint && <p className="mb-1.5 text-xs text-slate-400">{hint}</p>}
      {children}
    </div>
  )
}

function ToggleField({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/30 ${
          checked ? 'bg-[#0F766E]' : 'bg-gray-200'
        }`}
        aria-pressed={checked}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

/* ── Main component ───────────────────────────────────────────────────── */
export default function EmailSettings() {
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saved, setSaved]         = useState(EMPTY_FORM);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [testing, setTesting]     = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/admin/settings/email-config');
        const d = res.data?.data ?? {};
        const populated = {
          smtp_host:                    d.smtp_host ?? '',
          smtp_port:                    d.smtp_port ?? '',
          smtp_username:                d.smtp_username ?? '',
          smtp_password:                '',
          sender_email:                 d.sender_email ?? '',
          sender_name:                  d.sender_name ?? '',
          email_notifications_enabled:  d.email_notifications_enabled ?? true,
          smtp_secure:                  d.smtp_secure ?? true,
        };
        if (!cancelled) { setForm(populated); setSaved(populated); }
      } catch (err) {
        if (!cancelled) toast.error(err?.response?.data?.message ?? 'Failed to load email settings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const isDirty = useCallback(() => (
    form.smtp_host !== saved.smtp_host ||
    form.smtp_port !== saved.smtp_port ||
    form.smtp_username !== saved.smtp_username ||
    form.smtp_password !== '' ||
    form.sender_email !== saved.sender_email ||
    form.sender_name !== saved.sender_name ||
    form.email_notifications_enabled !== saved.email_notifications_enabled ||
    form.smtp_secure !== saved.smtp_secure
  ), [form, saved]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setTestResult(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        smtp_host:                    form.smtp_host,
        smtp_port:                    form.smtp_port === '' ? null : Number(form.smtp_port),
        smtp_username:                form.smtp_username,
        sender_email:                 form.sender_email,
        sender_name:                  form.sender_name,
        email_notifications_enabled:  form.email_notifications_enabled,
        smtp_secure:                  form.smtp_secure,
      };
      if (form.smtp_password !== '') body.smtp_password = form.smtp_password;
      await api.put('/admin/settings/email-config', body);
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

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.post('/admin/settings/email-config/test');
      const d = res.data?.data ?? {};
      setTestResult({ success: d.success ?? true, message: d.message ?? 'Connection successful.' });
    } catch (err) {
      const msg = err?.response?.data?.data?.message ?? err?.response?.data?.message ?? 'Connection test failed.';
      setTestResult({ success: false, message: msg });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-none border border-slate-200 bg-white p-10 text-center text-sm font-medium text-slate-500 shadow-sm animate-pulse">
        Loading email settings…
      </div>
    )
  }

  const dirty = isDirty();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0 py-6">

      {/* ── SMTP Configuration ────────────────────────────────────────── */}
      <Card title="SMTP Configuration" description="Outbound mail server settings for system-generated emails">
        <Field label="SMTP Host">
          <input type="text" name="smtp_host" value={form.smtp_host} onChange={handleChange}
            placeholder="mail.example.com" className={inputCls} />
        </Field>
        <Field label="SMTP Port">
          <input type="number" name="smtp_port" value={form.smtp_port} onChange={handleChange}
            placeholder="587" min={1} max={65535} className={inputCls} />
        </Field>
        <Field label="SMTP Username">
          <input type="text" name="smtp_username" value={form.smtp_username} onChange={handleChange}
            placeholder="username@example.com" autoComplete="off" className={inputCls} />
        </Field>
        <Field label="SMTP Password" hint="Leave blank to keep the existing password.">
          <input type="password" name="smtp_password" value={form.smtp_password} onChange={handleChange}
            placeholder="(unchanged)" autoComplete="new-password" className={inputCls} />
        </Field>
        <ToggleField
          label="Enable SSL / TLS"
          hint="Use secure connection (recommended for port 465 / 587 STARTTLS)"
          checked={form.smtp_secure}
          onChange={(v) => { setForm((p) => ({ ...p, smtp_secure: v })); setTestResult(null); }}
        />
      </Card>

      {/* ── Sender Identity ───────────────────────────────────────────── */}
      <Card title="Sender Identity" description="From address and name shown in outbound emails">
        <Field label="Sender Email Address">
          <input type="email" name="sender_email" value={form.sender_email} onChange={handleChange}
            placeholder="noreply@example.com" className={inputCls} />
        </Field>
        <Field label="Sender Name">
          <input type="text" name="sender_name" value={form.sender_name} onChange={handleChange}
            placeholder="HR System" className={inputCls} />
        </Field>
        <ToggleField
          label="Enable Email Notifications"
          hint="Send automated email alerts to employees and admins"
          checked={form.email_notifications_enabled}
          onChange={(v) => { setForm((p) => ({ ...p, email_notifications_enabled: v })); setTestResult(null); }}
        />
      </Card>

      {/* ── Test & Save ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-none border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || saving}
            className="inline-flex h-10 items-center gap-2 rounded-none border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {testing ? 'Testing…' : 'Test Connection'}
          </button>
          {testResult && (
            <span className={`text-sm font-semibold ${testResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
              {testResult.success ? '✓' : '✗'} {testResult.message}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="inline-flex h-10 items-center rounded-none bg-[#0F766E] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Test result detail */}
      {testResult && (
        <div className={`rounded-none px-4 py-3 text-sm font-medium ${
          testResult.success
            ? 'border border-emerald-100 bg-emerald-50 text-emerald-800'
            : 'border border-red-100 bg-red-50 text-red-700'
        }`}>
          {testResult.success
            ? 'SMTP connection verified. Emails will be delivered using these settings.'
            : testResult.message}
        </div>
      )}

    </div>
  );
}
