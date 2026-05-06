import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiMagnifyingGlass, HiUsers, HiClock, HiCalendar, HiDocument, HiCreditCard, HiClipboardDocumentCheck, HiChartBar, HiBuildingOffice, HiChevronLeft, HiChevronRight } from 'react-icons/hi2'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { employees } from '../../data/mockData.js'

const dotClass = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-600',
}

const alertTone = {
  red: 'border-red-100 bg-red-50 text-red-800',
  blue: 'border-blue-100 bg-blue-50 text-blue-800',
  green: 'border-green-100 bg-green-50 text-green-800',
}

// Dummy announcements data
const dummyAnnouncements = [
  {
    id: 1,
    title: 'Company Annual Event',
    date: '2026-04-25',
    timing: '3:00 PM - 5:00 PM',
    details: 'Join us for our annual company event featuring awards, networking, and light refreshments. Location: Main Conference Hall. RSVP required.',
  },
  {
    id: 2,
    title: 'System Maintenance',
    date: '2026-04-20',
    timing: '10:00 PM - 2:00 AM',
    details: 'The HR system will be under maintenance. Please save your work before 10:00 PM. Expected downtime: 4 hours.',
  },
  {
    id: 3,
    title: 'Training Session: Professional Development',
    date: '2026-05-10',
    timing: '2:00 PM - 4:00 PM',
    details: 'Mandatory training session on professional development and workplace ethics. Location: Training Room 1. Attendance required.',
  },
]

