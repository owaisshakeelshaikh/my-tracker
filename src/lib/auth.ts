import { cookies } from 'next/headers'

const COOKIE_NAME = 'attendance_auth'

export async function createSession() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function removeSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(COOKIE_NAME)
  return session?.value === 'authenticated'
}
