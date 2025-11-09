import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'
import { createDemoCampaign } from '@/lib/demo-data'

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await createDemoCampaign(prisma)
    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error('Error seeding demo campaign:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create demo campaign' },
      { status: 500 }
    )
  }
}

