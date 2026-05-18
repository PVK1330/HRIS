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
