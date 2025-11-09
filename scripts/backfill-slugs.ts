import { PrismaClient } from '@prisma/client'
import { generateSlug, ensureUniqueSlug } from '../lib/slug'

const prisma = new PrismaClient()

async function backfillSlugs() {
  try {
    console.log('Starting slug backfill...')
    
    // Get all campaigns without slugs
    const campaigns = await prisma.campaign.findMany({
      where: {
        slug: null,
      },
    })

    console.log(`Found ${campaigns.length} campaigns without slugs`)

    // Get all existing slugs
    const existingCampaigns = await prisma.campaign.findMany({
      where: {
        slug: { not: null },
      },
      select: { slug: true },
    })
    const existingSlugs = existingCampaigns.map(c => c.slug!).filter(Boolean)

    // Generate slugs for each campaign
    for (const campaign of campaigns) {
      const baseSlug = generateSlug(campaign.title)
      const slug = ensureUniqueSlug(baseSlug, existingSlugs)
      
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { slug },
      })

      existingSlugs.push(slug)
      console.log(`Updated campaign "${campaign.title}" with slug: ${slug}`)
    }

    console.log('Slug backfill completed!')
  } catch (error) {
    console.error('Error backfilling slugs:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

backfillSlugs()

