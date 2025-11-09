import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

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

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const status = searchParams.get('status')
    const sentiment = searchParams.get('sentiment')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        responses: {
          where: {
            ...(status && status !== 'all' ? { status } : {}),
            ...(sentiment && sentiment !== 'all' ? { sentiment } : {}),
            ...(startDate ? { createdAt: { gte: new Date(startDate) } } : {}),
            ...(endDate ? { createdAt: { lte: new Date(endDate) } } : {}),
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check access: HR can only export their own campaigns
    if (session.user.role === 'hr' && campaign.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (format === 'csv') {
      // Generate CSV
      const headers = ['ID', 'Text', 'Sentiment', 'Status', 'Attention', 'Mood', 'Created At']
      const rows = campaign.responses.map((response) => [
        response.id,
        `"${response.text.replace(/"/g, '""')}"`, // Escape quotes in CSV
        response.sentiment || '',
        response.status || '',
        response.attention || '',
        response.mood || '',
        new Date(response.createdAt).toISOString(),
      ])

      const csv = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${campaign.title.replace(/[^a-z0-9]/gi, '_')}_responses_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else if (format === 'json') {
      // Generate JSON
      const json = JSON.stringify(campaign.responses, null, 2)
      return new NextResponse(json, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${campaign.title.replace(/[^a-z0-9]/gi, '_')}_responses_${new Date().toISOString().split('T')[0]}.json"`,
        },
      })
    }

    return NextResponse.json(
      { error: 'Invalid format. Use csv or json' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error exporting responses:', error)
    return NextResponse.json(
      { error: 'Failed to export responses' },
      { status: 500 }
    )
  }
}

