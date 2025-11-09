'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Users, MessageSquare } from 'lucide-react'
import { LoadingSpinner } from '@/components/loading-spinner'

export default function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns')
      if (!res.ok) throw new Error('Failed to fetch campaigns')
      const data = await res.json()
      setCampaigns(data)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      </div>
    )
  }

  // Calculate analytics
  const allResponses = campaigns.flatMap(c => c.responses || [])
  const filteredCampaigns = selectedCampaign === 'all' 
    ? campaigns 
    : campaigns.filter(c => c.id === selectedCampaign)

  const totalResponses = allResponses.length
  const totalCampaigns = campaigns.length
  const avgResponsesPerCampaign = totalCampaigns > 0 ? (totalResponses / totalCampaigns).toFixed(1) : '0'

  // Sentiment breakdown
  const sentimentBreakdown = allResponses.reduce((acc: any, r: any) => {
    const sentiment = r.sentiment || 'neutral'
    acc[sentiment] = (acc[sentiment] || 0) + 1
    return acc
  }, { positive: 0, neutral: 0, negative: 0 })

  // Status breakdown
  const statusBreakdown = allResponses.reduce((acc: any, r: any) => {
    const status = r.status || 'new'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  // Response trends (last 30 days)
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const recentResponses = allResponses.filter((r: any) => 
    new Date(r.createdAt) >= thirtyDaysAgo
  )

  // Daily response count
  const dailyCounts: Record<string, number> = {}
  recentResponses.forEach((r: any) => {
    const date = new Date(r.createdAt).toISOString().split('T')[0]
    dailyCounts[date] = (dailyCounts[date] || 0) + 1
  })

  // Campaign performance
  const campaignPerformance = filteredCampaigns.map(c => ({
    id: c.id,
    title: c.title,
    responseCount: c._count?.responses || 0,
    sentiments: (c.responses || []).reduce((acc: any, r: any) => {
      const sentiment = r.sentiment || 'neutral'
      acc[sentiment] = (acc[sentiment] || 0) + 1
      return acc
    }, { positive: 0, neutral: 0, negative: 0 }),
    resolutionRate: c.responses && c.responses.length > 0
      ? ((c.responses.filter((r: any) => r.status === 'resolved').length / c.responses.length) * 100).toFixed(1)
      : '0',
  })).sort((a, b) => b.responseCount - a.responseCount)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Comprehensive insights into your feedback campaigns</p>
            </div>
            <div className="flex gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Responses</p>
                  <p className="text-2xl font-bold">{totalResponses}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Campaigns</p>
                  <p className="text-2xl font-bold">{totalCampaigns}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg. Responses</p>
                  <p className="text-2xl font-bold">{avgResponsesPerCampaign}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Resolution Rate</p>
                  <p className="text-2xl font-bold">
                    {totalResponses > 0
                      ? ((statusBreakdown.resolved || 0) / totalResponses * 100).toFixed(1)
                      : '0'}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
            <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Positive</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${(sentimentBreakdown.positive / totalResponses) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {sentimentBreakdown.positive} ({totalResponses > 0 ? ((sentimentBreakdown.positive / totalResponses) * 100).toFixed(1) : '0'}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Neutral</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-400"
                            style={{ width: `${(sentimentBreakdown.neutral / totalResponses) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {sentimentBreakdown.neutral} ({totalResponses > 0 ? ((sentimentBreakdown.neutral / totalResponses) * 100).toFixed(1) : '0'}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Negative</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500"
                            style={{ width: `${(sentimentBreakdown.negative / totalResponses) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {sentimentBreakdown.negative} ({totalResponses > 0 ? ((sentimentBreakdown.negative / totalResponses) * 100).toFixed(1) : '0'}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(statusBreakdown).map(([status, count]: [string, any]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${(count / totalResponses) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {count} ({totalResponses > 0 ? ((count / totalResponses) * 100).toFixed(1) : '0'}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Overview</CardTitle>
                  <CardDescription>Overall sentiment distribution across all campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Positive</p>
                          <p className="text-2xl font-bold text-green-500">
                            {sentimentBreakdown.positive}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Percentage</p>
                        <p className="text-xl font-semibold">
                          {totalResponses > 0 ? ((sentimentBreakdown.positive / totalResponses) * 100).toFixed(1) : '0'}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gray-500/20 flex items-center justify-center">
                          <BarChart3 className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Neutral</p>
                          <p className="text-2xl font-bold text-gray-500">
                            {sentimentBreakdown.neutral}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Percentage</p>
                        <p className="text-xl font-semibold">
                          {totalResponses > 0 ? ((sentimentBreakdown.neutral / totalResponses) * 100).toFixed(1) : '0'}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                          <TrendingDown className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Negative</p>
                          <p className="text-2xl font-bold text-red-500">
                            {sentimentBreakdown.negative}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Percentage</p>
                        <p className="text-xl font-semibold">
                          {totalResponses > 0 ? ((sentimentBreakdown.negative / totalResponses) * 100).toFixed(1) : '0'}%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Breakdown</CardTitle>
                  <CardDescription>Visual representation of sentiment distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Visual Bar Chart */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Positive</span>
                          <span className="text-sm text-muted-foreground">
                            {sentimentBreakdown.positive} ({totalResponses > 0 ? ((sentimentBreakdown.positive / totalResponses) * 100).toFixed(1) : '0'}%)
                          </span>
                        </div>
                        <div className="w-full h-6 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${totalResponses > 0 ? (sentimentBreakdown.positive / totalResponses) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Neutral</span>
                          <span className="text-sm text-muted-foreground">
                            {sentimentBreakdown.neutral} ({totalResponses > 0 ? ((sentimentBreakdown.neutral / totalResponses) * 100).toFixed(1) : '0'}%)
                          </span>
                        </div>
                        <div className="w-full h-6 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-400 transition-all"
                            style={{ width: `${totalResponses > 0 ? (sentimentBreakdown.neutral / totalResponses) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Negative</span>
                          <span className="text-sm text-muted-foreground">
                            {sentimentBreakdown.negative} ({totalResponses > 0 ? ((sentimentBreakdown.negative / totalResponses) * 100).toFixed(1) : '0'}%)
                          </span>
                        </div>
                        <div className="w-full h-6 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 transition-all"
                            style={{ width: `${totalResponses > 0 ? (sentimentBreakdown.negative / totalResponses) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-500">
                            {totalResponses > 0 ? ((sentimentBreakdown.positive / totalResponses) * 100).toFixed(0) : '0'}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Positive Rate</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-500">
                            {totalResponses > 0 ? ((sentimentBreakdown.neutral / totalResponses) * 100).toFixed(0) : '0'}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Neutral Rate</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-red-500">
                            {totalResponses > 0 ? ((sentimentBreakdown.negative / totalResponses) * 100).toFixed(0) : '0'}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Negative Rate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sentiment by Campaign */}
            <Card>
              <CardHeader>
                <CardTitle>Sentiment by Campaign</CardTitle>
                <CardDescription>Sentiment breakdown for each campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignPerformance.length > 0 ? (
                    campaignPerformance.map(campaign => {
                      const total = campaign.sentiments.positive + campaign.sentiments.neutral + campaign.sentiments.negative
                      return (
                        <div key={campaign.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{campaign.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {campaign.responseCount} total responses
                              </p>
                            </div>
                            <Link href={`/campaigns/${campaign.id}/crm`}>
                              <Button variant="outline" size="sm">View Details</Button>
                            </Link>
                          </div>
                          
                          {total > 0 ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-24 text-xs text-muted-foreground">Positive</div>
                                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-500"
                                    style={{ width: `${(campaign.sentiments.positive / total) * 100}%` }}
                                  />
                                </div>
                                <div className="w-16 text-xs text-right">
                                  {campaign.sentiments.positive} ({(campaign.sentiments.positive / total * 100).toFixed(0)}%)
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-24 text-xs text-muted-foreground">Neutral</div>
                                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gray-400"
                                    style={{ width: `${(campaign.sentiments.neutral / total) * 100}%` }}
                                  />
                                </div>
                                <div className="w-16 text-xs text-right">
                                  {campaign.sentiments.neutral} ({(campaign.sentiments.neutral / total * 100).toFixed(0)}%)
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-24 text-xs text-muted-foreground">Negative</div>
                                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-red-500"
                                    style={{ width: `${(campaign.sentiments.negative / total) * 100}%` }}
                                  />
                                </div>
                                <div className="w-16 text-xs text-right">
                                  {campaign.sentiments.negative} ({(campaign.sentiments.negative / total * 100).toFixed(0)}%)
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No responses yet</p>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No campaigns with responses yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Response counts and resolution rates by campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignPerformance.map(campaign => (
                    <div key={campaign.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold">{campaign.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {campaign.responseCount} responses • {campaign.resolutionRate}% resolved
                          </p>
                        </div>
                        <Link href={`/campaigns/${campaign.id}/crm`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
                      <div className="flex gap-4 mt-3 text-sm">
                        <span className="text-green-500">
                          ✓ {campaign.sentiments.positive} positive
                        </span>
                        <span className="text-gray-400">
                          ○ {campaign.sentiments.neutral} neutral
                        </span>
                        <span className="text-red-500">
                          ✗ {campaign.sentiments.negative} negative
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Response Trends (Last 30 Days)</CardTitle>
                <CardDescription>Daily response volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(dailyCounts)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, count]) => (
                      <div key={date} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {new Date(date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-48 h-4 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${(count / Math.max(...Object.values(dailyCounts))) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

