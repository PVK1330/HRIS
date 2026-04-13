import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { HiCalendar, HiClock, HiMapPin, HiCurrencyDollar, HiUser } from 'react-icons/hi2'

export default function EmployeeTimeAttendance() {
  const { user } = useState({ name: 'John Smith', empId: 'EMP001' })
  const [selectedMonth, setSelectedMonth] = useState('2026-04')
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState(null)
  const [checkOutTime, setCheckOutTime] = useState(null)

  const attendanceRecords = useMemo(() => [
    { date: '2026-04-01', day: 'Mon', checkIn: '08:55', checkOut: '18:05', hours: '9.17', status: 'Present', location: 'Office' },
    { date: '2026-04-02', day: 'Tue', checkIn: '09:10', checkOut: '18:00', hours: '8.83', status: 'Late', location: 'Office' },
    { date: '2026-04-03', day: 'Wed', checkIn: '08:45', checkOut: '17:55', hours: '9.17', status: 'Present', location: 'Office' },
    { date: '2026-04-04', day: 'Thu', checkIn: '08:50', checkOut: '18:10', hours: '9.33', status: 'Present', location: 'Remote' },
    { date: '2026-04-07', day: 'Mon', checkIn: '-', checkOut: '-', hours: '-', status: 'Weekend', location: '-' },
    { date: '2026-04-08', day: 'Tue', checkIn: '08:55', checkOut: '18:00', hours: '9.08', status: 'Present', location: 'Office' },
    { date: '2026-04-09', day: 'Wed', checkIn: '-', checkOut: '-', hours: '-', status: 'On Leave', location: '-' },
    { date: '2026-04-10', day: 'Thu', checkIn: '08:48', checkOut: '18:05', hours: '9.28', status: 'Present', location: 'Office' },
    { date: '2026-04-11', day: 'Fri', checkIn: '08:52', checkOut: '17:30', hours: '8.63', status: 'Present', location: 'Office' },
    { date: '2026-04-14', day: 'Mon', checkIn: '-', checkOut: '-', hours: '-', status: 'Weekend', location: '-' },
  ], [])

  const summary = useMemo(() => {
    const present = attendanceRecords.filter((r) => r.status === 'Present').length
    const late = attendanceRecords.filter((r) => r.status === 'Late').length
    const leave = attendanceRecords.filter((r) => r.status === 'On Leave').length
    const weekend = attendanceRecords.filter((r) => r.status === 'Weekend').length
    const totalHours = attendanceRecords.reduce((acc, r) => acc + (r.hours !== '-' ? parseFloat(r.hours) : 0), 0)
    return { present, late, leave, weekend, totalHours: totalHours.toFixed(2) }
  }, [attendanceRecords])

  const statusColor = (status) => {
    if (status === 'Present') return 'green'
    if (status === 'Late') return 'orange'
    if (status === 'On Leave') return 'blue'
    if (status === 'Weekend') return 'gray'
    return 'gray'
  }

  const handleCheckIn = () => {
    const now = new Date()
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    setCheckInTime(time)
    setIsCheckedIn(true)
    console.log('Checked in at:', time)
  }

  const handleCheckOut = () => {
    const now = new Date()
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    setCheckOutTime(time)
    setIsCheckedIn(false)
    console.log('Checked out at:', time)
  }

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'day', label: 'Day' },
    { key: 'checkIn', label: 'Check In' },
    { key: 'checkOut', label: 'Check Out' },
    { key: 'hours', label: 'Hours' },
    { key: 'location', label: 'Location' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Time & Attendance</h1>
          <p className="mt-1 text-sm text-gray-500">View your attendance records and working hours.</p>
        </div>
        <Input
          label="Select Month"
          name="month"
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="Leave Balance" value="12" subtitle="Annual leave remaining" color="blue" icon={HiCalendar} />
        <StatCard title="Working Days" value="18" subtitle="This month" color="green" icon={HiClock} />
        <StatCard title="Pending Claims" value="2" subtitle="Awaiting approval" color="yellow" icon={HiCurrencyDollar} />
        <StatCard title="Goals Progress" value="75%" subtitle="3 of 4 completed" color="blue" icon={HiUser} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Mark Attendance</h2>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {isCheckedIn ? (
                <>
                  <span className="font-semibold text-green-600">Checked in at {checkInTime}</span>
                  {checkOutTime && <span className="ml-4 font-semibold text-blue-600">Checked out at {checkOutTime}</span>}
                </>
              ) : (
                <span className="font-semibold text-gray-500">Not checked in yet</span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              label="Check In"
              variant="primary"
              onClick={handleCheckIn}
              disabled={isCheckedIn}
            />
            <Button
              label="Check Out"
              variant="secondary"
              onClick={handleCheckOut}
              disabled={!isCheckedIn}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Attendance Calendar</h2>
        <div className="mt-4 grid grid-cols-7 gap-2 text-center text-sm">
          <div className="font-semibold text-gray-500">Sun</div>
          <div className="font-semibold text-gray-500">Mon</div>
          <div className="font-semibold text-gray-500">Tue</div>
          <div className="font-semibold text-gray-500">Wed</div>
          <div className="font-semibold text-gray-500">Thu</div>
          <div className="font-semibold text-gray-500">Fri</div>
          <div className="font-semibold text-gray-500">Sat</div>
          {[...Array(30)].map((_, i) => {
            const day = i + 1
            const dayOfWeek = new Date(2026, 3, day).getDay()
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
            const isLeave = day === 9
            return (
              <div
                key={i}
                className={`flex h-10 items-center justify-center rounded-lg ${
                  isWeekend
                    ? 'bg-gray-100 text-gray-400'
                    : isLeave
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-green-50 text-green-600'
                }`}
              >
                {day}
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-50" />
            <span className="text-gray-600">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-50" />
            <span className="text-gray-600">On Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-gray-100" />
            <span className="text-gray-600">Weekend</span>
          </div>
        </div>
      </div>

      <Table columns={columns} data={attendanceRecords} pageSize={10} />
    </div>
  )
}
