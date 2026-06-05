import { NextRequest, NextResponse } from 'next/server'
import { autoMarkWeeklyOff } from '@/app/actions/attendance'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { year, month } = body

    const result = await autoMarkWeeklyOff(year, month)
    
    if (result.success) {
      return NextResponse.json({ success: true, markedCount: result.markedCount })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to auto-mark weekly off' }, { status: 500 })
  }
}
