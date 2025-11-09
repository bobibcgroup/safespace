'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { ArrowLeft, MessageSquare, Plus, Edit, CheckCircle, XCircle, Trash2, Search, Filter, Download, Sparkles, Bookmark, BookmarkCheck } from 'lucide-react'
import { useToast } from '@/components/toast-provider'
import { LoadingSpinner } from '@/components/loading-spinner'
import { DraggableResponse } from '@/components/draggable-response'
import { DroppableColumn } from '@/components/droppable-column'

const statuses = [
  { id: 'new', label: 'New', color: 'bg-blue-500/20 border-blue-500/50' },
  { id: 'needs_attention', label: 'Needs Attention', color: 'bg-red-500/20 border-red-500/50' },
  { id: 'in_review', label: 'In Review', color: 'bg-yellow-500/20 border-yellow-500/50' },
  { id: 'resolved', label: 'Resolved', color: 'bg-green-500/20 border-green-500/50' },
  { id: 'parked', label: 'Parked', color: 'bg-gray-500/20 border-gray-500/50' },
]

const attentionBadges = {
  urgent: { emoji: '🟥', label: 'Urgent', color: 'text-red-500' },
  moderate: { emoji: '🟨', label: 'Moderate', color: 'text-yellow-500' },
  positive: { emoji: '🟩', label: 'Positive', color: 'text-green-500' },
}

const sentimentColors = {
  positive: 'text-green-500',
  neutral: 'text-gray-400',
  negative: 'text-red-500',
}

