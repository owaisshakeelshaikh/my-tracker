'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { format } from 'date-fns'
import { Download, FileSpreadsheet, FileText, Clock, Calendar as CalendarIcon } from 'lucide-react'
import * as XLSX from 'xlsx'
import { formatHours } from '@/lib/utils'

interface Attendance {
  id: number
  date: Date
  inTime: string | null
  outTime: string | null
  status: string
  remarks: string | null
}

export default function ReportsPage() {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  const fetchAttendances = useCallback(async () => {
    try {
      const response = await fetch(`/api/attendance?month=${selectedMonth}&year=${selectedYear}`)
      const data = await response.json()
      setAttendances(data)
    } catch (error) {
      console.error('Error fetching attendances:', error)
    }
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    fetchAttendances()
  }, [fetchAttendances])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const date = new Date(0, 0, 0, hours, minutes)
    return format(date, 'h:mm a')
  }

  const calculateWorkedHours = (attendance: Attendance) => {
    if (!attendance.inTime || !attendance.outTime) return 0
    const [inHours, inMinutes] = attendance.inTime.split(':').map(Number)
    const [outHours, outMinutes] = attendance.outTime.split(':').map(Number)
    const inDate = new Date(0, 0, 0, inHours, inMinutes)
    const outDate = new Date(0, 0, 0, outHours, outMinutes)
    const hours = (outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60)
    return hours
  }

  const calculateOngoingHours = (attendance: Attendance) => {
    if (!attendance.inTime) return 0
    const [inHours, inMinutes] = attendance.inTime.split(':').map(Number)
    const inDate = new Date(0, 0, 0, inHours, inMinutes)
    const now = new Date()
    const nowDate = new Date(0, 0, 0, now.getHours(), now.getMinutes(), now.getSeconds())
    const hours = (nowDate.getTime() - inDate.getTime()) / (1000 * 60 * 60)
    return hours
  }

  const exportToCSV = () => {
    const headers = ['Date', 'In Time', 'Out Time', 'Status', 'Remarks', 'Worked Hours']
    const rows = attendances.map((a) => [
      format(new Date(a.date), 'yyyy-MM-dd'),
      a.inTime ? formatTime(a.inTime) : '-',
      a.outTime ? formatTime(a.outTime) : '-',
      a.status,
      a.remarks || '-',
      calculateWorkedHours(a),
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-report-${selectedYear}-${selectedMonth + 1}.csv`
    a.click()
  }

  const exportToExcel = () => {
    const data = attendances.map((a) => ({
      Date: format(new Date(a.date), 'yyyy-MM-dd'),
      'In Time': a.inTime ? formatTime(a.inTime) : '-',
      'Out Time': a.outTime ? formatTime(a.outTime) : '-',
      Status: a.status,
      Remarks: a.remarks || '-',
      'Worked Hours': calculateWorkedHours(a),
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance')
    XLSX.writeFile(wb, `attendance-report-${selectedYear}-${selectedMonth + 1}.xlsx`)
  }

  const printReport = () => {
    window.print()
  }

  const generateCalendar = () => {
    const date = new Date(selectedYear, selectedMonth, 1)
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
    const firstDay = date.getDay()
    const calendar = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendar.push(null)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(selectedYear, selectedMonth, day)
      const attendance = attendances.find(
        (a) => format(new Date(a.date), 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
      )
      calendar.push({ day, date: currentDate, attendance })
    }

    return calendar
  }

  const calendar = generateCalendar()

  const handleDateClick = (attendance: Attendance | null | undefined) => {
    if (attendance) {
      setSelectedAttendance(attendance)
      setIsDialogOpen(true)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Reports</h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button onClick={exportToCSV} variant="outline" className="flex-1 sm:flex-none">
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={exportToExcel} variant="outline" className="flex-1 sm:flex-none">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button onClick={printReport} variant="outline" className="flex-1 sm:flex-none">
            <Download className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter by Month</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {format(new Date(2024, i, 1), 'MMMM')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => (
                  <SelectItem key={i} value={(new Date().getFullYear() - 2 + i).toString()}>
                    {new Date().getFullYear() - 2 + i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="calendar">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Calendar - {format(new Date(selectedYear, selectedMonth), 'MMMM yyyy')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center min-w-[300px]">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="font-semibold text-[10px] sm:text-xs p-1">
                      {day}
                    </div>
                  ))}
                  {calendar.map((item, index) => {
                    if (!item) {
                      return <div key={index} className="p-1" />
                    }
                    const { day, attendance } = item
                    const statusColor = attendance
                      ? attendance.status === 'Present'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : attendance.status === 'Holiday'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : attendance.status === 'Paid Leave'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : attendance.status === 'Unpaid Leave'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : attendance.status === 'WFH'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      : 'bg-gray-50 dark:bg-gray-900'

                    return (
                      <div
                        key={index}
                        className={`p-1 rounded border ${statusColor} min-h-[50px] sm:min-h-[80px] cursor-pointer hover:opacity-80 transition-opacity`}
                        onClick={() => handleDateClick(attendance)}
                      >
                        <div className="font-semibold text-[10px] sm:text-xs">{day}</div>
                        {attendance && (
                          <div className="text-[9px] sm:text-xs mt-0.5">
                            <div className="truncate">{attendance.status}</div>
                            {attendance.inTime && (
                              <div className="truncate">
                                In: {formatTime(attendance.inTime)}
                              </div>
                            )}
                            {attendance.outTime && (
                              <div className="truncate">
                                Out: {formatTime(attendance.outTime)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Table - {format(new Date(selectedYear, selectedMonth), 'MMMM yyyy')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">In Time</th>
                      <th className="text-left p-2">Out Time</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Remarks</th>
                      <th className="text-left p-2">Worked Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendances.map((attendance) => (
                      <tr key={attendance.id} className="border-b">
                        <td className="p-2">{format(new Date(attendance.date), 'yyyy-MM-dd')}</td>
                        <td className="p-2">
                          {attendance.inTime ? formatTime(attendance.inTime) : '-'}
                        </td>
                        <td className="p-2">
                          {attendance.outTime ? formatTime(attendance.outTime) : '-'}
                        </td>
                        <td className="p-2">{attendance.status}</td>
                        <td className="p-2">{attendance.remarks || '-'}</td>
                        <td className="p-2">{formatHours(calculateWorkedHours(attendance))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {attendances.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No records for this month</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
          </DialogHeader>
          {selectedAttendance && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Date</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(selectedAttendance.date), 'EEEE, MMMM d, yyyy')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Check-in Time</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedAttendance.inTime ? formatTime(selectedAttendance.inTime) : '-'}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Check-out Time</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedAttendance.outTime ? formatTime(selectedAttendance.outTime) : '-'}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Status</div>
                <div className="text-sm text-muted-foreground">{selectedAttendance.status}</div>
              </div>
              <div>
                <div className="text-sm font-medium">
                  {selectedAttendance.inTime && !selectedAttendance.outTime ? 'Ongoing Hours' : 'Worked Hours'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedAttendance.inTime && !selectedAttendance.outTime
                    ? formatHours(calculateOngoingHours(selectedAttendance))
                    : formatHours(calculateWorkedHours(selectedAttendance))
                  }
                </div>
              </div>
              {selectedAttendance.remarks && (
                <div>
                  <div className="text-sm font-medium">Remarks</div>
                  <div className="text-sm text-muted-foreground">{selectedAttendance.remarks}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
