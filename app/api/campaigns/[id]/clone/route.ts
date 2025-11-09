import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { generateSlug, ensureUniqueSlug } from '@/lib/slug'

export async function POST(
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
    const includeResponses = body.includeResponses === true

    // Fetch original campaign
    const originalCampaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        responses: includeResponses ? true : false,
      },
    })

    if (!originalCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check access: HR can only clone their own campaigns
    if (session.user.role === 'hr' && originalCampaign.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Generate unique slug for cloned campaign
    const baseSlug = generateSlug(`${originalCampaign.title} (Copy)`)
    const existingCampaigns = await prisma.campaign.findMany({
      where: { slug: { not: null } },
      select: { slug: true },
    })
    const existingSlugs = existingCampaigns.map(c => c.slug!).filter(Boolean)
    const slug = ensureUniqueSlug(baseSlug, existingSlugs)

    // Create cloned campaign
    const clonedCampaign = await prisma.campaign.create({
      data: {
        title: `${originalCampaign.title} (Copy)`,
        slug: slug,
        question: originalCampaign.question,
        closeDate: originalCampaign.closeDate,
        isActive: false, // Start inactive so user can review before activating
        publicReportOn: false,
        aiReportGenerated: false,
        userId: session.user.id,
        ...(includeResponses && originalCampaign.responses ? {
          responses: {
            create: originalCampaign.responses.map((response: any) => ({
              text: response.text,
              mood: response.mood,
              sentiment: response.sentiment,
              status: response.status,
              attention: response.attention,
              themes: response.themes,
              aiLabels: response.aiLabels,
            })),
          },
        } : {}),
      },
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

    return NextResponse.json(clonedCampaign, { status: 201 })
  } catch (error) {
    console.error('Error cloning campaign:', error)
    return NextResponse.json(
      { error: 'Failed to clone campaign' },
      { status: 500 }
    )
  }
}

