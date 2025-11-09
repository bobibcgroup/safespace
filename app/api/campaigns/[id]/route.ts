import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { z } from 'zod'

const updateCampaignSchema = z.object({
  title: z.string().optional(),
  question: z.string().optional(),
  startDate: z.string().optional().nullable(),
  closeDate: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  publicReportOn: z.boolean().optional(),
  publicReportPassword: z.string().optional().nullable(),
  isRecurring: z.boolean().optional(),
  recurringInterval: z.enum(['weekly', 'monthly', 'quarterly']).optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // If not authenticated, return only public campaign data (for submission page or public report)
    if (!session) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          title: true,
          question: true,
          closeDate: true,
          isActive: true,
          publicReportOn: true,
          publicReportPassword: true, // Include password field to check if protection is needed
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!campaign) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(campaign)
    }

    // If authenticated, fetch full campaign data
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        responses: {
          include: {
            notes: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
            actionItems: {
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        actionItems: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check access: HR can only see their own campaigns
    if (session.user.role === 'hr' && campaign.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Return full campaign data for authenticated users
    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
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

    // Check if campaign exists and user has access
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // HR users can only edit their own campaigns, admins can edit any
    if (session.user.role === 'hr' && existingCampaign.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only edit your own campaigns' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = updateCampaignSchema.parse(body)

    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.question !== undefined) updateData.question = data.question
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate) : null
    }
    if (data.closeDate !== undefined) {
      updateData.closeDate = data.closeDate ? new Date(data.closeDate) : null
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.publicReportOn !== undefined) updateData.publicReportOn = data.publicReportOn
    if (data.publicReportPassword !== undefined) {
      // Hash password if provided
      if (data.publicReportPassword) {
        const bcrypt = await import('bcryptjs')
        updateData.publicReportPassword = await bcrypt.hash(data.publicReportPassword, 10)
      } else {
        updateData.publicReportPassword = null
      }
    }
    if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring
    if (data.recurringInterval !== undefined) updateData.recurringInterval = data.recurringInterval

    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(campaign)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Only admins can delete campaigns
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can delete campaigns' },
        { status: 403 }
      )
    }

    // Check if campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Delete the campaign (cascade will handle related records)
    await prisma.campaign.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}

