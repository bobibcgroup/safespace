'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight, Check, Calendar, RefreshCw } from 'lucide-react'
import { useToast } from './toast-provider'
import { LoadingSpinner } from './loading-spinner'

interface CampaignWizardProps {
  onComplete: (campaign: any) => void
  onCancel: () => void
}

export function CampaignWizard({ onComplete, onCancel }: CampaignWizardProps) {
  const { success, error: showError } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    question: '',
    startDate: '',
    closeDate: '',
    isRecurring: false,
    recurringInterval: 'monthly' as 'weekly' | 'monthly' | 'quarterly',
  })

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (step === 1 && (!formData.title.trim() || !formData.question.trim())) {
      showError('Required fields', 'Please fill in both title and question')
      return
    }
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          question: formData.question,
          startDate: formData.startDate || null,
          closeDate: formData.closeDate || null,
          isRecurring: formData.isRecurring,
          recurringInterval: formData.isRecurring ? formData.recurringInterval : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.details || 'Failed to create campaign')
      }

      const campaign = await response.json()
      success('Campaign created!', 'Your campaign is ready to share')
      onComplete(campaign)
    } catch (error: any) {
      console.error('Error creating campaign:', error)
      const errorMessage = error?.message || 'Failed to create campaign'
      showError('Failed to create campaign', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Title and question' },
    { number: 2, title: 'Settings', description: 'Dates and scheduling' },
    { number: 3, title: 'Review', description: 'Preview and create' },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    step >= s.number
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-muted text-muted-foreground'
                  }`}
                >
                  {step > s.number ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{s.number}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${step >= s.number ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-all ${
                    step > s.number ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>Step {step}: {steps[step - 1].title}</CardTitle>
          <CardDescription>{steps[step - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Monthly Team Pulse"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  A clear, descriptive title for your campaign
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="question">Question *</Label>
                <Textarea
                  id="question"
                  placeholder="What would you like to ask your team?"
                  value={formData.question}
                  onChange={(e) => updateField('question', e.target.value)}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  The question you want to ask your team anonymously
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Start Date (Optional)
                  </Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Campaign will start automatically on this date
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closeDate">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Close Date (Optional)
                  </Label>
                  <Input
                    id="closeDate"
                    type="datetime-local"
                    value={formData.closeDate}
                    onChange={(e) => updateField('closeDate', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Campaign will close automatically on this date
                  </p>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => updateField('isRecurring', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isRecurring" className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Recurring Campaign
                  </Label>
                </div>
                {formData.isRecurring && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="recurringInterval">Recurring Interval</Label>
                    <select
                      id="recurringInterval"
                      value={formData.recurringInterval}
                      onChange={(e) => updateField('recurringInterval', e.target.value)}
                      className="w-full px-3 py-2 rounded-md border bg-background"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">{formData.title || 'Untitled Campaign'}</h3>
                <p className="text-sm text-muted-foreground mb-4">{formData.question || 'No question set'}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span>{formData.startDate ? new Date(formData.startDate).toLocaleString() : 'Immediately'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Close Date:</span>
                    <span>{formData.closeDate ? new Date(formData.closeDate).toLocaleString() : 'No close date'}</span>
                  </div>
                  {formData.isRecurring && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recurring:</span>
                      <span className="capitalize">{formData.recurringInterval}</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Review your campaign details above. Click &quot;Create Campaign&quot; to proceed.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div>
              {step > 1 && (
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              {step < 3 ? (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Create Campaign
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

