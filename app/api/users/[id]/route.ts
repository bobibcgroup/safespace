import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['admin', 'hr']).optional(),
  telegramChatId: z.string().optional().nullable(),
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

    // Users can only view their own data, or admin can view any
    if (session.user.id !== params.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        telegramChatId: true,
        notificationPreferences: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
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

    // Only admin can edit users, or users can edit themselves (but not role)
    if (session.user.role !== 'admin' && session.user.id !== params.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = updateUserSchema.parse(body)

    // Check if email is being changed and if it's already taken
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      })
      if (existingUser && existingUser.id !== params.id) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email
    if (data.password !== undefined) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }
    // Only admin can change role
    if (data.role !== undefined && session.user.role === 'admin') {
      updateData.role = data.role
    }
    if (data.telegramChatId !== undefined) {
      updateData.telegramChatId = data.telegramChatId
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        telegramChatId: true,
        notificationPreferences: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
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
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Prevent deleting yourself
    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { reassignToUserId } = body

    // Check if user has any data that needs reassignment
    const userToDelete = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            campaigns: true,
            notes: true,
          },
        },
      },
    })

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const hasData = (userToDelete._count.campaigns > 0) || (userToDelete._count.notes > 0)

    // If user has data, require reassignment
    if (hasData && !reassignToUserId) {
      return NextResponse.json(
        { 
          error: 'User has associated data. Please specify a user to reassign data to.',
          requiresReassignment: true,
          dataCounts: {
            campaigns: userToDelete._count.campaigns,
            notes: userToDelete._count.notes,
          },
        },
        { status: 400 }
      )
    }

    // Verify reassignment target exists
    if (reassignToUserId) {
      const targetUser = await prisma.user.findUnique({
        where: { id: reassignToUserId },
      })

      if (!targetUser) {
        return NextResponse.json(
          { error: 'Reassignment target user not found' },
          { status: 404 }
        )
      }

      if (targetUser.id === params.id) {
        return NextResponse.json(
          { error: 'Cannot reassign data to the same user being deleted' },
          { status: 400 }
        )
      }

      // Reassign campaigns
      await prisma.campaign.updateMany({
        where: { userId: params.id },
        data: { userId: reassignToUserId },
      })

      // Reassign notes
      await prisma.note.updateMany({
        where: { userId: params.id },
        data: { userId: reassignToUserId },
      })
    }

    // Now safe to delete the user
    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ 
      success: true,
      reassigned: hasData ? {
        campaigns: userToDelete._count.campaigns,
        notes: userToDelete._count.notes,
      } : null,
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
