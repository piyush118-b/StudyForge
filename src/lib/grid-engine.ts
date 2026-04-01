export interface DayColumn {
  id: string;                    // unique, e.g. 'col_monday'
  label: string;                 // 'Monday' | 'Tue' | 'Apr 1' | custom
  isCustom: boolean;
  isHidden: boolean;             // for collapsing weekend
  widthPx: number;               // default 160px, user-resizable
}

export interface TimeBlock {
  id: string;
  dayId: string;
  startTime: string;             // '09:30'
  endTime: string;               // '11:15'
  
  // Content
  subject: string;
  subjectType: 'Lecture' | 'Lab' | 'Tutorial' | 'Project' | 'Revision' | 'Break' | 'Meal' | 'Prayer' | 'Gym' | 'Buffer' | 'Other';
  color: string;                 // hex
  textColor: string;             // auto-computed
  priority: 'High' | 'Medium' | 'Low' | null;
  notes: string;
  sticker: string | null;        // emoji
  
  // Completion tracking
  status: 'pending' | 'completed' | 'skipped' | 'partial';
  completedAt: string | null;    // ISO timestamp
  skippedAt: string | null;
  skipReason: string | null;     // 'tired' | 'emergency' | 'other' | custom
  partialHours: number | null;   // if partial, how many hrs actually done
  
  // Metadata
  isFixed: boolean;              // sleep, meals etc — harder to move
  isRecurring: boolean;          // part of the weekly template
  createdAt: string;
  updatedAt: string;
}

export interface GridState {
  id: string;                    // timetable id
  
  // Continuous Time Model bounds
  gridStartTime: string;         // '07:00'
  gridEndTime: string;           // '23:00'
  pxPerHour: number;             // e.g. 80px per hour
  
  dayColumns: DayColumn[];       // ordered array (left to right)
  blocks: Record<string, TimeBlock>;  // blockId -> TimeBlock
  
  // Canvas view state
  zoom: number;                  // 0.3 to 2.0, default 1.0
  panX: number;                  // pixels
  panY: number;                  // pixels
  
  // History for undo/redo
  past: Omit<GridState, 'past' | 'future'>[];
  future: Omit<GridState, 'past' | 'future'>[];
  
  // Dirty flag
  isDirty: boolean;
  lastSavedAt: string | null;
}
