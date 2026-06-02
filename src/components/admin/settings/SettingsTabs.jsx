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
  RiLogoutBoxRLine,
  RiMacbookLine
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
  // {
  //   id: 'backup',
  //   label: 'Backup & Restore',
  //   icon: RiDatabase2Line,
  //   desc: 'Data backup & recovery'
  // },
  {
    id: 'exit',
    label: 'Exit Management',
    icon: RiLogoutBoxRLine,
    desc: 'Exit types, clearance & workflow'
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: RiMacbookLine,
    desc: 'Asset categories & rules'
  }
];

export default function SettingsTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {settingsTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 font-bold text-xs transition-all ${isActive
              ? 'bg-[#0F766E] text-white shadow-2xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
