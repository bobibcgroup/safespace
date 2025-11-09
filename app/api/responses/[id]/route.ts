import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { z } from 'zod'

const updateResponseSchema = z.object({
  status: z.enum(['new', 'needs_attention', 'in_review', 'resolved', 'parked']).optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  attention: z.enum(['urgent', 'moderate', 'positive']).optional(),
  themes: z.array(z.string()).optional(),
  assignedTo: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
})

export async function GET(
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

    const response = await prisma.response.findUnique({
      where: { id: params.id },
      include: {
        campaign: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!response) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      )
    }

    // Check access: HR can only see responses from their own campaigns
    if (session.user.role === 'hr' && response.campaign.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching response:', error)
    return NextResponse.json(
      { error: 'Failed to fetch response' },
      { status: 500 }
    )
  }
}

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

    const body = await request.json()
    const data = updateResponseSchema.parse(body)

    // Verify user has access to this response
    const response = await prisma.response.findUnique({
      where: { id: params.id },
      include: {
        campaign: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!response) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      )
    }

    // Check access: HR can only update responses from their own campaigns
    if (session.user.role === 'hr' && response.campaign.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (data.status !== undefined) updateData.status = data.status
    if (data.sentiment !== undefined) updateData.sentiment = data.sentiment
    if (data.attention !== undefined) updateData.attention = data.attention
    if (data.themes !== undefined) updateData.themes = JSON.stringify(data.themes)
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags)

    const updated = await prisma.response.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating response:', error)
    return NextResponse.json(
      { error: 'Failed to update response' },
      { status: 500 }
    )
  }
}
