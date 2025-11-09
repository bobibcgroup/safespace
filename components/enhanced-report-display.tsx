'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, TrendingDown, Minus, AlertTriangle, 
  CheckCircle2, Clock, Target, Zap, Calendar,
  BarChart3, Users, MessageSquare, Lightbulb
} from 'lucide-react'

interface EnhancedReportDisplayProps {
  report: any
  sentiment: any
  themes: any[]
  highlights: any[]
  quotes: any[]
  participation: any
  recommendations?: any[]
  risks?: any[]
  trends?: any
  actionPlan?: any
  comparative?: any
}

export function EnhancedReportDisplay({
  report,
  sentiment,
  themes,
  highlights,
  quotes,
  participation,
  recommendations = [],
  risks = [],
  trends,
  actionPlan,
  comparative,
}: EnhancedReportDisplayProps) {
  const getTrendIcon = (direction?: string) => {
    switch (direction) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 text-red-500 border-red-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
      default:
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-500 border-red-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
      default:
        return 'bg-green-500/20 text-green-500 border-green-500/30'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-green-500'
      case 'medium':
        return 'text-yellow-500'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">{report.summary}</p>
        </CardContent>
      </Card>

      {/* Enhanced Sentiment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-3xl font-bold text-green-500">{sentiment.positive}%</div>
              <div className="text-sm text-muted-foreground mt-1">Positive</div>
            </div>
            <div className="text-center p-4 bg-gray-500/10 rounded-lg border border-gray-500/20">
              <div className="text-3xl font-bold text-gray-400">{sentiment.neutral}%</div>
              <div className="text-sm text-muted-foreground mt-1">Neutral</div>
            </div>
            <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="text-3xl font-bold text-red-500">{sentiment.negative}%</div>
              <div className="text-sm text-muted-foreground mt-1">Negative</div>
            </div>
          </div>

          {sentiment.trend && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              {getTrendIcon(sentiment.trend)}
              <span className="font-medium">Trend: {sentiment.trend}</span>
            </div>
          )}

          {sentiment.insights && (
            <p className="text-sm text-muted-foreground">{sentiment.insights}</p>
          )}

          {sentiment.drivers && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {sentiment.drivers.positive && sentiment.drivers.positive.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-green-500 mb-2">Positive Drivers</h4>
                  <ul className="space-y-1">
                    {sentiment.drivers.positive.map((driver: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">• {driver}</li>
                    ))}
                  </ul>
                </div>
              )}
              {sentiment.drivers.negative && sentiment.drivers.negative.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-500 mb-2">Negative Drivers</h4>
                  <ul className="space-y-1">
                    {sentiment.drivers.negative.map((driver: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">• {driver}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Themes */}
      {themes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Themes</CardTitle>
            <CardDescription>Most frequently mentioned topics with sentiment analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themes.map((theme: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{theme.keyword}</h4>
                    <div className="flex gap-2">
                      {theme.urgency && (
                        <Badge variant="outline" className={getSeverityColor(theme.urgency)}>
                          {theme.urgency}
                        </Badge>
                      )}
                      {theme.sentiment && (
                        <Badge variant="outline">
                          {theme.sentiment}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{theme.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{theme.count} mentions</span>
                    {theme.sentimentBreakdown && (
                      <span>
                        {theme.sentimentBreakdown.positive}% + / {theme.sentimentBreakdown.negative}% -
                      </span>
                    )}
                  </div>
                  {theme.recommendedAction && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium text-primary">Recommended: {theme.recommendedAction}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Critical Insights */}
      {highlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Critical Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {highlights.map((highlight: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{highlight.title}</h4>
                    {highlight.impact && (
                      <Badge variant="outline" className={getSeverityColor(highlight.impact)}>
                        {highlight.impact} impact
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{highlight.description}</p>
                  {highlight.evidence && highlight.evidence.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium mb-1">Evidence:</p>
                      <ul className="space-y-1">
                        {highlight.evidence.map((ev: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground">• {ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment */}
      {risks.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {risks.map((risk: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{risk.issue}</h4>
                    <Badge variant="outline" className={getSeverityColor(risk.severity)}>
                      {risk.severity} severity
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{risk.description}</p>
                  {risk.impact && (
                    <p className="text-xs text-muted-foreground mb-2"><strong>Impact:</strong> {risk.impact}</p>
                  )}
                  {risk.mitigation && risk.mitigation.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium mb-2">Mitigation Steps:</p>
                      <ul className="space-y-1">
                        {risk.mitigation.map((step: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground">• {step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {risk.timeline && (
                    <p className="text-xs text-muted-foreground mt-2">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Timeline: {risk.timeline}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prioritized Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Prioritized Recommendations
            </CardTitle>
            <CardDescription>Actionable steps organized by priority and impact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{rec.title}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                        {rec.priority} priority
                      </Badge>
                      <Badge variant="outline" className={getImpactColor(rec.impact)}>
                        {rec.impact} impact
                      </Badge>
                      <Badge variant="outline">
                        {rec.effort} effort
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                  {rec.timeline && (
                    <p className="text-xs text-muted-foreground mb-2">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Timeline: {rec.timeline}
                    </p>
                  )}
                  {rec.successMetrics && rec.successMetrics.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium mb-2">Success Metrics:</p>
                      <ul className="space-y-1">
                        {rec.successMetrics.map((metric: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground">• {metric}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {rec.resources && rec.resources.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">Resources Needed:</p>
                      <p className="text-xs text-muted-foreground">{rec.resources.join(', ')}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Plan */}
      {actionPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Action Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {actionPlan.quickWins && actionPlan.quickWins.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-500" />
                    Quick Wins
                  </h4>
                  <div className="space-y-3">
                    {actionPlan.quickWins.map((win: any, i: number) => (
                      <div key={i} className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <h5 className="font-medium mb-1">{win.title}</h5>
                        <p className="text-sm text-muted-foreground mb-2">{win.description}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Impact: {win.impact}</span>
                          <span>Effort: {win.effort}</span>
                          <span>Timeline: {win.timeline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {actionPlan.shortTerm && actionPlan.shortTerm.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    Short-term Actions (1-3 months)
                  </h4>
                  <div className="space-y-3">
                    {actionPlan.shortTerm.map((action: any, i: number) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <h5 className="font-medium mb-1">{action.title}</h5>
                        <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                        <p className="text-xs text-muted-foreground">Timeline: {action.timeline}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {actionPlan.longTerm && actionPlan.longTerm.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    Long-term Strategic Initiatives (3-6+ months)
                  </h4>
                  <div className="space-y-3">
                    {actionPlan.longTerm.map((action: any, i: number) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <h5 className="font-medium mb-1">{action.title}</h5>
                        <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                        <p className="text-xs text-muted-foreground">Timeline: {action.timeline}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Analysis */}
      {trends && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getTrendIcon(trends.direction)}
              Trend Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trends.pattern && (
              <p className="text-sm text-muted-foreground mb-3">{trends.pattern}</p>
            )}
            {trends.temporalPatterns && (
              <p className="text-sm text-muted-foreground mb-3">{trends.temporalPatterns}</p>
            )}
            {trends.prediction && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Prediction:</p>
                <p className="text-sm text-muted-foreground">{trends.prediction}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Representative Quotes */}
      {quotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Representative Quotes</CardTitle>
            <CardDescription>Diverse feedback across different sentiments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quotes.map((quote: any, idx: number) => (
                <div key={idx} className="p-4 border-l-4 border-l-primary bg-muted/50 rounded-lg">
                  <p className="italic mb-2">&quot;{quote.text}&quot;</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={
                      quote.sentiment === 'positive' ? 'text-green-500' :
                      quote.sentiment === 'negative' ? 'text-red-500' :
                      'text-gray-400'
                    }>
                      {quote.sentiment}
                    </Badge>
                    {quote.theme && (
                      <Badge variant="outline">{quote.theme}</Badge>
                    )}
                    {quote.intensity && (
                      <Badge variant="outline">{quote.intensity} intensity</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Participation Metrics */}
      {participation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participation Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{participation.totalResponses}</div>
                <div className="text-sm text-muted-foreground">Total Responses</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{participation.averageLength}</div>
                <div className="text-sm text-muted-foreground">Avg. Length</div>
              </div>
              {participation.detailedResponses !== undefined && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{participation.detailedResponses}</div>
                  <div className="text-sm text-muted-foreground">Detailed</div>
                </div>
              )}
              {participation.actionableFeedback !== undefined && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{participation.actionableFeedback}</div>
                  <div className="text-sm text-muted-foreground">Actionable</div>
                </div>
              )}
            </div>
            {participation.engagementQuality && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Engagement Quality: {participation.engagementQuality}</p>
                {participation.insights && (
                  <p className="text-sm text-muted-foreground">{participation.insights}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparative Analysis */}
      {comparative && (
        <Card>
          <CardHeader>
            <CardTitle>Comparative Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comparative.vsLastQuarter && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">vs. Last Quarter</h4>
                  {comparative.vsLastQuarter.sentimentChange && (
                    <p className="text-sm text-muted-foreground">
                      Sentiment Change: {comparative.vsLastQuarter.sentimentChange > 0 ? '+' : ''}
                      {comparative.vsLastQuarter.sentimentChange}%
                    </p>
                  )}
                  {comparative.vsLastQuarter.themes && comparative.vsLastQuarter.themes.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">Emerging Themes:</p>
                      <div className="flex flex-wrap gap-2">
                        {comparative.vsLastQuarter.themes.map((theme: string, i: number) => (
                          <Badge key={i} variant="outline">{theme}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {comparative.vsIndustry && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">vs. Industry</h4>
                  {comparative.vsIndustry.strengths && comparative.vsIndustry.strengths.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-green-500 mb-1">Strengths:</p>
                      <ul className="space-y-1">
                        {comparative.vsIndustry.strengths.map((strength: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground">• {strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {comparative.vsIndustry.weaknesses && comparative.vsIndustry.weaknesses.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-red-500 mb-1">Areas for Improvement:</p>
                      <ul className="space-y-1">
                        {comparative.vsIndustry.weaknesses.map((weakness: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground">• {weakness}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

