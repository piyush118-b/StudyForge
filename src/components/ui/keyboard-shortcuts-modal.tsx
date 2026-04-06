'use client'
import { useState, useEffect } from 'react'
import { Keyboard } from 'lucide-react'

const shortcuts = [
  { keys: ['⌘', '1'], label: "Today's Plan"    },
  { keys: ['⌘', '2'], label: 'My Timetables'    },
  { keys: ['⌘', '3'], label: 'Task Board'       },
  { keys: ['⌘', '4'], label: 'Analytics'        },
  { keys: ['⌘', 'N'], label: 'New Timetable'    },
  { keys: ['⌘', ','], label: 'Settings'         },
  { keys: ['?'],       label: 'Show shortcuts'   },
]

export function KeyboardShortcutsModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if (e.key === '?') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/70 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6
                   shadow-[0_20px_60px_rgba(0,0,0,0.6)]
                   w-full max-w-sm
                   animate-[forge-scale-in_0.2s_ease-out_forwards]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <Keyboard className="w-4 h-4 text-[#10B981]" />
          <h3 className="text-sm font-semibold text-[#F0F0F0]">
            Keyboard Shortcuts
          </h3>
          <span className="ml-auto text-xs text-[#606060]">Press ? to toggle</span>
        </div>

        {/* Shortcuts list */}
        <div className="space-y-2">
          {shortcuts.map(({ keys, label }) => (
            <div key={label}
                 className="flex items-center justify-between py-2
                            border-b border-[#1F1F1F] last:border-0">
              <span className="text-sm text-[#A0A0A0]">{label}</span>
              <div className="flex items-center gap-1">
                {keys.map(key => (
                  <kbd key={key}
                       className="px-2 py-0.5 rounded-md text-xs font-mono
                                  bg-[#222222] border border-[#333333]
                                  text-[#F0F0F0]">
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
