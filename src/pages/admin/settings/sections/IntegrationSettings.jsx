import { useState } from 'react';

export default function IntegrationSettings() {
  const [integrations] = useState([
    {
      id: 'api',
      name: 'REST API',
      status: 'active',
      description: 'External API integration for data exchange',
    },
    {
      id: 'webhook',
      name: 'Webhooks',
      status: 'inactive',
      description: 'Real-time event notifications',
    },
    {
      id: 'sso',
      name: 'Single Sign-On (SSO)',
      status: 'active',
      description: 'LDAP/Active Directory integration',
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Integrations</h3>
        
        <div className="space-y-3">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="flex items-start justify-between border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">{integration.name}</h4>
                <p className="text-sm text-slate-600 mt-1">{integration.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    integration.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {integration.status === 'active' ? 'Active' : 'Inactive'}
                </span>
                <button className="px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded-lg transition-colors">
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Contact your system administrator to enable or configure integrations.
        </p>
      </div>
    </div>
  );
}
