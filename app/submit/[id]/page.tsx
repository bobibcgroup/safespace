'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Confetti } from '@/components/confetti'
import { Heart, Shield, Lock } from 'lucide-react'
import { LoadingSpinner } from '@/components/loading-spinner'

const moods = [
  { emoji: '😀', value: '😀' },
  { emoji: '🙂', value: '🙂' },
  { emoji: '😐', value: '😐' },
  { emoji: '🙁', value: '🙁' },
  { emoji: '😞', value: '😞' },
]

export default function SubmitPage() {
  const params = useParams()
  const campaignIdOrSlug = params.id as string
  const [campaign, setCampaign] = useState<any>(null)
  const [text, setText] = useState('')
  const [selectedMood, setSelectedMood] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string>('')
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Try slug first, then fallback to ID
    const fetchCampaign = async () => {
      try {
        // First try slug endpoint
        let res = await fetch(`/api/campaigns/slug/${campaignIdOrSlug}`)
        let data = res.ok ? await res.json() : null
        
        // If slug lookup fails, try ID lookup
        if (!data || data.error) {
          res = await fetch(`/api/campaigns/${campaignIdOrSlug}`)
          data = res.ok ? await res.json() : null
        }
        
        if (!data || data.error) {
          setError(data?.error || 'Campaign not found')
        } else {
          // Check if campaign is closed
          const isClosed = data.closeDate ? new Date(data.closeDate) < new Date() : !data.isActive
          if (isClosed) {
            setError('This pulse is closed. Thank you for your interest.')
          } else {
            setCampaign(data)
          }
        }
      } catch (err) {
        console.error('Error fetching campaign:', err)
        setError('Failed to load campaign')
      }
    }
    
    fetchCampaign()
  }, [campaignIdOrSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !campaign) return

    setLoading(true)
    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id, // Use the actual campaign ID from fetched data
          text: text.trim(),
          mood: selectedMood || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit response')
      }

      setSubmitted(true)
      setShowConfetti(true)
    } catch (error: any) {
      console.error('Error submitting response:', error)
      setError(error.message || 'Failed to submit response. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Campaign Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {showConfetti && <Confetti />}
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="text-6xl mb-4">🎉</div>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              Thanks for helping us improve. You make this place better.
            </p>
            <p className="text-sm text-muted-foreground">
              Your feedback has been submitted anonymously.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!campaign && !error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <div className="text-muted-foreground">Loading campaign...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-6 w-6 text-primary" />
            <CardTitle className="text-3xl">Your voice matters.</CardTitle>
          </div>
          <CardDescription className="text-base">
            {campaign.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-lg font-medium mb-2">Question:</p>
              <p className="text-foreground">{campaign.question}</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <Shield className="h-4 w-4 text-green-500" />
              <span>This is truly anonymous. No names. No emails. No tracking. We welcome both positive and negative feedback—your honest thoughts help us grow!</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="response" className="text-sm font-medium mb-2 block">
                  Your Response
                </label>
                <Textarea
                  id="response"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={8}
                  className="text-base"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  How are you feeling? (Optional)
                </label>
                <div className="flex gap-2">
                  {moods.map(mood => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setSelectedMood(selectedMood === mood.value ? '' : mood.value)}
                      className={`text-3xl p-2 rounded-lg border-2 transition-all ${
                        selectedMood === mood.value
                          ? 'border-primary bg-primary/10 scale-110'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {mood.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !text.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

