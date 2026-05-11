import { useState } from "react";
import {
  HiBell,
  HiBriefcase,
  HiBuildingOffice2,
  HiCalendar,
  HiChevronRight,
  HiClock,
  HiCog6Tooth,
  HiDocumentText,
  HiKey,
  HiLockClosed,
  HiShieldCheck,
  HiSquares2X2,
} from "react-icons/hi2";
import GeneralSection from "./sections/GeneralSection.jsx";
import AttendanceSection from "./sections/AttendanceSection.jsx";
import LeaveSettings from "./LeaveSettings.jsx";
import { ModulesSection } from "./sections/PlaceholderSections.jsx";
import AssetSettingsSection from "./sections/AssetSettingsSection.jsx";
import DocumentSettings from "./DocumentSettings.jsx";
import NotificationSettings from "./NotificationSettings.jsx";
import PasswordSecurity from "./PasswordSecurity.jsx";
import RolesPermissions from "./RolesPermissions.jsx";
import SensitiveData from "./SensitiveData.jsx";

const navItems = [
  {
    id: "general",
    label: "General",
    Icon: HiBuildingOffice2,
    desc: "Company & policies",
  },
  {
    id: "roles",
    label: "Roles & Permissions",
    Icon: HiShieldCheck,
    desc: "Access control",
  },
  // { id: 'modules', label: 'Module Visibility', Icon: HiSquares2X2, desc: 'Role-based views' },
  {
    id: "sensitive",
    label: "Sensitive Data",
    Icon: HiLockClosed,
    desc: "Data permissions",
  },
  {
    id: "attendance",
    label: "Attendance & Time",
    Icon: HiClock,
    desc: "Work hours & rules",
  },
  {
    id: "leave",
    label: "Leave Settings",
    Icon: HiCalendar,
    desc: "Leave types & rules",
  },
  {
    id: "documents",
    label: "Document Settings",
    Icon: HiDocumentText,
    desc: "Upload & tracking",
  },
  {
    id: "assets",
    label: "Asset Settings",
    Icon: HiBriefcase,
    desc: "Categories & rules",
  },
  {
    id: "notifications",
    label: "Notifications",
    Icon: HiBell,
    desc: "Alerts & channels",
  },
  {
    id: "security",
    label: "Password & Security",
    Icon: HiKey,
    desc: "Auth & policies",
  },
];

function ActiveSection({
  active,
  registerGeneralToolbar,
  registerAttendanceToolbar,
  registerAssetsToolbar,
  registerLeaveToolbar,
}) {
  switch (active) {
    case "general":
      return <GeneralSection registerToolbar={registerGeneralToolbar} />;
    case "roles":
      return <RolesPermissions />;
    case "modules":
      return <ModulesSection />;
    case "sensitive":
      return <SensitiveData />;
    case "attendance":
      return <AttendanceSection registerToolbar={registerAttendanceToolbar} />;
    case "leave":
      return <LeaveSettings registerToolbar={registerLeaveToolbar} />;
    case "documents":
      return <DocumentSettings />;
    case "assets":
      return <AssetSettingsSection registerToolbar={registerAssetsToolbar} />;
    case "notifications":
      return <NotificationSettings />;
    case "security":
      return <PasswordSecurity />;
    default:
      return null;
  }
}

export default function HRISSettings() {
  const [active, setActive] = useState("general");
  const [generalToolbar, setGeneralToolbar] = useState(null);
  const [attendanceToolbar, setAttendanceToolbar] = useState(null);
  const [assetsToolbar, setAssetsToolbar] = useState(null);
  const [leaveToolbar, setLeaveToolbar] = useState(null);

  const current = navItems.find((n) => n.id === active);

  const toolbar =
    active === "general"
      ? generalToolbar
      : active === "attendance"
        ? attendanceToolbar
        : active === "assets"
          ? assetsToolbar
          : active === "leave"
            ? leaveToolbar
            : null;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="flex w-64 shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-[#0F766E] text-white shadow-sm">
              <HiCog6Tooth className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                Settings
              </p>
              <p className="truncate text-[11px] font-medium uppercase tracking-wide text-gray-400">
                System configuration
              </p>
            </div>
          </div>
        </div>
        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {navItems.map((item) => {
            const isActive = active === item.id;
            const Icon = item.Icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={`group relative mx-0.5 flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-left text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#0F766E] text-white shadow-sm"
                    : "text-slate-700 hover:bg-gray-50 hover:text-[#0F766E]"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    isActive
                      ? "opacity-100"
                      : "opacity-70 group-hover:opacity-100"
                  }`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate ${isActive ? "text-white" : "text-slate-800"}`}
                  >
                    {item.label}
                  </p>
                  <p
                    className={`truncate text-[11px] font-normal ${
                      isActive
                        ? "text-teal-100/90"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4 sm:px-8">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
              {current.label}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">{current.desc}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={!toolbar || !toolbar.dirty || toolbar.saving}
              onClick={() => toolbar?.onDiscard?.()}
              className="h-9 rounded-none border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Discard
            </button>
            <button
              type="button"
              disabled={!toolbar || toolbar.disableSave}
              onClick={() => toolbar?.onSave?.()}
              className="h-9 rounded-none bg-[#0F766E] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0c6d66] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {toolbar?.saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </header>

        <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-6 py-2.5 text-xs text-gray-500 sm:px-8">
          <span className="font-medium text-gray-600">Settings</span>
          <HiChevronRight
            className="h-3.5 w-3.5 shrink-0 text-gray-300"
            aria-hidden
          />
          <span className="font-medium text-[#0F766E]">{current.label}</span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-4xl">
            <ActiveSection
              active={active}
              registerGeneralToolbar={setGeneralToolbar}
              registerAttendanceToolbar={setAttendanceToolbar}
              registerAssetsToolbar={setAssetsToolbar}
              registerLeaveToolbar={setLeaveToolbar}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
