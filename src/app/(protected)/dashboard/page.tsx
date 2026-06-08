import { getSettings } from '@/app/actions/settings'
import { getAttendanceByMonth, autoMarkWeeklyOff } from '@/app/actions/attendance'
import { getMonthStats, calculateSalaryStats, calculateTotalRequiredHours, calculateHoursLeft } from '@/lib/calculations'
import { formatCurrency, formatHours } from '@/lib/utils'
import { format } from 'date-fns'
import { DashboardContent } from '@/components/dashboard-content'

export default async function DashboardPage() {
  const settings = await getSettings()
  const now = new Date()

  // Auto-mark weekly off if today is the weekly off day
  await autoMarkWeeklyOff(now.getFullYear(), now.getMonth())

  const attendances = await getAttendanceByMonth(now.getFullYear(), now.getMonth())
  const stats = getMonthStats(attendances, settings)
  const salaryStats = calculateSalaryStats(stats, settings, now.getFullYear(), now.getMonth())
  const totalRequiredHours = calculateTotalRequiredHours(now.getFullYear(), now.getMonth(), settings)
  const hoursLeft = calculateHoursLeft(stats.totalWorkedHours, totalRequiredHours)

  const cards = [
    {
      title: 'Present Days',
      value: stats.present,
      icon: 'Calendar',
      color: 'text-green-600',
    },
    {
      title: 'Holiday Days',
      value: stats.holiday,
      icon: 'Calendar',
      color: 'text-blue-600',
    },
    {
      title: 'Paid Leave Days',
      value: stats.paidLeave,
      icon: 'Calendar',
      color: 'text-purple-600',
    },
    {
      title: 'WFH Days',
      value: stats.wfh,
      icon: 'Calendar',
      color: 'text-yellow-600',
    },
    {
      title: 'Total Worked Hours',
      value: formatHours(stats.totalWorkedHours),
      icon: 'Clock',
      color: 'text-gray-600',
    },
    {
      title: 'Total Required Hours',
      value: formatHours(totalRequiredHours),
      icon: 'Clock',
      color: 'text-blue-600',
    },
    {
      title: 'Hours Left',
      value: formatHours(hoursLeft),
      icon: 'TrendingUp',
      color: 'text-orange-600',
    },
    {
      title: 'Overtime Hours',
      value: formatHours(stats.extraHours),
      icon: 'TrendingUp',
      color: 'text-green-600',
    },
    {
      title: 'Missing Hours',
      value: formatHours(stats.missingHours),
      icon: 'TrendingDown',
      color: 'text-red-600',
    },
  ]

  const salaryCards = [
    {
      title: 'Current Month Salary',
      value: formatCurrency(settings.monthlySalary, settings.currency),
      icon: 'DollarSign',
      color: 'text-gray-600',
    },
    {
      title: 'Salary Deduction',
      value: formatCurrency(salaryStats.deductionAmount, settings.currency),
      icon: 'TrendingDown',
      color: 'text-red-600',
    },
    {
      title: 'Final Payable Salary',
      value: formatCurrency(salaryStats.payableSalary, settings.currency),
      icon: 'DollarSign',
      color: 'text-green-600',
    },
  ]

  return (
    <DashboardContent
        cards={cards}
        salaryCards={salaryCards}
        stats={stats}
        salaryStats={salaryStats}
        settings={settings}
        now={now}
      />
  )
}
