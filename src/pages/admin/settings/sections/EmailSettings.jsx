import { useState } from 'react';

export default function EmailSettings() {
  const [settings, setSettings] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUsername: '',
    smtpPassword: '',
    senderEmail: '',
    enableNotifications: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Email Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              SMTP Host
            </label>
            <input
              type="text"
              name="smtpHost"
              value={settings.smtpHost}
              onChange={handleChange}
              placeholder="mail.example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              SMTP Port
            </label>
            <input
              type="number"
              name="smtpPort"
              value={settings.smtpPort}
              onChange={handleChange}
              placeholder="587"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              SMTP Username
            </label>
            <input
              type="text"
              name="smtpUsername"
              value={settings.smtpUsername}
              onChange={handleChange}
              placeholder="username@example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              SMTP Password
            </label>
            <input
              type="password"
              name="smtpPassword"
              value={settings.smtpPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sender Email Address
            </label>
            <input
              type="email"
              name="senderEmail"
              value={settings.senderEmail}
              onChange={handleChange}
              placeholder="noreply@example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="enableNotifications"
              name="enableNotifications"
              checked={settings.enableNotifications}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
            />
            <label htmlFor="enableNotifications" className="text-sm font-medium text-slate-700">
              Enable Email Notifications
            </label>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Email settings are configured and managed through your SMTP provider.
        </p>
      </div>
    </div>
  );
}
