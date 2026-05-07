import { useState } from "react";

const Toggle = ({ defaultChecked = true }) => {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${on ? "bg-indigo-600" : "bg-gray-200"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
};

const Badge = ({ label, color = "indigo" }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[color]}`}>
      {label}
    </span>
  );
};

const SectionCard = ({ title, children }) => (
  <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
    <div className="border-b border-gray-100 px-5 py-3.5">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const FieldRow = ({ label, hint, children }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const TextInput = ({ placeholder, defaultValue, type = "text" }) => (
  <input
    type={type}
    defaultValue={defaultValue}
    placeholder={placeholder}
    className="h-8 w-48 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200 bg-gray-50"
  />
);

const SelectInput = ({ options }) => (
  <select className="h-8 w-48 rounded-lg border border-gray-200 px-2 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200 bg-gray-50">
    {options.map((o) => <option key={o}>{o}</option>)}
  </select>
);

// ─── SECTIONS ────────────────────────────────────────────────────────────────

const GeneralSection = () => (
  <div className="space-y-5">
    <SectionCard title="A. Company Information">
      <FieldRow label="Company Name"><TextInput defaultValue="Acme Corp" /></FieldRow>
      <FieldRow label="Logo" hint="PNG or SVG, max 2MB">
        <button className="h-8 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600 hover:bg-gray-100">Upload Logo</button>
      </FieldRow>
      <FieldRow label="Address(es)"><TextInput placeholder="Enter address" /></FieldRow>
      <FieldRow label="Contact Details"><TextInput placeholder="+1 555 000 0000" /></FieldRow>
      <FieldRow label="Country / Time Zone"><SelectInput options={["UTC+05:30 – India (IST)", "UTC+00:00 – London (GMT)", "UTC-05:00 – New York (EST)"]} /></FieldRow>
      <FieldRow label="Financial Year Start"><SelectInput options={["April 1", "January 1", "July 1"]} /></FieldRow>
      <FieldRow label="Working Days of the Week">
        <div className="flex gap-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <button key={i} className={`w-7 h-7 rounded-full text-xs font-semibold transition-colors ${i < 5 ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"}`}>{d}</button>
          ))}
        </div>
      </FieldRow>
    </SectionCard>

    <SectionCard title="B. Work Calendars">
      <FieldRow label="Default Work Calendar"><SelectInput options={["Standard 9–6", "Flexi Calendar", "Shift Calendar"]} /></FieldRow>
      <FieldRow label="Regional Holidays" hint="Links to holiday setup module"><Toggle /></FieldRow>
      <FieldRow label="Multiple Calendars (Branches)" hint="Allow different calendars per branch"><Toggle defaultChecked={false} /></FieldRow>
    </SectionCard>

    <SectionCard title="C. Others">
      <FieldRow label="Default Probation Period"><SelectInput options={["3 months", "6 months", "1 year"]} /></FieldRow>
      <FieldRow label="Default Notice Period"><SelectInput options={["30 days", "60 days", "90 days"]} /></FieldRow>
      <FieldRow label="Auto-assign Policies to New Employees"><Toggle /></FieldRow>
    </SectionCard>
  </div>
);

