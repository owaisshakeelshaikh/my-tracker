import { NextRequest, NextResponse } from 'next/server'
import { updateAttendance, deleteAttendance } from '@/app/actions/attendance'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const formData = new FormData()
    
    Object.keys(body).forEach(key => {
      formData.append(key, body[key])
    })

    const result = await updateAttendance(id, formData)
    
    if (result.success) {
      return NextResponse.json(result.attendance)
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const result = await deleteAttendance(id)
    
    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete attendance' }, { status: 500 })
  }
}
