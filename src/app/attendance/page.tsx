'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, startOfDay } from 'date-fns'
import { Calendar, Clock, Edit, Trash2, Plus } from 'lucide-react'
import { formatHours } from '@/lib/utils'

interface Attendance {
  id: number
  date: Date
  inTime: Date | null
  outTime: Date | null
  status: string
  remarks: string | null
}

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null)
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    inTime: '',
    outTime: '',
    status: 'Present',
    remarks: '',
  })

  const statusOptions = ['Present', 'Holiday', 'Paid Leave', 'Unpaid Leave', 'WFH']

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      ...formData,
    }

    try {
      const url = editingAttendance
        ? `/api/attendance/${editingAttendance.id}`
        : '/api/attendance'

      const method = editingAttendance ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setEditingAttendance(null)
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          inTime: '',
          outTime: '',
          status: 'Present',
          remarks: '',
        })
        fetchAttendances()
      }
    } catch (error) {
      console.error('Error saving attendance:', error)
    }
  }

  const handleEdit = (attendance: Attendance) => {
    setEditingAttendance(attendance)
    setFormData({
      date: format(new Date(attendance.date), 'yyyy-MM-dd'),
      inTime: attendance.inTime ? format(new Date(attendance.inTime), 'HH:mm') : '',
      outTime: attendance.outTime ? format(new Date(attendance.outTime), 'HH:mm') : '',
      status: attendance.status,
      remarks: attendance.remarks || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const response = await fetch(`/api/attendance/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchAttendances()
      }
    } catch (error) {
      console.error('Error deleting attendance:', error)
    }
  }

  const handleQuickAddToday = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      inTime: '',
      outTime: '',
      status: 'Present',
      remarks: '',
    })
    setEditingAttendance(null)
    setIsDialogOpen(true)
  }

  const calculateWorkedHours = (attendance: Attendance) => {
    if (!attendance.inTime || !attendance.outTime) return 0
    const hours = (new Date(attendance.outTime).getTime() - new Date(attendance.inTime).getTime()) / (1000 * 60 * 60)
    return hours
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Attendance</h1>
        <Button onClick={handleQuickAddToday} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Quick Add Today
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter by Month</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="month">Month</Label>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger id="month">
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
            <Label htmlFor="year">Year</Label>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger id="year">
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

      <div className="grid gap-3 sm:gap-4">
        {attendances.map((attendance) => (
          <Card key={attendance.id}>
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-semibold text-xs sm:text-sm truncate">{format(new Date(attendance.date), 'EEE, MMM d, yyyy')}</span>
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0 ${
                      attendance.status === 'Present' ? 'bg-green-100 text-green-800' :
                      attendance.status === 'Holiday' ? 'bg-blue-100 text-blue-800' :
                      attendance.status === 'Paid Leave' ? 'bg-purple-100 text-purple-800' :
                      attendance.status === 'Unpaid Leave' ? 'bg-red-100 text-red-800' :
                      attendance.status === 'WFH' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {attendance.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">In: {attendance.inTime ? format(new Date(attendance.inTime), 'h:mm a') : '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">Out: {attendance.outTime ? format(new Date(attendance.outTime), 'h:mm a') : '-'}</span>
                    </div>
                  </div>
                  
                  {attendance.remarks && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 truncate">Remarks: {attendance.remarks}</p>
                  )}
                  
                  <p className="text-xs sm:text-sm font-medium mt-1.5 sm:mt-2">
                    Worked Hours: {formatHours(calculateWorkedHours(attendance))}
                  </p>
                </div>
                
                <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                  <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => handleEdit(attendance)}>
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => handleDelete(attendance.id)}>
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {attendances.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No attendance records for this month. Click &quot;Quick Add Today&quot; to add your first entry.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{editingAttendance ? 'Edit Attendance' : 'Add Attendance'}</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              {editingAttendance ? 'Update your attendance record' : 'Add a new attendance record'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inTime">In Time</Label>
                  <Input
                    id="inTime"
                    type="time"
                    value={formData.inTime}
                    onChange={(e) => setFormData({ ...formData, inTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outTime">Out Time</Label>
                  <Input
                    id="outTime"
                    type="time"
                    value={formData.outTime}
                    onChange={(e) => setFormData({ ...formData, outTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Input
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {editingAttendance ? 'Update' : 'Add'} Attendance
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