const PermissionsSection = () => {
  const [activeRole, setActiveRole] = useState("HR Admin");
  const roles = ["HR Admin", "HR Executive", "Manager", "Employee"];

  const permGroups = [
    { name: "Employee Management", items: ["View all employees", "Add employee", "Edit employee profile", "Terminate employee"] },
    { name: "Attendance", items: ["View attendance of all employees", "Approve regularization", "Edit attendance manually"] },
    { name: "Leave", items: ["Approve leave", "Edit leave balance", "View leave history"] },
    { name: "Documents", items: ["View uploaded documents", "Approve documents", "Download sensitive documents"] },
    { name: "Policies", items: ["Create policies", "Edit policies", "Publish/Unpublish policies"] },
    { name: "Performance", items: ["View all employees' performance", "Edit rating", "Create goals", "View manager feedback"] },
    { name: "Assets", items: ["Issue assets", "Edit assets", "Mark asset as returned"] },
    { name: "Letters & Templates", items: ["Create templates", "Edit templates", "Generate official letters"] },
  ];

  const defaults = { "HR Admin": [0, 1, 2, 3], "HR Executive": [0, 1, 2], "Manager": [0, 2], "Employee": [0], "Custom Role": [0, 1] };

  return (
    <div className="flex gap-5">
      <div className="w-44 flex-shrink-0 space-y-1">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setActiveRole(r)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${activeRole === r ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            {r}
          </button>
        ))}
        <button className="w-full rounded-lg border-2 border-dashed border-gray-200 px-3 py-2 text-left text-sm text-gray-400 hover:border-indigo-300 mt-2">
          + Add Role
        </button>
      </div>
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Permissions for <span className="text-indigo-600">{activeRole}</span></h3>
          <Badge label="Role-based" />
        </div>
        {permGroups.map((group) => (
          <SectionCard key={group.name} title={group.name}>
            {group.items.map((item, idx) => (
              <FieldRow key={item} label={item}>
                <Toggle defaultChecked={defaults[activeRole]?.includes(idx % 4) ?? false} />
              </FieldRow>
            ))}
          </SectionCard>
        ))}
      </div>
    </div>
  );
};

