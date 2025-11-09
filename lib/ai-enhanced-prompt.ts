// Enhanced AI prompt for comprehensive report generation

export function buildEnhancedPrompt(
  responseTexts: Array<{ text: string; mood: string; sentiment: string }>,
  totalResponses: number,
  avgLength: number,
  sentimentCounts: { positive: number; neutral: number; negative: number }
) {
  return `You are an expert HR analyst specializing in employee feedback analysis. Provide a comprehensive, actionable analysis of the following feedback.

CAMPAIGN CONTEXT:
- Total Responses: ${totalResponses}
- Average Response Length: ${avgLength} characters
- Sentiment Distribution: ${sentimentCounts.positive} positive, ${sentimentCounts.neutral} neutral, ${sentimentCounts.negative} negative

ANALYZE THE FOLLOWING RESPONSES AND PROVIDE:

1. **Executive Summary** (3-4 sentences): High-level overview, key patterns, overall sentiment, and critical takeaways

2. **Enhanced Sentiment Analysis**:
   - Sentiment breakdown with percentages (positive, neutral, negative)
   - Sentiment trend (improving/declining/stable) based on response patterns
   - Sentiment insights (2-3 sentences about sentiment patterns)
   - Sentiment drivers: Top 3-5 factors driving positive sentiment, top 3-5 driving negative sentiment
   - Sentiment intensity: Percentage breakdown of strong, moderate, and mild sentiment

3. **Advanced Theme Analysis** (5-7 themes):
   - Keyword/phrase for each theme
   - Detailed description (2-3 sentences)
   - Frequency count
   - Sentiment associated with this theme (positive/neutral/negative/mixed)
   - Sentiment breakdown per theme (percentages)
   - Urgency level (high/medium/low) based on frequency, sentiment, and impact
   - Related themes (which other themes are often mentioned together)
   - Recommended action for each theme

4. **Critical Insights** (4-6 highlights):
   - Title (actionable insight)
   - Detailed description (3-4 sentences)
   - Impact level (high/medium/low)
   - Associated sentiment
   - Evidence (2-3 specific quotes or data points supporting this insight)

5. **Prioritized Recommendations** (5-7 recommendations):
   - Title
   - Detailed description
   - Priority (high/medium/low)
   - Impact level (high/medium/low)
   - Effort required (high/medium/low)
   - Timeline estimate (e.g., "1-2 weeks", "1-3 months")
   - Success metrics (2-3 measurable outcomes)
   - Resources needed (team, budget, tools)
   - Dependencies (what needs to happen first)

6. **Action Plan**:
   - Quick Wins (2-3 high-impact, low-effort actions with timeline)
   - Short-term Actions (2-3 actions for 1-3 months)
   - Long-term Strategic Initiatives (2-3 actions for 3-6+ months)

7. **Risk Assessment** (3-5 risks):
   - Issue description
   - Severity (high/medium/low)
   - Detailed description of the risk
   - Potential impact
   - Mitigation steps (2-3 specific actions)
   - Timeline for addressing

8. **Trend Analysis**:
   - Temporal patterns (if responses span multiple days/weeks)
   - Direction (improving/declining/stable/mixed)
   - Prediction (1-2 sentences about likely future trends if current patterns continue)

9. **Representative Quotes** (5-6 quotes):
   - Anonymized quote text
   - Sentiment
   - Related theme
   - Intensity (strong/moderate/mild)

10. **Enhanced Participation Metrics**:
    - Total responses
    - Average response length
    - Engagement quality (high/medium/low) based on response depth and detail
    - Participation insights (2-3 sentences about engagement patterns)
    - Detailed responses percentage (responses >200 characters)
    - Actionable feedback count (responses with specific recommendations)

11. **Comparative Analysis** (if applicable):
    - vs. Last Quarter: Sentiment change, emerging themes
    - vs. Industry: Strengths and areas for improvement

RESPONSES TO ANALYZE:
${JSON.stringify(responseTexts.slice(0, 100), null, 2)}${responseTexts.length > 100 ? `\n\n... and ${responseTexts.length - 100} more responses` : ''}

Return ONLY valid JSON in this exact format:
{
  "summary": "string (3-4 sentences)",
  "sentiment": {
    "positive": number (percentage 0-100),
    "neutral": number (percentage 0-100),
    "negative": number (percentage 0-100),
    "trend": "improving" | "declining" | "stable",
    "insights": "string (2-3 sentences)",
    "drivers": {
      "positive": ["string", "string", "string"],
      "negative": ["string", "string", "string"]
    },
    "intensity": {
      "strong": number (percentage),
      "moderate": number (percentage),
      "mild": number (percentage)
    }
  },
  "themes": [
    {
      "keyword": "string",
      "description": "string (2-3 sentences)",
      "count": number,
      "sentiment": "positive" | "neutral" | "negative" | "mixed",
      "urgency": "high" | "medium" | "low",
      "sentimentBreakdown": {
        "positive": number (percentage),
        "neutral": number (percentage),
        "negative": number (percentage)
      },
      "relatedThemes": ["string"],
      "recommendedAction": "string"
    }
  ],
  "highlights": [
    {
      "title": "string",
      "description": "string (3-4 sentences)",
      "impact": "high" | "medium" | "low",
      "sentiment": "positive" | "neutral" | "negative",
      "evidence": ["string", "string"]
    }
  ],
  "recommendations": [
    {
      "title": "string",
      "description": "string",
      "priority": "high" | "medium" | "low",
      "impact": "high" | "medium" | "low",
      "effort": "high" | "medium" | "low",
      "timeline": "string",
      "successMetrics": ["string", "string"],
      "resources": ["string"],
      "dependencies": ["string"]
    }
  ],
  "actionPlan": {
    "quickWins": [
      {
        "title": "string",
        "description": "string",
        "impact": "string",
        "effort": "string",
        "timeline": "string"
      }
    ],
    "shortTerm": [
      {
        "title": "string",
        "description": "string",
        "timeline": "string"
      }
    ],
    "longTerm": [
      {
        "title": "string",
        "description": "string",
        "timeline": "string"
      }
    ]
  },
  "risks": [
    {
      "issue": "string",
      "severity": "high" | "medium" | "low",
      "description": "string",
      "impact": "string",
      "mitigation": ["string", "string"],
      "timeline": "string"
    }
  ],
  "trends": {
    "pattern": "string",
    "direction": "improving" | "declining" | "stable" | "mixed",
    "temporalPatterns": "string",
    "prediction": "string"
  },
  "quotes": [
    {
      "text": "string (anonymized)",
      "sentiment": "positive" | "neutral" | "negative",
      "theme": "string",
      "intensity": "strong" | "moderate" | "mild"
    }
  ],
  "participation": {
    "totalResponses": number,
    "averageLength": number,
    "engagementQuality": "high" | "medium" | "low",
    "insights": "string (2-3 sentences)",
    "moodBreakdown": {"😀": number, "🙂": number, "😐": number, "🙁": number, "😞": number},
    "responseRate": number (percentage if team size known),
    "detailedResponses": number,
    "actionableFeedback": number
  },
  "comparative": {
    "vsLastQuarter": {
      "sentimentChange": number (percentage change),
      "themes": ["string"]
    },
    "vsIndustry": {
      "strengths": ["string"],
      "weaknesses": ["string"]
    }
  }
}`
}

