import { Settings, Attendance } from '@prisma/client'

export function calculateWorkedHours(attendance: Attendance): number {
  if (!attendance.inTime || !attendance.outTime) return 0
  
  return (attendance.outTime.getTime() - attendance.inTime.getTime()) / (1000 * 60 * 60)
}

export function calculateHourDifference(workedHours: number, requiredHours: number): number {
  return workedHours - requiredHours
}

export function getWorkingDaysInMonth(year: number, month: number, weeklyOff: string): number {
  const date = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  let workingDays = 0
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day)
    if (weekDays[currentDate.getDay()] !== weeklyOff) {
      workingDays++
    }
  }
  
  return workingDays
}

export function calculateDailySalary(monthlySalary: number, workingDays: number): number {
  return monthlySalary / workingDays
}

export function calculateHourlyRate(monthlySalary: number, workingDays: number, requiredHours: number): number {
  return monthlySalary / (workingDays * requiredHours)
}

export function calculateDeduction(missingHours: number, hourlyRate: number): number {
  return Math.abs(missingHours) * hourlyRate
}

export function calculateOvertime(extraHours: number, hourlyRate: number): number {
  return extraHours * hourlyRate
}

export function calculatePayableSalary(
  monthlySalary: number,
  overtimeAmount: number,
  deductionAmount: number
): number {
  return monthlySalary + overtimeAmount - deductionAmount
}

export function getMonthStats(attendances: Attendance[], settings: Settings) {
  const stats = {
    present: 0,
    holiday: 0,
    paidLeave: 0,
    unpaidLeave: 0,
    wfh: 0,
    totalWorkedHours: 0,
    extraHours: 0,
    missingHours: 0,
  }

  attendances.forEach((attendance) => {
    const workedHours = calculateWorkedHours(attendance)
    const difference = calculateHourDifference(workedHours, settings.requiredHours)

    stats.totalWorkedHours += workedHours

    if (difference > 0) {
      stats.extraHours += difference
    } else {
      stats.missingHours += Math.abs(difference)
    }

    switch (attendance.status) {
      case 'Present':
        stats.present++
        break
      case 'Holiday':
        stats.holiday++
        break
      case 'Paid Leave':
        stats.paidLeave++
        break
      case 'Unpaid Leave':
        stats.unpaidLeave++
        break
      case 'WFH':
        stats.wfh++
        break
    }
  })

  return stats
}

export function calculateTotalRequiredHours(year: number, month: number, settings: Settings): number {
  const workingDays = getWorkingDaysInMonth(year, month, settings.weeklyOff)
  return workingDays * settings.requiredHours
}

export function calculateHoursLeft(totalWorkedHours: number, totalRequiredHours: number): number {
  return Math.max(0, totalRequiredHours - totalWorkedHours)
}

export function calculateSalaryStats(stats: any, settings: Settings, year: number, month: number) {
  const workingDays = getWorkingDaysInMonth(year, month, settings.weeklyOff)
  const hourlyRate = calculateHourlyRate(settings.monthlySalary, workingDays, settings.requiredHours)
  const dailySalary = calculateDailySalary(settings.monthlySalary, workingDays)

  const overtimeAmount = calculateOvertime(stats.extraHours, hourlyRate)
  const deductionAmount = calculateDeduction(stats.missingHours, hourlyRate) + (stats.unpaidLeave * dailySalary)
  const payableSalary = calculatePayableSalary(settings.monthlySalary, overtimeAmount, deductionAmount)

  return {
    workingDays,
    hourlyRate,
    dailySalary,
    overtimeAmount,
    deductionAmount,
    payableSalary,
  }
}
