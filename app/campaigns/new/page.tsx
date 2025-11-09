'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Copy, Check, QrCode } from 'lucide-react'
import QRCode from 'qrcode'
import { getBaseUrl } from '@/lib/utils'
import { useToast } from '@/components/toast-provider'
import { LoadingSpinner } from '@/components/loading-spinner'
import { CampaignWizard } from '@/components/campaign-wizard'

export default function NewCampaignPage() {
  const router = useRouter()
  const { success } = useToast()
  const [createdCampaign, setCreatedCampaign] = useState<any>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const handleComplete = async (campaign: any) => {
    setCreatedCampaign(campaign)
    
    // Generate QR code
    const baseUrl = getBaseUrl()
    const submissionUrl = `${baseUrl}/submit/${campaign.slug || campaign.id}`
    const qrCode = await QRCode.toDataURL(submissionUrl)
    setQrCodeDataUrl(qrCode)
  }

  const copyLink = () => {
    if (createdCampaign) {
      const baseUrl = getBaseUrl()
      const submissionUrl = `${baseUrl}/submit/${createdCampaign.slug || createdCampaign.id}`
      navigator.clipboard.writeText(submissionUrl)
      setCopied(true)
      success('Link copied', 'Submission link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyBlurb = () => {
    const blurb = `We'd love to hear your feedback! Please share your thoughts anonymously: ${getBaseUrl()}/submit/${createdCampaign.slug || createdCampaign.id}`
    navigator.clipboard.writeText(blurb)
    setCopied(true)
    success('Message copied', 'Share message copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  if (createdCampaign) {
    const baseUrl = getBaseUrl()
    const submissionUrl = `${baseUrl}/submit/${createdCampaign.slug || createdCampaign.id}`

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">🎉 Campaign Created!</CardTitle>
              <CardDescription>
                Share this link with your team to collect anonymous feedback
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
                    <img src={qrCodeDataUrl} alt="QR Code" className="w-32 h-32 border rounded" />
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
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Note:</strong> Your team&apos;s responses are 100% anonymous. No names, emails, or tracking.
                </p>
                <div className="flex gap-2">
                  <Link href={`/campaigns/${createdCampaign.id}/crm`}>
                    <Button>Open CRM</Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline">Back to Dashboard</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <CampaignWizard
          onComplete={handleComplete}
          onCancel={() => router.push('/')}
        />
      </div>
    </div>
  )
}

