'use client'

import { Bell, BellOff, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useBlockReminder } from '@/hooks/useBlockReminder'

interface Props {
  onGranted?: () => void
  onDismissed?: () => void
  compact?: boolean
}

export function ReminderPermissionCard({ 
  onGranted, 
  onDismissed,
  compact = false 
}: Props) {
  const { requestPermission, permission } = useBlockReminder({ blocks: [] })
  
  if (permission === 'granted' || permission === 'denied') return null
  
  const handleEnable = async () => {
    await requestPermission()
    onGranted?.()
  }
  
  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl
        bg-indigo-500/10 border border-indigo-500/20">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-indigo-400" />
          <span className="text-[13px] text-white/70">
            Enable browser notifications
          </span>
        </div>
        <button
          onClick={handleEnable}
          className="text-[12px] font-medium text-indigo-400 
            hover:text-indigo-300 transition-colors"
        >
          Enable →
        </button>
      </div>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl p-5
        bg-gradient-to-br from-indigo-950/60 to-slate-950/80
        border border-indigo-500/25 backdrop-blur-xl
        shadow-xl shadow-indigo-500/10"
    >
      <div className="absolute inset-0 bg-gradient-to-br 
        from-indigo-600/5 to-transparent pointer-events-none" />
      
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 
          border border-indigo-500/25 flex items-center justify-center mb-3">
          <Bell size={18} className="text-indigo-400" />
        </div>
        
        <h3 className="text-[15px] font-semibold text-white mb-1">
          Never miss a study block
        </h3>
        <p className="text-[13px] text-white/50 leading-relaxed mb-4">
          Get notified 5 minutes before each session. 
          We'll remind you before DSA, DBMS, Networks — so you always start on time.
        </p>
        
        <div className="space-y-1.5 mb-4">
          {[
            '5-minute advance reminders for every block',
            'Motivational messages, not boring alerts',
            'Works even when app is in background'
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Sparkles size={11} className="text-indigo-400 flex-shrink-0" />
              <span className="text-[12px] text-white/50">{item}</span>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleEnable}
            className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400
              text-white text-[13px] font-semibold transition-all duration-200
              hover:shadow-lg hover:shadow-indigo-500/30"
          >
            Enable Reminders
          </button>
          <button
            onClick={onDismissed}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10
              text-white/40 hover:text-white/60 text-[13px] transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </motion.div>
  )
}
