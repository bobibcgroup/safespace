import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { campaignId, responseId } = body

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    // Fetch response or campaign responses
    let responses: any[] = []
    if (responseId) {
      const response = await prisma.response.findUnique({
        where: { id: responseId },
      })
      if (response) responses = [response]
    } else {
      responses = await prisma.response.findMany({
        where: { campaignId },
        orderBy: { createdAt: 'desc' },
        take: 20, // Limit for AI analysis
      })
    }

    if (responses.length === 0) {
      return NextResponse.json(
        { error: 'No responses found' },
        { status: 404 }
      )
    }

    // Prepare prompt for AI
    const responseTexts = responses.map(r => r.text).join('\n\n')
    const prompt = `Based on the following employee feedback responses, suggest 3-5 specific, actionable action items that would address the concerns or build on the positive feedback. Each action item should have:
- A clear, concise title
- A brief description of what needs to be done
- An estimated priority (high, medium, low)

Feedback responses:
${responseTexts}

Return ONLY valid JSON in this format:
{
  "actionItems": [
    {
      "title": "string",
      "description": "string",
      "priority": "high" | "medium" | "low"
    }
  ],
  "categories": ["string"] // Auto-categorize the feedback into 2-4 main categories
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that analyzes employee feedback and suggests actionable improvements. Always return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    // Parse AI response
    let cleanedContent = content.trim()
    if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleanedContent = jsonMatch[0]
    }

    const aiData = JSON.parse(cleanedContent)

    // Update response with categories if single response
    if (responseId && aiData.categories && aiData.categories.length > 0) {
      await prisma.response.update({
        where: { id: responseId },
        data: {
          aiLabels: JSON.stringify({
            categories: aiData.categories,
            suggestedAt: new Date().toISOString(),
          }),
        },
      })
    }

    return NextResponse.json(aiData)
  } catch (error: any) {
    console.error('Error generating AI suggestions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI suggestions' },
      { status: 500 }
    )
  }
}

