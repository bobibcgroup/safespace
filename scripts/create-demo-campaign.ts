import { PrismaClient } from '@prisma/client'
import { createDemoCampaign } from '../lib/demo-data'

async function main() {
  const prisma = new PrismaClient()

  console.log('🎯 Creating demo campaign...')
  try {
    const result = await createDemoCampaign(prisma)

    console.log('✅ Demo user ready')
    console.log(`   Email: ${result.userEmail}`)
    console.log(`   User Created: ${result.userCreated ? 'yes' : 'no (already existed)'}`)
    console.log(`\n✅ Demo campaign ready`)
    console.log(`   ID: ${result.campaignId}`)
    console.log(`   Slug: ${result.campaignSlug}`)
    console.log(`   Responses added: ${result.responsesAdded}`)
    console.log(`   Existing responses: ${result.existingResponses}`)
    console.log('\n✨ Demo campaign ready for testing!')
  } catch (error) {
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
