import { useState } from 'react'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Toggle } from '../../components/ui/Toggle.jsx'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')

  // General Settings
  const [platformName, setPlatformName] = useState('HRIS Cloud')
  const [supportEmail, setSupportEmail] = useState('support@hriscloud.io')
  const [timezone, setTimezone] = useState('UTC')
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  // SMTP Settings
  const [smtpHost, setSmtpHost] = useState('smtp.example.com')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpUsername, setSmtpUsername] = useState('')
  const [smtpPassword, setSmtpPassword] = useState('')
  const [smtpSecure, setSmtpSecure] = useState(true)
  const [smtpFromEmail, setSmtpFromEmail] = useState('noreply@hriscloud.io')
  const [smtpFromName, setSmtpFromName] = useState('HRIS Cloud')

  // Email Settings
  const [emailVerification, setEmailVerification] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [welcomeEmail, setWelcomeEmail] = useState(true)
  const [passwordResetEmail, setPasswordResetEmail] = useState(true)

  // Payment Gateway Settings
  const [stripeEnabled, setStripeEnabled] = useState(true)
  const [stripePublishableKey, setStripePublishableKey] = useState('')
  const [stripeSecretKey, setStripeSecretKey] = useState('')
  const [paypalEnabled, setPaypalEnabled] = useState(false)
  const [paypalClientId, setPaypalClientId] = useState('')
  const [paypalSecret, setPaypalSecret] = useState('')
  const [currency, setCurrency] = useState('USD')

  // Security Settings
  const [enforceMfa, setEnforceMfa] = useState(true)
  const [auditRetention, setAuditRetention] = useState('90')
  const [sessionTimeout, setSessionTimeout] = useState('30')
  const [passwordMinLength, setPasswordMinLength] = useState('8')
  const [passwordRequireUppercase, setPasswordRequireUppercase] = useState(true)
  const [passwordRequireLowercase, setPasswordRequireLowercase] = useState(true)
  const [passwordRequireNumbers, setPasswordRequireNumbers] = useState(true)
  const [passwordRequireSpecial, setPasswordRequireSpecial] = useState(true)

  // API Settings
  const [apiRateLimit, setApiRateLimit] = useState('1000')
  const [apiTimeout, setApiTimeout] = useState('30')
  const [enableApiDocs, setEnableApiDocs] = useState(true)

  // Storage Settings
  const [storageProvider, setStorageProvider] = useState('local')
  const [s3Bucket, setS3Bucket] = useState('')
  const [s3Region, setS3Region] = useState('us-east-1')
  const [s3AccessKey, setS3AccessKey] = useState('')
  const [s3SecretKey, setS3SecretKey] = useState('')
  const [maxFileSize, setMaxFileSize] = useState('10')

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'smtp', label: 'SMTP' },
    { id: 'email', label: 'Email' },
    { id: 'payment', label: 'Payment' },
    { id: 'security', label: 'Security' },
    { id: 'api', label: 'API' },
    { id: 'storage', label: 'Storage' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure platform-wide settings, integrations, and security policies.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">General Settings</h2>
          <div className="mt-4 space-y-4">
            <Input
              label="Platform Name"
              name="platformName"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
            />
            <Input
              label="Support Email"
              name="supportEmail"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
            <Input
              label="Default Timezone"
              name="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
            <Toggle
              checked={maintenanceMode}
              onChange={setMaintenanceMode}
              label="Maintenance Mode"
              description="Disable access for all users except super admins"
            />
          </div>
        </div>
      )}

      {/* SMTP Settings */}
      {activeTab === 'smtp' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">SMTP Configuration</h2>
          <div className="mt-4 space-y-4">
            <Input
              label="SMTP Host"
              name="smtpHost"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
            />
            <Input
              label="SMTP Port"
              name="smtpPort"
              type="number"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
            />
            <Input
              label="SMTP Username"
              name="smtpUsername"
              value={smtpUsername}
              onChange={(e) => setSmtpUsername(e.target.value)}
            />
            <Input
              label="SMTP Password"
              name="smtpPassword"
              type="password"
              value={smtpPassword}
              onChange={(e) => setSmtpPassword(e.target.value)}
            />
            <Toggle
              checked={smtpSecure}
              onChange={setSmtpSecure}
              label="Use SSL/TLS"
            />
            <Input
              label="From Email"
              name="smtpFromEmail"
              type="email"
              value={smtpFromEmail}
              onChange={(e) => setSmtpFromEmail(e.target.value)}
            />
            <Input
              label="From Name"
              name="smtpFromName"
              value={smtpFromName}
              onChange={(e) => setSmtpFromName(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Email Settings */}
      {activeTab === 'email' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Email Settings</h2>
          <div className="mt-4 space-y-4">
            <Toggle
              checked={emailVerification}
              onChange={setEmailVerification}
              label="Email Verification Required"
              description="Require users to verify their email address"
            />
            <Toggle
              checked={emailNotifications}
              onChange={setEmailNotifications}
              label="Enable Email Notifications"
              description="Send email notifications for important events"
            />
            <Toggle
              checked={welcomeEmail}
              onChange={setWelcomeEmail}
              label="Send Welcome Email"
              description="Send welcome email to new users"
            />
            <Toggle
              checked={passwordResetEmail}
              onChange={setPasswordResetEmail}
              label="Password Reset Email"
              description="Send password reset emails"
            />
          </div>
        </div>
      )}

      {/* Payment Gateway Settings */}
      {activeTab === 'payment' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-gray-900">Stripe Configuration</h2>
            <div className="mt-4 space-y-4">
              <Toggle
                checked={stripeEnabled}
                onChange={setStripeEnabled}
                label="Enable Stripe"
              />
              <Input
                label="Publishable Key"
                name="stripePublishableKey"
                value={stripePublishableKey}
                onChange={(e) => setStripePublishableKey(e.target.value)}
              />
              <Input
                label="Secret Key"
                name="stripeSecretKey"
                type="password"
                value={stripeSecretKey}
                onChange={(e) => setStripeSecretKey(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-gray-900">PayPal Configuration</h2>
            <div className="mt-4 space-y-4">
              <Toggle
                checked={paypalEnabled}
                onChange={setPaypalEnabled}
                label="Enable PayPal"
              />
              <Input
                label="Client ID"
                name="paypalClientId"
                value={paypalClientId}
                onChange={(e) => setPaypalClientId(e.target.value)}
              />
              <Input
                label="Secret"
                name="paypalSecret"
                type="password"
                value={paypalSecret}
                onChange={(e) => setPaypalSecret(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-gray-900">Currency Settings</h2>
            <div className="mt-4">
              <Input
                label="Default Currency"
                name="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Security Settings</h2>
          <div className="mt-4 space-y-4">
            <Toggle
              checked={enforceMfa}
              onChange={setEnforceMfa}
              label="Enforce MFA for Admin Users"
              description="Require multi-factor authentication for all admin accounts"
            />
            <Input
              label="Audit Log Retention (days)"
              name="auditRetention"
              type="number"
              value={auditRetention}
              onChange={(e) => setAuditRetention(e.target.value)}
            />
            <Input
              label="Session Timeout (minutes)"
              name="sessionTimeout"
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
            />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Password Requirements</h3>
              <Input
                label="Minimum Length"
                name="passwordMinLength"
                type="number"
                value={passwordMinLength}
                onChange={(e) => setPasswordMinLength(e.target.value)}
              />
              <Toggle
                checked={passwordRequireUppercase}
                onChange={setPasswordRequireUppercase}
                label="Require Uppercase Letters"
              />
              <Toggle
                checked={passwordRequireLowercase}
                onChange={setPasswordRequireLowercase}
                label="Require Lowercase Letters"
              />
              <Toggle
                checked={passwordRequireNumbers}
                onChange={setPasswordRequireNumbers}
                label="Require Numbers"
              />
              <Toggle
                checked={passwordRequireSpecial}
                onChange={setPasswordRequireSpecial}
                label="Require Special Characters"
              />
            </div>
          </div>
        </div>
      )}

      {/* API Settings */}
      {activeTab === 'api' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">API Settings</h2>
          <div className="mt-4 space-y-4">
            <Input
              label="Rate Limit (requests per hour)"
              name="apiRateLimit"
              type="number"
              value={apiRateLimit}
              onChange={(e) => setApiRateLimit(e.target.value)}
            />
            <Input
              label="API Timeout (seconds)"
              name="apiTimeout"
              type="number"
              value={apiTimeout}
              onChange={(e) => setApiTimeout(e.target.value)}
            />
            <Toggle
              checked={enableApiDocs}
              onChange={setEnableApiDocs}
              label="Enable API Documentation"
              description="Make API documentation publicly accessible"
            />
          </div>
        </div>
      )}

      {/* Storage Settings */}
      {activeTab === 'storage' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Storage Configuration</h2>
          <div className="mt-4 space-y-4">
            <Input
              label="Storage Provider"
              name="storageProvider"
              value={storageProvider}
              onChange={(e) => setStorageProvider(e.target.value)}
            />
            <Input
              label="S3 Bucket Name"
              name="s3Bucket"
              value={s3Bucket}
              onChange={(e) => setS3Bucket(e.target.value)}
            />
            <Input
              label="S3 Region"
              name="s3Region"
              value={s3Region}
              onChange={(e) => setS3Region(e.target.value)}
            />
            <Input
              label="S3 Access Key"
              name="s3AccessKey"
              value={s3AccessKey}
              onChange={(e) => setS3AccessKey(e.target.value)}
            />
            <Input
              label="S3 Secret Key"
              name="s3SecretKey"
              type="password"
              value={s3SecretKey}
              onChange={(e) => setS3SecretKey(e.target.value)}
            />
            <Input
              label="Max File Size (MB)"
              name="maxFileSize"
              type="number"
              value={maxFileSize}
              onChange={(e) => setMaxFileSize(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button label="Cancel" variant="ghost" />
        <Button label="Save Changes" variant="primary" />
      </div>
    </div>
  )
}
