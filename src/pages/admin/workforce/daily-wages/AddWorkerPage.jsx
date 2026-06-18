import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiArrowLeft, HiCheck, HiUser, HiBriefcase, HiMapPin, HiLockClosed,
  HiInformationCircle, HiXMark, HiSignal, HiShieldCheck,
  HiBuildingLibrary, HiExclamationTriangle,
} from 'react-icons/hi2'

const DEPARTMENTS = ['Production', 'Warehouse', 'Security', 'Maintenance', 'Logistics', 'Housekeeping', 'Operations', 'Facilities']
const JOB_ROLES = ['General Labourer', 'Floor Supervisor', 'Loader', 'Security Guard', 'Cleaning Operative', 'Driver', 'Packer', 'Warehouse Operative', 'Site Assistant', 'Technician', 'Helper', 'Other']
const EMPLOYMENT_TYPES = ['Daily Paid (PAYE)', 'Daily Paid (Agency)', 'Contractual', 'Zero Hours Contract']
const RELATIONSHIPS = ['Spouse / Partner', 'Parent', 'Sibling', 'Child', 'Friend', 'Other']

const LOCATION_OPTIONS = [
  { id: 'AREA-001', name: 'Pune Plant',       code: 'PP-01', siteType: 'Factory / Plant',    city: 'Pimpri-Chinchwad', radius: 200, status: 'Active' },
  { id: 'AREA-002', name: 'Chinchwad Site',   code: 'CS-02', siteType: 'Factory / Plant',    city: 'Chinchwad',        radius: 150, status: 'Active' },
  { id: 'AREA-003', name: 'Warehouse Area',   code: 'WA-03', siteType: 'Warehouse',          city: 'Bhosari',          radius: 150, status: 'Active' },
  { id: 'AREA-004', name: 'North Gate Zone',  code: 'NG-04', siteType: 'Security Post',      city: 'Pimpri-Chinchwad', radius: 50,  status: 'Active' },
  { id: 'AREA-005', name: 'South Yard',       code: 'SY-05', siteType: 'Distribution Centre',city: 'Pimpri-Chinchwad', radius: 300, status: 'Inactive' },
  { id: 'AREA-006', name: 'Admin Block',      code: 'AB-06', siteType: 'Office',             city: 'Pimpri-Chinchwad', radius: 75,  status: 'Active' },
]

const STEPS = [
  { label: 'Personal details' },
  { label: 'Employment details' },
  { label: 'Site assignment' },
  { label: 'Send credentials' },
]

const EMPTY_FORM = {
  firstName: '', middleName: '', lastName: '',
  dob: '', gender: '', nationality: '',
  aadhaarNumber: '', workPermitRef: '',
  email: '', mobile: '',
  addressLine1: '', addressLine2: '', city: '', district: '', pincode: '',
  role: '', department: '', employmentType: 'Daily Paid (PAYE)',
  dailyWage: '', typicalHoursPerDay: '8', joiningDate: '', expectedEndDate: '',
  panNumber: '', pfReferenceNo: '',
  accountHolderName: '', bankName: '', ifscCode: '', accountNumber: '',
  emergencyName: '', emergencyRelationship: '', emergencyPhone: '',
  areas: [],
  sendCredentialsEmail: true, sendCredentialsSMS: false, requirePasswordChange: true,
}

