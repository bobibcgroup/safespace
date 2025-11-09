import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { sendDailyDigestTelegram } from '@/lib/telegram'

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
    const userId = body.userId || session.user.id

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        campaigns: {
          include: {
            responses: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                },
              },
            },
            _count: {
              select: {
                responses: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate summary
    const allResponses = user.campaigns.flatMap(c => c.responses || [])
    const totalResponses = user.campaigns.reduce((sum, c) => sum + (c._count?.responses || 0), 0)
    const newResponses = allResponses.length
    const needsAttention = allResponses.filter((r: any) => 
      r.status === 'needs_attention' || r.status === 'new'
    ).length

    const summary = {
      totalResponses,
      newResponses,
      needsAttention,
      campaigns: user.campaigns
        .filter(c => c.responses && c.responses.length > 0)
        .map(c => ({
          title: c.title,
          responseCount: c.responses?.length || 0,
          campaignId: c.id,
        })),
    }

    const preferences = user.notificationPreferences 
      ? JSON.parse(user.notificationPreferences) 
      : { telegram: true, dailyDigest: false, weeklyDigest: true }

    // Check if user wants digest
    const wantsDigest = preferences.dailyDigest || preferences.weeklyDigest

    // Send Telegram digest
    if (wantsDigest && preferences.telegram && user.telegramChatId) {
      await sendDailyDigestTelegram({
        chatId: user.telegramChatId,
        summary,
      })
    }

    return NextResponse.json({ success: true, summary })
  } catch (error) {
    console.error('Error sending digest:', error)
    return NextResponse.json(
      { error: 'Failed to send digest' },
      { status: 500 }
    )
  }
}

