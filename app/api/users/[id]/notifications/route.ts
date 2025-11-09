import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { z } from 'zod'

const updateNotificationSchema = z.object({
  telegramChatId: z.string().optional().nullable(),
  notificationPreferences: z.object({
    telegram: z.boolean().optional(),
    newResponse: z.boolean().optional(),
    dailyDigest: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
  }).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Users can only update their own preferences, or admin can update any
    if (session.user.id !== params.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = updateNotificationSchema.parse(body)

    const updateData: any = {}
    if (data.telegramChatId !== undefined) {
      updateData.telegramChatId = data.telegramChatId
    }
    if (data.notificationPreferences !== undefined) {
      updateData.notificationPreferences = JSON.stringify(data.notificationPreferences)
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        telegramChatId: true,
        notificationPreferences: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    )
  }
}

