import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { HiChevronRight } from "react-icons/hi2";
import SettingsTabs, { settingsTabs } from "../../../components/admin/settings/SettingsTabs.jsx";
import GeneralSection from "./sections/GeneralSection.jsx";
import AttendanceSection from "./sections/AttendanceSection.jsx";
import HolidaysSection from "./sections/HolidaysSection.jsx";
import LeaveSettings from "./LeaveSettings.jsx";
import RolesPermissions from "./RolesPermissions.jsx";
import PasswordSecurity from "./PasswordSecurity.jsx";
import NotificationSettings from "./NotificationSettings.jsx";
import EmailSettings from "./sections/EmailSettings.jsx";
import BillingSettings from "./sections/BillingSettings.jsx";
import DocumentSettings from "./DocumentSettings.jsx";
import AuditLogs from "./sections/AuditLogs.jsx";
import BackupRestore from "./sections/BackupRestore.jsx";
import ExitSettingsSection from "./sections/ExitSettingsSection.jsx";
import AssetSettingsSection from "./sections/AssetSettingsSection.jsx";

function ActiveSection({
  active,
  registerGeneralToolbar,
}) {
  switch (active) {
    case "general":
      return <GeneralSection registerToolbar={registerGeneralToolbar} />;
    case "attendance":
      return <AttendanceSection registerToolbar={registerGeneralToolbar} />;
    case "holidays":
      return <HolidaysSection />;
    case "leave":
      return <LeaveSettings registerToolbar={registerGeneralToolbar} />;
    case "roles":
      return <RolesPermissions />;
    case "security":
      return <PasswordSecurity />;
    case "notifications":
      return <NotificationSettings />;
    case "email":
      return <EmailSettings />;
    case "billing":
      return <BillingSettings />;
    case "documents":
      return <DocumentSettings />;
    case "audit":
      return <AuditLogs />;
    case "backup":
      return <BackupRestore />;
    case "exit":
      return <ExitSettingsSection />;
    case "assets":
      return <AssetSettingsSection registerToolbar={registerGeneralToolbar} />;
    default:
      return null;
  }
}

export default function AdminSettings() {
  const [params, setParams] = useSearchParams();
  // Keep the active tab in the URL so deep links (e.g. returning from Stripe to
  // ?tab=billing) land on the right section.
  const urlTab = params.get("tab");
  const initialTab = settingsTabs.some((t) => t.id === urlTab) ? urlTab : "general";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [generalToolbar, setGeneralToolbar] = useState(null);
  const [fade, setFade] = useState(true);

  const handleTabChange = (id) => {
    setActiveTab(id);
    // Preserve any other query params (e.g. stripe return params) the page carries.
    const next = new URLSearchParams(params);
    next.set("tab", id);
    setParams(next, { replace: true });
  };

  // Follow back/forward navigation that changes ?tab=.
  useEffect(() => {
    if (urlTab && urlTab !== activeTab && settingsTabs.some((t) => t.id === urlTab)) {
      setActiveTab(urlTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTab]);

  // Smooth fade transition on tab switch
  useEffect(() => {
    setFade(false);
    const timeout = setTimeout(() => setFade(true), 150);
    return () => clearTimeout(timeout);
  }, [activeTab]);

  const currentTab = settingsTabs.find((t) => t.id === activeTab) || settingsTabs[0];

  const toolbar = activeTab === "general" ? generalToolbar : null;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 min-w-0">
      {/* Top Title Bar with Breadcrumbs & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">System Configuration</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Settings</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600 uppercase tracking-wider">{currentTab.label}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0">
          <button
            type="button"
            disabled={!toolbar || !toolbar.dirty || toolbar.saving}
            onClick={() => toolbar?.onDiscard?.()}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-none border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0F766E] transition-colors shadow-2xs shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="button"
            disabled={!toolbar || toolbar.disableSave}
            onClick={() => toolbar?.onSave?.()}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-none bg-[#0F766E] px-3 text-xs font-bold text-white hover:bg-[#0c6b64] transition-colors shadow-2xs shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {toolbar?.saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {/* Tabs and Content Container */}
      <div className="rounded-none border border-slate-200 bg-white shadow-sm min-w-0">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:p-5 min-w-0">
          <SettingsTabs activeTab={activeTab} setActiveTab={handleTabChange} />
        </div>

        <div className="min-w-0 p-4 sm:p-6">
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{currentTab.label}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{currentTab.desc}</p>
            </div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-none w-max">
              {currentTab.id} Mode
            </div>
          </div>

          <main className={`transition-all duration-300 transform ${fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
            <ActiveSection
              active={activeTab}
              registerGeneralToolbar={setGeneralToolbar}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