export default function AddWorkerPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)]
  const scrollTo = (i) => refs[i].current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const autoUsername = form.email
    ? form.email.split('@')[0] + '@workermail.co.in'
    : 'j.burrows@workermail.co.in'

  const toggleArea = (name) =>
    setField('areas', form.areas.includes(name) ? form.areas.filter(a => a !== name) : [...form.areas, name])

  const inp = 'h-10 w-full rounded-none border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]'
  const sel = 'h-10 w-full rounded-none border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] cursor-pointer'
  const lbl = 'mb-1.5 block text-xs font-medium text-slate-600'
  const secTitle = (icon, text) => (
    <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
      <span className="text-[#0F766E]">{icon}</span>
      <span className="text-[11px] font-black uppercase tracking-widest text-[#0F766E]">{text}</span>
    </div>
  )

  return (
    <div className="animate-in fade-in duration-300">
      {/* Back button */}
      <button type="button" onClick={() => navigate('/admin/daily-wages/workers/list')}
        className="mb-3 inline-flex items-center gap-1.5 rounded-none border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
        <HiArrowLeft className="h-3.5 w-3.5" />← Back to Workers
      </button>

      {/* Page title */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Register Daily Wages Worker</h1>
        <p className="mt-0.5 text-xs text-slate-500">Org Admin · Daily Wages · Register Worker</p>
      </div>

      {/* Info banner */}
      <div className="mb-5 flex items-start gap-3 rounded-none border border-blue-200 bg-blue-50 px-4 py-3">
        <HiInformationCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
        <p className="text-xs text-blue-800">
          This worker's attendance and payroll records will be stored separately and will <strong>not</strong> appear in the standard employee system.
          Login credentials will be sent to the worker's email address upon saving.
        </p>
      </div>

      {/* 4-step visual stepper */}
      <div className="mb-6 overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-stretch overflow-x-auto">
          {STEPS.map((s, i) => (
            <button key={i} type="button" onClick={() => scrollTo(i)}
              className={`flex shrink-0 items-center gap-2.5 border-b-2 px-6 py-3.5 transition-colors ${
                i === 0 ? 'border-[#0F766E]' : 'border-transparent hover:bg-slate-50'
              }`}>
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i === 0 ? 'bg-[#0F766E] text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {i === 0 ? <HiCheck className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`whitespace-nowrap text-sm font-medium ${i === 0 ? 'text-slate-900' : 'text-slate-500'}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <span className="ml-2 mr-1 h-px w-8 shrink-0 bg-slate-200" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── All form sections ──────────────────────────────────────────────── */}
      <div className="space-y-0 overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">

        {/* PERSONAL DETAILS */}
        <div ref={refs[0]} className="border-b border-slate-100 p-6">
          {secTitle(<HiUser className="h-3.5 w-3.5" />, 'Personal Details')}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={lbl}>First Name <span className="text-red-500">*</span></label>
              <input value={form.firstName} onChange={e => setField('firstName', e.target.value)} placeholder="e.g. James" className={inp} />
            </div>
            <div>
              <label className={lbl}>Middle Name</label>
              <input value={form.middleName} onChange={e => setField('middleName', e.target.value)} placeholder="Optional" className={inp} />
            </div>
            <div>
              <label className={lbl}>Surname <span className="text-red-500">*</span></label>
              <input value={form.lastName} onChange={e => setField('lastName', e.target.value)} placeholder="e.g. Sharma" className={inp} />
            </div>
            <div>
              <label className={lbl}>Date of Birth <span className="text-red-500">*</span></label>
              <input type="date" value={form.dob} onChange={e => setField('dob', e.target.value)} className={inp} />
            </div>
            <div>
              <label className={lbl}>Gender</label>
              <select value={form.gender} onChange={e => setField('gender', e.target.value)} className={sel}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Nationality</label>
              <input value={form.nationality} onChange={e => setField('nationality', e.target.value)} placeholder="e.g. Indian" className={inp} />
            </div>
            <div className="sm:col-span-2">
              <label className={lbl}>Aadhaar Number <span className="text-red-500">*</span></label>
              <input value={form.aadhaarNumber} onChange={e => setField('aadhaarNumber', e.target.value)} placeholder="XXXX XXXX XXXX" className={inp} />
              <p className="mt-1 text-[11px] text-slate-400">Required for UIDAI payroll reporting (e.g. 1234 5678 9012)</p>
            </div>
            <div>
              <label className={lbl}>Right to Work Reference</label>
              <input value={form.workPermitRef} onChange={e => setField('workPermitRef', e.target.value)} placeholder="Permit or document ref." className={inp} />
              <p className="mt-1 text-[11px] text-slate-400">Work authorization reference number</p>
            </div>
          </div>
        </div>

        {/* CONTACT INFORMATION */}
        <div className="border-b border-slate-100 p-6">
          {secTitle(<HiUser className="h-3.5 w-3.5" />, 'Contact Information')}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={lbl}>Email Address <span className="text-red-500">*</span></label>
              <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="j.burrows@example.com" className={inp} />
              <p className="mt-1 text-[11px] text-slate-400">Login credentials will be sent to this address</p>
            </div>
            <div>
              <label className={lbl}>Mobile Number <span className="text-red-500">*</span></label>
              <input type="tel" value={form.mobile} onChange={e => setField('mobile', e.target.value)} placeholder="+91 98765 43210" className={inp} />
            </div>
            <div>
              <label className={lbl}>Address Line 1</label>
              <input value={form.addressLine1} onChange={e => setField('addressLine1', e.target.value)} placeholder="House number and street name" className={inp} />
            </div>
            <div>
              <label className={lbl}>Address Line 2</label>
              <input value={form.addressLine2} onChange={e => setField('addressLine2', e.target.value)} placeholder="Flat, apartment, suite (optional)" className={inp} />
            </div>
            <div>
              <label className={lbl}>City / Town</label>
              <input value={form.city} onChange={e => setField('city', e.target.value)} placeholder="e.g. Pune" className={inp} />
            </div>
            <div>
              <label className={lbl}>District</label>
              <input value={form.district} onChange={e => setField('district', e.target.value)} placeholder="e.g. Pune District" className={inp} />
            </div>
            <div>
              <label className={lbl}>PIN Code</label>
              <input value={form.pincode} onChange={e => setField('pincode', e.target.value)} placeholder="e.g. 411001" className={inp} />
            </div>
          </div>
        </div>

        {/* EMPLOYMENT DETAILS */}
        <div ref={refs[1]} className="border-b border-slate-100 p-6">
          {secTitle(<HiBriefcase className="h-3.5 w-3.5" />, 'Employment Details')}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={lbl}>Job Role / Occupation <span className="text-red-500">*</span></label>
              <select value={form.role} onChange={e => setField('role', e.target.value)} className={sel}>
                <option value="">Select role</option>
                {JOB_ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Department</label>
              <select value={form.department} onChange={e => setField('department', e.target.value)} className={sel}>
                <option value="">Select</option>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Employment Type <span className="text-red-500">*</span></label>
              <select value={form.employmentType} onChange={e => setField('employmentType', e.target.value)} className={sel}>
                {EMPLOYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Daily Rate (₹) <span className="text-red-500">*</span></label>
              <input type="number" value={form.dailyWage} onChange={e => setField('dailyWage', e.target.value)} placeholder="0.00" className={inp} />
              <p className="mt-1 text-[11px] text-slate-400">Gross, before deductions (NMW min. ₹563/day)</p>
            </div>
            <div>
              <label className={lbl}>Typical Hours per Day</label>
              <input type="number" value={form.typicalHoursPerDay} onChange={e => setField('typicalHoursPerDay', e.target.value)} placeholder="8" min="1" max="12" className={inp} />
            </div>
            <div>
              <label className={lbl}>Start Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.joiningDate} onChange={e => setField('joiningDate', e.target.value)} className={inp} />
            </div>
            <div>
              <label className={lbl}>Expected End Date</label>
              <input type="date" value={form.expectedEndDate} onChange={e => setField('expectedEndDate', e.target.value)} className={inp} />
              <p className="mt-1 text-[11px] text-slate-400">Leave blank if open-ended</p>
            </div>
            <div>
              <label className={lbl}>PAN Number</label>
              <input value={form.panNumber} onChange={e => setField('panNumber', e.target.value)} placeholder="e.g. ABCDE1234F" className={inp} />
              <p className="mt-1 text-[11px] text-slate-400">Standard income tax identifier</p>
            </div>
            <div>
              <label className={lbl}>PF / ESIC Reference</label>
              <input value={form.pfReferenceNo} onChange={e => setField('pfReferenceNo', e.target.value)} placeholder="e.g. MH/PUN/001234" className={inp} />
            </div>
          </div>
        </div>

        {/* BANK DETAILS */}
        <div className="border-b border-slate-100 p-6">
          {secTitle(<HiBuildingLibrary className="h-3.5 w-3.5" />, 'Bank Details (for payment)')}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={lbl}>Account Holder Name</label>
              <input value={form.accountHolderName} onChange={e => setField('accountHolderName', e.target.value)} placeholder="Full legal name as on bank account" className={inp} />
            </div>
            <div>
              <label className={lbl}>Bank Name</label>
              <input value={form.bankName} onChange={e => setField('bankName', e.target.value)} placeholder="e.g. State Bank of India" className={inp} />
            </div>
            <div>
              <label className={lbl}>IFSC Code</label>
              <input value={form.ifscCode} onChange={e => setField('ifscCode', e.target.value)} placeholder="e.g. SBIN0001234" className={inp} />
            </div>
            <div>
              <label className={lbl}>Account Number</label>
              <input value={form.accountNumber} onChange={e => setField('accountNumber', e.target.value)} placeholder="Account number" className={inp} />
            </div>
          </div>
        </div>

        {/* EMERGENCY CONTACT */}
        <div className="border-b border-slate-100 p-6">
          {secTitle(<HiExclamationTriangle className="h-3.5 w-3.5" />, 'Emergency Contact')}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={lbl}>Contact Name</label>
              <input value={form.emergencyName} onChange={e => setField('emergencyName', e.target.value)} placeholder="Full name" className={inp} />
            </div>
            <div>
              <label className={lbl}>Relationship</label>
              <select value={form.emergencyRelationship} onChange={e => setField('emergencyRelationship', e.target.value)} className={sel}>
                <option value="">Select</option>
                {RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Phone Number</label>
              <input type="tel" value={form.emergencyPhone} onChange={e => setField('emergencyPhone', e.target.value)} placeholder="+91 98765 43210" className={inp} />
            </div>
          </div>
        </div>

        {/* SITE ASSIGNMENT */}
        <div ref={refs[2]} className="border-b border-slate-100 p-6">
          {secTitle(<HiMapPin className="h-3.5 w-3.5" />, 'Site Assignment')}
          <p className="mb-4 text-xs text-slate-500">Select one or more sites. Workers can only check in from assigned locations.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LOCATION_OPTIONS.map(loc => {
              const selected = form.areas.includes(loc.name)
              const inactive = loc.status === 'Inactive'
              return (
                <button key={loc.id} type="button"
                  onClick={() => !inactive && toggleArea(loc.name)}
                  className={`relative flex flex-col items-start rounded-none border p-4 text-left transition-all ${
                    selected   ? 'border-[#0F766E] bg-teal-50/60 ring-1 ring-[#0F766E]' :
                    inactive   ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-50' :
                    'border-slate-200 bg-white hover:border-[#0F766E]/50 hover:bg-teal-50/20'
                  }`}>
                  {selected && (
                    <div className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#0F766E]">
                      <HiCheck className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className="mb-2 flex items-center gap-2">
                    <HiMapPin className="h-4 w-4 text-[#0F766E]" />
                    <p className="text-sm font-bold text-slate-900 leading-tight">{loc.name}</p>
                  </div>
                  <p className="text-xs text-slate-500">{loc.siteType}</p>
                  <p className="text-[11px] text-slate-400">{loc.city}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <HiSignal className="h-3 w-3 text-slate-400" />
                    <span className="text-[11px] text-slate-500">{loc.radius}m radius</span>
                    {inactive && <span className="ml-auto text-[10px] font-bold uppercase text-red-400">Inactive</span>}
                  </div>
                </button>
              )
            })}
          </div>
          {form.areas.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {form.areas.map(a => (
                <span key={a} className="inline-flex items-center gap-1 rounded-none border border-teal-300 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">
                  {a}
                  <button type="button" onClick={() => toggleArea(a)} className="ml-0.5 text-teal-400 hover:text-red-500">
                    <HiXMark className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* WORKER PORTAL LOGIN CREDENTIALS */}
        <div ref={refs[3]} className="p-6">
          {secTitle(<HiLockClosed className="h-3.5 w-3.5" />, 'Worker Portal Login Credentials')}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={lbl}>Username (auto-populated from email)</label>
              <input value={autoUsername} disabled
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 outline-none cursor-not-allowed" />
            </div>
            <div>
              <label className={lbl}>Temporary Password (auto-generated)</label>
              <input value="Ws#2025IxQ" disabled
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50 px-3 font-mono text-sm text-slate-500 outline-none cursor-not-allowed" />
              <p className="mt-1 text-[11px] text-slate-400">Worker will be prompted to change this on first login</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { key: 'sendCredentialsEmail', label: "Send login credentials to worker's email address immediately after saving" },
              { key: 'sendCredentialsSMS',   label: "Also send a welcome SMS to worker's mobile number" },
              { key: 'requirePasswordChange', label: 'Require password change on first login' },
            ].map(opt => (
              <label key={opt.key} className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                <input type="checkbox" checked={!!form[opt.key]} onChange={e => setField(opt.key, e.target.checked)}
                  className="h-4 w-4 accent-[#0F766E]" />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <button type="button" onClick={() => navigate('/admin/daily-wages/workers/list')}
          className="rounded-none border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button type="button" onClick={() => navigate('/admin/daily-wages/workers/list')}
          className="rounded-none border border-[#0F766E] bg-white px-5 py-2 text-sm font-medium text-[#0F766E] hover:bg-teal-50">
          Save as Draft
        </button>
        <button type="button" onClick={() => navigate('/admin/daily-wages/workers/list')}
          className="inline-flex items-center gap-2 rounded-none bg-[#0F766E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64]">
          <HiShieldCheck className="h-4 w-4" />Save &amp; Send Credentials
        </button>
      </div>
    </div>
  )
}
