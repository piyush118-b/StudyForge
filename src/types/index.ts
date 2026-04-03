// REFACTOR: Unified types to consolidate grid-store, tracking-store, and API boundaries.

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type BlockStatus = 'pending' | 'completed' | 'partial' | 'skipped';
export type BlockPriority = 'high' | 'medium' | 'low' | 'High' | 'Medium' | 'Low' | null;
export type SubjectType = 'Lecture' | 'Lab' | 'Tutorial' | 'Project' | 'Revision' | 'Break' | 'Meal' | 'Prayer' | 'Gym' | 'Buffer' | 'Other';

export interface UnifiedBlock {
  id: string;
  subject: string;
  day: DayOfWeek;
  startTime: string; // 'HH:MM'
  endTime: string;   // 'HH:MM'
  color: string;
  tags: string[];
  timetableId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingBlock extends UnifiedBlock {
  status: BlockStatus;
  trackedAt?: string;
  notes?: string;
}

// GridBlock: the canonical block stored in the grid editor.
// Extends UnifiedBlock with optional UI-rich editor fields.
export interface GridBlock extends UnifiedBlock {
  // Editor-specific optional fields
  subjectType?: SubjectType | string;
  notes?: string | null;
  priority?: BlockPriority;
  sticker?: string | null;
  textColor?: string | null;
  isFixed?: boolean;
  isPlaceholder?: boolean;
  isDragging?: boolean;
  // Local-only tracking
  status?: BlockStatus;
  completedAt?: string | null;
  skippedAt?: string | null;
  skipReason?: string | null;
  partialHours?: number | null;
}

// TimeBlock: backward-compat alias for the grid editor components that haven't
// been migrated to GridBlock yet. Identical in shape to GridBlock.
export type TimeBlock = GridBlock;
