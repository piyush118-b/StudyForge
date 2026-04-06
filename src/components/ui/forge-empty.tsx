interface EmptyStateProps {
  emoji:       string
  title:       string
  description: string
  action?: {
    label:   string
    href?:   string
    onClick?: () => void
  }
}

export function EmptyState({ emoji, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A]
                      flex items-center justify-center text-3xl mb-5 hover:-translate-y-0.5 hover:border-[#333333] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-200">
        {emoji}
      </div>
      <h3 className="text-base font-semibold text-[#F0F0F0] tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#A0A0A0] max-w-xs leading-relaxed mb-6">
        {description}
      </p>
      {action && (
        action.href ? (
          <a href={action.href}
             className="inline-flex items-center gap-2 h-10 px-5 rounded-xl
                        bg-[#10B981] text-[#0A0A0A] text-sm font-bold
                        shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_16px_rgba(16,185,129,0.15)]
                        hover:bg-[#34D399] transition-all duration-150-all duration-150 active:scale-[0.97]">
            {action.label}
          </a>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl
                       bg-[#10B981] text-[#0A0A0A] text-sm font-bold
                       shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_16px_rgba(16,185,129,0.15)]
                       hover:bg-[#34D399] transition-all duration-150-all duration-150 active:scale-[0.97]">
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
