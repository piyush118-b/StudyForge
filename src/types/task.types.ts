// ============================================================
// Phase 3 – Task Types
// ============================================================

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 'High' | 'Medium' | 'Low'

export interface Task {
  id: string
  userId: string
  timetableId: string | null
  title: string
  description: string | null
  subject: string | null
  priority: TaskPriority
  status: TaskStatus
  dueDate: string | null       // 'YYYY-MM-DD'
  dueTime: string | null       // 'HH:MM'
  estimatedHours: number | null
  actualHours: number
  tags: string[]
  linkedBlockId: string | null
  notes: string | null
  completionPercentage: number
  isRecurring: boolean
  recurrenceRule: string | null
  reminderMinutes: number
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export interface TaskFormData {
  title: string
  description?: string
  subject?: string
  priority: TaskPriority
  dueDate?: string
  dueTime?: string
  estimatedHours?: number
  tags?: string[]
  notes?: string
  reminderMinutes?: number
}

export interface TaskGroup {
  label: string
  tasks: Task[]
  color: string
}

export interface GuestTaskStore {
  tasks: Task[]
  lastUpdated: string
}
