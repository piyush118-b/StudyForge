'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Calendar, CheckSquare, BarChart3,
  Camera, Trophy, Settings, Plus, Search, Zap,
} from 'lucide-react'

const commands = [
  { id: 'dashboard',    label: "Today's Plan",      icon: LayoutDashboard, href: '/dashboard'             },
  { id: 'timetables',  label: 'My Timetables',      icon: Calendar,        href: '/dashboard/timetables'  },
  { id: 'tasks',       label: 'Task Board',          icon: CheckSquare,     href: '/dashboard/tasks'       },
  { id: 'analytics',   label: 'Analytics',           icon: BarChart3,       href: '/dashboard/analytics'   },
  { id: 'scanner',     label: 'OCR Scanner',         icon: Camera,          href: '/dashboard/scanner'     },
  { id: 'achievements',label: 'Achievements',        icon: Trophy,          href: '/dashboard/achievements'},
  { id: 'settings',    label: 'Settings',            icon: Settings,        href: '/dashboard/settings'    },
  { id: 'create',      label: 'New Timetable',       icon: Plus,            href: '/create'                },
  { id: 'pricing',     label: 'Upgrade to Pro',      icon: Zap,             href: '/pricing'               },
]

export function CommandPalette() {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const [selected, setSelected] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  )

  // Open on Cmd+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const modKey = isMac ? e.metaKey : e.ctrlKey
      if (modKey && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
        setQuery('')
        setSelected(0)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    
    function onCustomOpen() {
      setOpen(true)
      setQuery('')
      setSelected(0)
    }
    window.addEventListener('open-command-palette', onCustomOpen)

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('open-command-palette', onCustomOpen)
    }
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  // Arrow key navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected(s => Math.min(s + 1, filtered.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected(s => Math.max(s - 1, 0))
      }
      if (e.key === 'Enter' && filtered[selected]) {
        router.push(filtered[selected].href)
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, filtered, selected, router])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.96, y: -8  }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="
              fixed top-[20%] left-1/2 -translate-x-1/2 z-[100]
              w-full max-w-md
              bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl
              shadow-[0_24px_80px_rgba(0,0,0,0.7)]
              overflow-hidden
            "
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3
                            border-b border-[#2A2A2A]">
              <Search className="w-4 h-4 text-[#606060] flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setSelected(0) }}
                placeholder="Search pages or actions..."
                className="
                  flex-1 bg-transparent border-0 outline-none
                  text-sm text-[#F0F0F0] placeholder:text-[#606060]
                "
              />
              <kbd className="text-[10px] font-mono text-[#3A3A3A]
                              px-1.5 py-0.5 rounded border border-[#2A2A2A]">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="py-2 max-h-72 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[#606060]">
                  No results for &quot;{query}&quot;
                </div>
              ) : (
                filtered.map((cmd, i) => (
                  <button
                    key={cmd.id}
                    onClick={() => { router.push(cmd.href); setOpen(false) }}
                    onMouseEnter={() => setSelected(i)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5
                      text-sm transition-all duration-75 text-left active:scale-[0.97]
                      ${selected === i
                        ? 'bg-[#222222] text-[#F0F0F0]'
                        : 'text-[#A0A0A0] hover:bg-[#1F1F1F]'
                      }
                    `}
                  >
                    <div className={`
                      w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                      ${selected === i ? 'bg-[#10B981]/15' : 'bg-[#222222]'}
                    `}>
                      <cmd.icon className={`w-3.5 h-3.5
                        ${selected === i ? 'text-[#10B981]' : 'text-[#606060]'}`} />
                    </div>
                    {cmd.label}
                    {selected === i && (
                      <kbd className="ml-auto text-[10px] font-mono text-[#606060]
                                      px-1.5 py-0.5 rounded border border-[#2A2A2A]">
                        ↵
                      </kbd>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2.5 border-t border-[#1F1F1F]
                            flex items-center gap-3 text-[10px] text-[#3A3A3A]">
              <span><kbd className="font-mono">↑↓</kbd> navigate</span>
              <span><kbd className="font-mono">↵</kbd> open</span>
              <span><kbd className="font-mono">esc</kbd> close</span>
              <span className="ml-auto">⌘K to open</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
