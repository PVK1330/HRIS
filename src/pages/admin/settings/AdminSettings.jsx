import { useState, useEffect } from "react";
import { HiChevronRight } from "react-icons/hi2";
import SettingsTabs, { settingsTabs } from "../../../components/admin/settings/SettingsTabs.jsx";
import GeneralSection from "./sections/GeneralSection.jsx";
import RolesPermissions from "./RolesPermissions.jsx";
import SensitiveData from "./SensitiveData.jsx";
import PasswordSecurity from "./PasswordSecurity.jsx";
import NotificationSettings from "./NotificationSettings.jsx";
import EmailSettings from "./sections/EmailSettings.jsx";
import IntegrationSettings from "./sections/IntegrationSettings.jsx";
import BillingSettings from "./sections/BillingSettings.jsx";
import AuditLogs from "./sections/AuditLogs.jsx";
import BackupRestore from "./sections/BackupRestore.jsx";

function ActiveSection({
  active,
  registerGeneralToolbar,
}) {
  switch (active) {
    case "general":
      return <GeneralSection registerToolbar={registerGeneralToolbar} />;
    case "roles":
      return <RolesPermissions />;
    case "sensitive":
      return <SensitiveData />;
    case "security":
      return <PasswordSecurity />;
    case "notifications":
      return <NotificationSettings />;
    case "email":
      return <EmailSettings />;
    case "integrations":
      return <IntegrationSettings />;
    case "billing":
      return <BillingSettings />;
    case "audit":
      return <AuditLogs />;
    case "backup":
      return <BackupRestore />;
    default:
      return null;
  }
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [generalToolbar, setGeneralToolbar] = useState(null);
  const [fade, setFade] = useState(true);

  // Smooth fade transition on tab switch
  useEffect(() => {
    setFade(false);
    const timeout = setTimeout(() => setFade(true), 150);
    return () => clearTimeout(timeout);
  }, [activeTab]);

  const currentTab = settingsTabs.find((t) => t.id === activeTab) || settingsTabs[0];

  const toolbar = activeTab === "general" ? generalToolbar : null;

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 pb-12">
      {/* 1. Header with Title & Toolbar Actions */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5 sm:px-8 shadow-sm">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl flex items-center gap-2">
            System Configuration
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Manage your organization's settings and configurations
          </p>
        </div>
        
        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            disabled={!toolbar || !toolbar.dirty || toolbar.saving}
            onClick={() => toolbar?.onDiscard?.()}
            className="h-10 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="button"
            disabled={!toolbar || toolbar.disableSave}
            onClick={() => toolbar?.onSave?.()}
            className="h-10 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {toolbar?.saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </header>

      {/* 2. Breadcrumbs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-6 py-3 text-xs font-medium text-slate-500 sm:px-8">
        <span className="text-slate-400">Settings</span>
        <HiChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden />
        <span className="text-emerald-700 font-bold">{currentTab.label}</span>
      </div>

      <div className="px-6 py-6 sm:px-8 max-w-7xl mx-auto space-y-6">
        {/* 3. Modern Horizontal Top Navigation Tabs */}
        <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* 4. Active Tab Details Info */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{currentTab.label}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{currentTab.desc}</p>
          </div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-full w-max">
            {currentTab.id} Mode
          </div>
        </div>

        {/* 5. Dynamically Rendered Tab Content Section */}
        <main className={`transition-all duration-300 transform ${fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          <div className="mx-auto max-w-4xl bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
            <ActiveSection
              active={activeTab}
              registerGeneralToolbar={setGeneralToolbar}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
