import OpenAI from 'openai'
import { prisma } from './db'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

if (!process.env.OPENAI_API_KEY) {
  console.warn('[AI] WARNING: OPENAI_API_KEY is not set. AI report generation will fail.')
}

export interface AIReportData {
  summary: string
  sentiment: {
    positive: number
    neutral: number
    negative: number
    trend?: 'improving' | 'declining' | 'stable'
    insights?: string
    drivers?: {
      positive: string[]
      negative: string[]
    }
    intensity?: {
      strong: number
      moderate: number
      mild: number
    }
  }
  themes: Array<{ 
    keyword: string
    description: string
    count: number
    sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed'
    urgency?: 'high' | 'medium' | 'low'
    sentimentBreakdown?: {
      positive: number
      neutral: number
      negative: number
    }
    relatedThemes?: string[]
    recommendedAction?: string
  }>
  highlights: Array<{ 
    title: string
    description: string
    impact?: 'high' | 'medium' | 'low'
    sentiment?: 'positive' | 'neutral' | 'negative'
    evidence?: string[]
  }>
  quotes: Array<{ 
    text: string
    sentiment: string
    theme?: string
    intensity?: 'strong' | 'moderate' | 'mild'
  }>
  recommendations?: Array<{
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    impact: 'high' | 'medium' | 'low'
    effort: 'high' | 'medium' | 'low'
    timeline?: string
    successMetrics?: string[]
    resources?: string[]
    dependencies?: string[]
  }>
  suggestions?: Array<string> // Legacy support
  trends?: {
    pattern?: string
    direction?: 'improving' | 'declining' | 'stable' | 'mixed'
    temporalPatterns?: string
    prediction?: string
  }
  risks?: Array<{
    issue: string
    severity: 'high' | 'medium' | 'low'
    description: string
    impact?: string
    mitigation?: string[]
    timeline?: string
  }>
  participation: {
    totalResponses: number
    averageLength: number
    engagementQuality?: 'high' | 'medium' | 'low'
    insights?: string
    moodBreakdown?: Record<string, number>
    responseRate?: number
    detailedResponses?: number
    actionableFeedback?: number
  }
  comparative?: {
    vsLastQuarter?: {
      sentimentChange?: number
      themes?: string[]
    }
    vsIndustry?: {
      strengths?: string[]
      weaknesses?: string[]
    }
  }
  actionPlan?: {
    quickWins?: Array<{
      title: string
      description: string
      impact: string
      effort: string
      timeline: string
    }>
    shortTerm?: Array<{
      title: string
      description: string
      timeline: string
    }>
    longTerm?: Array<{
      title: string
      description: string
      timeline: string
    }>
  }
}

