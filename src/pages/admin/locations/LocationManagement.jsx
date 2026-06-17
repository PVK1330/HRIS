import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { RiMapPin2Line, RiAddLine, RiSearchLine, RiDeleteBinLine, RiMapPinLine } from 'react-icons/ri';
import {
  listLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../../../services/locationsService';

const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Australia/Sydney',
  'Pacific/Auckland',
  'UTC',
];

const TZ_LABELS = {
  'Asia/Kolkata': '(GMT+05:30) Asia/Kolkata',
  'Asia/Dubai': '(GMT+04:00) Asia/Dubai',
  'Asia/Singapore': '(GMT+08:00) Asia/Singapore',
  'Asia/Tokyo': '(GMT+09:00) Asia/Tokyo',
  'Asia/Shanghai': '(GMT+08:00) Asia/Shanghai',
  'Europe/London': '(GMT+00:00) Europe/London',
  'Europe/Paris': '(GMT+01:00) Europe/Paris',
  'Europe/Berlin': '(GMT+01:00) Europe/Berlin',
  'America/New_York': '(GMT-05:00) America/New York',
  'America/Chicago': '(GMT-06:00) America/Chicago',
  'America/Los_Angeles': '(GMT-08:00) America/Los Angeles',
  'America/Sao_Paulo': '(GMT-03:00) America/Sao Paulo',
  'Australia/Sydney': '(GMT+11:00) Australia/Sydney',
  'Pacific/Auckland': '(GMT+13:00) Pacific/Auckland',
  UTC: '(GMT+00:00) UTC',
};

const EMPTY_FORM = {
  name: '',
  code: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  latitude: '',
  longitude: '',
  radiusMeters: 200,
  timezone: 'Asia/Kolkata',
  status: 'active',
  description: '',
};

function formFromRecord(r) {
  return {
    name: r.name ?? '',
    code: r.code ?? '',
    address: r.address ?? '',
    city: r.city ?? '',
    state: r.state ?? '',
    country: r.country ?? 'India',
    latitude: r.latitude != null ? String(r.latitude) : '',
    longitude: r.longitude != null ? String(r.longitude) : '',
    radiusMeters: r.radius_meters ?? 200,
    timezone: r.timezone ?? 'Asia/Kolkata',
    status: r.status ?? 'active',
    description: r.description ?? '',
  };
}

const inp =
  'h-9 w-full rounded-none border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]';
const sel =
  'h-9 w-full cursor-pointer rounded-none border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]';

