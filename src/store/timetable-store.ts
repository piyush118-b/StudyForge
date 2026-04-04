import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { toast } from 'sonner'

export type TimetableRecord = {
  id: string
  title: string
  colorTag?: string | null
  isActive: boolean
  updatedAt: string
}

interface TimetableStore {
  allTimetables: TimetableRecord[]
  currentTimetable: any | null // Generic data payload for editor
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  isDashboardMode: boolean
  
  setDashboardMode: (val: boolean) => void
  setCurrentTimetable: (t: any | null) => void
  loadAllTimetables: (userId?: string) => Promise<void>
  switchActiveTimetable: (newTimetableId: string, userId?: string) => Promise<void>
}

export const useTimetableStore = create<TimetableStore>((set, get) => ({
  allTimetables: [],
  currentTimetable: null,
  saveStatus: 'idle',
  isDashboardMode: true,

  setDashboardMode: (val) => set({ isDashboardMode: val }),
  
  setCurrentTimetable: (t) => set({ currentTimetable: t }),

  loadAllTimetables: async (userId) => {
    try {
      if (userId) {
        const { data, error } = await supabase
          .from('timetables')
          .select('id, title, color_tag, is_active, updated_at')
          .order('updated_at', { ascending: false })

        if (error) throw error
        
        if (data) {
          const rows = data as any[]
          set({
            allTimetables: rows.map(t => ({
              id: t.id,
              title: t.title,
              colorTag: t.color_tag,
              isActive: t.is_active,
              updatedAt: t.updated_at
            }))
          })
        }
      } else {
        // Guest mode fallback
        const stored = localStorage.getItem('sf_guest_timetables')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            set({ allTimetables: parsed })
          } catch (e) {
            console.error('Failed to parse guest timetables', e)
          }
        }
      }
    } catch (e) {
      console.error('Failed to load timetables', e)
    }
  },

  switchActiveTimetable: async (newId, userId) => {
    const { allTimetables, currentTimetable } = get()
    
    // Optimistically update UI
    set(state => ({
      allTimetables: state.allTimetables.map(t => ({
        ...t,
        isActive: t.id === newId
      }))
    }))
    
    // Attempt backend sync
    if (userId) {
      // Find currently active to deactivate (optional but cleaner)
      const currentActive = allTimetables.find(t => t.isActive)
      if (currentActive?.id && currentActive.id !== newId) {
        await (supabase as any)
          .from('timetables')
          .update({ is_active: false })
          .eq('id', currentActive.id)
      }
      
      // Activate new
      const { error } = await (supabase as any)
        .from('timetables')
        .update({ is_active: true, activated_at: new Date().toISOString() })
        .eq('id', newId)
        
      if (error) {
        toast.error('Failed to switch timetable')
        return
      }
    } else {
      // Guest mode
      const updated = get().allTimetables
      localStorage.setItem('sf_guest_timetables', JSON.stringify(updated))
    }
    
    // Load full data for currentTimetable context
    if (userId) {
      const { data } = await supabase.from('timetables').select('*').eq('id', newId).single()
      if (data) {
        set({ currentTimetable: data })
      }
    } else {
      // Re-hydrate full guest data (requires reading full guest drafts if implemented)
      // Usually full draft array is in a separate storage key
      const storedFull = localStorage.getItem('sf_guest_drafts')
      if (storedFull) {
         try {
           const drafts = JSON.parse(storedFull)
           const target = drafts.find((d: any) => d.id === newId)
           if (target) set({ currentTimetable: target })
         } catch(e) {}
      }
    }
    
    toast.success('Active timetable switched!')
  }
}))
