'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Bell, MessageSquare } from 'lucide-react'
import { useToast } from '@/components/toast-provider'
import { LoadingSpinner } from '@/components/loading-spinner'

export default function SettingsPage() {
  const { data: session } = useSession()
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [telegramChatId, setTelegramChatId] = useState('')
  const [preferences, setPreferences] = useState({
    telegram: true,
    newResponse: true,
    dailyDigest: false,
    weeklyDigest: true,
  })

  useEffect(() => {
    if (session?.user?.id) {
      fetchSettings()
    }
  }, [session])

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/users/${session?.user?.id}`)
      if (res.ok) {
        const user = await res.json()
        setTelegramChatId(user.telegramChatId || '')
        if (user.notificationPreferences) {
          try {
            setPreferences(JSON.parse(user.notificationPreferences))
          } catch {}
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!session?.user?.id) return

    setSaving(true)
    try {
      const res = await fetch(`/api/users/${session.user.id}/notifications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramChatId: telegramChatId.trim() || null,
          notificationPreferences: preferences,
        }),
      })

      if (!res.ok) throw new Error('Failed to save settings')

      success('Settings saved', 'Your notification preferences have been updated')
    } catch (error) {
      console.error('Error saving settings:', error)
      showError('Failed to save settings', 'Please try again')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <div className="text-muted-foreground">Loading settings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
          <p className="text-muted-foreground">Manage how you receive notifications</p>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Telegram Notifications
            </CardTitle>
            <CardDescription>
              Connect your Telegram account to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="telegramEnabled"
                checked={preferences.telegram}
                onChange={(e) => setPreferences({ ...preferences, telegram: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="telegramEnabled" className="text-sm font-medium">
                Enable Telegram notifications
              </label>
            </div>
            {preferences.telegram && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="telegramChatId" className="text-sm font-medium mb-2 block">
                    Telegram Chat ID
                  </label>
                  <Input
                    id="telegramChatId"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder="Your Telegram chat ID"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    To get your Telegram chat ID, message @userinfobot on Telegram
                  </p>
                </div>
                <div className="space-y-2 pl-6 border-l-2 border-muted">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="newResponse"
                      checked={preferences.newResponse}
                      onChange={(e) => setPreferences({ ...preferences, newResponse: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="newResponse" className="text-sm">
                      Notify on new responses
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="dailyDigest"
                      checked={preferences.dailyDigest}
                      onChange={(e) => setPreferences({ ...preferences, dailyDigest: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="dailyDigest" className="text-sm">
                      Daily digest
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="weeklyDigest"
                      checked={preferences.weeklyDigest}
                      onChange={(e) => setPreferences({ ...preferences, weeklyDigest: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="weeklyDigest" className="text-sm">
                      Weekly digest
                    </label>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-2">
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
          <Link href="/">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

