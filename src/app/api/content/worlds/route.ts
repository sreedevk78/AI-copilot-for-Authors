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

    const { 
      name, 
      description, 
      genre, 
      setting, 
      timePeriod, 
      magicSystem, 
      technologyLevel, 
      politicalSystem, 
      culture, 
      geography, 
      history, 
      rules, 
      characters 
    } = await request.json()

    if (!name || !description || !genre || !setting) {
      return NextResponse.json(
        { error: 'Name, description, genre, and setting are required' },
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

    // Create world record
    const world = await prisma.world.create({
      data: {
        name,
        description,
        genre,
        setting,
        timePeriod: timePeriod || null,
        magicSystem: magicSystem || null,
        technologyLevel: technologyLevel || null,
        politicalSystem: politicalSystem || null,
        culture: culture || null,
        geography: geography || null,
        history: history || null,
        rules: rules ? JSON.stringify(rules) : null,
        characters: characters ? JSON.stringify(characters) : null,
        userId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      world
    })

  } catch (error) {
    console.error('World creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create world' },
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const worldId = searchParams.get('id') || searchParams.get('worldId')

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

    if (worldId) {
      const world = await prisma.world.findFirst({
        where: { id: worldId, userId: user.id }
      })

      if (!world) {
        return NextResponse.json(
          { error: 'World not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: world
      })
    }

    const worlds = await prisma.world.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return NextResponse.json({
      success: true,
      data: worlds
    })

  } catch (error) {
    console.error('Get worlds error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch worlds' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const worldId = searchParams.get('id') || searchParams.get('worldId')

    if (!worldId) {
      return NextResponse.json(
        { error: 'World ID is required' },
        { status: 400 }
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

    const deleted = await prisma.world.deleteMany({
      where: { id: worldId, userId: user.id }
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'World not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'World deleted successfully'
    })
  } catch (error) {
    console.error('Delete world error:', error)
    return NextResponse.json(
      { error: 'Failed to delete world' },
      { status: 500 }
    )
  }
}