const ModulesSection = () => {
  const modules = [
    "Employee Profile", "Documents & Approvals", "Visa & Nationality",
    "Leave", "Attendance", "Performance", "Payroll / Salary",
    "Assets", "Policies", "Templates", "Reports",
  ];
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3.5 grid grid-cols-5 items-center gap-4">
          <p className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Module</p>
          {["HR", "Managers", "Employees"].map((r) => (
            <p key={r} className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">{r}</p>
          ))}
        </div>
        {modules.map((mod, i) => (
          <div key={mod} className={`grid grid-cols-5 items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
            <p className="col-span-2 text-sm text-gray-700 font-medium">{mod}</p>
            {[true, mod !== "Visa & Nationality" && mod !== "Payroll / Salary", false].map((def, j) => (
              <div key={j} className="flex justify-center">
                <Toggle defaultChecked={!!def} />
              </div>
            ))}
          </div>
        ))}
      </div>

    </div>
  );
};

const SensitiveDataSection = () => (
  <div className="space-y-5">
    <SectionCard title="A. Salary Data Visibility">
      {["Salary Breakup", "CTC", "Payslips", "Revisions", "Payroll Reports"].map((item) => (
        <FieldRow key={item} label={item}>
          <SelectInput options={["HR Admin only", "HR Admin + Payroll Team", "HR Admin + Manager", "Employee (own only)"]} />
        </FieldRow>
      ))}
    </SectionCard>
    <SectionCard title="B. Visa & Nationality Visibility">
      <FieldRow label="HR Admin"><Badge label="Full Access" color="green" /></FieldRow>
      <FieldRow label="HR Executive"><Badge label="Full Access" color="green" /></FieldRow>
      <FieldRow label="Manager"><Badge label="Hidden" color="red" /></FieldRow>
      <FieldRow label="Employee"><Badge label="Own info only" color="amber" /></FieldRow>
    </SectionCard>
    <SectionCard title="C. Document Visibility">
      {["Passport Copy", "Visa Copy", "National ID", "Medical Documents", "Performance Issues"].map((doc) => (
        <FieldRow key={doc} label={doc}>
          <SelectInput options={["HR only", "HR + Manager", "All"]} />
        </FieldRow>
      ))}
    </SectionCard>
    <SectionCard title="D. Notes / Disciplinary Visibility">
      <FieldRow label="Notes Visibility"><SelectInput options={["HR only", "HR + Manager", "Employee"]} /></FieldRow>
    </SectionCard>
  </div>
);

const AttendanceSection = () => (
  <div className="space-y-5">
    <SectionCard title="A. Work Hours">
      <FieldRow label="Start Time"><TextInput type="time" defaultValue="09:00" /></FieldRow>
      <FieldRow label="End Time"><TextInput type="time" defaultValue="18:00" /></FieldRow>
      <FieldRow label="Break Duration"><SelectInput options={["30 minutes", "45 minutes", "1 hour"]} /></FieldRow>
      <FieldRow label="Total Required Hours" hint="Auto-calculated or manual"><TextInput defaultValue="8.5 hrs" /></FieldRow>
    </SectionCard>
    <SectionCard title="B. Attendance Rules">
      <FieldRow label="Min. Hours for Present Mark"><TextInput defaultValue="6 hrs" /></FieldRow>
      <FieldRow label="10-Minute Buffer" hint="Allow 10 min grace before late mark"><Toggle /></FieldRow>
      <FieldRow label="Late Mark Auto-Calculation"><Toggle /></FieldRow>
      <FieldRow label="Grace Days Allowed per Month"><TextInput defaultValue="2" /></FieldRow>
      <FieldRow label="Early Departure Rules"><SelectInput options={["Mark half day", "Mark absent", "Inform manager"]} /></FieldRow>
    </SectionCard>
    <SectionCard title="C. Regularization Settings">
      <FieldRow label="Who Can Submit Request"><SelectInput options={["All employees", "On probation only", "Permanent only"]} /></FieldRow>
      <FieldRow label="Approver"><SelectInput options={["HR", "Manager", "Both"]} /></FieldRow>
      <FieldRow label="Auto-Rejection After (days)"><TextInput defaultValue="3" /></FieldRow>
    </SectionCard>
    <SectionCard title="D. Overtime Settings (Optional)">
      <FieldRow label="Overtime Eligibility"><Toggle defaultChecked={false} /></FieldRow>
      <FieldRow label="Calculation Rule"><SelectInput options={["1.5× hourly", "2× hourly", "Flat rate"]} /></FieldRow>
      <FieldRow label="Approval Workflow"><SelectInput options={["Manager → HR", "HR only", "Auto-approved"]} /></FieldRow>
    </SectionCard>
  </div>
);

const LeaveSection = () => {
  const leaveTypes = [
    { name: "Annual Leave", paid: true, days: 21 },
    { name: "Sick Leave", paid: true, days: 10 },
    { name: "Unpaid Leave", paid: false, days: "—" },
    { name: "Casual Leave", paid: true, days: 6 },
    { name: "Emergency Leave", paid: true, days: 3 },
    { name: "Maternity / Paternity", paid: true, days: 90 },
    { name: "Compensatory Off", paid: true, days: "Earned" },
  ];
  const [selected, setSelected] = useState(leaveTypes[0]);

  return (
    <div className="flex gap-5">
      <div className="w-56 flex-shrink-0 space-y-1.5">
        {leaveTypes.map((lt) => (
          <button
            key={lt.name}
            onClick={() => setSelected(lt)}
            className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors border ${selected.name === lt.name ? "border-indigo-200 bg-indigo-50" : "border-transparent hover:bg-gray-50"}`}
          >
            <p className={`text-sm font-medium ${selected.name === lt.name ? "text-indigo-700" : "text-gray-700"}`}>{lt.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge label={lt.paid ? "Paid" : "Unpaid"} color={lt.paid ? "green" : "gray"} />
              <span className="text-xs text-gray-400">{lt.days} days</span>
            </div>
          </button>
        ))}
        <button className="w-full rounded-lg border-2 border-dashed border-gray-200 px-3 py-2 text-sm text-gray-400 hover:border-indigo-300 mt-1">
          + Custom Type
        </button>
      </div>
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">{selected.name} — Configuration</h3>
          <Badge label={selected.paid ? "Paid Leave" : "Unpaid"} color={selected.paid ? "green" : "gray"} />
        </div>
        <SectionCard title="Leave Type Details">
          <FieldRow label="Leave Type Name"><TextInput defaultValue={selected.name} /></FieldRow>
          <FieldRow label="Paid or Unpaid"><SelectInput options={["Paid", "Unpaid"]} /></FieldRow>
          <FieldRow label="Annual Entitlement (days)"><TextInput defaultValue={String(selected.days)} /></FieldRow>
          <FieldRow label="Accrual"><SelectInput options={["Monthly", "Yearly", "None"]} /></FieldRow>
          <FieldRow label="Max Carry Forward (days)"><TextInput defaultValue="5" /></FieldRow>
          <FieldRow label="Loss of Pay Rule"><SelectInput options={["No LOP", "LOP after 2 days", "LOP after 5 days"]} /></FieldRow>
          <FieldRow label="Document Required"><Toggle defaultChecked={selected.name === "Sick Leave"} /></FieldRow>
          <FieldRow label="Auto-Approval"><Toggle defaultChecked={false} /></FieldRow>
          <FieldRow label="Approver"><SelectInput options={["Manager", "HR", "Both"]} /></FieldRow>
        </SectionCard>
      </div>
    </div>
  );
};