export default function CRMPage() {
  const params = useParams()
  const router = useRouter()
  const { success, error: showError } = useToast()
  const campaignId = params.id as string
  const [campaign, setCampaign] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [selectedResponse, setSelectedResponse] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [note, setNote] = useState('')
  const [actionItemTitle, setActionItemTitle] = useState('')
  const [actionItemOwner, setActionItemOwner] = useState('')
  const [actionItemDueDate, setActionItemDueDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSentiment, setFilterSentiment] = useState<string>('all')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [editingActionItem, setEditingActionItem] = useState<string | null>(null)
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null)
  const [deleteActionItemId, setDeleteActionItemId] = useState<string | null>(null)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkStatus, setBulkStatus] = useState<string>('')
  const [bulkTag, setBulkTag] = useState<string>('')
  const [bulkAssignTo, setBulkAssignTo] = useState<string>('')
  const [users, setUsers] = useState<any[]>([])
  const [filterTag, setFilterTag] = useState<string>('all')
  const [aiSuggestions, setAiSuggestions] = useState<any>(null)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [savedFilterPresets, setSavedFilterPresets] = useState<any[]>([])
  const [activePreset, setActivePreset] = useState<string | null>(null)

  useEffect(() => {
    fetchCampaign()
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`)
      const data = await res.json()
      if (data.error) {
        console.error('Error fetching campaign:', data.error)
        return
      }
      setCampaign(data)
      setResponses(data.responses || [])
    } catch (error) {
      console.error('Error fetching campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateResponseStatus = async (responseId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/responses/${responseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update response')

      // Update local state
      setResponses(responses.map(r => 
        r.id === responseId ? { ...r, status: newStatus } : r
      ))
      
      if (selectedResponse?.id === responseId) {
        setSelectedResponse({ ...selectedResponse, status: newStatus })
      }
      
      success('Status updated', `Response moved to ${statuses.find(s => s.id === newStatus)?.label}`)
    } catch (error) {
      console.error('Error updating response:', error)
      showError('Failed to update response status', 'Please try again')
    }
  }

  const addNote = async () => {
    if (!note.trim() || !selectedResponse) return

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          responseId: selectedResponse.id,
          text: note.trim(),
        }),
      })

      if (!res.ok) throw new Error('Failed to add note')

      const newNote = await res.json()
      setNote('')
      
      // Update local state with new note
      setSelectedResponse({
        ...selectedResponse,
        notes: [...(selectedResponse.notes || []), newNote],
      })
      
      // Refresh campaign data
      fetchCampaign()
      success('Note added', 'Your note has been saved')
    } catch (error) {
      console.error('Error adding note:', error)
      showError('Failed to add note', 'Please try again')
    }
  }

  const createActionItem = async () => {
    if (!actionItemTitle.trim() || !selectedResponse) return

    try {
      const res = await fetch('/api/action-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          responseId: selectedResponse.id,
          title: actionItemTitle.trim(),
          owner: actionItemOwner.trim() || null,
          dueDate: actionItemDueDate || null,
        }),
      })

      if (!res.ok) throw new Error('Failed to create action item')

      const newActionItem = await res.json()
      setActionItemTitle('')
      setActionItemOwner('')
      setActionItemDueDate('')
      
      // Update local state with new action item
      setSelectedResponse({
        ...selectedResponse,
        actionItems: [...(selectedResponse.actionItems || []), newActionItem],
      })
      
      // Refresh campaign data
      fetchCampaign()
      success('Action item created', 'Action item has been added')
    } catch (error) {
      console.error('Error creating action item:', error)
      showError('Failed to create action item', 'Please try again')
    }
  }

  const openResponse = (response: any) => {
    // Fetch full response with notes and action items
    const fullResponse = responses.find(r => r.id === response.id)
    setSelectedResponse(fullResponse || response)
    setAiSuggestions(null) // Clear previous suggestions
    setIsDialogOpen(true)
  }

  const getResponsePreview = (text: string) => {
    return text.length > 100 ? text.substring(0, 100) + '...' : text
  }

  const getThemes = (response: any) => {
    try {
      return response.themes ? JSON.parse(response.themes) : []
    } catch {
      return []
    }
  }

  // Get all unique tags from responses
  const allTags = new Set<string>()
  responses.forEach((response: any) => {
    if (response.tags) {
      try {
        const tags = JSON.parse(response.tags)
        tags.forEach((tag: string) => allTags.add(tag))
      } catch {}
    }
  })

  // Filter and search responses
  const filteredResponses = responses.filter((response) => {
    // Search filter
    if (searchQuery && !response.text.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Status filter
    if (filterStatus !== 'all' && response.status !== filterStatus) {
      return false
    }
    
    // Sentiment filter
    if (filterSentiment !== 'all' && response.sentiment !== filterSentiment) {
      return false
    }
    
    // Tag filter
    if (filterTag !== 'all') {
      if (!response.tags) return false
      try {
        const tags = JSON.parse(response.tags)
        if (!tags.includes(filterTag)) return false
      } catch {
        return false
      }
    }
    
    return true
  })

  // Delete note
  const deleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete note')

      setSelectedResponse({
        ...selectedResponse,
        notes: selectedResponse.notes.filter((n: any) => n.id !== noteId),
      })
      fetchCampaign()
      success('Note deleted', 'Note has been removed')
    } catch (error) {
      console.error('Error deleting note:', error)
      showError('Failed to delete note', 'Please try again')
    }
  }

  // Delete action item
  const deleteActionItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/action-items/${itemId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete action item')

      setSelectedResponse({
        ...selectedResponse,
        actionItems: selectedResponse.actionItems.filter((a: any) => a.id !== itemId),
      })
      fetchCampaign()
      success('Action item deleted', 'Action item has been removed')
    } catch (error) {
      console.error('Error deleting action item:', error)
      showError('Failed to delete action item', 'Please try again')
    }
  }

  // Generate AI suggestions for action items
  const generateAISuggestions = async () => {
    if (!selectedResponse) return

    setLoadingSuggestions(true)
    try {
      const res = await fetch('/api/ai/suggest-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          responseId: selectedResponse.id,
        }),
      })

      if (!res.ok) throw new Error('Failed to generate suggestions')

      const data = await res.json()
      setAiSuggestions(data)
      success('AI suggestions generated', 'Review and add suggested action items')
    } catch (error) {
      console.error('Error generating AI suggestions:', error)
      showError('Failed to generate suggestions', 'Please try again')
    } finally {
      setLoadingSuggestions(false)
    }
  }

  // Create action item from AI suggestion
  const createFromSuggestion = async (suggestion: any) => {
    if (!selectedResponse) return

    try {
      const res = await fetch('/api/action-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          responseId: selectedResponse.id,
          title: suggestion.title,
          owner: null,
          dueDate: null,
        }),
      })

      if (!res.ok) throw new Error('Failed to create action item')

      const newActionItem = await res.json()
      setSelectedResponse({
        ...selectedResponse,
        actionItems: [...(selectedResponse.actionItems || []), newActionItem],
      })
      fetchCampaign()
      success('Action item created', 'Action item has been added from AI suggestion')
    } catch (error) {
      console.error('Error creating action item:', error)
      showError('Failed to create action item', 'Please try again')
    }
  }

  // Update action item completion
  const toggleActionItem = async (itemId: string, isCompleted: boolean) => {
    try {
      const res = await fetch(`/api/action-items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !isCompleted }),
      })

      if (!res.ok) throw new Error('Failed to update action item')

      setSelectedResponse({
        ...selectedResponse,
        actionItems: selectedResponse.actionItems.map((a: any) =>
          a.id === itemId ? { ...a, isCompleted: !isCompleted } : a
        ),
      })
      fetchCampaign()
      success(isCompleted ? 'Action item reopened' : 'Action item completed', 'Status updated')
    } catch (error) {
      console.error('Error updating action item:', error)
      showError('Failed to update action item', 'Please try again')
    }
  }

  // Handle ESC key to close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDialogOpen) {
        setIsDialogOpen(false)
      }
      if (e.key === 'Escape' && showExportDialog) {
        setShowExportDialog(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isDialogOpen, showExportDialog])

  // Toggle response selection
  const toggleResponseSelection = (responseId: string) => {
    setSelectedResponses(prev => {
      const next = new Set(prev)
      if (next.has(responseId)) {
        next.delete(responseId)
      } else {
        next.add(responseId)
      }
      return next
    })
  }

  // Select all filtered responses
  const selectAll = () => {
    setSelectedResponses(new Set(filteredResponses.map(r => r.id)))
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedResponses(new Set())
  }

  // Bulk update responses
  const bulkUpdateResponses = async () => {
    if (selectedResponses.size === 0) return

    try {
      const updateData: any = {}
      if (bulkStatus) updateData.status = bulkStatus
      if (bulkAssignTo) updateData.assignedTo = bulkAssignTo
      if (bulkTag) {
        // Get existing tags and add new one
        const responseIds = Array.from(selectedResponses)
        const responses = await Promise.all(
          responseIds.map(id => 
            fetch(`/api/responses/${id}`).then(r => r.json())
          )
        )
        const allTags = new Set<string>()
        responses.forEach((r: any) => {
          if (r.tags) {
            try {
              const tags = JSON.parse(r.tags)
              tags.forEach((tag: string) => allTags.add(tag))
            } catch {}
          }
        })
        allTags.add(bulkTag)
        updateData.tags = Array.from(allTags)
      }

      const res = await fetch('/api/responses/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responseIds: Array.from(selectedResponses),
          ...updateData,
        }),
      })

      if (!res.ok) throw new Error('Failed to bulk update')

      success('Bulk update successful', `${selectedResponses.size} responses updated`)
      setShowBulkActions(false)
      setSelectedResponses(new Set())
      setBulkStatus('')
      setBulkTag('')
      setBulkAssignTo('')
      fetchCampaign()
    } catch (error) {
      console.error('Error bulk updating:', error)
      showError('Failed to bulk update', 'Please try again')
    }
  }

  // Export responses
  const exportResponses = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams({
        format,
        ...(filterStatus !== 'all' ? { status: filterStatus } : {}),
        ...(filterSentiment !== 'all' ? { sentiment: filterSentiment } : {}),
      })

      const res = await fetch(`/api/campaigns/${campaignId}/export?${params}`)
      if (!res.ok) throw new Error('Failed to export')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${campaign?.title.replace(/[^a-z0-9]/gi, '_')}_responses_${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      success('Export successful', `Responses exported as ${format.toUpperCase()}`)
      setShowExportDialog(false)
    } catch (error) {
      console.error('Error exporting:', error)
      showError('Failed to export responses', 'Please try again')
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

  const responsesByStatus = statuses.reduce((acc, status) => {
    acc[status.id] = filteredResponses.filter(r => r.status === status.id)
    return acc
  }, {} as Record<string, any[]>)

  // Handle drag and drop
  const handleDrop = async (responseId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/responses/${responseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      success('Status updated', 'Response moved successfully')
      fetchCampaign()
    } catch (error) {
      console.error('Error updating status:', error)
      showError('Failed to update status', 'Please try again')
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
              <p className="text-muted-foreground">{campaign.question}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(true)}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                onClick={() => setViewMode('kanban')}
                size="sm"
              >
                Kanban
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                size="sm"
              >
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedResponses.size > 0 && (
          <Card className="mb-6 bg-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-medium">
                    {selectedResponses.size} response{selectedResponses.size !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                  >
                    Bulk Actions
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                  >
                    Clear Selection
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                >
                  Select All ({filteredResponses.length})
                </Button>
              </div>
              {showBulkActions && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={bulkStatus}
                      onChange={(e) => setBulkStatus(e.target.value)}
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm flex-1"
                    >
                      <option value="">Change Status...</option>
                      {statuses.map(status => (
                        <option key={status.id} value={status.id}>{status.label}</option>
                      ))}
                    </select>
                    <select
                      value={bulkAssignTo}
                      onChange={(e) => setBulkAssignTo(e.target.value)}
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm flex-1"
                    >
                      <option value="">Assign to...</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name || user.email}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder="Add tag..."
                      value={bulkTag}
                      onChange={(e) => setBulkTag(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && bulkTag.trim()) {
                          bulkUpdateResponses()
                        }
                      }}
                    />
                    <Button onClick={bulkUpdateResponses} disabled={!bulkStatus && !bulkTag.trim() && !bulkAssignTo}>
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search responses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value)
                      setActivePreset(null)
                    }}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All Status</option>
                    {statuses.map(status => (
                      <option key={status.id} value={status.id}>{status.label}</option>
                    ))}
                  </select>
                  <select
                    value={filterSentiment}
                    onChange={(e) => {
                      setFilterSentiment(e.target.value)
                      setActivePreset(null)
                    }}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All Sentiment</option>
                    <option value="positive">Positive</option>
                    <option value="neutral">Neutral</option>
                    <option value="negative">Negative</option>
                  </select>
                  {allTags.size > 0 && (
                    <select
                      value={filterTag}
                      onChange={(e) => {
                        setFilterTag(e.target.value)
                        setActivePreset(null)
                      }}
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="all">All Tags</option>
                      {Array.from(allTags).map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              {/* Quick Filter Presets */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
                <span className="text-sm text-muted-foreground">Quick Filters:</span>
                <Button
                  variant={filterStatus === 'needs_attention' && filterSentiment === 'all' && filterTag === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilterStatus('needs_attention')
                    setFilterSentiment('all')
                    setFilterTag('all')
                    setActivePreset('needs-attention')
                  }}
                >
                  Needs Attention
                </Button>
                <Button
                  variant={filterSentiment === 'negative' && filterStatus === 'all' && filterTag === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilterSentiment('negative')
                    setFilterStatus('all')
                    setFilterTag('all')
                    setActivePreset('negative')
                  }}
                >
                  Negative Feedback
                </Button>
                <Button
                  variant={filterStatus === 'new' && filterSentiment === 'all' && filterTag === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilterStatus('new')
                    setFilterSentiment('all')
                    setFilterTag('all')
                    setActivePreset('new')
                  }}
                >
                  New Items
                </Button>
                <Button
                  variant={filterStatus === 'resolved' && filterSentiment === 'all' && filterTag === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilterStatus('resolved')
                    setFilterSentiment('all')
                    setFilterTag('all')
                    setActivePreset('resolved')
                  }}
                >
                  Resolved
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterStatus('all')
                    setFilterSentiment('all')
                    setFilterTag('all')
                    setSearchQuery('')
                    setActivePreset(null)
                  }}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Summary */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{responses.length}</div>
              <div className="text-sm text-muted-foreground">Total Responses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-500">
                {responses.filter(r => r.status === 'needs_attention').length}
              </div>
              <div className="text-sm text-muted-foreground">Needs Attention</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-500">
                {responses.filter(r => r.status === 'resolved').length}
              </div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {Math.round((responses.filter(r => r.status === 'resolved').length / Math.max(responses.length, 1)) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Resolution Rate</div>
            </CardContent>
          </Card>
        </div>

        {viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {statuses.map(status => (
              <DroppableColumn
                key={status.id}
                statusId={status.id}
                statusLabel={status.label}
                onDrop={handleDrop}
              >
                <div className={`p-3 rounded-lg border ${status.color} mb-3`}>
                  <h3 className="font-semibold">{status.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {responsesByStatus[status.id]?.length || 0} items
                  </p>
                </div>
                {responsesByStatus[status.id]?.map(response => (
                  <DraggableResponse
                    key={response.id}
                    response={response}
                    onClick={() => openResponse(response)}
                  >
                    <Card
                      className={`cursor-pointer hover:shadow-lg transition-shadow ${
                        selectedResponses.has(response.id) ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedResponses.has(response.id)}
                            onChange={() => toggleResponseSelection(response.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 h-4 w-4 rounded border-gray-300"
                          />
                          <p className="text-sm flex-1 line-clamp-3">
                            {getResponsePreview(response.text)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {response.sentiment && (
                            <span className={`text-xs font-medium ${sentimentColors[response.sentiment as keyof typeof sentimentColors]}`}>
                              {response.sentiment}
                            </span>
                          )}
                          {response.attention && (
                            <span className={`text-xs ${attentionBadges[response.attention as keyof typeof attentionBadges]?.color}`}>
                              {attentionBadges[response.attention as keyof typeof attentionBadges]?.emoji}
                            </span>
                          )}
                          {getThemes(response).slice(0, 2).map((theme: string, idx: number) => (
                            <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                              {theme}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </DraggableResponse>
                ))}
              </DroppableColumn>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredResponses.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No responses match your filters</p>
                </CardContent>
              </Card>
            ) : (
              filteredResponses.map(response => (
              <Card
                key={response.id}
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedResponses.has(response.id) ? 'ring-2 ring-primary' : ''
                }`}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
                    return
                  }
                  openResponse(response)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedResponses.has(response.id)}
                      onChange={() => toggleResponseSelection(response.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                    <p className="flex-1">{response.text}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded ${statuses.find(s => s.id === response.status)?.color}`}>
                        {statuses.find(s => s.id === response.status)?.label}
                      </span>
                      {response.sentiment && (
                        <span className={`text-xs font-medium ${sentimentColors[response.sentiment as keyof typeof sentimentColors]}`}>
                          {response.sentiment}
                        </span>
                      )}
                      {response.attention && (
                        <span className={`text-xs ${attentionBadges[response.attention as keyof typeof attentionBadges]?.color}`}>
                          {attentionBadges[response.attention as keyof typeof attentionBadges]?.emoji} {attentionBadges[response.attention as keyof typeof attentionBadges]?.label}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(response.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {statuses.map(status => (
                        <Button
                          key={status.id}
                          variant={response.status === status.id ? "default" : "outline"}
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateResponseStatus(response.id, status.id)
                          }}
                          className="h-8 w-8"
                          title={status.label}
                        >
                          {response.status === status.id ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-xs">{status.label.charAt(0)}</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Response Details</DialogTitle>
              <DialogDescription>
                Full response text and management options
              </DialogDescription>
            </DialogHeader>
            {selectedResponse && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Response</h4>
                  <p className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                    {selectedResponse.text}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Status:</span>
                    <select
                      value={selectedResponse.status}
                      onChange={(e) => {
                        updateResponseStatus(selectedResponse.id, e.target.value)
                        setSelectedResponse({ ...selectedResponse, status: e.target.value })
                      }}
                      className="ml-2 px-2 py-1 rounded border bg-background"
                    >
                      {statuses.map(status => (
                        <option key={status.id} value={status.id}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedResponse.sentiment && (
                    <div>
                      <span className="text-xs text-muted-foreground">Sentiment:</span>
                      <span className={`ml-2 text-xs font-medium ${sentimentColors[selectedResponse.sentiment as keyof typeof sentimentColors]}`}>
                        {selectedResponse.sentiment}
                      </span>
                    </div>
                  )}
                  {selectedResponse.attention && (
                    <div>
                      <span className="text-xs text-muted-foreground">Attention:</span>
                      <span className={`ml-2 text-xs ${attentionBadges[selectedResponse.attention as keyof typeof attentionBadges]?.color}`}>
                        {attentionBadges[selectedResponse.attention as keyof typeof attentionBadges]?.emoji} {attentionBadges[selectedResponse.attention as keyof typeof attentionBadges]?.label}
                      </span>
                    </div>
                  )}
                  {selectedResponse.aiLabels && (() => {
                    try {
                      const labels = JSON.parse(selectedResponse.aiLabels)
                      if (labels.categories && labels.categories.length > 0) {
                        return (
                          <div>
                            <span className="text-xs text-muted-foreground">Categories:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {labels.categories.map((cat: string, idx: number) => (
                                <span key={idx} className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      }
                      return null
                    } catch {
                      return null
                    }
                  })()}
                </div>

                <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Notes</h4>
                      {selectedResponse.notes && selectedResponse.notes.length > 0 ? (
                        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                      {selectedResponse.notes.map((noteItem: any) => (
                        <div key={noteItem.id} className="p-3 bg-muted rounded-lg text-sm relative group">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs text-muted-foreground">
                              {noteItem.user?.name || 'System'} • {new Date(noteItem.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingNote(noteItem.id)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteNoteId(noteItem.id)
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {editingNote === noteItem.id ? (
                            <div className="space-y-2">
                              <Textarea
                                defaultValue={noteItem.text}
                                rows={2}
                                className="text-sm"
                                autoFocus
                                onBlur={async (e) => {
                                  const newText = e.target.value.trim()
                                  if (newText && newText !== noteItem.text) {
                                    try {
                                      const res = await fetch(`/api/notes/${noteItem.id}`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ text: newText }),
                                      })
                                      if (res.ok) {
                                        const updated = await res.json()
                                        setSelectedResponse({
                                          ...selectedResponse,
                                          notes: selectedResponse.notes.map((n: any) =>
                                            n.id === noteItem.id ? updated : n
                                          ),
                                        })
                                        fetchCampaign()
                                        success('Note updated', 'Your note has been saved')
                                      }
                                    } catch (error) {
                                      console.error('Error updating note:', error)
                                      showError('Failed to update note', 'Please try again')
                                    }
                                  }
                                  setEditingNote(null)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && e.ctrlKey) {
                                    e.currentTarget.blur()
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingNote(null)
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <p className="text-foreground whitespace-pre-wrap">{noteItem.text}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-4">No notes yet</p>
                  )}
                  <div className="space-y-2">
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add internal notes..."
                      rows={3}
                      className="mb-2"
                    />
                    <Button onClick={addNote} size="sm" disabled={!note.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Action Items</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateAISuggestions}
                      disabled={loadingSuggestions}
                    >
                      {loadingSuggestions ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          AI Suggestions
                        </>
                      )}
                    </Button>
                  </div>

                  {/* AI Suggestions */}
                  {aiSuggestions && (
                    <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">AI Suggested Action Items</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAiSuggestions(null)}
                        >
                          ×
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {aiSuggestions.actionItems?.map((suggestion: any, idx: number) => (
                          <div key={idx} className="p-2 bg-background rounded border">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{suggestion.title}</p>
                                {suggestion.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                                )}
                                {suggestion.priority && (
                                  <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded ${
                                    suggestion.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                                    suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                                    'bg-blue-500/20 text-blue-500'
                                  }`}>
                                    {suggestion.priority} priority
                                  </span>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => createFromSuggestion(suggestion)}
                                className="ml-2"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {aiSuggestions.categories && aiSuggestions.categories.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-1">Categories:</p>
                          <div className="flex flex-wrap gap-1">
                            {aiSuggestions.categories.map((cat: string, idx: number) => (
                              <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedResponse.actionItems && selectedResponse.actionItems.length > 0 ? (
                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                      {selectedResponse.actionItems.map((item: any) => (
                        <div key={item.id} className="p-3 bg-muted rounded-lg text-sm relative group">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2 flex-1">
                              <button
                                onClick={() => toggleActionItem(item.id, item.isCompleted)}
                                className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                                  item.isCompleted
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-muted-foreground'
                                }`}
                              >
                                {item.isCompleted && <CheckCircle className="h-3 w-3 text-white" />}
                              </button>
                              <span className={`font-medium flex-1 ${item.isCompleted ? 'line-through opacity-60' : ''}`}>
                                {item.title}
                              </span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingActionItem(item.id)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteActionItemId(item.id)
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {item.owner && (
                            <p className="text-xs text-muted-foreground ml-6">Owner: {item.owner}</p>
                          )}
                          {item.dueDate && (
                            <p className={`text-xs ml-6 ${
                              new Date(item.dueDate) < new Date() && !item.isCompleted
                                ? 'text-red-500'
                                : 'text-muted-foreground'
                            }`}>
                              Due: {new Date(item.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-4">No action items yet</p>
                  )}
                  <div className="space-y-2">
                    <Input
                      value={actionItemTitle}
                      onChange={(e) => setActionItemTitle(e.target.value)}
                      placeholder="Action item title"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && actionItemTitle.trim()) {
                          createActionItem()
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <Input
                        value={actionItemOwner}
                        onChange={(e) => setActionItemOwner(e.target.value)}
                        placeholder="Owner (optional)"
                        className="flex-1"
                      />
                      <Input
                        type="date"
                        value={actionItemDueDate}
                        onChange={(e) => setActionItemDueDate(e.target.value)}
                        placeholder="Due date (optional)"
                        className="flex-1"
                      />
                    </div>
                    <Button onClick={createActionItem} size="sm" disabled={!actionItemTitle.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Action Item
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close (ESC)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Note Confirmation */}
        <AlertDialog open={!!deleteNoteId} onOpenChange={(open) => !open && setDeleteNoteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Note</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this note? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteNoteId) {
                    deleteNote(deleteNoteId)
                    setDeleteNoteId(null)
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Action Item Confirmation */}
        <AlertDialog open={!!deleteActionItemId} onOpenChange={(open) => !open && setDeleteActionItemId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Action Item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this action item? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteActionItemId) {
                    deleteActionItem(deleteActionItemId)
                    setDeleteActionItemId(null)
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Responses</DialogTitle>
              <DialogDescription>
                Export filtered responses in your preferred format
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Format</label>
                <div className="flex gap-2">
                  <Button
                    variant={exportFormat === 'csv' ? 'default' : 'outline'}
                    onClick={() => setExportFormat('csv')}
                    size="sm"
                  >
                    CSV
                  </Button>
                  <Button
                    variant={exportFormat === 'json' ? 'default' : 'outline'}
                    onClick={() => setExportFormat('json')}
                    size="sm"
                  >
                    JSON
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Current filters:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Status: {filterStatus === 'all' ? 'All' : statuses.find(s => s.id === filterStatus)?.label}</li>
                  <li>Sentiment: {filterSentiment === 'all' ? 'All' : filterSentiment}</li>
                  <li>Total responses: {filteredResponses.length}</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => exportResponses(exportFormat)}>
                <Download className="h-4 w-4 mr-2" />
                Export {exportFormat.toUpperCase()}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </DndProvider>
  )
}

