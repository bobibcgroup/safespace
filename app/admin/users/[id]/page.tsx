'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { useToast } from '@/components/toast-provider'
import { LoadingSpinner } from '@/components/loading-spinner'
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

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const { success, error: showError } = useToast()
  const userId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'hr' as 'admin' | 'hr',
    telegramChatId: '',
  })

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${userId}`)
      if (!res.ok) throw new Error('Failed to fetch user')
      const user = await res.json()
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'hr',
        telegramChatId: user.telegramChatId || '',
      })
    } catch (error) {
      console.error('Error fetching user:', error)
      showError('Failed to load user', 'Please try again')
    } finally {
      setLoading(false)
    }
  }, [showError, userId])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        telegramChatId: formData.telegramChatId || null,
      }

      // Only include password if it's been changed
      if (formData.password.trim()) {
        updateData.password = formData.password
      }

      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update user')
      }

      success('User updated', 'User information has been saved')
      router.push('/admin/users')
    } catch (error: any) {
      console.error('Error updating user:', error)
      showError('Failed to update user', error.message || 'Please try again')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete user')

      success('User deleted', 'User has been removed')
      router.push('/admin/users')
    } catch (error) {
      console.error('Error deleting user:', error)
      showError('Failed to delete user', 'Please try again')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <div className="text-muted-foreground">Loading user...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link href="/admin/users" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
          <h1 className="text-3xl font-bold mb-2">Edit User</h1>
          <p className="text-muted-foreground">Update user information and permissions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Update user details and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium mb-2 block">
                  Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-medium mb-2 block">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium mb-2 block">
                  New Password (leave blank to keep current)
                </label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label htmlFor="role" className="text-sm font-medium mb-2 block">
                  Role
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'hr' })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label htmlFor="telegramChatId" className="text-sm font-medium mb-2 block">
                  Telegram Chat ID
                </label>
                <Input
                  id="telegramChatId"
                  value={formData.telegramChatId}
                  onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                  placeholder="Your Telegram chat ID"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  To get your Telegram chat ID, message @userinfobot on Telegram
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? (
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
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this user? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

