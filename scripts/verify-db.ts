import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DIRECT_URL,
})
console.log('Using DIRECT_URL for verification')

async function main() {
  console.log('🔌 Connecting to database...')
  try {
    await prisma.$connect()
    console.log('✅ Connected successfully!')

    console.log('📝 Creating test user...')
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        role: 'ADMIN',
      },
    })
    console.log('✅ Created user:', user.id)

    console.log('📖 Reading user back...')
    const readUser = await prisma.user.findUnique({
      where: { id: user.id },
    })
    console.log('✅ Read user:', readUser?.email)

    console.log('🗑️ Cleaning up...')
    await prisma.user.delete({
      where: { id: user.id },
    })
    console.log('✅ Cleanup complete!')

  } catch (e) {
    console.error('❌ Database error:', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
