interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We had trouble loading this. Please try again.',
  onRetry
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Error icon */}
      <div className="w-14 h-14 rounded-2xl bg-[rgba(239,68,68,0.08)]
                      border border-[#EF4444]/20
                      flex items-center justify-center mb-4 text-2xl">
        ⚠️
      </div>

      <h3 className="text-base font-semibold text-[#F0F0F0] mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-[#A0A0A0] max-w-sm leading-relaxed mb-6">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="h-9 px-5 rounded-lg border border-[#2A2A2A]
                     bg-transparent text-sm font-medium text-[#A0A0A0]
                     hover:bg-[#1A1A1A] hover:text-[#F0F0F0] hover:border-[#333333]
                     transition-all duration-150-all duration-150 active:scale-[0.97]
                     flex items-center gap-2">
          Try Again
        </button>
      )}
    </div>
  )
}
