import { Modal } from '../ui/Modal.jsx';

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All employees' },
  { value: 'departments', label: 'Specific departments' },
  { value: 'roles', label: 'Specific roles' },
  { value: 'new_joiners', label: 'New joiners only' },
];

export default function PolicyPublishSettingsModal({
  isOpen,
  onClose,
  settings,
  onChange,
  departments = [],
  roles = [],
  onConfirm,
  saving = false,
}) {
  const toggleId = (field, id) => {
    const key = field === 'departments' ? 'departmentIds' : 'roleIds';
    const current = settings[key] || [];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    onChange({ ...settings, [key]: next });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showClose
      header={
        <div className="flex flex-col gap-1 pr-8">
          <h2 className="text-lg font-bold text-slate-900">Publish policy</h2>
          <p className="text-xs font-medium text-slate-500">
            Choose who can view and acknowledge this policy after it is published.
          </p>
        </div>
      }
    >
      <div className="pt-1">

      <div className="space-y-3">
        {AUDIENCE_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
              settings.type === opt.value
                ? 'border-[#0F766E] bg-[#0F766E]/5'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              name="audienceType"
              checked={settings.type === opt.value}
              onChange={() => onChange({ ...settings, type: opt.value })}
              className="h-4 w-4 text-[#0F766E]"
            />
            <span className="text-sm font-semibold text-slate-800">{opt.label}</span>
          </label>
        ))}
      </div>

      {settings.type === 'departments' && (
        <div className="mt-4 rounded-xl border border-slate-200 p-4 max-h-48 overflow-y-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Departments</p>
          <div className="flex flex-wrap gap-2">
            {departments.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => toggleId('departments', d.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-all ${
                  (settings.departmentIds || []).includes(d.id)
                    ? 'bg-[#0F766E] text-white border-[#0F766E]'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {settings.type === 'roles' && (
        <div className="mt-4 rounded-xl border border-slate-200 p-4 max-h-48 overflow-y-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Roles</p>
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => toggleId('roles', r.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-all ${
                  (settings.roleIds || []).includes(r.id)
                    ? 'bg-[#0F766E] text-white border-[#0F766E]'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {r.name || r.slug}
              </button>
            ))}
          </div>
        </div>
      )}

      {settings.type === 'new_joiners' && (
        <div className="mt-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Joined within last (days)
          </label>
          <input
            type="number"
            min={1}
            max={365}
            value={settings.newJoinersDays ?? 90}
            onChange={(e) =>
              onChange({ ...settings, newJoinersDays: parseInt(e.target.value, 10) || 90 })
            }
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={saving}
          className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Publishing…' : 'Publish policy'}
        </button>
      </div>
      </div>
    </Modal>
  );
}
