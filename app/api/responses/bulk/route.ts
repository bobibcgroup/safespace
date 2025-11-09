import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { z } from 'zod'

const bulkUpdateSchema = z.object({
  responseIds: z.array(z.string()).min(1, 'At least one response ID is required'),
  status: z.string().optional(),
  assignedTo: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = bulkUpdateSchema.parse(body)

    // Verify user has access to all responses
    const responses = await prisma.response.findMany({
      where: {
        id: { in: data.responseIds },
      },
      include: {
        campaign: {
          select: {
            userId: true,
          },
        },
      },
    })

    // Check access: HR can only update responses from their own campaigns
    if (session.user.role === 'hr') {
      const unauthorized = responses.some(
        r => r.campaign.userId !== session.user.id
      )
      if (unauthorized) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    // Build update data
    const updateData: any = {}
    if (data.status !== undefined) updateData.status = data.status
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags)

    // Bulk update
    const result = await prisma.response.updateMany({
      where: {
        id: { in: data.responseIds },
      },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      updated: result.count,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error bulk updating responses:', error)
    return NextResponse.json(
      { error: 'Failed to bulk update responses' },
      { status: 500 }
    )
  }
}

