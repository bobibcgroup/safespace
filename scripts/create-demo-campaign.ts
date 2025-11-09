import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generateSlug } from '../lib/slug'

const prisma = new PrismaClient()

async function main() {
  console.log('🎯 Creating demo campaign...')

  // Find or create a demo user
  let demoUser = await prisma.user.findFirst({
    where: { email: 'demo@example.com' },
  })

  if (!demoUser) {
    const hashedPassword = await bcrypt.hash('demo123', 10)
    demoUser = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        name: 'Demo User',
        password: hashedPassword,
        role: 'hr',
      },
    })
    console.log('✅ Created demo user')
  } else {
    console.log('✅ Using existing demo user')
  }

  // Create a demo campaign
  const campaignTitle = 'Q1 2024 Employee Satisfaction Survey'
  const campaignQuestion = 'What are the top 3 things we should improve to make your work experience better?'
  const campaignSlug = generateSlug(campaignTitle)

  const demoCampaign = await prisma.campaign.upsert({
    where: { slug: campaignSlug },
    update: {
      title: campaignTitle,
      question: campaignQuestion,
      userId: demoUser.id,
      isActive: true,
      publicReportOn: false,
      aiReportGenerated: false,
      closeDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    },
    create: {
      title: campaignTitle,
      slug: campaignSlug,
      question: campaignQuestion,
      userId: demoUser.id,
      isActive: true,
      publicReportOn: false,
      aiReportGenerated: false,
      closeDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    },
  })
  console.log(`✅ Created/Updated campaign: ${demoCampaign.title}`)

  // Create some demo responses
  const responsesData = [
    { text: "I love the flexible work hours and the supportive team culture. It really helps with work-life balance.", mood: "😀", sentiment: "positive", status: "resolved" },
    { text: "The technical debt is really slowing us down. We need dedicated time to refactor and improve our tools.", mood: "😞", sentiment: "negative", status: "needs_attention" },
    { text: "Onboarding for new hires could be more streamlined. It feels a bit chaotic and unorganized.", mood: "🙁", sentiment: "negative", status: "new" },
    { text: "Communication between departments needs improvement. Sometimes we work in silos.", mood: "🙁", sentiment: "negative", status: "needs_attention" },
    { text: "Appreciate the recent focus on mental health initiatives. It shows the company cares.", mood: "🙂", sentiment: "positive", status: "resolved" },
  ]

  // Check existing responses
  const existingResponses = await prisma.response.count({
    where: { campaignId: demoCampaign.id },
  })

  if (existingResponses === 0) {
    for (const responseData of responsesData) {
      await prisma.response.create({
        data: {
          campaignId: demoCampaign.id,
          text: responseData.text,
          mood: responseData.mood,
          sentiment: responseData.sentiment,
          status: responseData.status,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last 7 days
        },
      })
    }
    console.log(`✅ Created ${responsesData.length} demo responses`)
  } else {
    console.log(`ℹ️  Campaign already has ${existingResponses} responses`)
  }

  console.log('\n📊 Campaign Details:')
  console.log(`   ID: ${demoCampaign.id}`)
  console.log(`   Slug: ${demoCampaign.slug}`)
  console.log(`   Owner: ${demoUser.email} (${demoUser.name})`)
  console.log(`   User ID: ${demoUser.id}`)
  console.log('\n✨ Demo campaign ready for testing!')
  console.log(`\n💡 To test user deletion:`)
  console.log(`   1. Go to /admin/users`)
  console.log(`   2. Try to delete the demo user (${demoUser.email})`)
  console.log(`   3. You'll be asked to reassign the campaign to another user`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

