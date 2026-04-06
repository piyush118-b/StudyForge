import { Skeleton } from '@/components/ui/forge-skeleton'

export default function TasksLoading() {
  return (
    <div className="flex gap-4 overflow-x-auto px-6 py-6">
      {Array.from({ length: 3 }).map((_, ci) => (
        <div key={ci} className="flex-shrink-0 w-80">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-8 rounded" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, ti) => (
              <div key={ti} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-14 rounded" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
