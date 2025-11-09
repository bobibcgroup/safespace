import { NextRequest, NextResponse } from 'next/server'
import { generateAIReport } from '@/lib/ai'

// Increase timeout for AI report generation (up to 5 minutes)
export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    console.log('[AI Generate] Starting report generation...')
    const body = await request.json()
    const { campaignId } = body

    if (!campaignId) {
      console.error('[AI Generate] Missing campaign ID')
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    console.log('[AI Generate] Campaign ID:', campaignId)
    console.log('[AI Generate] Calling generateAIReport...')
    
    const report = await generateAIReport(campaignId)

    console.log('[AI Generate] Report generated successfully')
    console.log('[AI Generate] Report keys:', Object.keys(report))
    
    // Ensure we return valid JSON
    try {
      const jsonString = JSON.stringify(report)
      console.log('[AI Generate] JSON stringified successfully, length:', jsonString.length)
      return NextResponse.json(report)
    } catch (stringifyError) {
      console.error('[AI Generate] Failed to stringify report:', stringifyError)
      throw new Error('Failed to serialize report data')
    }
  } catch (error: any) {
    console.error('[AI Generate] Error generating AI report:', error)
    console.error('[AI Generate] Error stack:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI report' },
      { status: 500 }
    )
  }
}

