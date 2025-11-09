import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

// This endpoint should be called by a cron job to check and update campaign schedules
export async function POST(request: NextRequest) {
  try {
    // Optional: Add API key authentication for cron jobs
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const now = new Date()

    // Activate campaigns that should start now
    await prisma.campaign.updateMany({
      where: {
        startDate: {
          lte: now,
        },
        isActive: false,
      },
      data: {
        isActive: true,
      },
    })

    // Deactivate campaigns that should close now
    await prisma.campaign.updateMany({
      where: {
        closeDate: {
          lte: now,
        },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    })

    // Handle recurring campaigns
    const recurringCampaigns = await prisma.campaign.findMany({
      where: {
        isRecurring: true,
        isActive: false,
        closeDate: {
          lte: now,
        },
      },
    })

    for (const campaign of recurringCampaigns) {
      if (!campaign.recurringInterval) continue

      let nextStartDate = new Date(campaign.closeDate || campaign.createdAt)
      
      switch (campaign.recurringInterval) {
        case 'weekly':
          nextStartDate.setDate(nextStartDate.getDate() + 7)
          break
        case 'monthly':
          nextStartDate.setMonth(nextStartDate.getMonth() + 1)
          break
        case 'quarterly':
          nextStartDate.setMonth(nextStartDate.getMonth() + 3)
          break
      }

      // Create new campaign instance or update existing
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          startDate: nextStartDate,
          closeDate: null, // Will be set when campaign is manually closed or scheduled
          isActive: nextStartDate <= now,
        },
      })
    }

    return NextResponse.json({ success: true, processed: recurringCampaigns.length })
  } catch (error) {
    console.error('Error processing campaign schedules:', error)
    return NextResponse.json(
      { error: 'Failed to process schedules' },
      { status: 500 }
    )
  }
}

