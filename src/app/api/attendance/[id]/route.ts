import { NextRequest, NextResponse } from 'next/server'
import { updateAttendance, deleteAttendance } from '@/app/actions/attendance'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const attendanceId = parseInt(id)

    const body = await request.json()
    const formData = new FormData()

    Object.keys(body).forEach(key => {
      formData.append(key, body[key])
    })

    const result = await updateAttendance(attendanceId, formData)

    if (result.success) {
      revalidatePath('/attendance')
      revalidatePath('/dashboard')
      return NextResponse.json(result.attendance)
    }

    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update attendance' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const attendanceId = parseInt(id)

    const result = await deleteAttendance(attendanceId)

    if (result.success) {
      revalidatePath('/attendance')
      revalidatePath('/dashboard')
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete attendance' },
      { status: 500 }
    )
  }
}