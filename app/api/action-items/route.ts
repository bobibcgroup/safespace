import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createActionItemSchema = z.object({
  campaignId: z.string(),
  responseId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  owner: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createActionItemSchema.parse(body)

    const actionItem = await prisma.actionItem.create({
      data: {
        campaignId: data.campaignId,
        responseId: data.responseId || null,
        title: data.title,
        owner: data.owner || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    })

    return NextResponse.json(actionItem, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating action item:', error)
    return NextResponse.json(
      { error: 'Failed to create action item' },
      { status: 500 }
    )
  }
}

