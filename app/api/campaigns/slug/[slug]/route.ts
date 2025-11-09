import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: { 
        OR: [
          { slug: params.slug },
          { id: params.slug }, // Fallback to ID if slug doesn't match
        ]
      },
      select: {
        id: true,
        title: true,
        question: true,
        closeDate: true,
        isActive: true,
        publicReportOn: true,
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
  } catch (error) {
    console.error('Error fetching campaign by slug:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

