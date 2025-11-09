'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Sparkles, Share2, Copy, Check, ListTodo, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getBaseUrl } from '@/lib/utils'
import { useToast } from '@/components/toast-provider'
import { LoadingSpinner } from '@/components/loading-spinner'
import { EnhancedReportDisplay } from '@/components/enhanced-report-display'

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const { success, error: showError } = useToast()
  const campaignId = params.id as string
  const [campaign, setCampaign] = useState<any>(null)
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('report')
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [reportPassword, setReportPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [elapsedTime, setElapsedTime] = useState(0)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    fetchCampaign()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`)
      const data = await res.json()
      if (data.error) {
        console.error('Error fetching campaign:', data.error)
        return
      }
      setCampaign(data)

      // Fetch AI report if it exists
      if (data.aiReportGenerated) {
        const reportRes = await fetch(`/api/ai/report/${campaignId}`)
        if (reportRes.ok) {
          const reportData = await reportRes.json()
          setReport(reportData)
        }
      }
    } catch (error) {
      console.error('Error fetching campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    setGenerating(true)
    startTimeRef.current = Date.now()
    setElapsedTime(0)
    
    // Start elapsed time counter
    const timeInterval = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setElapsedTime(elapsed)
      }
    }, 1000)
    
    try {
      console.log('Starting report generation for campaign:', campaignId)
      
      // Add timeout to fetch request (5 minutes)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000)
      
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      clearInterval(timeInterval)
      console.log('API response status:', res.status)

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }))
        console.error('API error response:', data)
        throw new Error(data.error || `Failed to generate report (${res.status})`)
      }

      console.log('Parsing report data...')
      const reportData = await res.json()
      console.log('Report data received:', reportData ? 'Success' : 'Empty')
      
      if (!reportData || typeof reportData !== 'object') {
        throw new Error('Invalid report data received from server')
      }
      
      setReport(reportData)
      await fetchCampaign() // Refresh campaign to update aiReportGenerated flag
      success('Report generated', 'AI analysis complete!')
    } catch (error: any) {
      clearInterval(timeInterval)
      console.error('Error generating report:', error)
      let errorMessage = error.message || 'Please try again.'
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. The report generation is taking longer than expected. Please try again.'
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (error.message?.includes('JSON Parse error')) {
        // The report might have been generated but failed to parse on client
        // Refresh to check if it exists
        await fetchCampaign()
        if (campaign?.aiReportGenerated) {
          showError('Parse error', 'Report was generated but failed to load. Refreshing...')
          setTimeout(() => window.location.reload(), 2000)
          return
        }
      }
      
      showError('Failed to generate report', errorMessage)
    } finally {
      setGenerating(false)
      startTimeRef.current = null
      setElapsedTime(0)
    }
  }

  const togglePublicLink = async () => {
    // If turning on, show password dialog
    if (!campaign.publicReportOn) {
      setShowPasswordDialog(true)
      return
    }

    // If turning off, just disable
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicReportOn: false,
          publicReportPassword: null,
        }),
      })

      if (!res.ok) throw new Error('Failed to update public link')

      const updated = await res.json()
      setCampaign(updated)
      success('Public link disabled', 'Report is now private')
    } catch (error) {
      console.error('Error toggling public link:', error)
      showError('Failed to update public link', 'Please try again')
    }
  }

  const handleSetPassword = async () => {
    if (reportPassword && reportPassword !== confirmPassword) {
      showError('Passwords do not match', 'Please try again')
      return
    }

    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicReportOn: true,
          publicReportPassword: reportPassword || null,
        }),
      })

      if (!res.ok) throw new Error('Failed to update public link')

      const updated = await res.json()
      setCampaign(updated)
      setShowPasswordDialog(false)
      setReportPassword('')
      setConfirmPassword('')
      success(
        'Public link enabled',
        reportPassword ? 'Report is password protected' : 'Report is now publicly accessible'
      )
    } catch (error) {
      console.error('Error setting password:', error)
      showError('Failed to update public link', 'Please try again')
    }
  }

  const copyPublicLink = () => {
    const baseUrl = getBaseUrl()
    const publicUrl = `${baseUrl}/reports/${campaignId}`
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    success('Link copied', 'Public report link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <div className="text-muted-foreground">Loading campaign...</div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Campaign Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Parse report data
  const sentiment = report ? JSON.parse(report.sentiment) : null
  const themes = report ? JSON.parse(report.themes) : []
  const highlights = report ? JSON.parse(report.highlights) : []
  const quotes = report ? JSON.parse(report.quotes) : []
  const participation = report ? JSON.parse(report.participation) : null
  
  // Parse enhanced report data (stored in suggestions field)
  let fullReport: any = null
  let recommendations: any[] = []
  let risks: any[] = []
  let trends: any = null
  let actionPlan: any = null
  let comparative: any = null
  
  if (report) {
    try {
      const suggestionsData = JSON.parse(report.suggestions)
      // Check if it's the new format (object) or old format (array)
      if (Array.isArray(suggestionsData)) {
        // Old format - just suggestions array
        recommendations = suggestionsData.map((s: string) => ({
          title: s,
          description: s,
          priority: 'medium' as const,
          impact: 'medium' as const,
          effort: 'medium' as const,
        }))
      } else {
        // New format - full report object
        fullReport = suggestionsData
        recommendations = suggestionsData.recommendations || []
        risks = suggestionsData.risks || []
        trends = suggestionsData.trends || null
        actionPlan = suggestionsData.actionPlan || null
        comparative = suggestionsData.comparative || null
      }
    } catch (e) {
      // Fallback to empty
      recommendations = []
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Campaign Report: {campaign.title}</h1>
              <p className="text-muted-foreground">{campaign.question}</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="report">Report</TabsTrigger>
            <TabsTrigger value="action-items">
              Action Items
              {campaign.actionItems && campaign.actionItems.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {campaign.actionItems.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="report" className="mt-6">

        {!report ? (
          <Card>
            <CardHeader>
              <CardTitle>AI Report Not Generated</CardTitle>
              <CardDescription>
                Generate an AI-powered report to analyze feedback and get insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateReport} disabled={generating} size="lg" className="w-full">
                {generating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate AI Report
                  </>
                )}
              </Button>
              {generating && (
                <div className="text-sm text-muted-foreground text-center space-y-3">
                  <div className="space-y-2">
                    <p className="font-medium">Analyzing {campaign.responses?.length || 0} responses...</p>
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span className="font-mono text-lg">
                        {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs">This may take 30-90 seconds. Please don&apos;t close this page.</p>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ 
                          width: `${Math.min(95, (elapsedTime / 90) * 100)}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {elapsedTime < 30 ? 'Processing responses...' : 
                       elapsedTime < 60 ? 'Analyzing sentiment and themes...' : 
                       'Generating insights and recommendations...'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button onClick={generateReport} variant="outline" disabled={generating}>
                  {generating ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Regenerate Report
                    </>
                  )}
                </Button>
                {generating && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LoadingSpinner size="sm" />
                    <span className="font-mono">
                      {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={togglePublicLink}
                  variant={campaign.publicReportOn ? 'default' : 'outline'}
                  size="sm"
                >
                  {campaign.publicReportOn ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Protected
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 mr-2" />
                      Make Public
                    </>
                  )}
                </Button>
                {campaign.publicReportOn && (
                  <Button onClick={copyPublicLink} variant="outline" size="sm">
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <EnhancedReportDisplay
              report={report}
              sentiment={sentiment}
              themes={themes}
              highlights={highlights}
              quotes={quotes}
              participation={participation}
              recommendations={recommendations}
              risks={risks}
              trends={trends}
              actionPlan={actionPlan}
              comparative={comparative}
            />
          </div>
        )}
          </TabsContent>

          <TabsContent value="action-items" className="mt-6">
            <div className="space-y-4">
              {campaign.actionItems && campaign.actionItems.length > 0 ? (
                campaign.actionItems.map((item: any) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/action-items/${item.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ isCompleted: !item.isCompleted }),
                                })
                                if (res.ok) {
                                  fetchCampaign()
                                  success(
                                    item.isCompleted ? 'Action item reopened' : 'Action item completed',
                                    'Status updated'
                                  )
                                }
                              } catch (error) {
                                showError('Failed to update action item', 'Please try again')
                              }
                            }}
                            className={`mt-1 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              item.isCompleted
                                ? 'bg-green-500 border-green-500'
                                : 'border-muted-foreground'
                            }`}
                          >
                            {item.isCompleted && <CheckCircle2 className="h-3 w-3 text-white" />}
                          </button>
                          <div className="flex-1">
                            <h4 className={`font-semibold mb-1 ${item.isCompleted ? 'line-through opacity-60' : ''}`}>
                              {item.title}
                            </h4>
                            {item.owner && (
                              <p className="text-sm text-muted-foreground">Owner: {item.owner}</p>
                            )}
                            {item.dueDate && (
                              <p className={`text-sm ${
                                new Date(item.dueDate) < new Date() && !item.isCompleted
                                  ? 'text-red-500'
                                  : 'text-muted-foreground'
                              }`}>
                                Due: {new Date(item.dueDate).toLocaleDateString()}
                              </p>
                            )}
                            {item.response && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Related to response: {item.response.text.substring(0, 50)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No action items yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Create action items from the CRM view
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Public Report Password</DialogTitle>
              <DialogDescription>
                Optionally protect the public report with a password. Leave blank for no password protection.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Password (optional)</label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={reportPassword}
                  onChange={(e) => setReportPassword(e.target.value)}
                />
              </div>
              {reportPassword && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowPasswordDialog(false)
                setReportPassword('')
                setConfirmPassword('')
              }}>
                Cancel
              </Button>
              <Button onClick={handleSetPassword}>
                Enable Public Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

