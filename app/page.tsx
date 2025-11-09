'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SentimentRing } from '@/components/sentiment-ring'
import { Plus, MessageSquare, BarChart3, Copy, AlertTriangle, Search, Filter, Link2 } from 'lucide-react'
import { useToast } from '@/components/toast-provider'
import { FloatingActionButton } from '@/components/floating-action-button'
import { CampaignCardSkeleton } from '@/components/campaign-card-skeleton'
import { EmptyState } from '@/components/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { StatsCards } from '@/components/stats-cards'
import { Input } from '@/components/ui/input'
import { useKeyboardShortcuts } from '@/components/keyboard-shortcuts'
import { ShortcutsHelp } from '@/components/shortcuts-help'
import { useSession } from 'next-auth/react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function HomePage() {
  const { success, error: showError } = useToast()
  const { data: session } = useSession()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cloningCampaignId, setCloningCampaignId] = useState<string | null>(null)
  const [cloneIncludeResponses, setCloneIncludeResponses] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('all')
  const [filterUser, setFilterUser] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'most_responses' | 'alphabetical'>('newest')
  const [selectedCampaignIndex, setSelectedCampaignIndex] = useState(-1)
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)

  useEffect(() => {
    fetchCampaigns()
    if (session?.user?.role === 'admin') {
      fetchUsers()
    }
  }, [session])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNavigate: (direction) => {
      if (filteredCampaigns.length === 0) return
      setSelectedCampaignIndex((prev) => {
        if (prev === -1) return 0
        const next = direction === 'down' ? prev + 1 : prev - 1
        return Math.max(0, Math.min(filteredCampaigns.length - 1, next))
      })
    },
    onSelect: () => {
      if (selectedCampaignIndex >= 0 && selectedCampaignIndex < filteredCampaigns.length) {
        const campaign = filteredCampaigns[selectedCampaignIndex]
        window.location.href = `/campaigns/${campaign.id}/crm`
      }
    },
    onToggleHelp: () => setShowShortcutsHelp(true),
  })

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns')
      if (!res.ok) throw new Error('Failed to fetch campaigns')
      const data = await res.json()
      
      const campaignsWithSentiments = data.map((campaign: any) => {
        const sentiments = (campaign.responses || []).reduce((acc: any, r: any) => {
          if (r.sentiment === 'positive') acc.positive++
          else if (r.sentiment === 'negative') acc.negative++
          else acc.neutral++
          return acc
        }, { positive: 0, neutral: 0, negative: 0 })

        return {
          ...campaign,
          responseCount: campaign._count?.responses || 0,
          sentiments,
        }
      })
      
      setCampaigns(campaignsWithSentiments)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const cloneCampaign = async (campaignId: string, includeResponses: boolean) => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeResponses }),
      })

      if (!res.ok) throw new Error('Failed to clone campaign')

      const cloned = await res.json()
      success('Campaign cloned', `"${cloned.title}" has been created`)
      fetchCampaigns() // Refresh list
      setCloningCampaignId(null)
    } catch (error) {
      console.error('Error cloning campaign:', error)
      showError('Failed to clone campaign', 'Please try again')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const unresolvedCritical = campaigns.some(c => {
    const critical = (c.responses || []).filter((r: any) => r.status === 'needs_attention' || r.status === 'new').length
    return critical > 0
  })

  // Filter and sort campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!campaign.title.toLowerCase().includes(query) && 
          !campaign.question.toLowerCase().includes(query)) {
        return false
      }
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      const isClosed = campaign.closeDate ? new Date(campaign.closeDate) < new Date() : !campaign.isActive
      if (filterStatus === 'active' && isClosed) return false
      if (filterStatus === 'closed' && !isClosed) return false
    }
    
    // User filter (admin only)
    if (session?.user?.role === 'admin' && filterUser !== 'all') {
      if (campaign.userId !== filterUser) {
        return false
      }
    }
    
    return true
  }).sort((a, b) => {
    // Sort
    switch (sortBy) {
      case 'most_responses':
        return (b.responseCount || 0) - (a.responseCount || 0)
      case 'alphabetical':
        return a.title.localeCompare(b.title)
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  // Calculate stats
  const totalResponses = campaigns.reduce((sum, c) => sum + (c.responseCount || 0), 0)
  const resolvedCount = campaigns.reduce((sum, c) => {
    return sum + ((c.responses || []).filter((r: any) => r.status === 'resolved').length)
  }, 0)
  const needsAttention = campaigns.reduce((sum, c) => {
    return sum + ((c.responses || []).filter((r: any) => r.status === 'needs_attention' || r.status === 'new').length)
  }, 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Safe Space</h1>
            <p className="text-muted-foreground">Where every voice is heard, safely.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/analytics">
              <Button variant="outline" size="lg" className="gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </Button>
            </Link>
            <Link href="/campaigns/new">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Campaign
              </Button>
            </Link>
          </div>
        </div>

        <StatsCards
          totalCampaigns={campaigns.length}
          totalResponses={totalResponses}
          resolvedCount={resolvedCount}
          needsAttention={needsAttention}
        />

        {unresolvedCritical && (
          <Link href="/issues">
            <Card className="mb-6 cursor-pointer hover:shadow-lg transition-all dark:hover:border-yellow-500/40 border-yellow-500/20 bg-yellow-500/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    <div>
                      <p className="text-yellow-500 font-medium">
                        {needsAttention} unresolved item{needsAttention !== 1 ? 's' : ''} need{needsAttention === 1 ? 's' : ''} attention
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Click to review and resolve issues across all campaigns
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Issues →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Search and Filters */}
        {campaigns.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {session?.user?.role === 'admin' && (
                    <select
                      value={filterUser}
                      onChange={(e) => setFilterUser(e.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                      <option value="all">All Users</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name || user.email}
                        </option>
                      ))}
                    </select>
                  )}
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('active')}
                  >
                    Active
                  </Button>
                  <Button
                    variant={filterStatus === 'closed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('closed')}
                  >
                    Closed
                  </Button>
                  <div className="flex items-center gap-2 border-l pl-2 ml-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-2 py-1 text-sm rounded-md border bg-background"
                    >
                      <option value="newest">Newest</option>
                      <option value="most_responses">Most Responses</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredCampaigns.length === 0 && campaigns.length > 0 ? (
          <EmptyState
            icon={Search}
            title="No campaigns found"
            description="Try adjusting your search or filters to find what you're looking for."
          />
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No campaigns yet"
            description="Create your first campaign to start collecting anonymous feedback from your team."
            action={{
              label: "Create Your First Campaign",
              href: "/campaigns/new"
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map(campaign => {
              const isClosed = campaign.closeDate ? new Date(campaign.closeDate) < new Date() : !campaign.isActive
              const allResolved = campaign.responseCount > 0 && 
                (campaign.responses || []).every((r: any) => r.status === 'resolved')
              
              // Calculate unresolved items
              const unresolvedItems = (campaign.responses || []).filter((r: any) => 
                r.status === 'needs_attention' || r.status === 'new' || r.status === 'in_review'
              ).length
              const hasIssues = unresolvedItems > 0
              const criticalIssues = (campaign.responses || []).filter((r: any) => 
                r.status === 'needs_attention'
              ).length

              return (
                <Card 
                  key={campaign.id} 
                  className={`hover:shadow-lg transition-shadow relative ${
                    hasIssues ? 'border-l-4 border-l-yellow-500 dark:border-l-yellow-400' : ''
                  } ${
                    criticalIssues > 0 ? 'border-l-4 border-l-red-500 dark:border-l-red-400' : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <CardTitle>{campaign.title}</CardTitle>
                          {hasIssues && (
                            <Link href="/issues" className="flex items-center gap-1">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                criticalIssues > 0 
                                  ? 'bg-red-500/20 text-red-500 border border-red-500/30' 
                                  : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                              }`}>
                                {unresolvedItems} {unresolvedItems === 1 ? 'issue' : 'issues'}
                              </span>
                            </Link>
                          )}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {campaign.question}
                        </CardDescription>
                        {campaign.user && (
                          <p className="text-xs text-muted-foreground mt-1">
                            by {campaign.user.name || campaign.user.email}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        <SentimentRing
                          positive={campaign.sentiments.positive}
                          neutral={campaign.sentiments.neutral}
                          negative={campaign.sentiments.negative}
                          size={50}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {campaign.responseCount} {campaign.responseCount === 1 ? 'response' : 'responses'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isClosed ? 'Closed' : 'Active'}
                        </p>
                        {hasIssues && (
                          <p className={`text-xs mt-1 font-medium ${
                            criticalIssues > 0 ? 'text-red-500' : 'text-yellow-500'
                          }`}>
                            {criticalIssues > 0 && `${criticalIssues} critical`}
                            {criticalIssues > 0 && unresolvedItems > criticalIssues && ' • '}
                            {unresolvedItems > criticalIssues && `${unresolvedItems - criticalIssues} pending`}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {allResolved && campaign.responseCount > 0 && (
                          <span className="text-2xl">🎉</span>
                        )}
                        {hasIssues && (
                          <Link href="/issues">
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Review
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/campaigns/${campaign.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Link2 className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/campaigns/${campaign.id}/crm`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Open CRM
                        </Button>
                      </Link>
                      <Link href={`/campaigns/${campaign.id}/report`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Report
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCloningCampaignId(campaign.id)}
                        title="Clone campaign"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Clone Campaign Dialog */}
        <AlertDialog open={!!cloningCampaignId} onOpenChange={(open) => !open && setCloningCampaignId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clone Campaign</AlertDialogTitle>
              <AlertDialogDescription>
                Create a copy of this campaign. You can choose to include existing responses.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeResponses"
                  checked={cloneIncludeResponses}
                  onChange={(e) => setCloneIncludeResponses(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="includeResponses" className="text-sm font-medium">
                  Include existing responses
                </label>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (cloningCampaignId) {
                    cloneCampaign(cloningCampaignId, cloneIncludeResponses)
                  }
                }}
              >
                Clone Campaign
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ShortcutsHelp open={showShortcutsHelp} onOpenChange={setShowShortcutsHelp} />
      </div>
      <FloatingActionButton />
    </div>
  )
}

