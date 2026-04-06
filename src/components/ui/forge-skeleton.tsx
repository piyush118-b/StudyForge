import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

// Base skeleton — use this everywhere
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg',
        'bg-gradient-to-r from-[#1A1A1A] via-[#252525] to-[#1A1A1A]',
        'bg-[length:200%_100%]',
        'animate-[forge-shimmer_2s_linear_infinite]',
        className
      )}
    />
  )
}

// Pre-built skeletons for common patterns:

export function SkeletonText({ width = 'w-full' }: { width?: string }) {
  return <Skeleton className={`h-4 ${width}`} />
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn(
      'bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 space-y-3',
      className
    )}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  )
}

export function SkeletonBlock() {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-16 rounded" />
      </div>
    </div>
  )
}

export function SkeletonTimetableCard() {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="grid grid-cols-7 gap-0.5 h-14">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="space-y-0.5">
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-3/4" />
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  )
}

export function SkeletonTaskCard() {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-14 rounded" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex justify-between pt-2 border-t border-[#2A2A2A]">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-8" />
      </div>
    </div>
  )
}

export function SkeletonNavItem() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Skeleton className="w-4 h-4 rounded flex-shrink-0" />
      <Skeleton className="h-3 flex-1" />
    </div>
  )
}