export async function generateAIReport(campaignId: string): Promise<AIReportData> {
  console.log('[AI] Starting report generation for campaign:', campaignId)
  
  // Fetch all responses for this campaign
  console.log('[AI] Fetching responses...')
  const responses = await prisma.response.findMany({
    where: { campaignId },
    orderBy: { createdAt: 'desc' },
  })

  console.log('[AI] Found', responses.length, 'responses')

  if (responses.length === 0) {
    throw new Error('No responses found for this campaign')
  }

  // Prepare data for AI analysis
  const responseTexts = responses.map(r => ({
    text: r.text,
    mood: r.mood || 'neutral',
    sentiment: r.sentiment || 'neutral',
    createdAt: r.createdAt.toISOString(),
  }))

  // Calculate response statistics for context
  const totalLength = responses.reduce((sum, r) => sum + r.text.length, 0)
  const avgLength = Math.round(totalLength / responses.length)
  const sentimentCounts = {
    positive: responses.filter(r => r.sentiment === 'positive').length,
    neutral: responses.filter(r => r.sentiment === 'neutral').length,
    negative: responses.filter(r => r.sentiment === 'negative').length,
  }
  const detailedResponses = responses.filter(r => r.text.length > 200).length
  const actionableFeedback = responses.filter(r => 
    r.text.toLowerCase().includes('should') || 
    r.text.toLowerCase().includes('need') || 
    r.text.toLowerCase().includes('suggest') ||
    r.text.toLowerCase().includes('recommend')
  ).length

  // Import and use enhanced prompt
  console.log('[AI] Building enhanced prompt...')
  const { buildEnhancedPrompt } = await import('./ai-enhanced-prompt')
  const prompt = buildEnhancedPrompt(responseTexts, responses.length, avgLength, sentimentCounts)
  console.log('[AI] Prompt length:', prompt.length, 'characters')

  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment variables.')
    }

    console.log('[AI] Calling OpenAI API...')
    console.log('[AI] Model: gpt-4o, Max tokens: 4000')
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Updated to current model
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR analyst specializing in employee feedback analysis. Provide comprehensive, actionable insights. Always return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 4000, // Model supports up to 4096, using 4000 for safety
    })

    console.log('[AI] OpenAI API call completed')
    console.log('[AI] Usage:', completion.usage ? JSON.stringify(completion.usage) : 'N/A')
    
    const content = completion.choices[0]?.message?.content
    if (!content) {
      console.error('[AI] No content in response')
      throw new Error('No response from AI')
    }
    
    console.log('[AI] Response content length:', content.length, 'characters')
    console.log('[AI] Response preview:', content.substring(0, 200))

    // Clean the content - remove any markdown code blocks or extra text
    let cleanedContent = content.trim()
    
    // Remove markdown code blocks if present (handle multiple formats)
    if (cleanedContent.startsWith('```')) {
      // Remove opening ```json or ```
      cleanedContent = cleanedContent.replace(/^```(?:json|JSON)?\s*\n?/, '')
      // Remove closing ```
      cleanedContent = cleanedContent.replace(/\n?```\s*$/, '')
      cleanedContent = cleanedContent.trim()
    }
    
    // Remove any leading/trailing whitespace or newlines
    cleanedContent = cleanedContent.trim()
    
    // If content doesn't start with {, try to find JSON object
    if (!cleanedContent.startsWith('{')) {
      // Try to extract JSON object from the content
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanedContent = jsonMatch[0]
        console.log('[AI] Extracted JSON from wrapped content')
      } else {
        // If still no JSON found, log the issue
        console.error('[AI] Content does not contain valid JSON object')
        console.error('[AI] First 500 chars:', cleanedContent.substring(0, 500))
        throw new Error('AI response does not contain valid JSON. Response may be incomplete or malformed.')
      }
    }

    console.log('[AI] Parsing JSON response...')
    console.log('[AI] Cleaned content preview:', cleanedContent.substring(0, 200))
    
    let reportData: AIReportData
    try {
      reportData = JSON.parse(cleanedContent) as AIReportData
      console.log('[AI] JSON parsed successfully')
    } catch (parseError) {
      console.error('[AI] Failed to parse AI response')
      console.error('[AI] Parse error:', parseError)
      console.error('[AI] Parse error details:', parseError instanceof Error ? parseError.message : 'Unknown')
      console.error('[AI] Content length:', cleanedContent.length)
      console.error('[AI] Content start:', cleanedContent.substring(0, 300))
      console.error('[AI] Content end:', cleanedContent.substring(Math.max(0, cleanedContent.length - 300)))
      
      // Try to find where the JSON breaks
      try {
        // Try to parse just the first part to see where it breaks
        const testParse = JSON.parse(cleanedContent.substring(0, Math.min(1000, cleanedContent.length)))
        console.log('[AI] Partial parse successful, issue is later in the content')
      } catch (e) {
        console.error('[AI] Even partial parse failed')
      }
      
      throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. The response may be incomplete or contain invalid JSON.`)
    }

    // Calculate actual participation metrics
    reportData.participation.totalResponses = responses.length
    reportData.participation.averageLength = avgLength
    reportData.participation.detailedResponses = detailedResponses
    reportData.participation.actionableFeedback = actionableFeedback

    // Calculate mood breakdown if available
    const moodCounts: Record<string, number> = {}
    responses.forEach(r => {
      if (r.mood) {
        moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1
      }
    })
    reportData.participation.moodBreakdown = moodCounts

    // Ensure backward compatibility
    if (!reportData.recommendations && reportData.suggestions) {
      reportData.recommendations = reportData.suggestions.map((s: string) => ({
        title: s,
        description: s,
        priority: 'medium' as const,
        impact: 'medium' as const,
        effort: 'medium' as const,
        timeline: '1-3 months',
        successMetrics: ['Improved satisfaction'],
        resources: [],
        dependencies: [],
      }))
    }

    // Save report to database (store all new fields in suggestions field as JSON for now)
    // In future, we can add separate fields to AIReport model
    const reportDataForStorage = {
      ...reportData,
      recommendations: reportData.recommendations || reportData.suggestions || [],
      risks: reportData.risks || [],
      trends: reportData.trends || null,
      actionPlan: reportData.actionPlan || null,
      comparative: reportData.comparative || null,
    }

    await prisma.aIReport.upsert({
      where: { campaignId },
      create: {
        campaignId,
        summary: reportData.summary,
        sentiment: JSON.stringify(reportData.sentiment),
        themes: JSON.stringify(reportData.themes),
        highlights: JSON.stringify(reportData.highlights),
        quotes: JSON.stringify(reportData.quotes),
        suggestions: JSON.stringify(reportDataForStorage),
        participation: JSON.stringify(reportData.participation),
      },
      update: {
        summary: reportData.summary,
        sentiment: JSON.stringify(reportData.sentiment),
        themes: JSON.stringify(reportData.themes),
        highlights: JSON.stringify(reportData.highlights),
        quotes: JSON.stringify(reportData.quotes),
        suggestions: JSON.stringify(reportDataForStorage),
        participation: JSON.stringify(reportData.participation),
        updatedAt: new Date(),
      },
    })

    // Mark campaign as having AI report generated
    console.log('[AI] Saving report to database...')
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { aiReportGenerated: true },
    })

    console.log('[AI] Report generation complete!')
    return reportData
  } catch (error) {
    console.error('[AI] Error generating AI report:', error)
    if (error instanceof Error) {
      console.error('[AI] Error message:', error.message)
      console.error('[AI] Error stack:', error.stack)
    }
    throw error
  }
}

