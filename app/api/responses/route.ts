import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { sendNewResponseTelegram } from '@/lib/telegram'

const createResponseSchema = z.object({
  campaignId: z.string(),
  text: z.string().min(1, 'Response text is required'),
  mood: z.enum(['😀', '🙂', '😐', '🙁', '😞']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createResponseSchema.parse(body)

    // Check if campaign exists and is active
    // Try to find by ID first, then by slug
    let campaign = await prisma.campaign.findUnique({
      where: { id: data.campaignId },
    })

    // If not found by ID, try by slug
    if (!campaign) {
      campaign = await prisma.campaign.findUnique({
        where: { slug: data.campaignId },
      })
    }

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (!campaign.isActive) {
      return NextResponse.json(
        { error: 'Campaign is closed' },
        { status: 400 }
      )
    }

    if (campaign.closeDate && new Date(campaign.closeDate) < new Date()) {
      return NextResponse.json(
        { error: 'Campaign is closed' },
        { status: 400 }
      )
    }

    // Simple sentiment analysis (can be enhanced with AI)
    const text = data.text.toLowerCase()
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
    
    const positiveWords = ['good', 'great', 'excellent', 'love', 'happy', 'amazing', 'wonderful', 'fantastic']
    const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'worst', 'horrible', 'frustrated', 'angry']
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length
    const negativeCount = negativeWords.filter(word => text.includes(word)).length
    
    if (positiveCount > negativeCount) sentiment = 'positive'
    else if (negativeCount > positiveCount) sentiment = 'negative'

    // Determine attention level
    let attention: 'urgent' | 'moderate' | 'positive' = 'moderate'
    if (sentiment === 'negative' || data.mood === '🙁' || data.mood === '😞') {
      attention = 'urgent'
    } else if (sentiment === 'positive' || data.mood === '😀' || data.mood === '🙂') {
      attention = 'positive'
    }

    // Auto-flag potential risks
    const riskKeywords = ['harassment', 'discrimination', 'bully', 'unsafe', 'illegal', 'violation']
    const hasRisk = riskKeywords.some(keyword => text.includes(keyword))
    const status = hasRisk ? 'needs_attention' : 'new'

    // Auto-categorize with AI if available
    let aiLabels: any = null
    if (process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = (await import('openai')).default
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        
        const completion = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that categorizes employee feedback. Return only JSON with categories array.',
            },
            {
              role: 'user',
              content: `Categorize this feedback into 1-3 relevant categories (e.g., "workplace culture", "communication", "tools", "work-life balance", "compensation", "management", "team dynamics"). Return JSON: {"categories": ["category1", "category2"]}\n\nFeedback: ${data.text}`,
            },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        })

        const aiContent = completion.choices[0]?.message?.content
        if (aiContent) {
          try {
            const aiData = JSON.parse(aiContent)
            aiLabels = {
              categories: aiData.categories || [],
              autoCategorized: true,
              categorizedAt: new Date().toISOString(),
            }
          } catch {}
        }
      } catch (error) {
        console.error('Error auto-categorizing response:', error)
        // Continue without AI categorization
      }
    }

    const response = await prisma.response.create({
      data: {
        campaignId: data.campaignId,
        text: data.text,
        mood: data.mood,
        sentiment,
        attention,
        status,
        aiLabels: aiLabels ? JSON.stringify(aiLabels) : null,
      },
      include: {
        campaign: {
          include: {
            user: true,
          },
        },
      },
    })

    // Send notifications
    const campaignWithUser = await prisma.campaign.findUnique({
      where: { id: campaign.id },
      include: { user: true },
    })

    if (campaignWithUser?.user) {
      const user = campaignWithUser.user
      const preferences = user.notificationPreferences 
        ? JSON.parse(user.notificationPreferences) 
        : { telegram: true }

      // Telegram notification
      if (preferences.telegram && user.telegramChatId) {
        sendNewResponseTelegram({
          chatId: user.telegramChatId,
          campaignTitle: campaign.title,
          responseText: response.text,
          campaignId: campaign.id,
        }).catch(err => console.error('Error sending Telegram notification:', err))
      }
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating response:', error)
    return NextResponse.json(
      { error: 'Failed to create response' },
      { status: 500 }
    )
  }
}