const DocumentSection = () => {
  const docs = ["National ID", "Passport Copy", "Visa Copy", "Educational Certificates", "Medical Documents", "Bank Details"];
  return (
    <div className="space-y-5">
      <SectionCard title="Required Documents List">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {docs.map((d) => (
            <div key={d} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 bg-gray-50">
              <span className="text-sm text-gray-700 flex-1">{d}</span>
              <Badge label="Required" color="indigo" />
            </div>
          ))}
        </div>
        <button className="w-full rounded-lg border-2 border-dashed border-gray-200 py-2 text-sm text-gray-400 hover:border-indigo-300">
          + Add Document Type
        </button>
      </SectionCard>
      <SectionCard title="Per-Document Settings (Passport Copy)">
        <FieldRow label="Mandatory or Optional"><SelectInput options={["Mandatory", "Optional"]} /></FieldRow>
        <FieldRow label="Who Must Upload"><SelectInput options={["Employee", "HR", "Either"]} /></FieldRow>
        <FieldRow label="Expiry Tracking"><Toggle /></FieldRow>
        <FieldRow label="Reminder Before Expiry (days)"><TextInput defaultValue="30" /></FieldRow>
        <FieldRow label="HR Approval Required"><Toggle /></FieldRow>
        <FieldRow label="Visibility"><SelectInput options={["HR only", "Employee also"]} /></FieldRow>
      </SectionCard>
    </div>
  );
};

const AssetSection = () => {
  const categories = [
    { icon: "💻", name: "Laptop" }, { icon: "📱", name: "Mobile" },
    { icon: "📶", name: "SIM Card" }, { icon: "🪪", name: "Access Card" },
    { icon: "👕", name: "Uniform" }, { icon: "🔧", name: "Tools" },
  ];
  return (
    <div className="space-y-5">
      <SectionCard title="A. Asset Categories">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {categories.map((c) => (
            <div key={c.name} className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
              <span className="text-xl">{c.icon}</span>
              <span className="text-sm font-medium text-gray-700">{c.name}</span>
            </div>
          ))}
        </div>

      </SectionCard>
      <SectionCard title="B. Asset Rules">
        <FieldRow label="Assigning Rules"><SelectInput options={["Manager assigns", "HR assigns", "Auto-assign on joining"]} /></FieldRow>
        <FieldRow label="Return Rules"><SelectInput options={["On last day", "30 days before exit", "Immediate"]} /></FieldRow>
        <FieldRow label="Lost / Damaged Policy"><SelectInput options={["Employee pays", "Insurance covered", "Case by case"]} /></FieldRow>
        <FieldRow label="Asset Approval Workflow"><SelectInput options={["Manager → HR", "HR only", "Auto-approved"]} /></FieldRow>
      </SectionCard>
    </div>
  );
};

