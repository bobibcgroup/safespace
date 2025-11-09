'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Copy, Check, QrCode, BarChart3, MessageSquare, Users, TrendingUp, Calendar, Clock, Link2, Trash2, Edit, Save, X } from 'lucide-react'
import QRCode from 'qrcode'
import { getBaseUrl } from '@/lib/utils'
import { useToast } from '@/components/toast-provider'
import { LoadingSpinner } from '@/components/loading-spinner'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string
  const { success, error: showError } = useToast()
  const { data: session } = useSession()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editStatus, setEditStatus] = useState<'active' | 'paused' | 'finished'>('active')
  const [editStartDate, setEditStartDate] = useState('')
  const [editCloseDate, setEditCloseDate] = useState('')

  useEffect(() => {
    fetchCampaign()
  }, [campaignId])

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`)
      if (!res.ok) throw new Error('Failed to fetch campaign')
      const data = await res.json()
      setCampaign(data)

      // Generate QR code
      if (data) {
        const baseUrl = getBaseUrl()
        const submissionUrl = `${baseUrl}/submit/${data.slug || data.id}`
        try {
          const qrCode = await QRCode.toDataURL(submissionUrl)
          setQrCodeDataUrl(qrCode)
        } catch (error) {
          console.error('Error generating QR code:', error)
        }
      }
    } catch (error) {
      console.error('Error fetching campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    if (campaign) {
      const baseUrl = getBaseUrl()
      const submissionUrl = `${baseUrl}/submit/${campaign.slug || campaign.id}`
      navigator.clipboard.writeText(submissionUrl)
      setCopied(true)
      success('Link copied', 'Submission link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyBlurb = () => {
    if (campaign) {
      const baseUrl = getBaseUrl()
      const submissionUrl = `${baseUrl}/submit/${campaign.slug || campaign.id}`
      const blurb = `We'd love to hear your feedback! Please share your thoughts anonymously: ${submissionUrl}`
      navigator.clipboard.writeText(blurb)
      setCopied(true)
      success('Message copied', 'Share message copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete campaign')
      }

      success('Campaign deleted', 'The campaign has been permanently deleted')
      router.push('/')
    } catch (error: any) {
      console.error('Error deleting campaign:', error)
      showError('Failed to delete campaign', error.message || 'Please try again')
      setShowDeleteDialog(false)
    } finally {
      setDeleting(false)
    }
  }

  const handleSaveEdit = async () => {
    setEditing(true)
    try {
      const updateData: any = {}

      // Set status based on selection
      if (editStatus === 'finished') {
        // Finished: set closeDate to now if not set, and set isActive to false
        updateData.isActive = false
        if (!editCloseDate) {
          updateData.closeDate = new Date().toISOString()
        } else {
          updateData.closeDate = new Date(editCloseDate).toISOString()
        }
      } else if (editStatus === 'paused') {
        // Paused: set isActive to false, keep closeDate as is
        updateData.isActive = false
        if (editCloseDate) {
          updateData.closeDate = new Date(editCloseDate).toISOString()
        } else {
          updateData.closeDate = null
        }
      } else {
        // Active: set isActive to true, clear closeDate if it's in the past
        updateData.isActive = true
        if (editCloseDate) {
          const closeDate = new Date(editCloseDate)
          if (closeDate > new Date()) {
            updateData.closeDate = closeDate.toISOString()
          } else {
            updateData.closeDate = null
          }
        } else {
          updateData.closeDate = null
        }
      }

      // Update dates
      if (editStartDate) {
        updateData.startDate = new Date(editStartDate).toISOString()
      } else {
        updateData.startDate = null
      }

      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update campaign')
      }

      success('Campaign updated', 'Campaign status and dates have been updated')
      setShowEditDialog(false)
      fetchCampaign() // Refresh campaign data
    } catch (error: any) {
      console.error('Error updating campaign:', error)
      showError('Failed to update campaign', error.message || 'Please try again')
    } finally {
      setEditing(false)
    }
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
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Campaign not found</p>
            <Link href="/">
              <Button variant="outline" className="w-full mt-4">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const baseUrl = getBaseUrl()
  const submissionUrl = `${baseUrl}/submit/${campaign.slug || campaign.id}`
  const responses = campaign.responses || []
  const totalResponses = responses.length
  const sentimentBreakdown = responses.reduce((acc: any, r: any) => {
    const sentiment = r.sentiment || 'neutral'
    acc[sentiment] = (acc[sentiment] || 0) + 1
    return acc
  }, { positive: 0, neutral: 0, negative: 0 })

  const statusBreakdown = responses.reduce((acc: any, r: any) => {
    const status = r.status || 'new'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const resolvedCount = statusBreakdown.resolved || 0
  const resolutionRate = totalResponses > 0 ? ((resolvedCount / totalResponses) * 100).toFixed(1) : '0'

  const isActive = campaign.isActive
  const isClosed = campaign.closeDate && new Date(campaign.closeDate) < new Date()
  const isScheduled = campaign.startDate && new Date(campaign.startDate) > new Date()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        {/* Campaign Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
              <p className="text-lg text-muted-foreground">{campaign.question}</p>
            </div>
            <div className="flex gap-2">
              {isClosed ? (
                <Badge variant="destructive">Finished</Badge>
              ) : isScheduled ? (
                <Badge variant="secondary">Scheduled</Badge>
              ) : isActive ? (
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Active</Badge>
              ) : (
                <Badge variant="secondary">Paused</Badge>
              )}
              {(session?.user?.role === 'admin' || campaign.userId === session?.user?.id) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Initialize edit form with current values
                    if (isClosed) {
                      setEditStatus('finished')
                    } else if (!isActive) {
                      setEditStatus('paused')
                    } else {
                      setEditStatus('active')
                    }
                    setEditStartDate(campaign.startDate ? new Date(campaign.startDate).toISOString().slice(0, 16) : '')
                    setEditCloseDate(campaign.closeDate ? new Date(campaign.closeDate).toISOString().slice(0, 16) : '')
                    setShowEditDialog(true)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
            {campaign.startDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Started: {new Date(campaign.startDate).toLocaleDateString()}</span>
              </div>
            )}
            {campaign.closeDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Closes: {new Date(campaign.closeDate).toLocaleDateString()}</span>
              </div>
            )}
            {campaign.isRecurring && (
              <Badge variant="outline" className="text-xs">
                Recurring: {campaign.recurringInterval}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Cards */}
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
                  <p className="text-sm text-muted-foreground mb-1">Positive</p>
                  <p className="text-2xl font-bold text-green-500">{sentimentBreakdown.positive}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Neutral</p>
                  <p className="text-2xl font-bold text-gray-500">{sentimentBreakdown.neutral}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Negative</p>
                  <p className="text-2xl font-bold text-red-500">{sentimentBreakdown.negative}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-500 rotate-180" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submission Link & QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Share Campaign
              </CardTitle>
              <CardDescription>
                Share this link or QR code with your team to collect anonymous feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Submission Link</label>
                <div className="flex gap-2">
                  <Input value={submissionUrl} readOnly className="flex-1" />
                  <Button onClick={copyLink} variant="outline" size="icon">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {qrCodeDataUrl && (
                <div className="flex items-start gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">QR Code</label>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCodeDataUrl} alt="QR Code" className="w-32 h-32 border rounded bg-white p-2" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Share Message</label>
                    <Textarea
                      value={`We'd love to hear your feedback! Please share your thoughts anonymously: ${submissionUrl}`}
                      readOnly
                      rows={3}
                      className="mb-2"
                    />
                    <Button onClick={copyBlurb} variant="outline" size="sm">
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Message
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> All responses are 100% anonymous. No names, emails, or tracking.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Campaign Statistics
              </CardTitle>
              <CardDescription>
                Overview of responses and engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-3">Sentiment Distribution</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Positive</span>
                      <span className="text-sm font-medium">
                        {sentimentBreakdown.positive} ({totalResponses > 0 ? ((sentimentBreakdown.positive / totalResponses) * 100).toFixed(1) : '0'}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${totalResponses > 0 ? (sentimentBreakdown.positive / totalResponses) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Neutral</span>
                      <span className="text-sm font-medium">
                        {sentimentBreakdown.neutral} ({totalResponses > 0 ? ((sentimentBreakdown.neutral / totalResponses) * 100).toFixed(1) : '0'}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-400 transition-all"
                        style={{ width: `${totalResponses > 0 ? (sentimentBreakdown.neutral / totalResponses) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Negative</span>
                      <span className="text-sm font-medium">
                        {sentimentBreakdown.negative} ({totalResponses > 0 ? ((sentimentBreakdown.negative / totalResponses) * 100).toFixed(1) : '0'}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 transition-all"
                        style={{ width: `${totalResponses > 0 ? (sentimentBreakdown.negative / totalResponses) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3">Status Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(statusBreakdown).map(([status, count]: [string, any]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Resolution Rate</span>
                  <span className="text-lg font-bold">{resolutionRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4">
          <Link href={`/campaigns/${campaignId}/crm`} className="flex-1">
            <Button className="w-full" size="lg">
              <MessageSquare className="h-4 w-4 mr-2" />
              Open CRM
            </Button>
          </Link>
          <Link href={`/campaigns/${campaignId}/report`} className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Report
            </Button>
          </Link>
          {session?.user?.role === 'admin' && (
            <Button
              variant="destructive"
              size="lg"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>

        {/* Edit Campaign Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Campaign</DialogTitle>
              <DialogDescription>
                Update campaign status and dates
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="status">Campaign Status</Label>
                <select
                  id="status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'active' | 'paused' | 'finished')}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="finished">Finished</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {editStatus === 'active' && 'Campaign is currently running and accepting responses'}
                  {editStatus === 'paused' && 'Campaign is temporarily paused and not accepting responses'}
                  {editStatus === 'finished' && 'Campaign is closed and no longer accepting responses'}
                </p>
              </div>

              <div>
                <Label htmlFor="startDate">Start Date (Optional)</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  When the campaign started or should start
                </p>
              </div>

              <div>
                <Label htmlFor="closeDate">Close Date (Optional)</Label>
                <Input
                  id="closeDate"
                  type="datetime-local"
                  value={editCloseDate}
                  onChange={(e) => setEditCloseDate(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  When the campaign should close. Setting this will mark the campaign as finished.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                disabled={editing}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={editing}
              >
                {editing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{campaign?.title}&quot;? This action cannot be undone and will permanently delete the campaign and all associated responses, notes, and action items.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Campaign'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

