'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, Plus, Users, Trash2, Edit } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/toast-provider'
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
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/loading-spinner'

export default function UsersPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { success, error: showError } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'hr' as 'admin' | 'hr',
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<any>(null)
  const [reassignToUserId, setReassignToUserId] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [dataCounts, setDataCounts] = useState<{ campaigns: number; notes: number } | null>(null)

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      router.push('/')
      return
    }
    fetchUsers()
  }, [session, router])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        showError('Failed to create user', data.error || 'Please try again')
        return
      }

      setIsDialogOpen(false)
      setFormData({ email: '', name: '', password: '', role: 'hr' })
      success('User created', 'New user has been created successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error creating user:', error)
      showError('Failed to create user', 'Please try again')
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    // If user has data but no reassignment target, don't proceed
    if (dataCounts && (dataCounts.campaigns > 0 || dataCounts.notes > 0) && !reassignToUserId) {
      showError('Reassignment required', 'Please select a user to reassign data to')
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reassignToUserId: reassignToUserId || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        
        // If reassignment is required, update the dialog
        if (data.requiresReassignment) {
          setDataCounts(data.dataCounts)
          showError('Reassignment required', data.error)
          return
        }

        throw new Error(data.error || 'Failed to delete user')
      }

      const result = await res.json()
      
      if (result.reassigned) {
        success(
          'User deleted',
          `User deleted. ${result.reassigned.campaigns} campaign(s) and ${result.reassigned.notes} note(s) were reassigned.`
        )
      } else {
        success('User deleted', 'User has been deleted successfully')
      }

      setDeleteDialogOpen(false)
      setUserToDelete(null)
      setReassignToUserId('')
      setDataCounts(null)
      fetchUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      showError('Failed to delete user', error.message || 'Please try again')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">User Management</h1>
              <p className="text-muted-foreground">Create and manage HR users</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(user => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{user.name || user.email}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    user.role === 'admin' 
                      ? 'bg-purple-500/20 text-purple-500' 
                      : 'bg-blue-500/20 text-blue-500'
                  }`}>
                    {user.role.toUpperCase()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-3">
                  <p>{user._count?.campaigns || 0} campaigns</p>
                  <p className="text-xs mt-1">
                    Created {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/users/${user.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setUserToDelete(user)
                      setReassignToUserId('')
                      setDataCounts({
                        campaigns: user._count?.campaigns || 0,
                        notes: user._count?.notes || 0,
                      })
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Delete User Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="sm:max-w-[500px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                {userToDelete && (
                  <>
                    Are you sure you want to delete <strong>{userToDelete.name || userToDelete.email}</strong>?
                    {dataCounts && (dataCounts.campaigns > 0 || dataCounts.notes > 0) && (
                      <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                          ⚠️ This user has associated data:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {dataCounts.campaigns > 0 && (
                            <li>• {dataCounts.campaigns} campaign{dataCounts.campaigns !== 1 ? 's' : ''}</li>
                          )}
                          {dataCounts.notes > 0 && (
                            <li>• {dataCounts.notes} note{dataCounts.notes !== 1 ? 's' : ''}</li>
                          )}
                        </ul>
                        <p className="text-sm font-medium mt-2">
                          Please select a user to reassign this data to:
                        </p>
                      </div>
                    )}
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {dataCounts && (dataCounts.campaigns > 0 || dataCounts.notes > 0) && (
              <div className="py-4">
                <Label htmlFor="reassignTo">Reassign data to:</Label>
                <select
                  id="reassignTo"
                  value={reassignToUserId}
                  onChange={(e) => setReassignToUserId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
                  required
                >
                  <option value="">Select a user...</option>
                  {users
                    .filter(u => u.id !== userToDelete?.id)
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name || u.email} ({u.role})
                      </option>
                    ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  All campaigns and notes will be transferred to the selected user.
                </p>
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                disabled={deleting || (dataCounts !== null && (dataCounts.campaigns > 0 || dataCounts.notes > 0) && !reassignToUserId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete User'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new HR user account. They will be able to create campaigns and view their own reports.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium mb-2 block">
                  Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
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
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="text-sm font-medium mb-2 block">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={6}
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