function Label({ children, required }) {
  return (
    <label className="mb-1 block text-xs font-semibold text-gray-600">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

export default function LocationManagement() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null); // null = nothing, 'new' = add form, {id,...} = edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const debounceRef = useRef(null);

  const load = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const res = await listLocations({ search: q, limit: 200 });
      setLocations(res?.data ?? res ?? []);
    } catch (e) {
      toast.error(e.message || 'Failed to load locations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(val), 350);
  };

  const selectLocation = (loc) => {
    setSelected(loc);
    setForm(formFromRecord(loc));
    setErrors({});
  };

  const startNew = () => {
    setSelected('new');
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const cancelForm = () => {
    setSelected(null);
    setErrors({});
  };

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    const key = Object.keys(patch)[0];
    if (key && errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Location name is required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (form.latitude !== '' && (isNaN(Number(form.latitude)) || Number(form.latitude) < -90 || Number(form.latitude) > 90))
      e.latitude = 'Must be -90 to 90';
    if (form.longitude !== '' && (isNaN(Number(form.longitude)) || Number(form.longitude) < -180 || Number(form.longitude) > 180))
      e.longitude = 'Must be -180 to 180';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const payload = {
      name: form.name.trim(),
      code: form.code.trim() || null,
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      country: form.country.trim() || 'India',
      latitude: form.latitude !== '' ? Number(form.latitude) : null,
      longitude: form.longitude !== '' ? Number(form.longitude) : null,
      radiusMeters: Number(form.radiusMeters) || 200,
      timezone: form.timezone,
      status: form.status,
      description: form.description.trim() || null,
    };

    setSaving(true);
    try {
      if (selected === 'new') {
        const created = await createLocation(payload);
        toast.success('Location created');
        await load(search);
        setSelected(created);
        setForm(formFromRecord(created));
      } else {
        const updated = await updateLocation(selected.id, payload);
        toast.success('Location updated');
        await load(search);
        setSelected(updated);
        setForm(formFromRecord(updated));
      }
      setErrors({});
    } catch (err) {
      toast.error(err.message || 'Failed to save location');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || selected === 'new') return;
    if (!window.confirm(`Delete "${selected.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteLocation(selected.id);
      toast.success('Location deleted');
      setSelected(null);
      await load(search);
    } catch (err) {
      toast.error(err.message || 'Failed to delete location');
    } finally {
      setDeleting(false);
    }
  };

  const isEditing = selected !== null;
  const isNew = selected === 'new';

  return (
    <div className="flex min-h-[24rem] flex-col gap-0">
      {/* Split-pane layout */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* ── Left: Location List ── */}
        <div className="w-full rounded-none border border-gray-200 bg-white shadow-sm lg:w-72 lg:shrink-0">
          {/* List header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <span className="text-sm font-bold text-slate-800">Location List</span>
            <button
              type="button"
              onClick={startNew}
              className="inline-flex items-center gap-1 rounded-none bg-[#4F46E5] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#4338CA] transition-colors"
            >
              <RiAddLine className="h-3.5 w-3.5" />
              Add Location
            </button>
          </div>

          {/* Search */}
          <div className="border-b border-gray-100 px-3 py-2">
            <div className="relative">
              <RiSearchLine className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search location..."
                className="h-8 w-full rounded-none border border-gray-200 bg-gray-50 pl-8 pr-3 text-xs text-gray-700 outline-none focus:border-[#4F46E5] focus:bg-white focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          {/* List items */}
          <div className="max-h-[calc(100vh-18rem)] overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            ) : locations.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <RiMapPinLine className="h-8 w-8 text-gray-300" />
                <p className="text-xs text-gray-400">No locations found</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {locations.map((loc) => {
                  const isActive = selected && selected !== 'new' && selected.id === loc.id;
                  return (
                    <li key={loc.id}>
                      <button
                        type="button"
                        onClick={() => selectLocation(loc)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                          <RiMapPin2Line className="h-4 w-4 text-[#4F46E5]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900">{loc.name}</p>
                          {(loc.city || loc.state) && (
                            <p className="truncate text-xs text-gray-500">
                              {[loc.city, loc.state].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            loc.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {loc.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* List footer count */}
          {!loading && locations.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2 text-[11px] text-gray-400">
              Showing 1 to {locations.length} of {locations.length} location{locations.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* ── Right: Location Details / Empty ── */}
        <div className="min-w-0 flex-1 rounded-none border border-gray-200 bg-white shadow-sm">
          {!isEditing ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center gap-3 py-32 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                <RiMapPin2Line className="h-8 w-8 text-[#4F46E5]" />
              </div>
              <p className="text-base font-semibold text-gray-700">Select a location to view details</p>
              <p className="max-w-xs text-sm text-gray-400">
                Click a location from the list, or use + Add Location to create a new one.
              </p>
              <button
                type="button"
                onClick={startNew}
                className="mt-2 inline-flex items-center gap-1.5 rounded-none bg-[#4F46E5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4338CA] transition-colors"
              >
                <RiAddLine className="h-4 w-4" />
                Add Location
              </button>
            </div>
          ) : (
            /* Form */
            <>
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-base font-bold text-slate-900">
                  {isNew ? 'Add New Location' : 'Location Details'}
                </h2>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Row 1: Name + Code */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label required>Location Name</Label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => set({ name: e.target.value })}
                      placeholder="e.g. Head Office - Chennai"
                      className={`${inp} ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-400' : ''}`}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div>
                    <Label>Location Code</Label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) => set({ code: e.target.value })}
                      placeholder="e.g. HO-CHN"
                      className={inp}
                    />
                  </div>
                </div>

                {/* Row 2: Address */}
                <div>
                  <Label required>Address</Label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => set({ address: e.target.value })}
                    placeholder="123, Mount Road, Guindy, Chennai, Tamil Nadu - 600032"
                    className={`${inp} ${errors.address ? 'border-red-400 focus:border-red-500 focus:ring-red-400' : ''}`}
                  />
                  {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                </div>

                {/* Row 3: Lat / Long / Radius */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <Label required>Latitude</Label>
                    <input
                      type="number"
                      step="0.0001"
                      value={form.latitude}
                      onChange={(e) => set({ latitude: e.target.value })}
                      placeholder="13.0827"
                      className={`${inp} ${errors.latitude ? 'border-red-400' : ''}`}
                    />
                    {errors.latitude && <p className="mt-1 text-xs text-red-500">{errors.latitude}</p>}
                  </div>
                  <div>
                    <Label required>Longitude</Label>
                    <input
                      type="number"
                      step="0.0001"
                      value={form.longitude}
                      onChange={(e) => set({ longitude: e.target.value })}
                      placeholder="80.2707"
                      className={`${inp} ${errors.longitude ? 'border-red-400' : ''}`}
                    />
                    {errors.longitude && <p className="mt-1 text-xs text-red-500">{errors.longitude}</p>}
                  </div>
                  <div>
                    <Label required>Radius (Meters)</Label>
                    <input
                      type="number"
                      min={10}
                      max={100000}
                      value={form.radiusMeters}
                      onChange={(e) => set({ radiusMeters: Number(e.target.value) || 200 })}
                      className={inp}
                    />
                  </div>
                </div>

                {/* Row 4: Timezone + Status */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Time Zone</Label>
                    <select
                      value={form.timezone}
                      onChange={(e) => set({ timezone: e.target.value })}
                      className={sel}
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>{TZ_LABELS[tz] || tz}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select
                      value={form.status}
                      onChange={(e) => set({ status: e.target.value })}
                      className={sel}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Row 5: Description */}
                <div>
                  <Label>Description</Label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => set({ description: e.target.value })}
                    placeholder="e.g. Head office main location"
                    className="w-full resize-none rounded-none border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  />
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
                <div>
                  {!isNew && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting || saving}
                      className="inline-flex items-center gap-1.5 rounded-none border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <RiDeleteBinLine className="h-3.5 w-3.5" />
                      {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={cancelForm}
                    disabled={saving || deleting}
                    className="rounded-none border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || deleting}
                    className="rounded-none bg-[#4F46E5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4338CA] transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {saving ? 'Saving…' : isNew ? 'Save Location' : 'Save Location'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