const NotificationSection = () => {
  const events = [
    "Leave Approval", "Document Approval", "Visa Expiry", "Policy Assignment",
    "Performance Review Due", "Asset Issue / Return", "Attendance Reminders",
  ];
  return (
    <div className="space-y-5">
      <SectionCard title="A. Notification Channels">
        <FieldRow label="Email Notifications"><Toggle /></FieldRow>
        <FieldRow label="SMS Notifications" hint="Optional – carrier charges may apply"><Toggle defaultChecked={false} /></FieldRow>
        <FieldRow label="In-app Alerts"><Toggle /></FieldRow>
      </SectionCard>
      <SectionCard title="B. Event-Based Notifications">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide w-48">Event</th>
                {["Email", "SMS", "In-app"].map((h) => (
                  <th key={h} className="text-center py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((ev, i) => (
                <tr key={ev} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? "" : "bg-gray-50/40"}`}>
                  <td className="py-3 text-gray-700 font-medium">{ev}</td>
                  <td className="text-center py-3"><Toggle defaultChecked={true} /></td>
                  <td className="text-center py-3"><Toggle defaultChecked={false} /></td>
                  <td className="text-center py-3"><Toggle defaultChecked={true} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

const SecuritySection = () => (
  <div className="space-y-5">
    <SectionCard title="A. Password Policy">
      <FieldRow label="Minimum Length"><TextInput defaultValue="8" /></FieldRow>
      <FieldRow label="Must Include Special Characters"><Toggle /></FieldRow>
      <FieldRow label="Password Expiry (days)"><TextInput defaultValue="90" /></FieldRow>
      <FieldRow label="Two-Factor Authentication (2FA)"><Toggle defaultChecked={false} /></FieldRow>
    </SectionCard>
    <SectionCard title="B. Account Security">
      <FieldRow label="Auto-Logout After Inactivity (minutes)"><TextInput defaultValue="30" /></FieldRow>
      <FieldRow label="Max Login Attempt Limit"><TextInput defaultValue="5" /></FieldRow>
      <FieldRow label="Blocked Account Recovery" hint="Email recovery or admin reset">
        <SelectInput options={["Email recovery", "Admin reset only", "Both"]} />
      </FieldRow>
    </SectionCard>
  </div>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const navItems = [
  { id: "general", label: "General", icon: "🏢", desc: "Company & Policies" },
  { id: "roles", label: "Roles & Permissions", icon: "🔐", desc: "Access Control" },
  { id: "modules", label: "Module Visibility", icon: "👁️", desc: "Role-based Views" },
  { id: "sensitive", label: "Sensitive Data", icon: "🔒", desc: "Data Permissions" },
  { id: "attendance", label: "Attendance & Time", icon: "🕐", desc: "Work Hours & Rules" },
  { id: "leave", label: "Leave Settings", icon: "🌴", desc: "Leave Types & Rules" },
  { id: "documents", label: "Document Settings", icon: "📄", desc: "Upload & Tracking" },
  { id: "assets", label: "Asset Settings", icon: "💼", desc: "Categories & Rules" },
  { id: "notifications", label: "Notifications", icon: "🔔", desc: "Alerts & Channels" },
  { id: "security", label: "Password & Security", icon: "🛡️", desc: "Auth & Policies" },
];

const sectionComponents = {
  general: <GeneralSection />,
  roles: <PermissionsSection />,
  modules: <ModulesSection />,
  sensitive: <SensitiveDataSection />,
  attendance: <AttendanceSection />,
  leave: <LeaveSection />,
  documents: <DocumentSection />,
  assets: <AssetSection />,
  notifications: <NotificationSection />,
  security: <SecuritySection />,
};

export default function HRISSettings() {
  const [active, setActive] = useState("general");
  const current = navItems.find((n) => n.id === active);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">H</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">HRIS Settings</p>
              <p className="text-xs text-gray-400">System Configuration</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${active === item.id
                ? "bg-[#0f766e] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${active === item.id ? "text-white" : "text-gray-700"}`}>
                  {item.label}
                </p>
                <p className="text-[10px] text-gray-400 truncate">{item.desc}</p>
              </div>
              {active === item.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
              )}
            </button>
          ))}
        </nav>

      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{current.label}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{current.desc}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-8 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Discard
            </button>
            <button className="h-8 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
              Save Changes
            </button>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="px-8 py-2 flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 border-b border-gray-100">
          <span>Settings</span>
          <span>/</span>
          <span className="text-indigo-600 font-medium">{current.label}</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {sectionComponents[active]}
        </div>
      </main>
    </div>
  );
}
