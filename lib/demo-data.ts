import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generateSlug } from './slug'

const DEMO_EMAIL = 'demo@example.com'
const DEMO_PASSWORD = 'demo123'
const DEMO_NAME = 'Demo User'
const DEMO_CAMPAIGN_TITLE = 'Q1 2024 Employee Satisfaction Survey'
const DEMO_CAMPAIGN_QUESTION =
  'What are the top 3 things we should improve to make your work experience better?'

const demoResponses = [
  {
    text: 'I love the flexible work hours and the supportive team culture. It really helps with work-life balance.',
    mood: '😀',
    sentiment: 'positive',
    status: 'resolved',
  },
  {
    text: 'The technical debt is really slowing us down. We need dedicated time to refactor and improve our tools.',
    mood: '😞',
    sentiment: 'negative',
    status: 'needs_attention',
  },
  {
    text: 'Onboarding for new hires could be more streamlined. It feels a bit chaotic and unorganized.',
    mood: '🙁',
    sentiment: 'negative',
    status: 'new',
  },
  {
    text: 'Communication between departments needs improvement. Sometimes we work in silos.',
    mood: '🙁',
    sentiment: 'negative',
    status: 'needs_attention',
  },
  {
    text: 'Appreciate the recent focus on mental health initiatives. It shows the company cares.',
    mood: '🙂',
    sentiment: 'positive',
    status: 'resolved',
  },
]

export interface DemoSeedResult {
  userId: string
  userEmail: string
  userCreated: boolean
  campaignId: string
  campaignSlug: string
  responsesAdded: number
  existingResponses: number
}

export async function createDemoCampaign(
  prisma: PrismaClient
): Promise<DemoSeedResult> {
  // Ensure demo user
  let demoUser = await prisma.user.findFirst({
    where: { email: DEMO_EMAIL },
  })

  let userCreated = false

  if (!demoUser) {
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10)
    demoUser = await prisma.user.create({
      data: {
        email: DEMO_EMAIL,
        name: DEMO_NAME,
        password: hashedPassword,
        role: 'hr',
      },
    })
    userCreated = true
  }

  if (!demoUser) {
    throw new Error('Failed to create or locate demo user')
  }

  const slug = generateSlug(DEMO_CAMPAIGN_TITLE)

  const campaign = await prisma.campaign.upsert({
    where: { slug },
    update: {
      title: DEMO_CAMPAIGN_TITLE,
      question: DEMO_CAMPAIGN_QUESTION,
      userId: demoUser.id,
      isActive: true,
      publicReportOn: false,
      aiReportGenerated: false,
      closeDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    create: {
      title: DEMO_CAMPAIGN_TITLE,
      slug,
      question: DEMO_CAMPAIGN_QUESTION,
      userId: demoUser.id,
      isActive: true,
      publicReportOn: false,
      aiReportGenerated: false,
      closeDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  })

  const existingResponses = await prisma.response.count({
    where: { campaignId: campaign.id },
  })

  let responsesAdded = 0

  if (existingResponses === 0) {
    for (const response of demoResponses) {
      await prisma.response.create({
        data: {
          campaignId: campaign.id,
          text: response.text,
          mood: response.mood,
          sentiment: response.sentiment,
          status: response.status,
          createdAt: new Date(
            Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
          ),
        },
      })
      responsesAdded += 1
    }
  }

  return {
    userId: demoUser.id,
    userEmail: demoUser.email,
    userCreated,
    campaignId: campaign.id,
    campaignSlug: campaign.slug ?? '',
    responsesAdded,
    existingResponses,
  }
}

