import { NextRequest, NextResponse } from 'next/server'
import { getSettings } from '@/app/actions/settings'

export async function GET(request: NextRequest) {
  try {
    const settings = await getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}
