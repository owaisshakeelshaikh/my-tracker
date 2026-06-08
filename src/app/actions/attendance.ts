'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { startOfDay, endOfDay } from 'date-fns'

export async function getAttendanceByMonth(year: number, month: number) {
  try {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59)

    const attendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    return attendances
  } catch (error) {
    console.error('Error fetching attendance:', error)
    throw new Error('Failed to fetch attendance')
  }
}

export async function getAttendanceByDate(date: Date) {
  try {
    const attendance = await prisma.attendance.findUnique({
      where: {
        date: startOfDay(date),
      },
    })

    return attendance
  } catch (error) {
    console.error('Error fetching attendance by date:', error)
    throw new Error('Failed to fetch attendance')
  }
}

export async function createAttendance(formData: FormData) {
  try {
    const date = new Date(formData.get('date') as string)
    const inTimeStr = formData.get('inTime') as string
    const outTimeStr = formData.get('outTime') as string
    const status = formData.get('status') as string
    const remarks = formData.get('remarks') as string || null

    const attendance = await prisma.attendance.create({
      data: {
        date: startOfDay(date),
        inTime: inTimeStr || null,
        outTime: outTimeStr || null,
        status,
        remarks,
      },
    })

    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    revalidatePath('/reports')

    return { success: true, attendance }
  } catch (error) {
    console.error('Error creating attendance:', error)
    return { success: false, error: 'Failed to create attendance' }
  }
}

export async function updateAttendance(id: number, formData: FormData) {
  try {
    const date = new Date(formData.get('date') as string)
    const inTimeStr = formData.get('inTime') as string
    const outTimeStr = formData.get('outTime') as string
    const status = formData.get('status') as string
    const remarks = formData.get('remarks') as string || null

    const attendance = await prisma.attendance.update({
      where: { id },
      data: {
        date: startOfDay(date),
        inTime: inTimeStr || null,
        outTime: outTimeStr || null,
        status,
        remarks,
      },
    })

    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    revalidatePath('/reports')

    return { success: true, attendance }
  } catch (error) {
    console.error('Error updating attendance:', error)
    return { success: false, error: 'Failed to update attendance' }
  }
}

export async function deleteAttendance(id: number) {
  try {
    await prisma.attendance.delete({
      where: { id },
    })

    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    revalidatePath('/reports')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting attendance:', error)
    return { success: false, error: 'Failed to delete attendance' }
  }
}

export async function autoMarkWeeklyOff(year: number, month: number) {
  try {
    await deleteAutoMarkedWeeklyOffs()

    const settings = await prisma.settings.findFirst()
    if (!settings) {
      return { success: false, error: 'Settings not found' }
    }

    const today = new Date()
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const weeklyOffDay = weekDays.indexOf(settings.weeklyOff)

    let markedCount = 0

    // Check past 7 days for missed weekly offs
    for (let i = 0; i <= 7; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)

      if (checkDate.getDay() === weeklyOffDay) {
        const dayStart = startOfDay(checkDate)
        const dayEnd = endOfDay(checkDate)
        const existing = await prisma.attendance.findFirst({
          where: {
            date: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        })

        if (!existing) {
          await prisma.attendance.create({
            data: {
              date: dayStart,
              status: 'Holiday',
              remarks: 'Weekly Off',
            },
          })
          markedCount++
        }
      }
    }

    return { success: true, markedCount }
  } catch (error) {
    console.error('Error auto-marking weekly off:', error)
    return { success: false, error: 'Failed to auto-mark weekly off' }
  }
}

