"use client"

import { useEffect, useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TimetableCard } from '@/components/timetable/TimetableCard'

export default function MyTimetablesPage() {
  const [timetables, setTimetables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchTimetables()
  }, [])

  const fetchTimetables = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/timetables')
      if (res.ok) {
        const data = await res.json()
        setTimetables(data || [])
      } else if (res.status === 401) {
         // Fallback to local storage for guest
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

  const handleSetActive = async (id: string, name: string) => {
     // Check if there is already an active timetable
     const currentActive = timetables.find(t => t.is_active)
     
     if (currentActive && currentActive.id !== id) {
        if (!confirm(`Switch active timetable?\n'${currentActive.title}' will be deactivated.\n'${name}' will become your active timetable.`)) {
           return
        }
     }

     try {
       // Check if guest
       if (localStorage.getItem('sf_guest_timetables')) {
           const guestData = JSON.parse(localStorage.getItem('sf_guest_timetables') || '[]')
           const updated = guestData.map((t: any) => ({
              ...t,
              is_active: t.id === id
           }))
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

       if (!res.ok) throw new Error('Failed to set active')
       
       toast.success(`✅ '${name}' is now your active timetable!`)
       fetchTimetables()
       
     } catch (err) {
        toast.error('Failed to set active')
     }
  }

  const handleDelete = async (id: string) => {
     if (!confirm("Are you sure you want to delete this timetable?")) return

     try {
        if (localStorage.getItem('sf_guest_timetables')) {
           const guestData = JSON.parse(localStorage.getItem('sf_guest_timetables') || '[]')
           const updated = guestData.filter((t: any) => t.id !== id)
           localStorage.setItem('sf_guest_timetables', JSON.stringify(updated))
           setTimetables(updated)
           toast.success('Deleted successfully.')
           return
        }

        const res = await fetch(`/api/timetables/${id}`, {
           method: 'DELETE'
        })

        if (!res.ok) throw new Error('Failed to delete')

        toast.success('Deleted successfully.')
        setTimetables(t => t.filter(x => x.id !== id))
     } catch(err) {
        toast.error('Failed to delete timetable.')
     }
  }

  const activeTimetables = timetables.filter(t => t.is_active)
  
  // Archiving logic: For now we'll just say not active
  const archivedTimetables = timetables.filter(t => !t.is_active)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Timetables</h1>
          <p className="text-muted-foreground mt-1">
            {timetables.length} timetables saved
          </p>
        </div>
        <Button onClick={() => router.push('/create/choose')}>
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
             <Button onClick={() => router.push('/create/ai')}>
               Create with AI ✨
             </Button>
             <Button variant="outline" onClick={() => router.push('/create')}>
               Build Manually
             </Button>
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
                 <TimetableCard 
                   key={t.id} 
                   timetable={t} 
                   onSetActive={handleSetActive}
                   onDelete={handleDelete}
                 />
               ))}
            </div>
          </TabsContent>
          
          <TabsContent value="active" className="mt-6 border-none p-0">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
               {activeTimetables.length === 0 ? (
                  <p className="text-muted-foreground">No active timetable. Set one to active to see it here.</p>
               ) : (
                  activeTimetables.map(t => (
                    <TimetableCard 
                      key={t.id} 
                      timetable={t} 
                      onSetActive={handleSetActive}
                      onDelete={handleDelete}
                    />
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
                    <TimetableCard 
                      key={t.id} 
                      timetable={t} 
                      onSetActive={handleSetActive}
                      onDelete={handleDelete}
                    />
                  ))
               )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
