import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create demo user with hashed password
  const hashedPassword = await bcrypt.hash('demo123', 10)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {
      password: hashedPassword // Update password if it exists
    },
    create: {
      email: 'demo@example.com',
      name: 'Demo Writer',
      password: hashedPassword,
      subscriptionTier: 'FREE',
      bio: 'A passionate writer exploring new creative possibilities with AI assistance.',
      writingStyle: JSON.stringify({
        tone: 'conversational',
        pace: 'moderate',
        vocabulary: 'accessible',
        sentenceStructure: 'varied'
      })
    }
  })

  // Create some demo stories
  const story1 = await prisma.story.upsert({
    where: { id: 'demo-story-1' },
    update: {},
    create: {
      id: 'demo-story-1',
      title: 'The Last Library',
      description: 'In a world where physical books are forbidden, a librarian discovers a hidden collection that could change everything.',
      genre: 'Science Fiction',
      status: 'DRAFT',
      wordCount: 2500,
      targetWordCount: 10000,
      authorId: demoUser.id,
      tags: JSON.stringify(['dystopian', 'books', 'freedom']),
      isPublic: false
    }
  })

  const story2 = await prisma.story.upsert({
    where: { id: 'demo-story-2' },
    update: {},
    create: {
      id: 'demo-story-2',
      title: 'Whispers in the Wind',
      description: 'A young woman discovers she can hear the thoughts of the dead through the wind.',
      genre: 'Fantasy',
      status: 'IN_PROGRESS',
      wordCount: 8000,
      targetWordCount: 80000,
      authorId: demoUser.id,
      tags: JSON.stringify(['supernatural', 'mystery', 'family']),
      isPublic: true
    }
  })

  // Create some demo characters
  await prisma.character.upsert({
    where: { id: 'demo-character-1' },
    update: {},
    create: {
      id: 'demo-character-1',
      name: 'Elena Martinez',
      role: 'Protagonist',
      age: 28,
      description: 'A determined librarian with a rebellious streak and a love for preserving knowledge.',
      personality: JSON.stringify(['Curious', 'brave', 'empathetic']),
      backstory: 'Grew up in the underground book preservation movement.',
      storyId: story1.id
    }
  })

  await prisma.character.upsert({
    where: { id: 'demo-character-2' },
    update: {},
    create: {
      id: 'demo-character-2',
      name: 'Sofia Chen',
      role: 'Protagonist',
      age: 22,
      description: 'A sensitive artist who recently discovered her supernatural ability.',
      personality: JSON.stringify(['Intuitive', 'creative', 'conflicted']),
      backstory: 'Lost her grandmother and began hearing voices shortly after.',
      storyId: story2.id
    }
  })

  // Create some demo AI generations
  await prisma.aIGeneration.upsert({
    where: { id: 'demo-generation-1' },
    update: {},
    create: {
      id: 'demo-generation-1',
      type: 'STORY_IDEA',
      prompt: 'Generate a dystopian story about books',
      generatedContent: 'In a world where physical books are forbidden, a librarian discovers a hidden collection that could change everything.',
      model: 'gpt-3.5-turbo',
      userId: demoUser.id,
      storyId: story1.id
    }
  })

  console.log('Demo data seeded successfully!')
  console.log('Demo user:', demoUser.email)
  console.log('Demo stories created:', 2)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