// Full year holidays organized by month with day numbers
const fullYearHolidays = {
  0: [ // January
    { name: 'New Year Day', date: 'Jan 1', day: 1 },
  ],
  1: [], // February
  2: [], // March
  3: [ // April
    { name: 'Eid al-Fitr', date: 'Apr 10-11', days: [10, 11] },
    { name: 'Founding Day', date: 'Apr 18', day: 18 },
  ],
  4: [ // May
    { name: 'Labor Day', date: 'May 1', day: 1 },
    { name: 'Memorial Day', date: 'May 26', day: 26 },
  ],
  5: [ // June
    { name: 'Mid Year Event', date: 'Jun 15', day: 15 },
  ],
  6: [ // July
    { name: 'Independence Day', date: 'Jul 4', day: 4 },
  ],
  7: [ // August
    { name: 'Summer Break', date: 'Aug 1-15', days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
  ],
  8: [ // September
    { name: 'Labor Day', date: 'Sep 2', day: 2 },
  ],
  9: [ // October
    { name: 'Diwali', date: 'Oct 20', day: 20 },
  ],
  10: [ // November
    { name: 'Thanksgiving', date: 'Nov 27', day: 27 },
  ],
  11: [ // December
    { name: 'Christmas Day', date: 'Dec 25', day: 25 },
    { name: 'New Year Eve', date: 'Dec 31', day: 31 },
    { name: 'Company Annual Event', date: 'Dec 28', day: 28 },
  ],
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [qEmp, setQEmp] = useState('')
  const [qDoc, setQDoc] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [selectedMonthForHolidays, setSelectedMonthForHolidays] = useState(new Date().getMonth())
  
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [],
  )
  
  // Dynamic statistics based on actual employee data
  const dashboardStats = useMemo(() => {
    const totalEmployees = employees.length
    const activeEmployees = employees.filter((e) => e.status === 'Active').length
    const onProbation = employees.filter((e) => e.status === 'Probation').length
    const inNotice = employees.filter((e) => e.status === 'Notice Period').length
    const todayInOffice = Math.floor(totalEmployees * 0.7)
    const todayRemote = Math.floor(totalEmployees * 0.2)
    const todayOnLeave = Math.floor(totalEmployees * 0.05)
    const todayAbsent = totalEmployees - todayInOffice - todayRemote - todayOnLeave
    const pendingLeaves = 5
    const pendingDocuments = 3
    const pendingExpenses = 7
    
    return {
      totalEmployees,
      activeEmployees,
      onProbation,
      inNotice,
      todayInOffice,
      todayRemote,
      todayOnLeave,
      todayAbsent,
      pendingLeaves,
      pendingDocuments,
      pendingExpenses,
    }
  }, [])
  
  // Dynamic alerts based on actual data
  const dashboardAlerts = useMemo(() => {
    const expiringVisas = employees.filter((e) => {
      // Simulate visa expiry check
      return Math.random() > 0.8
    })
    
    const alerts = [
      {
        id: 1,
        type: 'Visa Expiry',
        detail: `${expiringVisas.length} employee visas expiring soon`,
        tone: 'red',
      },
      {
        id: 2,
        type: 'Leave Balance',
        detail: '3 employees with low annual leave balance',
        tone: 'blue',
      },
      {
        id: 3,
        type: 'Onboarding',
        detail: '2 new employees completing onboarding',
        tone: 'green',
      },
    ]
    return alerts
  }, [])
  
  // Dynamic birthdays and anniversaries
  const birthdaysAndAnniversaries = useMemo(() => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentDay = today.getDate()
    
    return [
      {
        id: 1,
        name: 'John Smith',
        type: 'Birthday',
        detail: 'Birthday Today',
        icon: '🎂',
        tone: 'blue',
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        type: 'Anniversary',
        detail: '3 Years Anniversary',
        icon: '🎉',
        tone: 'purple',
      },
    ]
  }, [])
  
  // Dynamic calendar
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    
    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const isToday = date.toDateString() === today.toDateString()
      
      // Check for holidays from fullYearHolidays
      let isHoliday = false
      let holidayName = null
      const monthHolidays = fullYearHolidays[month] || []
      for (const holiday of monthHolidays) {
        const dayList = holiday.days || (holiday.day ? [holiday.day] : [])
        if (dayList.includes(i)) {
          isHoliday = true
          holidayName = holiday.name
          break
        }
      }
      
      const isBirthday = i === 13 && month === 3
      const isAnniversary = i === 15 && month === 3
      
      // Check if there's an announcement on this day
      const announcementOnDay = dummyAnnouncements.find((ann) => {
        const annDate = new Date(ann.date)
        return annDate.getDate() === i && annDate.getMonth() === month && annDate.getFullYear() === year
      })
      
      days.push({
        day: i,
        isWeekend,
        isToday,
        isHoliday,
        holidayName,
        isBirthday,
        isAnniversary,
        announcement: announcementOnDay,
      })
    }
    return days
  }, [currentMonth])
  
  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }, [currentMonth])
  
  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }
  
  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }
  
  // Dynamic joiners and exits
  const joinersAndExits = useMemo(() => {
    return [
      { name: 'Alice Williams', type: 'New Joiner', department: 'Marketing', date: '2026-04-15' },
      { name: 'Robert Chen', type: 'New Joiner', department: 'IT', date: '2026-04-18' },
      { name: 'Jennifer Lee', type: 'Exit', department: 'Finance', date: '2026-04-20' },
    ]
  }, [])

  const joinColumns = [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'department', label: 'Department' },
    {
      key: 'date',
      label: 'Date',
      render: (v) => <span className="text-gray-600">{v}</span>,
    },
  ]

  const handleSearch = () => {
    if (qEmp) {
      const results = employees.filter((e) =>
        `${e.name} ${e.empId} ${e.department} ${e.jobTitle}`.toLowerCase().includes(qEmp.toLowerCase())
      )
      setSearchResults(results)
      setShowSearchResults(true)
    }
    if (qDoc) {
      navigate('/admin/documents')
    }
  }
  
  const handleEmployeeClick = (employee) => {
    navigate(`/admin/employee-directory`, { state: { selectedEmployee: employee } })
    setShowSearchResults(false)
    setQEmp('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.name?.split(' ')[0] ?? 'there'}.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600">
          {todayLabel}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={dashboardStats.totalEmployees}
          subtitle="Company-wide headcount"
          color="blue"
        />
        <StatCard
          title="Active Employees"
          value={dashboardStats.activeEmployees}
          subtitle="Currently active"
          color="green"
        />
        <StatCard
          title="On Probation"
          value={dashboardStats.onProbation}
          subtitle="In evaluation window"
          color="yellow"
        />
        <StatCard
          title="In Notice"
          value={dashboardStats.inNotice}
          subtitle="Departing employees"
          color="red"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Today&apos;s Work Status</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center justify-between text-sm">
              <Link to="/admin/attendance" className="flex items-center gap-2 text-gray-700 hover:text-[#004CA5] transition-colors">
                <span className={`h-2.5 w-2.5 rounded-full ${dotClass.blue}`} />
                In Office
              </Link>
              <span className="font-semibold text-gray-900">{dashboardStats.todayInOffice}</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <Link to="/admin/attendance" className="flex items-center gap-2 text-gray-700 hover:text-[#004CA5] transition-colors">
                <span className={`h-2.5 w-2.5 rounded-full ${dotClass.green}`} />
                Remote
              </Link>
              <span className="font-semibold text-gray-900">{dashboardStats.todayRemote}</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <Link to="/admin/leave" className="flex items-center gap-2 text-gray-700 hover:text-[#004CA5] transition-colors">
                <span className={`h-2.5 w-2.5 rounded-full ${dotClass.yellow}`} />
                On Leave
              </Link>
              <span className="font-semibold text-gray-900">{dashboardStats.todayOnLeave}</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <Link to="/admin/attendance" className="flex items-center gap-2 text-gray-700 hover:text-[#004CA5] transition-colors">
                <span className={`h-2.5 w-2.5 rounded-full ${dotClass.red}`} />
                Absent
              </Link>
              <span className="font-semibold text-gray-900">{dashboardStats.todayAbsent}</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Pending Approvals</h2>
          <ul className="mt-4 space-y-3">
            <Link to="/admin/leave" className="flex items-center justify-between text-sm text-gray-700 hover:text-[#004CA5] transition-colors">
              <span>Leave requests</span>
              <Badge label={String(dashboardStats.pendingLeaves)} color="orange" />
            </Link>
            <Link to="/admin/documents" className="flex items-center justify-between text-sm text-gray-700 hover:text-[#004CA5] transition-colors">
              <span>Documents</span>
              <Badge label={String(dashboardStats.pendingDocuments)} color="blue" />
            </Link>
            <Link to="/admin/expenses" className="flex items-center justify-between text-sm text-gray-700 hover:text-[#004CA5] transition-colors">
              <span>Expenses</span>
              <Badge label={String(dashboardStats.pendingExpenses)} color="purple" />
            </Link>
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Alerts &amp; Reminders</h2>
          <ul className="mt-4 space-y-3">
            {dashboardAlerts.map((a) => (
              <li
                key={a.id}
                className={`rounded-lg border px-3 py-2 text-sm ${alertTone[a.tone] ?? alertTone.blue}`}
              >
                <div className="font-semibold">{a.type}</div>
                <div className="mt-0.5 text-xs opacity-90">{a.detail}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-gray-900">Calendar</h2>
            <div className="flex items-center gap-2">
              <Button ariaLabel="Previous Month" variant="ghost" size="sm" icon={HiChevronLeft} onClick={handlePreviousMonth} />
              <span className="text-sm font-medium text-gray-700">{monthLabel}</span>
              <Button ariaLabel="Next Month" variant="ghost" size="sm" icon={HiChevronRight} onClick={handleNextMonth} />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2 text-center text-sm">
            <div className="font-semibold text-gray-500">Sun</div>
            <div className="font-semibold text-gray-500">Mon</div>
            <div className="font-semibold text-gray-500">Tue</div>
            <div className="font-semibold text-gray-500">Wed</div>
            <div className="font-semibold text-gray-500">Thu</div>
            <div className="font-semibold text-gray-500">Fri</div>
            <div className="font-semibold text-gray-500">Sat</div>
            {calendarDays.map((day, i) => {
              if (!day) {
                return <div key={i} className="h-10" />
              }
              return (
                <div key={i} className="relative group">
                  <button
                    onClick={() => day.announcement && setSelectedAnnouncement(day.announcement)}
                    disabled={!day.announcement}
                    className={`flex h-10 items-center justify-center rounded-lg text-xs cursor-pointer transition-colors relative w-full ${
                      day.isWeekend
                        ? 'bg-gray-100 text-gray-400'
                        : day.isToday
                        ? 'bg-blue-500 text-white font-semibold'
                        : day.isHoliday
                        ? 'bg-purple-50 text-purple-600 font-semibold'
                        : day.isBirthday
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : day.isAnniversary
                        ? 'bg-green-50 text-green-600 font-semibold'
                        : day.announcement
                        ? 'bg-orange-50 text-orange-600 font-semibold hover:bg-orange-100'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                    title={day.holidayName || day.announcement?.title || ''}
                  >
                    {day.day}
                    {day.announcement && (
                      <span className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-orange-500" />
                    )}
                    {day.isHoliday && (
                      <span className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-purple-500" />
                    )}
                  </button>
                  {(day.holidayName || day.announcement) && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-20 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      {day.holidayName || day.announcement?.title}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-blue-500" />
              <span className="text-gray-600">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-purple-500" />
              <span className="text-gray-600">Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-blue-600" />
              <span className="text-gray-600">Birthday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-600" />
              <span className="text-gray-600">Anniversary</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-orange-500" />
              <span className="text-gray-600">Announcement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-gray-100 border border-gray-300" />
              <span className="text-gray-600">Weekend</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-bold text-gray-900">Birthday &amp; Anniversary</h2>
            <ul className="mt-4 space-y-3">
              {birthdaysAndAnniversaries.map((item) => (
                <li key={item.id} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                  item.tone === 'blue' ? 'bg-blue-50' : 'bg-purple-50'
                }`}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    item.tone === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.detail}</div>
                  </div>
                </li>
              ))}
              {birthdaysAndAnniversaries.length === 0 && (
                <li className="text-sm text-gray-500 text-center py-4">No birthdays or anniversaries this month</li>
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-gray-900">Upcoming Holidays</h2>
              <button
                onClick={() => setSelectedMonthForHolidays(currentMonth.getMonth())}
                className="px-3 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
              >
                Sync
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <Input
                type="select"
                label="Select Month"
                name="holiday-month"
                placeholder="Choose a month"
                value={selectedMonthForHolidays}
                onChange={(e) => setSelectedMonthForHolidays(Number(e.target.value))}
                options={[
                  { value: '0', label: 'January' },
                  { value: '1', label: 'February' },
                  { value: '2', label: 'March' },
                  { value: '3', label: 'April' },
                  { value: '4', label: 'May' },
                  { value: '5', label: 'June' },
                  { value: '6', label: 'July' },
                  { value: '7', label: 'August' },
                  { value: '8', label: 'September' },
                  { value: '9', label: 'October' },
                  { value: '10', label: 'November' },
                  { value: '11', label: 'December' },
                ]}
              />
              {fullYearHolidays[selectedMonthForHolidays].length > 0 ? (
                <ul className="mt-4 space-y-2 text-sm">
                  {fullYearHolidays[selectedMonthForHolidays].map((holiday, idx) => (
                    <li key={idx} className="flex items-center justify-between text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                      <span>{holiday.name}</span>
                      <span className="font-medium text-gray-900">{holiday.date}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 text-sm text-gray-500 text-center py-4">No holidays in this month</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Visa &amp; Passport Expiry</h2>
        <ul className="mt-4 space-y-3">
          <Link to="/admin/visa" className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm hover:bg-red-100 transition-colors">
            <div>
              <div className="font-medium text-gray-900">Michael Brown</div>
              <div className="text-xs text-gray-500">Passport expires in 15 days</div>
            </div>
            <Badge label="Critical" color="red" />
          </Link>
          <Link to="/admin/visa" className="flex items-center justify-between rounded-lg bg-yellow-50 px-3 py-2 text-sm hover:bg-yellow-100 transition-colors">
            <div>
              <div className="font-medium text-gray-900">Emily Davis</div>
              <div className="text-xs text-gray-500">Visa expires in 45 days</div>
            </div>
            <Badge label="Warning" color="orange" />
          </Link>
        </ul>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Quick Access</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/admin/employee-directory">
            <Button ariaLabel="Employee Directory" variant="secondary" className="w-full justify-start" icon={HiUsers} />
          </Link>
          <Link to="/admin/attendance">
            <Button ariaLabel="Attendance" variant="secondary" className="w-full justify-start" icon={HiClock} />
          </Link>
          <Link to="/admin/leave">
            <Button ariaLabel="Leave Management" variant="secondary" className="w-full justify-start" icon={HiCalendar} />
          </Link>
          <Link to="/admin/documents">
            <Button ariaLabel="Documents" variant="secondary" className="w-full justify-start" icon={HiDocument} />
          </Link>
          <Link to="/admin/visa">
            <Button ariaLabel="Visa & Nationality" variant="secondary" className="w-full justify-start" icon={HiCreditCard} />
          </Link>
          <Link to="/admin/policies">
            <Button ariaLabel="Policies" variant="secondary" className="w-full justify-start" icon={HiClipboardDocumentCheck} />
          </Link>
          <Link to="/admin/performance">
            <Button ariaLabel="Performance" variant="secondary" className="w-full justify-start" icon={HiChartBar} />
          </Link>
          <Link to="/admin/departments">
            <Button ariaLabel="Departments" variant="secondary" className="w-full justify-start" icon={HiBuildingOffice} />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold text-gray-900">New Joiners &amp; Exits</h2>
          <Table columns={joinColumns} data={joinersAndExits} pageSize={5} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Quick Search</h2>
          <p className="mt-1 text-sm text-gray-500">Find employees or documents quickly.</p>
          <div className="mt-4 space-y-3">
            <Input
              label="Search employees"
              name="q-emp"
              placeholder="Name, department, or ID"
              value={qEmp}
              onChange={(e) => setQEmp(e.target.value)}
            />
            <Input
              label="Search documents"
              name="q-doc"
              placeholder="Policy, contract, or letter"
              value={qDoc}
              onChange={(e) => setQDoc(e.target.value)}
            />
            <Button ariaLabel="Search" variant="primary" icon={HiMagnifyingGlass} className="w-full sm:w-auto" onClick={handleSearch} />
          </div>
          {showSearchResults && searchResults.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Search Results</h3>
              <ul className="space-y-2">
                {searchResults.map((emp) => (
                  <li key={emp.id}>
                    <button
                      onClick={() => handleEmployeeClick(emp)}
                      className="w-full text-left rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{emp.name}</div>
                      <div className="text-xs text-gray-500">{emp.empId} • {emp.department} • {emp.jobTitle}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {showSearchResults && searchResults.length === 0 && (
            <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-500">No results found</div>
          )}
        </div>
      </div>
    </div>
  )
}
