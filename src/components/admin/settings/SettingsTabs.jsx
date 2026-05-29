import React from 'react';
import {
  RiSettings3Line,
  RiShieldUserLine,
  RiLockPasswordLine,
  RiShieldCheckLine,
  RiNotification3Line,
  RiMailSettingsLine,
  RiLinksLine,
  RiBankCardLine,
  RiHistoryLine,
  RiDatabase2Line,
  RiLogoutBoxRLine
} from 'react-icons/ri';

export const settingsTabs = [
  {
    id: 'general',
    label: 'General',
    icon: RiSettings3Line,
    desc: 'Company & policies'
  },
  {
    id: 'roles',
    label: 'Roles & Permissions',
    icon: RiShieldUserLine,
    desc: 'Access control'
  },
  {
    id: 'sensitive',
    label: 'Sensitive Data',
    icon: RiLockPasswordLine,
    desc: 'Data permissions'
  },
  {
    id: 'security',
    label: 'Security',
    icon: RiShieldCheckLine,
    desc: 'Auth & policies'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: RiNotification3Line,
    desc: 'Alerts & channels'
  },
  {
    id: 'email',
    label: 'Email Settings',
    icon: RiMailSettingsLine,
    desc: 'Email configuration'
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: RiLinksLine,
    desc: 'Third-party integrations'
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: RiBankCardLine,
    desc: 'Billing & subscription'
  },
  {
    id: 'audit',
    label: 'Audit Logs',
    icon: RiHistoryLine,
    desc: 'System audit logs'
  },
  {
    id: 'backup',
    label: 'Backup & Restore',
    icon: RiDatabase2Line,
    desc: 'Data backup & recovery'
  },
  {
    id: 'exit',
    label: 'Exit Management',
    icon: RiLogoutBoxRLine,
    desc: 'Workflows & templates'
  }
];

export default function SettingsTabs({ activeTab, setActiveTab }) {
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border px-4 py-2 text-sm font-semibold transition-all rounded-sm ${
                isActive
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
