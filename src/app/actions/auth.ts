'use server'

import { redirect } from 'next/navigation'
import { createSession } from '@/lib/auth'

export async function login(formData: FormData) {
  const password = formData.get('password') as string
  const correctPassword = process.env.APP_PASSWORD

  if (!correctPassword) {
    return { error: 'Server configuration error: APP_PASSWORD not set' }
  }

  if (password !== correctPassword) {
    return { error: 'Invalid password' }
  }

  await createSession()
  redirect('/dashboard')
}

export async function logout() {
  const { removeSession } = await import('@/lib/auth')
  await removeSession()
  redirect('/login')
}
