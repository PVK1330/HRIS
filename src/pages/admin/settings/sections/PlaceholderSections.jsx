import { useState } from 'react'
import { Badge, SectionCard, FieldRow, TextInput, SelectInput, Toggle } from '../components/ui'

export const PermissionsSection = () => {
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

export const ModulesSection = () => {
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

export const SensitiveDataSection = () => (
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

export const LeaveSection = () => {
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

export const DocumentSection = () => {
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

export const NotificationSection = () => {
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

export const SecuritySection = () => (
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
