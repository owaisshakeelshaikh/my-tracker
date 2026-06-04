import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = '$') {
  return `${currency}${amount.toFixed(2)}`
}

export function formatHours(hours: number) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

export function formatTime(date: Date | null | undefined) {
  if (!date) return '-'
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
