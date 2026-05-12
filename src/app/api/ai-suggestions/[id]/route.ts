import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update the suggestion
    const updatedSuggestion = await prisma.aISuggestion.updateMany({
      where: {
        id: id,
        userId: user.id // Ensure user can only update their own suggestions
      },
      data: body
    })

    if (updatedSuggestion.count === 0) {
      return NextResponse.json(
        { error: 'Suggestion not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Suggestion updated successfully'
    })

  } catch (error) {
    console.error('Update AI suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to update suggestion' },
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
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete the suggestion
    const deletedSuggestion = await prisma.aISuggestion.deleteMany({
      where: {
        id: id,
        userId: user.id // Ensure user can only delete their own suggestions
      }
    })

    if (deletedSuggestion.count === 0) {
      return NextResponse.json(
        { error: 'Suggestion not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Suggestion deleted successfully'
    })

  } catch (error) {
    console.error('Delete AI suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete suggestion' },
      { status: 500 }
    )
  }
}
