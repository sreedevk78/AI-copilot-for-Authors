import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // For testing purposes, allow requests without authentication
    // In production, you would require proper authentication
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id || 'test-user-1'

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
      return NextResponse.json({ 
        success: false, 
        error: 'Name, description, genre, and setting are required' 
      }, { status: 400 })
    }

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
        userId: userId
      }
    })

    return NextResponse.json({
      success: true,
      data: world
    })

  } catch (error) {
    console.error('Error creating world:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create world' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // For testing purposes, allow requests without authentication
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id || 'test-user-1'

    const { searchParams } = new URL(request.url)
    const worldId = searchParams.get('worldId')

    if (worldId) {
      // Get specific world
      const world = await prisma.world.findFirst({
        where: { id: worldId, userId: userId }
      })

      if (!world) {
        return NextResponse.json({ 
          success: false, 
          error: 'World not found' 
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: world
      })
    } else {
      // Get all worlds for user
      const userWorlds = await prisma.world.findMany({
        where: { userId: userId }
      })

      return NextResponse.json({
        success: true,
        data: userWorlds
      })
    }

  } catch (error) {
    console.error('Error fetching worlds:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch worlds' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // For testing purposes, allow requests without authentication
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id || 'test-user-1'

    const { searchParams } = new URL(request.url)
    const worldId = searchParams.get('worldId')

    if (!worldId) {
      return NextResponse.json({ 
        success: false, 
        error: 'World ID is required' 
      }, { status: 400 })
    }

    // Delete world
    const deleted = await prisma.world.deleteMany({
      where: { id: worldId, userId: userId }
    })
    
    if (deleted.count === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'World not found or not authorized' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { message: 'World deleted successfully' }
    })

  } catch (error) {
    console.error('Error deleting world:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete world' 
    }, { status: 500 })
  }
}
