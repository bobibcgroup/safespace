import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function processSchedules() {
  try {
    const now = new Date()

    // Activate campaigns that should start now
    await prisma.campaign.updateMany({
      where: {
        startDate: {
          lte: now,
        },
        isActive: false,
      },
      data: {
        isActive: true,
      },
    })

    // Deactivate campaigns that should close now
    await prisma.campaign.updateMany({
      where: {
        closeDate: {
          lte: now,
        },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    })

    // Handle recurring campaigns
    const recurringCampaigns = await prisma.campaign.findMany({
      where: {
        isRecurring: true,
        isActive: false,
        closeDate: {
          lte: now,
        },
      },
    })

    for (const campaign of recurringCampaigns) {
      if (!campaign.recurringInterval) continue

      let nextStartDate = new Date(campaign.closeDate || campaign.createdAt)
      
      switch (campaign.recurringInterval) {
        case 'weekly':
          nextStartDate.setDate(nextStartDate.getDate() + 7)
          break
        case 'monthly':
          nextStartDate.setMonth(nextStartDate.getMonth() + 1)
          break
        case 'quarterly':
          nextStartDate.setMonth(nextStartDate.getMonth() + 3)
          break
      }

      // Update campaign for next cycle
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          startDate: nextStartDate,
          closeDate: null,
          isActive: nextStartDate <= now,
        },
      })
    }

    console.log(`Processed ${recurringCampaigns.length} recurring campaigns`)
  } catch (error) {
    console.error('Error processing schedules:', error)
  } finally {
    await prisma.$disconnect()
  }
}

processSchedules()

