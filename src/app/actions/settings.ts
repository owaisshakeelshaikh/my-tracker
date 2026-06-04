'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSettings() {
  try {
    let settings = await prisma.settings.findFirst()
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 1,
          monthlySalary: 50000,
          requiredHours: 9,
          weeklyOff: 'Sunday',
          currency: '₹',
          hideSalary: false,
        },
      })
    }
    
    return settings
  } catch (error) {
    console.error('Error fetching settings:', error)
    throw new Error('Failed to fetch settings')
  }
}

export async function updateSettings(formData: FormData) {
  try {
    const monthlySalary = parseFloat(formData.get('monthlySalary') as string)
    const requiredHours = parseFloat(formData.get('requiredHours') as string)
    const weeklyOff = formData.get('weeklyOff') as string
    const currency = formData.get('currency') as string
    const hideSalary = formData.get('hideSalary') === 'on'

    await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        monthlySalary,
        requiredHours,
        weeklyOff,
        currency,
        hideSalary,
      },
      create: {
        id: 1,
        monthlySalary,
        requiredHours,
        weeklyOff,
        currency,
        hideSalary,
      },
    })

    revalidatePath('/settings')
    revalidatePath('/dashboard')
    revalidatePath('/attendance')
    revalidatePath('/reports')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating settings:', error)
    return { success: false, error: 'Failed to update settings' }
  }
}
