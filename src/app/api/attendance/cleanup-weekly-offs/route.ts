import { NextRequest, NextResponse } from 'next/server'
import { deleteAutoMarkedWeeklyOffs } from '@/app/actions/attendance'

export async function POST(request: NextRequest) {
  try {
    const result = await deleteAutoMarkedWeeklyOffs()
    
    if (result.success) {
      return NextResponse.json({ success: true, deletedCount: result.deletedCount })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cleanup weekly offs' }, { status: 500 })
  }
}
