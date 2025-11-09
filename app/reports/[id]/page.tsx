'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, Unlock } from 'lucide-react'
import { LoadingSpinner } from '@/components/loading-spinner'
import { useToast } from '@/components/toast-provider'
import { EnhancedReportDisplay } from '@/components/enhanced-report-display'

export default function PublicReportPage() {
  const params = useParams()
  const campaignId = params.id as string
  const { error: showError } = useToast()
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [campaign, setCampaign] = useState<any>(null)
  const [report, setReport] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [needsPassword, setNeedsPassword] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [campaignId])

  const checkAccess = async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`)
      if (!res.ok) {
        setError('Campaign not found')
        return
      }
      const data = await res.json()
      
      if (!data.publicReportOn) {
        setError('This report is not publicly available')
        return
      }

      setCampaign(data)

      // Check if password is required
      // Note: publicReportPassword will be a hashed string if set, or null/undefined if not set
      const hasPassword = data.publicReportPassword && data.publicReportPassword.length > 0
      
      if (hasPassword) {
        // Check if password is already verified in session
        const verified = sessionStorage.getItem(`report_${campaignId}_verified`)
        if (verified === 'true') {
          setIsAuthenticated(true)
          fetchReport()
        } else {
          setNeedsPassword(true)
          setIsAuthenticated(false)
        }
      } else {
        // No password required
        setNeedsPassword(false)
        setIsAuthenticated(true)
        fetchReport()
      }
    } catch (error) {
      console.error('Error checking access:', error)
      setError('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/ai/report/${campaignId}`)
      if (res.ok) {
        const data = await res.json()
        setReport(data)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch(`/api/reports/${campaignId}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Invalid password')
        showError('Invalid password', data.error || 'Please try again')
        return
      }

      // Store verification in session
      sessionStorage.setItem(`report_${campaignId}_verified`, 'true')
      setError(null)
      setIsAuthenticated(true)
      fetchReport()
    } catch (error) {
      console.error('Error verifying password:', error)
      showError('Error', 'Failed to verify password')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (needsPassword && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Password Protected</CardTitle>
            </div>
            <CardDescription>
              This report is password protected. Please enter the password to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <Button type="submit" className="w-full">
                <Unlock className="h-4 w-4 mr-2" />
                Unlock Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render the report (same as private report page)
  if (!report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Report Not Available</CardTitle>
            <CardDescription>This report has not been generated yet.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Parse report data
  const sentiment = JSON.parse(report.sentiment)
  const themes = JSON.parse(report.themes)
  const highlights = JSON.parse(report.highlights)
  const quotes = JSON.parse(report.quotes)
  const participation = JSON.parse(report.participation)
  
  // Parse enhanced report data
  let recommendations: any[] = []
  let risks: any[] = []
  let trends: any = null
  let actionPlan: any = null
  let comparative: any = null
  
  try {
    const suggestionsData = JSON.parse(report.suggestions)
    if (Array.isArray(suggestionsData)) {
      recommendations = suggestionsData.map((s: string) => ({
        title: s,
        description: s,
        priority: 'medium' as const,
        impact: 'medium' as const,
        effort: 'medium' as const,
      }))
    } else {
      recommendations = suggestionsData.recommendations || []
      risks = suggestionsData.risks || []
      trends = suggestionsData.trends || null
      actionPlan = suggestionsData.actionPlan || null
      comparative = suggestionsData.comparative || null
    }
  } catch (e) {
    recommendations = []
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">{campaign.title}</h1>
          <p className="text-muted-foreground text-lg">{campaign.question}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Generated on {new Date(report.createdAt).toLocaleDateString()}
          </p>
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

        <div className="text-center text-sm text-muted-foreground pt-8 border-t mt-8">
          Generated from anonymous feedback — thank you for speaking up.
        </div>
      </div>
    </div>
  )
}