export async function exportDatabase() {
  try {
    const settings = await prisma.settings.findFirst()
    const attendances = await prisma.attendance.findMany({
      orderBy: { date: 'asc' },
    })

    const data = {
      settings,
      attendances,
      exportedAt: new Date().toISOString(),
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error exporting database:', error)
    return { success: false, error: 'Failed to export database' }
  }
}

export async function importDatabase(data: any) {
  try {
    // Clear existing data
    await prisma.attendance.deleteMany({})
    await prisma.settings.deleteMany({})

    // Import settings
    if (data.settings) {
      await prisma.settings.create({
        data: data.settings,
      })
    }

    // Import attendances
    if (data.attendances && Array.isArray(data.attendances)) {
      for (const attendance of data.attendances) {
        await prisma.attendance.create({
          data: {
            ...attendance,
            date: new Date(attendance.date),
            inTime1: attendance.inTime1 ? new Date(attendance.inTime1) : null,
            outTime1: attendance.outTime1 ? new Date(attendance.outTime1) : null,
            inTime2: attendance.inTime2 ? new Date(attendance.inTime2) : null,
            outTime2: attendance.outTime2 ? new Date(attendance.outTime2) : null,
            createdAt: new Date(attendance.createdAt),
            updatedAt: new Date(attendance.updatedAt),
          },
        })
      }
    }

    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    revalidatePath('/reports')
    revalidatePath('/settings')
    
    return { success: true }
  } catch (error) {
    console.error('Error importing database:', error)
    return { success: false, error: 'Failed to import database' }
  }
}

export async function deleteAutoMarkedWeeklyOffs() {
  try {
    const weeklyOffs = await prisma.attendance.findMany({
      where: {
        status: 'Holiday',
        remarks: 'Weekly Off',
      },
      orderBy: [
        { date: 'asc' },
        { id: 'asc' },
      ],
    })

    const seenDates = new Set<string>()
    const duplicateIds: number[] = []

    weeklyOffs.forEach((attendance) => {
      const dateKey = startOfDay(attendance.date).toISOString()

      if (seenDates.has(dateKey)) {
        duplicateIds.push(attendance.id)
        return
      }

      seenDates.add(dateKey)
    })

    if (duplicateIds.length === 0) {
      return { success: true, deletedCount: 0 }
    }

    const result = await prisma.attendance.deleteMany({
      where: {
        id: {
          in: duplicateIds,
        },
      },
    })

    return { success: true, deletedCount: result.count }
  } catch (error) {
    console.error('Error deleting auto-marked weekly offs:', error)
    return { success: false, error: 'Failed to delete auto-marked weekly offs' }
  }
}

export async function checkIn() {
  try {
    const today = startOfDay(new Date())
    const now = new Date()
    const currentTime = `${now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}`

    // Check if attendance already exists for today
    const existing = await prisma.attendance.findUnique({
      where: { date: today },
    })

    if (existing) {
      if (existing.inTime) {
        return { success: false, error: 'Already checked in today' }
      }
      // Update existing record without inTime
      const attendance = await prisma.attendance.update({
        where: { id: existing.id },
        data: { inTime: currentTime },
      })
      revalidatePath('/attendance')
      revalidatePath('/dashboard')
      revalidatePath('/reports')
      return { success: true, attendance }
    }

    // Create new attendance record
    const attendance = await prisma.attendance.create({
      data: {
        date: today,
        inTime: currentTime,
        status: 'Present',
      },
    })

    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    revalidatePath('/reports')

    return { success: true, attendance }
  } catch (error) {
    console.error('Error checking in:', error)
    return { success: false, error: 'Failed to check in' }
  }
}

export async function checkOut() {
  try {
    const today = startOfDay(new Date())
    const now = new Date()
    const currentTime = `${now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}`

    // Check if attendance exists for today
    const existing = await prisma.attendance.findUnique({
      where: { date: today },
    })

    if (!existing) {
      return { success: false, error: 'No attendance record for today. Please check in first.' }
    }

    if (!existing.inTime) {
      return { success: false, error: 'Please check in first' }
    }

    if (existing.outTime) {
      return { success: false, error: 'Already checked out today' }
    }

    // Update attendance with outTime
    const attendance = await prisma.attendance.update({
      where: { id: existing.id },
      data: { outTime: currentTime },
    })

    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    revalidatePath('/reports')

    return { success: true, attendance }
  } catch (error) {
    console.error('Error checking out:', error)
    return { success: false, error: 'Failed to check out' }
  }
}

export async function getTodayAttendance() {
  try {
    const today = startOfDay(new Date())
    const attendance = await prisma.attendance.findUnique({
      where: { date: today },
    })
    return attendance
  } catch (error) {
    console.error('Error fetching today attendance:', error)
    return null
  }
}
