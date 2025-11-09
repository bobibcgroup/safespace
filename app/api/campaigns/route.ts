import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { z } from 'zod'
import { generateSlug, ensureUniqueSlug } from '@/lib/slug'

const createCampaignSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  question: z.string().min(1, 'Question is required'),
  startDate: z.string().optional().nullable(),
  closeDate: z.string().optional().nullable(),
  isRecurring: z.boolean().optional().default(false),
  recurringInterval: z.enum(['weekly', 'monthly', 'quarterly']).optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const where: any = {}
    // HR users only see their own campaigns
    if (session.user.role === 'hr') {
      where.userId = session.user.id
    }
    // Admin sees all campaigns

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        responses: {
          select: {
            id: true,
            text: true,
            sentiment: true,
            status: true,
            attention: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = createCampaignSchema.parse(body)

    // Determine if campaign should start immediately or be scheduled
    const startDate = data.startDate ? new Date(data.startDate) : null
    const shouldStartNow = !startDate || startDate <= new Date()

    // Generate unique slug from title
    const baseSlug = generateSlug(data.title)
    // Ensure slug is not empty
    if (!baseSlug || baseSlug.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid title: cannot generate slug from empty or invalid title' },
        { status: 400 }
      )
    }
    
    const existingCampaigns = await prisma.campaign.findMany({
      where: { slug: { not: null } },
      select: { slug: true },
    })
    const existingSlugs = existingCampaigns.map(c => c.slug!).filter(Boolean)
    const slug = ensureUniqueSlug(baseSlug, existingSlugs)

    const campaignData: any = {
      title: data.title,
      question: data.question,
      startDate: startDate,
      closeDate: data.closeDate ? new Date(data.closeDate) : null,
      isActive: shouldStartNow,
      publicReportOn: false,
      aiReportGenerated: false,
      isRecurring: data.isRecurring || false,
      recurringInterval: data.recurringInterval || null,
      userId: session.user.id,
    }
    
    // Only add slug if it was successfully generated
    if (slug && slug.trim() !== '') {
      campaignData.slug = slug
    }

    const campaign = await prisma.campaign.create({
      data: campaignData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating campaign:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to create campaign', details: errorMessage },
      { status: 500 }
    )
  }
}

