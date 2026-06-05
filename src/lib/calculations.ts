import { Settings, Attendance } from '@prisma/client'

export function calculateWorkedHours(attendance: Attendance): number {
  if (!attendance.inTime || !attendance.outTime) return 0
  
  const [inHours, inMinutes] = attendance.inTime.split(':').map(Number)
  const [outHours, outMinutes] = attendance.outTime.split(':').map(Number)
  
  const inTimeMinutes = inHours * 60 + inMinutes
  const outTimeMinutes = outHours * 60 + outMinutes
  
  return (outTimeMinutes - inTimeMinutes) / 60
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

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
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

    // Count Holiday and Paid Leave as full working days (no deduction)
    if (attendance.status === 'Holiday' || attendance.status === 'Paid Leave') {
      stats.totalWorkedHours += settings.requiredHours
    } else {
      stats.totalWorkedHours += workedHours
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

  // Calculate net overtime/missing at the end (overtime offsets missing hours)
  const totalRequiredHours = attendances.length * settings.requiredHours
  const netDifference = stats.totalWorkedHours - totalRequiredHours

  if (netDifference > 0) {
    stats.extraHours = netDifference
    stats.missingHours = 0
  } else {
    stats.extraHours = 0
    stats.missingHours = Math.abs(netDifference)
  }

  return stats
}

export function calculateTotalRequiredHours(year: number, month: number, settings: Settings): number {
  const daysInMonth = getDaysInMonth(year, month)
  return daysInMonth * settings.requiredHours
}

export function calculateHoursLeft(totalWorkedHours: number, totalRequiredHours: number): number {
  return Math.max(0, totalRequiredHours - totalWorkedHours)
}

export function calculateSalaryStats(stats: any, settings: Settings, year: number, month: number) {
  const workingDays = getWorkingDaysInMonth(year, month, settings.weeklyOff)
  const daysInMonth = getDaysInMonth(year, month)
  const hourlyRate = calculateHourlyRate(settings.monthlySalary, daysInMonth, settings.requiredHours)
  const dailySalary = calculateDailySalary(settings.monthlySalary, daysInMonth)

  const overtimeAmount = calculateOvertime(stats.extraHours, hourlyRate)
  const deductionAmount = calculateDeduction(stats.missingHours, hourlyRate) + (stats.unpaidLeave * dailySalary)
  const payableSalary = calculatePayableSalary(settings.monthlySalary, 0, deductionAmount)

  return {
    workingDays,
    hourlyRate,
    dailySalary,
    overtimeAmount,
    deductionAmount,
    payableSalary,
  }
}
