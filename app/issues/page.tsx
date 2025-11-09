'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, AlertTriangle, Filter, Search, CheckCircle2, Clock, MessageSquare } from 'lucide-react'
import { useToast } from '@/components/toast-provider'
import { LoadingSpinner } from '@/components/loading-spinner'
import { EmptyState } from '@/components/empty-state'

export default function IssuesPage() {
  const { success } = useToast()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'needs_attention' | 'new' | 'in_review'>('all')
  const [filterCampaign, setFilterCampaign] = useState<string>('all')

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

  // Collect all issues across campaigns
  const allIssues: any[] = []
  campaigns.forEach(campaign => {
    const responses = campaign.responses || []
    responses.forEach((response: any) => {
      if (response.status === 'needs_attention' || response.status === 'new' || response.status === 'in_review') {
        allIssues.push({
          ...response,
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          campaignQuestion: campaign.question,
        })
      }
    })
  })

  // Filter issues
  const filteredIssues = allIssues.filter(issue => {
    // Search filter
    if (searchQuery && !issue.text.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !issue.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Status filter
    if (filterStatus !== 'all' && issue.status !== filterStatus) {
      return false
    }
    
    // Campaign filter
    if (filterCampaign !== 'all' && issue.campaignId !== filterCampaign) {
      return false
    }
    
    return true
  })

  // Group by campaign
  const issuesByCampaign = filteredIssues.reduce((acc, issue) => {
    if (!acc[issue.campaignId]) {
      acc[issue.campaignId] = {
        campaign: {
          id: issue.campaignId,
          title: issue.campaignTitle,
          question: issue.campaignQuestion,
        },
        issues: [],
      }
    }
    acc[issue.campaignId].issues.push(issue)
    return acc
  }, {} as Record<string, any>)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'needs_attention':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'new':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'in_review':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'needs_attention':
        return 'Needs Attention'
      case 'new':
        return 'New'
      case 'in_review':
        return 'In Review'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div>
              <h1 className="text-4xl font-bold">Issues & Resolutions</h1>
              <p className="text-muted-foreground">Review and resolve items across all campaigns</p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{allIssues.length}</div>
              <div className="text-sm text-muted-foreground">Total Issues</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-500">
                {allIssues.filter(i => i.status === 'needs_attention').length}
              </div>
              <div className="text-sm text-muted-foreground">Needs Attention</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-500">
                {allIssues.filter(i => i.status === 'new').length}
              </div>
              <div className="text-sm text-muted-foreground">New Items</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-500">
                {allIssues.filter(i => i.status === 'in_review').length}
              </div>
              <div className="text-sm text-muted-foreground">In Review</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search issues or campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'needs_attention' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('needs_attention')}
                >
                  Needs Attention
                </Button>
                <Button
                  variant={filterStatus === 'new' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('new')}
                >
                  New
                </Button>
                <Button
                  variant={filterStatus === 'in_review' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('in_review')}
                >
                  In Review
                </Button>
              </div>
            </div>
            {campaigns.length > 0 && (
              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">Filter by Campaign:</label>
                <select
                  value={filterCampaign}
                  onChange={(e) => setFilterCampaign(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 rounded-md border bg-background"
                >
                  <option value="all">All Campaigns</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Issues List */}
        {filteredIssues.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No Issues Found"
            description={allIssues.length === 0 
              ? "Great! All items are resolved across all campaigns."
              : "No issues match your current filters. Try adjusting your search or filters."}
          />
        ) : (
          <div className="space-y-6">
            {Object.values(issuesByCampaign).map((group: any) => (
              <Card key={group.campaign.id} className="dark:hover:border-primary/40 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{group.campaign.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-2">{group.campaign.question}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {group.issues.length} {group.issues.length === 1 ? 'issue' : 'issues'}
                        </span>
                        <Link href={`/campaigns/${group.campaign.id}/crm`}>
                          <Button variant="outline" size="sm">
                            Open CRM
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {group.issues.map((issue: any) => (
                      <div
                        key={issue.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(issue.status)}`}>
                                {getStatusLabel(issue.status)}
                              </span>
                              {issue.sentiment && (
                                <span className={`text-xs px-2 py-1 rounded ${
                                  issue.sentiment === 'positive' ? 'bg-green-500/10 text-green-500' :
                                  issue.sentiment === 'negative' ? 'bg-red-500/10 text-red-500' :
                                  'bg-gray-500/10 text-gray-500'
                                }`}>
                                  {issue.sentiment}
                                </span>
                              )}
                            </div>
                            <p className="text-sm mb-2 line-clamp-3">{issue.text}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(issue.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Link href={`/campaigns/${group.campaign.id}/crm`}>
                            <Button variant="ghost" size="sm">
                              View →
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

