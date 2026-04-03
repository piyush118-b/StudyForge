"use client"

import { useEffect, useState } from 'react'
import { Plus, Loader2, Trash2, Star, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TimetableCard } from '@/components/timetable/TimetableCard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

export default function MyTimetablesPage() {
  const [timetables, setTimetables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Dialog state
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; title: string }>({
    open: false, id: '', title: ''
  })
  const [activeDialog, setActiveDialog] = useState<{ open: boolean; id: string; name: string; currentName: string }>({
    open: false, id: '', name: '', currentName: ''
  })
  const [isActioning, setIsActioning] = useState(false)

  useEffect(() => {
    fetchTimetables()
    const onFocus = () => fetchTimetables()
    const onVisible = () => { if (document.visibilityState === 'visible') fetchTimetables() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const fetchTimetables = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/timetables')
      if (res.ok) {
        const data = await res.json()
        setTimetables(data || [])
      } else if (res.status === 401) {
        const guestData = JSON.parse(localStorage.getItem('sf_guest_timetables') || '[]')
        setTimetables(guestData)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load timetables')
    } finally {
      setLoading(false)
    }
  }

  // Called from TimetableCard — opens the dialog instead of native confirm
  const handleSetActive = (id: string, name: string) => {
    const currentActive = timetables.find(t => t.is_active)
    if (currentActive && currentActive.id !== id) {
      setActiveDialog({ open: true, id, name, currentName: currentActive.title })
    } else {
      // No conflict — just activate silently
      doSetActive(id, name)
    }
  }

  const doSetActive = async (id: string, name: string) => {
    setIsActioning(true)
    try {
      if (localStorage.getItem('sf_guest_timetables')) {
        const guestData = JSON.parse(localStorage.getItem('sf_guest_timetables') || '[]')
        const updated = guestData.map((t: any) => ({ ...t, is_active: t.id === id }))
        localStorage.setItem('sf_guest_timetables', JSON.stringify(updated))
        setTimetables(updated)
        toast.success(`✅ '${name}' is now your active timetable!`)
        return
      }

      const res = await fetch(`/api/timetables/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to set active')
      }

      toast.success(`✅ '${name}' is now your active timetable!`)
      fetchTimetables()
    } catch (err: any) {
      toast.error(`Failed to set active: ${err.message}`)
    } finally {
      setIsActioning(false)
      setActiveDialog({ open: false, id: '', name: '', currentName: '' })
    }
  }

  // Called from TimetableCard — opens the dialog instead of native confirm
  const handleDelete = (id: string) => {
    const timetable = timetables.find(t => t.id === id)
    setDeleteDialog({ open: true, id, title: timetable?.title || 'this timetable' })
  }

  const doDelete = async () => {
    setIsActioning(true)
    const { id } = deleteDialog
    try {
      if (localStorage.getItem('sf_guest_timetables')) {
        const guestData = JSON.parse(localStorage.getItem('sf_guest_timetables') || '[]')
        const updated = guestData.filter((t: any) => t.id !== id)
        localStorage.setItem('sf_guest_timetables', JSON.stringify(updated))
        setTimetables(updated)
        toast.success('Timetable deleted.')
        return
      }

      const res = await fetch(`/api/timetables/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete')

      toast.success('Timetable deleted.')
      setTimetables(t => t.filter(x => x.id !== id))
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`)
    } finally {
      setIsActioning(false)
      setDeleteDialog({ open: false, id: '', title: '' })
    }
  }

  const activeTimetables = timetables.filter(t => t.is_active)
  const archivedTimetables = timetables.filter(t => !t.is_active)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Timetables</h1>
          <p className="text-muted-foreground mt-1">
            {timetables.length} timetable{timetables.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <Button onClick={() => router.push('/create/timetable')}>
          <Plus className="mr-2 h-4 w-4" /> Create New
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : timetables.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 lg:p-24 border rounded-xl border-dashed bg-muted/20">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-2xl font-semibold tracking-tight">No timetables yet!</h2>
          <p className="text-muted-foreground mt-2 max-w-sm mb-6">
            Create your first timetable to start tracking your study progress and visualize your classes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => router.push('/create/ai')}>Create with AI ✨</Button>
            <Button variant="outline" onClick={() => router.push('/create')}>Build Manually</Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({timetables.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeTimetables.length})</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 border-none p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {timetables.map(t => (
                <TimetableCard key={t.id} timetable={t} onSetActive={handleSetActive} onDelete={handleDelete} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-6 border-none p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeTimetables.length === 0 ? (
                <p className="text-muted-foreground">No active timetable. Set one to active to see it here.</p>
              ) : (
                activeTimetables.map(t => (
                  <TimetableCard key={t.id} timetable={t} onSetActive={handleSetActive} onDelete={handleDelete} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="archived" className="mt-6 border-none p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {archivedTimetables.length === 0 ? (
                <p className="text-muted-foreground">No archived timetables.</p>
              ) : (
                archivedTimetables.map(t => (
                  <TimetableCard key={t.id} timetable={t} onSetActive={handleSetActive} onDelete={handleDelete} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !isActioning && setDeleteDialog(d => ({ ...d, open }))}>
        <DialogContent showCloseButton={!isActioning}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 shrink-0">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <DialogTitle className="text-base">Delete Timetable</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-foreground">&ldquo;{deleteDialog.title}&rdquo;</span>?
              <br />
              <span className="text-red-400 text-xs mt-1 block">
                This will also remove all related block logs and progress data. This action cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, id: '', title: '' })}
              disabled={isActioning}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={doDelete}
              disabled={isActioning}
              className="bg-red-600 hover:bg-red-700"
            >
              {isActioning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {isActioning ? 'Deleting...' : 'Yes, Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Set Active Confirmation Dialog ── */}
      <Dialog open={activeDialog.open} onOpenChange={(open) => !isActioning && setActiveDialog(d => ({ ...d, open }))}>
        <DialogContent showCloseButton={!isActioning}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/10 shrink-0">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <DialogTitle className="text-base">Switch Active Timetable</DialogTitle>
            </div>
            <DialogDescription>
              <span className="flex items-start gap-2 mt-1">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0 inline-block" />
                <span>
                  <span className="font-semibold text-foreground">&ldquo;{activeDialog.currentName}&rdquo;</span> will be
                  deactivated and <span className="font-semibold text-foreground">&ldquo;{activeDialog.name}&rdquo;</span> will become
                  your active timetable. Your tracking will switch to the new timetable.
                </span>
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActiveDialog({ open: false, id: '', name: '', currentName: '' })}
              disabled={isActioning}
            >
              Cancel
            </Button>
            <Button
              onClick={() => doSetActive(activeDialog.id, activeDialog.name)}
              disabled={isActioning}
            >
              {isActioning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Star className="mr-2 h-4 w-4" />}
              {isActioning ? 'Switching...' : 'Yes, Switch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

