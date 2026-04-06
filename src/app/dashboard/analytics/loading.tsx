import { Skeleton } from '@/components/ui/forge-skeleton'

export default function AnalyticsLoading() {
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
        <Skeleton className="h-4 w-32 mb-6" />
        <div className="flex gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, j) => (
                <Skeleton key={j} className="w-3 h-3 rounded-[2px]" />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
          <Skeleton className="h-4 w-40 mb-6" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
          <Skeleton className="h-4 w-40 mb-6" />
          <Skeleton className="h-48 w-48 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  )
}
