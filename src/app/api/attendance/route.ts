import { NextRequest, NextResponse } from 'next/server'
import { getAttendanceByMonth, createAttendance } from '@/app/actions/attendance'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = parseInt(searchParams.get('month') || '0')
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    const attendances = await getAttendanceByMonth(year, month)
    return NextResponse.json(attendances)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch attendances' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const formData = new FormData()
    
    Object.keys(body).forEach(key => {
      formData.append(key, body[key])
    })

    const result = await createAttendance(formData)
    
    if (result.success) {
      return NextResponse.json(result.attendance)
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create attendance' }, { status: 500 })
  }
}
