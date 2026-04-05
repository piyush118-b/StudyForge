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
    <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F0F0F0]">My Timetables</h1>
          <p className="text-sm text-[#A0A0A0] mt-0.5">
            {timetables.length} timetable{timetables.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <a
          href="/create"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#10B981] text-[#0A0A0A] text-sm font-bold shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_16px_rgba(16,185,129,0.15)] hover:bg-[#34D399] transition-all duration-150 active:scale-[0.97]"
        >
          <Plus className="w-4 h-4" />
          New Timetable
        </a>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : timetables.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 lg:p-24 border border-dashed border-[#2A2A2A] rounded-xl bg-[#1A1A1A]/30">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-xl font-semibold tracking-tight text-[#F0F0F0]">No timetables yet!</h2>
          <p className="text-[#A0A0A0] mt-2 max-w-sm mb-6 text-sm">
            Create your first timetable to start tracking your study progress and visualize your classes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/create/ai')}
              className="h-10 px-6 rounded-lg bg-[#10B981] text-[#0A0A0A] text-sm font-bold shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_16px_rgba(16,185,129,0.15)] hover:bg-[#34D399] transition-all"
            >
              Create with AI ✨
            </button>
            <button
              onClick={() => router.push('/create')}
              className="h-10 px-6 rounded-lg border border-[#2A2A2A] bg-transparent text-sm font-medium text-[#A0A0A0] hover:bg-[#222222] hover:text-[#F0F0F0] hover:border-[#333333] transition-all"
            >
              Build Manually
            </button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-[#1A1A1A] border border-[#2A2A2A] p-1 rounded-lg">
            <TabsTrigger value="all" className="text-[#A0A0A0] data-[state=active]:bg-[#222222] data-[state=active]:text-[#F0F0F0] rounded-md text-sm">All ({timetables.length})</TabsTrigger>
            <TabsTrigger value="active" className="text-[#A0A0A0] data-[state=active]:bg-[#222222] data-[state=active]:text-[#F0F0F0] rounded-md text-sm">Active ({activeTimetables.length})</TabsTrigger>
            <TabsTrigger value="archived" className="text-[#A0A0A0] data-[state=active]:bg-[#222222] data-[state=active]:text-[#F0F0F0] rounded-md text-sm">Archived</TabsTrigger>
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
                <p className="text-[#606060] col-span-3 text-sm">No active timetable. Set one to active to see it here.</p>
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
                <p className="text-[#606060] col-span-3 text-sm">No archived timetables.</p>
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
              <span className="text-emerald-400 text-xs mt-1 block font-medium">
                Don't worry — your recorded study history and all analytics will stay safe.
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

