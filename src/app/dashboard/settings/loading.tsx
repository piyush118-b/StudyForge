import { Skeleton } from '@/components/ui/forge-skeleton'

export default function SettingsLoading() {
  return (
    <div className="max-w-4xl p-6 md:p-8 space-y-8 min-h-screen">
      <div>
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
            <div className="p-5 border-b border-[#2A2A2A]">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full max-w-sm" />
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-6 w-10 rounded-full" />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-[#2A2A2A]/50">
                <div>
                  <Skeleton className="h-4 w-40 mb-1" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
