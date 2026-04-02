"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface TimetableCardProps {
  timetable: any
  onSetActive: (id: string, name: string) => void
  onDelete: (id: string) => void
}

export function TimetableCard({ timetable, onSetActive, onDelete }: TimetableCardProps) {
  const router = useRouter()
  
  // Calculate today's progress if active
  // Based on mock data for now - could integrate with TrackingStore if we want it fully live
  const todayProgress = 0.6 // 60%
  const todayCompleted = 3
  const todayTotal = 5

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
              Updated {formatDistanceToNow(new Date(timetable.updated_at), { addSuffix: true })}
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
          <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
            📚 {timetable.total_blocks} blocks/wk
          </span>
          {timetable.semester_start && timetable.semester_end && (
             <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
               📅 Sem ({new Date(timetable.semester_start).toLocaleDateString(undefined, {month: 'short', year: '2-digit'})} - {new Date(timetable.semester_end).toLocaleDateString(undefined, {month: 'short', year: '2-digit'})})
             </span>
          )}
        </div>

        {/* Progress Bar (Only active) */}
        {timetable.is_active && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium">Today's Progress</span>
              <span className="text-muted-foreground">{todayCompleted}/{todayTotal} blocks done ({Math.round(todayProgress*100)}%)</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
               <div 
                 className={`h-full rounded-full ${todayProgress >= 0.7 ? 'bg-green-500' : todayProgress >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                 style={{ width: `${todayProgress * 100}%` }} 
               />
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
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 data-[state=open]:bg-muted">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </div>
  )
}
