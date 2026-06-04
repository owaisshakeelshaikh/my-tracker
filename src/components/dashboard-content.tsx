'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { formatCurrency, formatHours } from '@/lib/utils'
import { SalaryToggle } from '@/components/salary-toggle'
import { Calendar, Clock, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

const iconMap: Record<string, any> = {
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
}

interface DashboardContentProps {
  cards: any[]
  salaryCards: any[]
  stats: any
  salaryStats: any
  settings: any
  now: Date
}

export function DashboardContent({
  cards,
  salaryCards,
  stats,
  salaryStats,
  settings,
  now,
}: DashboardContentProps) {
  const [showSalary, setShowSalary] = useState(false)

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">
        Dashboard - {format(now, 'MMMM yyyy')}
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {cards.map((card) => {
          const Icon = iconMap[card.icon] || Calendar
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${card.color}`} />
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="text-lg sm:text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-4">
        <SalaryToggle onToggle={setShowSalary} />
      </div>

      {showSalary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {salaryCards.map((card) => {
            const Icon = iconMap[card.icon] || DollarSign
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${card.color}`} />
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <div className="text-lg sm:text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">Present</span>
                <span className="font-semibold text-sm sm:text-base">{stats.present} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">Holiday</span>
                <span className="font-semibold text-sm sm:text-base">{stats.holiday} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">Paid Leave</span>
                <span className="font-semibold text-sm sm:text-base">{stats.paidLeave} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">Unpaid Leave</span>
                <span className="font-semibold text-sm sm:text-base">{stats.unpaidLeave} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">WFH</span>
                <span className="font-semibold text-sm sm:text-base">{stats.wfh} days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {showSalary && (
          <Card>
            <CardHeader>
              <CardTitle>Salary Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Monthly Salary</span>
                  <span className="font-semibold text-sm sm:text-base">{formatCurrency(settings.monthlySalary, settings.currency)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Working Days</span>
                  <span className="font-semibold text-sm sm:text-base">{salaryStats.workingDays} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Daily Rate</span>
                  <span className="font-semibold text-sm sm:text-base">{formatCurrency(salaryStats.dailySalary, settings.currency)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Hourly Rate</span>
                  <span className="font-semibold text-sm sm:text-base">{formatCurrency(salaryStats.hourlyRate, settings.currency)}/hr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Deductions</span>
                  <span className="font-semibold text-red-600 text-sm sm:text-base">-{formatCurrency(salaryStats.deductionAmount, settings.currency)}</span>
                </div>
                <div className="border-t pt-3 sm:pt-4 flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-medium">Final Payable</span>
                  <span className="font-bold text-base sm:text-lg">{formatCurrency(salaryStats.payableSalary, settings.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
