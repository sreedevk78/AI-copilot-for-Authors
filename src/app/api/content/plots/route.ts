import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { name, description, plotPoints, genre, theme, structure } = await request.json()

    if (!name || !description || !plotPoints) {
      return NextResponse.json(
        { error: 'Name, description, and plot points are required' },
        { status: 400 }
      )
    }

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

    // Create plot record
    const plot = await prisma.savedPlot.create({
      data: {
        title: name,
        description,
        structure: structure || 'Three-Act Structure',
        genre: genre || 'General',
        theme: theme || 'Adventure',
        plotPoints: JSON.stringify(plotPoints),
        userId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      plot
    })

  } catch (error) {
    console.error('Plot save error:', error)
    return NextResponse.json(
      { error: 'Failed to save plot' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const plots = await prisma.savedPlot.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: plots
    })

  } catch (error) {
    console.error('Get plots error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plots' },
      { status: 500 }
    )
  }
}
