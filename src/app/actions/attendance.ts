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

    const inTime = inTimeStr ? (() => {
      const [hours, minutes] = inTimeStr.split(':').map(Number)
      const timeDate = new Date(date)
      timeDate.setHours(hours, minutes, 0, 0)
      return timeDate
    })() : null
    const outTime = outTimeStr ? (() => {
      const [hours, minutes] = outTimeStr.split(':').map(Number)
      const timeDate = new Date(date)
      timeDate.setHours(hours, minutes, 0, 0)
      return timeDate
    })() : null

    const attendance = await prisma.attendance.create({
      data: {
        date: startOfDay(date),
        inTime,
        outTime,
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

    const inTime = inTimeStr ? (() => {
      const [hours, minutes] = inTimeStr.split(':').map(Number)
      const timeDate = new Date(date)
      timeDate.setHours(hours, minutes, 0, 0)
      return timeDate
    })() : null
    const outTime = outTimeStr ? (() => {
      const [hours, minutes] = outTimeStr.split(':').map(Number)
      const timeDate = new Date(date)
      timeDate.setHours(hours, minutes, 0, 0)
      return timeDate
    })() : null

    const attendance = await prisma.attendance.update({
      where: { id },
      data: {
        date: startOfDay(date),
        inTime,
        outTime,
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
    const settings = await prisma.settings.findFirst()
    if (!settings) {
      return { success: false, error: 'Settings not found' }
    }

    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const weeklyOffDay = weekDays.indexOf(settings.weeklyOff)

    let markedCount = 0

    for (let day = 1; day <= endDate.getDate(); day++) {
      const currentDate = new Date(year, month, day)
      
      if (currentDate.getDay() === weeklyOffDay) {
        const existing = await prisma.attendance.findUnique({
          where: { date: startOfDay(currentDate) },
        })

        if (!existing) {
          await prisma.attendance.create({
            data: {
              date: startOfDay(currentDate),
              status: 'Holiday',
              remarks: 'Weekly Off',
            },
          })
          markedCount++
        }
      }
    }

    revalidatePath('/attendance')
    revalidatePath('/dashboard')
    revalidatePath('/reports')
    
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
