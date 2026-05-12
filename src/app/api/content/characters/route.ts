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

    const { name, role, age, description, personality, backstory, motivation, appearance, skills, flaws, relationships } = await request.json()

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
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

    // Create character record
    const character = await prisma.savedCharacter.create({
      data: {
        name,
        role: role || 'Supporting Character',
        age: age || null,
        description,
        personality: JSON.stringify(personality || []),
        backstory: backstory || '',
        motivation: motivation || '',
        appearance: appearance || '',
        skills: JSON.stringify(skills || []),
        flaws: JSON.stringify(flaws || []),
        relationships: JSON.stringify(relationships || []),
        userId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      character
    })

  } catch (error) {
    console.error('Character save error:', error)
    return NextResponse.json(
      { error: 'Failed to save character' },
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

    const characters = await prisma.savedCharacter.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: characters
    })

  } catch (error) {
    console.error('Get characters error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
      { status: 500 }
    )
  }
}
