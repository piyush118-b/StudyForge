"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { useTimetableStore } from '@/store/timetable-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

const COLOR_TAGS = [
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#8b5cf6', // violet
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#10b981', // emerald
  '#0ea5e9', // sky
  '#f97316', // orange
]

interface SaveTimetableModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  gridData: any
  onboardingData?: any
  isGuest?: boolean
}

export function SaveTimetableModal({ 
  isOpen, 
  onOpenChange, 
  gridData, 
  onboardingData,
  isGuest 
}: SaveTimetableModalProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  
  // Auto-suggest title based on branch/semester if available
  const defaultTitle = onboardingData?.branch && onboardingData?.semester
    ? `${onboardingData.branch} Semester ${onboardingData.semester} — ${new Date().getFullYear()}`
    : `My Timetable — ${new Date().getFullYear()}`

  const [title, setTitle] = useState(defaultTitle)
  const [selectedColor, setSelectedColor] = useState(COLOR_TAGS[0])
  const [makeActive, setMakeActive] = useState(true)
  const [semesterStart, setSemesterStart] = useState('')
  const [semesterEnd, setSemesterEnd] = useState('')

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a timetable name')
      return
    }

    setIsSaving(true)

    try {
      if (isGuest) {
         // Guest Mode -> localStorage
         const timetables = JSON.parse(localStorage.getItem('sf_guest_timetables') || '[]')
         
         if (makeActive) {
            // Deactivate others
            timetables.forEach((t: any) => t.is_active = false)
         }
         
         const newTimetable = {
           id: crypto.randomUUID(),
           title,
           color_tag: selectedColor,
           is_active: makeActive,
           semester_start: semesterStart || null,
           semester_end: semesterEnd || null,
           grid_data: gridData,
           onboarding_data: onboardingData,
           created_at: new Date().toISOString()
         }
         
         timetables.push(newTimetable)
         localStorage.setItem('sf_guest_timetables', JSON.stringify(timetables))
         
         const isFirst = timetables.length === 1;
         onSuccess(makeActive, isFirst)
      } else {
        // Auth Mode -> API POST
        const res = await fetch('/api/timetables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             title,
             colorTag: selectedColor,
             semesterStart,
             semesterEnd,
             isActive: makeActive,
             gridData,
             onboardingData
          })
        })
        
        if (!res.ok) {
           const errText = await res.text()
           throw new Error(`Failed to save timetable: ${res.status} ${errText}`)
        }
        
        const isFirst = useTimetableStore.getState().allTimetables.length === 0;
        onSuccess(makeActive, isFirst)
      }
    } catch (error) {
       toast.error('Error saving timetable')
       console.error(error)
       setIsSaving(false)
    }
  }

  const onSuccess = (isActive: boolean, isFirstTimetable: boolean) => {
    if (isFirstTimetable) {
      toast.success('🎉 Your first timetable is ready!', {
        description: 'Head to your dashboard to start tracking. You got this! 🚀',
        duration: 5000,
      })
    } else {
      toast.success('🎉 Timetable saved!')
    }

    if (isActive) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    }
    setIsSaving(false)
    onOpenChange(false)
    router.push('/dashboard/timetables')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl">💾 Save Your Timetable</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Timetable Name</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. CSE Semester 5"
              maxLength={60}
            />
          </div>

          <div className="space-y-2">
            <Label>Color Tag</Label>
            <div className="flex gap-2">
              {COLOR_TAGS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150-all ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">For quick visual identification in dashboard</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Semester Start (Optional)</Label>
              <Input 
                type="date" 
                value={semesterStart} 
                onChange={e => setSemesterStart(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Semester End (Optional)</Label>
              <Input 
                type="date" 
                value={semesterEnd} 
                onChange={e => setSemesterEnd(e.target.value)} 
              />
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between border">
            <div className="space-y-1 pr-6">
              <Label className="font-semibold text-base">Make Active Timetable?</Label>
              <p className="text-sm text-muted-foreground text-balance">
                Start tracking daily progress with this timetable today. Will deactivate existing active ones.
              </p>
            </div>
            <Switch 
              checked={makeActive} 
              onCheckedChange={setMakeActive} 
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving... ✨' : 'Save Timetable →'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
