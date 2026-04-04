"use client"

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Database } from '@/types/supabase'
import { 
  MoreHorizontal, 
  Pencil, 
  Copy, 
  Trash2, 
  Share, 
  Download,
  Star
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button, buttonVariants } from '@/components/ui/button'
import { useTrackingStore } from '@/store/tracking-store'
import { getLocalDateStr } from '@/lib/time-utils'
import type { DailySummary } from '@/types/tracking.types'

type Timetable = Database['public']['Tables']['timetables']['Row']

interface TimetableCardProps {
  timetable: Timetable
  onSetActive: (id: string, name: string) => void
  onDelete: (id: string) => void
}

export function TimetableCard({ timetable, onSetActive, onDelete }: TimetableCardProps) {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [stats, setStats] = useState<DailySummary | null>(null)
  
  useEffect(() => {
    setIsMounted(true)
    fetchTodayStats()
  }, [timetable.id])

  const fetchTodayStats = async () => {
    try {
      const date = getLocalDateStr()
      const res = await fetch(`/api/daily-summaries?timetableId=${timetable.id}&date=${date}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Error fetching card stats:', err)
    }
  }
  
  // Compute today's day (e.g. Monday)
  const todayDay = (() => {
    const d = new Date()
    return d.toLocaleDateString('en-US', { weekday: 'long' })
  })()
  
  // Calculate progress using stats if available, fallback to grid structure for total
  const todayTotal = stats?.totalBlocks ?? (() => {
    const gridData = timetable.grid_data as Record<string, any>
    if (gridData && typeof gridData === 'object' && !Array.isArray(gridData)) {
      const allGridBlocks = Object.values(gridData)
      return allGridBlocks.filter((b: any) => {
        const blockDay = b.day || (b.dayId ? b.dayId.replace('col_', '').charAt(0).toUpperCase() + b.dayId.replace('col_', '').slice(1) : null);
        return blockDay === todayDay;
      }).length
    }
    return 0
  })()

  const todayDoneCount = stats?.completedBlocks ?? 0
  const todayPartialCount = stats?.partialBlocks ?? 0
  
  // Weighted progress: partial counts as 0.5
  const weightedDone = todayDoneCount + todayPartialCount * 0.5
  const progressPercentage = todayTotal > 0 ? (weightedDone / todayTotal) : 0
  const hasActivity = todayDoneCount > 0 || todayPartialCount > 0

  return (
    <div className="bg-card w-full border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      
      {/* Preview / Color Banner */}
      <div 
        className="h-[120px] w-full relative flex flex-col justify-end p-4 border-b"
        style={{ 
          background: timetable.preview_image_url 
            ? `url(${timetable.preview_image_url}) center/cover` 
            : `linear-gradient(135deg, ${timetable.color_tag || '#6366f1'}88, ${timetable.color_tag || '#6366f1'}22)` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="relative z-10 flex justify-between items-end text-white">
          <div className="flex flex-col gap-1 drop-shadow-md">
            <h3 className="font-semibold text-lg leading-tight truncate max-w-[200px]" title={timetable.title}>
              {timetable.title}
            </h3>
            <p className="text-xs opacity-90">
              {isMounted ? `Updated ${formatDistanceToNow(new Date(timetable.updated_at), { addSuffix: true })}` : 'Updating...'}
            </p>
          </div>
          {timetable.is_active && (
            <span className="bg-green-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
              Active ✓
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        
        {/* Stats */}
        <div className="flex gap-2 text-xs text-muted-foreground">

          {isMounted && timetable.semester_start && timetable.semester_end && (
             <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
               📅 Sem ({new Date(timetable.semester_start).toLocaleDateString(undefined, {month: 'short', year: '2-digit'})} - {new Date(timetable.semester_end).toLocaleDateString(undefined, {month: 'short', year: '2-digit'})})
             </span>
          )}
        </div>

        {/* Progress Bar (Only active or those with activity) */}
        {(timetable.is_active || hasActivity) && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium">Today&apos;s Progress</span>
              <span className="text-muted-foreground">
                {hasActivity
                  ? `${todayDoneCount} done${todayPartialCount > 0 ? ` · ${todayPartialCount} partial` : ''} / ${todayTotal}`
                  : `0 / ${todayTotal} blocks`
                } ({Math.round(progressPercentage * 100)}%)
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full w-full relative rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-green-500 transition-all duration-500"
                  style={{ width: `${(todayDoneCount / Math.max(todayTotal, 1)) * 100}%` }}
                />
                <div
                  className="absolute inset-y-0 rounded-full bg-amber-400 transition-all duration-500"
                  style={{
                    left: `${(todayDoneCount / Math.max(todayTotal, 1)) * 100}%`,
                    width: `${(todayPartialCount * 0.5 / Math.max(todayTotal, 1)) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2">
          <Button 
            className="flex-1" 
            variant={timetable.is_active ? "secondary" : "default"}
            onClick={() => router.push(`/timetable/${timetable.id}`)}
          >
            Open Editor
          </Button>
          
          {!timetable.is_active && (
             <Button 
               variant="outline" 
               className="px-3"
               onClick={() => onSetActive(timetable.id, timetable.title)}
             >
               Set Active
             </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className={`${buttonVariants({ variant: "ghost", size: "icon" })} h-9 w-9 data-[state=open]:bg-muted`}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Pencil className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                {!timetable.is_active && (
                    <DropdownMenuItem onClick={() => onSetActive(timetable.id, timetable.title)}>
                      <Star className="mr-2 h-4 w-4" />
                      Set as Active
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:bg-red-50 focus:text-red-600"
                  onClick={() => onDelete(timetable.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </div>
  )
}
