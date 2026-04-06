import { Skeleton } from '@/components/ui/forge-skeleton'

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 space-y-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 space-y-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-12" />
        </div>
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      {/* Block list */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
