import { useCallback, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { employeeProfileEvents, employees } from '../../../data/mockData.js'
import { useAuth } from '../../../context/AuthContext.jsx'
import { 
  HiUser, HiIdentification, HiBriefcase, HiDocumentText, HiCreditCard, 
  HiClock, HiCalendar, HiChartBar, HiArchiveBox, HiEllipsisVertical,
  HiCheckCircle, HiExclamationCircle, HiNoSymbol, HiArrowUpCircle
} from 'react-icons/hi2'

const TABS = [
  { id: 'overview', label: 'Overview', icon: HiUser },
  { id: 'personal', label: 'Personal Information', icon: HiIdentification },
  { id: 'job', label: 'Job & Organization', icon: HiBriefcase },
  { id: 'documents', label: 'Documents', icon: HiDocumentText },
  { id: 'visa', label: 'Visa & Nationality', icon: HiCreditCard },
  { id: 'attendance', label: 'Attendance & Timesheet', icon: HiClock },
  { id: 'leave', label: 'Leave', icon: HiCalendar },
  { id: 'performance', label: 'Performance', icon: HiChartBar },
  { id: 'assets', label: 'Assets', icon: HiArchiveBox },
]

export default function EmployeeProfile() {
  const { user: currentUser } = useAuth()
  const [selectedId, setSelectedId] = useState(employees[0]?.id ?? '')
  const [activeTab, setActiveTab] = useState('overview')
  const [modalOpen, setModalOpen] = useState(false)

  const selected = employees.find((e) => e.id === selectedId) ?? employees[0]
  const isHrAdmin = currentUser?.role === 'hr_admin'

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
                      {selected.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-text-primary">{selected.name}</h2>
                      <p className="text-sm text-text-secondary">{selected.jobTitle} • {selected.empId}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge label={selected.status} color="green" />
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-success-DEFAULT">
                          <HiCheckCircle className="h-3 w-3" /> In Office
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Department</p>
                    <p className="mt-1 font-medium text-text-primary">{selected.department}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Manager</p>
                    <p className="mt-1 font-medium text-text-primary">{selected.manager}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Join Date</p>
                    <p className="mt-1 font-medium text-text-primary">Jan 15, 2024</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Tenure</p>
                    <p className="mt-1 font-medium text-text-primary">1 Year, 4 Months</p>
                  </div>
                </div>

                {isHrAdmin && (
                  <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-border-tertiary">
                    <Button label="Promote" variant="outline" size="sm" icon={HiArrowUpCircle} className="text-primary border-primary hover:bg-primary/5" />
                    <Button label="Suspend" variant="outline" size="sm" icon={HiExclamationCircle} className="text-warning-DEFAULT border-warning-DEFAULT hover:bg-warning-DEFAULT/5" />
                    <Button label="Disable" variant="outline" size="sm" icon={HiNoSymbol} className="text-danger-DEFAULT border-danger-DEFAULT hover:bg-danger-DEFAULT/5" />
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-tertiary mb-4">Career Timeline</h3>
                <div className="space-y-4">
                  {[
                    { date: 'Jan 15, 2024', event: 'Joined as Senior Software Engineer', icon: HiCheckCircle, color: 'text-success-DEFAULT' },
                    { date: 'July 10, 2024', event: 'Completed Probation', icon: HiCheckCircle, color: 'text-success-DEFAULT' },
                    { date: 'Dec 20, 2024', event: 'Awarded Employee of the Month', icon: HiCheckCircle, color: 'text-success-DEFAULT' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="relative flex flex-col items-center">
                        <item.icon className={`h-5 w-5 ${item.color} z-10 bg-background-primary`} />
                        {i < 2 && <div className="absolute top-5 h-full w-0.5 bg-border-tertiary" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary">{item.event}</p>
                        <p className="text-[10px] text-text-tertiary">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border-tertiary bg-background-primary shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border-tertiary bg-background-secondary/30 flex items-center justify-between">
                <h3 className="font-bold text-text-primary">Recent HR Events</h3>
                <Button label="View All" variant="ghost" size="sm" />
              </div>
              <Table 
                columns={[
                  { key: 'date', label: 'Date' },
                  { key: 'event', label: 'Event' },
                  { key: 'owner', label: 'Owner' },
                ]} 
                data={employeeProfileEvents} 
                pageSize={3} 
              />
            </div>
          </div>
        )
      case 'personal':
        return (
          <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text-primary">Personal Information</h2>
              {isHrAdmin && <Button label="Edit" variant="outline" size="sm" />}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Date of Birth</p>
                  <p className="mt-1 font-medium text-text-primary">May 12, 1992</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Gender</p>
                  <p className="mt-1 font-medium text-text-primary">Male</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Personal Email</p>
                  <p className="mt-1 font-medium text-text-primary">john.doe.personal@gmail.com</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Phone Number</p>
                  <p className="mt-1 font-medium text-text-primary">{selected.phone}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Marital Status</p>
                  <p className="mt-1 font-medium text-text-primary">Married</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Dependents</p>
                  <p className="mt-1 font-medium text-text-primary">2 (Spouse, Child)</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Emergency Contact</p>
                  <p className="mt-1 font-medium text-text-primary">Jane Doe (Spouse) • +971 50 123 4567</p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'job':
        return (
          <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-lg font-bold text-text-primary mb-6">Job & Organization</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Job Title</p>
                  <p className="mt-1 font-medium text-text-primary">{selected.jobTitle}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Department</p>
                  <p className="mt-1 font-medium text-text-primary">{selected.department}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Work Location</p>
                  <p className="mt-1 font-medium text-text-primary">{selected.location}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Reporting Manager</p>
                  <p className="mt-1 font-medium text-text-primary">{selected.manager}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Employment Type</p>
                  <p className="mt-1 font-medium text-text-primary">Full-time Regular</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Grade/Level</p>
                  <p className="mt-1 font-medium text-text-primary">L5 - Senior</p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'documents':
        return (
          <div className="rounded-xl border border-border-tertiary bg-background-primary shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-4 border-b border-border-tertiary bg-background-secondary/30 flex items-center justify-between">
              <h3 className="font-bold text-text-primary">Document Checklist</h3>
              <Button label="Upload New" variant="primary" size="sm" icon={HiArrowUpCircle} />
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-background-secondary border-b border-border-tertiary">
                <tr>
                  <th className="px-6 py-4 font-semibold text-text-primary">Document Name</th>
                  <th className="px-6 py-4 font-semibold text-text-primary">Status</th>
                  <th className="px-6 py-4 font-semibold text-text-primary">HR Comment</th>
                  <th className="px-6 py-4 font-semibold text-text-primary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-tertiary">
                {[
                  { name: 'Passport', status: 'Submitted', comment: 'Verified' },
                  { name: 'National ID', status: 'Submitted', comment: 'Verified' },
                  { name: 'Education Cert', status: 'Pending', comment: '-' },
                  { name: 'Contract', status: 'Submitted', comment: 'Awaiting signature' },
                  { name: 'Offer Letter', status: 'Submitted', comment: 'Verified' },
                  { name: 'Experience Letter', status: 'Rejected', comment: 'Scan unclear' },
                ].map((doc, i) => (
                  <tr key={i} className="hover:bg-background-tertiary/50">
                    <td className="px-6 py-4 font-medium text-text-primary">{doc.name}</td>
                    <td className="px-6 py-4">
                      <Badge 
                        label={doc.status} 
                        color={doc.status === 'Submitted' ? 'green' : doc.status === 'Rejected' ? 'red' : 'orange'} 
                      />
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{doc.comment}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button label="Upload" variant="ghost" size="sm" />
                        <Button label="History" variant="ghost" size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'visa':
        return (
          <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text-primary">Visa & Nationality</h2>
              <Badge label="Valid" color="green" />
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Nationality</p>
                  <p className="mt-1 font-medium text-text-primary">{selected.nationality}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Passport Number</p>
                  <p className="mt-1 font-medium text-text-primary">P12345678</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Issue Date</p>
                    <p className="mt-1 font-medium text-text-primary">Jan 01, 2020</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Expiry Date</p>
                    <p className="mt-1 font-medium text-text-primary text-danger-DEFAULT font-bold">Jan 01, 2030</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Visa Type</p>
                  <p className="mt-1 font-medium text-text-primary">Employment Visa</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Visa Number</p>
                  <p className="mt-1 font-medium text-text-primary">V987654321</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Issue Date</p>
                    <p className="mt-1 font-medium text-text-primary">Jan 01, 2024</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Expiry Date</p>
                    <p className="mt-1 font-medium text-text-primary text-warning-DEFAULT font-bold">Jan 01, 2026</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-border-tertiary">
              <h3 className="text-sm font-bold text-text-primary mb-4">Visa Documents</h3>
              <div className="flex gap-4">
                <div className="flex-1 rounded-lg border border-border-tertiary p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HiDocumentText className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-sm font-bold text-text-primary">Passport Copy</p>
                      <p className="text-[10px] text-text-tertiary">PDF • 2.4 MB</p>
                    </div>
                  </div>
                  <Button label="View" variant="ghost" size="sm" />
                </div>
                <div className="flex-1 rounded-lg border border-border-tertiary p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HiDocumentText className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-sm font-bold text-text-primary">Visa Copy</p>
                      <p className="text-[10px] text-text-tertiary">JPG • 1.1 MB</p>
                    </div>
                  </div>
                  <Button label="View" variant="ghost" size="sm" />
                </div>
              </div>
            </div>
          </div>
        )
      case 'attendance':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text-primary">Attendance Summary - May 2026</h2>
                <div className="flex gap-2">
                  <Button label="Regularize" variant="outline" size="sm" />
                  <Button label="Export" variant="ghost" size="sm" />
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                  <div key={d} className="text-xs font-bold text-text-tertiary py-2">{d}</div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-10 flex items-center justify-center rounded-lg text-sm border border-transparent ${
                      i+1 === 1 ? 'bg-success-DEFAULT text-white font-bold' : 
                      i+1 === 2 ? 'bg-warning-DEFAULT text-white font-bold' :
                      i+1 === 3 ? 'bg-danger-DEFAULT text-white font-bold' :
                      'bg-background-tertiary text-text-secondary'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border-tertiary bg-background-primary shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-background-secondary border-b border-border-tertiary">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-text-primary">Date</th>
                    <th className="px-6 py-4 font-semibold text-text-primary">Clock In</th>
                    <th className="px-6 py-4 font-semibold text-text-primary">Clock Out</th>
                    <th className="px-6 py-4 font-semibold text-text-primary">Total Hours</th>
                    <th className="px-6 py-4 font-semibold text-text-primary">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-tertiary">
                  {[
                    { date: 'May 01, 2026', in: '09:00 AM', out: '06:00 PM', hours: '9h', status: 'Present' },
                    { date: 'May 02, 2026', in: '09:15 AM', out: '06:00 PM', hours: '8h 45m', status: 'Late' },
                    { date: 'May 03, 2026', in: '-', out: '-', hours: '-', status: 'Absent' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-background-tertiary/50">
                      <td className="px-6 py-4 font-medium text-text-primary">{row.date}</td>
                      <td className="px-6 py-4 text-text-secondary">{row.in}</td>
                      <td className="px-6 py-4 text-text-secondary">{row.out}</td>
                      <td className="px-6 py-4 text-text-secondary">{row.hours}</td>
                      <td className="px-6 py-4">
                        <Badge 
                          label={row.status} 
                          color={row.status === 'Present' ? 'green' : row.status === 'Late' ? 'orange' : 'red'} 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      case 'leave':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { type: 'Annual Leave', balance: 22, color: 'blue' },
                { type: 'Sick Leave', balance: 12, color: 'green' },
                { type: 'Casual Leave', balance: 5, color: 'orange' },
                { type: 'Unpaid Leave', balance: 0, color: 'red' },
              ].map((b, i) => (
                <div key={i} className="rounded-xl border border-border-tertiary bg-background-primary p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">{b.type}</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">{b.balance} <span className="text-sm font-medium text-text-tertiary">Days</span></p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-border-tertiary bg-background-primary shadow-sm overflow-hidden">
               <div className="p-4 border-b border-border-tertiary bg-background-secondary/30 flex items-center justify-between">
                <h3 className="font-bold text-text-primary">Leave History</h3>
                <Button label="Apply Leave" variant="primary" size="sm" icon={HiCalendar} />
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-background-secondary border-b border-border-tertiary">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-text-primary">Type</th>
                    <th className="px-6 py-4 font-semibold text-text-primary">Date Range</th>
                    <th className="px-6 py-4 font-semibold text-text-primary">Days</th>
                    <th className="px-6 py-4 font-semibold text-text-primary">Status</th>
                    <th className="px-6 py-4 font-semibold text-text-primary text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-tertiary">
                  {[
                    { type: 'Annual Leave', range: 'Apr 14 - Apr 18', days: 5, status: 'Approved' },
                    { type: 'Sick Leave', range: 'Mar 10 - Mar 11', days: 2, status: 'Approved' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-background-tertiary/50">
                      <td className="px-6 py-4 font-medium text-text-primary">{row.type}</td>
                      <td className="px-6 py-4 text-text-secondary">{row.range}</td>
                      <td className="px-6 py-4 text-text-secondary">{row.days}</td>
                      <td className="px-6 py-4">
                        <Badge label={row.status} color="green" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button label="View" variant="ghost" size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      case 'performance':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
              <h2 className="text-lg font-bold text-text-primary mb-6">Performance Reviews</h2>
              <div className="grid gap-6 md:grid-cols-3">
                 <div className="p-4 rounded-lg bg-success-DEFAULT/5 border border-success-DEFAULT/20 text-center">
                    <p className="text-xs font-bold uppercase text-text-tertiary">Latest Rating</p>
                    <p className="text-3xl font-bold text-success-DEFAULT mt-1">4.5 / 5</p>
                    <p className="text-[10px] text-text-tertiary mt-1">Cycle: 2025 Annual</p>
                 </div>
                 <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
                    <p className="text-xs font-bold uppercase text-text-tertiary">Goals Completed</p>
                    <p className="text-3xl font-bold text-primary mt-1">12 / 15</p>
                    <p className="text-[10px] text-text-tertiary mt-1">Current Cycle</p>
                 </div>
                 <div className="p-4 rounded-lg bg-orange-DEFAULT/5 border border-orange-DEFAULT/20 text-center">
                    <p className="text-xs font-bold uppercase text-text-tertiary">Next Review</p>
                    <p className="text-lg font-bold text-orange-DEFAULT mt-3">Jun 30, 2026</p>
                    <p className="text-[10px] text-text-tertiary mt-1">Manager Review</p>
                 </div>
              </div>
            </div>
            <div className="rounded-xl border border-border-tertiary bg-background-primary shadow-sm overflow-hidden">
               <div className="p-4 border-b border-border-tertiary bg-background-secondary/30">
                <h3 className="font-bold text-text-primary">Historical Reviews</h3>
              </div>
              <Table 
                columns={[
                  { key: 'cycle', label: 'Cycle' },
                  { key: 'rating', label: 'Rating' },
                  { key: 'reviewer', label: 'Reviewer' },
                  { key: 'status', label: 'Status' },
                ]} 
                data={[
                  { cycle: '2025 Annual', rating: '4.5', reviewer: 'Michael Chen', status: 'Completed' },
                  { cycle: '2025 Mid-Year', rating: '4.2', reviewer: 'Michael Chen', status: 'Completed' },
                ]} 
                pageSize={5} 
              />
            </div>
          </div>
        )
      case 'assets':
        return (
          <div className="rounded-xl border border-border-tertiary bg-background-primary shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="p-4 border-b border-border-tertiary bg-background-secondary/30 flex items-center justify-between">
                <h3 className="font-bold text-text-primary">Assigned Assets</h3>
                {isHrAdmin && <Button label="Assign Asset" variant="primary" size="sm" icon={HiPlus} />}
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-background-secondary border-b border-border-tertiary">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-text-primary">Asset ID</th>
                    <th className="px-6 py-4 font-semibold text-text-primary">Type</th>
                    <th className="px-6 py-4 font-semibold text-text-primary">Serial No</th>
                    <th className="px-6 py-4 font-semibold text-text-primary">Condition</th>
                    <th className="px-6 py-4 font-semibold text-text-primary">Issue Date</th>
                    <th className="px-6 py-4 font-semibold text-text-primary">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-tertiary">
                  {[
                    { id: 'AST-001', type: 'Laptop', serial: 'SN123456', condition: 'Good', date: 'Jan 15, 2024', status: 'Issued' },
                    { id: 'AST-002', type: 'Monitor', serial: 'SN789012', condition: 'New', date: 'Jan 15, 2024', status: 'Issued' },
                    { id: 'AST-003', type: 'Access Card', serial: 'AC998877', condition: 'Good', date: 'Jan 15, 2024', status: 'Issued' },
                  ].map((asset) => (
                    <tr key={asset.id} className="hover:bg-background-tertiary/50">
                      <td className="px-6 py-4 font-medium text-text-primary">{asset.id}</td>
                      <td className="px-6 py-4 text-text-secondary">{asset.type}</td>
                      <td className="px-6 py-4 text-text-secondary">{asset.serial}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-success-DEFAULT/10 px-2 py-1 text-[10px] font-bold text-success-DEFAULT uppercase">
                          {asset.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{asset.date}</td>
                      <td className="px-6 py-4 text-text-secondary">{asset.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Employee Profile</h1>
          <p className="text-sm text-text-secondary">View and manage detailed employee records</p>
        </div>
        <div className="w-full max-w-xs">
          <Input
            name="emp"
            type="select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            options={employees.map((e) => ({ value: e.id, label: `${e.name} (${e.empId})` }))}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left Sidebar Tabs */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="rounded-xl border border-border-tertiary bg-background-primary p-2 shadow-sm">
            <nav className="flex flex-row gap-1 lg:flex-col overflow-x-auto lg:overflow-x-visible no-scrollbar">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all whitespace-nowrap lg:whitespace-normal ${
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : 'text-text-tertiary'}`} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}
