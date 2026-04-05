export const tokens = {
  colors: {
    bg: {
      base:     '#0A0A0A',
      surface:  '#111111',
      elevated: '#1A1A1A',
      overlay:  '#222222',
      border:   '#2A2A2A',
      muted:    '#333333',
    },
    accent: {
      default: '#10B981',
      dim:     '#059669',
      bright:  '#34D399',
      glow:    'rgba(16, 185, 129, 0.12)',
      subtle:  'rgba(16, 185, 129, 0.06)',
    },
    text: {
      primary:   '#F0F0F0',
      secondary: '#A0A0A0',
      muted:     '#606060',
      disabled:  '#3A3A3A',
    },
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error:   '#EF4444',
      info:    '#3B82F6',
    },
  },

  animation: {
    fadeIn: {
      initial:    { opacity: 0, y: 8 },
      animate:    { opacity: 1, y: 0 },
      exit:       { opacity: 0, y: -4 },
      transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
    },
    slideRight: {
      initial:    { opacity: 0, x: -12 },
      animate:    { opacity: 1, x: 0 },
      exit:       { opacity: 0, x: 12 },
      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
    },
    scaleIn: {
      initial:    { opacity: 0, scale: 0.95 },
      animate:    { opacity: 1, scale: 1 },
      exit:       { opacity: 0, scale: 0.97 },
      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
    },
    stagger:     { animate: { transition: { staggerChildren: 0.06 } } },
    staggerItem: {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
    },
  },

  blockStatus: {
    completed: { color: '#10B981', bgColor: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  label: '✅ Done'    },
    partial:   { color: '#F59E0B', bgColor: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: '⚡ Partial' },
    skipped:   { color: '#EF4444', bgColor: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  label: '❌ Skipped'  },
    pending:   { color: '#606060', bgColor: 'rgba(96,96,96,0.08)',  border: 'rgba(96,96,96,0.2)',   label: 'Pending'    },
    current:   { color: '#3B82F6', bgColor: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.4)', label: '🔵 Now'     },
  },

  priority: {
    High:   { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)'  },
    Medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
    Low:    { color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
  },
} as const

export type BlockStatus = keyof typeof tokens.blockStatus
export type Priority    = keyof typeof tokens.priority
