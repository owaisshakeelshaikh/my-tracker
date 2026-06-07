'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LogIn, LogOut, Clock } from 'lucide-react'
import { checkIn, checkOut, getTodayAttendance } from '@/app/actions/attendance'

export function CheckInOut() {
  const [todayAttendance, setTodayAttendance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchTodayAttendance()
  }, [])

  const fetchTodayAttendance = async () => {
    const attendance = await getTodayAttendance()
    setTodayAttendance(attendance)
  }

  const handleCheckIn = async () => {
    setIsLoading(true)
    setMessage('')
    const result = await checkIn()
    if (result.success) {
      setMessage('Checked in successfully!')
      await fetchTodayAttendance()
    } else {
      setMessage(result.error || 'Failed to check in')
    }
    setIsLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleCheckOut = async () => {
    setIsLoading(true)
    setMessage('')
    const result = await checkOut()
    if (result.success) {
      setMessage('Checked out successfully!')
      await fetchTodayAttendance()
    } else {
      setMessage(result.error || 'Failed to check out')
    }
    setIsLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const isHoliday = todayAttendance?.status === 'Holiday'
  const canCheckIn = !isHoliday && (!todayAttendance || !todayAttendance.inTime)
  const canCheckOut = !isHoliday && todayAttendance && todayAttendance.inTime && !todayAttendance.outTime

  if (!mounted) {
    return null
  }

  return (
    <section className="container mx-auto px-4 pt-6">
      <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">Today&apos;s Status</span>
                  {isHoliday && (
                    <span className="text-xs text-muted-foreground">Weekly off</span>
                  )}
                </div>
              {todayAttendance && (
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  todayAttendance.status === 'Present'
                    ? 'bg-green-500/10 text-green-600'
                    : 'bg-blue-500/10 text-blue-600'
                }`}>
                  {todayAttendance.status}
                </span>
              )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>In: {todayAttendance?.inTime || '-'}</span>
                  <span>Out: {todayAttendance?.outTime || '-'}</span>
                  {isHoliday && <span>No check-in/out required</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
              <Button
                onClick={handleCheckIn}
                disabled={!canCheckIn || isLoading}
                className="h-10 rounded-lg px-4 sm:min-w-28"
              >
                <LogIn className="h-4 w-4" />
                Check In
              </Button>
              <Button
                onClick={handleCheckOut}
                disabled={!canCheckOut || isLoading}
                variant="outline"
                className="h-10 rounded-lg px-4 sm:min-w-28"
              >
                <LogOut className="h-4 w-4" />
                Check Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {message && (
        <div className={`mt-3 rounded-md p-3 text-sm ${
          message.includes('successfully')
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {message}
        </div>
      )}
    </section>
  )
}
