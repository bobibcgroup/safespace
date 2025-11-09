import { PrismaClient } from '@prisma/client'
import { generateAIReport } from '../lib/ai'

const prisma = new PrismaClient()

async function main() {
  console.log('🤖 Generating AI report for dummy campaign...\n')

  // Find the dummy campaign
  const campaign = await prisma.campaign.findFirst({
    where: { slug: 'q1-2024-team-satisfaction-survey' },
    include: {
      responses: true,
    },
  })

  if (!campaign) {
    console.error('❌ Dummy campaign not found. Please run seed-dummy-campaign.ts first.')
    process.exit(1)
  }

  console.log(`📊 Campaign: ${campaign.title}`)
  console.log(`📝 Question: ${campaign.question}`)
  console.log(`💬 Responses: ${campaign.responses.length}\n`)

  try {
    const report = await generateAIReport(campaign.id)
    
    console.log('✅ AI Report Generated Successfully!\n')
    console.log('=' .repeat(80))
    console.log('📋 EXECUTIVE SUMMARY')
    console.log('=' .repeat(80))
    console.log(report.summary)
    console.log('\n')

    console.log('=' .repeat(80))
    console.log('📊 SENTIMENT ANALYSIS')
    console.log('=' .repeat(80))
    console.log(`Positive: ${report.sentiment.positive}%`)
    console.log(`Neutral: ${report.sentiment.neutral}%`)
    console.log(`Negative: ${report.sentiment.negative}%`)
    if (report.sentiment.trend) {
      console.log(`Trend: ${report.sentiment.trend}`)
    }
    if (report.sentiment.insights) {
      console.log(`Insights: ${report.sentiment.insights}`)
    }
    console.log('\n')

    console.log('=' .repeat(80))
    console.log('🎯 KEY THEMES')
    console.log('=' .repeat(80))
    report.themes.forEach((theme, i) => {
      console.log(`\n${i + 1}. ${theme.keyword} (${theme.count} mentions)`)
      console.log(`   ${theme.description}`)
      if (theme.sentiment) {
        console.log(`   Sentiment: ${theme.sentiment}`)
      }
      if (theme.urgency) {
        console.log(`   Urgency: ${theme.urgency}`)
      }
    })
    console.log('\n')

    console.log('=' .repeat(80))
    console.log('💡 CRITICAL INSIGHTS')
    console.log('=' .repeat(80))
    report.highlights.forEach((highlight, i) => {
      console.log(`\n${i + 1}. ${highlight.title}`)
      console.log(`   ${highlight.description}`)
      if (highlight.impact) {
        console.log(`   Impact: ${highlight.impact}`)
      }
      if (highlight.sentiment) {
        console.log(`   Sentiment: ${highlight.sentiment}`)
      }
    })
    console.log('\n')

    if (report.recommendations && report.recommendations.length > 0) {
      console.log('=' .repeat(80))
      console.log('🎯 RECOMMENDATIONS')
      console.log('=' .repeat(80))
      report.recommendations.forEach((rec, i) => {
        console.log(`\n${i + 1}. ${rec.title} [Priority: ${rec.priority}]`)
        console.log(`   ${rec.description}`)
        console.log(`   Expected Impact: ${rec.impact}`)
      })
      console.log('\n')
    } else if (report.suggestions && report.suggestions.length > 0) {
      console.log('=' .repeat(80))
      console.log('💡 SUGGESTIONS')
      console.log('=' .repeat(80))
      report.suggestions.forEach((suggestion, i) => {
        console.log(`${i + 1}. ${suggestion}`)
      })
      console.log('\n')
    }

    if (report.trends) {
      console.log('=' .repeat(80))
      console.log('📈 TREND ANALYSIS')
      console.log('=' .repeat(80))
      if (report.trends.pattern) {
        console.log(`Pattern: ${report.trends.pattern}`)
      }
      if (report.trends.direction) {
        console.log(`Direction: ${report.trends.direction}`)
      }
      console.log('\n')
    }

    if (report.risks && report.risks.length > 0) {
      console.log('=' .repeat(80))
      console.log('⚠️  RISK INDICATORS')
      console.log('=' .repeat(80))
      report.risks.forEach((risk, i) => {
        console.log(`\n${i + 1}. ${risk.issue} [Severity: ${risk.severity}]`)
        console.log(`   ${risk.description}`)
      })
      console.log('\n')
    }

    console.log('=' .repeat(80))
    console.log('📊 PARTICIPATION METRICS')
    console.log('=' .repeat(80))
    console.log(`Total Responses: ${report.participation.totalResponses}`)
    console.log(`Average Length: ${report.participation.averageLength} characters`)
    if (report.participation.engagementQuality) {
      console.log(`Engagement Quality: ${report.participation.engagementQuality}`)
    }
    if (report.participation.insights) {
      console.log(`Insights: ${report.participation.insights}`)
    }
    console.log('\n')

    console.log('=' .repeat(80))
    console.log('💬 REPRESENTATIVE QUOTES')
    console.log('=' .repeat(80))
    report.quotes.forEach((quote, i) => {
      console.log(`\n${i + 1}. [${quote.sentiment.toUpperCase()}]`)
      console.log(`   "${quote.text}"`)
      if (quote.theme) {
        console.log(`   Theme: ${quote.theme}`)
      }
    })
    console.log('\n')

    console.log('✅ Report generation complete!')
    console.log(`\n🔗 View in app: /campaigns/${campaign.id}/report`)

  } catch (error) {
    console.error('❌ Error generating report:', error)
    process.exit(1)
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })

